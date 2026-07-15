import { Request, Response, NextFunction } from 'express'
import AppDataSource from '../../config/data-source'
import { User, UserRole } from '../models/User'
import { EtudiantProfil } from '../models/EtudiantProfil'
import { ProfesseurProfil } from '../models/ProfesseurProfil'
import { Ecole } from '../models/Ecole'
import { Filiere } from '../models/Filiere'
import { Classe } from '../models/Classe'
import { Session, SessionStatus } from '../models/Session'
import { Invitation, InvitationRole } from '../models/Invitation'
import { v4 as uuidv4 } from 'uuid'
import { envoyerInvitation } from '../services/emailService'
import { SessionParticipant, ParticipantStatus } from '../models/SessionParticipant'
import { Question } from '../models/Question'
import { createNotification } from './notificationController'
import { NotificationType } from '../models/Notification'
import { getSocketIO } from '../../socket'
import { autoCloseSession } from './teacherController'
import { envoyerEmailNotesPubliees } from '../services/emailService'
import PDFDocument from 'pdfkit'
import path from 'path'
import fs from 'fs'
import { logAudit, getClientIp } from '../services/auditService'

interface AuthRequest extends Request { user?: User }

const userRepo        = AppDataSource.getRepository(User)
const etudiantRepo    = AppDataSource.getRepository(EtudiantProfil)
const professeurRepo  = AppDataSource.getRepository(ProfesseurProfil)
const ecoleRepo       = AppDataSource.getRepository(Ecole)
const filiereRepo     = AppDataSource.getRepository(Filiere)
const classeRepo      = AppDataSource.getRepository(Classe)
const invitationRepo  = AppDataSource.getRepository(Invitation)
const sessionRepo     = AppDataSource.getRepository(Session)
const participantRepo = AppDataSource.getRepository(SessionParticipant)
const questionRepo    = AppDataSource.getRepository(Question)

const getEcoleId = (req: AuthRequest, res: Response): number | null => {
    const ecoleId = req.user!.ecoleId
    if (!ecoleId) {
        res.status(400).json({ success: false, message: 'Directeur non associé à une école' })
        return null
    }
    return ecoleId
}

// Raccourci pour journaliser une action directeur (audit de conformité)
const audit = (req: AuthRequest, action: string, cibleType?: string, cibleId?: number, details?: any) => {
    logAudit({
        ecoleId: req.user!.ecoleId,
        userId: req.user!.id,
        userNom: `${req.user!.prenom} ${req.user!.nom}`,
        userRole: req.user!.role,
        action, cibleType, cibleId, details,
        ip: getClientIp(req)
    })
}

// ==================== DASHBOARD ====================

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const [totalEtudiants, totalProfesseurs, totalFilieres, invitationsEnAttente, professeursPending] = await Promise.all([
            etudiantRepo.count({ where: { ecoleId } }),
            professeurRepo.count({ where: { ecoleId } }),
            filiereRepo.count({ where: { ecoleId, isActive: true } }),
            invitationRepo.count({ where: { ecoleId, used: false } }),
            professeurRepo.count({ where: { ecoleId, statut: 'pending' } })
        ])

        const totalClasses = await classeRepo
            .createQueryBuilder('c')
            .innerJoin('c.filiere', 'f')
            .where('f.ecoleId = :ecoleId', { ecoleId })
            .andWhere('c.isActive = true')
            .getCount()

        const derniersInscrits = await userRepo
            .createQueryBuilder('u')
            .leftJoin('u.etudiantProfil', 'ep')
            .leftJoin('u.professeurProfil', 'pp')
            .where('ep.ecoleId = :ecoleId OR pp.ecoleId = :ecoleId', { ecoleId })
            .orderBy('u.createdAt', 'DESC')
            .take(5)
            .getMany()

        res.json({
            success: true,
            data: {
                stats: { totalEtudiants, totalProfesseurs, totalFilieres, totalClasses, invitationsEnAttente, professeursPending },
                derniersInscrits: derniersInscrits.map(u => ({
                    id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, role: u.role, createdAt: u.createdAt
                }))
            }
        })
    } catch (err) { next(err) }
}

// ==================== ÉCOLE ====================

export const getEcole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const ecole = await ecoleRepo.findOne({
            where: { id: ecoleId },
            relations: ['filieres', 'filieres.classes']
        })
        res.json({ success: true, data: ecole })
    } catch (err) { next(err) }
}

export const updateEcole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
        if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

        const { nom, ville, logo, adresse, telephone } = req.body
        if (nom)             ecole.nom       = nom
        if (ville)           ecole.ville     = ville
        if (logo)            ecole.logo      = logo
        if (adresse !== undefined)   ecole.adresse   = adresse
        if (telephone !== undefined) ecole.telephone = telephone

        await ecoleRepo.save(ecole)
        audit(req, 'modification_ecole', 'ecole', ecole.id)
        res.json({ success: true, data: ecole })
    } catch (err) { next(err) }
}

// Upload du logo de l'école du directeur connecté (multipart, séparé des
// champs texte — même logique que l'avatar utilisateur / le logo superadmin).
export const uploadEcoleLogo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
        if (!ecole) { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

        const file = (req as any).file
        if (!file) { res.status(400).json({ success: false, message: 'Aucun fichier uploadé' }); return }

        const originalExt = path.extname(file.originalname)
        const filename     = `ecole-${ecoleId}-${Date.now()}${originalExt}`
        const uploadDir    = path.join(__dirname, '../../public/uploads/ecoles')
        const outputPath   = path.join(uploadDir, filename)

        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

        fs.renameSync(file.path, outputPath)

        ecole.logo = `/uploads/ecoles/${filename}`
        await ecoleRepo.save(ecole)

        res.json({ success: true, message: 'Logo mis à jour', data: ecole })
    } catch (err) { next(err) }
}

// ==================== FILIÈRES ====================

export const getFilieres = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const filieres = await filiereRepo.find({
            where: { ecoleId },
            relations: ['classes'],
            order: { nom: 'ASC' }
        })
        res.json({ success: true, data: filieres })
    } catch (err) { next(err) }
}

export const createFiliere = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const { nom } = req.body
        if (!nom) { res.status(400).json({ success: false, message: 'Le nom est requis' }); return }

        const filiere = filiereRepo.create({ nom, ecoleId })
        await filiereRepo.save(filiere)
        audit(req, 'creation_filiere', 'filiere', filiere.id, { nom: filiere.nom })
        res.json({ success: true, data: filiere, message: 'Filière créée' })
    } catch (err) { next(err) }
}

export const updateFiliere = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id      = parseInt(req.params.id as string)
        const filiere = await filiereRepo.findOne({ where: { id, ecoleId } })
        if (!filiere) { res.status(404).json({ success: false, message: 'Filière non trouvée' }); return }

        const { nom, isActive } = req.body
        if (nom      !== undefined) filiere.nom      = nom
        if (isActive !== undefined) filiere.isActive = isActive

        await filiereRepo.save(filiere)
        audit(req, 'modification_filiere', 'filiere', filiere.id, { nom: filiere.nom })
        res.json({ success: true, data: filiere, message: 'Filière mise à jour' })
    } catch (err) { next(err) }
}

