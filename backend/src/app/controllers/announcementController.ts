import { Request, Response, NextFunction } from 'express'
import AppDataSource from '../../config/data-source'
import { User } from '../models/User'
import { Annonce, AnnonceType, AnnonceCible } from '../models/Annonce'
import { AnnonceInteraction } from '../models/AnnonceInteraction'
import { EtudiantProfil } from '../models/EtudiantProfil'
import { ProfesseurProfil } from '../models/ProfesseurProfil'
import { Filiere } from '../models/Filiere'
import { Classe } from '../models/Classe'
import { logAudit, getClientIp } from '../services/auditService'

interface AuthRequest extends Request { user?: User }

const annonceRepo     = AppDataSource.getRepository(Annonce)
const interactionRepo = AppDataSource.getRepository(AnnonceInteraction)
const etudiantRepo    = AppDataSource.getRepository(EtudiantProfil)
const professeurRepo  = AppDataSource.getRepository(ProfesseurProfil)
const filiereRepo     = AppDataSource.getRepository(Filiere)
const classeRepo      = AppDataSource.getRepository(Classe)

const getEcoleId = (req: AuthRequest, res: Response): number | null => {
    const ecoleId = req.user!.ecoleId
    if (!ecoleId) {
        res.status(400).json({ success: false, message: 'Directeur non associé à une école' })
        return null
    }
    return ecoleId
}

// Ids des utilisateurs (users.id) ciblés par une annonce, pour calculer
// l'audience et le taux de participation côté directeur.
const getUtilisateursCibles = async (annonce: Annonce): Promise<number[]> => {
    if (annonce.cible_type === AnnonceCible.PROFESSEURS) {
        const profs = await professeurRepo.find({ where: { ecoleId: annonce.ecole_id } })
        return profs.map(p => p.userId)
    }
    if (annonce.cible_type === AnnonceCible.FILIERE) {
        const etus = await etudiantRepo.find({ where: { ecoleId: annonce.ecole_id, filiereId: annonce.cible_filiere_id! } })
        return etus.map(e => e.userId)
    }
    if (annonce.cible_type === AnnonceCible.CLASSE) {
        const etus = await etudiantRepo.find({ where: { ecoleId: annonce.ecole_id, classeId: annonce.cible_classe_id! } })
        return etus.map(e => e.userId)
    }
    // tous : étudiants + professeurs de l'école
    const [etus, profs] = await Promise.all([
        etudiantRepo.find({ where: { ecoleId: annonce.ecole_id } }),
        professeurRepo.find({ where: { ecoleId: annonce.ecole_id } })
    ])
    return [...etus.map(e => e.userId), ...profs.map(p => p.userId)]
}

// Est-ce que cet utilisateur (rôle + filière + classe) est concerné par
// l'annonce ? Évite une requête supplémentaire par annonce côté consultation.
const userMatchesCible = (annonce: Annonce, role: string, filiereId: number | null, classeId: number | null): boolean => {
    if (annonce.cible_type === AnnonceCible.PROFESSEURS) return role === 'professeur'
    if (annonce.cible_type === AnnonceCible.FILIERE) return role === 'etudiant' && filiereId === annonce.cible_filiere_id
    if (annonce.cible_type === AnnonceCible.CLASSE) return role === 'etudiant' && classeId === annonce.cible_classe_id
    return role === 'etudiant' || role === 'professeur' // tous
}

// ==================== CÔTÉ DIRECTEUR ====================

export const getAnnonces = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const annonces = await annonceRepo.find({
            where: { ecole_id: ecoleId },
            relations: ['auteur', 'cible_filiere', 'cible_classe'],
            order: { created_at: 'DESC' }
        })

        const data = await Promise.all(annonces.map(async (a) => {
            const cibles = await getUtilisateursCibles(a)
            let nbReponses = 0
            let nbVus = 0
            if (cibles.length > 0) {
                nbReponses = await interactionRepo.createQueryBuilder('i')
                    .where('i.annonce_id = :id', { id: a.id })
                    .andWhere('i.repondu_at IS NOT NULL')
                    .getCount()
                nbVus = await interactionRepo.createQueryBuilder('i')
                    .where('i.annonce_id = :id', { id: a.id })
                    .andWhere('i.vue = true')
                    .getCount()
            }
            return {
                id: a.id,
                titre: a.titre,
                contenu: a.contenu,
                type: a.type,
                obligatoire: a.obligatoire,
                options: a.options,
                cible_type: a.cible_type,
                cible_filiere: a.cible_filiere ? { id: a.cible_filiere.id, nom: a.cible_filiere.nom } : null,
                cible_classe: a.cible_classe ? { id: a.cible_classe.id, nom: a.cible_classe.nom } : null,
                actif: a.actif,
                created_at: a.created_at,
                auteur: a.auteur ? { nom: a.auteur.nom, prenom: a.auteur.prenom } : null,
                audience: cibles.length,
                nb_vus: nbVus,
                nb_reponses: nbReponses
            }
        }))

        res.json({ success: true, data })
    } catch (err) { next(err) }
}

