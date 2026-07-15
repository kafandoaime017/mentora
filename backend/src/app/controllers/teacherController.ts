import { Request, Response, NextFunction } from 'express';
import AppDataSource from '../../config/data-source';
import { Session, SessionStatus } from '../models/Session';
import { Question, QuestionType } from '../models/Question';
import { SessionParticipant, ParticipantStatus } from '../models/SessionParticipant';
import { ReponseEtudiant } from '../models/ReponseEtudiant';
import { Classe } from '../models/Classe';
import { Filiere } from '../models/Filiere';
import { User } from '../models/User';
import QRCode from 'qrcode';
import { getSocketIO } from '../../socket';
import { createNotification } from './notificationController';
import { NotificationType } from '../models/Notification';
import { EtudiantProfil } from '../models/EtudiantProfil';
import { QuestionBanque, QuestionDifficulte } from '../models/QuestionBanque';
import { ProfesseurProfil } from '../models/ProfesseurProfil';
import { Ecole } from '../models/Ecole';
import {
    envoyerEmailSessionDemarree,
    envoyerEmailNouvelleSession,
    envoyerEmailNotesPubliees
} from '../services/emailService'
import { logAudit, getClientIp } from '../services/auditService'
import { LIMITES_PLANS } from '../middleware/checkPlan'




// Définir le type pour les requêtes authentifiées
interface AuthRequest extends Request {
    user?: User;
}

const sessionRepo = AppDataSource.getRepository(Session);
const questionRepo = AppDataSource.getRepository(Question);
const participantRepo = AppDataSource.getRepository(SessionParticipant);
const reponseRepo = AppDataSource.getRepository(ReponseEtudiant);
const classeRepo = AppDataSource.getRepository(Classe);
const filiereRepo = AppDataSource.getRepository(Filiere);
const userRepo = AppDataSource.getRepository(User);
const etudiantProfilRepo = AppDataSource.getRepository(EtudiantProfil);
const banqueRepo = AppDataSource.getRepository(QuestionBanque);
const professeurProfilRepo = AppDataSource.getRepository(ProfesseurProfil);
const ecoleRepo = AppDataSource.getRepository(Ecole);

// ─── Détection de triche basique : seuils (arbitraires, ajustables) ───────────
const SEUIL_CHANGEMENTS_ONGLET = 3;      // nb de fois où l'étudiant a quitté l'onglet/le plein écran
const SEUIL_TEMPS_REPONSE_MS   = 1500;   // en dessous, une réponse est jugée "trop rapide"
const SEUIL_NB_REPONSES_RAPIDES = 2;     // nb de réponses "trop rapides" avant suspicion

// Journalise une action professeur pour le log d'audit du directeur.
// Best-effort : l'ecoleId est résolu à la volée via le profil professeur.
const auditProf = async (req: AuthRequest, action: string, cibleType?: string, cibleId?: number, details?: any) => {
    const profil = await professeurProfilRepo.findOne({ where: { userId: req.user!.id } })
    logAudit({
        ecoleId: profil?.ecoleId ?? null,
        userId: req.user!.id,
        userNom: `${req.user!.prenom} ${req.user!.nom}`,
        userRole: req.user!.role,
        action, cibleType, cibleId, details,
        ip: getClientIp(req)
    })
}

interface QuestionInput {
    texte: string;
    type: QuestionType;
    points: number;
    options: any;
    reponses_correctes: number[];
    reponse_indicative?: string;
}

// ==================== UTILS ====================

const generateUniqueCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const parseId = (id: string | string[] | undefined): number => {
    if (typeof id !== 'string') return 0;
    const parsed = parseInt(id);
    return isNaN(parsed) ? 0 : parsed;
};

export const autoCloseSession = async (sessionId: number): Promise<void> => {
    const session = await sessionRepo.findOne({
        where: { id: sessionId },
        relations: ['classe', 'filiere']
    });
    if (session && session.status === SessionStatus.ACTIVE) {
        await sessionRepo.update(sessionId, { status: SessionStatus.COMPLETED });
        await calculateAndUpdateScores(sessionId);

        const io = getSocketIO();
        if (io) {
            const roomName = `classe_${session.classe_id}_filiere_${session.filiere_id}`;

            // Notifier le dashboard étudiant
            io.to(roomName).emit('session-completed', {
                sessionId: session.id,
                message: `La session "${session.titre}" est maintenant terminée.`
            })

            // ← Notifier les étudiants EN TRAIN de participer
            io.to(roomName).emit('session-force-ended', {
                sessionId: session.id,
                message: `La session "${session.titre}" a été terminée par le professeur.`
            })

            console.log(`📢 Session terminée notifiée à: ${roomName}`)
        }
    }
};

// Points obtenus pour UNE réponse : les types auto-corrigés (qcm/qcm_multiple/
// vrai_faux/appariement) se basent sur est_correcte ; les types à correction
// manuelle (texte_libre/fichier) ne comptent que si le professeur les a déjà
// corrigés (note_manuelle), sinon 0 en attendant la correction.
const computePointsForReponse = (r: ReponseEtudiant, q: Question): number => {
    if (q.type === QuestionType.TEXTE_LIBRE || q.type === QuestionType.FICHIER) {
        return r.corrige_manuellement ? (r.note_manuelle || 0) : 0;
    }
    return r.est_correcte ? q.points : 0;
};

// Vrai si la session contient encore des réponses texte_libre/fichier non
// corrigées par le professeur (utilisé pour bloquer la publication des notes).
const hasUngradedManualReponses = async (sessionId: number): Promise<boolean> => {
    const count = await reponseRepo
        .createQueryBuilder('r')
        .innerJoin('r.question', 'q')
        .where('r.session_id = :sessionId', { sessionId })
        .andWhere('q.type IN (:...types)', { types: [QuestionType.TEXTE_LIBRE, QuestionType.FICHIER] })
        .andWhere('r.corrige_manuellement = false')
        .getCount();
    return count > 0;
};