export const deleteFiliere = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id      = parseInt(req.params.id as string)
        const filiere = await filiereRepo.findOne({ where: { id, ecoleId }, relations: ['classes'] })
        if (!filiere) { res.status(404).json({ success: false, message: 'Filière non trouvée' }); return }

        if (filiere.classes?.length > 0) {
            res.status(400).json({ success: false, message: `Impossible de supprimer : ${filiere.classes.length} classe(s) rattachée(s)` })
            return
        }

        await filiereRepo.delete(id)
        audit(req, 'suppression_filiere', 'filiere', id, { nom: filiere.nom })
        res.json({ success: true, message: 'Filière supprimée' })
    } catch (err) { next(err) }
}

// ==================== CLASSES ====================

export const getClasses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId       = getEcoleId(req, res)
        if (!ecoleId) return

        const { filiereId } = req.query

        const qb = classeRepo.createQueryBuilder('c')
            .innerJoinAndSelect('c.filiere', 'f')
            .where('f.ecoleId = :ecoleId', { ecoleId })

        if (filiereId) qb.andWhere('c.filiereId = :filiereId', { filiereId })

        const classes = await qb.orderBy('c.nom', 'ASC').getMany()

        const classesWithCount = await Promise.all(classes.map(async (c) => {
            const count = await etudiantRepo.count({ where: { classeId: c.id } })
            return {
                id: c.id, nom: c.nom, isActive: c.isActive,
                codeInscription: c.codeInscription,
                filiereId: c.filiereId, filiere: c.filiere?.nom,
                nbEtudiants: count
            }
        }))

        res.json({ success: true, data: classesWithCount })
    } catch (err) { next(err) }
}

export const createClasse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId        = getEcoleId(req, res)
        if (!ecoleId) return

        const { nom, filiereId } = req.body
        if (!nom || !filiereId) { res.status(400).json({ success: false, message: 'Nom et filière requis' }); return }

        const filiere = await filiereRepo.findOne({ where: { id: filiereId, ecoleId } })
        if (!filiere) { res.status(404).json({ success: false, message: 'Filière non trouvée' }); return }

        const classe = classeRepo.create({ nom, filiereId })
        await classeRepo.save(classe)
        audit(req, 'creation_classe', 'classe', classe.id, { nom: classe.nom })
        res.json({ success: true, data: classe, message: 'Classe créée' })
    } catch (err) { next(err) }
}

export const updateClasse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id     = parseInt(req.params.id as string)
        const classe = await classeRepo
            .createQueryBuilder('c')
            .innerJoin('c.filiere', 'f')
            .where('c.id = :id', { id })
            .andWhere('f.ecoleId = :ecoleId', { ecoleId })
            .getOne()

        if (!classe) { res.status(404).json({ success: false, message: 'Classe non trouvée' }); return }

        const { nom, isActive } = req.body
        if (nom      !== undefined) classe.nom      = nom
        if (isActive !== undefined) classe.isActive = isActive

        await classeRepo.save(classe)
        audit(req, 'modification_classe', 'classe', classe.id, { nom: classe.nom })
        res.json({ success: true, data: classe, message: 'Classe mise à jour' })
    } catch (err) { next(err) }
}

export const deleteClasse = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id     = parseInt(req.params.id as string)
        const classe = await classeRepo
            .createQueryBuilder('c')
            .innerJoin('c.filiere', 'f')
            .where('c.id = :id', { id })
            .andWhere('f.ecoleId = :ecoleId', { ecoleId })
            .getOne()

        if (!classe) { res.status(404).json({ success: false, message: 'Classe non trouvée' }); return }

        const count = await etudiantRepo.count({ where: { classeId: id } })
        if (count > 0) {
            res.status(400).json({ success: false, message: `Impossible de supprimer : ${count} étudiant(s) rattaché(s)` })
            return
        }

        await classeRepo.delete(id)
        audit(req, 'suppression_classe', 'classe', id, { nom: classe.nom })
        res.json({ success: true, message: 'Classe supprimée' })
    } catch (err) { next(err) }
}

export const generateClasseCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id     = parseInt(req.params.id as string)
        const classe = await classeRepo
            .createQueryBuilder('c')
            .innerJoinAndSelect('c.filiere', 'f')
            .where('c.id = :id', { id })
            .andWhere('f.ecoleId = :ecoleId', { ecoleId })
            .getOne()

        if (!classe) { res.status(404).json({ success: false, message: 'Classe non trouvée' }); return }

        const prefix = classe.nom.toUpperCase().replace(/\s/g, '').substring(0, 5)
        const random = Math.random().toString(36).substring(2, 5).toUpperCase()
        const code   = `${prefix}-${random}`

        await classeRepo.update(id, { codeInscription: code })
        res.json({ success: true, data: { code }, message: 'Code généré' })
    } catch (err) { next(err) }
}

// ==================== UTILISATEURS ====================

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const { role, search } = req.query

        const qb = userRepo.createQueryBuilder('u')
            .leftJoinAndSelect('u.etudiantProfil', 'ep')
            .leftJoinAndSelect('ep.classe', 'c')
            .leftJoinAndSelect('ep.filiere', 'f')
            .leftJoinAndSelect('u.professeurProfil', 'pp')
            .leftJoinAndSelect('pp.filiere', 'pf')
            .where('(ep.ecoleId = :ecoleId OR pp.ecoleId = :ecoleId)', { ecoleId })
            .andWhere('u.role != :superadmin', { superadmin: UserRole.SUPERADMIN })
            .orderBy('u.createdAt', 'DESC')

        if (role)   qb.andWhere('u.role = :role', { role })
        if (search) qb.andWhere('(u.nom LIKE :s OR u.prenom LIKE :s OR u.email LIKE :s)', { s: `%${search}%` })

        const users = await qb.getMany()

        const formatted = users.map(u => ({
            id: u.id, nom: u.nom, prenom: u.prenom,
            email: u.email, role: u.role, isActive: u.isActive,
            avatar: u.avatar,
            createdAt: u.createdAt,
            profil: u.role === UserRole.ETUDIANT ? {
                classe:  u.etudiantProfil?.classe?.nom  || null,
                filiere: u.etudiantProfil?.filiere?.nom || null,
            } : {
                filiere: u.professeurProfil?.filiere?.nom || null,
                statut:  u.professeurProfil?.statut       || null,
            }
        }))

        res.json({ success: true, data: formatted })
    } catch (err) { next(err) }
}

