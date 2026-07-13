import { Router } from 'express'
import { authMiddleware } from '../../app/middleware/auth';
import { setupTotp, verifyTotp, getTotpStatus, enableTotp, disableTotp } from '../../app/controllers/totpController';
const router = Router()

// Publique — pendant le login
router.post('/verify', verifyTotp)

// Protégées — gestion depuis le profil
router.get('/status',   authMiddleware, getTotpStatus)
router.post('/setup',   authMiddleware, setupTotp)
router.post('/enable',  authMiddleware, enableTotp)
router.post('/disable', authMiddleware, disableTotp)

export default router