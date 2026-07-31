# Mentora

Plateforme web de gestion d'examens/QCM pour établissements scolaires. Une école s'inscrit, ses professeurs créent des sessions d'examen (QCM, vrai/faux, texte libre, appariement, fichier à rendre...), les étudiants les passent en temps réel, et le directeur pilote son établissement (filières, classes, utilisateurs, statistiques, annonces, logs d'audit).

Stack : **Nuxt 4** (frontend) + **Express / TypeORM / MySQL** (backend), communication temps réel via **Socket.IO**.

## Sommaire

- [Rôles et fonctionnalités](#rôles-et-fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation en local (développement)](#installation-en-local-développement)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données et migrations](#base-de-données-et-migrations)
- [Tests](#tests)
- [Déploiement (production)](#déploiement-production)
- [Monitoring](#monitoring)
- [CI](#ci)

## Rôles et fonctionnalités

**Étudiant** — rejoint une classe (invitation ou code d'inscription), passe les sessions d'examen assignées, consulte ses notes une fois publiées, reçoit des notifications (nouvelle session, session démarrée, notes publiées) avec cloche + son en temps réel, consulte les annonces/sondages de l'école.

**Professeur** — crée des sessions d'examen (QCM simple/multiple, vrai/faux, texte libre, appariement, fichier à rendre), gère une banque de questions réutilisable, importe des questions en masse (CSV/Excel), corrige manuellement les réponses ouvertes, consulte des statistiques par session (graphiques), dispose d'un indicateur de suspicion de triche par étudiant (changements d'onglet, temps de réponse).

**Directeur** — gère l'établissement : filières et classes (tableau avec actions), utilisateurs (invitations, import CSV/Excel, historique PDF), sessions (vue calendrier, création en urgence, duplication de modèle), annonces/sondages, logs d'audit, abonnement/plan (gratuit / starter / pro via Stripe), personnalisation (logo école, couleurs).

**Superadmin** — supervise l'ensemble des écoles inscrites sur la plateforme : liste et détail des écoles, gestion des abonnements/plans, invitations de directeurs, utilisateurs tous rôles confondus, logs d'audit globaux, liens de monitoring (Glitchtip, Umami).

**Inscription self-service** — depuis la landing page, une école peut s'inscrire elle-même (choix d'un plan, création du compte directeur, vérification email) sans passer par une invitation superadmin.

## Stack technique

**Frontend**
- Nuxt 4 / Vue 3, Tailwind CSS (palette de marque : teal `primary` / olive `secondary`)
- Socket.IO client (notifications et mises à jour temps réel)

**Backend**
- Node.js 20, Express 5, TypeScript
- TypeORM + MySQL 8
- Socket.IO (temps réel : sessions live, notifications)
- JWT + Google OAuth (google-auth-library) + 2FA TOTP (speakeasy)
- Stripe (abonnements/facturation)
- Nodemailer + Handlebars (emails transactionnels)
- Multer (avatars, logos, fichiers réponse, sons de notification)
- PDFKit (exports PDF), Sharp (traitement d'images)

**Tests**
- Jest + Supertest, base SQLite en mémoire (`sql.js`) isolée par fichier de test — aucune dépendance à MySQL en CI

**Infra**
- Docker / docker-compose (environnements dev, prod, swarm)
- Nginx en reverse proxy devant le frontend et l'API
- Glitchtip (suivi d'erreurs) et Umami (analytics), auto-hébergés

## Structure du projet

```
mentora/
├── backend/                 API Express + TypeORM
│   ├── src/
│   │   ├── app.ts           construction de l'app Express (sans démarrer le serveur)
│   │   ├── server.ts        point d'entrée (démarre HTTP + Socket.IO)
│   │   ├── config/          data-source.ts (connexion DB, entities, migrations)
│   │   ├── app/
│   │   │   ├── models/      entités TypeORM
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   └── migrations/  migrations TypeORM (seules celles ici sont exécutées)
│   │   ├── routes/
│   │   └── socket/          setup Socket.IO + salles par utilisateur/classe/session
│   └── tests/                unitaires + intégration (non inclus dans l'image Docker)
├── frontend/                 Nuxt 4
│   └── app/
│       ├── pages/            organisées par rôle (students/, teachers/, directeurs/, superadmin/)
│       ├── components/       layouts par rôle, composants partagés
│       └── middleware/       auth.global.js (routes publiques/protégées)
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── docker-compose.swarm.yml  (variante non utilisée en l'état, conservée pour référence)
└── .github/workflows/        CI (tests backend)
```

## Prérequis

- Node.js 20+
- MySQL 8 (ou Docker pour l'exécuter en conteneur)
- npm

## Installation en local (développement)

```bash
git clone https://github.com/kafandoaime017/mentora.git
cd mentora

# Backend
cd backend
npm install
cp .env.example .env.development   # renseigner les variables (voir ci-dessous)
npm run migration:run              # crée/actualise le schéma de la base
npm run dev                        # démarre l'API sur http://localhost:5000

# Frontend (autre terminal)
cd frontend
npm install
cp .env.example .env.development   # renseigner les variables
npm run dev                        # démarre le frontend sur http://localhost:3000
```

Alternative via Docker (démarre aussi MySQL) :

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

## Variables d'environnement

Chaque côté (`backend/`, `frontend/`) a son propre `.env.example` à dupliquer en `.env.development` (local) ou `.env.prod` (production). Les principales variables backend :

| Variable | Rôle |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | connexion MySQL |
| `DB_SYNCHRONIZE` | à laisser à `false` sauf bootstrap ponctuel d'une base totalement vide |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | signature des tokens |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | connexion Google |
| `SMTP_*`, `EMAIL_USER`, `EMAIL_PASS` | envoi d'emails transactionnels |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_*_MONTHLY/YEARLY` | abonnements |
| `FRONTEND_URL`, `API_URL` | URLs utilisées pour générer liens email / callback OAuth |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` | anti brute-force |

Ne jamais committer un `.env` réel : seuls les `.env.example` sont versionnés.

## Base de données et migrations

Le schéma est entièrement piloté par les migrations TypeORM situées dans `backend/src/app/migrations/` (c'est le seul dossier référencé par `data-source.ts` — un fichier de migration ailleurs ne sera jamais exécuté).

```bash
npm run migration:run       # applique les migrations en attente
npm run migration:generate  # génère une migration à partir des diffs d'entités
npm run migration:create    # crée un squelette de migration vide
```

Sur une base neuve, `InitialSchema` (première migration exécutée) crée les tables fondatrices ; toutes les migrations suivantes sont des altérations incrémentales. `DB_SYNCHRONIZE=true` ne doit servir qu'à un bootstrap exceptionnel et jamais rester actif.

## Tests

```bash
cd backend
npm test              # tests unitaires + intégration, couverture incluse
npm run test:unit
npm run test:integration
```

Les tests tournent contre une base SQLite en mémoire (aucune dépendance à MySQL) et ne sont pas inclus dans l'image Docker de production — ils s'exécutent uniquement en local ou en CI.

## Déploiement (production)

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

Le conteneur backend applique automatiquement les migrations en attente avant de démarrer le serveur (`npm run migration:run && node dist/server.js`), pour éviter qu'un déploiement ne tourne sur un schéma obsolète.

## Monitoring

- **Glitchtip** (`glitchtip-web`/`glitchtip-worker`) : suivi des erreurs applicatives.
- **Umami** : analytics de fréquentation du site.

Liens rapides accessibles depuis l'espace superadmin.

## CI

`.github/workflows/backend-tests.yml` exécute la suite de tests backend (avec couverture) à chaque push et pull request, sur Node.js 20.
