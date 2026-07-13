import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const 
    const socket = io(process.env.NUXT_SOCKET_URL || 'https://api.mentoraapp.online', {
        withCredentials: true,
        transports: ['websocket'],
        autoConnect: false
    });

    return {
        provide: {
            socket
        }
    };
});