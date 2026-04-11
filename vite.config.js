import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  envPrefix: ['VITE_', 'FEDAPAY_PUBLIC'],

  build: {
    // Avertissement à partir de 500 kB par chunk (au lieu de 800 kB par défaut)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Sépare React + vendor des chunks métier
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg', 'og-image.jpg'],

      // Content-Security-Policy via les headers du SW
      // (à compléter côté serveur / Nginx / Vercel headers)
      manifest: {
        name: 'AfroTresse',
        short_name: 'AfroTresse',
        description: 'Trouve ta tresse parfaite grâce à un selfie',
        theme_color: '#2C1A0E',
        background_color: '#2C1A0E',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        // Séparation "any" et "maskable" — requis par Lighthouse PWA
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      workbox: {
        // Précache : JS, CSS, HTML, images, fonts
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],

        // Taille max d'un fichier précaché (évite de précacher un gros bundle)
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB

        runtimeCaching: [
          // Google Fonts CSS
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Google Fonts fichiers woff2
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-assets',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Images locales (hors précache)
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          // API calls — Network first, fallback cache
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
