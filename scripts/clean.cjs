#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 删除目录
function deleteDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Deleted directory: ${dirPath}`);
  }
}

// 删除文件
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  }
}

// 主函数
function main() {
  const rootDir = path.resolve(__dirname, '..');
  
  // 删除dist目录
  const distDir = path.join(rootDir, 'dist');
  deleteDir(distDir);
  
  // 删除release目录
  const releaseDir = path.join(rootDir, 'release');
  deleteDir(releaseDir);
  
  // 删除node_modules/.cache
  const cacheDir = path.join(rootDir, 'node_modules', '.cache');
  deleteDir(cacheDir);
  
  console.log('Clean completed successfully');
}

main();