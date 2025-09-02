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

// 复制文件
function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } else {
    console.warn(`Source file not found: ${src}`);
  }
}

// 主函数
function main() {
  const rootDir = path.resolve(__dirname, '..');
  const electronDir = path.join(rootDir, 'dist', 'electron');
  
  // 创建electron目录
  createDir(electronDir);
  
  // 复制electron文件
  const mainSrc = path.join(rootDir, 'electron', 'main.ts');
  const mainDest = path.join(electronDir, 'main.ts');
  copyFile(mainSrc, mainDest);
  
  const preloadSrc = path.join(rootDir, 'electron', 'preload.ts');
  const preloadDest = path.join(electronDir, 'preload.ts');
  copyFile(preloadSrc, preloadDest);
  
  console.log('Electron files copied successfully');
}

main();