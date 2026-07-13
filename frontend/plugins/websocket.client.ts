import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const socket = io(config.public.wsBase, {
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
