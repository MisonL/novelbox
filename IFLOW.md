# NovelBox 项目概述

## 项目简介

NovelBox 是一款专为小说创作者设计的应用程序，支持桌面端和Web端部署，集成了多种AI模型（OpenAI、Anthropic、Google Gemini、DeepSeek、MiniMax），帮助作家更高效地进行创作。应用提供了直观的章节管理、大纲编辑、AI辅助续写等功能，让创作过程更加流畅和高效。

项目采用双端架构设计：
- **桌面端**：基于Electron构建，提供完整的本地文件系统访问和原生应用体验
- **Web端**：基于Vue.js构建，支持Docker容器化部署，提供跨平台访问能力

## 技术栈

### 共享技术栈
- **前端框架**: Vue 3 + TypeScript
- **UI组件**: Element Plus
- **富文本编辑**: QuillJS
- **构建工具**: Vite
- **文档处理**: docx.js
- **AI集成**: OpenAI API, Anthropic API, Google Generative AI, DeepSeek, MiniMax

### 桌面端专用
- **桌面应用框架**: Electron
- **文件系统操作**: Node.js fs模块
- **本地存储**: 文件系统 + localStorage
- **进程间通信**: IPC (主进程与渲染进程)

### Web端专用
- **Web服务器**: Nginx
- **容器化**: Docker, Docker Compose
- **数据存储**: localStorage (浏览器端)
- **文件操作**: 浏览器下载/上传API
- **部署脚本**: deploy.sh (自动化部署)

## 项目结构（优化后）

```
/home/mison/novelbox/
├── 📁 项目根目录
│   ├── 📄 核心配置
│   │   ├── package.json              # 项目配置和依赖
│   │   ├── tsconfig.json             # TypeScript 配置
│   │   ├── LICENSE                   # 许可证文件
│   │   ├── README.md                 # 项目说明文档
│   │   └── IFLOW.md                  # iFlow项目上下文
│   │
│   ├── 📁 构建系统
│   │   ├── build.sh                  # 交互式跨平台构建脚本
│   │   ├── deploy.sh                 # Docker部署脚本
│   │   ├── docker-build-local.sh     # 本地Docker构建
│   │   ├── vite.config.ts            # Electron版本Vite配置
│   │   ├── vite.config.electron.ts   # Electron专用Vite配置
│   │   ├── index.html                # Electron版本HTML模板
│   │   └── index.web.html            # Web版本HTML模板
│   │
│   ├── 📁 Docker配置
│   │   ├── Dockerfile                # 生产环境Docker配置
│   │   ├── Dockerfile.dev            # 开发环境Docker配置
│   │   ├── docker-compose.yml        # Docker Compose配置
│   │   ├── nginx.conf                # Nginx服务器配置
│   │   ├── .env.web                  # Web生产环境变量
│   │   └── .env.development.web      # Web开发环境变量
│   │
│   ├── 📁 Electron主进程
│   │   ├── main.ts                   # 主进程入口文件
│   │   ├── preload.ts                # 预加载脚本
│   │   ├── main.d.ts                 # 主进程类型定义
│   │   ├── preload.d.ts              # 预加载脚本类型定义
│   │   ├── main.js                   # 编译后的主进程
│   │   └── preload.js                # 编译后的预加载脚本
│   │
│   ├── 📁 源代码
│   │   ├── 📁 组件层
│   │   │   ├── components/           # Vue 组件
│   │   │   └── views/                # 页面视图
│   │   │
│   │   ├── 📁 业务逻辑层
│   │   │   ├── controllers/          # 控制器
│   │   │   └── services/             # 服务层
│   │   │       ├── aiService.ts              # AI服务集成
│   │   │       ├── bookConfigService.ts      # 书籍配置管理
│   │   │       ├── workspaceservice.ts       # 工作区管理
│   │   │       ├── webFileService.ts         # Web环境文件服务
│   │   │       ├── webFragmentService.ts     # Web环境片段服务
│   │   │       ├── databaseService.ts        # 数据库服务
│   │   │       ├── databaseServiceFactory.ts # 数据库工厂
│   │   │       ├── localDatabaseService.ts   # 本地数据库
│   │   │       ├── mongodbService.ts         # MongoDB服务
│   │   │       ├── mysqlService.ts           # MySQL服务
│   │   │       ├── sqliteService.ts          # SQLite服务
│   │   │       └── sqlserverService.ts       # SQL Server服务
│   │   │
│   │   ├── 📁 工具类
│   │   │   ├── errors/               # 错误处理
│   │   │   ├── stubs/                # 数据库驱动stub
│   │   │   └── constants.ts          # 常量定义
│   │   │
│   │   ├── 📁 入口文件
│   │   │   ├── App.vue               # 根组件
│   │   │   ├── main.ts               # Electron前端入口
│   │   │   ├── main.web.ts           # Web前端入口
│   │   │   ├── style.css             # 全局样式
│   │   │   └── vite-env.d.ts         # Vite环境类型声明
│   │   │
│   │   └── 📁 静态资源
│   │       └── assets/               # 静态资源文件
│   │
│   ├── 📁 构建脚本
│   │   ├── scripts/
│   │   │   ├── clean.cjs                 # 清理脚本
│   │   │   ├── copy-electron-files.cjs   # Electron文件复制
│   │   │   └── copy-help-files.cjs       # 帮助文件复制
│   │   │
│   │   └── 📁 配置
│   │       ├── config/
│   │       │   ├── electron-dev.cjs      # Electron开发配置
│   │       │   ├── postcss.config.cjs    # PostCSS配置
│   │       │   ├── tailwind.config.cjs   # Tailwind配置
│   │       │   ├── tsconfig.electron.json # Electron TS配置
│   │       │   └── tsconfig.node.json    # Node.js TS配置
│   │
│   ├── 📁 静态资源
│   │   ├── public/                   # 静态资源
│   │   │   ├── icon.ico              # 应用图标
│   │   │   ├── icon-256.png          # 256x256图标
│   │   │   ├── icon-512.png          # 512x512图标
│   │   │   └── help/                 # 帮助文档
│   │   │       ├── help.html         # 帮助页面
│   │   │       └── *.png             # 帮助图片
│   │   │
│   │   └── docs/                     # 项目文档
│   │       ├── CROSS_PLATFORM_BUILD.md   # 跨平台构建指南
│   │       ├── editor_screen.png         # 编辑器截图
│   │       └── main_screen.png           # 主界面截图
│   │
│   ├── 📁 构建输出
│   │   ├── dist/                     # Web构建输出
│   │   ├── dist-web/                 # Web版本构建输出
│   │   ├── release/                  # 桌面应用构建输出
│   │   │   ├── NovelBox-win32-x64/   # Windows版本
│   │   │   ├── NovelBox-linux-x64/   # Linux版本
│   │   │   └── NovelBox-darwin-x64/  # macOS版本
│   │   │
│   │   └── release/                  # 旧版构建输出（兼容）
│   │       ├── linux-unpacked/       # Linux解压版本
│   │       ├── win-unpacked/         # Windows解压版本
│   │       └── *.AppImage            # Linux安装包
│   │
│   └── 📁 开发工具
│       ├── .gitignore                # Git忽略规则
│       ├── .dockerignore             # Docker忽略规则
│       ├── .env.development.web      # 开发环境变量
│       └── .env.web                  # 生产环境变量
```