export const toggleUserActive = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id   = parseInt(req.params.id as string)
        const user = await userRepo
            .createQueryBuilder('u')
            .leftJoin('u.etudiantProfil', 'ep')
            .leftJoin('u.professeurProfil', 'pp')
            .where('u.id = :id', { id })
            .andWhere('(ep.ecoleId = :ecoleId OR pp.ecoleId = :ecoleId)', { ecoleId })
            .getOne()

        if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }

        user.isActive = !user.isActive
        await userRepo.save(user)
        audit(req, user.isActive ? 'activation_compte' : 'desactivation_compte', 'user', user.id, { nom: `${user.prenom} ${user.nom}`, role: user.role })

        res.json({
            success: true,
            message: user.isActive ? 'Compte activé' : 'Compte désactivé',
            data: { isActive: user.isActive }
        })
    } catch (err) { next(err) }
}

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id   = parseInt(req.params.id as string)
        const user = await userRepo
            .createQueryBuilder('u')
            .leftJoin('u.etudiantProfil', 'ep')
            .leftJoin('u.professeurProfil', 'pp')
            .where('u.id = :id', { id })
            .andWhere('(ep.ecoleId = :ecoleId OR pp.ecoleId = :ecoleId)', { ecoleId })
            .getOne()

        if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }
        if (user.role === UserRole.SUPERADMIN) {
            res.status(403).json({ success: false, message: 'Impossible de supprimer un superadmin' }); return
        }

        await userRepo.delete(id)
        audit(req, 'suppression_utilisateur', 'user', id, { nom: `${user.prenom} ${user.nom}`, role: user.role })
        res.json({ success: true, message: 'Utilisateur supprimé' })
    } catch (err) { next(err) }
}

export const activateProfesseur = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id     = parseInt(req.params.id as string)
        const profil = await professeurRepo.findOne({
            where: { userId: id, ecoleId },
            relations: ['user']
        })
        if (!profil) { res.status(404).json({ success: false, message: 'Professeur non trouvé' }); return }

        profil.statut        = 'active'
        profil.user.isActive = true
        await professeurRepo.save(profil)
        await userRepo.save(profil.user)
        audit(req, 'activation_professeur', 'user', id, { nom: `${profil.user.prenom} ${profil.user.nom}` })

        res.json({ success: true, message: 'Professeur activé' })
    } catch (err) { next(err) }
}

// ==================== INVITATIONS ====================

export const getInvitations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const invitations = await invitationRepo.find({
            where: { ecoleId },
            relations: ['classe', 'filiere'],
            order: { createdAt: 'DESC' }
        })

        const formatted = invitations.map(inv => ({
            id: inv.id, email: inv.email, nom: inv.nom, prenom: inv.prenom,
            role: inv.role, classe: inv.classe?.nom || null, filiere: inv.filiere?.nom || null,
            used: inv.used, expiresAt: inv.expiresAt, createdAt: inv.createdAt,
            expired: new Date() > new Date(inv.expiresAt)
        }))

        res.json({ success: true, data: formatted })
    } catch (err) { next(err) }
}

export const sendInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const { email, nom, prenom, role, filiereId, classeId } = req.body

        if (!email || !nom || !prenom || !role || !filiereId) {
            res.status(400).json({ success: false, message: 'Champs manquants' }); return
        }

        if (role === InvitationRole.ETUDIANT && !classeId) {
            res.status(400).json({ success: false, message: 'La classe est requise pour un étudiant' }); return
        }

        const existingUser = await userRepo.findOne({ where: { email } })
        if (existingUser) { res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' }); return }

        const ecole   = await ecoleRepo.findOne({ where: { id: ecoleId } })
        if (!ecole)   { res.status(404).json({ success: false, message: 'École non trouvée' }); return }

        const filiere = await filiereRepo.findOne({ where: { id: filiereId, ecoleId } })
        if (!filiere) { res.status(404).json({ success: false, message: 'Filière non trouvée' }); return }

        const classe = classeId ? await classeRepo.findOne({ where: { id: classeId } }) : null

        const existingInvit = await invitationRepo.findOne({ where: { email, used: false } })
        if (existingInvit) {
            existingInvit.token     = uuidv4()
            existingInvit.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
            existingInvit.nom       = nom
            existingInvit.prenom    = prenom
            await invitationRepo.save(existingInvit)

            const lien = `${process.env.FRONTEND_URL}/auth/invitation?token=${existingInvit.token}`
            await envoyerInvitation(email, prenom, nom, role, filiere.nom, classe?.nom || null, ecole.nom, lien, existingInvit.expiresAt)
            audit(req, 'invitation_renouvelee', 'invitation', existingInvit.id, { email, role })
            res.json({ success: true, message: 'Invitation renouvelée', data: { token: existingInvit.token, expiresAt: existingInvit.expiresAt, lien } })
            return
        }

        const invitation = invitationRepo.create({
            email, nom, prenom, role,
            filiereId, classeId: classeId || null,
            ecoleId,
            token:     uuidv4(),
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
        })
        await invitationRepo.save(invitation)

        const lien = `${process.env.FRONTEND_URL}/auth/invitation?token=${invitation.token}`
        await envoyerInvitation(email, prenom, nom, role, filiere.nom, classe?.nom || null, ecole.nom, lien, invitation.expiresAt)

        audit(req, 'envoi_invitation', 'invitation', invitation.id, { email, role })
        res.json({ success: true, message: 'Invitation envoyée', data: { token: invitation.token, expiresAt: invitation.expiresAt, lien } })
    } catch (err) { next(err) }
}

export const deleteInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id         = parseInt(req.params.id as string)
        const invitation = await invitationRepo.findOne({ where: { id, ecoleId } })
        if (!invitation) { res.status(404).json({ success: false, message: 'Invitation non trouvée' }); return }

        await invitationRepo.delete(id)
        audit(req, 'suppression_invitation', 'invitation', id, { email: invitation.email })
        res.json({ success: true, message: 'Invitation supprimée' })
    } catch (err) { next(err) }
}

export const verifyInvitationToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query

        const invitation = await invitationRepo.findOne({
            where: { token: token as string },
            relations: ['classe', 'filiere', 'ecole']
        })

        if (!invitation)      { res.status(404).json({ success: false, message: 'Invitation invalide' }); return }
        if (invitation.used)  { res.status(400).json({ success: false, message: 'Cette invitation a déjà été utilisée' }); return }
        if (new Date() > new Date(invitation.expiresAt)) { res.status(400).json({ success: false, message: 'Cette invitation a expiré' }); return }

        res.json({
            success: true,
            data: {
                email: invitation.email, nom: invitation.nom, prenom: invitation.prenom,
                role: invitation.role, classe: invitation.classe?.nom || null,
                filiere: invitation.filiere?.nom || null, ecole: invitation.ecole?.nom || null
            }
        })
    } catch (err) { next(err) }
}

