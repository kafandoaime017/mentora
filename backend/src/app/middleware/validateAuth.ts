import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const sendError = (res: Response, details: string[]) =>
  res.status(422).json({
    success: false,
    // Fusionne toutes les erreurs dans message séparées par une virgule ou un retour à la ligne
    message: details.join(' | '),
  });

const inscriptionSchema = Joi.object({
  nom:           Joi.string().trim().min(2).max(100).required().messages({ 'string.empty': 'Le nom est requis.' }),
  prenom:        Joi.string().trim().min(2).max(100).required().messages({ 'string.empty': 'Le prénom est requis.' }),
  email:         Joi.string().email().required().messages({ 'string.email': 'Email invalide.', 'string.empty': "L'email est requis." }),
  motDePasse:    Joi.string().min(8).required().messages({ 'string.min': 'Minimum 8 caractères.', 'string.empty': 'Le mot de passe est requis.' }),
  dateNaissance: Joi.string().isoDate().optional(),
  ecoleId:       Joi.number().integer().positive().required().messages({ 'any.required': "L'école est requise." }),
  filiereId:     Joi.number().integer().positive().required().messages({ 'any.required': 'La filière est requise.' }),
  classeId:      Joi.number().integer().positive().required().messages({ 'any.required': 'La classe est requise.' }),
});

const connexionSchema = Joi.object({
  email:      Joi.string().email().required().messages({ 'string.email': 'Email invalide.', 'string.empty': "L'email est requis." }),
  motDePasse: Joi.string().required().messages({ 'string.empty': 'Le mot de passe est requis.' }),
});

export const validerInscription = (req: Request, res: Response, next: NextFunction) => {
  const { error } = inscriptionSchema.validate(req.body, { abortEarly: false });
  if (error) { sendError(res, error.details.map((d) => d.message)); return; }
  next();
};

export const validerConnexion = (req: Request, res: Response, next: NextFunction) => {
  const { error } = connexionSchema.validate(req.body, { abortEarly: false });
  if (error) { sendError(res, error.details.map((d) => d.message)); return; }
  next();
};