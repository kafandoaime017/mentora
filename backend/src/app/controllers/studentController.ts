import { Request, Response, NextFunction } from 'express';
import AppDataSource from '../../config/data-source';
import { Session, SessionStatus } from '../models/Session';
import { SessionParticipant, ParticipantStatus } from '../models/SessionParticipant';
import { ReponseEtudiant } from '../models/ReponseEtudiant';
import { Question, QuestionType } from '../models/Question';
import { User } from '../models/User';
import { In } from 'typeorm';
import { getSocketIO } from '../../socket';
import { EtudiantProfil } from '../models/EtudiantProfil';
import { createNotification } from './notificationController'
import { NotificationType } from '../models/Notification'

// Définir le type pour les requêtes authentifiées
interface AuthRequest extends Request {
    user?: User;
}

const sessionRepo = AppDataSource.getRepository(Session);
const participantRepo = AppDataSource.getRepository(SessionParticipant);
const reponseRepo = AppDataSource.getRepository(ReponseEtudiant);
const questionRepo = AppDataSource.getRepository(Question);
const userRepo = AppDataSource.getRepository(User);
const etudiantProfilRepo = AppDataSource.getRepository(EtudiantProfil);

// ==================== UTILS ====================

const parseId = (id: string | string[] | undefined): number => {
    if (typeof id !== 'string') return 0;
    const parsed = parseInt(id);
    return isNaN(parsed) ? 0 : parsed;
};

const arraysEqual = (a: any[], b: any[]): boolean => {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((val, idx) => Number(val) === Number(b[idx]));
};

// Types auto-corrigés à la soumission (comparaison d'indices) vs types à
// correction manuelle (texte_libre/fichier), notés plus tard par le prof.
const isTypeAutoCorrige = (type: QuestionType): boolean =>
    type !== QuestionType.TEXTE_LIBRE && type !== QuestionType.FICHIER;

const computePointsForReponse = (r: ReponseEtudiant, q: Question): number => {
    if (!isTypeAutoCorrige(q.type)) {
        return r.corrige_manuellement ? (r.note_manuelle || 0) : 0;
    }
    return r.est_correcte ? q.points : 0;
};

const updateEtudiantScore = async (sessionId: number, etudiantId: number): Promise<void> => {
    const toutesReponses = await reponseRepo.find({
        where: { session_id: sessionId, etudiant_id: etudiantId }
    });
    const toutesQuestions = await questionRepo.find({ where: { session_id: sessionId } });

    let pointsObtenus = 0;
    for (const r of toutesReponses) {
        const q = toutesQuestions.find(q => q.id === r.question_id);
        if (q) {
            pointsObtenus += computePointsForReponse(r, q);
        }
    }

    await participantRepo.update(
        { session_id: sessionId, etudiant_id: etudiantId },
        { score: pointsObtenus }
    );
};



// ==================== RÉCUPÉRER UNE SESSION (ADAPTÉE AU STATUT) ====================

