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

const autoCloseSession = async (sessionId: number): Promise<void> => {
    const session = await sessionRepo.findOne({ where: { id: sessionId } });
    if (session && session.status === SessionStatus.ACTIVE) {
        await sessionRepo.update(sessionId, { status: SessionStatus.COMPLETED });
        await calculateAndUpdateScores(sessionId);
    }
};

const calculateAndUpdateScores = async (sessionId: number): Promise<void> => {
    const participants = await participantRepo.find({
        where: { session_id: sessionId, statut: ParticipantStatus.PRESENT }
    });

    const questions = await questionRepo.find({ where: { session_id: sessionId } });
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    for (const participant of participants) {
        const reponses = await reponseRepo.find({
            where: { session_id: sessionId, etudiant_id: participant.etudiant_id }
        });

        const pointsObtenus = reponses.reduce((sum, r) => {
            const question = questions.find(q => q.id === r.question_id);
            return sum + (r.est_correcte ? (question?.points || 0) : 0);
        }, 0);

        participant.score = totalPoints > 0 ? (pointsObtenus / totalPoints) * 100 : 0;
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

// ==================== 5. MODIFIER UNE SESSION ====================

export const updateSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        const { titre, description, theme, date_debut, date_fin, duree, classe_id, filiere_id } = req.body;

        const session = await sessionRepo.findOne({ where: { id: sessionId } });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session non trouvée' });
            return;
        }

        if (session.status !== SessionStatus.PENDING) {
            res.status(400).json({
                success: false,
                message: 'Seules les sessions en attente peuvent être modifiées'
            });
            return;
        }

        session.titre = titre || session.titre;
        session.description = description !== undefined ? description : session.description;
        session.theme = theme !== undefined ? theme : session.theme;
        session.date_debut = date_debut ? new Date(date_debut) : session.date_debut;
        session.date_fin = date_fin ? new Date(date_fin) : session.date_fin;
        session.duree = duree || session.duree;
        session.classe_id = classe_id || session.classe_id;
        session.filiere_id = filiere_id || session.filiere_id;

        await sessionRepo.save(session);

        res.json({
            success: true,
            message: 'Session mise à jour',
            data: session
        });
    } catch (err) {
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

        const session = await sessionRepo.findOne({ where: { id: sessionId } });

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
        const sessionId = parseId(req.params.id);
        if (!sessionId) {
            res.status(400).json({ success: false, message: 'ID invalide' });
            return;
        }

        await autoCloseSession(sessionId);

        res.json({
            success: true,
            message: 'Session terminée'
        });
    } catch (err) {
        next(err);
    }
};

// ==================== 9. PARTICIPANTS D'UNE SESSION ====================

export const getParticipants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
            .select([
                'p.id', 'p.statut', 'p.score', 'p.date_joined', 'p.date_completed',
                'e.id', 'e.nom', 'e.prenom', 'e.email'
            ])
            .getMany();

        const questionsCount = await questionRepo.count({ where: { session_id: sessionId } });

        const participantsWithProgress = await Promise.all(participants.map(async (p) => {
            const reponsesCount = await reponseRepo.count({
                where: { session_id: sessionId, etudiant_id: p.etudiant.id }
            });

            return {
                ...p,
                progression: {
                    repondues: reponsesCount,
                    total: questionsCount,
                    pourcentage: questionsCount > 0 ? (reponsesCount / questionsCount) * 100 : 0
                }
            };
        }));

        res.json({
            success: true,
            data: {
                participants: participantsWithProgress,
                total: participantsWithProgress.length,
                presents: participantsWithProgress.filter(p => p.statut === ParticipantStatus.PRESENT).length,
                termines: participantsWithProgress.filter(p => p.statut === ParticipantStatus.TERMINE).length
            }
        });
    } catch (err) {
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

        const repartition = {
            '0-20%': scores.filter(s => s <= 20).length,
            '20-40%': scores.filter(s => s > 20 && s <= 40).length,
            '40-60%': scores.filter(s => s > 40 && s <= 60).length,
            '60-80%': scores.filter(s => s > 60 && s <= 80).length,
            '80-100%': scores.filter(s => s > 80).length
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