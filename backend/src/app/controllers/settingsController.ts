import { Request, Response, NextFunction } from 'express'
import AppDataSource from '../../config/data-source'
import { User } from '../models/User'

interface AuthRequest extends Request { user?: User }

const userRepo = AppDataSource.getRepository(User)

export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepo.findOne({ where: { id: req.user!.id } })
    if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }

    res.json({
      success: true,
      data: {
        notifNouvelleSession: user.notifNouvelleSession,
        notifSessionDemarree: user.notifSessionDemarree,
        notifNotesPubliees:   user.notifNotesPubliees,
        totpEnabled:          user.totpEnabled
      }
    })
  } catch (err) { next(err) }
}

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepo.findOne({ where: { id: req.user!.id } })
    if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }

    const { notifNouvelleSession, notifSessionDemarree, notifNotesPubliees } = req.body

    if (notifNouvelleSession !== undefined) user.notifNouvelleSession = notifNouvelleSession
    if (notifSessionDemarree !== undefined) user.notifSessionDemarree = notifSessionDemarree
    if (notifNotesPubliees   !== undefined) user.notifNotesPubliees   = notifNotesPubliees

    await userRepo.save(user)

    res.json({ success: true, message: 'Préférences mises à jour' })
  } catch (err) { next(err) }
}