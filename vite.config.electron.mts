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
      'mssql': resolve(__dirname, 'src/stubs/mssql-stub.ts'),
      // 为Node.js内置模块提供polyfill
      'buffer': resolve(__dirname, 'node_modules/buffer/index.js'),
      'util': resolve(__dirname, 'node_modules/util/util.js'),
      'stream': resolve(__dirname, 'node_modules/stream-browserify/index.js'),
      'events': resolve(__dirname, 'node_modules/events/events.js'),
      'path': resolve(__dirname, 'node_modules/path-browserify/index.js'),
      'crypto': resolve(__dirname, 'node_modules/crypto-browserify/index.js'),
      'module': resolve(__dirname, 'node_modules/module/index.js')
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
        'querystring',
        'timers',
        'worker_threads'
      ],
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'ui': ['element-plus', '@element-plus/icons-vue'],
          'editor': ['@vueup/vue-quill', 'quill'],
          'ai': ['openai', '@anthropic-ai/sdk', '@google/generative-ai'],
          'utils': ['axios', 'lodash-es', 'uuid']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
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
    global: 'window',
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}'
  }
})