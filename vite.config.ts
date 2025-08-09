import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'TubeTuner',
        short_name: 'TubeTuner',
        description: 'YouTube 影片速度控制器',
        theme_color: '#9333ea',
        background_color: '#1f2937',
        display: 'standalone',
        orientation: 'portrait',
        scope: (process.env.VITE_BASE_PATH || '/'),
        start_url: (process.env.VITE_BASE_PATH || '/'),
        icons: [
          {
            src: (process.env.VITE_BASE_PATH || '/') + 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: (process.env.VITE_BASE_PATH || '/') + 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