export const registerViaInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, password } = req.body
        const bcrypt = require('bcrypt')

        const invitation = await invitationRepo.findOne({
            where: { token },
            relations: ['classe', 'filiere', 'ecole']
        })

        if (!invitation || invitation.used) { res.status(400).json({ success: false, message: 'Invitation invalide ou déjà utilisée' }); return }
        if (new Date() > new Date(invitation.expiresAt)) { res.status(400).json({ success: false, message: 'Invitation expirée' }); return }

        const existingUser = await userRepo.findOne({ where: { email: invitation.email } })
        if (existingUser) { res.status(400).json({ success: false, message: 'Un compte existe déjà avec cet email' }); return }

        const verificationCode    = Math.floor(100000 + Math.random() * 900000).toString()
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000)
        const hashedPassword      = await bcrypt.hash(password, 10)

        const user = userRepo.create({
            nom: invitation.nom, prenom: invitation.prenom,
            email: invitation.email, motDePasse: hashedPassword,
            role: invitation.role as any,
            isVerified: false, isActive: true,
            // Un directeur est rattaché directement à l'école (pas de filière/classe)
            ecoleId: invitation.role === InvitationRole.DIRECTEUR ? invitation.ecoleId : null,
            verificationCode, verificationCodeExpires: verificationExpires
        })
        await userRepo.save(user)

        if (invitation.role === InvitationRole.ETUDIANT) {
            const profil = etudiantRepo.create({
                userId: user.id, classeId: invitation.classeId,
                filiereId: invitation.filiereId, ecoleId: invitation.ecoleId
            })
            await etudiantRepo.save(profil)
        } else if (invitation.role === InvitationRole.PROFESSEUR) {
            const profil = professeurRepo.create({
                userId: user.id, filiereId: invitation.filiereId,
                ecoleId: invitation.ecoleId, statut: 'active'
            })
            await professeurRepo.save(profil)
        }
        // InvitationRole.DIRECTEUR : rien de plus à créer, ecoleId suffit sur le User

        invitation.used = true
        await invitationRepo.save(invitation)

        // Notifier les superadmins qu'un nouveau directeur (ou superadmin) vient de rejoindre
        if (invitation.role === InvitationRole.DIRECTEUR) {
            const ecoleNom = invitation.ecole?.nom || (await ecoleRepo.findOne({ where: { id: invitation.ecoleId! } }))?.nom || 'une école'
            const superadmins = await userRepo.find({ where: { role: UserRole.SUPERADMIN } })
            for (const sa of superadmins) {
                await createNotification(sa.id, {
                    titre: 'Nouveau directeur inscrit',
                    message: `${invitation.prenom} ${invitation.nom} a rejoint en tant que directeur de ${ecoleNom}.`,
                    type: NotificationType.NEW_SESSION,
                    link: '/superadmin/directeurs'
                })
            }
        } else if (invitation.role === InvitationRole.SUPERADMIN) {
            const superadmins = await userRepo.find({ where: { role: UserRole.SUPERADMIN } })
            for (const sa of superadmins) {
                if (sa.id === user.id) continue
                await createNotification(sa.id, {
                    titre: 'Nouveau superadmin',
                    message: `${invitation.prenom} ${invitation.nom} a rejoint l'équipe en tant que superadministrateur.`,
                    type: NotificationType.NEW_SESSION,
                    link: '/superadmin/administration'
                })
            }
        }

        const { envoyerVerificationInvitation } = require('../services/emailService')
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-invitation?code=${verificationCode}&email=${encodeURIComponent(invitation.email)}`
        await envoyerVerificationInvitation(invitation.email, invitation.prenom, verificationUrl)

        res.json({
            success: true,
            message: 'Compte créé. Un code de vérification a été envoyé à votre email.',
            data: { email: invitation.email, requiresVerification: true }
        })
    } catch (err) { next(err) }
}

export const verifyInvitationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, email } = req.query

        const user = await userRepo.findOne({
            where: { email: email as string, verificationCode: code as string }
        })

        if (!user) { res.status(400).json({ success: false, message: 'Lien invalide ou expiré' }); return }
        if (new Date() > new Date(user.verificationCodeExpires!)) { res.status(400).json({ success: false, message: 'Lien expiré' }); return }

        user.isVerified              = true
        user.verificationCode        = null
        user.verificationCodeExpires = null
        await userRepo.save(user)

        let profilInfo = null
        if (user.role === 'etudiant') {
            const profil = await etudiantRepo.findOne({ where: { userId: user.id }, relations: ['ecole', 'filiere', 'classe'] })
            profilInfo = { type: 'etudiant', ecole: profil?.ecole?.nom, ecoleId: profil?.ecoleId, filiere: profil?.filiere?.nom, filiereId: profil?.filiereId, classe: profil?.classe?.nom, classeId: profil?.classeId, dateNaissance: profil?.dateNaissance }
        } else if (user.role === 'professeur') {
            const profil = await professeurRepo.findOne({ where: { userId: user.id }, relations: ['filiere'] })
            profilInfo = { type: 'professeur', filiere: profil?.filiere?.nom, filiereId: profil?.filiereId, statut: profil?.statut }
        } else {
            profilInfo = { type: user.role, permissions: 'toutes' }
        }

        const jwt   = require('jsonwebtoken')
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' })

        res.json({
            success: true, message: 'Email vérifié avec succès',
            data: { token, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, avatar: user.avatar, isVerified: true, profil: profilInfo } }
        })
    } catch (err) { next(err) }
}

export const checkEmailVerified = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.query
        const user = await userRepo.findOne({ where: { email: email as string } })

        if (!user)            { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }
        if (!user.isVerified) { res.json({ success: true, data: { isVerified: false } }); return }

        const jwt   = require('jsonwebtoken')
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' })

        let profilInfo = null
        if (user.role === 'etudiant') {
            const profil = await etudiantRepo.findOne({ where: { userId: user.id }, relations: ['ecole', 'filiere', 'classe'] })
            profilInfo = { type: 'etudiant', ecole: profil?.ecole?.nom, ecoleId: profil?.ecoleId, filiere: profil?.filiere?.nom, filiereId: profil?.filiereId, classe: profil?.classe?.nom, classeId: profil?.classeId, dateNaissance: profil?.dateNaissance }
        } else if (user.role === 'professeur') {
            const profil = await professeurRepo.findOne({ where: { userId: user.id }, relations: ['filiere'] })
            profilInfo = { type: 'professeur', filiere: profil?.filiere?.nom, filiereId: profil?.filiereId, statut: profil?.statut }
        }

        res.json({
            success: true,
            data: { isVerified: true, token, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, avatar: user.avatar, isVerified: true, profil: profilInfo } }
        })
    } catch (err) { next(err) }
}

export const resendInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id         = parseInt(req.params.id as string)
        const invitation = await invitationRepo.findOne({
            where: { id, ecoleId },
            relations: ['classe', 'filiere', 'ecole']
        })
        if (!invitation) { res.status(404).json({ success: false, message: 'Invitation non trouvée' }); return }
        if (invitation.used) { res.status(400).json({ success: false, message: 'Invitation déjà utilisée' }); return }

        invitation.token     = uuidv4()
        invitation.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)
        await invitationRepo.save(invitation)

        const lien = `${process.env.FRONTEND_URL}/auth/invitation?token=${invitation.token}`
        await envoyerInvitation(invitation.email, invitation.prenom, invitation.nom, invitation.role, invitation.filiere?.nom || '', invitation.classe?.nom || null, invitation.ecole?.nom || '', lien, invitation.expiresAt)

        res.json({ success: true, message: 'Invitation renvoyée', data: { lien } })
    } catch (err) { next(err) }
}

export const revokeInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id         = parseInt(req.params.id as string)
        const invitation = await invitationRepo.findOne({ where: { id, ecoleId } })
        if (!invitation) { res.status(404).json({ success: false, message: 'Invitation non trouvée' }); return }
        if (invitation.used) { res.status(400).json({ success: false, message: 'Invitation déjà utilisée' }); return }

        invitation.expiresAt = new Date(Date.now() - 1000)
        await invitationRepo.save(invitation)

        res.json({ success: true, message: 'Invitation révoquée' })
    } catch (err) { next(err) }
}

// ==================== SESSIONS ====================

export const getAllSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const { status, filiereId, classeId, professeurId } = req.query

        const qb = sessionRepo.createQueryBuilder('s')
            .leftJoinAndSelect('s.classe', 'c')
            .leftJoinAndSelect('s.filiere', 'f')
            .leftJoinAndSelect('s.professeur', 'p')
            .leftJoinAndSelect('s.questions', 'q')
            .where('f.ecoleId = :ecoleId', { ecoleId })
            .orderBy('s.created_at', 'DESC')

        if (status)       qb.andWhere('s.status = :status',           { status })
        if (filiereId)    qb.andWhere('s.filiere_id = :filiereId',    { filiereId })
        if (classeId)     qb.andWhere('s.classe_id = :classeId',      { classeId })
        if (professeurId) qb.andWhere('s.created_by = :professeurId', { professeurId })

        const sessions = await qb.getMany()

        const formatted = await Promise.all(sessions.map(async (s) => {
            const nbParticipants = await participantRepo.count({ where: { session_id: s.id } })
            return {
                id: s.id, titre: s.titre, theme: s.theme,
                status: s.status, code: s.code,
                date_debut: s.date_debut, date_fin: s.date_fin,
                duree: s.duree, created_at: s.created_at,
                classe: s.classe?.nom || null, filiere: s.filiere?.nom || null,
                professeur: { id: s.professeur?.id, nom: s.professeur?.nom, prenom: s.professeur?.prenom },
                nb_questions: s.questions?.length || 0, nb_participants: nbParticipants
            }
        }))

        res.json({ success: true, data: formatted })
    } catch (err) { next(err) }
}

export const getAdminSessionDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id      = parseInt(req.params.id as string)
        const session = await sessionRepo
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.questions', 'q')
            .leftJoinAndSelect('s.classe', 'c')
            .leftJoinAndSelect('s.filiere', 'f')
            .leftJoinAndSelect('s.professeur', 'p')
            .where('s.id = :id', { id })
            .andWhere('f.ecoleId = :ecoleId', { ecoleId })
            .getOne()

        if (!session) { res.status(404).json({ success: false, message: 'Session non trouvée' }); return }

        const participants = await participantRepo
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.etudiant', 'e')
            .where('p.session_id = :id', { id })
            .getMany()

        const questions    = session.questions || []
        const totalPoints  = questions.reduce((sum, q) => sum + q.points, 0)
        const termines     = participants.filter(p => p.statut === 'termine')
        const scores       = termines.map(p => p.score || 0)
        const moyenne      = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        const moyenneSur20 = totalPoints > 0 ? (moyenne / totalPoints) * 20 : 0

        res.json({
            success: true,
            data: {
                session: {
                    id: session.id, titre: session.titre, description: session.description, theme: session.theme,
                    status: session.status, code: session.code,
                    date_debut: session.date_debut, date_fin: session.date_fin,
                    duree: session.duree, classe: session.classe?.nom, classe_id: session.classe_id,
                    filiere: session.filiere?.nom, filiere_id: session.filiere_id,
                    professeur: `${session.professeur?.prenom} ${session.professeur?.nom}`,
                    resultatsVisibles: session.resultatsVisibles
                },
                stats: {
                    nb_questions: questions.length, total_points: totalPoints,
                    nb_participants: participants.length, nb_termines: termines.length,
                    moyenne_sur_20: Math.round(moyenneSur20 * 100) / 100
                },
                participants: participants.map(p => ({
                    id: p.id, statut: p.statut, score: p.score,
                    note_sur_20: totalPoints > 0 ? Math.round(((p.score || 0) / totalPoints) * 20 * 100) / 100 : 0,
                    date_completed: p.date_completed,
                    etudiant: { id: p.etudiant.id, nom: p.etudiant.nom, prenom: p.etudiant.prenom, email: p.etudiant.email }
                }))
            }
        })
    } catch (err) { next(err) }
}

export const adminDeleteSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const id      = parseInt(req.params.id as string)
        const session = await sessionRepo
            .createQueryBuilder('s')
            .innerJoin('s.filiere', 'f')
            .where('s.id = :id', { id })
            .andWhere('f.ecoleId = :ecoleId', { ecoleId })
            .getOne()

        if (!session) { res.status(404).json({ success: false, message: 'Session non trouvée' }); return }

        await sessionRepo.delete(id)
        audit(req, 'suppression_session', 'session', id, { titre: session.titre })
        res.json({ success: true, message: 'Session supprimée' })
    } catch (err) { next(err) }
}

// Récupère une session en vérifiant qu'elle appartient bien à l'école du
// directeur connecté (via sa filière). Retourne null + réponse 404/400 sinon.
const getEcoleScopedSession = async (req: AuthRequest, res: Response): Promise<Session | null> => {
    const ecoleId = getEcoleId(req, res)
    if (!ecoleId) return null

    const id = parseInt(req.params.id as string)
    const session = await sessionRepo
        .createQueryBuilder('s')
        .leftJoinAndSelect('s.classe', 'c')
        .leftJoinAndSelect('s.filiere', 'f')
        .leftJoinAndSelect('s.professeur', 'p')
        .where('s.id = :id', { id })
        .andWhere('f.ecoleId = :ecoleId', { ecoleId })
        .getOne()

    if (!session) {
        res.status(404).json({ success: false, message: 'Session non trouvée' })
        return null
    }
    return session
}

// ==================== MODIFIER UNE SESSION (directeur) ====================
// Le directeur peut ajuster les informations générales d'une session tant
// qu'elle n'a pas démarré. Contrairement au professeur, il ne modifie pas
// les questions (contenu pédagogique propre au professeur).
export const adminUpdateSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const session = await getEcoleScopedSession(req, res)
        if (!session) return

        if (session.status !== SessionStatus.PENDING) {
            res.status(400).json({ success: false, message: 'Seules les sessions en attente peuvent être modifiées' })
            return
        }

        const ecoleId = req.user!.ecoleId
        const { titre, description, theme, date_debut, date_fin, duree, classe_id, filiere_id } = req.body

        if (classe_id || filiere_id) {
            const newFiliereId = filiere_id || session.filiere_id
            const classe = await classeRepo.findOne({ where: { id: classe_id || session.classe_id }, relations: ['filiere'] })
            if (!classe || classe.filiere?.ecoleId !== ecoleId || classe.filiereId !== newFiliereId) {
                res.status(400).json({ success: false, message: 'Classe/filière invalide pour cette école' })
                return
            }
        }

        if (titre !== undefined)       session.titre = titre
        if (description !== undefined) session.description = description
        if (theme !== undefined)       session.theme = theme
        if (date_debut)                session.date_debut = new Date(date_debut)
        if (date_fin)                  session.date_fin = new Date(date_fin)
        if (duree)                     session.duree = duree
        if (classe_id)                 session.classe_id = classe_id
        if (filiere_id)                session.filiere_id = filiere_id

        await sessionRepo.save(session)

        const updated = await sessionRepo.findOne({ where: { id: session.id }, relations: ['questions', 'classe', 'filiere', 'professeur'] })
        res.json({ success: true, message: 'Session mise à jour', data: updated })
    } catch (err) { next(err) }
}

// ==================== DÉMARRER UNE SESSION (directeur) ====================
export const adminStartSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const session = await getEcoleScopedSession(req, res)
        if (!session) return

        if (session.status !== SessionStatus.PENDING) {
            res.status(400).json({ success: false, message: 'La session ne peut pas être démarrée' })
            return
        }

        await sessionRepo.update(session.id, { status: SessionStatus.ACTIVE, date_debut: new Date() })
        audit(req, 'demarrage_session', 'session', session.id, { titre: session.titre })

        const io = getSocketIO()
        if (io) {
            const roomName = `classe_${session.classe_id}_filiere_${session.filiere_id}`
            io.to(roomName).emit('session-started', {
                sessionId: session.id,
                session: {
                    id: session.id, titre: session.titre, theme: session.theme,
                    date_debut: session.date_debut, date_fin: session.date_fin,
                    duree: session.duree, code: session.code, status: 'active'
                },
                message: `La session "${session.titre}" vient de commencer ! Rejoignez maintenant.`,
                timestamp: new Date()
            })

            const etudiants = await etudiantRepo.find({ where: { classeId: session.classe_id, filiereId: session.filiere_id } })
            for (const etudiant of etudiants) {
                await createNotification(etudiant.userId, {
                    titre: 'Session démarrée !',
                    message: `La session "${session.titre}" vient de commencer. Rejoignez maintenant !`,
                    type: NotificationType.SESSION_STARTED,
                    link: `/students/join-session?code=${session.code}`,
                    sessionId: session.id
                })
            }
        }

        const now = new Date()
        const timeUntilEnd = session.date_fin.getTime() - now.getTime()
        if (timeUntilEnd > 0) {
            setTimeout(() => { autoCloseSession(session.id) }, timeUntilEnd)
        }

        res.json({ success: true, message: 'Session démarrée' })
    } catch (err) { next(err) }
}

// ==================== TERMINER UNE SESSION (directeur) ====================
export const adminEndSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const session = await getEcoleScopedSession(req, res)
        if (!session) return

        await autoCloseSession(session.id)
        audit(req, 'fin_session', 'session', session.id, { titre: session.titre })
        res.json({ success: true, message: 'Session terminée' })
    } catch (err) { next(err) }
}

// ==================== NOTES D'UNE SESSION (directeur) ====================
export const adminGetNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const session = await getEcoleScopedSession(req, res)
        if (!session) return

        const participants = await participantRepo
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.etudiant', 'e')
            .where('p.session_id = :id', { id: session.id })
            .andWhere('p.statut = :statut', { statut: ParticipantStatus.TERMINE })
            .orderBy('p.score', 'DESC')
            .getMany()

        const questions   = await questionRepo.find({ where: { session_id: session.id } })
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

        const notes = participants.map(p => ({
            etudiant: { id: p.etudiant.id, nom: p.etudiant.nom, prenom: p.etudiant.prenom, email: p.etudiant.email },
            score: p.score,
            note_sur_20: totalPoints > 0 ? ((p.score || 0) / totalPoints) * 20 : 0,
            date_completed: p.date_completed
        }))

        res.json({
            success: true,
            data: {
                session: { id: session.id, titre: session.titre, total_points: totalPoints },
                notes,
                publiees: session.resultatsVisibles
            }
        })
    } catch (err) { next(err) }
}

// ==================== PUBLIER / MASQUER LES NOTES (directeur) ====================
export const adminToggleResultatsVisibles = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const session = await getEcoleScopedSession(req, res)
        if (!session) return

        session.resultatsVisibles = !session.resultatsVisibles
        await sessionRepo.save(session)
        audit(req, session.resultatsVisibles ? 'publication_notes' : 'masquage_notes', 'session', session.id, { titre: session.titre })

        if (session.resultatsVisibles) {
            const io = getSocketIO()
            if (io) {
                const roomName = `classe_${session.classe_id}_filiere_${session.filiere_id}`
                io.to(roomName).emit('notes-publiees', {
                    sessionId: session.id,
                    titre: session.titre,
                    message: `Les notes de "${session.titre}" sont maintenant disponibles.`
                })

                const etudiants = await etudiantRepo.find({ where: { classeId: session.classe_id, filiereId: session.filiere_id } })
                for (const etudiant of etudiants) {
                    await createNotification(etudiant.userId, {
                        titre: 'Notes disponibles',
                        message: `Vos notes pour "${session.titre}" sont maintenant disponibles.`,
                        type: NotificationType.SESSION_COMPLETED,
                        link: `/students/notes/${session.id}`,
                        sessionId: session.id
                    })

                    const user = await userRepo.findOne({ where: { id: etudiant.userId } })
                    if (user?.notifNotesPubliees) {
                        await envoyerEmailNotesPubliees(user.email, user.prenom, session.titre, session.id)
                    }
                }
            }
        }

        res.json({ success: true, data: { resultatsVisibles: session.resultatsVisibles } })
    } catch (err) { next(err) }
}

// ==================== EXPORT PDF DES RÉSULTATS (directeur) ====================
// ─── Helper : en-tête PDF (infos à gauche, logo + nom école à droite) ──────
type PdfHeaderLine = { text: string; bold?: boolean; size?: number; color?: string }

function drawPdfHeader(
    doc: PDFKit.PDFDocument,
    ecole: Pick<Ecole, 'nom' | 'logo'> | null,
    leftLines: PdfHeaderLine[]
): number {
    const startY      = 40
    const pageLeft     = 40
    const pageRight    = 555
    const logoSize     = 50
    const nameBoxWidth = 200
    const nameBoxX     = pageRight - nameBoxWidth

    let logoBottom = startY
    if (ecole?.logo) {
        try {
            const logoPath = path.join(__dirname, '../../public', ecole.logo)
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, pageRight - logoSize, startY, { fit: [logoSize, logoSize] })
                logoBottom = startY + logoSize + 4
            }
        } catch { /* logo illisible : on continue sans */ }
    }

    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000')
       .text(ecole?.nom || 'Mentora', nameBoxX, logoBottom, { width: nameBoxWidth, align: 'right' })
    const rightBottom = doc.y

    let leftY = startY
    leftLines.forEach(line => {
        doc.font(line.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(line.size || 10).fillColor(line.color || '#000')
           .text(line.text, pageLeft, leftY, { width: 300 })
        leftY = doc.y + 2
    })

    const bottom = Math.max(leftY, rightBottom) + 8
    doc.moveTo(pageLeft, bottom).lineTo(pageRight, bottom).strokeColor('#ccc').lineWidth(0.75).stroke()
    doc.y = bottom + 14
    doc.x = pageLeft
    return doc.y
}

// ─── Helper : tableau PDF avec bordures et espacement ──────────────────────
type PdfTableColumn = { label: string; x: number; width: number; align?: 'left' | 'center' | 'right' }

function drawPdfTable(
    doc: PDFKit.PDFDocument,
    columns: PdfTableColumn[],
    rows: string[][],
    startY: number,
    opts: { rowHeight?: number; pageTop?: number; pageBottom?: number } = {}
): number {
    const rowHeight    = opts.rowHeight ?? 24
    const pageTop      = opts.pageTop ?? 40
    const pageBottom   = opts.pageBottom ?? 760
    const tableLeft    = columns[0].x
    const tableRight   = columns[columns.length - 1].x + columns[columns.length - 1].width
    const padX = 6
    const padY = 8

    const drawGridRow = (yTop: number) => {
        doc.lineWidth(0.75).strokeColor('#bbb')
        doc.rect(tableLeft, yTop, tableRight - tableLeft, rowHeight).stroke()
        columns.forEach(col => {
            if (col.x > tableLeft) {
                doc.moveTo(col.x, yTop).lineTo(col.x, yTop + rowHeight).stroke()
            }
        })
    }

    const writeCells = (values: string[], yTop: number, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor('#000')
        columns.forEach((col, i) => {
            doc.text(values[i] ?? '', col.x + padX, yTop + padY, {
                width: col.width - padX * 2,
                align: col.align || 'left'
            })
        })
    }

    const drawHeader = (yTop: number) => {
        doc.rect(tableLeft, yTop, tableRight - tableLeft, rowHeight).fillColor('#f0f0f0').fill()
        writeCells(columns.map(c => c.label), yTop, true)
        drawGridRow(yTop)
    }

    let y = startY
    drawHeader(y)
    y += rowHeight

    rows.forEach(row => {
        if (y + rowHeight > pageBottom) {
            doc.addPage()
            y = pageTop
            drawHeader(y)
            y += rowHeight
        }
        writeCells(row, y)
        drawGridRow(y)
        y += rowHeight
    })

    return y
}

export const adminExportResultsPdf = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const session = await getEcoleScopedSession(req, res)
        if (!session) return

        if (session.status !== SessionStatus.COMPLETED) {
            res.status(400).json({ success: false, message: 'Seules les sessions terminées peuvent être exportées' })
            return
        }

        const ecoleId = req.user!.ecoleId
        const ecole = await ecoleRepo.findOne({ where: { id: ecoleId! } })

        const participants = await participantRepo
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.etudiant', 'e')
            .where('p.session_id = :id', { id: session.id })
            .orderBy('p.score', 'DESC')
            .getMany()

        const questions   = await questionRepo.find({ where: { session_id: session.id } })
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
        const termines    = participants.filter(p => p.statut === ParticipantStatus.TERMINE)
        const moyenne     = termines.length > 0
            ? termines.reduce((sum, p) => sum + (totalPoints > 0 ? ((p.score || 0) / totalPoints) * 20 : 0), 0) / termines.length
            : 0

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename=resultats_session_${session.id}.pdf`)

        const doc = new PDFDocument({ margin: 40, size: 'A4' })
        doc.pipe(res)

        drawPdfHeader(doc, ecole, [
            { text: 'Résultats de session', size: 9, color: '#555' },
            { text: session.titre, bold: true, size: 13 },
            { text: `Classe : ${session.classe?.nom || '-'}    Filière : ${session.filiere?.nom || '-'}`, size: 9, color: '#333' },
            { text: `Professeur : ${session.professeur?.prenom || ''} ${session.professeur?.nom || ''}`, size: 9, color: '#333' },
            { text: `Date : ${new Date(session.date_debut).toLocaleDateString('fr-FR')}`, size: 9, color: '#333' },
            { text: `Moyenne de la classe : ${moyenne.toFixed(2)} / 20`, size: 9, color: '#333' },
        ])
        doc.moveDown(0.5)

        const columns: PdfTableColumn[] = [
            { label: '#',       x: 40,  width: 40,  align: 'center' },
            { label: 'Nom',     x: 80,  width: 180 },
            { label: 'Email',   x: 260, width: 160 },
            { label: 'Score',   x: 420, width: 60,  align: 'center' },
            { label: 'Note/20', x: 480, width: 75,  align: 'center' },
        ]

        const rows = participants.map((p, i) => {
            const noteSur20 = totalPoints > 0 ? Math.round(((p.score || 0) / totalPoints) * 20 * 100) / 100 : 0
            return [
                `${i + 1}`,
                `${p.etudiant.prenom} ${p.etudiant.nom}`,
                p.etudiant.email,
                p.statut === ParticipantStatus.TERMINE ? `${p.score || 0}` : '-',
                p.statut === ParticipantStatus.TERMINE ? `${noteSur20}/20` : p.statut
            ]
        })

        drawPdfTable(doc, columns, rows, doc.y)

        doc.end()
    } catch (err) { next(err) }
}

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoleId = getEcoleId(req, res)
    if (!ecoleId) return

    const id = parseInt(req.params.id as string)
    
    const user = await userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.etudiantProfil', 'ep')
      .leftJoinAndSelect('ep.classe', 'c')
      .leftJoinAndSelect('ep.filiere', 'f')
      .leftJoinAndSelect('u.professeurProfil', 'pp')
      .leftJoinAndSelect('pp.filiere', 'pf')
      .where('u.id = :id', { id })
      .andWhere('(ep.ecoleId = :ecoleId OR pp.ecoleId = :ecoleId)', { ecoleId })
      .getOne()

    if (!user) { 
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); 
      return 
    }

    // Sessions selon le rôle
    let sessions: any[] = []

    if (user.role === UserRole.ETUDIANT) {
      const participants = await participantRepo
        .createQueryBuilder('p')
        .innerJoinAndSelect('p.session', 's')
        .innerJoinAndSelect('s.filiere', 'f')
        .innerJoinAndSelect('s.classe', 'c')
        .leftJoinAndSelect('s.questions', 'q')
        .where('p.etudiant_id = :id', { id })
        .orderBy('s.created_at', 'DESC')
        .getMany()

      sessions = participants.map(p => {
        const totalPoints = p.session.questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0
        const noteSur20 = totalPoints > 0 ? ((p.score || 0) / totalPoints) * 20 : 0
        
        return {
          id: p.session.id,
          titre: p.session.titre,
          filiere: p.session.filiere?.nom,
          classe: p.session.classe?.nom,
          date_debut: p.session.date_debut,
          statut: p.statut,
          score: p.score,
          note_sur_20: Math.round(noteSur20 * 100) / 100
        }
      })
    } else if (user.role === UserRole.PROFESSEUR) {
      const sess = await sessionRepo
        .createQueryBuilder('s')
        .leftJoinAndSelect('s.filiere', 'f')
        .leftJoinAndSelect('s.classe', 'c')
        .where('s.created_by = :id', { id })
        .orderBy('s.created_at', 'DESC')
        .getMany()

      sessions = await Promise.all(sess.map(async s => ({
        id: s.id,
        titre: s.titre,
        filiere: s.filiere?.nom,
        classe: s.classe?.nom,
        date_debut: s.date_debut,
        status: s.status,
        nb_participants: await participantRepo.count({ where: { session_id: s.id } })
      })))
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          profil: user.role === UserRole.ETUDIANT ? {
            filiere: user.etudiantProfil?.filiere?.nom || null,
            classe: user.etudiantProfil?.classe?.nom || null,
          } : {
            filiere: user.professeurProfil?.filiere?.nom || null,
            statut: user.professeurProfil?.statut || null,
          }
        },
        sessions
      }
    })
  } catch (err) {
    next(err)
  }
}

