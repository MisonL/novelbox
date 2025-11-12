<div align="center">

# NovelBox - 增强版AI小说创作工具

</div>

> **本项目基于 [Rain-31/novelbox](https://github.com/Rain-31/novelbox) 进行二次开发，在原项目基础上增加了大量新功能和优化**

<p align="center">
  <img src="public/icon.ico" alt="NovelBox Logo" width="120" height="120">
</p>

<p align="center">
  <strong>一款强大的AI辅助小说创作工具 | A powerful AI-assisted novel writing tool</strong>
</p>

<p align="center">
  <a href="#新增功能">新增功能</a> |
  <a href="#中文文档">中文文档</a> |
  <a href="#english-version">English Documentation</a>
</p>

---

## 🚀 新增功能（基于原项目的增强）

### 📊 数据库支持增强
- ✅ **多数据库支持**：新增MongoDB、MySQL、SQL Server、SQLite支持
- ✅ **Web端数据库**：支持浏览器localStorage和多种云端数据库
- ✅ **数据迁移**：支持不同数据库间的数据迁移
- ✅ **MongoDB Atlas**：集成免费层支持，无需本地安装

### 🌐 跨平台部署
- ✅ **Web版本**：新增完整的Web应用支持
- ✅ **Docker部署**：提供Docker容器化部署方案
- ✅ **跨平台**：支持Windows、macOS、Linux桌面应用
- ✅ **响应式设计**：适配不同屏幕尺寸

### 🤖 AI功能扩展
- ✅ **多AI提供商**：新增DeepSeek、MiniMax、Ollama、LM Studio支持
- ✅ **AI片段管理**：支持保存和管理AI生成内容
- ✅ **智能校对**：新增错别字和语法检查功能
- ✅ **书名生成**：智能生成符合内容风格的书名
- ✅ **简介生成**：一键生成吸引读者的作品简介

### 📱 用户体验优化
- ✅ **界面优化**：重新设计UI，提升视觉体验
- ✅ **比例调整**：优化文字与按钮元素比例
- ✅ **设置面板**：新增系统设置和数据库配置
- ✅ **数据导出**：支持DOCX格式导出
- ✅ **实时字数统计**：显示章节实时字数

### 🔧 技术架构升级
- ✅ **TypeScript重构**：全面使用TypeScript提升代码质量
- ✅ **模块化设计**：更好的代码组织和维护性
- ✅ **构建优化**：使用Vite替代Webpack，提升构建速度
- ✅ **依赖管理**：使用pnpm提升依赖管理效率

---

<h2 id="中文文档">中文文档</h2>

## 项目介绍

NovelBox是一款专为小说创作者设计的应用程序，支持桌面端和Web端部署，集成了多种AI模型（OpenAI、Anthropic、Google Gemini、DeepSeek、MiniMax），帮助作家更高效地进行创作。应用提供了直观的章节管理、大纲编辑、AI辅助续写等功能，让创作过程更加流畅和高效。

## 功能特点

- **书库管理**：创建和管理多部小说作品
- **章节树结构**：直观的章节组织和管理
- **富文本编辑器**：支持格式化文本编辑
- **大纲功能**：帮助规划和组织故事情节
- **AI辅助创作**：
  - 智能续写：根据上下文自动生成后续内容
  - 内容扩写/缩写：调整文本篇幅
  - 定向改写：根据指定要求智能改写选中内容
  - 书名生成：智能生成符合内容风格的书名建议
  - 简介生成：一键生成吸引读者的作品简介
- **片段功能**：
  - 快速保存和管理创作片段
  - 方便记录AI生成的多个版本
  - 一键应用片段内容到正文
  - 支持片段比较和选择最佳版本
- **智能校对**：
  - 自动检测错别字和语法错误
  - 智能纠错建议
  - 一键应用修改
- **文档导出**：支持导出为DOCX格式
- **搜索和替换**：快速查找和修改文本内容
- **字数统计**：实时显示章节字数

## 新增功能对比

| 功能类别 | 原项目 | 本项目增强 |
|---------|--------|------------|
| **数据库** | 仅本地文件 | 支持5种数据库 |
| **部署方式** | 仅桌面应用 | 桌面+Web+Docker |
| **AI模型** | 3种 | 5种主流模型 |
| **导出格式** | 无 | 支持DOCX |
| **界面设计** | 基础 | 现代化UI |
| **跨平台** | Windows | Win/Mac/Linux |

## 快速开始

### 桌面应用（推荐新手）

#### 一键安装
1. 从[Releases](https://github.com/MisonL/novelbox/releases)页面下载对应系统的安装包
2. Windows用户下载 `.exe` 安装包
3. macOS用户下载 `.dmg` 安装包
4. Linux用户下载 `.AppImage` 或 `.deb` 安装包

#### 跨平台编译（使用electron-packager）
```bash
# 克隆项目
git clone https://github.com/MisonL/novelbox.git
cd novelbox

# 安装依赖
pnpm install

# 编译Windows版本（无需Wine）
pnpm run electron:build:win

# 编译macOS版本（需在macOS系统上）
pnpm run electron:build:mac

# 编译Linux版本
pnpm run electron:build:linux

# 查看构建结果
ls -la release/
# Windows: release/NovelBox-win32-x64/NovelBox.exe
# Linux: release/NovelBox-linux-x64/NovelBox
# macOS: release/NovelBox-darwin-x64/NovelBox.app
```

### 构建系统特点
- **无需Wine**：使用electron-packager替代electron-builder，无需Wine环境
- **优雅降级**：自动检测系统环境，不支持的平台会跳过构建
- **完整依赖**：自动处理所有Node.js模块依赖
- **一键脚本**：提供交互式构建菜单，支持参数化构建

### Web应用（推荐团队协作）

#### 一键部署
```bash
# 使用Docker快速部署
git clone https://github.com/MisonL/novelbox.git
cd novelbox
./deploy.sh

# 访问 http://localhost:8080
```

#### 手动部署
```bash
# 构建Web版本
pnpm run web:build

# 使用Docker
sudo docker build -t novelbox-web .
sudo docker run -d -p 8080:80 novelbox-web
```

## 系统要求

### 桌面应用
- **Windows**: Windows 10/11 64位
- **macOS**: macOS 10.15+ 
- **Linux**: Ubuntu 18.04+, CentOS 7+

### Web应用
- **浏览器**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Node.js**: 16.0+ (开发环境)
- **Docker**: 20.10+ (容器部署)

## 数据库配置

### 1. 本地存储（默认）
无需配置，开箱即用，适合个人使用。

### 2. MongoDB Atlas（推荐云端）
```bash
# 免费注册MongoDB Atlas
连接字符串: mongodb+srv://username:password@cluster.mongodb.net/novelbox
```

### 3. MySQL
```bash
# 本地MySQL配置
主机: localhost:3306
数据库: novelbox
用户: root
密码: your_password
```

### 4. 其他数据库
支持SQL Server、SQLite，配置方式类似。

## 开发指南

### 环境准备
```bash
# 安装Node.js和pnpm
npm install -g pnpm

# 克隆项目
git clone https://github.com/MisonL/novelbox.git
cd novelbox

# 安装依赖
pnpm install
```

### 开发模式
```bash
# 桌面应用开发
pnpm run electron:dev

# Web应用开发
pnpm run web:dev
```

### 构建命令
```bash
# 构建所有平台
pnpm run build:all

# 仅构建Windows
pnpm run build:win

# 仅构建macOS
pnpm run build:mac

# 仅构建Linux
pnpm run build:linux

# 构建Web版本
pnpm run web:build
```

## 技术架构

### 核心技术栈
- **前端**: Vue 3 + TypeScript + Element Plus
- **桌面**: Electron + Node.js
- **构建**: Vite + Electron Builder
- **数据库**: 支持5种数据库类型
- **AI**: 集成5大主流AI平台

### 项目结构
```
novelbox/
├── electron/          # Electron主进程
├── src/              # 前端源码
├── config/           # 配置文件
├── docker/           # Docker配置
├── scripts/          # 构建脚本
├── docs/             # 文档
└── public/           # 静态资源
```

## 贡献指南

我们欢迎各种形式的贡献！

1. **Fork** 本项目
2. **创建分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启Pull Request**

## 许可证

本项目基于原项目 [Rain-31/novelbox](https://github.com/Rain-31/novelbox) 的GPL-3.0许可证进行开源，并在此基础上进行了大量功能增强。