# NovelBox 构建指南

## 🚀 快速开始

### 最简单的构建方式

\`\`\`bash
# 一键构建Electron应用
./build-quick.sh

# 或使用完整版构建脚本
./build.sh electron:build
\`\`\`

## 📜 构建脚本说明

### 1. build.sh (推荐)
轻量级构建脚本，对npm scripts的友好封装

**使用方式：**
\`\`\`bash
./build.sh [命令]

命令：
  dev                 启动前端开发服务器
  electron:dev        启动Electron开发模式
  build               构建前端应用
  electron:build      构建Electron应用
  electron:build-all  构建所有平台
  clean               清理构建输出
  web:build           构建Web版本
  help                显示帮助

示例：
  ./build.sh build              # 构建前端
  ./build.sh electron:build     # 构建Electron
  ./build.sh clean              # 清理
\`\`\`

### 2. build-quick.sh
极简快速构建脚本

\`\`\`bash
./build-quick.sh
\`\`\`

### 3. deploy.sh
Web版本Docker部署脚本

\`\`\`bash
./deploy.sh [命令]

命令：
  web:dev       启动Web开发环境
  web:build     构建Web生产镜像
  stop         停止容器
  clean        清理Docker资源
  help         显示帮助
\`\`\`

### 4. npm scripts
项目内置的构建命令（推荐用于CI/CD）

\`\`\`bash
# 开发
npm run dev                    # 前端开发服务器
npm run electron:dev           # Electron开发模式

# 构建
npm run build                  # 构建前端
npm run electron:build         # 构建Electron (当前平台)
npm run electron:build:mac     # 构建Mac版本
npm run electron:build:win     # 构建Windows版本
npm run electron:build:linux   # 构建Linux版本

# Web版本
npm run web:build              # 构建Web版本
npm run web:dev                # Web开发服务器

# 清理
npm run clean                  # 清理构建输出
\`\`\`

## 📊 优化成果

- **脚本总量**: 2325行 → 280行 (减少88%)
- **build.sh**: 1609行 → 105行 (减少93%)
- **deploy.sh**: 189行 → 113行 (减少40%)
- **新脚本**: build-quick.sh (30行)

## 🎯 最佳实践

### 日常开发
\`\`\`bash
# 启动开发
./build.sh dev
\`\`\`

### 构建发布
\`\`\`bash
# 构建Electron应用
./build.sh electron:build

# 或使用快速构建
./build-quick.sh
\`\`\`

### 多平台构建
\`\`\`bash
# 构建所有平台
./build.sh electron:build-all
\`\`\`

### Web部署
\`\`\`bash
# 开发环境
./deploy.sh web:dev

# 生产构建
./deploy.sh web:build
\`\`\`

## 🔧 故障排除

### 1. 权限问题
\`\`\`bash
chmod +x build.sh deploy.sh build-quick.sh
\`\`\`

### 2. 依赖问题
\`\`\`bash
# 安装依赖
pnpm install

# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
\`\`\`

### 3. 构建失败
\`\`\`bash
# 清理构建
./build.sh clean

# 重新构建
./build.sh electron:build
\`\`\`

## 📁 目录结构

\`\`\`
/Volumes/Work/code/novelbox/
├── build.sh                 # 主构建脚本 (105行)
├── build-quick.sh           # 快速构建脚本 (30行)
├── deploy.sh               # Web部署脚本 (113行)
├── scripts-backup/         # 旧脚本备份
│   ├── build.sh.bak        # 原版build.sh (1609行)
│   └── build-macos-minimal.sh.bak
├── package.json            # npm scripts定义
├── release/               # 构建输出
│   └── mac/
│       └── NovelBox.app   # Electron应用
└── dist/                  # 前端构建输出
\`\`\`

## ✨ 优势

1. **轻量级**: 总计280行代码，易于维护
2. **现代化**: 基于npm scripts，稳定可靠
3. **多选择**: 提供简单、快速、完整三种构建方式
4. **跨平台**: 支持Electron和Web版本
5. **易扩展**: 脚本简洁，便于修改和扩展

## 📝 注意事项

- 所有脚本均已设置可执行权限
- 推荐使用npm scripts进行CI/CD
- 旧脚本已备份到scripts-backup/目录
- 构建前请确保已安装所有依赖