## 构建系统（新增）

### 跨平台构建系统
- **构建工具**: electron-packager（替代electron-builder）
- **优势**: 无需Wine环境，支持所有平台交叉编译
- **输出**: 原生可执行文件，无安装包依赖

### 构建命令
```bash
# 交互式构建菜单
./build.sh

# 分平台构建
pnpm run electron:build:win    # Windows (186MB)
pnpm run electron:build:mac    # macOS (需在macOS系统)
pnpm run electron:build:linux  # Linux (185MB)

# Web构建
pnpm run web:build             # Web版本
pnpm run web:docker:prod       # Docker生产环境
```

### 构建输出
- **Windows**: `release/NovelBox-win32-x64/NovelBox.exe`
- **Linux**: `release/NovelBox-linux-x64/NovelBox`
- **macOS**: `release/NovelBox-darwin-x64/NovelBox.app`

## 技术架构升级

### 构建系统升级
- **原方案**: electron-builder + Wine
- **新方案**: electron-packager + 原生支持
- **改进**: 无需Wine环境，支持所有平台交叉编译

### 依赖管理优化
- **新增依赖**: ieee754, base64-js, jszip, lie, immediate, pako, readable-stream, events, string_decoder
- **构建参数**: --prune=false 保留所有依赖
- **兼容性**: 解决Node.js模块解析问题

## 目录结构优化说明

### 优化原则
1. **清晰分层**: 按功能模块组织文件
2. **易于理解**: 目录命名直观明确
3. **便于维护**: 相关文件集中管理
4. **兼容旧版**: 保留原有结构兼容性

### 新增目录
- **构建系统**: 专门的构建脚本和配置
- **文档中心**: 集中存放所有项目文档
- **配置管理**: 统一的环境和构建配置
- **输出管理**: 清晰的构建结果组织

## 核心功能

