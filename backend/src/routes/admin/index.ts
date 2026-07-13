import { Router } from 'express'
import { authMiddleware,requireRole } from '../../app/middleware/auth'
import {
    getDashboard,
    getEcole, updateEcole,
    getFilieres, createFiliere, updateFiliere, deleteFiliere,
    getClasses, createClasse, updateClasse, deleteClasse, generateClasseCode,
    getUsers, toggleUserActive, deleteUser, activateProfesseur,
    getInvitations, sendInvitation, deleteInvitation,
    verifyInvitationToken, registerViaInvitation,
    revokeInvitation,
    resendInvitation,
    adminDeleteSession,
    getAdminSessionDetails,
    getAllSessions,
    verifyInvitationEmail,
    checkEmailVerified,
    getUserById
} from '../../app/controllers/adminController'
import { checkLimiteEtudiants, checkLimiteProfesseurs } from '../../app/middleware/checkPlan'

const router = Router()

const isAdmin = [authMiddleware, requireRole(['directeur', 'superadmin'])]

// Dashboard
router.get('/dashboard', ...isAdmin, getDashboard)

// École
router.get('/ecole',    ...isAdmin, getEcole)
router.put('/ecole',    ...isAdmin, updateEcole)

// Filières
router.get('/filieres',        ...isAdmin, getFilieres)
router.post('/filieres',       ...isAdmin, createFiliere)
router.put('/filieres/:id',    ...isAdmin, updateFiliere)
router.delete('/filieres/:id', ...isAdmin, deleteFiliere)

// Classes
router.get('/classes',                    ...isAdmin, getClasses)
router.post('/classes',                   ...isAdmin, createClasse)
router.put('/classes/:id',                ...isAdmin, updateClasse)
router.delete('/classes/:id',             ...isAdmin, deleteClasse)
router.post('/classes/:id/generate-code', ...isAdmin, generateClasseCode)

// Utilisateurs
router.get('/users',                      ...isAdmin, getUsers)
router.patch('/users/:id/toggle-active',  ...isAdmin, toggleUserActive)
router.delete('/users/:id',               ...isAdmin, deleteUser)
router.get('/users/:id', ...isAdmin, getUserById)

router.patch('/users/:id/activate-prof',  ...isAdmin, activateProfesseur)

// Invitations
router.get('/invitations',        ...isAdmin, getInvitations)
router.post('/invitations', ...isAdmin, (req, res, next) => {
  if (req.body.role === 'etudiant') {
    checkLimiteEtudiants(req, res, next)
  } else if (req.body.role === 'professeur') {
    checkLimiteProfesseurs(req, res, next)
  } else {
    next()
  }
}, sendInvitation)
router.delete('/invitations/:id', ...isAdmin, deleteInvitation)

// Routes publiques (sans auth) — pour la page /auth/invitation
router.get('/invitations/verify',   verifyInvitationToken)
router.post('/invitations/register', registerViaInvitation)
router.post('/invitations/:id/resend', ...isAdmin, resendInvitation)
router.patch('/invitations/:id/revoke', ...isAdmin, revokeInvitation)



// Sessions
router.get('/sessions',        ...isAdmin, getAllSessions)
router.get('/sessions/:id',    ...isAdmin, getAdminSessionDetails)
router.delete('/sessions/:id', ...isAdmin, adminDeleteSession)

router.get('/invitations/verify-email', verifyInvitationEmail)
router.get('/invitations/check-verified', checkEmailVerified)

export default router