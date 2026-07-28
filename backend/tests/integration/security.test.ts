// Verifie que le durcissement securite mis en place (helmet + rate-limiting sur
// les endpoints d'authentification) est bien actif sur l'app reelle.
// emailService.ts importe nodemailer-express-handlebars (module ESM non transforme
// par ts-jest) : on le mocke car app.ts charge toutes les routes, y compris auth.
jest.mock('../../src/app/services/emailService', () => ({
  __esModule: true,
  sendEmail: jest.fn().mockResolvedValue(true),
  envoyerCodeVerification: jest.fn().mockResolvedValue(true),
  envoyerBienvenue: jest.fn().mockResolvedValue(true),
  envoyerResetPassword: jest.fn().mockResolvedValue(true),
  envoyerConfirmationResetPassword: jest.fn().mockResolvedValue(true),
  genererCodeVerification: jest.fn(() => '123456'),
  envoyerInvitation: jest.fn().mockResolvedValue(true),
  envoyerVerificationInvitation: jest.fn().mockResolvedValue(true),
  envoyerEmailSessionDemarree: jest.fn().mockResolvedValue(true),
  envoyerEmailNouvelleSession: jest.fn().mockResolvedValue(true),
  envoyerEmailNotesPubliees: jest.fn().mockResolvedValue(true),
  envoyerEmailPaiementEchoue: jest.fn().mockResolvedValue(true),
  envoyerEmailAbonnementAnnule: jest.fn().mockResolvedValue(true),
  envoyerEmailFinEssai: jest.fn().mockResolvedValue(true),
  envoyerEmailFacture: jest.fn().mockResolvedValue(true),
  envoyerEmailPlanActive: jest.fn().mockResolvedValue(true),
}));

import request from 'supertest';
import app from '../../src/app';
import { initTestDb, closeTestDb } from '../setup/db';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

describe('En-tetes de securite (helmet)', () => {
  it('ajoute les en-tetes de securite standards sur les reponses API', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', motDePasse: 'x' });

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    // helmet retire l'en-tete revelant la techno serveur
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('Rate limiting sur /api/auth/login', () => {
  it('bloque avec 429 apres trop de tentatives successives', async () => {
    const attempts = Array.from({ length: 25 }, () =>
      request(app).post('/api/auth/login').send({ email: 'brute-force@example.com', motDePasse: 'wrong' })
    );

    const results = await Promise.all(attempts);
    const statuses = results.map((r) => r.status);

    expect(statuses).toContain(429);
  }, 20000);
});
