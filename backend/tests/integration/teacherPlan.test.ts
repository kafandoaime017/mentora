// Verifie GET /api/teacher/plan, qui sert a cacher cote frontend la generation IA
// pour les ecoles sans plan Pro (fonctionnalite ajoutee pour le gating de plan).
// emailService.ts importe nodemailer-express-handlebars (module ESM non transforme
// par ts-jest) : on le mocke pour tous les tests d'integration qui chargent l'app
// entiere (app.ts charge toutes les routes, y compris auth -> emailService).
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
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import AppDataSource, { initTestDb, closeTestDb } from '../setup/db';
import { Ecole } from '../../src/app/models/Ecole';
import { User, UserRole } from '../../src/app/models/User';
import { ProfesseurProfil } from '../../src/app/models/ProfesseurProfil';

beforeAll(async () => {
  await initTestDb();
});

afterAll(async () => {
  await closeTestDb();
});

const creerProfesseur = async (plan: 'gratuit' | 'starter' | 'pro') => {
  const ecoleRepo = AppDataSource.getRepository(Ecole);
  const userRepo = AppDataSource.getRepository(User);
  const profilRepo = AppDataSource.getRepository(ProfesseurProfil);

  const ecole = await ecoleRepo.save(ecoleRepo.create({ nom: `Ecole ${plan} ${Date.now()}`, plan }));

  const user = await userRepo.save(userRepo.create({
    nom: 'Ouedraogo',
    prenom: 'Issa',
    email: `prof.${plan}.${Date.now()}@example.com`,
    motDePasse: 'hash',
    role: UserRole.PROFESSEUR,
    isVerified: true,
  }));

  await profilRepo.save(profilRepo.create({ userId: user.id, ecoleId: ecole.id }));

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string);
  return token;
};

describe('GET /api/teacher/plan', () => {
  it("indique ia:false pour une ecole au plan gratuit", async () => {
    const token = await creerProfesseur('gratuit');

    const res = await request(app).get('/api/teacher/plan').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.plan).toBe('gratuit');
    expect(res.body.data.ia).toBe(false);
  });

  it("indique ia:true pour une ecole au plan pro", async () => {
    const token = await creerProfesseur('pro');

    const res = await request(app).get('/api/teacher/plan').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.plan).toBe('pro');
    expect(res.body.data.ia).toBe(true);
  });

  it("indique ia:false pour une ecole au plan starter", async () => {
    const token = await creerProfesseur('starter');

    const res = await request(app).get('/api/teacher/plan').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.plan).toBe('starter');
    expect(res.body.data.ia).toBe(false);
  });

  it('renvoie 401 sans authentification', async () => {
    const res = await request(app).get('/api/teacher/plan');
    expect(res.status).toBe(401);
  });
});