1. **书库管理**: 创建和管理多部小说作品
2. **章节树结构**: 直观的章节组织和管理
3. **富文本编辑器**: 支持格式化文本编辑
4. **大纲功能**: 帮助规划和组织故事情节
5. **AI辅助创作**:
   - 智能续写：根据上下文自动生成后续内容
   - 内容扩写/缩写：调整文本篇幅
   - 定向改写：根据指定要求智能改写选中内容
   - 书名生成：智能生成符合内容风格的书名建议
   - 简介生成：一键生成吸引读者的作品简介
6. **片段功能**:
   - 快速保存和管理创作片段
   - 方便记录AI生成的多个版本
   - 一键应用片段内容到正文
   - 支持片段比较和选择最佳版本
7. **智能校对**:
   - 自动检测错别字和语法错误
   - 智能纠错建议
   - 一键应用修改
8. **文档导出**: 支持导出为DOCX格式
9. **搜索和替换**: 快速查找和修改文本内容
10. **字数统计**: 实时显示章节字数

## 构建和运行

### 环境要求

- **Node.js**: 16.0+ (推荐使用LTS版本)
- **pnpm**: 包管理器
- **Git**: 版本控制
- **Docker**: 20.10+ (可选，用于Web部署)

### 安装依赖

```bash
# 安装pnpm（如果未安装）
npm install -g pnpm

# 克隆项目
git clone https://github.com/MisonL/novelbox.git
cd novelbox

# 安装项目依赖
pnpm install
```

### 桌面应用（跨平台构建）

#### 开发模式运行
```bash
# 桌面应用开发模式（热重载）
pnpm run electron:dev
```

#### 跨平台构建（electron-packager）
```bash
# 使用交互式构建菜单（推荐）
./build.sh

# 或手动构建特定平台
pnpm run electron:build:win    # Windows版本（无需Wine）
pnpm run electron:build:mac    # macOS版本（需在macOS系统）
pnpm run electron:build:linux  # Linux版本

# 验证构建结果
ls -la release/NovelBox-*
```

#### 构建输出说明
```
release/
├── NovelBox-win32-x64/     # Windows可执行文件
│   └── NovelBox.exe        # 186MB Windows程序
├── NovelBox-linux-x64/     # Linux可执行文件  
│   └── NovelBox            # 185MB Linux程序
└── NovelBox-darwin-x64/    # macOS应用包
    └── NovelBox.app/       # macOS程序
```

### Web 应用

#### 本地开发
```bash
# Web应用开发模式
pnpm run web:dev

# 访问 http://localhost:5173
```

#### 构建生产版本
```bash
# 构建Web版本
pnpm run web:build

# 构建结果在 dist-web/ 目录
```

#### 预览生产版本
```bash
# 预览Web构建结果
pnpm run web:preview

# 访问 http://localhost:4173
```

### Docker 部署

#### 快速部署（推荐一键脚本）
```bash
# 使用自动化部署脚本
./deploy.sh

# 脚本功能：
# 1. 检查Docker服务状态
# 2. 停止并删除现有容器
# 3. 构建Docker镜像
# 4. 启动新容器
# 5. 显示容器状态和访问地址

# 访问 http://localhost:8080
```

#### 手动Docker部署
```bash
# 构建生产镜像
sudo docker build -f docker/Dockerfile.prod -t novelbox-web .

# 运行容器
sudo docker run -d -p 8080:80 --name novelbox-container novelbox-web

# 查看容器状态
sudo docker ps
sudo docker logs novelbox-container
```

#### Docker Compose部署
```bash
# 生产环境部署
docker-compose -f docker/docker-compose.yml up --build

# 开发环境部署
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --build
```

### 构建系统特点

#### 跨平台构建优势
- **无需Wine**: 使用electron-packager替代electron-builder
- **优雅降级**: 自动检测系统环境，跳过不支持的平台
- **完整依赖**: 自动处理所有Node.js模块依赖
- **一键脚本**: 提供交互式构建菜单

#### 构建命令对比
| 命令 | 用途 | 输出 |
|------|------|------|
| `./build.sh` | 交互式构建菜单 | 所有支持的平台 |
| `pnpm run electron:build:win` | Windows构建 | NovelBox-win32-x64/ |
| `pnpm run electron:build:mac` | macOS构建 | NovelBox-darwin-x64/ |
| `pnpm run electron:build:linux` | Linux构建 | NovelBox-linux-x64/ |

#### 验证构建结果
```bash
# 检查所有构建输出
ls -la release/

# 测试Windows版本（Linux系统）
wine release/NovelBox-win32-x64/NovelBox.exe

# 测试Linux版本
chmod +x release/NovelBox-linux-x64/NovelBox
./release/NovelBox-linux-x64/NovelBox

# 测试macOS版本（macOS系统）
open release/NovelBox-darwin-x64/NovelBox.app
```

