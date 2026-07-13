// src/app/controllers/notificationController.ts
import { Request, Response, NextFunction } from 'express'
import AppDataSource from '../../config/data-source'
import { Notification } from '../models/Notification'
import { User } from '../models/User'

interface AuthRequest extends Request { user?: User }

const notifRepo = AppDataSource.getRepository(Notification)

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id
        const notifications = await notifRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50
        })
        res.json({ success: true, data: notifications })
    } catch (err) { next(err) }
}

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id
        const id     = parseInt(req.params.id as string)
        await notifRepo.update({ id, userId }, { isRead: true })
        res.json({ success: true })
    } catch (err) { next(err) }
}

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id
        await notifRepo.update({ userId }, { isRead: true })
        res.json({ success: true })
    } catch (err) { next(err) }
}

// DELETE /api/notifications
export const clearAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id
        await notifRepo.delete({ userId })
        res.json({ success: true })
    } catch (err) { next(err) }
}

// DELETE /api/notifications/:id
export const deleteOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id
        const id     = parseInt(req.params.id as string)
        await notifRepo.delete({ id, userId })
        res.json({ success: true })
    } catch (err) { next(err) }
}

// Fonction utilitaire pour créer une notif (appelée depuis les autres controllers)
export const createNotification = async (
    userId: number,
    data: {
        titre: string
        message: string
        type: string
        link?: string
        sessionId?: number
    }
) => {
    try {
        const notif = notifRepo.create({
            userId,
            titre:     data.titre,
            message:   data.message,
            type:      data.type as any,
            link:      data.link || null,
            sessionId: data.sessionId || null,
            isRead:    false
        })
        await notifRepo.save(notif)
        return notif
    } catch (err) {
        console.error('Erreur création notification:', err)
        return null
    }
}