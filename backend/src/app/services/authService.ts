import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { MoreThan } from 'typeorm';
import AppDataSource from '../../config/data-source';
import { User, UserRole } from '../models/User';
import { EtudiantProfil } from '../models/EtudiantProfil';
import { envoyerCodeVerification, envoyerBienvenue, envoyerResetPassword, envoyerConfirmationResetPassword } from './emailService';

const userRepo     = () => AppDataSource.getRepository(User);
const profilRepo   = () => AppDataSource.getRepository(EtudiantProfil);
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface InscriptionPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  dateNaissance?: string;
  ecoleId: number;
  filiereId: number;
  classeId: number;
}

export interface ConnexionPayload {
  email: string;
  motDePasse: string;
}

export interface VerificationPayload {
  email: string;
  code: string;
}

export interface RenvoyerCodePayload {
  email: string;
}

export interface UpdateProfilePayload {
  userId: number;
  nom?: string;
  prenom?: string;
}

export interface EnvoyerResetPayload {
  email: string;
}

export interface ResetMotDePassePayload {
  token: string;
  email: string;
  motDePasse: string;
  motDePasseConfirmation: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const signToken = (user: User): string =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

const safeUser = (user: User) => ({
  id:         user.id,
  nom:        user.nom,
  prenom:     user.prenom,
  email:      user.email,
  role:       user.role,
  avatar:     user.avatar,
  isVerified: user.isVerified,
});

// Générer un code à 6 chiffres
const genererCodeVerification = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Générer un token de réinitialisation unique
const genererResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// ─── Inscription (étudiant uniquement) ───────────────────────────────────────

export const inscrireEtudiant = async (data: InscriptionPayload) => {
  const repo = userRepo();

  const existant = await repo.findOne({ where: { email: data.email } });
  if (existant) {
    return { success: false, status: 409, message: 'Un compte avec cet email existe déjà.' };
  }

  const motDePasseHash = await bcrypt.hash(data.motDePasse, 12);
  const verificationCode = genererCodeVerification();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  let savedUser!: User;
  let savedProfil!: EtudiantProfil;

  await AppDataSource.transaction(async (manager) => {
    const user = manager.create(User, {
      nom:        data.nom,
      prenom:     data.prenom,
      email:      data.email,
      motDePasse: motDePasseHash,
      role:       UserRole.ETUDIANT,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });
    savedUser = await manager.save(user);

    savedProfil = manager.create(EtudiantProfil, {
      userId:        savedUser.id,
      dateNaissance: data.dateNaissance ?? null,
      ecoleId:       data.ecoleId,
      filiereId:     data.filiereId,
      classeId:      data.classeId,
    });
    await manager.save(savedProfil);
  });

  // Envoyer le code de vérification par email
  try {
    await envoyerCodeVerification(data.email, verificationCode, data.prenom);
  } catch (emailError) {
    console.error('Erreur envoi email:', emailError);
  }

  // Construire l'objet utilisateur complet (sans relations)
  const userComplete = {
    id: savedUser.id,
    nom: savedUser.nom,
    prenom: savedUser.prenom,
    email: savedUser.email,
    role: savedUser.role,
    avatar: savedUser.avatar,
    isVerified: savedUser.isVerified,
    profil: {
      type: 'etudiant',
      dateNaissance: savedProfil.dateNaissance,
      ecoleId: savedProfil.ecoleId,
      filiereId: savedProfil.filiereId,
      classeId: savedProfil.classeId,
    }
  };

  return { 
    success: true, 
    message: 'Code de vérification envoyé à votre email',
    requiresVerification: true,
    email: data.email,
    user: userComplete
  };
};

// ─── Vérification du code email ──────────────────────────────────────────────

export const verifierEmail = async (data: VerificationPayload) => {
  const user = await userRepo().findOne({ where: { email: data.email } });

  if (!user) {
    return { success: false, message: 'Utilisateur non trouvé.' };
  }

  if (user.isVerified) {
    return { success: false, message: 'Votre email est déjà vérifié. Vous pouvez vous connecter.' };
  }

  if (user.verificationCode !== data.code) {
    return { success: false, message: 'Code invalide ou expiré.' };
  }

  if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
    return { success: false, message: 'Code expiré. Demandez un nouveau code.' };
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await userRepo().save(user);

  try {
    await envoyerBienvenue(user.email, user.prenom);
  } catch (emailError) {
    console.error('Erreur envoi email bienvenue:', emailError);
  }

  const token = signToken(user);

  let profilInfo = null;
  if (user.role === UserRole.ETUDIANT) {
    const etudiantProfil = await profilRepo().findOne({ where: { userId: user.id } });
    profilInfo = {
      type: 'etudiant',
      dateNaissance: etudiantProfil?.dateNaissance,
      ecole: etudiantProfil?.ecoleId,
      filiereId: etudiantProfil?.filiereId,
      classeId: etudiantProfil?.classeId,
    };
  }

  const userComplete = {
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    profil: profilInfo,
  };

  return {
    success: true,
    token,
    user: userComplete,
    message: 'Email vérifié avec succès !'
  };
};

// ─── Renvoyer un code de vérification ────────────────────────────────────────

export const renvoyerCodeVerification = async (data: RenvoyerCodePayload) => {
  const user = await userRepo().findOne({ where: { email: data.email } });

  if (!user) {
    return { success: false, message: 'Utilisateur non trouvé.' };
  }

  if (user.isVerified) {
    return { success: false, message: 'Email déjà vérifié.' };
  }

  const newCode = genererCodeVerification();
  user.verificationCode = newCode;
  user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  await userRepo().save(user);

  try {
    await envoyerCodeVerification(user.email, newCode, user.prenom);
    return { success: true, message: 'Nouveau code envoyé à votre email.' };
  } catch (error) {
    console.error('Erreur envoi code:', error);
    return { success: false, message: "Erreur lors de l'envoi du code. Réessayez plus tard." };
  }
};

// ─── Connexion (tous les rôles) ───────────────────────────────────────────────

export const connecter = async (data: ConnexionPayload) => {
  const user = await userRepo().findOne({ where: { email: data.email } })

  if (!user || !user.motDePasse)
    throw new Error('Email ou mot de passe incorrect.')

  if (!user.isActive)
    throw new Error('Ce compte a été désactivé. Contactez un administrateur.')

  const valide = await bcrypt.compare(data.motDePasse, user.motDePasse)
  if (!valide)
    throw new Error('Email ou mot de passe incorrect.')

  if (!user.isVerified)
    throw new Error('Veuillez vérifier votre email avant de vous connecter.')

  // ─── TOTP : si activé, ne pas donner le vrai token ───────────────────────
  if (user.totpEnabled) {
    const tempToken = jwt.sign(
      { id: user.id, totp_pending: true },
      process.env.JWT_SECRET as string,
      { expiresIn: '5m' }
    )
    return {
      success:       true,
      totp_required: true,
      userId:        user.id,
      tempToken,
      message:       'Code 2FA requis'
    }
  }

  // ─── Flow normal ──────────────────────────────────────────────────────────
  let profilInfo = null

  if (user.role === UserRole.ETUDIANT) {
    const etudiantProfil = await profilRepo().findOne({
      where: { userId: user.id },
      relations: ['ecole', 'filiere', 'classe']
    })
    profilInfo = {
      type:          'etudiant',
      dateNaissance: etudiantProfil?.dateNaissance,
      ecole:         etudiantProfil?.ecole?.nom,
      ecoleId:       etudiantProfil?.ecoleId,
      filiere:       etudiantProfil?.filiere?.nom,
      filiereId:     etudiantProfil?.filiereId,
      classe:        etudiantProfil?.classe?.nom,
      classeId:      etudiantProfil?.classeId,
    }
  }

  if (user.role === UserRole.SUPERADMIN || user.role === UserRole.DIRECTEUR) {
    profilInfo = {
      type:        user.role,
      permissions: user.role === UserRole.SUPERADMIN ? 'toutes' : 'limitées',
    }
  }

  return {
    success: true,
    token:   signToken(user),
    user: {
      ...safeUser(user),
      profil: profilInfo
    }
  }
}



// ─── Mettre à jour le profil utilisateur ───────────────────────────────────────

export const updateUserProfile = async (data: UpdateProfilePayload) => {
  const user = await userRepo().findOne({ where: { id: data.userId } });

  if (!user) {
    return { success: false, message: 'Utilisateur non trouvé.' };
  }

  // Mettre à jour les champs fournis
  if (data.nom !== undefined && data.nom.trim() !== '') {
    user.nom = data.nom.trim();
  }
  if (data.prenom !== undefined && data.prenom.trim() !== '') {
    user.prenom = data.prenom.trim();
  }

  await userRepo().save(user);

  // Récupérer le profil complet pour le retour
  let profilInfo = null;
  
  if (user.role === UserRole.ETUDIANT) {
    const etudiantProfil = await profilRepo().findOne({
      where: { userId: user.id },
      relations: ['ecole', 'filiere', 'classe']
    });
    
    profilInfo = {
      type: 'etudiant',
      dateNaissance: etudiantProfil?.dateNaissance,
      ecole: etudiantProfil?.ecole?.nom,
      ecoleId: etudiantProfil?.ecoleId,
      filiere: etudiantProfil?.filiere?.nom,
      filiereId: etudiantProfil?.filiereId,
      classe: etudiantProfil?.classe?.nom,
      classeId: etudiantProfil?.classeId,
    };
  }

  return {
    success: true,
    message: 'Profil mis à jour avec succès',
    user: {
      ...safeUser(user),
      profil: profilInfo
    }
  };
};

// ─── Récupérer le profil utilisateur complet ───────────────────────────────────

export const getUserProfile = async (userId: number) => {
  const user = await userRepo().findOne({ where: { id: userId } });

  if (!user) {
    return { success: false, message: 'Utilisateur non trouvé.' };
  }

  let profilInfo = null;
  
  if (user.role === UserRole.ETUDIANT) {
    const etudiantProfil = await profilRepo().findOne({
      where: { userId: user.id },
      relations: ['ecole', 'filiere', 'classe']
    });
    
    profilInfo = {
      type: 'etudiant',
      dateNaissance: etudiantProfil?.dateNaissance,
      ecole: etudiantProfil?.ecole?.nom,
      ecoleId: etudiantProfil?.ecoleId,
      filiere: etudiantProfil?.filiere?.nom,
      filiereId: etudiantProfil?.filiereId,
      classe: etudiantProfil?.classe?.nom,
      classeId: etudiantProfil?.classeId,
    };
  }

  return {
    success: true,
    user: {
      ...safeUser(user),
      profil: profilInfo
    }
  };
};

// ─── Google OAuth ───────────────────────────────────────────────────────────────

export const connecterAvecGoogle = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error('Token Google invalide.');

