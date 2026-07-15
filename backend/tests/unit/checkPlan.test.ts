import { Ecole } from '../../src/app/models/Ecole';
import { EtudiantProfil } from '../../src/app/models/EtudiantProfil';
import { ProfesseurProfil } from '../../src/app/models/ProfesseurProfil';

// Mock repos par entité : chaque test configure le comportement de findOne/count
// pour l'entité qui l'intéresse, sans dépendre d'une vraie base de données.
const ecoleRepoMock = { findOne: jest.fn() };
const etudiantProfilRepoMock = { count: jest.fn() };
const professeurProfilRepoMock = { findOne: jest.fn(), count: jest.fn() };

jest.mock('../../src/config/data-source', () => ({
  __esModule: true,
  default: {
    getRepository: jest.fn((entity: any) => {
      if (entity === Ecole) return ecoleRepoMock;
      if (entity === EtudiantProfil) return etudiantProfilRepoMock;
      if (entity === ProfesseurProfil) return professeurProfilRepoMock;
      throw new Error('Entité non mockée dans ce test: ' + entity?.name);
    }),
  },
}));

import { checkLimiteEtudiants, checkLimiteProfesseurs, checkPlanIA, LIMITES_PLANS } from '../../src/app/middleware/checkPlan';

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('LIMITES_PLANS', () => {
  it('définit bien les trois plans avec des limites cohérentes', () => {
    expect(LIMITES_PLANS.gratuit).toEqual({ maxEtudiants: 25, maxProfs: 5, maxSessions: 100, ia: false });
    expect(LIMITES_PLANS.starter).toEqual({ maxEtudiants: 100, maxProfs: 15, maxSessions: -1, ia: false });
    expect(LIMITES_PLANS.pro).toEqual({ maxEtudiants: -1, maxProfs: -1, maxSessions: -1, ia: true });
  });
});

describe('checkLimiteEtudiants', () => {
  beforeEach(() => {
    ecoleRepoMock.findOne.mockReset();
    etudiantProfilRepoMock.count.mockReset();
  });

  it("laisse passer si l'utilisateur n'a pas d'ecoleId (ex: superadmin)", async () => {
    const req: any = { user: { ecoleId: null } };
    const res = mockRes();
    const next = jest.fn();

    await checkLimiteEtudiants(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(ecoleRepoMock.findOne).not.toHaveBeenCalled();
  });

  it('bloque avec 403 quand la limite du plan gratuit est atteinte', async () => {
    ecoleRepoMock.findOne.mockResolvedValue({ id: 1, plan: 'gratuit' });
    etudiantProfilRepoMock.count.mockResolvedValue(25); // déjà au max

    const req: any = { user: { ecoleId: 1 } };
    const res = mockRes();
    const next = jest.fn();

    await checkLimiteEtudiants(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    const payload = res.json.mock.calls[0][0];
    expect(payload.code).toBe('LIMITE_ETUDIANTS');
  });

  it('laisse passer sous la limite', async () => {
    ecoleRepoMock.findOne.mockResolvedValue({ id: 1, plan: 'gratuit' });
    etudiantProfilRepoMock.count.mockResolvedValue(10);

    const req: any = { user: { ecoleId: 1 } };
    const res = mockRes();
    const next = jest.fn();

    await checkLimiteEtudiants(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('laisse toujours passer un plan pro (illimité)', async () => {
    ecoleRepoMock.findOne.mockResolvedValue({ id: 2, plan: 'pro' });

    const req: any = { user: { ecoleId: 2 } };
    const res = mockRes();
    const next = jest.fn();

    await checkLimiteEtudiants(req, res, next);

    expect(next).toHaveBeenCalledWith();
    // La limite étant illimitée, on ne doit même pas avoir besoin de compter
    expect(etudiantProfilRepoMock.count).not.toHaveBeenCalled();
  });

  it('transmet une erreur inattendue à next(err) plutôt que de planter', async () => {
    ecoleRepoMock.findOne.mockRejectedValue(new Error('DB down'));

    const req: any = { user: { ecoleId: 1 } };
    const res = mockRes();
    const next = jest.fn();

    await checkLimiteEtudiants(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('checkLimiteProfesseurs', () => {
  beforeEach(() => {
    ecoleRepoMock.findOne.mockReset();
    professeurProfilRepoMock.count.mockReset();
  });

  it('bloque avec 403 quand la limite de profs du plan starter est atteinte', async () => {
    ecoleRepoMock.findOne.mockResolvedValue({ id: 1, plan: 'starter' });
    professeurProfilRepoMock.count.mockResolvedValue(15);

    const req: any = { user: { ecoleId: 1 } };
    const res = mockRes();
    const next = jest.fn();

    await checkLimiteProfesseurs(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0][0].code).toBe('LIMITE_PROFESSEURS');
  });
});

describe('checkPlanIA', () => {
  beforeEach(() => {
    professeurProfilRepoMock.findOne.mockReset();
    ecoleRepoMock.findOne.mockReset();
  });

  it("bloque la génération IA (403) pour un plan gratuit", async () => {
    professeurProfilRepoMock.findOne.mockResolvedValue({ ecoleId: 1 });
    ecoleRepoMock.findOne.mockResolvedValue({ id: 1, plan: 'gratuit' });

    const req: any = { user: { id: 99 } };
    const res = mockRes();
    const next = jest.fn();

    await checkPlanIA(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0][0].code).toBe('PLAN_IA_REQUIS');
  });

  it('autorise la génération IA pour un plan pro', async () => {
    professeurProfilRepoMock.findOne.mockResolvedValue({ ecoleId: 2 });
    ecoleRepoMock.findOne.mockResolvedValue({ id: 2, plan: 'pro' });

    const req: any = { user: { id: 99 } };
    const res = mockRes();
    const next = jest.fn();

    await checkPlanIA(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });
});
