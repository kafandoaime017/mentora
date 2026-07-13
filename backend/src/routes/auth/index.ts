import { Router } from 'express';
import * as authController from '../../app/controllers/authController';
import { validerInscription, validerConnexion } from '../../app/middleware/validateAuth';
import { authMiddleware } from '../../app/middleware/auth';

const router = Router();

// Routes existantes
router.post('/register', validerInscription, authController.inscription);
router.post('/login', validerConnexion, authController.connexion);


// Google OAuth
router.post('/google', authController.connexionGoogle); // Connexion directe avec token (mobile/SPA)

// 🆕 Routes Google OAuth avec redirection
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.googleCallback);

// Routes vérification email
router.post('/verifier-email', authController.verifierEmail);
router.post('/renvoyer-code', authController.renvoyerCode);

// 🆕 Routes réinitialisation mot de passe
router.post('/mot-de-passe-oublie', authController.envoyerLienReset);
router.post('/reinitialiser-mot-de-passe', authController.reinitialiserMotDePasse);
router.get('/verifier-token-reset/:token', authController.verifierTokenReset);


// ─── Routes protégées (profil connecté) ──────────────────────────────────────
router.post('/envoyer-code-mdp',     authMiddleware, authController.envoyerCodeChangementMdp)
router.post('/changer-mot-de-passe', authMiddleware, authController.changerMotDePasse)

export default router;