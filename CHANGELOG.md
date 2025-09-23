# NovelBox 更新日志

## [1.1.1] - 2025-09-23

### 🚀 构建系统重大升级

#### ✅ 交互式构建菜单系统
- **全新界面**: 彩色输出，菜单式操作界面
- **功能完整**: 支持macOS/Windows/Linux全平台构建
- **智能提示**: 详细的错误处理和用户引导
- **日志系统**: 完整的构建日志记录和查看功能

#### ✅ 跨平台构建增强
- **Windows支持**: 完整的Windows x64/ARM64应用构建
- **Linux支持**: 完整的Linux x64/ARM64应用构建  
- **安装程序**: 自动生成Windows NSIS安装程序
- **AppImage**: 自动生成Linux AppImage便携应用
- **一键构建**: 支持所有平台一键构建

#### ✅ 构建脚本优化
- **智能检测**: 自动检测系统环境和依赖
- **错误处理**: 完善的错误提示和解决方案
- **验证机制**: 自动验证构建结果完整性
- **性能优化**: 优化的构建流程和内存使用

### 🔧 技术改进

#### 构建系统架构
- **模块化设计**: 分离的平台构建函数
- **配置管理**: 统一的平台配置管理
- **路径处理**: 跨平台路径处理优化
- **依赖管理**: 智能的依赖检查和提示

#### 用户体验提升
- **彩色输出**: 美观的命令行界面
- **进度显示**: 详细的构建进度提示
- **帮助系统**: 完整的命令行帮助信息
- **交互菜单**: 友好的用户交互体验

### 📊 功能对比

| 功能 | 1.1.0 | 1.1.1 | 改进 |
|------|--------|--------|------|
| **交互式菜单** | ❌ | ✅ | 新增 |
| **Windows构建** | 基础 | 完整 | 增强 |
| **Linux构建** | 基础 | 完整 | 增强 |
| **安装程序** | ❌ | ✅ | 新增 |
| **AppImage** | ❌ | ✅ | 新增 |
| **构建验证** | 手动 | 自动 | 改进 |
| **错误处理** | 基础 | 完善 | 增强 |

### 🐛 问题修复

#### 构建系统问题
- **修复**: Windows平台构建路径处理问题
- **修复**: Linux平台可执行文件权限问题
- **修复**: 跨平台路径分隔符兼容性问题
- **修复**: 构建依赖检查不完整问题

#### 用户体验问题
- **修复**: 构建过程无进度提示问题
- **修复**: 错误信息不够明确问题
- **修复**: 构建结果验证缺失问题
- **修复**: 帮助信息不完整问题

### 📁 新增文件

#### 构建系统文件
- `build.sh` - 完全重写的交互式构建脚本
- `.github/` - GitHub工作流程和模板文件
- 新增测试文件和类型定义文件

#### 配置文件
- `eslint.config.js` - ESLint配置
- `vitest.config.ts` - Vitest测试配置
- `asar.config.js` - ASAR打包配置
- `pnpm-workspace.yaml` - pnpm工作区配置

### 🎯 使用指南

#### 快速开始（1.1.1版本）
```bash
# 交互式构建（推荐）
./build.sh

# 快速构建指定平台
./build.sh -q macos x64      # macOS x64
./build.sh -q windows x64    # Windows x64
./build.sh -q linux x64      # Linux x64
./build.sh -q all x64        # 所有平台x64

# 查看构建结果
./build.sh -r               # 显示构建报告
./build.sh -l               # 查看构建日志
```

#### 高级功能
```bash
# 清理构建目录
./build.sh -c               # 清理所有构建输出

# 检查依赖
./build.sh -d               # 检查系统依赖

# 交互式菜单
./build.sh -i               # 启动交互式菜单
```

### 🔗 相关链接

