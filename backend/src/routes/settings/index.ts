import { Router } from 'express'
import { authMiddleware } from '../../app/middleware/auth'
import { getSettings, updateSettings } from '../../app/controllers/settingsController'

const router = Router()

router.use(authMiddleware)

router.get('/',  getSettings)
router.put('/',  updateSettings)

export default router