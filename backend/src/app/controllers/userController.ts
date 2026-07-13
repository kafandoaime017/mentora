// controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService';
import * as authService from '../services/authService';
// Supprimez l'import de sharp
import path from 'path';
import fs from 'fs';
import AppDataSource from '../../config/data-source';
import { User, UserRole } from '../models/User';
import { EtudiantProfil } from '../models/EtudiantProfil';
import { ProfesseurProfil } from '../models/ProfesseurProfil';
import { Ecole } from '../models/Ecole';

const userRepoForEcole = AppDataSource.getRepository(User);
const etudiantProfilRepoForEcole = AppDataSource.getRepository(EtudiantProfil);
const professeurProfilRepoForEcole = AppDataSource.getRepository(ProfesseurProfil);
const ecoleRepoForEcole = AppDataSource.getRepository(Ecole);

// Récupère le nom/logo de l'école du user connecté, quel que soit son rôle
// (étudiant/professeur → via leur profil, directeur/superadmin → via User.ecoleId).
// Utilisé pour afficher le logo de l'école dans les en-têtes des dashboards.
export const getMyEcole = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User
    if (!user) { res.status(401).json({ success: false, message: 'Non authentifié' }); return }

    let ecoleId: number | null = null

    if (user.role === UserRole.ETUDIANT) {
      const profil = await etudiantProfilRepoForEcole.findOne({ where: { userId: user.id } })
      ecoleId = profil?.ecoleId || null
    } else if (user.role === UserRole.PROFESSEUR) {
      const profil = await professeurProfilRepoForEcole.findOne({ where: { userId: user.id } })
      ecoleId = profil?.ecoleId || null
    } else {
      const fullUser = await userRepoForEcole.findOne({ where: { id: user.id } })
      ecoleId = fullUser?.ecoleId || null
    }

    if (!ecoleId) { res.json({ success: true, data: null }); return }

    const ecole = await ecoleRepoForEcole.findOne({ where: { id: ecoleId } })
    if (!ecole) { res.json({ success: true, data: null }); return }

    res.json({ success: true, data: { nom: ecole.nom, logo: ecole.logo } })
  } catch (error) {
    console.error('Erreur getMyEcole:', error)
    res.status(500).json({ success: false, message: 'Erreur serveur' })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }
    
    const { nom, prenom } = req.body;
    
    const result = await authService.updateUserProfile({ userId, nom, prenom });
    
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur update profile:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }
    
    const result = await userService.getUserProfile(userId);
    
    if (!result.success) {
      res.status(404).json(result);
      return;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur get profile:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Version SANS traitement d'image (copie simple)
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }
    
    const file = (req as any).file;
    
    if (!file) {
      res.status(400).json({ success: false, message: 'Aucun fichier uploadé' });
      return;
    }
    
    // Garder l'extension originale
    const originalExt = path.extname(file.originalname);
    const filename = `avatar-${userId}-${Date.now()}${originalExt}`;
    const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
    const outputPath = path.join(uploadDir, filename);
    
    // S'assurer que le dossier existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Déplacer le fichier original sans aucun traitement
    fs.renameSync(file.path, outputPath);
    
    const avatarUrl = `/uploads/avatars/${filename}`;
    const result = await userService.updateUserAvatar({ userId, avatarUrl });
    
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erreur uploadAvatar:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload' });
  }
};