import { Router } from 'express';
import * as refController from '../../app/controllers/referenceController';

const router = Router();

// GET /api/ref/ecoles?search=montaigne
router.get('/ecoles', refController.listEcoles);

// GET /api/ref/ecoles/:ecoleId/filieres
router.get('/ecoles/:ecoleId/filieres', refController.listFilieres);

// GET /api/ref/filieres/:filiereId/classes
router.get('/filieres/:filiereId/classes', refController.listClasses);

export default router;