import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log complet côté serveur uniquement (jamais renvoyé au client)
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err);

  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // En production : jamais de message d'erreur brut (peut contenir des requêtes SQL,
  // des chemins de fichiers, des détails d'implémentation). Message générique uniquement.
  // En développement : le message réel est renvoyé pour faciliter le debug.
  const message = isProd
    ? (statusCode < 500 ? (err.message || 'Requête invalide') : 'Erreur interne du serveur')
    : (err.message || 'Erreur interne du serveur');

  res.status(statusCode).json({
    success: false,
    message,
  });
};