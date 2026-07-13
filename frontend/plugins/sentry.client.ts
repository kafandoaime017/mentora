import { defineNuxtPlugin } from '#app'
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin({
  // Exécuter uniquement côté client
  setup: (nuxtApp) => {
    const config = useRuntimeConfig()
    
    // Vérifier que le DSN est configuré
    if (!config.public.sentryDsn) {
      console.warn('⚠️ Sentry DSN non configuré')
      return
    }

    // Initialiser Sentry
    Sentry.init({
      app: nuxtApp.vueApp,
      dsn: config.public.sentryDsn,
      environment: config.public.sentryEnvironment || 'production',
      enabled: process.env.NODE_ENV === 'production',
      
      // Performance monitoring
      tracesSampleRate: 0.1,
      tracePropagationTargets: ['localhost', 'api.mentoraapp.online'],
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Intégrations
      integrations: [
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: true,
          maskAllInputs: false,
        }),
      ],
      
      // Personnalisation
      beforeSend(event) {
        // Ne pas envoyer les erreurs de développement
        if (process.env.NODE_ENV === 'development') {
          return null
        }
        
        // Ajouter des informations supplémentaires
        event.tags = {
          ...event.tags,
          app: 'mentora',
          version: '1.0.0',
        }
        
        return event
      },
    })
    
    console.log('✅ Sentry (GlitchTip) initialisé')
  },
})