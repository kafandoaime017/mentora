FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN node -e "const pkg=require('./package.json'); delete pkg.dependencies.sharp; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2))"

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]