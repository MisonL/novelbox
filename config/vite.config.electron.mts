import { defineConfig } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
 // @ts-ignore - Suppress type declaration error for IDE
 import vue from '@vitejs/plugin-vue';
import { resolve } from 'path'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'

// 处理 external 模块导入的插件
function externalModulePolyfillPlugin() {
  const externalModules = [
    'aws-ssl-profiles',
    'mongodb',
    'mssql',
    'mysql2',
    'mysql2/promise',
    'pg',
    'pg-native',
    'tedious',
    'bson',
    'mongodb-client-encryption',
    'mongodb-connection-string-url',
    'native-duplexpair',
    '@tediousjs/connection-string',
    '@tediousjs/connection-pool',
    '@tediousjs/request',
    '@tediousjs/transformers',
    '@tediousjs/types',
    'keytar',
    'http-proxy-agent',
    'https-proxy-agent',
    'socks-proxy-agent',
    'global-agent',
    'proxy-from-env'
  ];

  return {
    name: 'external-module-polyfill',
    apply: (config: UserConfig, { mode }: ConfigEnv) => mode === 'production',
    transform: (code: string, id: string) => {
      // Prevent ESLint no-unused-vars for required hook param
      void id;
      // 替换所有类型的 import 语句
      externalModules.forEach(module => {
        const moduleVar = module.replace(/[^a-zA-Z0-9]/g, '_');
        const polyfill = `const ${moduleVar} = {}; export default ${moduleVar};`;

        // 替换 default import: import aws_ssl_profiles from 'aws-ssl-profiles'
        const defaultImport = new RegExp(`import\\s+['"]${module}['"]`, 'g');
        code = code.replace(defaultImport, polyfill);

        // 替换 named import: import { something } from 'aws-ssl-profiles'
        const namedImport = new RegExp(`import\\s+\\{[^}]*\\}\\s+from\\s+['"]${module}['"]`, 'g');
        code = code.replace(namedImport, polyfill);

        // 替换 namespace import: import * as X from 'aws-ssl-profiles'
        const namespaceImport = new RegExp(`import\\s+\\*\\s+as\\s+\\w+\\s+from\\s+['"]${module}['"]`, 'g');
        code = code.replace(namespaceImport, polyfill);

        // 替换 side-effect import: import 'aws-ssl-profiles' (不带分号)
        const sideEffectImport1 = new RegExp(`import\\s+['"]${module}['"];?\\s*`, 'g');
        code = code.replace(sideEffectImport1, `/* ${module} polyfill */ `);
      });
      return code;
    },
    writeBundle() {
      /* eslint-disable no-console */
      // 构建完成后，清理 dist 文件中的所有 external 模块导入
      const cleanDistFiles = (dir: string) => {
        try {
          const files = readdirSync(dir);
          for (const file of files) {
            const fullPath = resolve(dir, file);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
              cleanDistFiles(fullPath);
            } else if (file.endsWith('.js')) {
              try {
                let content = readFileSync(fullPath, 'utf-8');
                let modified = false;

                // 更彻底地移除所有 external 模块导入
                externalModules.forEach(module => {
                  // 移除 side-effect import（带分号）
                  const pattern1 = new RegExp(`import\\s+['"]${module}['"];?\\s*`, 'g');
                  if (pattern1.test(content)) {
                    content = content.replace(pattern1, `/* ${module} polyfill */ `);
                    modified = true;
                  }

                  // 移除 default import
                  const pattern2 = new RegExp(`import\\s+['"]${module}['"].*?;?\\s*`, 'g');
                  if (pattern2.test(content)) {
                    content = content.replace(pattern2, `/* ${module} polyfill */ `);
                    modified = true;
                  }

                  // 移除 named import
                  const pattern3 = new RegExp(`import\\s*\\{[^}]*\\}\\s*from\\s*['"]${module}['"];?\\s*`, 'g');
                  if (pattern3.test(content)) {
                    content = content.replace(pattern3, `/* ${module} polyfill */ `);
                    modified = true;
                  }

                  // 移除 namespace import
                  const pattern4 = new RegExp(`import\\s*\\*\\s*as\\s*\\w+\\s*from\\s*['"]${module}['"];?\\s*`, 'g');
                  if (pattern4.test(content)) {
                    content = content.replace(pattern4, `/* ${module} polyfill */ `);
                    modified = true;
                  }
                });

                if (modified) {
                  writeFileSync(fullPath, content, 'utf-8');
                  console.log(`✅ 清理了 ${fullPath} 中的 external 模块导入`);
                }
              } catch (e) {
                console.error(`处理文件 ${fullPath} 时出错:`, e);
              }
            }
          }
        } catch (e) {
          console.error(`处理目录 ${dir} 时出错:`, e);
        }
      };

      // 等待一小段时间确保所有文件都已写入
      setTimeout(() => {
        if (existsSync('dist')) {
          console.log('🧹 开始清理 dist 目录中的 external 模块导入...');
          cleanDistFiles('dist');
          console.log('✅ 清理完成');
        }
      }, 100);
      /* eslint-enable no-console */
    }
  };
}

