import { Request, Response, NextFunction } from 'express'
import speakeasy from 'speakeasy'
import QRCode    from 'qrcode'
import jwt       from 'jsonwebtoken'
import AppDataSource from '../../config/data-source'
import { User, UserRole } from '../models/User'
import { EtudiantProfil } from '../models/EtudiantProfil'

interface AuthRequest extends Request { user?: User }

const userRepo   = AppDataSource.getRepository(User)
const profilRepo = AppDataSource.getRepository(EtudiantProfil)

const safeUser = (user: User) => ({
  id:         user.id,
  nom:        user.nom,
  prenom:     user.prenom,
  email:      user.email,
  role:       user.role,
  avatar:     user.avatar,
  isVerified: user.isVerified,
})

// ── Générer le QR code (avant activation) ────────────────────────────────────
export const setupTotp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const user   = await userRepo.findOne({ where: { id: userId } })

    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' })
      return
    }

    if (user.totpEnabled) {
      res.status(400).json({ success: false, message: '2FA déjà activé' })
      return
    }

    const secret = speakeasy.generateSecret({
      name:   `Mentora (${user.email})`,
      issuer: 'Mentora',
      length: 20
    })

    // Sauvegarder le secret (pas encore activé)
    await userRepo.update(userId, { totpSecret: secret.base32 })

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

    res.json({
      success: true,
      data: {
        secret:  secret.base32,
        qrCode,
        otpauth: secret.otpauth_url
      }
    })
  } catch (err) { next(err) }
}

// ── Activer après scan (confirmer avec un code) ───────────────────────────────
export const enableTotp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId    = req.user!.id
    const { code }  = req.body

    if (!code) {
      res.status(400).json({ success: false, message: 'Code requis' })
      return
    }

    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user?.totpSecret) {
      res.status(400).json({ success: false, message: 'Configurez d\'abord le 2FA' })
      return
    }

    const valid = speakeasy.totp.verify({
      secret:   user.totpSecret,
      encoding: 'base32',
      token:    code,
      window:   1
    })

    if (!valid) {
      res.status(400).json({ success: false, message: 'Code invalide' })
      return
    }

    await userRepo.update(userId, { totpEnabled: true })
    res.json({ success: true, message: '2FA activé avec succès' })
  } catch (err) { next(err) }
}

// ── Désactiver le 2FA ─────────────────────────────────────────────────────────
export const disableTotp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId   = req.user!.id
    const { code } = req.body

    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user?.totpEnabled) {
      res.status(400).json({ success: false, message: '2FA non activé' })
      return
    }

    const valid = speakeasy.totp.verify({
      secret:   user.totpSecret!,
      encoding: 'base32',
      token:    code,
      window:   1
    })

    if (!valid) {
      res.status(400).json({ success: false, message: 'Code invalide' })
      return
    }

    await userRepo.update(userId, { totpEnabled: false, totpSecret: null })
    res.json({ success: true, message: '2FA désactivé' })
  } catch (err) { next(err) }
}

// ── Vérifier le code lors de la connexion ─────────────────────────────────────
export const verifyTotp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tempToken, code } = req.body

    if (!tempToken || !code) {
      res.status(400).json({ success: false, message: 'tempToken et code requis' })
      return
    }

    // Décoder le token temporaire
    let decoded: any
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET as string)
    } catch {
      res.status(401).json({ success: false, message: 'Token expiré ou invalide' })
      return
    }

    if (!decoded.totp_pending) {
      res.status(401).json({ success: false, message: 'Token non valide pour cette opération' })
      return
    }

    const user = await userRepo.findOne({ where: { id: decoded.id } })
    if (!user?.totpEnabled || !user.totpSecret) {
      res.status(400).json({ success: false, message: '2FA non configuré' })
      return
    }

    const valid = speakeasy.totp.verify({
      secret:   user.totpSecret,
      encoding: 'base32',
      token:    code,
      window:   1
    })

    if (!valid) {
      res.status(400).json({ success: false, message: 'Code invalide ou expiré' })
      return
    }

    // Construire le profil complet
    let profilInfo = null
    if (user.role === UserRole.ETUDIANT) {
      const profil = await profilRepo.findOne({
        where: { userId: user.id },
        relations: ['ecole', 'filiere', 'classe']
      })
      profilInfo = {
        type:          'etudiant',
        ecole:         profil?.ecole?.nom,
        ecoleId:       profil?.ecoleId,
        filiere:       profil?.filiere?.nom,
        filiereId:     profil?.filiereId,
        classe:        profil?.classe?.nom,
        classeId:      profil?.classeId,
        dateNaissance: profil?.dateNaissance,
      }
    }

  if (user.role === UserRole.SUPERADMIN) {
  profilInfo = { type: 'superadmin', permissions: 'toutes' }
}

    // Retourner le vrai token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    )

    res.json({
      success: true,
      token,
      user: { ...safeUser(user), profil: profilInfo }
    })
  } catch (err) { next(err) }
}

// ── Statut 2FA de l'utilisateur connecté ─────────────────────────────────────
export const getTotpStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userRepo.findOne({ where: { id: req.user!.id } })
    res.json({
      success: true,
      data: { totpEnabled: user?.totpEnabled || false }
    })
  } catch (err) { next(err) }
}