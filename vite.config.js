import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/serviceWorker.js'),
        content: resolve(__dirname, 'src/contentScript/content.js')
      },
      output: {
        entryFileNames: 'src/[name]/[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})