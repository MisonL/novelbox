// Asar 打包配置
export default {
  // 排除不需要打包的文件
  unpack: [
    '**/*.node',
    '**/node_modules/sqlite3/**/*',
    '**/node_modules/mysql2/**/*',
    '**/node_modules/mongodb/**/*',
    '**/node_modules/mssql/**/*',
    '**/node_modules/ssh2/**/*',
    '**/node_modules/bcrypt/**/*',
    '**/node_modules/ed25519/**/*'
  ],
  // 智能压缩选项
  compression: {
    enabled: true,
    level: 6,
    threshold: 1024
  },
  // 文件排序优化
  ordering: [
    'electron/main.js',
    'electron/preload.js',
    'dist/**',
    'node_modules/vue/**',
    'node_modules/element-plus/**',
    'node_modules/quill/**',
    'node_modules/@vueup/**',
    '**/*.js',
    '**/*.css',
    '**/*.json',
    '**/*'
  ]
};