import AppDataSource from '../../config/data-source'
import { AuditLog } from '../models/AuditLog'

interface LogAuditParams {
    ecoleId?: number | null
    userId?: number | null
    userNom?: string
    userRole?: string
    action: string
    cibleType?: string | null
    cibleId?: number | null
    details?: any
    ip?: string | null
}

const auditRepo = AppDataSource.getRepository(AuditLog)

// Ne doit jamais faire planter l'action appelante : simple journalisation
// best-effort pour la conformité / le suivi côté directeur.
export const logAudit = async (params: LogAuditParams): Promise<void> => {
    try {
        const log = auditRepo.create({
            ecole_id: params.ecoleId ?? null,
            user_id: params.userId ?? null,
            user_nom: params.userNom || '',
            user_role: params.userRole || '',
            action: params.action,
            cible_type: params.cibleType ?? null,
            cible_id: params.cibleId ?? null,
            details: params.details ?? null,
            ip_address: params.ip ?? null,
        })
        await auditRepo.save(log)
    } catch (err) {
        console.error('Erreur enregistrement audit log:', err)
    }
}

// Extrait l'ip cliente d'une requête Express (gère le cas proxy/nginx)
export const getClientIp = (req: any): string | null => {
    const forwarded = req.headers?.['x-forwarded-for']
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim()
    }
    return req.socket?.remoteAddress || req.ip || null
}
