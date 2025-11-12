/// <reference types="node" />
import { defineConfig, type UserConfig, type ConfigEnv } from 'vite'
// @ts-ignore: IDE 类型解析可能缺少 @vitejs/plugin-vue 的声明
import vue from '@vitejs/plugin-vue'
// import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Web版本始终使用根路径作为base
  const config: UserConfig = {
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
      postcss: './postcss.web.config.cjs'
    },
    build: {
      outDir: 'dist-web',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, '../index.html')
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
          manualChunks: (id) => {
            // 优化chunk分割策略 - 排除外部化模块
            if (id.includes('node_modules') &&
                !id.includes('mongodb') &&
                !id.includes('mysql2') &&
                !id.includes('mssql') &&
                !id.includes('sqlite3')) {
              // Vue核心库
              if (id.includes('vue') || id.includes('vue-router')) {
                return 'vue-vendor';
              }
              // Element Plus UI库
              if (id.includes('element-plus') || id.includes('@element-plus')) {
                return 'element-ui';
              }
              // 编辑器相关（Quill）
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
      assetsInlineLimit: 0,
      copyPublicDir: true,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: ({
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } as any)
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
            setup(build: import('esbuild').PluginBuild) {
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
  return config
})