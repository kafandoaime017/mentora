import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import app, { allowedOrigins } from "./src/app";
import AppDataSource from "./src/config/data-source";
import { setupSocketIO } from "./src/socket";

const server = createServer(app);


// ============================================
// WEBSOCKET avec la MEME configuration CORS
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
        console.log("Data Source has been initialized!");
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`WebSocket server is ready`);
            console.log(`CORS autorise pour:`, allowedOrigins);
        });
    })
    .catch((err: Error) => {
        console.error("Error during Data Source initialization:", err);
    });
