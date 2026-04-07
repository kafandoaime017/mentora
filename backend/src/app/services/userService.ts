// services/userService.ts
import AppDataSource from '../../config/data-source';
import { User, UserRole } from '../models/User';
import { EtudiantProfil } from '../models/EtudiantProfil';
import path from 'path';
import fs from 'fs';

const userRepo = () => AppDataSource.getRepository(User);
const profilRepo = () => AppDataSource.getRepository(EtudiantProfil);

const safeUser = (user: User) => ({
  id: user.id,
  nom: user.nom,
  prenom: user.prenom,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
});

export interface UpdateProfilePayload {
  userId: number;
  nom?: string;
  prenom?: string;
}

export interface UpdateAvatarPayload {
  userId: number;
  avatarUrl: string;
}

// ─── Récupérer le profil utilisateur ───────────────────────────────────────
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
  
  if (user.role === UserRole.PROFESSEUR) {
    // Ajouter la logique pour professeur si besoin
    profilInfo = {
      type: 'professeur',
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

// ─── Mettre à jour l'avatar ───────────────────────────────────────────────
export const updateUserAvatar = async (data: UpdateAvatarPayload) => {
  const user = await userRepo().findOne({ where: { id: data.userId } });

  if (!user) {
    return { success: false, message: 'Utilisateur non trouvé.' };
  }

  // Supprimer l'ancien avatar s'il existe (sauf l'avatar par défaut)
  if (user.avatar && !user.avatar.includes('default-avatar')) {
    const oldAvatarPath = path.join(__dirname, '../../public', user.avatar);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  user.avatar = data.avatarUrl;
  await userRepo().save(user);

  return {
    success: true,
    message: 'Avatar mis à jour avec succès',
    user: {
      ...safeUser(user),
      avatar: user.avatar
    }
  };
};