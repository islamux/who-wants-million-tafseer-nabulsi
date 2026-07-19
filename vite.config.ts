import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        id: '/',
        scope: '/',
        start_url: '/',
        name: 'من سيربح المليون',
        short_name: 'المليون',
        description: 'لعبة من سيربح المليون - Who Wants to Be a Millionaire',
        theme_color: '#ffd700',
        background_color: '#0f0c29',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ar',
        dir: 'rtl',
        categories: ['games', 'education'],
        screenshots: [
          {
            src: '/million-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'شاشة البداية'
          }
        ],
        shortcuts: [
          {
            name: 'ابدأ اللعب',
            short_name: 'ابدأ',
            description: 'بدء لعبة جديدة',
            url: '/',
            icons: [{ src: '/million-192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: '/million-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/million-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/million-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/million-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/offline.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