- [GitHub Releases](https://github.com/MisonL/novelbox/releases) - 下载最新版本
- [构建指南](docs/CROSS_PLATFORM_BUILD.md) - 详细的跨平台构建说明
- [项目文档](README.md) - 完整的项目使用指南

---

## [1.1.0] - 2025-09-02

### 🚀 重大功能更新

#### ✅ 跨平台构建系统升级
- **替换构建工具**: 从electron-builder升级到electron-packager
- **无需Wine**: Windows版本可在Linux/macOS上直接构建，无需Wine环境
- **优雅降级**: 自动检测系统环境，跳过不支持的平台构建
- **构建优化**: 构建时间减少30-50%，节省2-3GB磁盘空间

#### ✅ 依赖管理优化
- **新增依赖**: 添加ieee754, base64-js, jszip, lie, immediate, pako, readable-stream, events, string_decoder
- **模块解析**: 解决Node.js模块缺失问题，确保所有依赖正确加载
- **构建参数**: 添加--prune=false参数，保留完整依赖链

#### ✅ 构建输出优化
- **Windows**: `release/NovelBox-win32-x64/NovelBox.exe` (186MB)
- **Linux**: `release/NovelBox-linux-x64/NovelBox` (185MB)
- **macOS**: `release/NovelBox-darwin-x64/NovelBox.app` (macOS原生支持)

### 🔧 技术改进

#### 构建系统
- **electron-packager**: 完全替代electron-builder
- **跨平台支持**: 支持Windows/Linux/macOS原生交叉编译
- **构建脚本**: 新增交互式构建菜单`./build.sh`
- **验证机制**: 提供详细的构建结果验证步骤

#### 文档更新
- **README.md**: 更新跨平台构建说明
- **CROSS_PLATFORM_BUILD.md**: 完全重写，提供electron-packager详细指南
- **IFLOW.md**: 更新构建和运行部分，添加验证步骤

### 📊 性能提升

| 指标 | 1.0.0 | 1.1.0 | 提升 |
|------|--------|--------|------|
| **构建时间** | 15-20分钟 | 8-12分钟 | ↓40% |
| **磁盘占用** | 4-5GB | 1.8-2GB | ↓60% |
| **Wine依赖** | 需要 | 不需要 | ✓ |
| **跨平台** | 有限制 | 完全支持 | ✓ |

### 🐛 问题修复

#### 构建相关问题
- **修复**: Wine环境依赖问题
- **修复**: Node.js模块解析错误
- **修复**: 图标尺寸兼容性问题
- **修复**: 跨平台编译限制

#### 依赖问题
- **修复**: 缺失的Node.js模块依赖
- **修复**: 数据库驱动stub模块问题
- **修复**: 构建过程中的网络依赖问题

### 📁 文件结构优化

#### 新增文件
- `build.sh` - 交互式跨平台构建脚本
- `CHANGELOG.md` - 版本更新日志
- 新增依赖包配置

#### 更新文件
- `package.json` - 版本号升级到1.1.0
- 所有构建相关文档同步更新

### 🎯 使用指南

#### 快速开始（1.1.0版本）
```bash
# 克隆项目
git clone https://github.com/MisonL/novelbox.git
cd novelbox

# 安装依赖
pnpm install

# 一键构建（推荐）
./build.sh

# 或分平台构建
pnpm run electron:build:win    # Windows
pnpm run electron:build:mac    # macOS
pnpm run electron:build:linux  # Linux
```

#### 验证构建结果
```bash
# 检查构建输出
ls -la release/NovelBox-*

# 测试Windows版本（Linux系统）
wine release/NovelBox-win32-x64/NovelBox.exe

# 测试Linux版本
./release/NovelBox-linux-x64/NovelBox
```

### 🔗 相关链接

- [GitHub Releases](https://github.com/MisonL/novelbox/releases) - 下载最新版本
- [构建指南](docs/CROSS_PLATFORM_BUILD.md) - 详细的跨平台构建说明
- [项目文档](README.md) - 完整的项目使用指南

---

## [1.0.0] - 2025-08-XX

### 🎉 初始版本发布

#### 核心功能
- 书库管理系统
- 章节树结构管理
- 富文本编辑器
- AI辅助创作功能
- 多数据库支持（MongoDB, MySQL, SQL Server, SQLite）
- Web应用支持
- Docker容器化部署
- 跨平台桌面应用支持

#### 技术特性
- Vue 3 + TypeScript架构
- Electron桌面应用
- Docker容器化
- 多AI模型集成（OpenAI, Anthropic, Google, DeepSeek, MiniMax, Ollama, LM Studio）
- DOCX导出功能
- 实时字数统计

---

## 版本命名规范

- **主版本号**: 重大功能更新或不兼容变更
- **次版本号**: 新功能添加，向下兼容
- **修订号**: Bug修复，向下兼容

## 发布说明

### 1.1.0版本亮点
- **零依赖构建**: 无需Wine环境即可构建Windows版本
- **全平台支持**: 支持Windows/Linux/macOS原生交叉编译
- **性能优化**: 构建时间减少40%，磁盘占用减少60%
- **用户体验**: 提供交互式构建菜单，简化构建流程