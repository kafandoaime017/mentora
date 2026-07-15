import { Router } from 'express';
import * as authController from '../../app/controllers/authController';
import { validerInscription, validerConnexion } from '../../app/middleware/validateAuth';
import { authMiddleware } from '../../app/middleware/auth';
import { authLimiter } from '../../app/middleware/rateLimiter';

const router = Router();

// Routes existantes
// authLimiter : limite stricte anti brute-force/credential stuffing sur ces endpoints sensibles
router.post('/register', authLimiter, validerInscription, authController.inscription);
router.post('/login', authLimiter, validerConnexion, authController.connexion);


// Google OAuth
router.post('/google', authController.connexionGoogle); // Connexion directe avec token (mobile/SPA)

// Routes Google OAuth avec redirection
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);

// Routes verification email
router.post('/verifier-email', authLimiter, authController.verifierEmail);
router.post('/renvoyer-code', authLimiter, authController.renvoyerCode);

// Routes reinitialisation mot de passe
router.post('/mot-de-passe-oublie', authLimiter, authController.envoyerLienReset);
router.post('/reinitialiser-mot-de-passe', authLimiter, authController.reinitialiserMotDePasse);
router.get('/verifier-token-reset/:token', authController.verifierTokenReset);


// --- Routes protegees (profil connecte) ---
router.post('/envoyer-code-mdp',     authMiddleware, authController.envoyerCodeChangementMdp)
router.post('/changer-mot-de-passe', authMiddleware, authController.changerMotDePasse)

export default router;