export const getSessionForStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        const etudiantId = req.user!.id;

        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        // Récupérer la session
        const session = await sessionRepo.findOne({
            where: { id: sessionId },
            relations: ['classe', 'filiere', 'professeur']
        });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        // Vérifier que l'étudiant a accès à cette session
        const etudiantProfil = await etudiantProfilRepo.findOne({
            where: { userId: etudiantId }
        });

        if (!etudiantProfil ||
            (etudiantProfil.classeId !== session.classe_id) ||
            (etudiantProfil.filiereId !== session.filiere_id)) {
            res.status(403).json({ success: false, message: 'Vous n\'avez pas accès à cette session' });
            return;
        }

        // Calculer le temps restant
        const maintenant = new Date();
        const dateFin = new Date(session.date_fin);
        const tempsRestantMs = dateFin.getTime() - maintenant.getTime();
        const tempsRestantSec = Math.max(0, Math.floor(tempsRestantMs / 1000));
        const estTerminee = tempsRestantMs <= 0;

        // Vérifier si la session est terminée (temps écoulé)
        if (session.status === SessionStatus.ACTIVE && estTerminee) {
            // Mettre à jour le statut de la session
            await sessionRepo.update(session.id, { status: SessionStatus.COMPLETED });

            res.status(403).json({
                success: false,
                message: ' Temps écoulé ! Cette session est maintenant terminée. Vous ne pouvez plus y participer.',
                sessionStatus: 'completed',
                code: 'SESSION_EXPIRED'
            });
            return;
        }

        // Vérifier si la session est déjà terminée
        if (session.status === SessionStatus.COMPLETED) {
            res.status(403).json({
                success: false,
                message: ' Cette session est déjà terminée. Vous ne pouvez plus y participer.',
                sessionStatus: 'completed',
                code: 'SESSION_COMPLETED'
            });
            return;
        }

        // Vérifier si l'étudiant a déjà rejoint
        const participant = await participantRepo.findOne({
            where: { session_id: sessionId, etudiant_id: etudiantId }
        });

        // Données de base de la session
        const sessionData: any = {
            id: session.id,
            titre: session.titre,
            description: session.description,
            theme: session.theme,
            date_debut: session.date_debut,
            date_fin: session.date_fin,
            duree: session.duree,
            status: session.status,
            a_rejoint: !!participant,
            code: session.code,
            professeur: session.professeur ? {
                id: session.professeur.id,
                nom: session.professeur.nom,
                prenom: session.professeur.prenom
            } : null
        };

        // Si la session est active, ajouter les questions et le temps restant
        if (session.status === SessionStatus.ACTIVE && !estTerminee) {
            // Récupérer les questions (sans les réponses correctes)
            const questions = await questionRepo.find({
                where: { session_id: sessionId },
                order: { ordre: 'ASC' }
            });

            sessionData.questions = questions.map(q => ({
                id: q.id,
                texte: q.texte,
                type: q.type,
                points: q.points,
                ordre: q.ordre,
                options: q.options
            }));

            sessionData.total_points = questions.reduce((sum, q) => sum + q.points, 0);
            sessionData.temps_restant = tempsRestantSec;

            // Si l'étudiant a déjà répondu à certaines questions
            if (participant) {
                const reponsesExistantes = await reponseRepo.find({
                    where: { session_id: sessionId, etudiant_id: etudiantId }
                });

                const reponsesMap: Record<number, number[]> = {};
                reponsesExistantes.forEach(r => {
                    reponsesMap[r.question_id] = r.reponse_ids;
                });
                sessionData.reponses_existantes = reponsesMap;
                sessionData.score_actuel = participant.score || 0;
            }
        } else if (session.status !== SessionStatus.ACTIVE) {
            // Session non active (pending, draft, etc.)
            let statusMessage = '';
            switch (session.status) {
                case SessionStatus.PENDING:
                    statusMessage = '⏰ Cette session n\'a pas encore commencé.';
                    break;
                case SessionStatus.DRAFT:
                    statusMessage = '📝 Cette session est en cours de préparation.';
                    break;
                case SessionStatus.CANCELLED:
                    statusMessage = '🚫 Cette session a été annulée.';
                    break;
                default:
                    statusMessage = '❌ Cette session n\'est pas disponible.';
            }

            res.status(403).json({
                success: false,
                message: statusMessage,
                sessionStatus: session.status
            });
            return;
        }

        res.json({ success: true, data: sessionData });
    } catch (err) {
        console.error('Erreur getSessionForStudent:', err);
        next(err);
    }
};

// ==================== SESSIONS DISPONIBLES (UNIQUEMENT PENDING) ====================

export const getAvailableSessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const etudiantId = req.user!.id;

        const etudiantProfil = await etudiantProfilRepo.findOne({
            where: { userId: etudiantId },
            relations: ['ecole', 'filiere', 'classe']
        });

        if (!etudiantProfil) {
            res.status(400).json({ success: false, message: 'Profil étudiant incomplet' });
            return;
        }

        // Récupérer d'abord les sessions ACTIVE
        const activeWhereCondition: any = {
            status: SessionStatus.ACTIVE
        };

        if (etudiantProfil.classeId !== null && etudiantProfil.classeId !== undefined) {
            activeWhereCondition.classe_id = etudiantProfil.classeId;
        }

        if (etudiantProfil.filiereId !== null && etudiantProfil.filiereId !== undefined) {
            activeWhereCondition.filiere_id = etudiantProfil.filiereId;
        }

        const activeSessions = await sessionRepo.find({
            where: activeWhereCondition,
            relations: ['classe', 'filiere', 'professeur'],
            order: { date_debut: 'ASC' }
        });

        // Récupérer ensuite les sessions PENDING
        const pendingWhereCondition: any = {
            status: SessionStatus.PENDING
        };

        if (etudiantProfil.classeId !== null && etudiantProfil.classeId !== undefined) {
            pendingWhereCondition.classe_id = etudiantProfil.classeId;
        }

        if (etudiantProfil.filiereId !== null && etudiantProfil.filiereId !== undefined) {
            pendingWhereCondition.filiere_id = etudiantProfil.filiereId;
        }

        const pendingSessions = await sessionRepo.find({
            where: pendingWhereCondition,
            relations: ['classe', 'filiere', 'professeur'],
            order: { date_debut: 'ASC' }
        });

        // Combiner les résultats : d'abord les ACTIVE, puis les PENDING
        const allSessions = [...activeSessions, ...pendingSessions];

        // Format simplifié pour la liste
        const formattedSessions = allSessions.map(session => ({
            id: session.id,
            titre: session.titre,
            theme: session.theme,
            date_debut: session.date_debut,
            duree: session.duree,
            status: session.status,
            code: session.code,
            professeur: session.professeur ? `${session.professeur.prenom} ${session.professeur.nom}` : null
        }));

        res.json({ success: true, data: formattedSessions });
    } catch (err) {
        next(err);
    }
};
// ==================== 2. VÉRIFIER CODE ====================

