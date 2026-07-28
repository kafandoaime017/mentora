import { Router } from 'express';
import { authMiddleware, requireRole } from '../../app/middleware/auth';
import * as teacherController from '../../app/controllers/teacherController';
import { checkLimiteSessions, checkPlanIA } from '../../app/middleware/checkPlan'
import { createQCM } from '../../app/controllers/teacherController';

const router = Router();

// Toutes les routes necessitent authentification et role professeur
router.use(authMiddleware);
router.use(requireRole(['professeur']));

// ==================== QCM ====================
router.post('/qcm',authMiddleware, requireRole(['professeur']), checkLimiteSessions, createQCM)

router.get('/qcm', teacherController.getSessions);
router.get('/qcm/:id', teacherController.getSessionDetails);
router.put('/qcm/:id', teacherController.updateSession);
router.delete('/qcm/:id', teacherController.deleteSession);
router.post('/qcm/:id/dupliquer', checkLimiteSessions, teacherController.duplicateSession);

// ==================== SESSIONS ====================
router.post('/sessions', checkLimiteSessions, teacherController.createSession);
router.get('/sessions', teacherController.getSessions);
router.get('/sessions/:id', teacherController.getSessionDetails);
router.put('/sessions/:id', teacherController.updateSession);
router.delete('/sessions/:id', teacherController.deleteSession);

// ==================== GESTION DE LA SESSION ====================
router.post('/sessions/:id/start', teacherController.startSession);
router.post('/sessions/:id/end', teacherController.endSession);

// ==================== PARTICIPANTS ====================
router.get('/sessions/:id/participants', teacherController.getParticipants);

// ==================== REPONSES D'UN ETUDIANT ====================
router.get('/sessions/:id/etudiant/:etudiantId/reponses', teacherController.getEtudiantReponses);

// ==================== STATISTIQUES ====================
router.get('/sessions/:id/statistiques', teacherController.getStatistics);
router.get('/sessions/:id/notes', teacherController.getNotes);
router.get('/sessions/:id/export', teacherController.exportResults);

router.get('/stats', teacherController.getTeacherStats);

// ROUTE POUR RECUPERER LES FILIERES
router.get('/filieres', teacherController.getFilieres);

// ROUTE POUR RECUPERER LES CLASSES
router.get('/classes', teacherController.getClasses);
router.patch('/sessions/:id/toggle-resultats', teacherController.toggleResultatsVisibles)

// ==================== BANQUE DE QUESTIONS ====================
router.get('/banque-questions', teacherController.getBanqueQuestions);
router.post('/banque-questions', teacherController.createBanqueQuestion);
router.post('/banque-questions/bulk', teacherController.createBanqueQuestionsBulk);
router.put('/banque-questions/:id', teacherController.updateBanqueQuestion);
router.delete('/banque-questions/:id', teacherController.deleteBanqueQuestion);

// ==================== CORRECTION MANUELLE ====================
router.get('/sessions/:id/reponses-a-corriger', teacherController.getReponsesACorreger);
router.patch('/reponses/:reponseId/corriger', teacherController.corrigerReponse);

// ==================== PLAN DE L'ECOLE ====================
router.get('/plan', teacherController.getPlanInfo);


export default router;
