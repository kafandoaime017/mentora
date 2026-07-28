import { Request, Response, NextFunction } from 'express'
import Stripe from 'stripe'
import AppDataSource from '../../config/data-source'
import { Ecole } from '../models/Ecole'
import { User } from '../models/User'
import {
  envoyerEmailPaiementEchoue,
  envoyerEmailAbonnementAnnule,
  envoyerEmailFinEssai,
  envoyerEmailFacture,
  envoyerEmailPlanActive
} from '../services/emailService'

const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY!)
const ecoleRepo = AppDataSource.getRepository(Ecole)

interface AuthRequest extends Request { user?: User }

const PRICE_IDS: Record<string, string> = {
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY!,
  starter_yearly:  process.env.STRIPE_STARTER_YEARLY!,
  pro_monthly:     process.env.STRIPE_PRO_MONTHLY!,
  pro_yearly:      process.env.STRIPE_PRO_YEARLY!,
}

const LIMITES: Record<string, { maxEtudiants: number, maxProfs: number, maxSessions: number, ia: boolean }> = {
  gratuit: { maxEtudiants: 25,  maxProfs: 5,  maxSessions: 100, ia: false },
  starter: { maxEtudiants: 100, maxProfs: 15, maxSessions: -1,  ia: false },
  pro:     { maxEtudiants: -1,  maxProfs: -1, maxSessions: -1,  ia: true  },
}

// ─── Helper : récupère le directeur d'une école ───────────────────────────────
const getDirecteurEcole = async (ecoleId: number): Promise<User | null> => {
  const userRepo = AppDataSource.getRepository(User)
  return await userRepo.findOne({ where: { ecoleId, role: 'directeur' as any } })
}

// ─── Helper : déduit le plan depuis le price_id ───────────────────────────────
const getPlanFromPriceId = (priceId: string): 'starter' | 'pro' | null => {
  if (priceId === process.env.STRIPE_STARTER_MONTHLY ||
      priceId === process.env.STRIPE_STARTER_YEARLY) return 'starter'
  if (priceId === process.env.STRIPE_PRO_MONTHLY ||
      priceId === process.env.STRIPE_PRO_YEARLY)   return 'pro'
  return null
}

// ─── Helper : vérifie que le directeur appartient bien à l'école ──────────────
const verifierAppartenance = async (userId: number, ecoleId: number): Promise<boolean> => {
  const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } })
  return user?.ecoleId === ecoleId
}

// ─── Helper : récupère le statut réel depuis Stripe ──────────────────────────
const getStatutStripe = async (subscriptionId: string): Promise<string | null> => {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    return sub.status
  } catch {
    return null
  }
}

// ─── Helper : formate un montant Stripe en euros ──────────────────────────────
const formatMontant = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100)
}

// ─── Créer une session Stripe Checkout ───────────────────────────────────────
export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { plan, billing, ecoleId } = req.body

    if (!plan || !billing || !ecoleId) {
      res.status(400).json({ success: false, message: 'plan, billing et ecoleId requis' })
      return
    }

    if (!['starter', 'pro'].includes(plan)) {
      res.status(400).json({ success: false, message: 'Plan invalide' })
      return
    }

    if (!['monthly', 'yearly'].includes(billing)) {
      res.status(400).json({ success: false, message: 'Billing invalide' })
      return
    }

    const appartient = await verifierAppartenance(req.user!.id, parseInt(ecoleId))
    if (!appartient) {
      res.status(403).json({ success: false, message: 'Accès non autorisé à cette école' })
      return
    }

    const priceId = PRICE_IDS[`${plan}_${billing}`]
    if (!priceId) {
      res.status(400).json({ success: false, message: 'Plan invalide' })
      return
    }

    const ecole = await ecoleRepo.findOne({ where: { id: parseInt(ecoleId) } })
    if (!ecole) {
      res.status(404).json({ success: false, message: 'École non trouvée' })
      return
    }

    if (ecole.stripe_subscription_id) {
      const statut = await getStatutStripe(ecole.stripe_subscription_id)
      if (statut === 'active' || statut === 'trialing') {
        res.status(400).json({
          success: false,
          message: 'Vous avez déjà un abonnement actif. Utilisez le portail pour le modifier.',
          code: 'ABONNEMENT_ACTIF'
        })
        return
      }
      ecole.stripe_subscription_id = null
      ecole.plan                   = 'gratuit'
      await ecoleRepo.save(ecole)
    }

    let customerId = ecole.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    req.user!.email,
        name:     ecole.nom,
        metadata: { ecoleId: String(ecoleId), userId: String(req.user!.id) }
      })
      customerId               = customer.id
      ecole.stripe_customer_id = customerId
      await ecoleRepo.save(ecole)
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status:   'all',
      limit:    10
    })
    const aDejaEuEssai = subscriptions.data.some(s => s.trial_start !== null)

    const sessionData: Stripe.Checkout.SessionCreateParams = {
      customer:             customerId,
      payment_method_types: ['card'],
      line_items:           [{ price: priceId, quantity: 1 }],
      mode:                 'subscription',
      success_url:          `${process.env.FRONTEND_URL}/directeurs/abonnement?success=true&plan=${plan}`,
      cancel_url:           `${process.env.FRONTEND_URL}/directeurs/abonnement?canceled=true`,
      metadata:             { ecoleId: String(ecoleId), plan, billing },
      subscription_data: aDejaEuEssai
        ? { metadata: { ecoleId: String(ecoleId), plan } }
        : { trial_period_days: 30, metadata: { ecoleId: String(ecoleId), plan } }
    }

    const session = await stripe.checkout.sessions.create(sessionData)
    res.json({ success: true, data: { url: session.url } })
  } catch (err) { next(err) }
}

