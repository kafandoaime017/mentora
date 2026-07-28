import { Request, Response, NextFunction } from 'express'
import AppDataSource from '../../config/data-source'
import { User } from '../models/User'
import { AuditLog } from '../models/AuditLog'
import { Ecole } from '../models/Ecole'

interface AuthRequest extends Request { user?: User }

const auditRepo = AppDataSource.getRepository(AuditLog)
const ecoleRepo = AppDataSource.getRepository(Ecole)

// Liste paginée des logs d'audit de l'école du directeur, avec filtres
// optionnels (action, utilisateur, dates) — utile pour la conformité.
export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = req.user!.ecoleId
        if (!ecoleId) { res.status(400).json({ success: false, message: 'Directeur non associé à une école' }); return }

        const page   = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30))
        const { action, userId, dateDebut, dateFin } = req.query

        const qb = auditRepo.createQueryBuilder('a')
            .where('a.ecole_id = :ecoleId', { ecoleId })

        if (action)   qb.andWhere('a.action = :action', { action })
        if (userId)   qb.andWhere('a.user_id = :userId', { userId: parseInt(userId as string) })
        if (dateDebut) qb.andWhere('a.created_at >= :dateDebut', { dateDebut })
        if (dateFin)   qb.andWhere('a.created_at <= :dateFin', { dateFin })

        qb.orderBy('a.created_at', 'DESC')
          .skip((page - 1) * limit)
          .take(limit)

        const [logs, total] = await qb.getManyAndCount()

        const actionsDistinctes = await auditRepo.createQueryBuilder('a')
            .select('DISTINCT a.action', 'action')
            .where('a.ecole_id = :ecoleId', { ecoleId })
            .getRawMany()

        res.json({
            success: true,
            data: {
                logs,
                total,
                page,
                totalPages: Math.max(1, Math.ceil(total / limit)),
                actionsDisponibles: actionsDistinctes.map(a => a.action)
            }
        })
    } catch (err) { next(err) }
}

// Liste paginée des logs d'audit de TOUTES les écoles de la plateforme,
// réservée au superadmin — vue globale de l'activité (conformité + supervision).
export const getAuditLogsGlobal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const page   = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30))
        const { action, ecoleId, dateDebut, dateFin } = req.query

        const qb = auditRepo.createQueryBuilder('a')

        if (action)    qb.andWhere('a.action = :action', { action })
        if (ecoleId)   qb.andWhere('a.ecole_id = :ecoleId', { ecoleId: parseInt(ecoleId as string) })
        if (dateDebut) qb.andWhere('a.created_at >= :dateDebut', { dateDebut })
        if (dateFin)   qb.andWhere('a.created_at <= :dateFin', { dateFin })

        const total = await qb.getCount()

        qb.leftJoin('ecoles', 'e', 'e.id = a.ecole_id')
          .addSelect('e.nom', 'ecole_nom')
          .orderBy('a.created_at', 'DESC')
          .skip((page - 1) * limit)
          .take(limit)

        const { entities, raw } = await qb.getRawAndEntities()
        const logs = entities.map((log, i) => ({ ...log, ecole_nom: raw[i]?.ecole_nom || null }))

        const actionsDistinctes = await auditRepo.createQueryBuilder('a')
            .select('DISTINCT a.action', 'action')
            .getRawMany()

        const ecoles = await ecoleRepo.createQueryBuilder('e')
            .select(['e.id', 'e.nom'])
            .orderBy('e.nom', 'ASC')
            .getMany()

        res.json({
            success: true,
            data: {
                logs,
                total,
                page,
                totalPages: Math.max(1, Math.ceil(total / limit)),
                actionsDisponibles: actionsDistinctes.map(a => a.action),
                ecoles
            }
        })
    } catch (err) { next(err) }
}