### 部署完成验证

#### 桌面应用验证
```bash
# 检查可执行文件
file release/NovelBox-win32-x64/NovelBox.exe  # Windows
file release/NovelBox-linux-x64/NovelBox      # Linux
file release/NovelBox-darwin-x64/NovelBox     # macOS

# 检查文件大小（约185-186MB）
du -h release/NovelBox-*
```

#### Web应用验证
```bash
# 本地访问测试
curl http://localhost:8080

# 检查Docker容器
docker ps | grep novelbox
```

### 故障排除

#### 常见构建问题
1. **依赖缺失**: 运行 `pnpm install` 重新安装依赖
2. **权限问题**: 使用 `chmod +x` 给Linux/macOS程序添加执行权限
3. **内存不足**: 确保系统有至少4GB可用内存
4. **网络问题**: 检查网络连接，构建需要下载Electron二进制文件

#### 构建日志查看
```bash
# 查看详细构建日志
pnpm run electron:build:win 2>&1 | tee build.log

# 使用调试模式
DEBUG=* pnpm run electron:build:win
```

## 开发约定

### 代码风格

- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 风格
- 使用 Element Plus 组件库
- 采用 Tailwind CSS 进行样式设计

### 文件组织

- 组件放在 `src/components/` 目录下
- 页面视图放在 `src/views/` 目录下
- 业务逻辑控制器放在 `src/controllers/` 目录下
- 服务层代码放在 `src/services/` 目录下

### AI 服务集成

项目支持多种AI服务提供商，通过 `src/services/aiService.ts` 统一管理：
- OpenAI (GPT系列)
- Anthropic (Claude系列)
- Google (Gemini系列)
- DeepSeek
- MiniMax

### 窗口管理

应用使用多窗口架构：
- 主窗口：用于书库管理和编辑
- 片段窗口：用于AI生成内容的预览和编辑
- 窗口间通过 IPC 通信

### 数据存储

#### 桌面端
- 使用本地文件系统存储书籍数据
- 工作区概念：用户可以选择一个目录作为工作区
- 配置信息存储在 localStorage 中

#### Web端
- 使用浏览器 localStorage 存储所有数据
- 自动使用虚拟工作区 `/web-workspace`
- 文件操作通过浏览器下载/上传实现
- 数据持久性依赖于浏览器的存储策略

## 关键文件说明

### 桌面端关键文件
- `electron/main.ts`: Electron 主进程，负责窗口管理和文件操作
- `electron/preload.ts`: 预加载脚本，提供主进程与渲染进程间的通信
- `src/main.ts`: Electron 前端入口文件

### Web端关键文件
- `src/main.web.ts`: Web 前端入口文件
- `index.web.html`: Web 版本 HTML 模板
- `nginx.conf`: Nginx 服务器配置
- `Dockerfile`: Docker 镜像构建配置
- `deploy.sh`: 自动化部署脚本

### 共享关键文件
- `src/App.vue`: 应用根组件，管理全局状态和模态框
- `src/views/NovelEditor.vue`: 小说编辑器主界面
- `src/services/aiService.ts`: AI 服务集成和调用
- `src/services/bookConfigService.ts`: 书籍配置管理
- `src/services/workspaceservice.ts`: 工作区管理服务（Web端自动设置虚拟工作区）
- `src/services/webFileService.ts`: Web环境文件服务模拟
- `src/services/webFragmentService.ts`: Web环境片段服务
- `vite.config.ts`: Electron 版本 Vite 配置
- `vite.config.web.ts`: Web 版本 Vite 配置

## 注意事项

### 通用注意事项
- 应用强制使用浅色主题，防止受系统主题影响
- 支持 F12 快捷键打开开发者工具
- 应用退出时会自动清理所有窗口资源

### 桌面端注意事项
- 片段窗口使用无边框设计，支持透明背景
- 应用启动时会检查工作区设置，如未设置会提示用户选择
- 支持多窗口架构，窗口间通过 IPC 通信

### Web端注意事项
- Web端自动使用虚拟工作区 `/web-workspace`，无需手动设置
- 所有数据存储在浏览器 localStorage 中，清除浏览器数据会丢失所有作品
- 文件操作通过浏览器下载/上传实现，不支持直接访问本地文件系统
- 部分高级功能可能受限，如本地文件系统直接访问
- 建议定期导出作品以备份重要内容
- 支持所有现代浏览器，推荐使用 Chrome 或 Firefox