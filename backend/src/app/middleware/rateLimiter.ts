import rateLimit from 'express-rate-limit'

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 min par défaut
const max      = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')

// ─── Limiteur général : toutes les routes /api ────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard.' },
})

// ─── Limiteur strict : endpoints sensibles (login, inscription, reset mdp) ────
// Protège contre le brute-force / credential stuffing indépendamment du quota général.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives, veuillez réessayer dans quelques minutes.' },
  skipSuccessfulRequests: true,
})
