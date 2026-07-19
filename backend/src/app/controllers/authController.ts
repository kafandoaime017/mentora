// controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { OAuth2Client } from 'google-auth-library';
import AppDataSource from '../../config/data-source';
import { ProfesseurProfil } from '../models/ProfesseurProfil';
import { logAudit, getClientIp } from '../services/auditService';

// Le redirect_uri DOIT pointer vers le backend (seul lui possède le client secret
// pour échanger le "code" contre un token) - PAS vers le frontend. C'est ce backend
// qui, une fois l'échange fait, redirige ensuite vers la page frontend dédiée
// (/auth/google-callback) avec le token applicatif en query string.
// Important : cette URL doit être enregistrée telle quelle dans "Authorized redirect URIs"
// sur la Google Cloud Console, sinon Google refusera avec "redirect_uri_mismatch".
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_URL}/api/auth/google/callback`
);

export const inscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.inscrireEtudiant(req.body);
    res.status(result.success ? 200 : (result as any).status || 400).json(result);
  } catch (err) { next(err); }
};

export const connexion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.connecter(req.body);

    // Audit : on ne journalise que les connexions pleinement abouties
    // (pas les demandes de code TOTP, qui ne sont qu'une etape intermediaire).
    if (result?.success && result.token && result.user) {
      let ecoleId: number | null = result.user.profil?.ecoleId ?? null
      if (result.user.role === 'professeur' && !ecoleId) {
        const profil = await AppDataSource.getRepository(ProfesseurProfil).findOne({ where: { userId: result.user.id } })
        ecoleId = profil?.ecoleId ?? null
      }
      logAudit({
        ecoleId,
        userId: result.user.id,
        userNom: `${result.user.prenom} ${result.user.nom}`,
        userRole: result.user.role,
        action: 'connexion',
        ip: getClientIp(req)
      })
    }

    res.json(result);
  } catch (err: any) {
    logAudit({ action: 'connexion_echouee', details: { email: req.body?.email, motif: err?.message }, ip: getClientIp(req) })
    next(err);
  }
};

export const connexionGoogle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (!idToken) { res.status(400).json({ success: false, message: 'idToken requis.' }); return; }
    const result = await authService.connecterAvecGoogle(idToken);
    res.status(200).json({ success: true, message: 'Connexion Google reussie.', data: result });
  } catch (err) { next(err); }
};

export const getGoogleAuthUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
    });
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('Code manquant');

    const { tokens } = await googleClient.getToken(code as string);
    const idToken = tokens.id_token;
    if (!idToken) throw new Error('ID token manquant');

    const result = await authService.connecterAvecGoogle(idToken);

    // Redirige vers la page frontend dédiée (auth/google-callback.vue), qui lit
    // token/user/profilIncomplet en query string, stocke la session, puis redirige
    // vers le bon dashboard.
    const frontendUrl = `${process.env.FRONTEND_URL}/auth/google-callback?token=${result.token}&user=${encodeURIComponent(JSON.stringify(result.user))}&profilIncomplet=${result.profilIncomplet || false}`;

    console.log('Redirection vers:', frontendUrl);
    res.redirect(frontendUrl);
  } catch (err) {
    console.error('Erreur callback Google:', err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=google_auth_failed`);
  }
};

export const verifierEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.verifierEmail(req.body);
    if (!result.success) { res.status(400).json(result); return; }
    res.status(200).json(result);
  } catch (err) { next(err); }
};

export const renvoyerCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ success: false, message: 'Email requis.' }); return; }
    const result = await authService.renvoyerCodeVerification({ email });
    if (!result.success) { res.status(400).json(result); return; }
    res.status(200).json(result);
  } catch (err) { next(err); }
};

export const envoyerLienReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ success: false, message: 'Email requis.' }); return; }
    const result = await authService.envoyerLienResetMotDePasse({ email });
    if (!result.success) { res.status(400).json(result); return; }
    res.status(200).json(result);
  } catch (err) { next(err); }
};

export const verifierTokenReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
    if (!token || Array.isArray(token)) { res.status(400).json({ success: false, message: 'Token invalide.' }); return; }
    const result = await authService.verifierTokenReset(token);
    if (!result.success) { res.status(400).json(result); return; }
    res.status(200).json(result);
  } catch (err) { next(err); }
};

export const reinitialiserMotDePasse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email, motDePasse, motDePasseConfirmation } = req.body;
    if (!token || !email || !motDePasse || !motDePasseConfirmation) {
      res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
      return;
    }
    const result = await authService.reinitialiserMotDePasse({ token, email, motDePasse, motDePasseConfirmation });
    if (!result.success) { res.status(400).json(result); return; }
    res.status(200).json(result);
  } catch (err) { next(err); }
};

// --- Changement mot de passe depuis le profil ---
export const envoyerCodeChangementMdp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user!.id
    const result = await authService.envoyerCodeChangementMdp(userId)
    res.json(result)
  } catch (err) { next(err) }
}

export const changerMotDePasse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user!.id
    const result = await authService.changerMotDePasse(userId, req.body)
    if (!result.success) { res.status(400).json(result); return }
    res.json(result)
  } catch (err) { next(err) }
}
