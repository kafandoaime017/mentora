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
        notifSonActif:        user.notifSonActif,
        notifSonUrl:          user.notifSonUrl,
        totpEnabled:          user.totpEnabled
      }
    })
  } catch (err) { next(err) }
}

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepo.findOne({ where: { id: req.user!.id } })
    if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }

    const { notifNouvelleSession, notifSessionDemarree, notifNotesPubliees, notifSonActif, notifSonUrl } = req.body

    if (notifNouvelleSession !== undefined) user.notifNouvelleSession = notifNouvelleSession
    if (notifSessionDemarree !== undefined) user.notifSessionDemarree = notifSessionDemarree
    if (notifNotesPubliees   !== undefined) user.notifNotesPubliees   = notifNotesPubliees
    if (notifSonActif       !== undefined)  user.notifSonActif        = notifSonActif
    // notifSonUrl : uniquement pour la remise à zéro (null) - l'upload d'un
    // nouveau son passe par uploadNotifSonController, qui seul peut y écrire une URL.
    if (notifSonUrl === null) user.notifSonUrl = null

    await userRepo.save(user)

    res.json({ success: true, message: 'Préférences mises à jour' })
  } catch (err) { next(err) }
}

// POST /settings/notif-son : upload d'un fichier son personnalisé, appliqué
// immédiatement (même convention que l'avatar : l'upload ET l'enregistrement
// se font en un seul appel).
export const uploadNotifSonController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepo.findOne({ where: { id: req.user!.id } })
    if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }

    const file = (req as any).file
    if (!file) { res.status(400).json({ success: false, message: 'Aucun fichier son fourni' }); return }

    user.notifSonUrl = `/uploads/sons/${file.filename}`
    await userRepo.save(user)

    res.json({ success: true, message: 'Son de notification mis à jour', data: { notifSonUrl: user.notifSonUrl } })
  } catch (err) { next(err) }
}