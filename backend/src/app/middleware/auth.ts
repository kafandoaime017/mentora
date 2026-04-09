import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ success: false, message: 'Token manquant' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// Middleware pour vérifier le rôle
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