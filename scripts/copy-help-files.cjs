#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取平台特定的命令
function getPlatformCommand() {
  const platform = process.platform;
  
  if (platform === 'win32') {
    return {
      mkdir: 'mkdir',
      mkdirFlag: '-p',
      copy: 'copy',
      copyFlag: '',
      delete: 'del',
      deleteFlag: '/Q'
    };
  } else {
    return {
      mkdir: 'mkdir',
      mkdirFlag: '-p',
      copy: 'cp',
      copyFlag: '-r',
      delete: 'rm',
      deleteFlag: '-rf'
    };
  }
}

const cmd = getPlatformCommand();

// 创建目录
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// 复制目录
function copyDir(src, dest) {
  if (fs.existsSync(src)) {
    // 递归复制目录
    const files = fs.readdirSync(src);
    
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        createDir(destPath);
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    });
  } else {
    console.warn(`Source directory not found: ${src}`);
  }
}

// 主函数
function main() {
  const rootDir = path.resolve(__dirname, '..');
  const helpDir = path.join(rootDir, 'dist', 'help');
  const helpSrc = path.join(rootDir, 'public', 'help');
  
  // 创建help目录
  createDir(helpDir);
  
  // 复制help文件
  copyDir(helpSrc, helpDir);
  
  console.log('Help files copied successfully');
}

main();