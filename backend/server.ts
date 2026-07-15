import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import routes from "./src/routes/index";
import AppDataSource from "./src/config/data-source";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./src/app/middleware/errorHandler";
import { apiLimiter } from "./src/app/middleware/rateLimiter";
import path from "path";
import { setupSocketIO } from "./src/socket";
import { handleWebhook } from "./src/app/controllers/stripeController";

const app = express();
const server = createServer(app);

// ============================================
// SÉCURITÉ : EN-TÊTES HTTP (helmet)
// ============================================
app.use(
  helmet({
    // L'app sert des images (logos, uploads) consommées cross-origin par le frontend,
    // on désactive donc la politique par défaut trop stricte pour les ressources statiques.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ============================================
// CONFIGURATION CORS UNIFIÉE
// ============================================
const allowedOrigins = [
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
    // Permettre les requêtes sans origin (comme les appels serveur-à-serveur)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('❌ CORS bloqué pour:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400
};

// Appliquer CORS à toutes les routes
app.use(cors(corsOptions));

// ⚠️ WEBHOOK STRIPE — DOIT ÊTRE AVANT express.json()
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
)

// JSON parser pour toutes les autres routes
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'src/public/uploads')));
app.use("/api", apiLimiter, routes);
app.use(errorHandler);

// ============================================
// WEBSOCKET avec la MÊME configuration CORS
// ============================================
const io = new SocketServer(server, {
    cors: {
        origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

setupSocketIO(io);

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
    .then(() => {
        console.log("📦 Data Source has been initialized!");
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🔌 WebSocket server is ready`);
            console.log(`✅ CORS autorisé pour:`, allowedOrigins);
        });
    })
    .catch((err: Error) => {
        console.error("Error during Data Source initialization:", err);
    });