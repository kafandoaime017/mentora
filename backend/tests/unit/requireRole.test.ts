import { Request, Response } from 'express';
import { requireRole } from '../../src/app/middleware/auth';

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('requireRole middleware', () => {
  it("renvoie 401 quand req.user n'existe pas (non authentifié)", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = jest.fn();

    requireRole(['directeur'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("renvoie 403 quand le rôle de l'utilisateur n'est pas autorisé", () => {
    const req = { user: { role: 'etudiant' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn();

    requireRole(['directeur', 'superadmin'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.message).toEqual(expect.stringContaining('directeur ou superadmin'));
    expect(next).not.toHaveBeenCalled();
  });

  it('appelle next() quand le rôle correspond', () => {
    const req = { user: { role: 'professeur' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn();

    requireRole(['professeur'])(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('accepte plusieurs rôles possibles', () => {
    const req = { user: { role: 'directeur' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn();

    requireRole(['directeur', 'superadmin'])(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
