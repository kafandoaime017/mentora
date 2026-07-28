import { Router } from 'express'
import { authMiddleware, requireRole } from '../../app/middleware/auth'
import * as ctrl from '../../app/controllers/superadminController'
import { getAuditLogsGlobal } from '../../app/controllers/auditLogController'
import { uploadEcoleLogo } from '../../app/middleware/upload'

const router = Router()
const isSuperadmin = [authMiddleware, requireRole(['superadmin'])]

router.get('/stats',                    ...isSuperadmin, ctrl.getStats)
router.get('/ecoles',                   ...isSuperadmin, ctrl.getEcoles)
router.get('/ecoles/:id',               ...isSuperadmin, ctrl.getEcoleById)
router.post('/ecoles',                  ...isSuperadmin, ctrl.createEcole)
router.put('/ecoles/:id',               ...isSuperadmin, ctrl.updateEcole)
router.post('/ecoles/:id/logo',         ...isSuperadmin, uploadEcoleLogo.single('logo'), ctrl.uploadEcoleLogo)
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
router.post('/users/inviter',           ...isSuperadmin, ctrl.inviterUtilisateur)

router.get('/abonnements',              ...isSuperadmin, ctrl.getAbonnements)

router.get('/audit-logs',               ...isSuperadmin, getAuditLogsGlobal)

// Administration — gestion des comptes superadmin (auto-protection : impossible
// de se désactiver/révoquer/supprimer soi-même, appliqué dans le contrôleur)
router.get('/administration/superadmins',                ...isSuperadmin, ctrl.getSuperadmins)
router.post('/administration/superadmins/inviter',       ...isSuperadmin, ctrl.inviterSuperadmin)
router.patch('/administration/superadmins/:id/toggle',   ...isSuperadmin, ctrl.toggleSuperadminActif)
router.delete('/administration/superadmins/:id',         ...isSuperadmin, ctrl.deleteSuperadmin)
router.post('/administration/invitations/:id/renvoyer',  ...isSuperadmin, ctrl.resendSuperadminInvitation)
router.delete('/administration/invitations/:id',         ...isSuperadmin, ctrl.revokeSuperadminInvitation)

export default router