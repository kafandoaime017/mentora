# Dockerfile (à la racine de mentora/)
FROM node:18-alpine AS builder

WORKDIR /app

# ============================================
# 1. Build du backend
# ============================================
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build

# ============================================
# 2. Build du frontend
# ============================================
WORKDIR /app
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm run build

# ============================================
# 3. Image finale
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copier le backend buildé
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/

# Copier le frontend buildé
COPY --from=builder /app/frontend/.output ./frontend/.output
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=builder /app/frontend/package.json ./frontend/

# Installer un process manager pour lancer les deux services
RUN npm install -g concurrently

EXPOSE 3000 5000

# Lancer backend et frontend en parallèle
CMD ["concurrently", \
  "node backend/dist/server.js", \
  "node frontend/.output/server/index.mjs"]