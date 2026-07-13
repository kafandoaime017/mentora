// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      'Syne': [600, 700, 800],
      'Plus Jakarta Sans': [300, 400, 500, 600],
    },
    display: 'swap',
    download: true,
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.mentoraapp.online/api',
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || 'https://api.mentoraapp.online',
    },
  },

  // Configuration Vite
  vite: {
    server: {
      allowedHosts: [
        'mentoraapp.online',
        'www.mentoraapp.online',
        'api.mentoraapp.online',
        'errors.mentoraapp.online',
        'stats.mentoraapp.online',
        '.mentoraapp.online',
        '31.97.55.208',
        'localhost',
        '127.0.0.1'
      ]
    }
  }
})
