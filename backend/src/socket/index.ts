import { Server, Socket } from 'socket.io';
import AppDataSource from '../config/data-source';
import { Session } from '../app/models/Session';

const sessionRepo = AppDataSource.getRepository(Session);

// ── Référence globale à l'instance io ─────────────────────────────────────────
let ioRef: Server | null = null;

export const getSocketIO = (): Server | null => ioRef;

// Interfaces
interface AuthenticateData {
    userId: number;
    role: string;
}

interface JoinClassData {
    classeId: number;
    filiereId: number;
}

interface SessionData {
    id: number;
    titre: string;
    theme: string | null;
    date_debut: Date;
    duree: number;
    status: string;
    code: string;
    professeur: string | null;
}

const userSockets = new Map<number, string>();
const userRooms   = new Map<number, Set<string>>();

export const setupSocketIO = (io: Server) => {
    ioRef = io; // ← exposer l'instance globalement

    console.log('🔌 Initialisation du serveur WebSocket...');

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Nouvelle connexion: ${socket.id}`);

        // ==================== AUTHENTIFICATION ====================
        socket.on('authenticate', (data: AuthenticateData) => {
            const { userId, role } = data;

            socket.data.userId = userId;
            socket.data.role   = role;
            userSockets.set(userId, socket.id);

            console.log(`✅ Utilisateur authentifié: ID=${userId}, Rôle=${role}, Socket=${socket.id}`);

            // Salle personnelle : TOUS les rôles la rejoignent (etudiant, professeur,
            // directeur, superadmin) - c'est elle que createNotification() cible pour
            // pousser les notifications en direct, quel que soit le rôle.
            socket.join(`user_${userId}`);

            if (role === 'etudiant') {
                socket.join(`student_${userId}`);
                console.log(`📌 Étudiant ${userId} a rejoint sa salle personnelle`);
            }

            if (role === 'professeur') {
                socket.join(`teacher_${userId}`);
                console.log(`📌 Professeur ${userId} a rejoint sa salle`);
            }

            socket.emit('authenticated', { success: true, userId, role });
        });

        // ==================== REJOINDRE UNE CLASSE ====================
        socket.on('join-class', (data: JoinClassData) => {
            const { classeId, filiereId } = data;
            const roomName = `classe_${classeId}_filiere_${filiereId}`;

            socket.join(roomName);

            if (!userRooms.has(socket.data.userId)) {
                userRooms.set(socket.data.userId, new Set());
            }
            userRooms.get(socket.data.userId)?.add(roomName);

            console.log(`📌 Socket ${socket.id} (User ${socket.data.userId}) a rejoint: ${roomName}`);

            socket.emit('joined-class', { success: true, room: roomName, classeId, filiereId });
        });

        // ==================== QUITTER UNE CLASSE ====================
        socket.on('leave-class', (data: JoinClassData) => {
            const { classeId, filiereId } = data;
            const roomName = `classe_${classeId}_filiere_${filiereId}`;

            socket.leave(roomName);

            if (userRooms.has(socket.data.userId)) {
                userRooms.get(socket.data.userId)?.delete(roomName);
            }

            socket.emit('left-class', { success: true, room: roomName });
        });

        // ==================== ROOM SESSION (professeur) ====================
        socket.on('join-session-room', (sessionId: number) => {
            const room = `session_${sessionId}`;
            socket.join(room);
            console.log(`📌 Socket ${socket.id} a rejoint la room ${room}`);
            socket.emit('joined-session-room', { sessionId });
        });

        socket.on('leave-session-room', (sessionId: number) => {
            socket.leave(`session_${sessionId}`);
            console.log(`📌 Socket ${socket.id} a quitté session_${sessionId}`);
        });

        // ==================== PING ====================
        socket.on('ping', () => {
            socket.emit('pong');
        });

        // ==================== DÉCONNEXION ====================
        socket.on('disconnect', () => {
            console.log(`🔌 Déconnexion: ${socket.id} - User: ${socket.data.userId}`);
            if (socket.data.userId) {
                userSockets.delete(socket.data.userId);
                userRooms.delete(socket.data.userId);
            }
        });

        // ==================== ERREUR ====================
        socket.on('error', (error) => {
            console.error(`❌ Erreur socket ${socket.id}:`, error);
        });
    });

    // ==================== FONCTIONS UTILITAIRES ====================

    const notifyNewSession = async (classeId: number, filiereId: number, session: any, professeurNom: string) => {
        const roomName = `classe_${classeId}_filiere_${filiereId}`;
        const sessionData: SessionData = {
            id: session.id,
            titre: session.titre,
            theme: session.theme,
            date_debut: session.date_debut,
            duree: session.duree,
            status: session.status,
            code: session.code,
            professeur: professeurNom
        };
        io.to(roomName).emit('new-session', {
            session: sessionData,
            message: `Nouvelle session disponible: ${session.titre}`,
            timestamp: new Date()
        });
        console.log(`📢 Nouvelle session notifiée à: ${roomName}`);
        return { success: true, room: roomName };
    };

    const notifyStudent = (studentId: number, event: string, data: any) => {
        io.to(`user_${studentId}`).emit(event, data);
    };

    const notifyTeacher = (teacherId: number, event: string, data: any) => {
        io.to(`teacher_${teacherId}`).emit(event, data);
    };

    const notifyClass = (classeId: number, filiereId: number, event: string, data: any) => {
        const roomName = `classe_${classeId}_filiere_${filiereId}`;
        io.to(roomName).emit(event, data);
    };

    const updateSessionStatus = async (sessionId: number, status: string) => {
        const session = await sessionRepo.findOne({
            where: { id: sessionId },
            relations: ['classe', 'filiere']
        });
        if (session) {
            const roomName = `classe_${session.classe_id}_filiere_${session.filiere_id}`;
            io.to(roomName).emit('session-status-update', {
                sessionId,
                status,
                message: status === 'active'
                    ? `La session "${session.titre}" a commencé !`
                    : `La session "${session.titre}" est terminée.`
            });
        }
    };

    const sendSessionReminder = async (sessionId: number, minutesBefore: number = 5) => {
        const session = await sessionRepo.findOne({
            where: { id: sessionId },
            relations: ['classe', 'filiere']
        });
        if (session && session.status === 'pending') {
            const roomName = `classe_${session.classe_id}_filiere_${session.filiere_id}`;
            io.to(roomName).emit('session-reminder', {
                sessionId: session.id,
                titre: session.titre,
                minutesBefore,
                message: `La session "${session.titre}" commence dans ${minutesBefore} minutes !`,
                date_debut: session.date_debut
            });
        }
    };

    return {
        notifyNewSession,
        notifyStudent,
        notifyTeacher,
        notifyClass,
        updateSessionStatus,
        sendSessionReminder,
        getIo: () => io,
        getUserSockets: () => userSockets
    };
};