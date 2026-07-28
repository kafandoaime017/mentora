import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ─── Upload logo école ──────────────────────────────────────────────────────
const ecoleLogoDir = 'uploads/ecoles';
if (!fs.existsSync(ecoleLogoDir)) {
  fs.mkdirSync(ecoleLogoDir, { recursive: true });
}

const ecoleLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ecoleLogoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const uploadEcoleLogo = multer({
  storage: ecoleLogoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ─── Upload fichier réponse (question de type "fichier") ───────────────────
// Écrit directement dans src/public/uploads/reponses pour être servi par
// app.use('/uploads', express.static(path.join(__dirname, 'src/public/uploads')))
const reponseFichierDir = path.join(__dirname, '../../public/uploads/reponses');
if (!fs.existsSync(reponseFichierDir)) {
  fs.mkdirSync(reponseFichierDir, { recursive: true });
}

const reponseFichierStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reponseFichierDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `reponse-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const reponseFichierFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|zip/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
};

export const uploadReponseFichier = multer({
  storage: reponseFichierStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: reponseFichierFilter
});

// ─── Upload son de notification personnalisé ────────────────────────────────
// Écrit directement dans src/public/uploads/sons, servi par le même
// express.static('/uploads') que les réponses fichier.
const notifSonDir = path.join(__dirname, '../../public/uploads/sons');
if (!fs.existsSync(notifSonDir)) {
  fs.mkdirSync(notifSonDir, { recursive: true });
}

const notifSonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, notifSonDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `son-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const notifSonFilter = (req: any, file: any, cb: any) => {
  const allowedExt      = /mp3|wav|wave|ogg|mpeg/;
  const allowedMimetype = /audio\/(mpeg|mp3|wav|wave|x-wav|ogg)/;
  const extname   = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const mimetype  = allowedMimetype.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers audio (mp3, wav, ogg) sont autorisés'));
  }
};

export const uploadNotifSon = multer({
  storage: notifSonStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: notifSonFilter
});