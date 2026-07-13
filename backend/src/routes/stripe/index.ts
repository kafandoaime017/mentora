import { Router } from 'express'
import { authMiddleware, requireRole } from '../../app/middleware/auth'
import { createCheckoutSession, createPortalSession, getAbonnement } from '../../app/controllers/stripeController'

const router = Router()

// ← Plus de route webhook ici — elle est dans server.ts
router.post('/checkout', authMiddleware, requireRole(['directeur']), createCheckoutSession)
router.post('/portal',   authMiddleware, requireRole(['directeur']), createPortalSession)
router.get('/abonnement', authMiddleware, requireRole(['directeur']), getAbonnement)

export default router