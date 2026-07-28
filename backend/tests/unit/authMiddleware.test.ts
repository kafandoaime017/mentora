import jwt from 'jsonwebtoken';

const userRepoMock = { findOne: jest.fn() };

jest.mock('../../src/config/data-source', () => ({
  __esModule: true,
  default: {
    getRepository: jest.fn(() => userRepoMock),
  },
}));

import { authMiddleware } from '../../src/app/middleware/auth';

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  beforeEach(() => {
    userRepoMock.findOne.mockReset();
  });

  it("renvoie 401 si l'en-tête Authorization est absent", async () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe('Token manquant');
    expect(next).not.toHaveBeenCalled();
  });

  it('renvoie 401 pour un token JWT invalide/malformé', async () => {
    const req: any = { headers: { authorization: 'Bearer un-token-invalide' } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe('Token invalide');
    expect(next).not.toHaveBeenCalled();
  });

  it("renvoie 401 si le token est valide mais l'utilisateur n'existe plus en base", async () => {
    const token = jwt.sign({ id: 999 }, process.env.JWT_SECRET as string);
    userRepoMock.findOne.mockResolvedValue(null);

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe('Utilisateur non trouvé');
    expect(next).not.toHaveBeenCalled();
  });

  it('attache req.user et appelle next() pour un token valide correspondant à un utilisateur existant', async () => {
    const token = jwt.sign({ id: 5 }, process.env.JWT_SECRET as string);
    const fakeUser = { id: 5, role: 'professeur', email: 'p@example.com' };
    userRepoMock.findOne.mockResolvedValue(fakeUser);

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejette un token signé avec une mauvaise clé secrète', async () => {
    const token = jwt.sign({ id: 5 }, 'mauvaise-cle-secrete');

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