  const { sub: googleId, email, given_name, family_name, picture } = payload;
  const repo = userRepo();

  let user = await repo.findOne({ where: { googleId } });

  if (!user) {
    user = await repo.findOne({ where: { email } });

    if (user) {
      // Lier Google à un compte existant
      if (!user.isActive) throw new Error('Ce compte a été désactivé.');
      user.googleId = googleId;
      user.avatar   = user.avatar ?? picture ?? null;
      await repo.save(user);
    } else {
      // Nouveau compte Google → étudiant, profil à compléter
      await AppDataSource.transaction(async (manager) => {
        user = manager.create(User, {
          nom:        family_name ?? '',
          prenom:     given_name  ?? '',
          email:      email!,
          googleId,
          avatar:     picture ?? null,
          role:       UserRole.ETUDIANT,
          isVerified: true, // Google reste vérifié directement
        });
        user = await manager.save(user);

        const profil = manager.create(EtudiantProfil, { userId: user!.id });
        await manager.save(profil);
      });

      user = await repo.findOneOrFail({ where: { email } });
    }
  }

  if (!user!.isActive) throw new Error('Ce compte a été désactivé.');

  const profil = await profilRepo().findOne({ where: { userId: user!.id } });

  return {
    token:           signToken(user!),
    user:            safeUser(user!),
    profilIncomplet: !profil?.classeId,
  };
};

