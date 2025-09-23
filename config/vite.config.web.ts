import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export default defineConfig(({ mode }) => {
  // Web版本始终使用根路径作为base
  return {
    plugins: [
      vue(),
      // legacy({
      //   targets: ['defaults', 'not IE 11']
      // })
    ],
    base: '/',
    publicDir: 'public',
    root: '.',
    css: {
      postcss: './config/postcss.web.config.cjs'
    },
    build: {
      outDir: 'dist-web',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, '../index.web.html')
        },
        external: [
          'mongodb',
          'mysql2',
          'mssql',
          'sqlite3',
          'net',
          'tls',
          'assert',
          'vm',
          'fs',
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
          'zlib'
        ],
        output: {
          manualChunks: {
            // Vue相关库
            'vue-vendor': ['vue', 'vue-router'],
            // UI组件库
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            // 编辑器相关
            'editor': ['quill', 'quill-delta', '@vueup/vue-quill'],
            // AI相关
            'ai-vendor': ['openai', '@anthropic-ai/sdk', '@google/generative-ai'],
            // 工具库
            'utils': ['axios', 'uuid', 'diff-match-patch'],
            // 文档处理
            'docx': ['docx', 'html-to-text']
          }
        }
      },
      assetsInlineLimit: 0,
      copyPublicDir: true,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
        // 忽略Node.js核心模块警告
        plugins: [
          {
            name: 'ignore-node-modules',
            setup(build) {
              build.onResolve({ filter: /^(timers|stream|crypto|net|tls|fs|path|util)$/ }, () => {
                return { path: 'empty-module', external: true }
              })
            }
          }
        ]
      },
      // 预构建常用依赖
      include: [
        'vue',
        'vue-router',
        'element-plus',
        '@element-plus/icons-vue',
        'buffer',
        'process'
      ],
      // 排除数据库依赖，它们不应该在浏览器环境中预构建
      exclude: [
        'mongodb',
        'mysql2',
        'mssql',
        'sqlite3'
      ]
    },
    define: {
      // 确保Buffer可用
      global: 'window',
      // 定义环境变量
      __APP_ENV__: JSON.stringify(mode),
      __IS_WEB__: JSON.stringify(true)
    },
    // 外部化 Node.js 核心模块，减少警告
    resolve: {
      alias: {
        '@': resolve(__dirname, '../src'),
        // 只保留必要的别名，其他由legacy插件处理
        'buffer': 'buffer',
        'process': 'process'
      }
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true
    }
  }
})