// ==================== 2. VÉRIFIER CODE ====================

export const verifySessionCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { code } = req.body;
        const etudiantId = req.user!.id;

        // 1. Vérifier le profil étudiant
        const etudiantProfil = await etudiantProfilRepo.findOne({
            where: { userId: etudiantId },
            relations: ['ecole', 'filiere', 'classe']
        });

        if (!etudiantProfil) {
            res.status(400).json({
                success: false,
                message: 'Profil étudiant incomplet. Veuillez compléter votre profil.'
            });
            return;
        }

        // 2. Vérifier si la session existe
        const session = await sessionRepo.findOne({
            where: { code },
            relations: ['classe', 'filiere']
        });

        if (!session) {
            res.status(404).json({
                success: false,
                message: ' Code invalide. Aucune session trouvée avec ce code.'
            });
            return;
        }

        // 3. Vérifier si la session est active ET si le temps n'est pas écoulé
        const maintenant = new Date();
        const dateFin = new Date(session.date_fin);
        const tempsRestant = dateFin.getTime() - maintenant.getTime();
        const estTerminee = tempsRestant <= 0;

        if (session.status !== SessionStatus.ACTIVE) {
            let statusMessage = '';
            switch (session.status) {
                case SessionStatus.PENDING:
                    statusMessage = 'Cette session n\'a pas encore commencé. Veuillez attendre l\'heure de début.';
                    break;
                case SessionStatus.COMPLETED:
                    statusMessage = 'Cette session est déjà terminée.';
                    break;
                case SessionStatus.CANCELLED:
                    statusMessage = 'Cette session a été annulée.';
                    break;
                case SessionStatus.DRAFT:
                    statusMessage = 'Cette session est encore en brouillon.';
                    break;
                default:
                    statusMessage = 'Cette session n\'est pas disponible.';
            }
            res.status(403).json({
                success: false,
                message: statusMessage,
                sessionStatus: session.status
            });
            return;
        }

        // 4. Vérifier si le temps est écoulé (session clôturée)
        if (estTerminee) {
            // Mettre à jour le statut de la session si nécessaire
            if (session.status === SessionStatus.ACTIVE) {
                await sessionRepo.update(session.id, { status: SessionStatus.COMPLETED });
            }
            res.status(403).json({
                success: false,
                message: 'Temps écoulé ! Cette session est maintenant terminée. Vous ne pouvez plus la rejoindre.',
                sessionStatus: 'completed'
            });
            return;
        }

        // 5. Vérifier la filière
        if (etudiantProfil.filiereId !== session.filiere_id) {
            res.status(403).json({
                success: false,
                message: `Vous n'êtes pas dans la bonne filière. Cette session est pour la filière: ${session.filiere?.nom}`
            });
            return;
        }

        // 6. Vérifier la classe
        if (etudiantProfil.classeId !== session.classe_id) {
            res.status(403).json({
                success: false,
                message: `Vous n'êtes pas dans la bonne classe. Cette session est pour la classe: ${session.classe?.nom}`
            });
            return;
        }

        // 7. Succès
        res.json({
            success: true,
            data: {
                sessionId: session.id,
                titre: session.titre,
                duree: session.duree,
                date_fin: session.date_fin,
                temps_restant: Math.floor(tempsRestant / 1000),
                professeur: `${session.professeur?.prenom} ${session.professeur?.nom}`
            }
        });
    } catch (err) {
        console.error('Erreur verifySessionCode:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur. Veuillez réessayer plus tard.'
        });
    }
};

// ==================== 3. VÉRIFIER QR CODE ====================

