// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  
  // Source directory for frontend code (pages, components, etc.)
  srcDir: 'app/',
  
  // CSS
  css: ['~/assets/css/main.css'],
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    'nitro-cloudflare-dev',
    '@nuxt/icon',
    '@pinia/nuxt'
  ],
  
  // Runtime config
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    public: {
      appName: 'Student Management System',
      appVersion: '1.0.0'
    }
  },
  
  // Nitro configuration for Cloudflare Pages
  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      wasm: true
    },
    compatibilityDate: '2024-11-18'
  }
})
