import { Request, Response, NextFunction } from 'express'
import AppDataSource from '../../config/data-source'
import { User, UserRole } from '../models/User'
import { Ecole } from '../models/Ecole'
import { Filiere } from '../models/Filiere'
import { Classe } from '../models/Classe'
import { Session } from '../models/Session'
import { EtudiantProfil } from '../models/EtudiantProfil'
import { ProfesseurProfil } from '../models/ProfesseurProfil'
import { Invitation, InvitationRole } from '../models/Invitation'
import { v4 as uuidv4 } from 'uuid'
import { envoyerInvitation } from '../services/emailService'
import path from 'path'
import fs from 'fs'

interface AuthRequest extends Request { user?: User }

const parseId = (id: string | string[] | undefined): number => {
  if (typeof id !== 'string') return 0
  const parsed = parseInt(id)
  return isNaN(parsed) ? 0 : parsed
}

const userRepo       = AppDataSource.getRepository(User)
const ecoleRepo      = AppDataSource.getRepository(Ecole)
const sessionRepo    = AppDataSource.getRepository(Session)
const profilRepo     = AppDataSource.getRepository(EtudiantProfil)
const profProfRepo   = AppDataSource.getRepository(ProfesseurProfil)
const invitationRepo = AppDataSource.getRepository(Invitation)
const filiereRepo    = AppDataSource.getRepository(Filiere)
const classeRepo     = AppDataSource.getRepository(Classe)

// Limites par plan — dupliquées ici (source de vérité : stripeController) car superadmin
// doit pouvoir afficher/juger l'usage d'une école sans dépendre d'un appel Stripe.
const LIMITES: Record<string, { maxEtudiants: number, maxProfs: number, maxSessions: number, ia: boolean }> = {
  gratuit: { maxEtudiants: 25,  maxProfs: 5,  maxSessions: 100, ia: false },
  starter: { maxEtudiants: 100, maxProfs: 15, maxSessions: -1,  ia: false },
  pro:     { maxEtudiants: -1,  maxProfs: -1, maxSessions: -1,  ia: true  },
}

// ─── Stats globales ───────────────────────────────────────────────────────────
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalEcoles     = await ecoleRepo.count()
    const totalDirecteurs = await userRepo.count({ where: { role: UserRole.DIRECTEUR } })
    const totalProfs      = await userRepo.count({ where: { role: UserRole.PROFESSEUR } })
    const totalEtudiants  = await userRepo.count({ where: { role: UserRole.ETUDIANT } })
    const totalSessions   = await sessionRepo.count()
    const totalUsers      = totalDirecteurs + totalProfs + totalEtudiants

    res.json({
      success: true,
      data: { totalEcoles, totalDirecteurs, totalProfs, totalEtudiants, totalSessions, totalUsers }
    })
  } catch (err) { next(err) }
}

// ─── Gestion écoles ───────────────────────────────────────────────────────────
export const getEcoles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoles = await ecoleRepo.find({
      relations: ['filieres', 'filieres.classes'],
      order: { nom: 'ASC' }
    })

    const ecolesAvecStats = await Promise.all(ecoles.map(async (ecole) => {
      const nbProfs     = await profProfRepo.count({ where: { ecoleId: ecole.id } })
      const nbEtudiants = await profilRepo.count({ where: { ecoleId: ecole.id } })
      const nbSessions  = await sessionRepo
        .createQueryBuilder('s')
        .innerJoin('s.filiere', 'f')
        .where('f.ecoleId = :ecoleId', { ecoleId: ecole.id })
        .getCount()
      const directeur = await userRepo.findOne({
        where: { role: UserRole.DIRECTEUR, ecoleId: ecole.id },
        select: ['id', 'nom', 'prenom', 'email', 'isVerified']
      })

      return {
        ...ecole,
        stats: { nbProfs, nbEtudiants, nbSessions },
        limites: LIMITES[ecole.plan] || LIMITES.gratuit,
        directeur
      }
    }))

    res.json({ success: true, data: ecolesAvecStats })
  } catch (err) { next(err) }
}

