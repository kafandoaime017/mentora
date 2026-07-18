// tsc ne compile que les .ts -> .js et ignore les assets non-TypeScript (templates
// Handlebars des emails). Sans cette copie, dist/ ne contient jamais les .hbs et
// tout envoi d'email échoue en prod avec ENOENT (path.join(__dirname, ...) pointe
// vers dist/src/app/templates/emails qui n'existe pas).
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'app', 'templates');
const dest = path.join(__dirname, '..', 'dist', 'src', 'app', 'templates');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log(`Templates copiés : ${src} -> ${dest}`);
} else {
  console.warn(`Attention : dossier de templates introuvable (${src})`);
  process.exit(1);
}
