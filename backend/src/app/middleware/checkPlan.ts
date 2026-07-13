// src/app/middleware/checkPlan.ts
import { Request, Response, NextFunction } from 'express'
import AppDataSource from '../../config/data-source'
import { Ecole } from '../models/Ecole'
import { User } from '../models/User'

interface AuthRequest extends Request { user?: User }

const ecoleRepo = AppDataSource.getRepository(Ecole)

export const LIMITES_PLANS = {
  gratuit: { maxEtudiants: 25,  maxProfs: 5,  maxSessions: 100, ia: false },
  starter: { maxEtudiants: 100, maxProfs: 15, maxSessions: -1,  ia: false },
  pro:     { maxEtudiants: -1,  maxProfs: -1, maxSessions: -1,  ia: true  },
}

// export const LIMITES_PLANS = {
//   gratuit: { maxEtudiants: 1,  maxProfs: 1,  maxSessions: 2, ia: false },
//   starter: { maxEtudiants: 2,  maxProfs: 2,  maxSessions: 3, ia: false },
//   pro:     { maxEtudiants: -1, maxProfs: -1, maxSessions: -1, ia: false  },
// }

// Vérifie si l'école peut encore inviter des étudiants
export const checkLimiteEtudiants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoleId = req.user!.ecoleId
    if (!ecoleId) { next(); return }

    const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
    if (!ecole) { next(); return }

    const limites = LIMITES_PLANS[ecole.plan]
    if (limites.maxEtudiants === -1) { next(); return } // illimité

    // Compter les étudiants actuels
    const { EtudiantProfil } = await import('../models/EtudiantProfil')
    const profilRepo = AppDataSource.getRepository(EtudiantProfil)
    const count = await profilRepo.count({ where: { ecoleId } })

    if (count >= limites.maxEtudiants) {
      res.status(403).json({
        success: false,
        message: `Limite atteinte : votre plan ${ecole.plan} permet ${limites.maxEtudiants} étudiants max. Upgradez pour continuer.`,
        code: 'LIMITE_ETUDIANTS',
        plan: ecole.plan
      })
      return
    }

    next()
  } catch (err) { next(err) }
}

// Vérifie si l'école peut encore inviter des professeurs
export const checkLimiteProfesseurs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoleId = req.user!.ecoleId
    if (!ecoleId) { next(); return }

    const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
    if (!ecole) { next(); return }

    const limites = LIMITES_PLANS[ecole.plan]
    if (limites.maxProfs === -1) { next(); return }

    const { ProfesseurProfil } = await import('../models/ProfesseurProfil')
    const profRepo = AppDataSource.getRepository(ProfesseurProfil)
    const count = await profRepo.count({ where: { ecoleId } })

    if (count >= limites.maxProfs) {
      res.status(403).json({
        success: false,
        message: `Limite atteinte : votre plan ${ecole.plan} permet ${limites.maxProfs} professeurs max. Upgradez pour continuer.`,
        code: 'LIMITE_PROFESSEURS',
        plan: ecole.plan
      })
      return
    }

    next()
  } catch (err) { next(err) }
}

// Vérifie si l'école peut créer des sessions ce mois
export const checkLimiteSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    if (!userId) { next(); return }

    const { ProfesseurProfil } = await import('../models/ProfesseurProfil')
    const profRepo = AppDataSource.getRepository(ProfesseurProfil)
    const profil = await profRepo.findOne({ where: { userId } })
    if (!profil?.ecoleId) { next(); return }

    const ecole = await ecoleRepo.findOne({ where: { id: profil.ecoleId } })
    if (!ecole) { next(); return }

    const limites = LIMITES_PLANS[ecole.plan]
    if (limites.maxSessions === -1) { next(); return }

    // Compter sessions ce mois
    const { Session } = await import('../models/Session')
    const sessionRepo = AppDataSource.getRepository(Session)
    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)

    const count = await sessionRepo
      .createQueryBuilder('s')
      .innerJoin('s.filiere', 'f')
      .where('f.ecoleId = :ecoleId', { ecoleId: profil.ecoleId })
      .andWhere('s.created_at >= :debut', { debut: debutMois })
      .getCount()

    if (count >= limites.maxSessions) {
      res.status(403).json({
        success: false,
        message: `Limite atteinte : votre plan ${ecole.plan} permet ${limites.maxSessions} sessions/mois. Upgradez pour continuer.`,
        code: 'LIMITE_SESSIONS',
        plan: ecole.plan
      })
      return
    }

    next()
  } catch (err) { next(err) }
}

// Vérifie si l'IA est disponible pour ce plan
export const checkPlanIA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ProfesseurProfil } = await import('../models/ProfesseurProfil')
    const profRepo = AppDataSource.getRepository(ProfesseurProfil)
    const profil = await profRepo.findOne({ where: { userId: req.user!.id } })
    if (!profil?.ecoleId) { next(); return }

    const ecole = await ecoleRepo.findOne({ where: { id: profil.ecoleId } })
    if (!ecole) { next(); return }

    if (!LIMITES_PLANS[ecole.plan].ia) {
      res.status(403).json({
        success: false,
        message: 'La génération IA est disponible uniquement avec le plan Pro.',
        code: 'PLAN_IA_REQUIS',
        plan: ecole.plan
      })
      return
    }

    next()
  } catch (err) { next(err) }
}