// ─── Webhook Stripe ───────────────────────────────────────────────────────────
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string

  if (!sig) {
    res.status(400).send('Signature manquante')
    return
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const ecoleId = parseInt(session.metadata?.ecoleId || '0')
        const plan    = session.metadata?.plan as 'starter' | 'pro'
        const subId   = session.subscription as string

        if (!ecoleId || !plan || !['starter', 'pro'].includes(plan)) {
          console.error('❌ Metadata invalide dans checkout.session.completed')
          break
        }

        const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
        if (ecole) {
          ecole.plan                   = plan
          ecole.stripe_subscription_id = subId
          ecole.plan_expire_at         = null
          await ecoleRepo.save(ecole)

          const directeur = await getDirecteurEcole(ecoleId)
          if (directeur) {
            await envoyerEmailPlanActive(
              directeur.email,
              directeur.prenom,
              ecole.nom,
              plan,
              true // toujours trial au checkout
            )
          }
          console.log(`✅ École ${ecoleId} → plan ${plan}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub     = event.data.object as Stripe.Subscription
        const ecoleId = parseInt(sub.metadata?.ecoleId || '0')
        if (!ecoleId) break

        const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
        if (!ecole) break

        if (sub.status === 'active' || sub.status === 'trialing') {
          // Déduire le plan depuis le price_id réel (gère upgrade/downgrade via portail)
          const priceId  = sub.items.data[0]?.price?.id
          const planReel = getPlanFromPriceId(priceId)

          if (planReel && planReel !== ecole.plan) {
            const ancienPlan = ecole.plan
            ecole.plan       = planReel

            const directeur = await getDirecteurEcole(ecoleId)
            if (directeur) {
              await envoyerEmailPlanActive(
                directeur.email,
                directeur.prenom,
                ecole.nom,
                planReel,
                sub.status === 'trialing'
              )
            }
            console.log(`🔄 École ${ecoleId} : ${ancienPlan} → ${planReel}`)
          }
        } else if (sub.status === 'past_due') {
          console.log(`⚠️ Paiement en retard école ${ecoleId} — Stripe va réessayer`)
        } else if (sub.status === 'canceled' || sub.status === 'unpaid') {
          ecole.plan                   = 'gratuit'
          ecole.stripe_subscription_id = null
        }

        await ecoleRepo.save(ecole)
        break
      }

      case 'customer.subscription.deleted': {
        const sub     = event.data.object as Stripe.Subscription
        const ecoleId = parseInt(sub.metadata?.ecoleId || '0')
        if (!ecoleId) break

        const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
        if (ecole) {
          const ancienPlan             = ecole.plan
          ecole.plan                   = 'gratuit'
          ecole.stripe_subscription_id = null
          ecole.plan_expire_at         = null
          await ecoleRepo.save(ecole)

          const directeur = await getDirecteurEcole(ecoleId)
          if (directeur) {
            await envoyerEmailAbonnementAnnule(
              directeur.email,
              directeur.prenom,
              ecole.nom,
              ancienPlan
            )
          }
          console.log(`⚠️ École ${ecoleId} → gratuit (annulation)`)
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        const sub     = event.data.object as Stripe.Subscription
        const ecoleId = parseInt(sub.metadata?.ecoleId || '0')
        if (!ecoleId || !sub.trial_end) break

        const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
        if (ecole) {
          const directeur = await getDirecteurEcole(ecoleId)
          if (directeur) {
            const now           = Math.floor(Date.now() / 1000)
            const joursRestants = Math.max(0, Math.ceil((sub.trial_end - now) / 86400))
            const finEssai      = new Date(sub.trial_end * 1000).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })
            await envoyerEmailFinEssai(
              directeur.email,
              directeur.prenom,
              ecole.nom,
              joursRestants,
              finEssai
            )
            console.log(`⏰ Email fin essai → ${directeur.email} (${joursRestants}j restants)`)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subId   = (invoice as any).subscription as string | null
        if (!subId) break

        const ecole = await ecoleRepo.findOne({ where: { stripe_subscription_id: subId } })
        if (ecole) {
          const directeur = await getDirecteurEcole(ecole.id)
          if (directeur && invoice.hosted_invoice_url) {
            const montant = formatMontant(invoice.amount_paid || 0, invoice.currency || 'eur')
            const periode = new Date((invoice.period_start || 0) * 1000)
              .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

            await envoyerEmailFacture(
              directeur.email,
              directeur.prenom,
              ecole.nom,
              montant,
              periode,
              invoice.hosted_invoice_url
            )
            console.log(`💰 Facture envoyée → ${directeur.email}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice  = event.data.object as Stripe.Invoice
        const customer = invoice.customer as string
        const ecole    = await ecoleRepo.findOne({ where: { stripe_customer_id: customer } })

        if (ecole) {
          const directeur = await getDirecteurEcole(ecole.id)
          if (directeur) {
            const montant = formatMontant(invoice.amount_due || 0, invoice.currency || 'eur')
            await envoyerEmailPaiementEchoue(
              directeur.email,
              directeur.prenom,
              ecole.nom,
              montant
            )
            console.log(`❌ Email paiement échoué → ${directeur.email}`)
          }
        }
        break
      }

      default:
        console.log(`Event Stripe non géré: ${event.type}`)
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    res.json({ received: true })
  }
}