export const verifyQRCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { qrData } = req.body;
        const etudiantId = req.user!.id;

        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch {
            res.status(400).json({ success: false, message: 'QR code invalide' });
            return;
        }

        const { sessionId, code } = parsedData;

        const etudiantProfil = await etudiantProfilRepo.findOne({
            where: { userId: etudiantId },
            relations: ['ecole', 'filiere', 'classe']
        });

        if (!etudiantProfil) {
            res.status(400).json({ success: false, message: 'Profil étudiant incomplet' });
            return;
        }

       const session = await sessionRepo.findOne({
    where: { code },
    relations: {
        classe: true,
        filiere: true,
        professeur: true
    }
});

        if (!session) {
            res.status(404).json({ success: false, message: 'Session invalide' });
            return;
        }

        // Vérifier le temps restant
        const maintenant = new Date();
        const dateFin = new Date(session.date_fin);
        const tempsRestant = dateFin.getTime() - maintenant.getTime();
        const estTerminee = tempsRestant <= 0;

        if (session.status !== SessionStatus.ACTIVE) {
            let statusMessage = '';
            switch (session.status) {
                case SessionStatus.PENDING:
                    statusMessage = '⏰ Cette session n\'a pas encore commencé.';
                    break;
                case SessionStatus.COMPLETED:
                    statusMessage = '🏁 Cette session est déjà terminée.';
                    break;
                case SessionStatus.CANCELLED:
                    statusMessage = '🚫 Cette session a été annulée.';
                    break;
                default:
                    statusMessage = '❌ Cette session n\'est pas disponible.';
            }
            res.status(403).json({ success: false, message: statusMessage });
            return;
        }

        if (estTerminee) {
            if (session.status === SessionStatus.ACTIVE) {
                await sessionRepo.update(session.id, { status: SessionStatus.COMPLETED });
            }
            res.status(403).json({
                success: false,
                message: '⏰ Temps écoulé ! Cette session est maintenant terminée.'
            });
            return;
        }

        if (etudiantProfil.ecoleId !== session.filiere?.ecoleId) {
            res.status(403).json({ success: false, message: 'Vous n\'êtes pas dans la bonne école' });
            return;
        }

        if (etudiantProfil.filiereId !== session.filiere_id) {
            res.status(403).json({ success: false, message: 'Vous n\'êtes pas dans la bonne filière' });
            return;
        }

        if (etudiantProfil.classeId !== session.classe_id) {
            res.status(403).json({ success: false, message: 'Vous n\'êtes pas dans la bonne classe' });
            return;
        }

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                titre: session.titre,
                duree: session.duree,
                date_fin: session.date_fin,
                temps_restant: Math.floor(tempsRestant / 1000)
            }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 4. REJOINDRE UNE SESSION ====================

