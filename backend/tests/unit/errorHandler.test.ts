import { Request, Response } from 'express';
import { errorHandler } from '../../src/app/middleware/errorHandler';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = () => ({ method: 'GET', originalUrl: '/api/test' } as Request);

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalError = console.error;

  beforeEach(() => {
    // console.error est mocké pour ne pas polluer la sortie de test, mais on
    // vérifie quand même qu'il est bien appelé (le log serveur ne doit jamais disparaître).
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    console.error = originalError;
  });

  it('masque le message brut en production pour une erreur 500', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('SELECT * FROM users WHERE password leak details');
    const res = mockRes();

    errorHandler(err, mockReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.message).toBe('Erreur interne du serveur');
    expect(payload.message).not.toEqual(expect.stringContaining('SELECT'));
    // Le détail complet doit toujours être loggé côté serveur
    expect(console.error).toHaveBeenCalled();
  });

  it("conserve le message d'origine hors production (dev/test) pour faciliter le debug", () => {
    process.env.NODE_ENV = 'test';
    const err = new Error('Erreur explicite de test');
    const res = mockRes();

    errorHandler(err, mockReq(), res, jest.fn());

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toBe('Erreur explicite de test');
  });

  it('conserve le message pour une erreur 4xx même en production (message intentionnel)', () => {
    process.env.NODE_ENV = 'production';
    const err: any = new Error('Champ requis manquant');
    err.statusCode = 400;
    const res = mockRes();

    errorHandler(err, mockReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toBe('Champ requis manquant');
  });

  it("utilise 500 par défaut quand l'erreur n'a pas de statusCode", () => {
    process.env.NODE_ENV = 'test';
    const res = mockRes();

    errorHandler(new Error('oops'), mockReq(), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
