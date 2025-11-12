import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron',
        'mongodb',
        'mysql2',
        'mssql',
        'sqlite3',
        'net',
        'tls',
        'fs',
        'path',
        'child_process',
        'cluster',
        'dgram',
        'dns',
        'domain',
        'http',
        'https',
        'readline',
        'repl',
        'tls',
        'tty',
        'udp/dgram',
        'url',
        'util',
        'v8',
        'vm',
        'zlib',
        'os',
        'crypto',
        'stream',
        'events',
        'buffer',
        'querystring',
        'string_decoder',
        'timers',
        'worker_threads'
      ],
      output: {
        manualChunks: {}
      }
    },
    assetsInlineLimit: 0,
    copyPublicDir: true,
    commonjsOptions: {
      ignoreDynamicRequires: true,
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    }
  },
  define: {
    // 确保Buffer可用
    global: 'window'
  }
})
