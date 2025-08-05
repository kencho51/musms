// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Source directory for frontend code (pages, components, etc.)
  srcDir: 'app/',
  
  // CSS
  css: ['~/assets/css/main.css'],
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  
  // Runtime config
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    databaseUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    public: {
      appName: 'Student Management System',
      appVersion: '1.0.0'
    }
  },
  
  // Nitro configuration for server routes
  nitro: {
    experimental: {
      wasm: true
    },
    prerender: {
      autoSubfolderIndex: false
    }
  }
})
