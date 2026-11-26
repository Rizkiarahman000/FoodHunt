import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Development: frontend di 5173, API Express di 3000.
const apiProxy = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
  plugins: [
    react(),
    VitePWA({
      // Service worker baru menunggu sampai pengguna menekan "Perbarui"
      // di halaman Profil atau banner pembaruan.
      registerType: 'prompt',
      injectRegister: null,
      devOptions: { enabled: true },
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'FoodHunt: Buruan Kuliner Tembalang',
        short_name: 'FoodHunt',
        description:
          'Rekomendasi kuliner Tembalang, simpan hidden gem, dan catat resto yang pernah dibeli.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#faf7f2',
        theme_color: '#ea580c',
        categories: ['food', 'lifestyle', 'travel'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        // Jangan pernah mengembalikan app shell untuk request API.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Data terakhir dari API Express tetap terbaca saat offline.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'foodhunt-api',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'images.unsplash.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'foodhunt-photos',
              expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'foodhunt-fonts' },
          },
        ],
      },
    }),
  ],
})