const recomputerScoreParticipant = async (sessionId: number, etudiantId: number): Promise<void> => {
    const reponses = await reponseRepo.find({ where: { session_id: sessionId, etudiant_id: etudiantId } });
    const questions = await questionRepo.find({ where: { session_id: sessionId } });

    const pointsObtenus = reponses.reduce((sum, r) => {
        const q = questions.find(q => q.id === r.question_id);
        return q ? sum + computePointsForReponse(r, q) : sum;
    }, 0);

    await participantRepo.update(
        { session_id: sessionId, etudiant_id: etudiantId },
        { score: pointsObtenus }
    );
};

const calculateAndUpdateScores = async (sessionId: number): Promise<void> => {
    const participants = await participantRepo.find({
        where: { session_id: sessionId, statut: ParticipantStatus.PRESENT }
    });

    const questions = await questionRepo.find({ where: { session_id: sessionId } });

    for (const participant of participants) {
        const reponses = await reponseRepo.find({
            where: { session_id: sessionId, etudiant_id: participant.etudiant_id }
        });

        // ✅ Points bruts, pas pourcentage
        const pointsObtenus = reponses.reduce((sum, r) => {
            const question = questions.find(q => q.id === r.question_id);
            return question ? sum + computePointsForReponse(r, question) : sum;
        }, 0);

        participant.score = pointsObtenus; // ← points bruts
        participant.statut = ParticipantStatus.TERMINE;
        participant.date_completed = new Date();
        await participantRepo.save(participant);
    }
};

// ==================== 1. CRÉER UN QCM ====================

