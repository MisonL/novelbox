#!/usr/bin/env node

// 修复 ASAR 文件中的 external 模块导入问题
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const asar = require('asar');

const ASAR_PATH = 'release/mac/NovelBox.app/Contents/Resources/app.asar';
const TEMP_DIR = 'release/mac/NovelBox.app/Contents/Resources/app-temp';

const externalModules = [
  'aws-ssl-profiles',
  'mongodb',
  'mssql',
  'mysql2',
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

try {
  console.log('🧹 开始修复 ASAR 文件...');

  // 1. 解压 ASAR
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  console.log('📦 解压 ASAR 文件...');
  asar.extractAll(ASAR_PATH, TEMP_DIR);

  // 2. 清理 JS 文件
  const assetsDir = path.join(TEMP_DIR, 'dist', 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    let cleaned = 0;

    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(assetsDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        externalModules.forEach(module => {
          // 移除 side-effect import
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
          fs.writeFileSync(filePath, content, 'utf-8');
          cleaned++;
          console.log(`✅ 清理了: ${file}`);
        }
      }
    }

    console.log(`📊 总共清理了 ${cleaned} 个文件`);
  }

  // 3. 重新打包 ASAR
  console.log('📦 重新打包 ASAR 文件...');
  asar.createPackage(TEMP_DIR, ASAR_PATH);

  // 4. 清理临时目录
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  console.log('✅ ASAR 文件修复完成！');

  // 验证
  const result = execSync(`grep -r "import\\"aws-ssl-profiles\\"" "${path.join(path.dirname(ASAR_PATH), 'app-temp', 'dist', 'assets')}" 2>/dev/null || echo "0"`, { encoding: 'utf-8' }).trim();
  const count = parseInt(result) || 0;

  if (count === 0) {
    console.log('🎉 验证成功：没有发现任何 aws-ssl-profiles 导入！');
  } else {
    console.log(`⚠️  警告：还有 ${count} 个文件包含 aws-ssl-profiles 导入`);
  }

} catch (error) {
  console.error('❌ 修复 ASAR 文件时出错:', error.message);
  process.exit(1);
}
