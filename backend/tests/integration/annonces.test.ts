// Test d'integration de la fonctionnalite Annonces/Sondages : un directeur cree
// une annonce "tous", un etudiant de la meme ecole la voit dans ses annonces
// actives et peut la marquer comme vue. Verifie aussi le controle d'acces par role.
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
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import AppDataSource, { initTestDb, closeTestDb } from '../setup/db';
import { Ecole } from '../../src/app/models/Ecole';
import { Filiere } from '../../src/app/models/Filiere';
import { Classe } from '../../src/app/models/Classe';
import { User, UserRole } from '../../src/app/models/User';
import { EtudiantProfil } from '../../src/app/models/EtudiantProfil';

let ecoleId: number;
let directeurToken: string;
let etudiantToken: string;

beforeAll(async () => {
  await initTestDb();

  const ecole = await AppDataSource.getRepository(Ecole).save(
    AppDataSource.getRepository(Ecole).create({ nom: `Ecole Annonces ${Date.now()}` })
  );
  ecoleId = ecole.id;

  const filiere = await AppDataSource.getRepository(Filiere).save(
    AppDataSource.getRepository(Filiere).create({ nom: 'Litteraire', ecoleId })
  );
  const classe = await AppDataSource.getRepository(Classe).save(
    AppDataSource.getRepository(Classe).create({ nom: 'Seconde A', filiereId: filiere.id })
  );

  const directeur = await AppDataSource.getRepository(User).save(
    AppDataSource.getRepository(User).create({
      nom: 'Sawadogo', prenom: 'Fatou', email: `directeur.${Date.now()}@example.com`,
      motDePasse: 'hash', role: UserRole.DIRECTEUR, isVerified: true, ecoleId,
    })
  );
  directeurToken = jwt.sign({ id: directeur.id, email: directeur.email, role: directeur.role }, process.env.JWT_SECRET as string);

  const etudiant = await AppDataSource.getRepository(User).save(
    AppDataSource.getRepository(User).create({
      nom: 'Zongo', prenom: 'Boureima', email: `etudiant.${Date.now()}@example.com`,
      motDePasse: 'hash', role: UserRole.ETUDIANT, isVerified: true,
    })
  );
  await AppDataSource.getRepository(EtudiantProfil).save(
    AppDataSource.getRepository(EtudiantProfil).create({
      userId: etudiant.id, ecoleId, filiereId: filiere.id, classeId: classe.id,
    })
  );
  etudiantToken = jwt.sign({ id: etudiant.id, email: etudiant.email, role: etudiant.role }, process.env.JWT_SECRET as string);
});

afterAll(async () => {
  await closeTestDb();
});

describe('Annonces (directeur + consultation etudiant)', () => {
  it('un etudiant ne peut pas creer une annonce (403)', async () => {
    const res = await request(app)
      .post('/api/admin/annonces')
      .set('Authorization', `Bearer ${etudiantToken}`)
      .send({ titre: 'x', contenu: 'y', type: 'info', cible_type: 'tous' });

    expect(res.status).toBe(403);
  });

  it('le directeur cree une annonce "tous" avec succes', async () => {
    const res = await request(app)
      .post('/api/admin/annonces')
      .set('Authorization', `Bearer ${directeurToken}`)
      .send({ titre: 'Reunion parents', contenu: 'Le 20 a 18h', type: 'info', cible_type: 'tous' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('rejette la creation avec un type invalide (400)', async () => {
    const res = await request(app)
      .post('/api/admin/annonces')
      .set('Authorization', `Bearer ${directeurToken}`)
      .send({ titre: 'x', contenu: 'y', type: 'invalide', cible_type: 'tous' });

    expect(res.status).toBe(400);
  });

  it("l'etudiant voit l'annonce dans ses annonces actives", async () => {
    const res = await request(app)
      .get('/api/annonces/actives')
      .set('Authorization', `Bearer ${etudiantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some((a: any) => a.titre === 'Reunion parents')).toBe(true);
  });

  it("le directeur voit l'annonce dans son tableau de bord avec l'audience calculee", async () => {
    const res = await request(app)
      .get('/api/admin/annonces')
      .set('Authorization', `Bearer ${directeurToken}`);

    expect(res.status).toBe(200);
    const annonce = res.body.data.find((a: any) => a.titre === 'Reunion parents');
    expect(annonce).toBeDefined();
    expect(annonce.audience).toBeGreaterThanOrEqual(1); // au moins l'etudiant cree ci-dessus
  });

  it("l'etudiant peut marquer l'annonce comme vue", async () => {
    const listRes = await request(app).get('/api/annonces/actives').set('Authorization', `Bearer ${etudiantToken}`);
    const annonceId = listRes.body.data[0].id;

    const res = await request(app)
      .post(`/api/annonces/${annonceId}/vue`)
      .set('Authorization', `Bearer ${etudiantToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
