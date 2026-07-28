import { Request, Response } from 'express';
import { validerInscription, validerConnexion } from '../../src/app/middleware/validateAuth';

// Fabrique un mock minimal de req/res/next pour tester un middleware Express
// sans avoir besoin d'un vrai serveur HTTP.
const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('validateAuth middleware', () => {
  describe('validerInscription', () => {
    const validBody = {
      nom: 'Traoré',
      prenom: 'Aïcha',
      email: 'aicha@example.com',
      motDePasse: 'motdepasse123',
      ecoleId: 1,
      filiereId: 1,
      classeId: 1,
    };

    it('appelle next() sans argument quand le payload est valide', () => {
      const req = { body: validBody } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerInscription(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('rejette avec 422 un email invalide', () => {
      const req = { body: { ...validBody, email: 'pas-un-email' } } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerInscription(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.success).toBe(false);
      expect(payload.message).toEqual(expect.stringContaining('Email invalide'));
    });

    it('rejette un mot de passe trop court', () => {
      const req = { body: { ...validBody, motDePasse: '123' } } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerInscription(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('rejette et agrège plusieurs erreurs à la fois (abortEarly:false)', () => {
      const req = { body: { ...validBody, email: 'x', motDePasse: '1' } } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerInscription(req, res, next);

      const payload = (res.json as jest.Mock).mock.calls[0][0];
      // Les deux erreurs doivent apparaître, séparées par le séparateur ' | '
      expect(payload.message.split(' | ').length).toBeGreaterThanOrEqual(2);
    });

    it("rejette quand un champ requis (ecoleId) est manquant", () => {
      const { ecoleId, ...rest } = validBody;
      const req = { body: rest } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerInscription(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('validerConnexion', () => {
    it('appelle next() avec un email et un mot de passe présents', () => {
      const req = { body: { email: 'a@b.com', motDePasse: 'x' } } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerConnexion(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('rejette une connexion sans mot de passe', () => {
      const req = { body: { email: 'a@b.com' } } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerConnexion(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('rejette une connexion sans email', () => {
      const req = { body: { motDePasse: 'x' } } as Request;
      const res = mockRes();
      const next = jest.fn();

      validerConnexion(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });
});
