import { Router } from 'express';
import { authMiddleware, requireRole } from '../../app/middleware/auth';
import * as studentController from '../../app/controllers/studentController';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['etudiant']));

// ==================== SESSIONS DISPONIBLES ====================
router.get('/sessions', studentController.getAvailableSessions);

// ==================== REJOINDRE UNE SESSION ====================
router.post('/sessions/verify-code', studentController.verifySessionCode);
router.post('/sessions/verify-qr', studentController.verifyQRCode);
router.post('/sessions/join', studentController.joinSession);

// ==================== PARTICIPATION ====================
router.get('/sessions/:id', studentController.getSessionForStudent);
router.get('/sessions/:id/questions', studentController.getSessionQuestions);
router.post('/sessions/:id/reponses', studentController.submitReponses);
router.post('/sessions/:id/reponses/:questionId', studentController.submitSingleReponse);

// ==================== RÉSULTATS ====================
router.get('/sessions/:id/resultats', studentController.getSessionResults);
router.get('/historique', studentController.getHistorique);
router.get('/profil', studentController.getStudentProfil);


export default router;