export const joinSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.body;
        const etudiantId = req.user!.id;

        const session = await sessionRepo.findOne({
            where: { id: sessionId, status: SessionStatus.ACTIVE }
        });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée ou déjà terminée' });
            return;
        }

        // Vérifier si le temps n'est pas écoulé
        const maintenant = new Date();
        const dateFin = new Date(session.date_fin);
        const tempsRestant = dateFin.getTime() - maintenant.getTime();

        if (tempsRestant <= 0) {
            await sessionRepo.update(session.id, { status: SessionStatus.COMPLETED });
            res.status(403).json({
                success: false,
                message: '⏰ Temps écoulé ! Vous ne pouvez plus rejoindre cette session.'
            });
            return;
        }

        let participant = await participantRepo.findOne({
            where: { session_id: sessionId, etudiant_id: etudiantId }
        });

        if (!participant) {
            participant = participantRepo.create({
                session_id: sessionId,
                etudiant_id: etudiantId,
                statut: ParticipantStatus.PRESENT,
                date_joined: new Date()
            });
            await participantRepo.save(participant);
        } else if (participant.statut === ParticipantStatus.TERMINE) {
            res.status(403).json({
                success: false,
                message: 'Vous avez déjà terminé cette session. Vos réponses ont été enregistrées.'
            });
            return;
        } else if (participant.statut !== ParticipantStatus.PRESENT) {
            participant.statut = ParticipantStatus.PRESENT;
            await participantRepo.save(participant);
        }

        res.json({
            success: true,
            message: 'Vous avez rejoint la session',
            data: {
                sessionId: session.id,
                temps_restant: Math.floor(tempsRestant / 1000)
            }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 5. RÉCUPÉRER UNE SESSION ====================

// export const getSessionForStudent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const sessionId = parseId(req.params.id);
//         if (!sessionId) {
//             res.status(400).json({ success: false, message: 'ID invalide' });
//             return;
//         }

//         const etudiantId = req.user!.id;

//         const session = await sessionRepo.findOne({
//             where: { id: sessionId },
//             relations: ['classe', 'filiere', 'professeur']
//         });

//         if (!session) {
//             res.status(404).json({ success: false, message: 'Session non trouvée' });
//             return;
//         }

//         const participant = await participantRepo.findOne({
//             where: { session_id: sessionId, etudiant_id: etudiantId }
//         });

//         res.json({
//             success: true,
//             data: {
//                 id: session.id,
//                 titre: session.titre,
//                 description: session.description,
//                 theme: session.theme,
//                 date_debut: session.date_debut,
//                 date_fin: session.date_fin,
//                 duree: session.duree,
//                 status: session.status,
//                 a_rejoint: !!participant,
//                 professeur: `${session.professeur?.prenom} ${session.professeur?.nom}`
//             }
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// ==================== 6. RÉCUPÉRER LES QUESTIONS ====================

export const getSessionQuestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const questions = await questionRepo.find({
            where: { session_id: sessionId },
            order: { ordre: 'ASC' }
        });

        const questionsSansReponses = questions.map(q => ({
            id: q.id,
            texte: q.texte,
            type: q.type,
            points: q.points,
            ordre: q.ordre,
            options: q.options
        }));

        res.json({
            success: true,
            data: {
                questions: questionsSansReponses,
                total_points: questions.reduce((sum, q) => sum + q.points, 0),
                nombre_questions: questions.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 7. SOUMETTRE UNE RÉPONSE ====================

export const submitSingleReponse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        const questionId = parseId(req.params.questionId);
        const etudiantId = req.user!.id;
        const { reponseIds, reponseTexte } = req.body;

        if (!sessionId || !questionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const question = await questionRepo.findOne({ where: { id: questionId } });
        if (!question) {
            res.status(404).json({ success: false, message: 'Question non trouvée' });
            return;
        }

        let reponseExistante = await reponseRepo.findOne({
            where: { session_id: sessionId, etudiant_id: etudiantId, question_id: questionId }
        });

        // Texte libre : réponse écrite, pas de correction automatique possible
        if (question.type === QuestionType.TEXTE_LIBRE) {
            if (reponseExistante) {
                reponseExistante.reponse_texte = reponseTexte ?? null;
                reponseExistante.submitted_at = new Date();
                await reponseRepo.save(reponseExistante);
            } else {
                await reponseRepo.save(reponseRepo.create({
                    session_id: sessionId,
                    etudiant_id: etudiantId,
                    question_id: questionId,
                    reponse_texte: reponseTexte ?? null,
                    est_correcte: false,
                    submitted_at: new Date()
                }));
            }
            res.json({ success: true, message: 'Réponse enregistrée (en attente de correction)', data: { est_correcte: null } });
            return;
        }

        // Fichier : géré par un endpoint multipart dédié, pas par cette route JSON
        if (question.type === QuestionType.FICHIER) {
            res.status(400).json({ success: false, message: 'Utilisez l\'upload de fichier pour ce type de question' });
            return;
        }

        const estCorrecte = arraysEqual(
            [...(reponseIds || [])].map(Number).sort((a: number, b: number) => a - b),
            [...(question.reponses_correctes || [])].map(Number).sort((a: number, b: number) => a - b)
        );

        if (reponseExistante) {
            reponseExistante.reponse_ids = reponseIds;
            reponseExistante.est_correcte = estCorrecte;
            reponseExistante.submitted_at = new Date();
            await reponseRepo.save(reponseExistante);
        } else {
            const nouvelleReponse = reponseRepo.create({
                session_id: sessionId,
                etudiant_id: etudiantId,
                question_id: questionId,
                reponse_ids: reponseIds,
                est_correcte: estCorrecte,
                submitted_at: new Date()
            });
            await reponseRepo.save(nouvelleReponse);
        }

        await updateEtudiantScore(sessionId, etudiantId);

        res.json({
            success: true,
            message: 'Réponse enregistrée',
            data: { est_correcte: estCorrecte }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 8. SOUMETTRE TOUTES LES RÉPONSES ====================

export const submitReponses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        const etudiantId = req.user!.id;
        const { reponses } = req.body;

        console.log(`📦 Soumission massive - Session: ${sessionId}, ${reponses?.length} réponses`);

        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        // 🔴 VÉRIFICATION 1: La session existe et est active
        const session = await sessionRepo.findOne({
            where: { id: sessionId, status: SessionStatus.ACTIVE }
        });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée ou terminée' });
            return;
        }

        // 🔴 VÉRIFICATION 2: L'étudiant a bien rejoint la session
        const participant = await participantRepo.findOne({
            where: { session_id: sessionId, etudiant_id: etudiantId }
        });

        if (!participant) {
            res.status(403).json({ success: false, message: 'Vous devez d\'abord rejoindre la session' });
            return;
        }

        // 🔴 VÉRIFICATION 3: L'étudiant n'a pas déjà terminé
        if (participant.statut === ParticipantStatus.TERMINE) {
            res.status(403).json({
                success: false,
                message: 'Vous avez déjà terminé cette session. Vous ne pouvez plus modifier vos réponses.'
            });
            return;
        }

        // 🔴 VÉRIFICATION 4: Le temps n'est pas écoulé
        const maintenant = new Date();
        const dateFin = new Date(session.date_fin);
        if (maintenant > dateFin) {
            await participantRepo.update(
                { session_id: sessionId, etudiant_id: etudiantId },
                {
                    statut: ParticipantStatus.TERMINE,
                    date_completed: new Date()
                }
            );
            res.status(403).json({
                success: false,
                message: ' Temps écoulé ! Session terminée automatiquement.'
            });
            return;
        }

        // Traiter chaque réponse
        for (const rep of reponses) {
            const question = await questionRepo.findOne({ where: { id: rep.questionId } });
            if (!question) continue;

            let reponseExistante = await reponseRepo.findOne({
                where: {
                    session_id: sessionId,
                    etudiant_id: etudiantId,
                    question_id: rep.questionId
                }
            });

            // Texte libre : pas de correction automatique, on stocke juste le texte
            if (question.type === QuestionType.TEXTE_LIBRE) {
                if (reponseExistante) {
                    reponseExistante.reponse_texte = rep.reponseTexte ?? null;
                    reponseExistante.submitted_at = new Date();
                    await reponseRepo.save(reponseExistante);
                } else {
                    await reponseRepo.save(reponseRepo.create({
                        session_id: sessionId,
                        etudiant_id: etudiantId,
                        question_id: rep.questionId,
                        reponse_texte: rep.reponseTexte ?? null,
                        est_correcte: false,
                        submitted_at: new Date()
                    }));
                }
                continue;
            }

            // Fichier : uploadé séparément via l'endpoint multipart dédié —
            // on ne touche pas à la réponse déjà enregistrée par cet upload
            if (question.type === QuestionType.FICHIER) {
                continue;
            }

            const estCorrecte = arraysEqual(
                [...(rep.reponseIds || [])].map(Number).sort((a: number, b: number) => a - b),
                [...(question.reponses_correctes || [])].map(Number).sort((a: number, b: number) => a - b)
            );

            if (reponseExistante) {
                reponseExistante.reponse_ids = rep.reponseIds;
                reponseExistante.est_correcte = estCorrecte;
                reponseExistante.submitted_at = new Date();
                await reponseRepo.save(reponseExistante);
            } else {
                const nouvelleReponse = reponseRepo.create({
                    session_id: sessionId,
                    etudiant_id: etudiantId,
                    question_id: rep.questionId,
                    reponse_ids: rep.reponseIds,
                    est_correcte: estCorrecte,
                    submitted_at: new Date()
                });
                await reponseRepo.save(nouvelleReponse);
            }
        }

        // Mettre à jour le score
        await updateEtudiantScore(sessionId, etudiantId);

        // MARQUER LA SESSION COMME TERMINÉE POUR L'ÉTUDIANT
        await participantRepo.update(
            { session_id: sessionId, etudiant_id: etudiantId },
            {
                statut: ParticipantStatus.TERMINE,
                date_completed: new Date()
            }
        );

        // ── Notifier le professeur en temps réel ──────────────────────────────
        const io = getSocketIO();
        if (io) {
            const [participantMaj, etudiant, questions] = await Promise.all([
                participantRepo.findOne({ where: { session_id: sessionId, etudiant_id: etudiantId } }),
                userRepo.findOne({ where: { id: etudiantId } }),
                questionRepo.find({ where: { session_id: sessionId } })
            ]);

            const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

            io.to(`session_${sessionId}`).emit('student-submitted', {
                sessionId,
                etudiant: {
                    id: etudiantId,
                    nom: etudiant?.nom,
                    prenom: etudiant?.prenom,
                    email: etudiant?.email
                },
                score: participantMaj?.score || 0,
                totalPoints,
                statut: ParticipantStatus.TERMINE,
                date_completed: new Date()
            });

            console.log(` Soumission notifiée à session_${sessionId}`);


            // ← AJOUTE ICI
            await createNotification(session.created_by, {
                titre: `${etudiant?.prenom} ${etudiant?.nom} a terminé`,
                message: `Score : ${participantMaj?.score || 0}/${totalPoints} pts`,
                type: NotificationType.STUDENT_SUBMITTED,
                link: `/teachers/qcm/${sessionId}`,
                sessionId
            })
        }

        res.json({
            success: true,
            message: 'Toutes vos réponses ont été enregistrées avec succès !'
        });
    } catch (err) {
        console.error('Erreur submitReponses:', err);
        next(err);
    }
};

// ==================== 8b. SOUMETTRE UNE RÉPONSE FICHIER ====================
// Question de type "fichier" : l'étudiant téléverse un document, noté plus
// tard manuellement par le professeur (jamais de correction automatique).

export const submitReponseFichier = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        const questionId = parseId(req.params.questionId);
        const etudiantId = req.user!.id;
        const file = (req as any).file;

        if (!sessionId || !questionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }
        if (!file) {
            res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
            return;
        }

        const question = await questionRepo.findOne({ where: { id: questionId } });
        if (!question || question.type !== QuestionType.FICHIER) {
            res.status(400).json({ success: false, message: "Cette question n'accepte pas de fichier" });
            return;
        }

        const cheminFichier = `/uploads/reponses/${file.filename}`;

        const reponseExistante = await reponseRepo.findOne({
            where: { session_id: sessionId, etudiant_id: etudiantId, question_id: questionId }
        });

        if (reponseExistante) {
            reponseExistante.reponse_fichier = cheminFichier;
            reponseExistante.submitted_at = new Date();
            await reponseRepo.save(reponseExistante);
        } else {
            await reponseRepo.save(reponseRepo.create({
                session_id: sessionId,
                etudiant_id: etudiantId,
                question_id: questionId,
                reponse_fichier: cheminFichier,
                est_correcte: false,
                submitted_at: new Date()
            }));
        }

        res.json({ success: true, message: 'Fichier envoyé (en attente de correction)', data: { reponse_fichier: cheminFichier } });
    } catch (err) {
        next(err);
    }
};

// ==================== 9. RÉSULTATS D'UNE SESSION ====================

export const getSessionResults = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId  = parseId(req.params.id)
        const etudiantId = req.user!.id

        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' })
            return
        }

        const session = await sessionRepo.findOne({
            where:     { id: sessionId },
            relations: ['filiere', 'classe']
        })
        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' })
            return
        }

        // ─── Vérifier si les résultats sont visibles ──────────────────────────
        if (!session.resultatsVisibles) {
            res.status(403).json({
                success: false,
                message: 'Les résultats ne sont pas encore disponibles.',
                code:    'RESULTS_HIDDEN'
            })
            return
        }

        const participant = await participantRepo.findOne({
            where: { session_id: sessionId, etudiant_id: etudiantId }
        })

        if (!participant) {
            res.status(404).json({ success: false, message: 'Vous n\'avez pas participé à cette session' })
            return
        }

        const questions = await questionRepo.find({
            where: { session_id: sessionId },
            order: { ordre: 'ASC' }
        })

        const reponses = await reponseRepo.find({
            where: { session_id: sessionId, etudiant_id: etudiantId }
        })

        // ─── Recalculer est_correcte depuis les vraies données ────────────────
        const detailsQuestions = questions.map(q => {
            const reponse = reponses.find(r => r.question_id === q.id)
            const manuel = !isTypeAutoCorrige(q.type)

            // Types texte_libre / fichier : jamais auto-corrigés, on affiche
            // l'état de correction manuelle plutôt qu'un est_correcte calculé
            if (manuel) {
                const enAttente = !!reponse && !reponse.corrige_manuellement
                const pointsObtenus = reponse?.corrige_manuellement ? (reponse.note_manuelle || 0) : 0

                return {
                    question_id:          q.id,
                    texte:                q.texte,
                    type:                 q.type,
                    points:               q.points,
                    points_obtenus:       pointsObtenus,
                    reponse_texte:        reponse?.reponse_texte || null,
                    reponse_fichier:      reponse?.reponse_fichier || null,
                    corrige_manuellement: reponse?.corrige_manuellement || false,
                    est_correcte:         reponse?.corrige_manuellement ? pointsObtenus > 0 : null,
                    a_repondu:            !!reponse && (!!reponse.reponse_texte || !!reponse.reponse_fichier),
                    en_attente_correction: enAttente
                }
            }

            const reponseDonnee:   number[] = reponse?.reponse_ids
                ? [...reponse.reponse_ids].map(Number).sort((a, b) => a - b)
                : []

            const reponsesCorrectes: number[] = q.reponses_correctes
                ? [...q.reponses_correctes].map(Number).sort((a, b) => a - b)
                : []

            // Comparaison stricte des tableaux triés
            const estCorrecte = reponseDonnee.length > 0
                && reponseDonnee.length === reponsesCorrectes.length
                && reponseDonnee.every((val, idx) => val === reponsesCorrectes[idx])

            const pointsObtenus = estCorrecte ? q.points : 0

            return {
                question_id:       q.id,
                texte:             q.texte,
                type:              q.type,
                points:            q.points,
                points_obtenus:    pointsObtenus,
                options:           q.options           || [],
                reponses_correctes: reponsesCorrectes,
                reponse_donnee:    reponse?.reponse_ids
                    ? [...reponse.reponse_ids].map(Number)
                    : [],
                est_correcte:      estCorrecte,
                a_repondu:         !!reponse && reponseDonnee.length > 0,
                en_attente_correction: false
            }
        })

        const totalPoints   = questions.reduce((sum, q) => sum + q.points, 0)
        const pointsObtenus = detailsQuestions.reduce((sum, q) => sum + q.points_obtenus, 0)
        const noteSur20     = totalPoints > 0 ? (pointsObtenus / totalPoints) * 20 : 0
        const pourcentage   = totalPoints > 0 ? (pointsObtenus / totalPoints) * 100 : 0

        const nbCorrectes   = detailsQuestions.filter(q => q.est_correcte).length
        const nbIncorrectes = detailsQuestions.filter(q => q.est_correcte === false && q.a_repondu).length
        const nbOmises      = detailsQuestions.filter(q => !q.a_repondu).length
        const correctionEnAttente = detailsQuestions.some(q => q.en_attente_correction)

        res.json({
            success: true,
            data: {
                session: {
                    id:         session.id,
                    titre:      session.titre,
                    theme:      session.theme,
                    date_debut: session.date_debut,
                    date_fin:   session.date_fin,
                    filiere:    session.filiere?.nom,
                    classe:     session.classe?.nom
                },
                participant: {
                    score:          pointsObtenus, // recalculé, plus fiable que participant.score
                    statut:         participant.statut,
                    date_completed: participant.date_completed
                },
                resultats: {
                    total_points:   totalPoints,
                    points_obtenus: pointsObtenus,
                    note_sur_20:    parseFloat(noteSur20.toFixed(2)),
                    pourcentage:    parseFloat(pourcentage.toFixed(1)),
                    nb_correctes:   nbCorrectes,
                    nb_incorrectes: nbIncorrectes,
                    nb_omises:      nbOmises,
                    total_questions: questions.length,
                    correction_en_attente: correctionEnAttente
                },
                details: detailsQuestions
            }
        })
    } catch (err) {
        next(err)
    }
}