// ─── Réinitialisation du mot de passe ────────────────────────────────────────

/**
 * Envoyer le lien de réinitialisation par email
 */
export const envoyerLienResetMotDePasse = async (data: EnvoyerResetPayload) => {
  const user = await userRepo().findOne({ where: { email: data.email } });

  if (!user) {
    return { success: false, message: 'Aucun compte trouvé avec cette adresse email.' };
  }

  // Générer le token
  const resetToken = genererResetToken();
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  // Sauvegarder le token
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await userRepo().save(user);

  // Envoyer l'email
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reinitialisation-password?token=${resetToken}&email=${user.email}`;
    
    await envoyerResetPassword(
      user.email,
      user.prenom,
      resetToken,
      resetUrl
    );
    
    return { 
      success: true, 
      message: 'Un lien de réinitialisation a été envoyé à votre adresse email.' 
    };
  } catch (error) {
    console.error('Erreur envoi email reset:', error);
    return { 
      success: false, 
      message: "Erreur lors de l'envoi de l'email. Réessayez plus tard." 
    };
  }
};

/**
 * Vérifier si un token de réinitialisation est valide
 */
export const verifierTokenReset = async (token: string) => {
  const user = await userRepo().findOne({ 
    where: { 
      resetPasswordToken: token,
      resetPasswordExpires: MoreThan(new Date())
    } 
  });

  if (!user) {
    return { 
      success: false, 
      message: 'Token invalide ou expiré. Veuillez refaire une demande.' 
    };
  }

  return { 
    success: true, 
    message: 'Token valide',
    email: user.email
  };
};

/**
 * Réinitialiser le mot de passe
 */
export const reinitialiserMotDePasse = async (data: ResetMotDePassePayload) => {
  // Vérifier que les mots de passe correspondent
  if (data.motDePasse !== data.motDePasseConfirmation) {
    return { success: false, message: 'Les mots de passe ne correspondent pas.' };
  }

  // Vérifier la longueur du mot de passe
  if (data.motDePasse.length < 8) {
    return { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  // Trouver l'utilisateur avec le token valide
  const user = await userRepo().findOne({ 
    where: { 
      resetPasswordToken: data.token,
      resetPasswordExpires: MoreThan(new Date()),
      email: data.email
    } 
  });

  if (!user) {
    return { 
      success: false, 
      message: 'Token invalide ou expiré. Veuillez refaire une demande.' 
    };
  }

  // Hasher le nouveau mot de passe
  const motDePasseHash = await bcrypt.hash(data.motDePasse, 12);

  // Mettre à jour l'utilisateur
  user.motDePasse = motDePasseHash;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await userRepo().save(user);

  // Envoyer une confirmation par email
  try {
    await envoyerConfirmationResetPassword(user.email, user.prenom);
  } catch (error) {
    console.error('Erreur envoi email confirmation:', error);
  }

  return { 
    success: true, 
    message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
  };
};


// ─── Envoyer code changement mot de passe ────────────────────────────────────
export const envoyerCodeChangementMdp = async (userId: number) => {
  const user = await userRepo().findOne({ where: { id: userId } })
  if (!user) return { success: false, message: 'Utilisateur non trouvé' }

  const code    = genererCodeVerification()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  user.verificationCode        = code
  user.verificationCodeExpires = expires
  await userRepo().save(user)

  try {
    await envoyerCodeVerification(user.email, code, user.prenom)
    return { success: true, message: `Code envoyé à ${user.email}` }
  } catch {
    return { success: false, message: "Erreur lors de l'envoi du code" }
  }
}

// ─── Changer le mot de passe avec code ───────────────────────────────────────
export const changerMotDePasse = async (userId: number, data: {
  codeVerification: string
  nouveauMotDePasse: string
  confirmationMotDePasse: string
}) => {
  if (data.nouveauMotDePasse !== data.confirmationMotDePasse)
    return { success: false, message: 'Les mots de passe ne correspondent pas' }

  if (data.nouveauMotDePasse.length < 8)
    return { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' }

  const user = await userRepo().findOne({ where: { id: userId } })
  if (!user) return { success: false, message: 'Utilisateur non trouvé' }

  if (user.verificationCode !== data.codeVerification)
    return { success: false, message: 'Code invalide' }

  if (user.verificationCodeExpires && user.verificationCodeExpires < new Date())
    return { success: false, message: 'Code expiré. Demandez un nouveau code.' }

  user.motDePasse              = await bcrypt.hash(data.nouveauMotDePasse, 12)
  user.verificationCode        = null
  user.verificationCodeExpires = null
  await userRepo().save(user)

  return { success: true, message: 'Mot de passe modifié avec succès' }
}