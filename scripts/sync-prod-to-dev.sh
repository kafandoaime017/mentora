#!/bin/bash
# ============================================================================
# sync-prod-to-dev.sh
#
# Copie les données de la base de PRODUCTION (mentora_db_prod) dans la base
# de DEV (mentora_db). À lancer manuellement sur le VPS quand tu veux que ta
# base de dev reflète l'état réel de la prod (débug, tests avec données
# réalistes...).
#
# ATTENTION : ce script ÉCRASE entièrement la base de dev. Il ne touche
# JAMAIS à la prod en écriture (dump en lecture seule côté prod).
#
# Usage : bash scripts/sync-prod-to-dev.sh
# (à lancer depuis la racine du repo, sur le serveur, avec les deux stacks
#  dev + prod démarrées)
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.prod ]; then
  echo "Erreur : .env.prod introuvable à la racine du repo." >&2
  exit 1
fi

# Charge DB_ROOT_PASSWORD depuis .env.prod sans polluer l'environnement courant
PROD_PASS=$(grep -E '^DB_ROOT_PASSWORD=' .env.prod | cut -d '=' -f2-)
if [ -z "$PROD_PASS" ]; then
  echo "Erreur : DB_ROOT_PASSWORD vide ou introuvable dans .env.prod." >&2
  exit 1
fi

PROD_CONTAINER=mentora_db_prod
DEV_CONTAINER=mentora_db
PROD_DB=mentora_prod
DEV_DB=mentora
DEV_PASS=root   # identifiants dev, cf. docker-compose.dev.yml

for c in "$PROD_CONTAINER" "$DEV_CONTAINER"; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$c"; then
    echo "Erreur : le conteneur '$c' n'est pas démarré." >&2
    exit 1
  fi
done

DUMP_FILE="/tmp/mentora_prod_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "→ Export de '$PROD_DB' (prod)..."
docker exec "$PROD_CONTAINER" mysqldump -u root -p"$PROD_PASS" --single-transaction --quick "$PROD_DB" > "$DUMP_FILE"

echo "→ Import dans '$DEV_DB' (dev) — les données dev actuelles sont écrasées..."
docker exec -i "$DEV_CONTAINER" mysql -u root -p"$DEV_PASS" -e "DROP DATABASE IF EXISTS $DEV_DB; CREATE DATABASE $DEV_DB;"
docker exec -i "$DEV_CONTAINER" mysql -u root -p"$DEV_PASS" "$DEV_DB" < "$DUMP_FILE"

rm -f "$DUMP_FILE"

echo "✓ Terminé : la base de dev contient maintenant une copie de la prod."
