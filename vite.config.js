import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'RECOOM POS',
        short_name: 'RECOOM POS',
        description: 'Sistema de Punto de Venta para Abarrotes Multi-Sucursal',
        theme_color: '#8A2BE2',
        background_color: '#1D1D27',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/chat': {
        target: process.env.VITE_AI_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        onProxyReq: (proxyReq, req, res) => {
          console.log('Proxying request:', req.method, req.url);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log('Response from target:', proxyRes.statusCode);
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Enable transforming TS and JSX files in node_modules
    transformMode: {
      web: ["/.[jt]sx?$/"],
    },
  },
});