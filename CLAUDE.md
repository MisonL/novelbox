# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作提供指导说明。

## 项目概述

NovelBox 是一个基于 Vue 3 + TypeScript + Electron 的 AI 辅助小说创作工具，支持桌面端和 Web 端部署。项目基于原 [Rain-31/novelbox](https://github.com/Rain-31/novelbox) 进行了大量增强，新增了多数据库支持、Web 部署、额外 AI 模型等功能。

## 技术栈

- **前端框架**: Vue 3 + TypeScript + Vite
- **UI 组件库**: Element Plus
- **富文本编辑器**: Quill + @vueup/vue-quill
- **桌面应用**: Electron 38+
- **样式**: Tailwind CSS + PostCSS
- **构建工具**: Vite 7+
- **包管理器**: pnpm
- **测试**: Vitest + Vue Test Utils
- **代码规范**: ESLint 9+

## 架构特点

### 双入口设计
- **桌面端**: `main.ts` (Vue) + `electron/main.cjs` (Electron主进程)
- **Web端**: `main.web.ts` (Vue) + Vite 构建
- Electron使用 `.cjs` 扩展名是因为 Electron 主进程需要 CommonJS 格式

### 双重构建配置
- **Electron构建**: `vite.config.electron.mts` - 包含 Node.js polyfill 和 external 模块处理
- **Web构建**: `config/vite.config.web.ts` - 外部化所有 Node.js 依赖，分离为独立 chunk

## 常用命令

### 开发命令
```bash
# 桌面应用开发模式
pnpm run dev

# 桌面应用（Electron）开发
pnpm run electron:dev

# Web 应用开发
pnpm run web:dev
```

### 构建命令
```bash
# 构建前端（用于Electron）
pnpm run build

# 构建Electron应用
pnpm run electron:build           # 当前平台
pnpm run electron:build:win       # Windows (x64)
pnpm run electron:build:win-arm64 # Windows (arm64)
pnpm run electron:build:mac       # macOS (x64, 需在macOS系统)
pnpm run electron:build:mac-arm64 # macOS (Apple Silicon, 需在macOS系统)
pnpm run electron:build:linux     # Linux (x64)
pnpm run electron:build:linux-arm64 # Linux (arm64)
pnpm run electron:build:linux-arm # Linux (armv7l)
pnpm run electron:release         # 构建并标记发布（不发布到商店）

# 构建 Web 应用
pnpm run web:build
pnpm run web:preview
```

### 代码质量
```bash
# 类型检查
pnpm run type-check

# 代码检查
pnpm run lint

# 自动修复
pnpm run lint:fix
```

### 测试命令
```bash
# 单元测试
pnpm run test:unit

# 监听模式
pnpm run test:watch

# 覆盖率测试
pnpm run test:coverage
```

### 清理和工具
```bash
# 清理构建文件
pnpm run clean

# Spec-Kit 开发工具（规范驱动开发）
pnpm run spec:check     # 检查项目规范
pnpm run spec:validate  # 验证项目规范
pnpm run spec:test      # 运行规范测试
```

### 构建脚本（推荐）
```bash
# 交互式构建菜单
./build.sh

# 一键快速构建
./build-quick.sh

# Docker部署脚本
./deploy.sh web:dev     # Web开发环境
./deploy.sh web:build   # Web生产构建
```

## 项目结构

```
novelbox/
├── electron/              # Electron 主进程代码（CommonJS格式）
│   ├── main.cjs           # 主进程入口，处理窗口管理、文件操作
│   └── preload.cjs        # 预加载脚本（安全通信）
├── src/                   # 前端源码
│   ├── components/        # Vue 组件
│   │   ├── TextEditor.vue
│   │   ├── ChapterTree.vue
│   │   ├── OutlinePanel.vue
│   │   ├── FragmentPane.vue
│   │   ├── AIConfigModal.vue
│   │   └── ...
│   ├── views/             # 页面视图
│   │   ├── BookLibrary.vue     # 书库管理
│   │   ├── NovelEditor.vue     # 小说编辑器
│   │   ├── FragmentEditor.vue  # 片段编辑器
│   │   ├── Settings.vue        # 设置页面
│   │   └── About.vue           # 关于页面
│   ├── services/          # 业务逻辑服务
│   │   ├── aiService.ts              # AI 服务
│   │   ├── databaseService.ts        # 数据库抽象层
│   │   ├── databaseServiceFactory.ts # 数据库工厂
│   │   ├── databaseMigrationService.ts # 数据迁移
│   │   ├── mongodbService.ts         # MongoDB 实现
│   │   ├── mysqlService.ts           # MySQL 实现
│   │   ├── sqlserverService.ts       # SQL Server 实现
│   │   ├── sqliteService.ts          # SQLite 实现
│   │   ├── localDatabaseService.ts   # 本地存储实现
│   │   ├── documentService.ts        # 文档服务
│   │   └── webFileService.ts         # Web文件服务
│   ├── controllers/       # 控制器
│   │   ├── AIChapterGenerateController.ts
│   │   ├── AITextContinueController.ts
│   │   └── FloatingToolbarController.ts
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── stubs/             # Node.js 模块存根（polyfill）
│   ├── constants.ts       # 常量定义
│   ├── main.ts            # 桌面应用入口
│   ├── main.web.ts        # Web 应用入口
│   └── macOS-fix.ts       # macOS 特定样式修复
├── config/                # 配置文件
│   ├── vite.config.web.ts # Web构建配置
│   ├── postcss.config.cjs # Electron PostCSS配置
│   └── ...
├── docker/                # Docker 配置
├── public/                # 静态资源
├── scripts/               # 构建脚本和工具
│   ├── spec-kit.cjs       # Spec-Kit规范工具
│   ├── clean.cjs          # 清理脚本
│   └── fix-asar.cjs       # ASAR修复工具
├── build.sh               # 主构建脚本（交互式）
├── build-quick.sh         # 快速构建脚本
└── deploy.sh              # Web部署脚本
```

## 核心架构

### 双端架构
项目支持桌面端和 Web 端，采用统一的代码库：
- **桌面端**: 使用 `main.ts` 作为入口，通过 Electron 主进程提供原生功能
- **Web 端**: 使用 `main.web.ts` 作为入口，通过 Vite 构建
- **文件扩展名**: Electron 主进程使用 `.cjs` 以支持 CommonJS 模块

### 数据库抽象层
项目实现了完整的数据库抽象层，支持多种数据库：
- **抽象接口**: `databaseService.ts` 定义统一接口
- **工厂模式**: `databaseServiceFactory.ts` 根据配置创建对应服务
- **数据迁移**: `databaseMigrationService.ts` 支持数据库间迁移
- **具体实现**:
  - MongoDB (`mongodbService.ts`) - 支持 Atlas 云服务
  - MySQL (`mysqlService.ts`)
  - SQL Server (`sqlserverService.ts`)
  - SQLite (`sqliteService.ts`)
  - 本地存储 (`localDatabaseService.ts`) - 浏览器 localStorage
- **Web 端限制**: 桌面端支持所有数据库，Web 端仅支持本地存储

### AI 服务架构
AI 服务通过 `aiService.ts` 统一管理，支持多个 AI 提供商：
- OpenAI
- Anthropic Claude
- Google Gemini
- DeepSeek
- MiniMax
- Ollama
- LM Studio

配置通过 `aiConfigService.ts` 管理，类型定义在 `types/ai-config.ts`。

### 构建系统优化

#### Electron 构建配置 (`vite.config.electron.mts`)
- **External 模块处理**: 自动将数据库驱动等 Node.js 模块外部化
- **Node.js Polyfill**: 通过 `src/stubs/` 提供 polyfill
- **代码分割**: 分离为多个 chunk（vue-vendor, element-ui, editor, ai-vendor 等）
- **构建后清理**: 自动清理 external 模块导入，防止运行错误

#### Web 构建配置 (`config/vite.config.web.ts`)
- **完全外部化**: 所有 Node.js 模块（mongodb, mysql2, mssql, sqlite3）被外部化
- **浏览器优化**: 分离为 vue-vendor, element-plus, editor, docx 等独立 chunk
- **Tree-shaking**: 激进地移除未使用的编辑器模块

#### Node.js 存根系统 (`src/stubs/`)
- `net-stub.ts` - 网络模块存根
- `child_process-stub.ts` - 子进程存根
- `os-stub.ts` - 操作系统存根
- `tls-stub.ts` - TLS 存根
- 为 Web 端和 Electron 渲染进程提供空实现

### 窗口管理（Electron）
- 主窗口: `electron/main.cjs` 管理窗口生命周期
- 片段窗口: 支持无边框透明窗口，实时内容更新
- 焦点管理: 自动跟踪所有窗口焦点状态，应用失去焦点时隐藏片段窗口
- IPC 通信: 通过 `ipcMain` 和 `preload.cjs` 处理安全通信
- `@electron/remote` 支持远程窗口控制

### Spec-Kit 规范工具
基于 GitHub Spec-Kit 的规范驱动开发工具：
- 初始化: `pnpm run spec:kit init` 创建 GitHub 模板和 VSCode 配置
- 验证: `pnpm run spec:validate` 检查项目结构和代码质量
- 测试: `pnpm run spec:test` 运行规范验证测试
- 创建 `.github/` 目录，包含 PR 模板、Issue 模板和 CI 工作流

## 关键实现细节

### 构建系统
- **Vite 配置文件**:
  - Electron: `vite.config.electron.mts` - 包含 Node.js polyfill 和 external 模块处理
  - Web: `config/vite.config.web.ts` - 完全外部化 Node.js 模块
- **Electron-packager**: 使用 `@electron/packager` 而非 electron-builder 进行跨平台打包
- **模块分离**:
  - Electron: polyfills, vue-vendor, element-ui, editor, vendor, app
  - Web: vue-vendor, element-plus, editor, utils, docx
- **External 模块处理**: 自动将数据库驱动、网络代理模块外部化，构建后清理导入语句
- **ASAR 打包**: 默认启用 ASAR 压缩 `.asar` 文件

### 样式系统
- **Tailwind CSS**: 使用 PostCSS 处理，支持暗黑模式
- **Element Plus**: 作为主要 UI 组件库
- **macOS 修复**: `src/macOS-fix.ts` 处理 macOS 特定样式问题和滚动条样式
- **响应式设计**: 支持不同屏幕尺寸适配

### 路由系统
- 使用 Vue Router + Hash 模式（避免服务端配置）
- 路由配置: `src/main.ts:24-49`
  - `/`: 书库页面
  - `/novel-editor/:id?`: 小说编辑器（可选ID）
  - `/fragment-editor`: 片段编辑器
- **预加载策略**: 自动预加载常用组件提升性能
- **data-route 属性**: HTML 元素包含当前路由信息用于样式

### Electron 安全模型
- **上下文隔离**: 启用 `contextIsolation: true`
- **Node 集成**: 渲染进程禁用 Node.js (`nodeIntegration: false`)
- **预加载脚本**: 通过 `preload.cjs` 安全暴露 API
- **CSP 头**: 配置内容安全策略防止 XSS
- **远程模块**: 使用 `@electron/remote` 远程窗口控制

### 文档处理
- **DOCX 导出**: 通过 `docx` 库生成 Word 文档
- **HTML 转换**: `html-to-text` 处理富文本内容
- **Quill 编辑器**: 基于 Quill 的富文本编辑器，支持格式化
- **增量更新**: `diff-match-patch` 或 `fast-diff` 实现文本差异对比

## 开发注意事项

### 依赖管理
- 使用 pnpm 管理依赖，已配置 `pnpm.overrides` 锁定版本
- 某些构建依赖被标记为 `ignoredBuiltDependencies`（electron, electron-winstaller, fs-xattr, macos-alias）
- 注意区分 `dependencies` 和 `devDependencies`，数据库驱动在生产环境中也需要

### 跨平台开发
- **桌面应用**: 支持 Windows/macOS/Linux，多种架构（x64, arm64, armv7l）
- **macOS 构建**: 必须在 macOS 系统上进行，使用 `@electron/packager`
- **Windows 构建**: 无需 Wine，可直接在 Linux/macOS 交叉编译
- **测试**: 可在不同平台上运行构建的应用进行测试

### Web 端限制
- **数据库限制**: 数据库服务在 Web 端不可用（mongodb, mysql2, mssql, sqlite3 已被 external 化）
- **Node.js API**: 不能使用 Node.js API，所有 Node.js 模块被外部化
- **替代方案**: Web 端仅支持 localStorage 或远程 API
- **查看配置**: `config/vite.config.web.ts:35-62` 了解 external 模块列表

### Electron 开发注意事项
- **主进程**: 使用 `.cjs` 扩展名（CommonJS 格式）
- **渲染进程**: 使用 ES Modules（.ts/.js）
- **预加载脚本**: `.cjs` 格式，作为安全桥梁
- **IPC 通信**: 必须通过预加载脚本传递，避免直接访问 Node.js
- **CSP 配置**: `electron/main.cjs:194-201` 配置内容安全策略

### 构建优化
- **代码分割**: Electron 构建会自动分离 vendor chunks，提升加载速度
- **External 清理**: 构建后会清理 external 模块导入，防止运行时错误
- **Polyfill**: 通过 `src/stubs/` 提供空实现，兼容浏览器环境
- **Tree-shaking**: Web 构建激进地移除未使用的 Quill 模块

### 测试注意事项
- **Vitest 配置**: `vitest.config.ts` 使用 jsdom 环境
- **覆盖率**: 使用 `@vitest/coverage-v8` 进行覆盖率统计
- **测试文件**: 以 `.test.ts` 或 `.spec.ts` 结尾，放在源码目录
- **示例测试**: `src/services/localDatabaseService.test.ts`

## 测试策略
- **测试框架**: Vitest + Vue Test Utils + jsdom
- **单元测试**: 文件以 `.test.ts` 或 `.spec.ts` 结尾，放在源码目录
- **覆盖率**: 使用 `@vitest/coverage-v8` 进行覆盖率统计
- **示例测试**: `src/services/localDatabaseService.test.ts`、`src/services/aiService.test.ts`
- **运行测试**:
  ```bash
  pnpm run test:unit     # 运行所有测试
  pnpm run test:watch    # 监听模式
  pnpm run test:coverage # 生成覆盖率报告
  ```

## 部署方式

### 桌面应用
```bash
# 使用交互式脚本（推荐）
./build.sh              # 选择目标平台
./build-quick.sh        # 快速构建当前平台

# 或使用 npm scripts
pnpm run electron:build:win       # Windows (x64)
pnpm run electron:build:mac       # macOS (x64, 需macOS)
pnpm run electron:build:linux     # Linux (x64)
pnpm run electron:build:mac-arm64 # Apple Silicon (需macOS)

# 构建结果在 release/ 目录
ls -la release/
```

### Web 应用
```bash
# 手动构建
pnpm run web:build
pnpm run web:preview    # 预览构建结果

# Docker 部署
./deploy.sh web:dev     # 开发环境（端口5173）
./deploy.sh web:build   # 生产构建并启动
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up

# 访问
open http://localhost:8080
```

## 配置文件参考

### Electron 构建配置
- **打包工具**: `@electron/packager`（非 electron-builder）
- **配置位置**: `package.json:153-225` 的 `build` 字段
- **架构支持**: x64, arm64, armv7l
- **输出格式**: 目录形式（而非安装包）
- **ASAR**: 默认启用 ASAR 压缩

### TypeScript 配置
- **根目录**: `tsconfig.json` - Vue + Vite 项目配置
- **Electron**: `config/tsconfig.electron.json` - Electron 专用配置
- **Node**: `config/tsconfig.node.json` - Node.js 环境配置
- **Vite**: `vite.config.electron.mts` 和 `config/vite.config.web.ts`

### PostCSS 配置
- **Electron**: `config/postcss.config.cjs` - Tailwind CSS + Autoprefixer
- **Web**: `config/postcss.web.config.cjs` - Web 专用配置

## 常用开发工作流

### 1. 日常开发
```bash
# 启动前端开发服务器
pnpm run dev          # Vue 开发服务器 (端口5173)
pnpm run web:dev      # Web 开发服务器

# 启动 Electron 开发（先构建前端）
pnpm run electron:dev # 启动 Electron 开发模式

# 或使用构建脚本
./build.sh dev        # 交互式选择开发模式
```

### 2. 添加新功能
```bash
# 1. 创建分支
git checkout -b feature/new-feature

# 2. 编写代码和测试
# ... 开发中 ...

# 3. 运行检查
pnpm run type-check
pnpm run lint
pnpm run lint:fix      # 自动修复
pnpm run test:unit     # 运行测试

# 4. 构建测试
./build-quick.sh
# 或
pnpm run electron:build

# 5. 提交
git add .
git commit -m "feat: add new feature"
```

### 3. 构建发布
```bash
# 构建所有平台
./build.sh            # 交互式选择
./build.sh electron:build-all

# 或构建特定平台
pnpm run electron:build:win
pnpm run electron:build:mac
pnpm run electron:build:linux

# 构建并标记版本
pnpm run electron:release

# 检查构建结果
ls -lah release/
```

### 4. Web 部署
```bash
# 开发环境
./deploy.sh web:dev
open http://localhost:5173

# 生产环境
./deploy.sh web:build
docker-compose up -d
open http://localhost:5173

# 清理
./deploy.sh stop
./deploy.sh clean
```

### 5. 使用 Spec-Kit
```bash
# 初始化规范环境
node scripts/spec-kit.cjs init

# 验证项目规范
pnpm run spec:validate

# 运行规范测试
pnpm run spec:test
```
