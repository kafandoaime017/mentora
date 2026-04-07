# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Supprimer sharp du package.json avant installation
RUN node -e "const pkg=require('./package.json'); delete pkg.dependencies.sharp; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2))"

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le reste du code
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]