import { Router } from 'express';
import { authMiddleware, requireRole } from '../../app/middleware/auth';
import * as teacherController from '../../app/controllers/teacherController';

const router = Router();

// Toutes les routes nécessitent authentification et rôle professeur
router.use(authMiddleware);
router.use(requireRole(['professeur', 'admin']));

// ==================== QCM ====================
router.post('/qcm', teacherController.createQCM);
router.get('/qcm', teacherController.getSessions);
router.get('/qcm/:id', teacherController.getSessionDetails);
router.put('/qcm/:id', teacherController.updateSession);
router.delete('/qcm/:id', teacherController.deleteSession);

// ==================== SESSIONS ====================
router.post('/sessions', teacherController.createSession);
router.get('/sessions', teacherController.getSessions);
router.get('/sessions/:id', teacherController.getSessionDetails);
router.put('/sessions/:id', teacherController.updateSession);
router.delete('/sessions/:id', teacherController.deleteSession);

// ==================== GESTION DE LA SESSION ====================
router.post('/sessions/:id/start', teacherController.startSession);
router.post('/sessions/:id/end', teacherController.endSession);

// ==================== PARTICIPANTS ====================
router.get('/sessions/:id/participants', teacherController.getParticipants);

// ==================== RÉPONSES D'UN ÉTUDIANT ====================
router.get('/sessions/:id/etudiant/:etudiantId/reponses', teacherController.getEtudiantReponses);

// ==================== STATISTIQUES ====================
router.get('/sessions/:id/statistiques', teacherController.getStatistics);
router.get('/sessions/:id/notes', teacherController.getNotes);
router.post('/sessions/:id/notes/publier', teacherController.publishNotes);
router.get('/sessions/:id/export', teacherController.exportResults);

router.get('/stats', teacherController.getTeacherStats);

// ROUTE POUR RÉCUPÉRER LES FILIÈRES
router.get('/filieres', teacherController.getFilieres);

// ROUTE POUR RÉCUPÉRER LES CLASSES
router.get('/classes', teacherController.getClasses);





export default router;