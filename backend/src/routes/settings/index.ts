import { Router } from 'express'
import { authMiddleware } from '../../app/middleware/auth'
import { getSettings, updateSettings, uploadNotifSonController } from '../../app/controllers/settingsController'
import { uploadNotifSon } from '../../app/middleware/upload'

const router = Router()

router.use(authMiddleware)

router.get('/',  getSettings)
router.put('/',  updateSettings)
router.post('/notif-son', uploadNotifSon.single('son'), uploadNotifSonController)

export default router