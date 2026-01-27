import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Don't add crossorigin attribute for Electron compatibility
    modulePreload: {
      polyfill: false,
    },
    // Disable crossorigin attribute for Electron file:// protocol
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  // Target Electron's Chrome version
  esbuild: {
    target: 'esnext',
  },
})
