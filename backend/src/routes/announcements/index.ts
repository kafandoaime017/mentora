import { Router } from 'express'
import { authMiddleware, requireRole } from '../../app/middleware/auth'
import { getAnnoncesActives, marquerAnnonceVue, repondreAnnonce } from '../../app/controllers/announcementController'

const router = Router()

router.use(authMiddleware)
router.use(requireRole(['etudiant', 'professeur']))

router.get('/actives', getAnnoncesActives)
router.post('/:id/vue', marquerAnnonceVue)
router.post('/:id/repondre', repondreAnnonce)

export default router
