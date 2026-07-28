import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppDataSource from '../../config/data-source';
import { User } from '../models/User';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'Token manquant' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Recharger l'utilisateur depuis la DB pour avoir ecoleId et les champs à jour
    const userRepo = AppDataSource.getRepository(User);
    const user     = await userRepo.findOne({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Rôle requis: ' + roles.join(' ou ')
      });
      return;
    }

    next();
  };
};