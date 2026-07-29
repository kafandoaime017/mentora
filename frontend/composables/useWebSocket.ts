import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socketInstance: Socket | null = null
const isConnectedRef = ref(false)

export const useWebSocket = () => {

  const connect = (userId: number, role: string, classeId?: number, filiereId?: number) => {
    if (socketInstance?.connected) {
      console.log('⚠️ WebSocket déjà connecté, skip')
      return
    }

    const wsUrl = process.env.NUXT_SOCKET_URL || 'https://api.mentoraapp.online'
    console.log('🔄 Connexion WebSocket à:', wsUrl)

    socketInstance = io(wsUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketInstance.on('connect', () => {
      console.log('✅ WebSocket connecté! ID:', socketInstance?.id)
      isConnectedRef.value = true
      socketInstance?.emit('authenticate', { userId, role })
      if (role === 'etudiant' && classeId && filiereId) {
        setTimeout(() => {
          socketInstance?.emit('join-class', { classeId, filiereId })
        }, 500)
      }
    })

    socketInstance.on('authenticated', (data) => {
      console.log('✅ Authentification confirmée:', data)
    })

    socketInstance.on('joined-class', (data) => {
      console.log('✅ Salle rejointe:', data)
    })

    socketInstance.on('new-session', (data) => {
      window.dispatchEvent(new CustomEvent('new-session', { detail: data }))
    })

    socketInstance.on('session-started', (data) => {
      window.dispatchEvent(new CustomEvent('session-started', { detail: data }))
    })

    // ← AJOUTE CET ÉCOUTEUR
    socketInstance.on('session-completed', (data) => {
      console.log('🏁 SESSION TERMINÉE!', data)
      window.dispatchEvent(new CustomEvent('session-completed', { detail: data }))
    })

    // Notification générique (createNotification côté backend) - couvre TOUS les
    // types de notifications, pour les 4 rôles (étudiant, professeur, directeur,
    // superadmin), contrairement aux événements ci-dessus qui ne couvrent que le
    // cycle de vie d'une session.
    socketInstance.on('notification', (data) => {
      window.dispatchEvent(new CustomEvent('app-notification', { detail: data }))
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Erreur connexion:', error.message)
      isConnectedRef.value = false
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 WebSocket déconnecté:', reason)
      isConnectedRef.value = false
      if (reason === 'io client disconnect') {
        socketInstance = null
      }
    })
  }

  const disconnect = () => {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
      isConnectedRef.value = false
    }
  }

  const onNewSession = (callback: (data: any) => void) => {
    window.addEventListener('new-session', (event: any) => callback(event.detail))
  }

  const onSessionStarted = (callback: (data: any) => void) => {
    window.addEventListener('session-started', (event: any) => callback(event.detail))
  }

  // ← AJOUTE CETTE FONCTION
  const onSessionCompleted = (callback: (data: any) => void) => {
    window.addEventListener('session-completed', (event: any) => callback(event.detail))
  }

  const onNotification = (callback: (data: any) => void) => {
    window.addEventListener('app-notification', (event: any) => callback(event.detail))
  }

  const getSocket = () => socketInstance

  return {
    socket: { value: socketInstance },
    isConnected: isConnectedRef,
    connect,
    disconnect,
    onNewSession,
    onSessionStarted,
    onSessionCompleted, // ← AJOUTE
    onNotification,
    getSocket
  }
}