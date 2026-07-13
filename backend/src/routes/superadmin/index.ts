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
router.delete('/ecoles/:id',            ...isSuperadmin, ctrl.deleteEcole)
router.get('/directeurs',               ...isSuperadmin, ctrl.getDirecteurs)
router.post('/directeurs/inviter',      ...isSuperadmin, ctrl.inviterDirecteur)
router.patch('/directeurs/:id/toggle',  ...isSuperadmin, ctrl.toggleDirecteurActif)
router.get('/users',                    ...isSuperadmin, ctrl.getAllUsers)

export default router