export const getEcoleById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id    = parseId(req.params.id)
    const ecole = await ecoleRepo.findOne({
      where: { id },
      relations: ['filieres', 'filieres.classes']
    })
    if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

    const [directeur, profs, etudiants, nbSessions] = await Promise.all([
      userRepo.findOne({
        where: { role: UserRole.DIRECTEUR, ecoleId: id },
        select: ['id', 'nom', 'prenom', 'email', 'isActive', 'isVerified', 'createdAt']
      }),
      profProfRepo.find({ where: { ecoleId: id }, relations: ['user', 'filiere'] }),
      profilRepo.find({ where: { ecoleId: id }, relations: ['user', 'filiere', 'classe'] }),
      sessionRepo.createQueryBuilder('s').innerJoin('s.filiere', 'f').where('f.ecoleId = :id', { id }).getCount()
    ])

    const profsList = profs.map(p => ({
      id: p.userId, nom: p.user?.nom, prenom: p.user?.prenom, email: p.user?.email,
      statut: p.statut, filiere: p.filiere?.nom, isActive: p.user?.isActive
    }))
    const etudiantsList = etudiants.map(e => ({
      id: e.userId, nom: e.user?.nom, prenom: e.user?.prenom, email: e.user?.email,
      filiere: e.filiere?.nom, classe: e.classe?.nom, isActive: e.user?.isActive
    }))

    res.json({
      success: true,
      data: {
        ...ecole,
        directeur,
        limites: LIMITES[ecole.plan] || LIMITES.gratuit,
        stats: { nbProfs: profs.length, nbEtudiants: etudiants.length, nbSessions },
        profs: profsList,
        etudiants: etudiantsList
      }
    })
  } catch (err) { next(err) }
}

export const createEcole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nom, ville, logo, adresse, telephone } = req.body
    if (!nom) { res.status(400).json({ success: false, message: 'Nom requis' }); return }

    const ecole = ecoleRepo.create({ nom, ville, logo, adresse, telephone })
    await ecoleRepo.save(ecole)
    res.json({ success: true, message: 'École créée', data: ecole })
  } catch (err) { next(err) }
}

export const updateEcole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id    = parseId(req.params.id)
    const ecole = await ecoleRepo.findOne({ where: { id } })
    if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

    const { nom, ville, logo, adresse, telephone, isActive } = req.body
    if (nom       !== undefined) ecole.nom       = nom
    if (ville     !== undefined) ecole.ville     = ville
    if (logo      !== undefined) ecole.logo      = logo
    if (adresse   !== undefined) ecole.adresse   = adresse
    if (telephone !== undefined) ecole.telephone = telephone
    if (isActive  !== undefined) ecole.isActive  = isActive

    await ecoleRepo.save(ecole)
    res.json({ success: true, message: 'École mise à jour', data: ecole })
  } catch (err) { next(err) }
}

// Upload du logo d'une école — fichier envoyé séparément (multipart) après
// création/modification des champs texte, comme pour l'avatar utilisateur.
export const uploadEcoleLogo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id    = parseId(req.params.id)
    const ecole = await ecoleRepo.findOne({ where: { id } })
    if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

    const file = (req as any).file
    if (!file) { res.status(400).json({ success: false, message: 'Aucun fichier uploadé' }); return }

    const originalExt = path.extname(file.originalname)
    const filename     = `ecole-${id}-${Date.now()}${originalExt}`
    const uploadDir    = path.join(__dirname, '../../public/uploads/ecoles')
    const outputPath   = path.join(uploadDir, filename)

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    fs.renameSync(file.path, outputPath)

    ecole.logo = `/uploads/ecoles/${filename}`
    await ecoleRepo.save(ecole)

    res.json({ success: true, message: 'Logo mis à jour', data: ecole })
  } catch (err) { next(err) }
}

