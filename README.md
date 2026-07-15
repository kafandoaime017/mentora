# Mentora

Plateforme de gestion d'examens et de QCM pour établissements scolaires (étudiant, professeur,
directeur, superadmin). Frontend Nuxt 4, backend Express/TypeORM/MySQL, déploiement Docker.

## Lancer en développement

```bash
npm run dev        # docker compose -f docker-compose.dev.yml up --build
npm run dev:down    # arrêter
```

Sert : frontend sur `:3000`, backend sur `:5000`, MySQL sur `:3303`, adminer sur `:8080`.
Configuration via `backend/.env` et `frontend/.env`.

## Lancer en production

```bash
npm run prod        # docker compose -f docker-compose.prod.yml up -d --build
npm run prod:down
npm run prod:logs
```

Sert : frontend sur `:3001`, backend sur `:5001`, MySQL sur `:3309`, Glitchtip sur `:8001`,
Umami sur `:3002`. Configuration via `backend/.env.prod`, `frontend/.env.prod` et un `.env.prod`
racine (variables `DB_ROOT_PASSWORD`, `DB_DATABASE`, `GLITCHTIP_*`, `UMAMI_*`).

Le conteneur backend applique automatiquement les migrations TypeORM en attente avant de démarrer
(`npm run migration:run && node dist/server.js`, voir `backend/Dockerfile.prod`) — aucune étape
manuelle n'est nécessaire lors d'un déploiement.

## Fichiers docker-compose

| Fichier | Rôle |
|---|---|
| `docker-compose.dev.yml` | **Développement** — utilisé par `npm run dev`. |
| `docker-compose.prod.yml` | **Production** — source de vérité, utilisé par `npm run prod`. |
| `docker-compose.swarm.yml` | Variante Docker Swarm (multi-réplicas), non utilisée actuellement — conservée pour référence si un passage à Swarm est envisagé. |

Deux anciens fichiers (`docker-compose.yml` et `docker-compose.prod.simple.yml`), devenus des
doublons obsolètes non référencés par aucun script, ont été supprimés le 15/07/2026.
`docker-compose.prod.simple.yml` contenait par ailleurs des secrets en clair (mot de passe
applicatif Gmail, secret OAuth Google, clé API OpenRouter) — **ces identifiants doivent être
considérés comme compromis et régénérés** (voir section Sécurité ci-dessous), indépendamment de
la suppression du fichier, car ils restent visibles dans l'historique Git tant que celui-ci n'est
pas purgé.

## Reverse proxy / SSL

Aucun reverse proxy n'est conteneurisé dans ce projet : nginx tourne directement sur l'hôte.
Une configuration de référence est fournie dans `deploy/nginx/mentora.conf` (routage
`mentoraapp.online` → frontend, `api.mentoraapp.online` → backend, `errors.mentoraapp.online` →
Glitchtip) avec les instructions d'installation et de génération des certificats via certbot.

## Sécurité — rotation de secrets

Si un identifiant a pu être exposé (fichier commité par erreur, `.env` partagé, etc.), il faut le
régénérer côté fournisseur, pas seulement le retirer du dépôt :
- **Gmail (mot de passe d'application SMTP)** : Compte Google → Sécurité → Mots de passe des
  applications → révoquer puis recréer, mettre à jour `EMAIL_PASS` dans `.env.prod`.
- **Google OAuth (Client Secret)** : Google Cloud Console → Identifiants → régénérer le secret,
  mettre à jour `GOOGLE_CLIENT_SECRET`.
- **OpenRouter (clé API)** : tableau de bord OpenRouter → régénérer la clé, mettre à jour
  `OPENROUTER_API_KEY`.
- **JWT_SECRET / mots de passe DB** : à changer si une valeur faible ou par défaut a circulé ;
  invalide toutes les sessions actives.

## Monitoring

- Erreurs applicatives : Glitchtip (`https://errors.mentoraapp.online` en prod).
- Analytics d'usage (sans cookies) : Umami.