export const createQCM = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { titre, description, theme, questions, date_debut, date_fin, duree, classe_id, filiere_id } = req.body;
        const professeurId = req.user!.id;

        const professeur = await userRepo.findOne({
            where: { id: professeurId },
            relations: ['professeurProfil']
        });

        if (professeur?.professeurProfil?.filiereId && professeur.professeurProfil.filiereId !== filiere_id) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez créer une session que pour votre propre filière'
            });
            return;
        }

        const classe = await classeRepo.findOne({
            where: { id: classe_id },
            relations: ['filiere']
        });

        if (!classe || classe.filiereId !== filiere_id) {
            res.status(400).json({
                success: false,
                message: 'Cette classe n\'appartient pas à la filière sélectionnée'
            });
            return;
        }

        const session = sessionRepo.create({
            titre,
            description,
            theme,
            code: generateUniqueCode(),
            date_debut: new Date(date_debut),
            date_fin: new Date(date_fin),
            duree,
            classe_id,
            filiere_id,
            created_by: professeurId,
            status: SessionStatus.PENDING
        });

        await sessionRepo.save(session);

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i] as QuestionInput;
            const question = questionRepo.create({
                session_id: session.id,
                texte: q.texte,
                type: q.type,
                points: q.points || 1,
                ordre: i + 1,
                options: q.options || [],
                reponses_correctes: q.reponses_correctes,
                reponse_indicative: q.reponse_indicative || null
            });
            await questionRepo.save(question);
        }

        const qrData = JSON.stringify({ sessionId: session.id, code: session.code });
        const qrCodeImage = await QRCode.toDataURL(qrData);
        session.qr_code = qrCodeImage;
        await sessionRepo.save(session);

        // 🔴 NOTIFIER LES ÉTUDIANTS VIA WEBSOCKET
        const io = getSocketIO();
        if (io) {
            const roomName = `classe_${classe_id}_filiere_${filiere_id}`;

            const sessionData = {
                id: session.id,
                titre: session.titre,
                theme: session.theme,
                date_debut: session.date_debut,
                duree: session.duree,
                status: session.status,
                code: session.code,
                professeur: `${req.user!.prenom} ${req.user!.nom}`
            };

            io.to(roomName).emit('new-session', {
                session: sessionData,
                message: `📚 Nouvelle session disponible: ${session.titre}`
            });

            // Notifier les étudiants de la classe en DB
            const etudiants = await etudiantProfilRepo.find({
                where: { classeId: classe_id, filiereId: filiere_id }
            })
            for (const etudiant of etudiants) {
                await createNotification(etudiant.userId, {
                    titre: 'Nouvelle session disponible',
                    message: `La session "${session.titre}" a été créée par ${req.user!.prenom} ${req.user!.nom}`,
                    type: NotificationType.NEW_SESSION,
                    link: '/students',
                    sessionId: session.id
                })


                 // ← AJOUTE
                const user = await userRepo.findOne({ where: { id: etudiant.userId } })
                if (user?.notifNouvelleSession) {
                    await envoyerEmailNouvelleSession(user.email, user.prenom, session.titre)
                }
            }

            console.log(`📢 Nouvelle session notifiée à la salle: ${roomName}`);
        }

        const sessionWithQuestions = await sessionRepo.findOne({
            where: { id: session.id },
            relations: ['questions', 'classe', 'filiere']
        });

        auditProf(req, 'creation_session', 'session', session.id, { titre: session.titre })

        res.json({
            success: true,
            message: 'QCM créé avec succès',
            data: sessionWithQuestions
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 2. PLANIFIER UNE SESSION ====================

export const createSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { titre, description, theme, date_debut, date_fin, duree, classe_id, filiere_id } = req.body;
        const professeurId = req.user!.id;

        const professeur = await userRepo.findOne({
            where: { id: professeurId },
            relations: ['professeurProfil']
        });

        if (professeur?.professeurProfil?.filiereId && professeur.professeurProfil.filiereId !== filiere_id) {
            res.status(403).json({
                success: false,
                message: 'Vous ne pouvez créer une session que pour votre propre filière'
            });
            return;
        }

        const classe = await classeRepo.findOne({
            where: { id: classe_id },
            relations: ['filiere']
        });

        if (!classe || classe.filiereId !== filiere_id) {
            res.status(400).json({
                success: false,
                message: 'Classe invalide pour cette filière'
            });
            return;
        }

        const session = sessionRepo.create({
            titre,
            description,
            theme,
            code: generateUniqueCode(),
            date_debut: new Date(date_debut),
            date_fin: new Date(date_fin),
            duree,
            classe_id,
            filiere_id,
            created_by: professeurId,
            status: SessionStatus.PENDING
        });

        await sessionRepo.save(session);

        const qrData = JSON.stringify({ sessionId: session.id, code: session.code });
        const qrCodeImage = await QRCode.toDataURL(qrData);
        session.qr_code = qrCodeImage;
        await sessionRepo.save(session);

        // 🔴 NOTIFIER LES ÉTUDIANTS VIA WEBSOCKET
        const io = getSocketIO();
        if (io) {
            const roomName = `classe_${classe_id}_filiere_${filiere_id}`;

            const sessionData = {
                id: session.id,
                titre: session.titre,
                theme: session.theme,
                date_debut: session.date_debut,
                duree: session.duree,
                status: session.status,
                code: session.code,
                professeur: `${req.user!.prenom} ${req.user!.nom}`
            };

            io.to(roomName).emit('new-session', {
                session: sessionData,
                message: `📚 Nouvelle session planifiée: ${session.titre}`
            });

            console.log(`📢 Nouvelle session notifiée à la salle: ${roomName}`);
        }

        res.json({
            success: true,
            message: 'Session planifiée avec succès',
            data: {
                id: session.id,
                code: session.code,
                qr_code: session.qr_code,
                titre: session.titre,
                date_debut: session.date_debut,
                date_fin: session.date_fin
            }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 3. LISTE DES SESSIONS ====================

export const getSessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const professeurId = req.user!.id;

        const sessions = await sessionRepo.find({
            where: { created_by: professeurId },
            relations: ['classe', 'filiere', 'questions'],
            order: { created_at: 'DESC' }
        });

        res.json({
            success: true,
            data: sessions
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 4. DÉTAILS D'UNE SESSION ====================

export const getSessionDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const session = await sessionRepo.findOne({
            where: { id: sessionId },
            relations: ['questions', 'classe', 'filiere', 'professeur']
        });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        const participantsCount = await participantRepo.count({
            where: { session_id: sessionId }
        });

        res.json({
            success: true,
            data: {
                ...session,
                stats: {
                    participants: participantsCount
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

export const updateSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const { titre, description, theme, date_debut, date_fin, duree, classe_id, filiere_id, questions } = req.body;

        // ID du professeur connecté
        const professeurId = req.user!.id;

        // Récupérer la session avec vérification du créateur
        const session = await sessionRepo.findOne({
            where: {
                id: sessionId,
                created_by: professeurId
            }
        });

        if (!session) {
            res.status(404).json({
                success: false,
                message: 'Session non trouvée ou vous n\'êtes pas autorisé à la modifier'
            });
            return;
        }

        // Vérifier le statut
        if (session.status !== SessionStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: 'Seules les sessions en attente peuvent être modifiées'
            });
            return;
        }

        // Vérifier si des réponses existent déjà (optionnel)
        const hasReponses = await reponseRepo.count({
            where: { session_id: sessionId }
        });

        if (hasReponses > 0 && questions) {
            res.status(400).json({
                success: false,
                message: 'Des étudiants ont déjà répondu, vous ne pouvez pas modifier les questions'
            });
            return;
        }

        // Mettre à jour les informations de base
        session.titre = titre || session.titre;
        session.description = description !== undefined ? description : session.description;
        session.theme = theme !== undefined ? theme : session.theme;
        session.date_debut = date_debut ? new Date(date_debut) : session.date_debut;
        session.date_fin = date_fin ? new Date(date_fin) : session.date_fin;
        session.duree = duree || session.duree;
        session.classe_id = classe_id || session.classe_id;
        session.filiere_id = filiere_id || session.filiere_id;

        await sessionRepo.save(session);

        // Mettre à jour les questions si fournies
        if (questions && Array.isArray(questions)) {
            // Supprimer les anciennes questions
            await questionRepo.delete({ session_id: sessionId });

            // Créer les nouvelles questions
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const question = questionRepo.create({
                    session_id: session.id,
                    texte: q.texte,
                    type: q.type,
                    points: q.points || 1,
                    ordre: i + 1,
                    options: q.options || [],
                    reponses_correctes: q.reponses_correctes,
                    reponse_indicative: q.reponse_indicative || null
                });
                await questionRepo.save(question);
            }
        }

        // Recharger la session avec les questions
        const updatedSession = await sessionRepo.findOne({
            where: { id: session.id },
            relations: ['questions', 'classe', 'filiere']
        });

        res.json({
            success: true,
            message: 'Session mise à jour avec succès',
            data: updatedSession
        });
    } catch (err) {
        console.error('Erreur updateSession:', err);
        next(err);
    }
};
// ==================== 6. SUPPRIMER UNE SESSION ====================

export const deleteSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const session = await sessionRepo.findOne({ where: { id: sessionId } });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        if (session.status !== SessionStatus.PENDING && session.status !== SessionStatus.DRAFT) {
            res.status(400).json({
                success: false,
                message: 'Seules les sessions non commencées peuvent être supprimées'
            });
            return;
        }

        await sessionRepo.delete(sessionId);
        auditProf(req, 'suppression_session', 'session', sessionId, { titre: session.titre })

        res.json({
            success: true,
            message: 'Session supprimée'
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 7. DÉMARRER UNE SESSION ====================

export const startSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const session = await sessionRepo.findOne({
            where: { id: sessionId },
            relations: ['classe', 'filiere']
        });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        if (session.status !== SessionStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: 'La session ne peut pas être démarrée'
            });
            return;
        }

        await sessionRepo.update(sessionId, {
            status: SessionStatus.ACTIVE,
            date_debut: new Date()
        });
        auditProf(req, 'demarrage_session', 'session', sessionId, { titre: session.titre })

        // 🔴 NOTIFIER LES ÉTUDIANTS QUE LA SESSION A COMMENCÉ
        const io = getSocketIO();
        if (io) {
            const roomName = `classe_${session.classe_id}_filiere_${session.filiere_id}`;

            io.to(roomName).emit('session-started', {
                sessionId: session.id,
                session: {
                    id: session.id,
                    titre: session.titre,
                    theme: session.theme,
                    date_debut: session.date_debut,
                    date_fin: session.date_fin,
                    duree: session.duree,
                    code: session.code,
                    status: 'active'
                },
                message: `La session "${session.titre}" vient de commencer ! Rejoignez maintenant.`,
                timestamp: new Date()
            });

            // Notifier les étudiants en DB
            const etudiants = await etudiantProfilRepo.find({
                where: { classeId: session.classe_id, filiereId: session.filiere_id }
            })
            for (const etudiant of etudiants) {
                await createNotification(etudiant.userId, {
                    titre: 'Session démarrée !',
                    message: `La session "${session.titre}" vient de commencer. Rejoignez maintenant !`,
                    type: NotificationType.SESSION_STARTED,
                    link: `/students/join-session?code=${session.code}`,
                    sessionId: session.id
                })

                 const user = await userRepo.findOne({ where: { id: etudiant.userId } })
                    if (user?.notifSessionDemarree) {
                        await envoyerEmailSessionDemarree(user.email, user.prenom, session.titre)
                    }
                            }

            console.log(`Session démarrée - Notification envoyée à la salle: ${roomName}`);
        }

        const now = new Date();
        const timeUntilEnd = session.date_fin.getTime() - now.getTime();

        if (timeUntilEnd > 0) {
            setTimeout(async () => {
                await autoCloseSession(sessionId);
            }, timeUntilEnd);
        }

        res.json({
            success: true,
            message: 'Session démarrée'
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 8. TERMINER UNE SESSION ====================

export const endSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id)
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' })
            return
        }

        await autoCloseSession(sessionId) // autoCloseSession émet déjà les deux events
        auditProf(req, 'fin_session', 'session', sessionId)

        res.json({ success: true, message: 'Session terminée' })
    } catch (err) {
        next(err)
    }
}

// ==================== 9. PARTICIPANTS D'UNE SESSION ====================

export const getParticipants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        // Récupérer toutes les questions pour calculer le total des points
        const questions = await questionRepo.find({
            where: { session_id: sessionId }
        });
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

        // Récupérer toutes les réponses pour calculer les scores
        const allReponses = await reponseRepo.find({
            where: { session_id: sessionId }
        });

        // Créer un map des réponses par étudiant
        const reponsesMap = new Map<number, any[]>();
        allReponses.forEach(reponse => {
            if (!reponsesMap.has(reponse.etudiant_id)) {
                reponsesMap.set(reponse.etudiant_id, []);
            }
            reponsesMap.get(reponse.etudiant_id)!.push(reponse);
        });

        // Créer un map des questions par ID pour accès rapide
        const questionsMap = new Map<number, any>();
        questions.forEach(q => questionsMap.set(q.id, q));

        const participants = await participantRepo
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.etudiant', 'e')
            .where('p.session_id = :sessionId', { sessionId })
            .select([
                'p.id', 'p.statut', 'p.score', 'p.date_joined', 'p.date_completed', 'p.nb_changements_onglet',
                'e.id', 'e.nom', 'e.prenom', 'e.email'
            ])
            .getMany();

        const questionsCount = questions.length;

        const participantsWithProgress = await Promise.all(participants.map(async (p) => {
            const etudiantReponses = reponsesMap.get(p.etudiant.id) || [];

            // Calculer le score réel de l'étudiant
            let calculatedScore = 0;
            for (const reponse of etudiantReponses) {
                if (reponse.est_correcte) {
                    const question = questionsMap.get(reponse.question_id);
                    if (question) {
                        calculatedScore += question.points;
                    }
                }
            }

            // Mettre à jour le score dans la base s'il a changé
            if (p.score !== calculatedScore) {
                p.score = calculatedScore;
                await participantRepo.save(p);
            }

            const reponsesCount = etudiantReponses.length;

            // Calculer la note sur 20
            const noteSur20 = totalPoints > 0 ? (calculatedScore / totalPoints) * 20 : 0;

            // ─── Détection de triche basique ───────────────────────────────
            const nbReponsesRapides = etudiantReponses.filter(
                (r: any) => r.temps_reponse_ms != null && r.temps_reponse_ms < SEUIL_TEMPS_REPONSE_MS
            ).length;
            const nbChangementsOnglet = p.nb_changements_onglet || 0;
            const suspect = nbChangementsOnglet >= SEUIL_CHANGEMENTS_ONGLET || nbReponsesRapides >= SEUIL_NB_REPONSES_RAPIDES;

            return {
                id: p.id,
                statut: p.statut,
                score: calculatedScore,
                note_sur_20: Math.round(noteSur20 * 100) / 100,
                date_joined: p.date_joined,
                date_completed: p.date_completed,
                progression: {
                    repondues: reponsesCount,
                    total: questionsCount,
                    pourcentage: questionsCount > 0 ? (reponsesCount / questionsCount) * 100 : 0
                },
                triche: {
                    suspect,
                    nb_changements_onglet: nbChangementsOnglet,
                    nb_reponses_rapides: nbReponsesRapides
                },
                etudiant: {
                    id: p.etudiant.id,
                    nom: p.etudiant.nom,
                    prenom: p.etudiant.prenom,
                    email: p.etudiant.email
                }
            };
        }));

        // Trier par score décroissant
        participantsWithProgress.sort((a, b) => b.score - a.score);

        res.json({
            success: true,
            data: {
                participants: participantsWithProgress,
                total: participantsWithProgress.length,
                total_points: totalPoints,
                presents: participantsWithProgress.filter(p => p.statut === ParticipantStatus.PRESENT).length,
                termines: participantsWithProgress.filter(p => p.statut === ParticipantStatus.TERMINE).length
            }
        });
    } catch (err) {
        console.error('Erreur getParticipants:', err);
        next(err);
    }
};

// ==================== 10. STATISTIQUES D'UNE SESSION ====================

export const getStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

        const participants = await participantRepo.find({
            where: { session_id: sessionId, statut: ParticipantStatus.TERMINE }
        });

        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

        const statsQuestions = await Promise.all(questions.map(async (q) => {
            const reponses = await reponseRepo.find({
                where: { session_id: sessionId, question_id: q.id }
            });

            const bonnesReponses = reponses.filter(r => r.est_correcte).length;
            const tauxReussite = reponses.length > 0 ? (bonnesReponses / reponses.length) * 100 : 0;

            return {
                question_id: q.id,
                texte: q.texte.substring(0, 100),
                points: q.points,
                nb_reponses: reponses.length,
                nb_bonnes: bonnesReponses,
                taux_reussite: Math.round(tauxReussite)
            };
        }));

        const scores = participants.map(p => p.score || 0);
        const moyenne = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const moyenneSur20 = totalPoints > 0 ? (moyenne / totalPoints) * 20 : 0;
        const meilleur = Math.max(...scores, 0);
        const moinsBon = Math.min(...scores.filter(s => s > 0), 0);

        // Remplace la repartition actuelle par :
        const repartition = {
            '0-20%': scores.filter(s => totalPoints > 0 && (s / totalPoints) <= 0.2).length,
            '20-40%': scores.filter(s => totalPoints > 0 && (s / totalPoints) > 0.2 && (s / totalPoints) <= 0.4).length,
            '40-60%': scores.filter(s => totalPoints > 0 && (s / totalPoints) > 0.4 && (s / totalPoints) <= 0.6).length,
            '60-80%': scores.filter(s => totalPoints > 0 && (s / totalPoints) > 0.6 && (s / totalPoints) <= 0.8).length,
            '80-100%': scores.filter(s => totalPoints > 0 && (s / totalPoints) > 0.8).length,
        };

        res.json({
            success: true,
            data: {
                session: {
                    id: sessionId,
                    total_participants: participants.length,
                    total_points: totalPoints
                },
                scores: {
                    moyenne: Math.round(moyenne * 100) / 100,
                    moyenne_sur_20: Math.round(moyenneSur20 * 100) / 100,
                    meilleur: Math.round(meilleur * 100) / 100,
                    moins_bon: Math.round(moinsBon * 100) / 100,
                    repartition
                },
                questions: statsQuestions
            }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 11. RÉPONSES D'UN ÉTUDIANT POUR UNE SESSION ====================

export const getEtudiantReponses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        const etudiantId = parseId(req.params.etudiantId);

        if (!sessionId || !etudiantId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        // Récupérer toutes les questions de la session
        const questions = await questionRepo.find({
            where: { session_id: sessionId },
            order: { ordre: 'ASC' }
        });

        // Récupérer les réponses de l'étudiant
        const reponses = await reponseRepo.find({
            where: { session_id: sessionId, etudiant_id: etudiantId }
        });

        // Créer un map des réponses par question
        const reponsesMap = new Map<number, any>();
        reponses.forEach(reponse => {
            reponsesMap.set(reponse.question_id, reponse);
        });

        // Calculer le score total
        let totalScore = 0;
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

        // Formater les réponses pour chaque question
        const formattedReponses = questions.map(question => {
            const reponse = reponsesMap.get(question.id);
            const estCorrecte = reponse?.est_correcte || false;
            const pointsObtenus = reponse ? computePointsForReponse(reponse, question) : 0;

            totalScore += pointsObtenus;

            return {
                question_id: question.id,
                reponse_ids: reponse?.reponse_ids || [],
                reponse_texte: reponse?.reponse_texte || null,
                reponse_fichier: reponse?.reponse_fichier || null,
                est_correcte: estCorrecte,
                points_obtenus: pointsObtenus,
                corrige_manuellement: reponse?.corrige_manuellement || false,
                note_manuelle: reponse?.note_manuelle ?? null,
                submitted_at: reponse?.submitted_at || null,
                temps_reponse_ms: reponse?.temps_reponse_ms ?? null,
                reponse_rapide_suspecte: reponse?.temps_reponse_ms != null && reponse.temps_reponse_ms < SEUIL_TEMPS_REPONSE_MS,
                question: {
                    texte: question.texte,
                    type: question.type,
                    points: question.points,
                    options: question.options,
                    reponses_correctes: question.reponses_correctes,
                    reponse_indicative: question.reponse_indicative
                }
            };
        });

        const noteSur20 = totalPoints > 0 ? (totalScore / totalPoints) * 20 : 0;

        const participant = await participantRepo.findOne({ where: { session_id: sessionId, etudiant_id: etudiantId } });

        res.json({
            success: true,
            data: {
                reponses: formattedReponses,
                score: totalScore,
                total_points: totalPoints,
                note_sur_20: Math.round(noteSur20 * 100) / 100,
                nb_changements_onglet: participant?.nb_changements_onglet || 0
            }
        });
    } catch (err) {
        console.error('Erreur getEtudiantReponses:', err);
        next(err);
    }
};

// ==================== 11. NOTES D'UNE SESSION ====================

export const getNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const session = await sessionRepo.findOne({ where: { id: sessionId } });
        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        const participants = await participantRepo
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.etudiant', 'e')
            .where('p.session_id = :sessionId', { sessionId })
            .andWhere('p.statut = :statut', { statut: ParticipantStatus.TERMINE })
            .orderBy('p.score', 'DESC')
            .getMany();

        const questions = await questionRepo.find({ where: { session_id: sessionId } });
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

        const notes = participants.map(p => ({
            etudiant: {
                id: p.etudiant.id,
                nom: p.etudiant.nom,
                prenom: p.etudiant.prenom,
                email: p.etudiant.email
            },
            score: p.score,
            note_sur_20: totalPoints > 0 ? ((p.score || 0) / totalPoints) * 20 : 0,
            date_completed: p.date_completed
        }));

        res.json({
            success: true,
            data: {
                session: {
                    id: session.id,
                    titre: session.titre,
                    total_points: totalPoints
                },
                notes: notes,
                publiees: session.status === SessionStatus.COMPLETED
            }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 12. PUBLIER LES NOTES ====================

export const publishNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        res.json({
            success: true,
            message: 'Notes publiées avec succès'
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 13. EXPORTER LES RÉSULTATS ====================

export const exportResults = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const participants = await participantRepo
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.etudiant', 'e')
            .where('p.session_id = :sessionId', { sessionId })
            .getMany();

        const questions = await questionRepo.find({ where: { session_id: sessionId } });
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

        const csvRows = [
            ['Nom', 'Prénom', 'Email', 'Score', 'Note / 20', 'Statut', 'Date complétion']
        ];

        for (const p of participants) {
            csvRows.push([
                p.etudiant.nom,
                p.etudiant.prenom,
                p.etudiant.email,
                p.score?.toString() || '0',
                totalPoints > 0 ? (((p.score || 0) / totalPoints) * 20).toFixed(2) : '0',
                p.statut,
                p.date_completed ? p.date_completed.toLocaleString() : '-'
            ]);
        }

        const csvContent = csvRows.map(row => row.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=session_${sessionId}_resultats.csv`);
        res.send(csvContent);
    } catch (err) {
        next(err);
    }
};

// ==================== 14. GÉNÉRER QR CODE ====================

export const generateQRCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const session = await sessionRepo.findOne({ where: { id: sessionId } });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        const qrData = JSON.stringify({ sessionId: session.id, code: session.code });
        const qrCodeImage = await QRCode.toDataURL(qrData);

        await sessionRepo.update(session.id, { qr_code: qrCodeImage });

        res.json({
            success: true,
            data: { qr_code: qrCodeImage }
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 15. GÉNÉRER NOUVEAU CODE ====================

export const generateCode = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const session = await sessionRepo.findOne({ where: { id: sessionId } });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        const newCode = generateUniqueCode();
        await sessionRepo.update(session.id, { code: newCode });

        res.json({
            success: true,
            data: { code: newCode }
        });
    } catch (err) {
        next(err);
    }
};


// ==================== FILIÈRES ET CLASSES ====================

/**
 * Récupérer les filières (selon l'école du professeur)
 */
export const getFilieres = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const professeurId = req.user!.id;

        // Récupérer le professeur avec son école
        const professeur = await userRepo.findOne({
            where: { id: professeurId },
            relations: ['professeurProfil']
        });

        let filieres;

        if (professeur?.professeurProfil?.filiereId) {
            // Le professeur ne voit que SA propre filière, pour éviter toute
            // affectation de session à une filière qu'il ne donne pas
            filieres = await filiereRepo.find({
                where: { id: professeur.professeurProfil.filiereId },
                relations: ['classes'],
                order: { nom: 'ASC' }
            });
        } else if (professeur?.professeurProfil?.ecoleId) {
            // Filet de sécurité : professeur affecté à une école mais sans
            // filière assignée pour le moment
            filieres = await filiereRepo.find({
                where: { ecoleId: professeur.professeurProfil.ecoleId },
                relations: ['classes'],
                order: { nom: 'ASC' }
            });
        } else {
            // Sinon, voir toutes les filières (admin)
            filieres = await filiereRepo.find({
                relations: ['classes'],
                order: { nom: 'ASC' }
            });
        }

        res.json({
            success: true,
            data: filieres
        });
    } catch (error) {
        console.error('Erreur récupération filières:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des filières'
        });
    }
};

/**
 * Récupérer les classes (filtrées par filière)
 */
export const getClasses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { filiereId } = req.query;
        const professeurId = req.user!.id;

        const professeur = await userRepo.findOne({
            where: { id: professeurId },
            relations: ['professeurProfil']
        });

        // Un professeur affecté à une filière ne peut consulter que les
        // classes de CETTE filière (pas celles des autres filières de l'école)
        if (
            professeur?.professeurProfil?.filiereId &&
            filiereId &&
            parseInt(filiereId as string) !== professeur.professeurProfil.filiereId
        ) {
            res.status(403).json({ success: false, message: "Vous n'avez pas accès à cette filière" });
            return;
        }

        let classes;

        if (filiereId) {
            classes = await classeRepo.find({
                where: { filiereId: parseInt(filiereId as string) },
                order: { nom: 'ASC' }
            });
        } else {
            classes = await classeRepo.find({
                relations: ['filiere'],
                order: { nom: 'ASC' }
            });
        }

        res.json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Erreur récupération classes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des classes'
        });
    }
};



// ==================== BANQUE DE QUESTIONS ====================
// Permet à un professeur de réutiliser des questions déjà rédigées d'une
// session à l'autre, avec des tags thème/difficulté pour les retrouver.

export const getBanqueQuestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const professeurId = req.user!.id;
        const professeur = await userRepo.findOne({
            where: { id: professeurId },
            relations: ['professeurProfil']
        });

        const ecoleId = professeur?.professeurProfil?.ecoleId;
        if (!ecoleId) {
            res.status(403).json({ success: false, message: "Vous n'êtes rattaché à aucune école" });
            return;
        }

        const { theme, difficulte, type } = req.query;

        const qb = banqueRepo.createQueryBuilder('qb')
            .where('qb.ecole_id = :ecoleId', { ecoleId })
            .orderBy('qb.created_at', 'DESC');

        // Un professeur affecté à une filière ne voit que les questions
        // générales (sans filière) ou celles de SA propre filière
        if (professeur?.professeurProfil?.filiereId) {
            qb.andWhere('(qb.filiere_id IS NULL OR qb.filiere_id = :filiereId)', {
                filiereId: professeur.professeurProfil.filiereId
            });
        }

        if (theme)      qb.andWhere('qb.theme = :theme', { theme });
        if (difficulte) qb.andWhere('qb.difficulte = :difficulte', { difficulte });
        if (type)       qb.andWhere('qb.type = :type', { type });

        const questions = await qb.getMany();

        res.json({ success: true, data: questions });
    } catch (err) {
        next(err);
    }
};

export const createBanqueQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const professeurId = req.user!.id;
        const professeur = await userRepo.findOne({
            where: { id: professeurId },
            relations: ['professeurProfil']
        });

        const ecoleId = professeur?.professeurProfil?.ecoleId;
        if (!ecoleId) {
            res.status(403).json({ success: false, message: "Vous n'êtes rattaché à aucune école" });
            return;
        }

        const { texte, type, points, options, reponses_correctes, reponse_indicative, theme, difficulte } = req.body;

        if (!texte || !type) {
            res.status(400).json({ success: false, message: 'Le texte et le type de la question sont requis' });
            return;
        }

        const question = banqueRepo.create({
            ecole_id: ecoleId,
            professeur_id: professeurId,
            filiere_id: professeur?.professeurProfil?.filiereId || null,
            texte,
            type,
            points: points || 1,
            options: options || null,
            reponses_correctes: reponses_correctes || null,
            reponse_indicative: reponse_indicative || null,
            theme: theme || null,
            difficulte: difficulte || QuestionDifficulte.MOYEN
        });

        await banqueRepo.save(question);

        res.json({ success: true, message: 'Question ajoutée à la banque', data: question });
    } catch (err) {
        next(err);
    }
};

export const updateBanqueQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseId(req.params.id);
        const professeurId = req.user!.id;

        const question = await banqueRepo.findOne({ where: { id } });
        if (!question) {
            res.status(404).json({ success: false, message: 'Question non trouvée' });
            return;
        }
        if (question.professeur_id !== professeurId) {
            res.status(403).json({ success: false, message: 'Vous ne pouvez modifier que vos propres questions' });
            return;
        }

        const { texte, type, points, options, reponses_correctes, reponse_indicative, theme, difficulte } = req.body;

        if (texte !== undefined)              question.texte = texte;
        if (type !== undefined)               question.type = type;
        if (points !== undefined)             question.points = points;
        if (options !== undefined)            question.options = options;
        if (reponses_correctes !== undefined) question.reponses_correctes = reponses_correctes;
        if (reponse_indicative !== undefined) question.reponse_indicative = reponse_indicative;
        if (theme !== undefined)              question.theme = theme;
        if (difficulte !== undefined)         question.difficulte = difficulte;

        await banqueRepo.save(question);

        res.json({ success: true, message: 'Question mise à jour', data: question });
    } catch (err) {
        next(err);
    }
};

export const deleteBanqueQuestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseId(req.params.id);
        const professeurId = req.user!.id;

        const question = await banqueRepo.findOne({ where: { id } });
        if (!question) {
            res.status(404).json({ success: false, message: 'Question non trouvée' });
            return;
        }
        if (question.professeur_id !== professeurId) {
            res.status(403).json({ success: false, message: 'Vous ne pouvez supprimer que vos propres questions' });
            return;
        }

        await banqueRepo.delete(id);

        res.json({ success: true, message: 'Question supprimée de la banque' });
    } catch (err) {
        next(err);
    }
};

// ==================== STATISTIQUES GLOBALES DU PROFESSEUR ====================

export const getTeacherStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const professeurId = req.user!.id;

if (req.user!.role !== 'professeur' && req.user!.role !== 'superadmin') {
            res.status(403).json({
                success: false,
                message: 'Accès non autorisé. Seuls les professeurs peuvent accéder à ces statistiques.'
            });
            return;
        }

        const sessions = await sessionRepo.find({
            where: { created_by: professeurId },
            relations: ['questions', 'participants', 'classe', 'filiere']
        });

        const maintenant = new Date();

        // Statistiques globales
        let total = sessions.length;
        let aVenir = 0;
        let enCours = 0;
        let terminees = 0;

        // Liste des sessions à venir
        const sessionsAVenir: any[] = [];

        for (const session of sessions) {
            const dateDebut = new Date(session.date_debut);
            const dateFin = new Date(session.date_fin);

            if (session.status === 'completed' || dateFin < maintenant) {
                terminees++;
            }
            else if (session.status === 'active' || (dateDebut <= maintenant && dateFin >= maintenant)) {
                enCours++;
            }
            else if (session.status === 'pending' && dateDebut > maintenant) {
                aVenir++;
                sessionsAVenir.push({
                    id: session.id,
                    titre: session.titre,
                    description: session.description,
                    theme: session.theme,
                    date_debut: session.date_debut,
                    date_fin: session.date_fin,
                    duree: session.duree,
                    classe: session.classe?.nom,
                    filiere: session.filiere?.nom,
                    questions_count: session.questions?.length || 0,
                    participants_count: session.participants?.length || 0,
                    status: session.status
                });
            }
        }

        // Trier les sessions à venir par date (plus proche d'abord)
        sessionsAVenir.sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());

        // Calculer la moyenne générale des étudiants (uniquement pour les sessions du professeur)
        let totalScores = 0;
        let totalParticipants = 0;
        let totalPointsPossibles = 0;

        for (const session of sessions) {
            if (session.status === 'completed' && session.questions && session.participants) {
                const pointsSession = session.questions.reduce((sum, q) => sum + q.points, 0);

                for (const participant of session.participants) {
                    if (participant.score !== null) {
                        totalScores += participant.score;
                        totalParticipants++;
                        totalPointsPossibles += pointsSession;
                    }
                }
            }
        }

        // Remplace
        const moyenneGenerale = totalParticipants > 0 ? (totalScores / totalParticipants) : 0;
        const moyenneSur20 = totalPointsPossibles > 0 ? (totalScores / totalPointsPossibles) * 20 : 0;
        // Ces deux lignes sont déjà correctes avec des points bruts ✅

        res.json({
            success: true,
            data: {
                stats: {
                    total,
                    aVenir,
                    enCours,
                    terminees
                },
                moyenne: {
                    generale: Math.round(moyenneGenerale * 100) / 100,
                    sur20: Math.round(moyenneSur20 * 100) / 100
                },
                sessionsAVenir
            }
        });

    } catch (err) {
        console.error('Erreur getTeacherStats:', err);
        next(err);
    }
};





// ==================== TOGGLE RÉSULTATS VISIBLES ====================

export const toggleResultatsVisibles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id)
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' })
            return
        }

        const session = await sessionRepo.findOne({
            where: { id: sessionId },
            relations: ['classe', 'filiere']
        })
        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' })
            return
        }

        // On s'apprête à publier : vérifier qu'il ne reste aucune réponse
        // texte_libre/fichier en attente de correction manuelle
        if (!session.resultatsVisibles) {
            const enAttente = await hasUngradedManualReponses(sessionId)
            if (enAttente) {
                res.status(400).json({
                    success: false,
                    message: "Certaines réponses (texte libre / fichier) n'ont pas encore été corrigées. Corrigez-les avant de publier les notes."
                })
                return
            }
        }

        session.resultatsVisibles = !session.resultatsVisibles
        await sessionRepo.save(session)
        auditProf(req, session.resultatsVisibles ? 'publication_notes' : 'masquage_notes', 'session', session.id, { titre: session.titre })

        // ─── Notifier les étudiants si notes maintenant visibles ─────────────
        if (session.resultatsVisibles) {
            const io = getSocketIO()
            if (io) {
                const roomName = `classe_${session.classe_id}_filiere_${session.filiere_id}`

                // WebSocket temps réel
                io.to(roomName).emit('notes-publiees', {
                    sessionId: session.id,
                    titre:     session.titre,
                    message:   `Les notes de "${session.titre}" sont maintenant disponibles.`
                })

                // Notification en base pour chaque étudiant
                const etudiants = await etudiantProfilRepo.find({
                    where: { classeId: session.classe_id, filiereId: session.filiere_id }
                })
                for (const etudiant of etudiants) {
                    await createNotification(etudiant.userId, {
                        titre:     'Notes disponibles',
                        message:   `Vos notes pour "${session.titre}" sont maintenant disponibles.`,
                        type:      NotificationType.SESSION_COMPLETED,
                        link:      `/students/notes/${session.id}`,
                        sessionId: session.id
                    })

                     // ← AJOUTE
                        const user = await userRepo.findOne({ where: { id: etudiant.userId } })
                        if (user?.notifNotesPubliees) {
                            await envoyerEmailNotesPubliees(user.email, user.prenom, session.titre, session.id)
                        }
                }

                console.log(`Notes publiées notifiées à: ${roomName}`)
            }
        }

        res.json({
            success: true,
            data: { resultatsVisibles: session.resultatsVisibles }
        })
    } catch (err) { next(err) }
}

// ==================== CORRECTION MANUELLE (texte_libre / fichier) ====================
// Les réponses à correction manuelle ne sont jamais auto-corrigées : le
// professeur doit attribuer lui-même une note par réponse avant de pouvoir
// publier les résultats de la session (voir hasUngradedManualReponses ci-dessus).

export const getReponsesACorreger = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const reponses = await reponseRepo
            .createQueryBuilder('r')
            .innerJoinAndSelect('r.question', 'q')
            .innerJoinAndSelect('r.etudiant', 'e')
            .where('r.session_id = :sessionId', { sessionId })
            .andWhere('q.type IN (:...types)', { types: [QuestionType.TEXTE_LIBRE, QuestionType.FICHIER] })
            .orderBy('q.ordre', 'ASC')
            .getMany();

        const data = reponses.map(r => ({
            id: r.id,
            question_id: r.question_id,
            question_texte: r.question.texte,
            question_type: r.question.type,
            points_max: r.question.points,
            reponse_indicative: r.question.reponse_indicative,
            reponse_texte: r.reponse_texte,
            reponse_fichier: r.reponse_fichier,
            corrige_manuellement: r.corrige_manuellement,
            note_manuelle: r.note_manuelle,
            etudiant: {
                id: r.etudiant.id,
                nom: r.etudiant.nom,
                prenom: r.etudiant.prenom,
                email: r.etudiant.email
            }
        }));

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const corrigerReponse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const reponseId = parseId(req.params.reponseId);
        const { points } = req.body;

        if (!reponseId || points === undefined || points === null) {
            res.status(400).json({ success: false, message: 'Paramètres invalides' });
            return;
        }

        const reponse = await reponseRepo.findOne({ where: { id: reponseId } });
        if (!reponse) {
            res.status(404).json({ success: false, message: 'Réponse non trouvée' });
            return;
        }

        const question = await questionRepo.findOne({ where: { id: reponse.question_id } });
        if (!question) {
            res.status(404).json({ success: false, message: 'Question non trouvée' });
            return;
        }

        const notePlafonnee = Math.max(0, Math.min(Number(points), question.points));

        reponse.note_manuelle = notePlafonnee;
        reponse.corrige_manuellement = true;
        reponse.est_correcte = notePlafonnee > 0;
        await reponseRepo.save(reponse);

        await recomputerScoreParticipant(reponse.session_id, reponse.etudiant_id);

        res.json({ success: true, message: 'Réponse corrigée', data: { note_manuelle: notePlafonnee } });
    } catch (err) {
        next(err);
    }
};

// ==================== PLAN DE L'ÉCOLE (pour gater la génération IA côté front) ====================
export const getPlanInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const profil = await professeurProfilRepo.findOne({ where: { userId: req.user!.id } });
        if (!profil?.ecoleId) {
            res.json({ success: true, data: { plan: 'gratuit', ia: false } });
            return;
        }

        const ecole = await ecoleRepo.findOne({ where: { id: profil.ecoleId } });
        const plan = ecole?.plan || 'gratuit';

        res.json({ success: true, data: { plan, ia: LIMITES_PLANS[plan].ia } });
    } catch (err) {
        next(err);
    }
};