import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Electron专用Vite配置
export default defineConfig({
  plugins: [vue()],
  base: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 为Node.js模块创建别名，避免构建时解析
      'mysql2/promise': resolve(__dirname, 'src/stubs/mysql2-stub.ts'),
      'sqlite3': resolve(__dirname, 'src/stubs/sqlite3-stub.ts'),
      'mongodb': resolve(__dirname, 'src/stubs/mongodb-stub.ts'),
      'mssql': resolve(__dirname, 'src/stubs/mssql-stub.ts')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron',
        'electron/main',
        'electron/preload',
        'fs',
        'path',
        'child_process',
        'os',
        'crypto',
        'net',
        'tls',
        'http',
        'https',
        'util',
        'stream',
        'events',
        'buffer',
        'querystring',
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
      define: {
        global: 'globalThis',
      },
    }
  },
  define: {
    global: 'window'
  }
})