export const getAnnonceResultats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const annonce = await annonceRepo.findOne({ where: { id: parseInt(req.params.id), ecole_id: ecoleId } })
        if (!annonce) { res.status(404).json({ success: false, message: 'Annonce introuvable' }); return }

        const cibles = await getUtilisateursCibles(annonce)
        const interactions = await interactionRepo.find({ where: { annonce_id: annonce.id }, relations: ['user'] })

        let resultatsOptions: { texte: string, nb: number }[] | null = null
        if (annonce.type === AnnonceType.SONDAGE && Array.isArray(annonce.options)) {
            resultatsOptions = annonce.options.map((texte, idx) => ({
                texte,
                nb: interactions.filter(i => i.option_choisie === idx).length
            }))
        }

        res.json({
            success: true,
            data: {
                id: annonce.id,
                titre: annonce.titre,
                type: annonce.type,
                obligatoire: annonce.obligatoire,
                audience: cibles.length,
                nb_vus: interactions.filter(i => i.vue).length,
                nb_reponses: interactions.filter(i => i.repondu_at).length,
                resultats_options: resultatsOptions,
                repondants: interactions.filter(i => i.repondu_at).map(i => ({
                    nom: i.user?.nom, prenom: i.user?.prenom, option_choisie: i.option_choisie, repondu_at: i.repondu_at
                }))
            }
        })
    } catch (err) { next(err) }
}

export const createAnnonce = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const { titre, contenu, type, obligatoire, options, cible_type, cible_filiere_id, cible_classe_id } = req.body

        if (!titre?.trim() || !contenu?.trim()) {
            res.status(400).json({ success: false, message: 'Titre et contenu requis' }); return
        }
        if (!['info', 'sondage'].includes(type)) {
            res.status(400).json({ success: false, message: 'Type invalide' }); return
        }
        if (!['tous', 'filiere', 'classe', 'professeurs'].includes(cible_type)) {
            res.status(400).json({ success: false, message: 'Cible invalide' }); return
        }

        let optionsFinal: string[] | null = null
        if (type === 'sondage') {
            const opts = (options || []).map((o: string) => o?.trim()).filter(Boolean)
            if (opts.length < 2) {
                res.status(400).json({ success: false, message: 'Un sondage nécessite au moins 2 options' }); return
            }
            optionsFinal = opts
        }

        let filiereId: number | null = null
        let classeId: number | null = null

        if (cible_type === 'filiere') {
            const filiere = await filiereRepo.findOne({ where: { id: cible_filiere_id, ecoleId } })
            if (!filiere) { res.status(400).json({ success: false, message: 'Filière invalide' }); return }
            filiereId = filiere.id
        }
        if (cible_type === 'classe') {
            const classe = await classeRepo.findOne({ where: { id: cible_classe_id }, relations: ['filiere'] })
            if (!classe || classe.filiere?.ecoleId !== ecoleId) { res.status(400).json({ success: false, message: 'Classe invalide' }); return }
            classeId = classe.id
        }

        const annonce = annonceRepo.create({
            ecole_id: ecoleId,
            auteur_id: req.user!.id,
            titre: titre.trim(),
            contenu: contenu.trim(),
            type,
            obligatoire: type === 'sondage' ? !!obligatoire : false,
            options: optionsFinal,
            cible_type,
            cible_filiere_id: filiereId,
            cible_classe_id: classeId,
            actif: true
        })
        await annonceRepo.save(annonce)

        logAudit({
            ecoleId, userId: req.user!.id, userNom: `${req.user!.prenom} ${req.user!.nom}`, userRole: req.user!.role,
            action: type === 'sondage' ? 'creation_sondage' : 'creation_annonce',
            cibleType: 'annonce', cibleId: annonce.id,
            details: { titre: annonce.titre, cible_type },
            ip: getClientIp(req)
        })

        res.json({ success: true, data: annonce })
    } catch (err) { next(err) }
}

export const toggleAnnonceActif = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const annonce = await annonceRepo.findOne({ where: { id: parseInt(req.params.id), ecole_id: ecoleId } })
        if (!annonce) { res.status(404).json({ success: false, message: 'Annonce introuvable' }); return }

        annonce.actif = !annonce.actif
        await annonceRepo.save(annonce)

        logAudit({
            ecoleId, userId: req.user!.id, userNom: `${req.user!.prenom} ${req.user!.nom}`, userRole: req.user!.role,
            action: annonce.actif ? 'reactivation_annonce' : 'desactivation_annonce',
            cibleType: 'annonce', cibleId: annonce.id, ip: getClientIp(req)
        })

        res.json({ success: true, data: { actif: annonce.actif } })
    } catch (err) { next(err) }
}