// ==================== EXPORT PDF HISTORIQUE UTILISATEUR (directeur) ====================
// Fiche complète d'un étudiant ou professeur : infos, statistiques, historique
// des sessions (avec notes pour un étudiant). Utilisé par le bouton
// "Télécharger l'historique" de la page Utilisateurs.
export const adminExportUserHistoryPdf = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoleId = getEcoleId(req, res)
    if (!ecoleId) return

    const id = parseInt(req.params.id as string)

    const user = await userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.etudiantProfil', 'ep')
      .leftJoinAndSelect('ep.classe', 'c')
      .leftJoinAndSelect('ep.filiere', 'f')
      .leftJoinAndSelect('u.professeurProfil', 'pp')
      .leftJoinAndSelect('pp.filiere', 'pf')
      .where('u.id = :id', { id })
      .andWhere('(ep.ecoleId = :ecoleId OR pp.ecoleId = :ecoleId)', { ecoleId })
      .getOne()

    if (!user) { res.status(404).json({ success: false, message: 'Utilisateur non trouvé' }); return }

    const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=historique_${user.nom}_${user.prenom}.pdf`)

    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    doc.pipe(res)

    // ─── En-tête (infos utilisateur à gauche, logo + nom école à droite) ───
    drawPdfHeader(doc, ecole, [
      { text: "Historique de l'utilisateur", size: 9, color: '#555' },
      { text: `${user.prenom} ${user.nom}`, bold: true, size: 13 },
      { text: `Rôle : ${user.role === UserRole.ETUDIANT ? 'Étudiant' : 'Professeur'}`, size: 9, color: '#333' },
      { text: `Email : ${user.email}`, size: 9, color: '#333' },
      { text: `Statut : ${user.isActive ? 'Actif' : 'Inactif'}   ·   Email vérifié : ${user.isVerified ? 'Oui' : 'Non'}`, size: 9, color: '#333' },
      { text: `Inscrit le : ${new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 9, color: '#333' },
      user.role === UserRole.ETUDIANT
        ? { text: `Filière : ${user.etudiantProfil?.filiere?.nom || '-'}   ·   Classe : ${user.etudiantProfil?.classe?.nom || '-'}`, size: 9, color: '#333' }
        : { text: `Filière : ${user.professeurProfil?.filiere?.nom || '-'}   ·   Statut : ${user.professeurProfil?.statut || '-'}`, size: 9, color: '#333' },
    ])
    doc.moveDown(0.5)

    if (user.role === UserRole.ETUDIANT) {
      const participants = await participantRepo
        .createQueryBuilder('p')
        .innerJoinAndSelect('p.session', 's')
        .leftJoinAndSelect('s.filiere', 'f')
        .leftJoinAndSelect('s.classe', 'c')
        .leftJoinAndSelect('s.questions', 'q')
        .where('p.etudiant_id = :id', { id })
        .orderBy('s.date_debut', 'DESC')
        .getMany()

      const notes = participants
        .filter(p => p.statut === ParticipantStatus.TERMINE)
        .map(p => {
          const totalPoints = p.session.questions?.reduce((sum, q) => sum + q.points, 0) || 0
          return totalPoints > 0 ? ((p.score || 0) / totalPoints) * 20 : 0
        })

      const moyenne     = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0
      const meilleure    = notes.length > 0 ? Math.max(...notes) : 0
      const moinsBonne   = notes.length > 0 ? Math.min(...notes) : 0

      // ─── Statistiques ────────────────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(11).text('Statistiques')
      doc.font('Helvetica').fontSize(10)
      doc.text(`Sessions participées : ${participants.length}   ·   Terminées : ${notes.length}`)
      doc.text(`Moyenne générale : ${moyenne.toFixed(2)}/20   ·   Meilleure note : ${meilleure.toFixed(2)}/20   ·   Moins bonne : ${moinsBonne.toFixed(2)}/20`)
      doc.moveDown(1)

      // ─── Historique des sessions ─────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(11).text('Historique des sessions')
      doc.moveDown(0.3)

      const columns: PdfTableColumn[] = [
        { label: 'Session',          x: 40,  width: 145 },
        { label: 'Filière / Classe', x: 185, width: 130 },
        { label: 'Date',             x: 315, width: 85,  align: 'center' },
        { label: 'Statut',           x: 400, width: 70,  align: 'center' },
        { label: 'Note',             x: 470, width: 85,  align: 'center' },
      ]

      const rows = participants.map(p => {
        const totalPoints = p.session.questions?.reduce((sum, q) => sum + q.points, 0) || 0
        const noteSur20 = totalPoints > 0 ? Math.round(((p.score || 0) / totalPoints) * 20 * 100) / 100 : null
        const statutLabel = p.statut === ParticipantStatus.TERMINE ? 'Terminé' : p.statut === ParticipantStatus.PRESENT ? 'En cours' : 'Inscrit'
        return [
          p.session.titre,
          `${p.session.filiere?.nom || '-'} / ${p.session.classe?.nom || '-'}`,
          new Date(p.session.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          statutLabel,
          noteSur20 !== null ? `${noteSur20}/20` : '-'
        ]
      })

      if (participants.length > 0) {
        drawPdfTable(doc, columns, rows, doc.y)
      } else {
        doc.font('Helvetica').fontSize(10).fillColor('#666').text('Aucune session pour le moment.')
      }
    } else {
      const sessions = await sessionRepo
        .createQueryBuilder('s')
        .leftJoinAndSelect('s.filiere', 'f')
        .leftJoinAndSelect('s.classe', 'c')
        .where('s.created_by = :id', { id })
        .orderBy('s.date_debut', 'DESC')
        .getMany()

      const nbParticipantsParSession = await Promise.all(
        sessions.map(s => participantRepo.count({ where: { session_id: s.id } }))
      )
      const totalParticipants = nbParticipantsParSession.reduce((a, b) => a + b, 0)

      // ─── Statistiques ────────────────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(11).text('Statistiques')
      doc.font('Helvetica').fontSize(10)
      doc.text(`Sessions créées : ${sessions.length}   ·   Total participants : ${totalParticipants}`)
      doc.moveDown(1)

      // ─── Historique des sessions ─────────────────────────────────────
      doc.font('Helvetica-Bold').fontSize(11).text('Sessions créées')
      doc.moveDown(0.3)

      const columns: PdfTableColumn[] = [
        { label: 'Session',          x: 40,  width: 145 },
        { label: 'Filière / Classe', x: 185, width: 130 },
        { label: 'Date',             x: 315, width: 85,  align: 'center' },
        { label: 'Statut',           x: 400, width: 70,  align: 'center' },
        { label: 'Participants',     x: 470, width: 85,  align: 'center' },
      ]

      const rows = sessions.map((s, i) => [
        s.titre,
        `${s.filiere?.nom || '-'} / ${s.classe?.nom || '-'}`,
        new Date(s.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
        s.status,
        `${nbParticipantsParSession[i]}`
      ])

      if (sessions.length > 0) {
        drawPdfTable(doc, columns, rows, doc.y)
      } else {
        doc.font('Helvetica').fontSize(10).fillColor('#666').text('Aucune session créée pour le moment.')
      }
    }

    doc.end()
  } catch (err) { next(err) }
}