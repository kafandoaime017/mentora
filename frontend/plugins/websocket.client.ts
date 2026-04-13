import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const socket = io('http://localhost:5000', {
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