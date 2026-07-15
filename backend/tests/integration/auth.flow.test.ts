// Test d'intégration bout-en-bout de l'authentification, programmatique via
// supertest (aucun appel Postman) : inscription -> vérification email -> connexion,
// et les principaux cas d'échec (mot de passe erroné, email non vérifié, accès
// sans token). Utilise l'app Express réelle (src/app.ts) et une base sqlite en
// mémoire isolée pour ce fichier (voir tests/setup/db.ts).
jest.mock('../../src/app/services/emailService', () => ({
  __esModule: true,
  sendEmail: jest.fn().mockResolvedValue(true),
  envoyerCodeVerification: jest.fn().mockResolvedValue(true),
  envoyerBienvenue: jest.fn().mockResolvedValue(true),
  envoyerResetPassword: jest.fn().mockResolvedValue(true),
  envoyerConfirmationResetPassword: jest.fn().mockResolvedValue(true),
  genererCodeVerification: jest.fn(() => '123456'),
}));

import request from 'supertest';
import app from '../../src/app';
import AppDataSource, { initTestDb, closeTestDb } from '../setup/db';
import { Ecole } from '../../src/app/models/Ecole';
import { Filiere } from '../../src/app/models/Filiere';
import { Classe } from '../../src/app/models/Classe';
import { User } from '../../src/app/models/User';

let ecoleId: number;
let filiereId: number;
let classeId: number;

beforeAll(async () => {
  await initTestDb();

  const ecole = await AppDataSource.getRepository(Ecole).save(
    AppDataSource.getRepository(Ecole).create({ nom: 'Lycée Test' })
  );
  ecoleId = ecole.id;

  const filiere = await AppDataSource.getRepository(Filiere).save(
    AppDataSource.getRepository(Filiere).create({ nom: 'Scientifique', ecoleId })
  );
  filiereId = filiere.id;

  const classe = await AppDataSource.getRepository(Classe).save(
    AppDataSource.getRepository(Classe).create({ nom: 'Terminale S', filiereId })
  );
  classeId = classe.id;
});

afterAll(async () => {
  await closeTestDb();
});

const inscriptionPayload = () => ({
  nom: 'Kaboré',
  prenom: 'Awa',
  email: `awa.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`,
  motDePasse: 'motdepasse123',
  ecoleId,
  filiereId,
  classeId,
});

describe("Flux d'authentification étudiant", () => {
  it('POST /api/auth/register crée un compte non vérifié', async () => {
    const payload = inscriptionPayload();

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresVerification).toBe(true);
    expect(res.body.user.email).toBe(payload.email);
  });

  it('POST /api/auth/register rejette un email déjà utilisé (409)', async () => {
    const payload = inscriptionPayload();
    await request(app).post('/api/auth/register').send(payload);

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register rejette un payload invalide (422, validation Joi)', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'pas-un-email' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login refuse la connexion tant que l’email n’est pas vérifié', async () => {
    const payload = inscriptionPayload();
    await request(app).post('/api/auth/register').send(payload);

    const res = await request(app).post('/api/auth/login').send({
      email: payload.email,
      motDePasse: payload.motDePasse,
    });

    expect(res.status).toBe(500); // erreur métier générique remontée par errorHandler
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual(expect.stringContaining('vérifier votre email'));
  });

  it('flux complet : inscription -> vérification -> connexion -> accès à une route protégée', async () => {
    const payload = inscriptionPayload();
    await request(app).post('/api/auth/register').send(payload);

    // Récupère le code de vérification directement en base (email mocké plus haut)
    const user = await AppDataSource.getRepository(User).findOne({ where: { email: payload.email } });
    expect(user?.verificationCode).toBeTruthy();

    const verifRes = await request(app)
      .post('/api/auth/verifier-email')
      .send({ email: payload.email, code: user!.verificationCode });
    expect(verifRes.status).toBe(200);
    expect(verifRes.body.success).toBe(true);
    expect(verifRes.body.token).toBeTruthy();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, motDePasse: payload.motDePasse });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    const token = loginRes.body.token;
    expect(token).toBeTruthy();
    expect(loginRes.body.user.profil.classeId).toBe(classeId);

    // Route protégée réservée aux étudiants
    const protectedRes = await request(app)
      .get('/api/students/sessions')
      .set('Authorization', `Bearer ${token}`);
    expect(protectedRes.status).toBe(200);
  });

  it('POST /api/auth/login rejette un mauvais mot de passe (compte vérifié)', async () => {
    const payload = inscriptionPayload();
    await request(app).post('/api/auth/register').send(payload);
    const user = await AppDataSource.getRepository(User).findOne({ where: { email: payload.email } });
    await request(app).post('/api/auth/verifier-email').send({ email: payload.email, code: user!.verificationCode });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, motDePasse: 'mauvais-mot-de-passe' });

    expect(res.status).toBe(500);
    expect(res.body.message).toEqual(expect.stringContaining('incorrect'));
  });

  it('GET /api/students/sessions sans token renvoie 401', async () => {
    const res = await request(app).get('/api/students/sessions');
    expect(res.status).toBe(401);
  });

  it('GET /api/students/sessions avec un token étudiant sur une route réservée aux professeurs renvoie 403', async () => {
    const payload = inscriptionPayload();
    await request(app).post('/api/auth/register').send(payload);
    const user = await AppDataSource.getRepository(User).findOne({ where: { email: payload.email } });
    await request(app).post('/api/auth/verifier-email').send({ email: payload.email, code: user!.verificationCode });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, motDePasse: payload.motDePasse });
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/teacher/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
