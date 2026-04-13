import express from "express";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import routes from "./src/routes/index";
import AppDataSource from "./src/config/data-source";
import cors from "cors";
import { errorHandler } from "./src/app/middleware/errorHandler";
import path from "path";
import { setupSocketIO } from "./src/socket";
import { setSocketIO } from "./src/app/controllers/teacherController";

const app = express();
const server = createServer(app);

// Configuration CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'src/public/uploads')));

app.use("/api", routes);
app.use(errorHandler);

// Configuration Socket.io
const io = new SocketServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialiser les WebSockets
setupSocketIO(io);

// 🔴 PASSER L'INSTANCE AU CONTRÔLEUR
setSocketIO(io);

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
    .then(() => {
        console.log("📦 Data Source has been initialized!");
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🔌 WebSocket server is ready`);
        });
    })
    .catch((err: Error) => {
        console.error("Error during Data Source initialization:", err);
    });