// ─── Portail client Stripe ────────────────────────────────────────────────────
export const createPortalSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoleId = req.user!.ecoleId
    if (!ecoleId) {
      res.status(400).json({ success: false, message: 'Pas d\'école associée' })
      return
    }

    const appartient = await verifierAppartenance(req.user!.id, ecoleId)
    if (!appartient) {
      res.status(403).json({ success: false, message: 'Accès non autorisé' })
      return
    }

    const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
    if (!ecole?.stripe_customer_id) {
      res.status(400).json({ success: false, message: 'Aucun abonnement actif' })
      return
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:   ecole.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/directeurs/abonnement`
    })

    res.json({ success: true, data: { url: session.url } })
  } catch (err) { next(err) }
}

// ─── Statut abonnement ────────────────────────────────────────────────────────
export const getAbonnement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ecoleId = req.user!.ecoleId
    if (!ecoleId) {
      res.status(400).json({ success: false, message: 'Pas d\'école associée' })
      return
    }

    const ecole = await ecoleRepo.findOne({ where: { id: ecoleId } })
    if (!ecole) {
      res.status(404).json({ success: false, message: 'École non trouvée' })
      return
    }

    let planReel    = ecole.plan
    let isTrial     = false
    let trialDaysLeft = 0

    if (ecole.stripe_subscription_id) {
      try {
        const sub = await stripe.subscriptions.retrieve(ecole.stripe_subscription_id)

        if (sub.status === 'canceled' || sub.status === 'unpaid' || sub.status === 'incomplete_expired') {
          ecole.plan                   = 'gratuit'
          ecole.stripe_subscription_id = null
          await ecoleRepo.save(ecole)
          planReel = 'gratuit'
        } else {
          // Déduire le plan réel depuis le price_id
          const priceId      = sub.items.data[0]?.price?.id
          const planDeprix   = getPlanFromPriceId(priceId)
          if (planDeprix) planReel = planDeprix

          // Vérifier période d'essai
          if (sub.status === 'trialing' && sub.trial_end) {
            isTrial       = true
            const now     = Math.floor(Date.now() / 1000)
            trialDaysLeft = Math.max(0, Math.ceil((sub.trial_end - now) / 86400))
          }
        }
      } catch {
        // Sub introuvable sur Stripe → reset
        ecole.plan                   = 'gratuit'
        ecole.stripe_subscription_id = null
        await ecoleRepo.save(ecole)
        planReel = 'gratuit'
      }
    }

    res.json({
      success: true,
      data: {
        ecoleId,
        plan:            planReel,
        is_trial:        isTrial,
        trial_days_left: trialDaysLeft,
        expire_at:       ecole.plan_expire_at,
        limites:         LIMITES[planReel],
        has_stripe:      !!ecole.stripe_customer_id,
        sub_id:          ecole.stripe_subscription_id
      }
    })
  } catch (err) { next(err) }
}