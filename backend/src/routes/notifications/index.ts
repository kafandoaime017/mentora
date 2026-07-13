// src/routes/notification.routes.ts
import { Router } from 'express'
import { authMiddleware, requireRole } from '../../app/middleware/auth';
import { clearAll, deleteOne, getNotifications, markAllAsRead, markAsRead } from '../../app/controllers/notificationController'


const router = Router()
router.get('/',              authMiddleware, getNotifications)
router.patch('/read-all',    authMiddleware, markAllAsRead)
router.patch('/:id/read',    authMiddleware, markAsRead)
router.delete('/',           authMiddleware, clearAll)
router.delete('/:id',        authMiddleware, deleteOne)

export default router