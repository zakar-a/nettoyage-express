import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['car-logo.svg', 'nettoyage-express-card.jpg'],
      manifest: {
        name: 'Nettoyage Express • Gestion Auto',
        short_name: 'Nettoyage Express',
        description: 'Centre esthétique automobile, lavage sur site et convoyage — Thorigné-Fouillard & Rennes',
        theme_color: '#070b14',
        background_color: '#070b14',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'car-logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'car-logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

