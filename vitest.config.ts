import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // 避免 Node.js 兼容性问题
    env: {
      NODE_OPTIONS: '--no-experimental-fetch',
    },
    // 忽略未处理的错误警告
    onConsoleLog: (log) => {
      if (log.includes('webidl-conversions') || log.includes('whatwg-url')) {
        return false
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // 忽略问题模块
      exclude: [
        'node_modules/**',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})