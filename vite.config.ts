import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 基础Vite配置 - 用于开发模式
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      external: [
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
        'http',
        'https',
        'readline',
        'repl',
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
        manualChunks: (id) => {
          // 只对非外部化模块进行手动分割
          if (id.includes('node_modules') && !id.includes('mongodb') && !id.includes('mysql2') && !id.includes('mssql') && !id.includes('sqlite3')) {
            // Vue核心
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vue-vendor';
            }
            // UI库
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'element-ui';
            }
            // 编辑器核心
            if (id.includes('quill') || id.includes('parchment') || id.includes('vue-quill')) {
              return 'editor-core';
            }
            // 工具库
            if (id.includes('uuid') || id.includes('diff-match-patch') || id.includes('fast-diff')) {
              return 'utils';
            }
            // 文档处理
            if (id.includes('docx') || id.includes('html-to-text')) {
              return 'docx-lib';
            }
            // AI服务
            if (id.includes('@vueuse')) {
              return 'ai-service';
            }
            // 其他第三方库
            return 'vendor-libs';
          }
          // 源码分离
          if (id.includes('/src/')) {
            if (id.includes('/views/')) {
              return 'views';
            }
            if (id.includes('/components/')) {
              return 'components';
            }
            if (id.includes('/services/')) {
              return 'services';
            }
            if (id.includes('/utils/')) {
              return 'utils-src';
            }
            return 'src-app';
          }
          // 其他情况返回 undefined
          return undefined;
        },
        // 优化chunk文件名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  },
  server: {
    port: 5173
  }
})
