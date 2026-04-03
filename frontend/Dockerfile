# ---------------------------
# Stage 1 : build
# ---------------------------
FROM node:22-bullseye-slim AS build
WORKDIR /app

# Installer dépendances système pour compiler modules natifs
RUN apt-get update && apt-get install -y python3 g++ make git && rm -rf /var/lib/apt/lists/*

# Copier package.json et package-lock.json pour activer le cache Docker
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier le code source
COPY . .

# Build Nuxt pour production
RUN npm run build

# ---------------------------
# Stage 2 : runtime
# ---------------------------
FROM node:22-bullseye-slim AS runtime
WORKDIR /app

# Copier build Nuxt et node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Exposer le port
EXPOSE 3000

# Lancer le serveur Nuxt en production
CMD ["node", ".output/server/index.mjs"]