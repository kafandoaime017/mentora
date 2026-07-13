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
import { 
    envoyerEmailSessionDemarree,
    envoyerEmailNouvelleSession,
    envoyerEmailNotesPubliees
} from '../services/emailService'




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

interface QuestionInput {
    texte: string;
    type: QuestionType;
    points: number;
    options: string[];
    reponses_correctes: number[];
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
            return sum + (r.est_correcte && question ? question.points : 0);
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
                reponses_correctes: q.reponses_correctes
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
                    reponses_correctes: q.reponses_correctes
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
                'p.id', 'p.statut', 'p.score', 'p.date_joined', 'p.date_completed',
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
            const pointsObtenus = estCorrecte ? question.points : 0;

            if (estCorrecte) {
                totalScore += question.points;
            }

            return {
                question_id: question.id,
                reponse_ids: reponse?.reponse_ids || [],
                est_correcte: estCorrecte,
                points_obtenus: pointsObtenus,
                submitted_at: reponse?.submitted_at || null,
                question: {
                    texte: question.texte,
                    type: question.type,
                    points: question.points,
                    options: question.options,
                    reponses_correctes: question.reponses_correctes
                }
            };
        });

        const noteSur20 = totalPoints > 0 ? (totalScore / totalPoints) * 20 : 0;

        res.json({
            success: true,
            data: {
                reponses: formattedReponses,
                score: totalScore,
                total_points: totalPoints,
                note_sur_20: Math.round(noteSur20 * 100) / 100
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

        if (professeur?.professeurProfil?.ecoleId) {
            // Si le professeur est affecté à une école, ne voir que ses filières
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

        session.resultatsVisibles = !session.resultatsVisibles
        await sessionRepo.save(session)

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