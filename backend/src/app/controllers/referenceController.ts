import { Request, Response, NextFunction } from 'express';
import * as refService from '../services/referenceService';

// GET /api/ref/ecoles?search=...
export const listEcoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const data = await refService.getEcoles(search);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/ref/ecoles/:ecoleId/filieres
export const listFilieres = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ecoleId = Number(req.params.ecoleId);
    if (!ecoleId || isNaN(ecoleId)) {
      res.status(400).json({ success: false, message: 'ecoleId invalide.' });
      return;
    }
    const data = await refService.getFilieresByEcole(ecoleId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/ref/filieres/:filiereId/classes
export const listClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filiereId = Number(req.params.filiereId);
    if (!filiereId || isNaN(filiereId)) {
      res.status(400).json({ success: false, message: 'filiereId invalide.' });
      return;
    }
    const data = await refService.getClassesByFiliere(filiereId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};