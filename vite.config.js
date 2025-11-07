import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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