// Override manuel du plan d'une école par le superadmin (hors circuit Stripe —
// utile pour offrir un plan, corriger une anomalie de facturation, etc.)
export const updateEcolePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id    = parseId(req.params.id)
    const ecole = await ecoleRepo.findOne({ where: { id } })
    if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

    const { plan, plan_expire_at } = req.body
    if (!['gratuit', 'starter', 'pro'].includes(plan)) {
      res.status(400).json({ success: false, message: 'Plan invalide' }); return
    }

    ecole.plan = plan
    ecole.plan_expire_at = plan === 'gratuit' ? null : (plan_expire_at ? new Date(plan_expire_at) : ecole.plan_expire_at)

    await ecoleRepo.save(ecole)
    res.json({ success: true, message: `Plan mis à jour : ${plan}`, data: ecole })
  } catch (err) { next(err) }
}

export const deleteEcole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id    = parseId(req.params.id)
    const ecole = await ecoleRepo.findOne({ where: { id } })
    if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

    await ecoleRepo.delete(id)
    res.json({ success: true, message: 'École supprimée' })
  } catch (err) { next(err) }
}

// ─── Gestion directeurs ───────────────────────────────────────────────────────
export const getDirecteurs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const directeurs = await userRepo.find({
      where: { role: UserRole.DIRECTEUR },
      select: ['id', 'nom', 'prenom', 'email', 'isActive', 'isVerified', 'createdAt', 'ecoleId'],
      order: { createdAt: 'DESC' }
    })

    // Invitations envoyées mais pas encore transformées en compte (le directeur
    // n'a pas encore cliqué le lien / créé son mot de passe)
    const invitationsBrutes = await invitationRepo.find({
      where: { role: InvitationRole.DIRECTEUR, used: false },
      relations: ['ecole'],
      order: { createdAt: 'DESC' }
    })
    const maintenant = new Date()
    const invitations = invitationsBrutes.map(inv => ({
      id: inv.id, nom: inv.nom, prenom: inv.prenom, email: inv.email,
      ecole: inv.ecole?.nom, ecoleId: inv.ecoleId,
      expiresAt: inv.expiresAt,
      expiree: new Date(inv.expiresAt) < maintenant
    }))

    const ecoles = await ecoleRepo.find({ select: ['id', 'nom'] })
    const ecoleParId: Record<number, string> = {}
    ecoles.forEach(e => { ecoleParId[e.id] = e.nom })
    const directeursAvecEcole = directeurs.map(d => ({ ...d, ecole: d.ecoleId ? ecoleParId[d.ecoleId] : null }))

    res.json({ success: true, data: { directeurs: directeursAvecEcole, invitations } })
  } catch (err) { next(err) }
}

export const resendDirecteurInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id)
    const invitation = await invitationRepo.findOne({ where: { id, role: InvitationRole.DIRECTEUR }, relations: ['ecole'] })
    if (!invitation) { res.status(404).json({ success: false, message: 'Invitation non trouvée' }); return }
    if (invitation.used) { res.status(400).json({ success: false, message: 'Invitation déjà utilisée' }); return }

    invitation.token     = uuidv4()
    invitation.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    await invitationRepo.save(invitation)

    const invitationUrl = `${process.env.FRONTEND_URL}/auth/invitation?token=${invitation.token}`
    await envoyerInvitation(invitation.email, invitation.prenom, invitation.nom, 'directeur', '', null, invitation.ecole?.nom || '', invitationUrl, invitation.expiresAt)

    res.json({ success: true, message: 'Invitation renvoyée' })
  } catch (err) { next(err) }
}

export const revokeDirecteurInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id)
    const invitation = await invitationRepo.findOne({ where: { id, role: InvitationRole.DIRECTEUR } })
    if (!invitation) { res.status(404).json({ success: false, message: 'Invitation non trouvée' }); return }
    if (invitation.used) { res.status(400).json({ success: false, message: 'Invitation déjà utilisée' }); return }

    await invitationRepo.delete(id)
    res.json({ success: true, message: 'Invitation annulée' })
  } catch (err) { next(err) }
}

