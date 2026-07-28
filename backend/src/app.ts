// src/app.ts
// Construit et exporte l'application Express, sans demarrer le serveur HTTP ni
// initialiser la base de donnees. Separe de server.ts pour permettre aux tests
// (supertest) d'importer `app` directement, sans ecouter de port reseau.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import routes from "./routes/index";
import { errorHandler } from "./app/middleware/errorHandler";
import { apiLimiter } from "./app/middleware/rateLimiter";
import { handleWebhook } from "./app/controllers/stripeController";

// ============================================
// CONFIGURATION CORS UNIFIEE
// ============================================
export const allowedOrigins = [
  'https://mentoraapp.online',
  'https://www.mentoraapp.online',
  'https://api.mentoraapp.online',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://31.97.55.208:3000',
  'http://31.97.55.208:5000'
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permettre les requetes sans origin (comme les appels serveur-a-serveur)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('CORS bloque pour:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400
};

const app = express();

// L'app tourne toujours derriere un reverse proxy (nginx) en prod, qui ajoute
// un en-tete X-Forwarded-For. Sans "trust proxy", Express l'ignore et
// express-rate-limit refuse de demarrer (ERR_ERL_UNEXPECTED_X_FORWARDED_FOR).
// "1" = on fait confiance au premier hop uniquement (le nginx local), pas a
// une chaine de proxys arbitraire fournie par le client.
app.set('trust proxy', 1);

// ============================================
// SECURITE : EN-TETES HTTP (helmet)
// ============================================
app.use(
  helmet({
    // L'app sert des images (logos, uploads) consommees cross-origin par le frontend,
    // on desactive donc la politique par defaut trop stricte pour les ressources statiques.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Appliquer CORS a toutes les routes
app.use(cors(corsOptions));

// WEBHOOK STRIPE -- DOIT ETRE AVANT express.json()
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

// JSON parser pour toutes les autres routes
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use("/api", apiLimiter, routes);
app.use(errorHandler);

export default app;