// ==================== 10. HISTORIQUE ====================

export const getHistorique = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const etudiantId = req.user!.id;

        // Récupérer tous les participants
        const participants = await participantRepo.find({
            where: { etudiant_id: etudiantId },
            relations: ['session', 'session.classe', 'session.filiere'],
            order: { date_completed: 'DESC' }
        });

        console.log('Participants trouvés:', participants.length);

        // Ne pas filtrer sur le score > 0, juste vérifier que le participant existe
        const historique = await Promise.all(participants.map(async (p) => {
            const questions = await questionRepo.find({ where: { session_id: p.session.id } })
            const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

            return {
                id: p.id,
                session: {
                    id: p.session.id,
                    titre: p.session.titre,
                    theme: p.session.theme,
                    date_debut: p.session.date_debut,
                    date_fin: p.session.date_fin,
                    duree: p.session.duree,
                    total_points: totalPoints , // ← ajout
                    resultatsVisibles: p.session.resultatsVisibles  // ← AJOUTE

                },
                score: p.score || 0,
                date_completed: p.date_completed || p.date_joined,
                statut: p.statut
            }
        }))

        console.log('Historique généré:', historique.length);

        res.json({ success: true, data: historique });
    } catch (err) {
        console.error('Erreur getHistorique:', err);
        next(err);
    }
};


// Dans studentController.ts (backend Express)
export const getStudentProfil = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const etudiantId = req.user!.id;

        const etudiantProfil = await etudiantProfilRepo.findOne({
            where: { userId: etudiantId },
            relations: ['ecole', 'filiere', 'classe']
        });

        if (!etudiantProfil) {
            res.status(404).json({
                success: false,
                message: 'Profil étudiant non trouvé'
            });
            return;
        }

        res.json({
            success: true,
            data: {
                id: etudiantProfil.id,
                classeId: etudiantProfil.classeId,
                filiereId: etudiantProfil.filiereId,
                ecoleId: etudiantProfil.ecoleId,
                ecole: etudiantProfil.ecole?.nom,
                filiere: etudiantProfil.filiere?.nom,
                classe: etudiantProfil.classe?.nom,
                dateNaissance: etudiantProfil.dateNaissance
            }
        });
    } catch (err) {
        console.error('Erreur getStudentProfil:', err);
        next(err);
    }
};