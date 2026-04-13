import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
    const socket = ref<Socket | null>(null);
    const isConnected = ref(false);

    const connect = (userId: number, role: string, classeId?: number, filiereId?: number) => {
        const wsUrl = 'http://localhost:5000';
        
        console.log('🔄 Connexion WebSocket à:', wsUrl);
        
        if (socket.value?.connected) {
            console.log('⚠️ Déjà connecté');
            return;
        }
        
        socket.value = io(wsUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.value.on('connect', () => {
            console.log('✅ WebSocket connecté! ID:', socket.value?.id);
            isConnected.value = true;
            
            socket.value?.emit('authenticate', { userId, role });
            console.log('📤 Authentification envoyée pour user:', userId);
            
            if (role === 'etudiant' && classeId && filiereId) {
                setTimeout(() => {
                    socket.value?.emit('join-class', { classeId, filiereId });
                    console.log(`📤 Rejoint classe ${classeId}, filière ${filiereId}`);
                }, 500);
            }
        });

        socket.value.on('authenticated', (data) => {
            console.log('✅ Authentification confirmée:', data);
        });

        socket.value.on('joined-class', (data) => {
            console.log('✅ Salle rejointe avec succès:', data);
        });

        socket.value.on('new-session', (data) => {
            console.log('📢 NOUVELLE SESSION REÇUE!', data);
            window.dispatchEvent(new CustomEvent('new-session', { detail: data }));
        });

        // ✅ AJOUTER CET ÉCOUTEUR
        socket.value.on('session-started', (data) => {
            console.log('▶️ SESSION DÉMARRÉE!', data);
            window.dispatchEvent(new CustomEvent('session-started', { detail: data }));
        });

        socket.value.on('connect_error', (error) => {
            console.error('❌ Erreur connexion:', error.message);
            isConnected.value = false;
        });

        socket.value.on('disconnect', (reason) => {
            console.log('🔌 WebSocket déconnecté:', reason);
            isConnected.value = false;
        });
    };

    const disconnect = () => {
        if (socket.value) {
            socket.value.disconnect();
            socket.value = null;
            isConnected.value = false;
        }
    };

    const onNewSession = (callback: (data: any) => void) => {
        window.addEventListener('new-session', (event: any) => {
            console.log('🎯 Événement new-session capturé par le callback');
            callback(event.detail);
        });
    };

    // ✅ AJOUTER CETTE FONCTION
    const onSessionStarted = (callback: (data: any) => void) => {
        window.addEventListener('session-started', (event: any) => {
            console.log('🎯 Événement session-started capturé par le callback');
            callback(event.detail);
        });
    };

    return {
        socket,
        isConnected,
        connect,
        disconnect,
        onNewSession,
        onSessionStarted  // ✅ EXPORTER LA FONCTION
    };
};