// Electron专用Vite配置
export default defineConfig({
  plugins: [vue(), externalModulePolyfillPlugin()],
  base: './',
  publicDir: 'public',
  css: {
    postcss: './postcss.config.cjs'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      // Node.js 内置模块的 polyfill 别名
      'net': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'timers': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'timers/promises': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'fs': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'fs/promises': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'dgram': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'constants': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'crypto': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'stream': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'events': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'util': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'buffer': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'path': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'querystring': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'process': resolve(__dirname, '../src/stubs/net-stub.ts'),
      // 需要单独 stub 的模块
      'child_process': resolve(__dirname, '../src/stubs/child_process-stub.ts'),
      'os': resolve(__dirname, '../src/stubs/os-stub.ts'),
      'tls': resolve(__dirname, '../src/stubs/tls-stub.ts'),
      // 其他可能需要的模块
      'dns': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'zlib': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'url': resolve(__dirname, '../src/stubs/net-stub.ts'),
      'sqlite3': resolve(__dirname, '../src/stubs/net-stub.ts')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, '../index.html')
      },
      external: [
        'electron',
        'electron/main',
        'electron/preload',
        'http',
        'https',
        'worker_threads',
        // 排除网络代理依赖包（这些包在渲染进程中会导致'net'模块解析错误）
        'http-proxy-agent',
        'socks-proxy-agent',
        'https-proxy-agent',
        'global-agent',
        'proxy-from-env',
        // 排除数据库相关依赖包（这些包在渲染进程中会尝试加载Node.js模块）
        'mongodb',
        'mssql',
        'mysql2',
        'mysql2/promise',
        'pg',
        'pg-native',
        'tedious',
        'bson',
        'mongodb-client-encryption',
        'mongodb-connection-string-url',
        'aws-ssl-profiles',
        'native-duplexpair',
        '@tediousjs/connection-string',
        '@tediousjs/connection-pool',
        '@tediousjs/request',
        '@tediousjs/transformers',
        '@tediousjs/types',
        'keytar',
        // 保留util, stream, events, net, os, tls, child_process, fs, timers, path, crypto等作为polyfills使用，不external
      ],
      output: {
        manualChunks: (id) => {
          // 将 node_modules 分离到不同的 chunk
          if (id.includes('node_modules')) {
            // Node.js polyfills (events, util, buffer, etc.)
            if (id.includes('events') || id.includes('stream') || id.includes('util') ||
                id.includes('buffer') || id.includes('path') || id.includes('querystring') ||
                id.includes('timers') || id.includes('process')) {
              return 'polyfills';
            }
            // 编辑器库 - 激进的tree-shaking，只保留核心模块
            if (id.includes('vue-quill') || id.includes('quill') || id.includes('parchment')) {
              // 排除未使用的模块
              if (id.includes('node_modules/quill/formats') ||
                  id.includes('node_modules/quill/modules') ||
                  id.includes('node_modules/quill/themes') ||
                  id.includes('node_modules/parchment/dist')) {
                return null; // 跳过这些大模块
              }
              return 'editor';
            }
            // Vue 核心
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor';
            }
            // Element Plus UI框架
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'element-ui';
            }
            // VueUse 组合式工具
            if (id.includes('@vueuse')) {
              return 'vueuse';
            }
            // 文档处理
            if (id.includes('docx') || id.includes('html-to-text')) {
              return 'document';
            }
            // UUID
            if (id.includes('uuid')) {
              return 'uuid-lib';
            }
            // 时间处理
            if (id.includes('dayjs') || id.includes('ms')) {
              return 'time-utils';
            }
            // 网络请求
            if (id.includes('axios') || id.includes('fetch') || id.includes('abort') || id.includes('agentkeepalive')) {
              return 'network';
            }
            // 文本处理
            if (id.includes('diff-') || id.includes('fast-diff')) {
              return 'text-ops';
            }
            // 工具库
            if (id.includes('lodash') || id.includes('yargs') || id.includes('micromatch') || id.includes('braces')) {
              return 'utils';
            }
            // 其他第三方库
            return 'vendor';
          }
          // 源码中的大型模块
          if (id.includes('src/services') || id.includes('src/components')) {
            return 'app';
          }
          // 其他情况返回 undefined
          return undefined;
        }
      }
    },
    chunkSizeWarningLimit: 500,
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
    },
    include: [
      'timers',
      'timers/promises',
      'net',
      'fs',
      'fs/promises',
      'dgram',
      'constants',
      'child_process',
      'os',
      'tls',
      'dns',
      'zlib',
      'url',
      'sqlite3'
    ]
  },
  define: {
    global: 'window',
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}'
  }
})
