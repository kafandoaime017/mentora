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

      return { ...ecole, stats: { nbProfs, nbEtudiants, nbSessions } }
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
    res.json({ success: true, data: ecole })
  } catch (err) { next(err) }
}

export const createEcole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nom, ville, logo } = req.body
    if (!nom) { res.status(400).json({ success: false, message: 'Nom requis' }); return }

    const ecole = ecoleRepo.create({ nom, ville, logo })
    await ecoleRepo.save(ecole)
    res.json({ success: true, message: 'École créée', data: ecole })
  } catch (err) { next(err) }
}

export const updateEcole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id    = parseId(req.params.id)
    const ecole = await ecoleRepo.findOne({ where: { id } })
    if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

    const { nom, ville, logo, isActive } = req.body
    if (nom      !== undefined) ecole.nom      = nom
    if (ville    !== undefined) ecole.ville    = ville
    if (logo     !== undefined) ecole.logo     = logo
    if (isActive !== undefined) ecole.isActive = isActive

    await ecoleRepo.save(ecole)
    res.json({ success: true, message: 'École mise à jour', data: ecole })
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
      select: ['id', 'nom', 'prenom', 'email', 'isActive', 'isVerified', 'createdAt'],
      order: { createdAt: 'DESC' }
    })
    res.json({ success: true, data: directeurs })
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

// ─── Tous les utilisateurs ────────────────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await userRepo.find({
      where: [
        { role: UserRole.DIRECTEUR },
        { role: UserRole.PROFESSEUR },
        { role: UserRole.ETUDIANT }
      ],
      select: ['id', 'nom', 'prenom', 'email', 'role', 'isActive', 'isVerified', 'createdAt'],
      order: { createdAt: 'DESC' }
    })
    res.json({ success: true, data: users })
  } catch (err) { next(err) }
}