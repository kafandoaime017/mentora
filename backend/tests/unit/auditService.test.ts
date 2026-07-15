// On mocke entièrement le data-source AVANT d'importer auditService, car
// `auditRepo` y est capturé au chargement du module (top-level).
const mockSave = jest.fn();
const mockCreate = jest.fn((x: any) => x);

jest.mock('../../src/config/data-source', () => ({
  __esModule: true,
  default: {
    getRepository: jest.fn(() => ({
      create: mockCreate,
      save: mockSave,
    })),
  },
}));

import { logAudit, getClientIp } from '../../src/app/services/auditService';

describe('auditService.getClientIp', () => {
  it("préfère x-forwarded-for quand présent (cas derrière un proxy nginx)", () => {
    const req = { headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' }, socket: { remoteAddress: '10.0.0.1' } };
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('retombe sur req.socket.remoteAddress sans proxy', () => {
    const req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
    expect(getClientIp(req)).toBe('127.0.0.1');
  });

  it('retombe sur req.ip si aucun socket disponible', () => {
    const req = { headers: {}, ip: '192.168.1.10' };
    expect(getClientIp(req)).toBe('192.168.1.10');
  });

  it("retourne null si aucune source d'IP n'est disponible", () => {
    const req = { headers: {} };
    expect(getClientIp(req)).toBeNull();
  });
});

describe('auditService.logAudit', () => {
  beforeEach(() => {
    mockSave.mockReset();
    mockCreate.mockClear();
  });

  it('enregistre un log avec les valeurs par défaut pour les champs optionnels absents', async () => {
    mockSave.mockResolvedValue(undefined);

    await logAudit({ action: 'connexion' });

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      action: 'connexion',
      ecole_id: null,
      user_id: null,
      user_nom: '',
      user_role: '',
      cible_type: null,
      cible_id: null,
      details: null,
      ip_address: null,
    }));
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('transmet correctement tous les champs fournis', async () => {
    mockSave.mockResolvedValue(undefined);

    await logAudit({
      ecoleId: 3,
      userId: 42,
      userNom: 'Jean Dupont',
      userRole: 'directeur',
      action: 'suppression_utilisateur',
      cibleType: 'user',
      cibleId: 7,
      details: { raison: 'test' },
      ip: '1.2.3.4',
    });

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      ecole_id: 3,
      user_id: 42,
      user_nom: 'Jean Dupont',
      user_role: 'directeur',
      action: 'suppression_utilisateur',
      cible_type: 'user',
      cible_id: 7,
      details: { raison: 'test' },
      ip_address: '1.2.3.4',
    }));
  });

  it("n'interrompt jamais l'appelant même si l'écriture en base échoue", async () => {
    mockSave.mockRejectedValue(new Error('DB indisponible'));

    // Ne doit pas rejeter/throw : logAudit est "fire-and-forget" par conception.
    await expect(logAudit({ action: 'connexion' })).resolves.toBeUndefined();
  });
});
