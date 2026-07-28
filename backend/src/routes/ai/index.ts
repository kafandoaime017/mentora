// src/routes/ai.routes.ts
import { Router } from 'express'
import { authMiddleware, requireRole } from '../../app/middleware/auth';
import { generateQuestions } from '../../app/controllers/aiController';
import { checkLimiteSessions, checkPlanIA } from '../../app/middleware/checkPlan'

const router = Router()
router.post('/generate-questions',  authMiddleware, requireRole(['professeur', 'directeur']), checkPlanIA, generateQuestions)

export default router