export const resendVerificationDirecteur = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id   = parseId(req.params.id)
    const user = await userRepo.findOne({ where: { id, role: UserRole.DIRECTEUR } })
    if (!user) { res.status(404).json({ success: false, message: 'Directeur non trouvé' }); return }
    if (user.isVerified) { res.status(400).json({ success: false, message: 'Ce compte est déjà vérifié' }); return }

    const verificationCode    = Math.floor(100000 + Math.random() * 900000).toString()
    user.verificationCode        = verificationCode
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000)
    await userRepo.save(user)

    const { envoyerVerificationInvitation } = require('../services/emailService')
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-invitation?code=${verificationCode}&email=${encodeURIComponent(user.email)}`
    await envoyerVerificationInvitation(user.email, user.prenom, verificationUrl)

    res.json({ success: true, message: 'Email de vérification renvoyé' })
  } catch (err) { next(err) }
}

export const deleteDirecteur = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id   = parseId(req.params.id)
    const user = await userRepo.findOne({ where: { id, role: UserRole.DIRECTEUR } })
    if (!user) { res.status(404).json({ success: false, message: 'Directeur non trouvé' }); return }

    await userRepo.delete(id)
    res.json({ success: true, message: 'Directeur supprimé' })
  } catch (err) { next(err) }
}

export const inviterDirecteur = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, nom, prenom, ecoleId } = req.body
    if (!email || !nom || !prenom || !ecoleId) {
      res.status(400).json({ success: false, message: 'Tous les champs sont requis' }); return
    }

    const existant = await userRepo.findOne({ where: { email } })
    if (existant) {
      res.status(409).json({ success: false, message: 'Un compte avec cet email existe déjà' }); return
    }

    const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
    if (!ecole) {
      res.status(404).json({ success: false, message: 'École non trouvée' }); return
    }

    // Même mécanisme que les invitations prof/étudiant (table Invitation),
    // pour que le lien envoyé par email pointe vers un token réellement vérifiable.
    const existingInvit = await invitationRepo.findOne({ where: { email, used: false } })
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    let token: string
    if (existingInvit) {
      token                   = uuidv4()
      existingInvit.token     = token
      existingInvit.expiresAt = expiresAt
      existingInvit.nom       = nom
      existingInvit.prenom    = prenom
      existingInvit.ecoleId   = ecoleId
      await invitationRepo.save(existingInvit)
    } else {
      token = uuidv4()
      const invitation = invitationRepo.create({
        email, nom, prenom,
        role:      InvitationRole.DIRECTEUR,
        filiereId: null,
        classeId:  null,
        ecoleId,
        token,
        expiresAt
      })
      await invitationRepo.save(invitation)
    }

    const invitationUrl = `${process.env.FRONTEND_URL}/auth/invitation?token=${token}`
    await envoyerInvitation(email, prenom, nom, 'directeur', '', null, ecole.nom, invitationUrl, expiresAt)

    res.json({ success: true, message: 'Invitation envoyée au directeur', data: { token, expiresAt, invitationUrl } })
  } catch (err) { next(err) }
}

// Invitation générique — permet au superadmin de créer/inviter un utilisateur de
// n'importe quel rôle (étudiant, professeur, directeur) dans n'importe quelle école,
// contrairement aux flux "directeur" qui sont scopés à leur propre req.user.ecoleId.
export const inviterUtilisateur = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, nom, prenom, role, ecoleId, filiereId, classeId } = req.body

    if (!email || !nom || !prenom || !role || !ecoleId) {
      res.status(400).json({ success: false, message: 'Tous les champs sont requis' }); return
    }
    if (![InvitationRole.DIRECTEUR, InvitationRole.PROFESSEUR, InvitationRole.ETUDIANT].includes(role)) {
      res.status(400).json({ success: false, message: 'Rôle invalide' }); return
    }
    if (role === InvitationRole.PROFESSEUR && !filiereId) {
      res.status(400).json({ success: false, message: 'La filière est requise pour un professeur' }); return
    }
    if (role === InvitationRole.ETUDIANT && (!filiereId || !classeId)) {
      res.status(400).json({ success: false, message: 'La filière et la classe sont requises pour un étudiant' }); return
    }

    const existant = await userRepo.findOne({ where: { email } })
    if (existant) { res.status(409).json({ success: false, message: 'Un compte avec cet email existe déjà' }); return }

    const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
    if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

    if (filiereId) {
      const filiere = await filiereRepo.findOne({ where: { id: filiereId, ecoleId } })
      if (!filiere) { res.status(404).json({ success: false, message: 'Filière introuvable pour cette école' }); return }
    }
    if (classeId) {
      const classe = await classeRepo.findOne({ where: { id: classeId, filiereId } })
      if (!classe) { res.status(404).json({ success: false, message: 'Classe introuvable pour cette filière' }); return }
    }

    // Vérification des limites du plan de l'école
    const limites = LIMITES[ecole.plan] || LIMITES.gratuit
    if (role === InvitationRole.ETUDIANT && limites.maxEtudiants !== -1) {
      const count = await profilRepo.count({ where: { ecoleId } })
      if (count >= limites.maxEtudiants) {
        res.status(403).json({ success: false, message: `Limite du plan ${ecole.plan} atteinte (${limites.maxEtudiants} étudiants max)` }); return
      }
    }
    if (role === InvitationRole.PROFESSEUR && limites.maxProfs !== -1) {
      const count = await profProfRepo.count({ where: { ecoleId } })
      if (count >= limites.maxProfs) {
        res.status(403).json({ success: false, message: `Limite du plan ${ecole.plan} atteinte (${limites.maxProfs} professeurs max)` }); return
      }
    }

    const existingInvit = await invitationRepo.findOne({ where: { email, used: false } })
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    let token: string
    if (existingInvit) {
      token                   = uuidv4()
      existingInvit.token     = token
      existingInvit.expiresAt = expiresAt
      existingInvit.nom       = nom
      existingInvit.prenom    = prenom
      existingInvit.role      = role
      existingInvit.ecoleId   = ecoleId
      existingInvit.filiereId = filiereId || null
      existingInvit.classeId  = classeId || null
      await invitationRepo.save(existingInvit)
    } else {
      token = uuidv4()
      const invitation = invitationRepo.create({
        email, nom, prenom, role,
        filiereId: filiereId || null,
        classeId:  classeId || null,
        ecoleId,
        token,
        expiresAt
      })
      await invitationRepo.save(invitation)
    }

    const filiereNom = filiereId ? (await filiereRepo.findOne({ where: { id: filiereId } }))?.nom || '' : ''
    const classeNom  = classeId  ? (await classeRepo.findOne({ where: { id: classeId } }))?.nom || null : null

    const invitationUrl = `${process.env.FRONTEND_URL}/auth/invitation?token=${token}`
    await envoyerInvitation(email, prenom, nom, role, filiereNom, classeNom, ecole.nom, invitationUrl, expiresAt)

    res.json({ success: true, message: 'Invitation envoyée', data: { token, expiresAt, invitationUrl } })
  } catch (err) { next(err) }
}

export const toggleDirecteurActif = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id   = parseId(req.params.id)
    const user = await userRepo.findOne({ where: { id, role: UserRole.DIRECTEUR } })
    if (!user) { res.status(404).json({ success: false, message: 'Directeur non trouvé' }); return }

    user.isActive = !user.isActive
    await userRepo.save(user)

    res.json({
      success: true,
      message: user.isActive ? 'Compte activé' : 'Compte désactivé',
      data: { isActive: user.isActive }
    })
  } catch (err) { next(err) }
}

// ─── Abonnements / Plans des écoles ───────────────────────────────────────────
export const getAbonnements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoles = await ecoleRepo.find({ order: { nom: 'ASC' } })

    const maintenant = new Date()
    const data = ecoles.map(ecole => {
      const expireAt    = ecole.plan_expire_at ? new Date(ecole.plan_expire_at) : null
      const joursRestants = expireAt ? Math.ceil((expireAt.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24)) : null
      const expireBientot = joursRestants !== null && joursRestants <= 7 && joursRestants >= 0
      const expire      = joursRestants !== null && joursRestants < 0

      return {
        id: ecole.id,
        nom: ecole.nom,
        ville: ecole.ville,
        isActive: ecole.isActive,
        plan: ecole.plan,
        plan_expire_at: ecole.plan_expire_at,
        joursRestants,
        expireBientot,
        expire,
        aAbonnementStripe: !!ecole.stripe_subscription_id
      }
    })

    const repartition = {
      gratuit: data.filter(e => e.plan === 'gratuit').length,
      starter: data.filter(e => e.plan === 'starter').length,
      pro:     data.filter(e => e.plan === 'pro').length
    }

    const expirationsProches = data.filter(e => e.expireBientot)

    res.json({ success: true, data: { ecoles: data, repartition, expirationsProches } })
  } catch (err) { next(err) }
}

// ─── Tous les utilisateurs ────────────────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await userRepo.find({
      where: [
        { role: UserRole.DIRECTEUR },
        { role: UserRole.PROFESSEUR },
        { role: UserRole.ETUDIANT }
      ],
      select: ['id', 'nom', 'prenom', 'email', 'role', 'isActive', 'isVerified', 'createdAt', 'avatar'],
      order: { createdAt: 'DESC' }
    })
    res.json({ success: true, data: users })
  } catch (err) { next(err) }
}

// Actions génériques superadmin — s'appliquent à n'importe quel utilisateur non-superadmin,
// sans restriction d'école (contrairement aux versions "directeur" dans adminController).
export const toggleUserActif = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id   = parseId(req.params.id)
    const user = await userRepo.findOne({ where: { id } })
    if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }
    if (user.role === UserRole.SUPERADMIN) {
      res.status(403).json({ success: false, message: 'Impossible de modifier un superadmin' }); return
    }

    user.isActive = !user.isActive
    await userRepo.save(user)

    res.json({ success: true, message: user.isActive ? 'Compte activé' : 'Compte désactivé', data: { isActive: user.isActive } })
  } catch (err) { next(err) }
}

export const deleteUserSuperadmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id   = parseId(req.params.id)
    const user = await userRepo.findOne({ where: { id } })
    if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }
    if (user.role === UserRole.SUPERADMIN) {
      res.status(403).json({ success: false, message: 'Impossible de supprimer un superadmin' }); return
    }

    await userRepo.delete(id)
    res.json({ success: true, message: 'Utilisateur supprimé' })
  } catch (err) { next(err) }
}

// ─── Administration — gestion des comptes superadmin ─────────────────────────
// Règle de sécurité stricte : un superadmin ne peut jamais désactiver, révoquer
// ou supprimer SON PROPRE compte via ces endpoints (uniquement les autres).

export const getSuperadmins = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const superadmins = await userRepo.find({
      where: { role: UserRole.SUPERADMIN },
      select: ['id', 'nom', 'prenom', 'email', 'isActive', 'isVerified', 'createdAt'],
      order: { createdAt: 'ASC' }
    })

    const invitationsBrutes = await invitationRepo.find({
      where: { role: InvitationRole.SUPERADMIN, used: false },
      order: { createdAt: 'DESC' }
    })
    const maintenant = new Date()
    const invitations = invitationsBrutes.map(inv => ({
      id: inv.id, nom: inv.nom, prenom: inv.prenom, email: inv.email,
      expiresAt: inv.expiresAt,
      expiree: new Date(inv.expiresAt) < maintenant
    }))

    res.json({ success: true, data: { superadmins, invitations, moi: req.user!.id } })
  } catch (err) { next(err) }
}

export const inviterSuperadmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, nom, prenom } = req.body
    if (!email || !nom || !prenom) {
      res.status(400).json({ success: false, message: 'Tous les champs sont requis' }); return
    }

    const existant = await userRepo.findOne({ where: { email } })
    if (existant) { res.status(409).json({ success: false, message: 'Un compte avec cet email existe déjà' }); return }

    const existingInvit = await invitationRepo.findOne({ where: { email, used: false } })
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    let token: string
    if (existingInvit) {
      token                   = uuidv4()
      existingInvit.token     = token
      existingInvit.expiresAt = expiresAt
      existingInvit.nom       = nom
      existingInvit.prenom    = prenom
      existingInvit.role      = InvitationRole.SUPERADMIN
      existingInvit.ecoleId   = null
      existingInvit.filiereId = null
      existingInvit.classeId  = null
      await invitationRepo.save(existingInvit)
    } else {
      token = uuidv4()
      const invitation = invitationRepo.create({
        email, nom, prenom,
        role: InvitationRole.SUPERADMIN,
        filiereId: null, classeId: null, ecoleId: null,
        token, expiresAt
      })
      await invitationRepo.save(invitation)
    }

    const invitationUrl = `${process.env.FRONTEND_URL}/auth/invitation?token=${token}`
    await envoyerInvitation(email, prenom, nom, 'superadmin', '', null, 'Mentora', invitationUrl, expiresAt)

    res.json({ success: true, message: 'Invitation envoyée', data: { token, expiresAt, invitationUrl } })
  } catch (err) { next(err) }
}

export const resendSuperadminInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id)
    const invitation = await invitationRepo.findOne({ where: { id, role: InvitationRole.SUPERADMIN } })
    if (!invitation) { res.status(404).json({ success: false, message: 'Invitation non trouvée' }); return }
    if (invitation.used) { res.status(400).json({ success: false, message: 'Invitation déjà utilisée' }); return }

    invitation.token     = uuidv4()
    invitation.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
    await invitationRepo.save(invitation)

    const invitationUrl = `${process.env.FRONTEND_URL}/auth/invitation?token=${invitation.token}`
    await envoyerInvitation(invitation.email, invitation.prenom, invitation.nom, 'superadmin', '', null, 'Mentora', invitationUrl, invitation.expiresAt)

    res.json({ success: true, message: 'Invitation renvoyée' })
  } catch (err) { next(err) }
}

export const revokeSuperadminInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id)
    const invitation = await invitationRepo.findOne({ where: { id, role: InvitationRole.SUPERADMIN } })
    if (!invitation) { res.status(404).json({ success: false, message: 'Invitation non trouvée' }); return }
    if (invitation.used) { res.status(400).json({ success: false, message: 'Invitation déjà utilisée' }); return }

    await invitationRepo.delete(id)
    res.json({ success: true, message: 'Invitation annulée' })
  } catch (err) { next(err) }
}

export const toggleSuperadminActif = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id)
    if (id === req.user!.id) {
      res.status(403).json({ success: false, message: 'Vous ne pouvez pas modifier votre propre compte' }); return
    }

    const user = await userRepo.findOne({ where: { id, role: UserRole.SUPERADMIN } })
    if (!user) { res.status(404).json({ success: false, message: 'Superadmin non trouvé' }); return }

    user.isActive = !user.isActive
    await userRepo.save(user)

    res.json({ success: true, message: user.isActive ? 'Compte activé' : 'Compte désactivé', data: { isActive: user.isActive } })
  } catch (err) { next(err) }
}

export const deleteSuperadmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id)
    if (id === req.user!.id) {
      res.status(403).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' }); return
    }

    const user = await userRepo.findOne({ where: { id, role: UserRole.SUPERADMIN } })
    if (!user) { res.status(404).json({ success: false, message: 'Superadmin non trouvé' }); return }

    await userRepo.delete(id)
    res.json({ success: true, message: 'Superadmin supprimé' })
  } catch (err) { next(err) }
}