export const deleteAnnonce = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ecoleId = getEcoleId(req, res)
        if (!ecoleId) return

        const annonce = await annonceRepo.findOne({ where: { id: parseInt(req.params.id), ecole_id: ecoleId } })
        if (!annonce) { res.status(404).json({ success: false, message: 'Annonce introuvable' }); return }

        await annonceRepo.remove(annonce)

        logAudit({
            ecoleId, userId: req.user!.id, userNom: `${req.user!.prenom} ${req.user!.nom}`, userRole: req.user!.role,
            action: 'suppression_annonce', cibleType: 'annonce', cibleId: parseInt(req.params.id), ip: getClientIp(req)
        })

        res.json({ success: true })
    } catch (err) { next(err) }
}

// ==================== CÔTÉ ÉTUDIANT / PROFESSEUR ====================

export const getAnnoncesActives = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!
        if (!['etudiant', 'professeur'].includes(user.role)) { res.json({ success: true, data: [] }); return }

        let ecoleId: number | null = null
        let filiereId: number | null = null
        let classeId: number | null = null

        if (user.role === 'etudiant') {
            const profil = await etudiantRepo.findOne({ where: { userId: user.id } })
            ecoleId = profil?.ecoleId ?? null
            filiereId = profil?.filiereId ?? null
            classeId = profil?.classeId ?? null
        } else {
            const profil = await professeurRepo.findOne({ where: { userId: user.id } })
            ecoleId = profil?.ecoleId ?? null
            filiereId = profil?.filiereId ?? null
        }

        if (!ecoleId) { res.json({ success: true, data: [] }); return }

        const annonces = await annonceRepo.find({ where: { ecole_id: ecoleId, actif: true }, order: { created_at: 'DESC' } })
        const concernees = annonces.filter(a => userMatchesCible(a, user.role, filiereId, classeId))

        if (concernees.length === 0) { res.json({ success: true, data: [] }); return }

        const interactions = await interactionRepo.find({
            where: concernees.map(a => ({ annonce_id: a.id, user_id: user.id }))
        })
        const interactionByAnnonce: Record<number, AnnonceInteraction> = {}
        interactions.forEach(i => { interactionByAnnonce[i.annonce_id] = i })

        // Une annonce reste affichée tant qu'elle n'a pas été "vue" (info /
        // sondage non obligatoire) ou répondue (sondage obligatoire).
        const aAfficher = concernees.filter(a => {
            const inter = interactionByAnnonce[a.id]
            if (!inter) return true
            if (a.type === AnnonceType.SONDAGE && a.obligatoire) return !inter.repondu_at
            return !inter.vue
        })

        res.json({
            success: true,
            data: aAfficher.map(a => ({
                id: a.id, titre: a.titre, contenu: a.contenu, type: a.type,
                obligatoire: a.obligatoire, options: a.options, created_at: a.created_at
            }))
        })
    } catch (err) { next(err) }
}

const getOrCreateInteraction = async (annonceId: number, userId: number): Promise<AnnonceInteraction> => {
    let inter = await interactionRepo.findOne({ where: { annonce_id: annonceId, user_id: userId } })
    if (!inter) {
        inter = interactionRepo.create({ annonce_id: annonceId, user_id: userId })
    }
    return inter
}

export const marquerAnnonceVue = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const annonceId = parseInt(req.params.id)
        const annonce = await annonceRepo.findOne({ where: { id: annonceId } })
        if (!annonce) { res.status(404).json({ success: false, message: 'Annonce introuvable' }); return }
        if (annonce.type === AnnonceType.SONDAGE && annonce.obligatoire) {
            res.status(400).json({ success: false, message: 'Ce sondage est obligatoire, vous devez y répondre' }); return
        }

        const inter = await getOrCreateInteraction(annonceId, req.user!.id)
        inter.vue = true
        inter.vue_at = new Date()
        await interactionRepo.save(inter)

        res.json({ success: true })
    } catch (err) { next(err) }
}

export const repondreAnnonce = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const annonceId = parseInt(req.params.id)
        const { optionIndex } = req.body
        const annonce = await annonceRepo.findOne({ where: { id: annonceId } })
        if (!annonce) { res.status(404).json({ success: false, message: 'Annonce introuvable' }); return }
        if (annonce.type !== AnnonceType.SONDAGE) { res.status(400).json({ success: false, message: 'Ceci n\'est pas un sondage' }); return }
        if (typeof optionIndex !== 'number' || !annonce.options || optionIndex < 0 || optionIndex >= annonce.options.length) {
            res.status(400).json({ success: false, message: 'Option invalide' }); return
        }

        const inter = await getOrCreateInteraction(annonceId, req.user!.id)
        inter.vue = true
        inter.vue_at = inter.vue_at || new Date()
        inter.option_choisie = optionIndex
        inter.repondu_at = new Date()
        await interactionRepo.save(inter)

        res.json({ success: true })
    } catch (err) { next(err) }
}
