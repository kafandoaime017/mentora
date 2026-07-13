import { Router } from 'express'
import { authMiddleware, requireRole } from '../../app/middleware/auth'
import * as ctrl from '../../app/controllers/superadminController'

const router = Router()
const isSuperadmin = [authMiddleware, requireRole(['superadmin'])]

router.get('/stats',                    ...isSuperadmin, ctrl.getStats)
router.get('/ecoles',                   ...isSuperadmin, ctrl.getEcoles)
router.get('/ecoles/:id',               ...isSuperadmin, ctrl.getEcoleById)
router.post('/ecoles',                  ...isSuperadmin, ctrl.createEcole)
router.put('/ecoles/:id',               ...isSuperadmin, ctrl.updateEcole)
router.patch('/ecoles/:id/plan',        ...isSuperadmin, ctrl.updateEcolePlan)
router.delete('/ecoles/:id',            ...isSuperadmin, ctrl.deleteEcole)

router.get('/directeurs',                       ...isSuperadmin, ctrl.getDirecteurs)
router.post('/directeurs/inviter',              ...isSuperadmin, ctrl.inviterDirecteur)
router.patch('/directeurs/:id/toggle',          ...isSuperadmin, ctrl.toggleDirecteurActif)
router.delete('/directeurs/:id',                ...isSuperadmin, ctrl.deleteDirecteur)
router.post('/directeurs/:id/renvoyer-verif',   ...isSuperadmin, ctrl.resendVerificationDirecteur)
router.post('/invitations/:id/renvoyer',        ...isSuperadmin, ctrl.resendDirecteurInvitation)
router.delete('/invitations/:id',               ...isSuperadmin, ctrl.revokeDirecteurInvitation)

router.get('/users',                    ...isSuperadmin, ctrl.getAllUsers)
router.patch('/users/:id/toggle',       ...isSuperadmin, ctrl.toggleUserActif)
router.delete('/users/:id',             ...isSuperadmin, ctrl.deleteUserSuperadmin)

router.get('/abonnements',              ...isSuperadmin, ctrl.getAbonnements)

export default router