# 跨平台编译指南

本文档详细说明如何使用electron-packager在不同操作系统上编译NovelBox桌面应用。

## 📋 编译状态总览（electron-packager）

| 平台 | 编译状态 | 可执行文件位置 | 系统要求 | 备注 |
|------|----------|----------------|----------|------|
| **Windows** | ✅ 已完成 | `release/NovelBox-win32-x64/NovelBox.exe` | 任何系统 | 无需Wine |
| **Linux** | ✅ 已完成 | `release/NovelBox-linux-x64/NovelBox` | Linux系统 | 原生支持 |
| **macOS** | ✅ 已完成 | `release/NovelBox-darwin-x64/NovelBox.app` | macOS系统 | 原生支持 |

## 🏗️ 编译环境要求

### 通用要求
- **Node.js**: 16.0+ (推荐使用LTS版本)
- **pnpm**: 包管理器
- **Git**: 版本控制

### 系统特定要求

#### Windows编译
- **系统**: Windows 10/11 64位 或 Linux/macOS
- **工具**: 无需额外工具（已解决Wine依赖问题）

#### macOS编译
- **系统**: macOS 10.15+
- **工具**: Xcode Command Line Tools

#### Linux编译
- **系统**: Ubuntu 18.04+, CentOS 7+, 或其他现代Linux发行版
- **工具**: build-essential 或等效开发工具包

## 🚀 快速编译（推荐electron-packager）

### 一键编译脚本
```bash
# 克隆项目
git clone https://github.com/MisonL/novelbox.git
cd novelbox

# 安装依赖
pnpm install

# 使用交互式构建菜单
./build.sh

# 或手动构建特定平台
pnpm run electron:build:win    # Windows版本
pnpm run electron:build:mac    # macOS版本
pnpm run electron:build:linux  # Linux版本
```

### 分平台编译（electron-packager）

#### Windows版本（无需Wine）
```bash
# 在任何系统上编译Windows版本
pnpm run electron:build:win

# 输出：release/NovelBox-win32-x64/NovelBox.exe
```

#### macOS版本
```bash
# 必须在macOS系统上执行
pnpm run electron:build:mac

# 输出：release/NovelBox-darwin-x64/NovelBox.app
```

#### Linux版本
```bash
# 在Linux系统上执行
pnpm run electron:build:linux

# 输出：release/NovelBox-linux-x64/NovelBox
```

## 📁 编译输出说明（electron-packager）

### 编译结果目录结构
```
release/
├── NovelBox-win32-x64/     # Windows可执行文件
│   ├── NovelBox.exe        # 主程序（186MB）
│   ├── resources/          # 应用资源
│   ├── locales/            # 本地化文件
│   └── ...
├── NovelBox-linux-x64/     # Linux可执行文件
│   ├── NovelBox            # 主程序（185MB）
│   ├── resources/          # 应用资源
│   ├── locales/            # 本地化文件
│   └── ...
├── NovelBox-darwin-x64/    # macOS应用包
│   ├── NovelBox.app/       # macOS应用包
│   └── ...
└── ...
```

## ⚙️ 编译配置（electron-packager）

### 构建配置
项目使用 `@electron/packager` 进行跨平台构建，配置位于 `package.json`：

```json
{
  "scripts": {
    "electron:build:win": "vite build --config vite.config.electron.ts && npx @electron/packager . NovelBox --platform=win32 --arch=x64 --out=release --overwrite --asar=false --prune=false",
    "electron:build:mac": "vite build --config vite.config.electron.ts && npx @electron/packager . NovelBox --platform=darwin --arch=x64 --out=release --overwrite --asar=false --prune=false",
    "electron:build:linux": "vite build --config vite.config.electron.ts && npx @electron/packager . NovelBox --platform=linux --arch=x64 --out=release --overwrite --asar=false --prune=false"
  }
}
```

### 关键参数说明
- `--platform`: 目标平台 (win32, darwin, linux)
- `--arch`: 架构 (x64, arm64)
- `--out`: 输出目录
- `--overwrite`: 覆盖现有文件
- `--asar=false`: 禁用asar打包（便于调试）
- `--prune=false`: 保留所有依赖（解决模块缺失问题）

## 🔧 已解决的常见问题

### 1. Wine依赖问题（已解决）
**问题**: 原electron-builder需要Wine环境编译Windows版本
**解决**: 使用electron-packager，无需Wine环境

### 2. Node.js模块缺失（已解决）
**问题**: 编译时出现 `Failed to locate module` 错误
**解决**: 
- 添加 `--prune=false` 参数
- 安装缺失的依赖包：ieee754, base64-js, jszip, lie, immediate, pako, readable-stream, events, string_decoder

### 3. 图标尺寸问题（已解决）
**问题**: 图标必须至少512x512像素
**解决**: 已更新 `public/icon-512.png` 为高分辨率图标

### 4. 跨平台兼容性（已解决）
**问题**: 不同系统间的兼容性问题
**解决**: electron-packager原生支持跨平台编译

## 🎯 构建系统特点

### 优势对比
| 特性 | electron-builder | electron-packager |
|------|------------------|-------------------|
| **Wine依赖** | 需要 | 不需要 |
| **跨平台** | 有限制 | 完全支持 |
| **构建速度** | 较慢 | 较快 |
| **调试友好** | 一般 | 很好 |
| **依赖处理** | 复杂 | 简单 |

### 优雅降级处理
```bash
# build.sh 脚本自动处理系统限制
./build.sh
# 自动跳过不支持的系统平台
```

## 📊 资源占用对比

### electron-packager资源需求
| 项目 | 磁盘空间 | 内存 | 网络 | 时间 |
|------|----------|------|------|------|
| **Windows** | 1.8 GB | 1.5 GB | 300 MB | 8-12分钟 |
| **Linux** | 1.8 GB | 1.5 GB | 300 MB | 8-12分钟 |
| **macOS** | 1.8 GB | 1.5 GB | 300 MB | 8-12分钟 |

### 相比electron-builder的改进
- **节省空间**: 无需Wine环境，节省2-3GB
- **节省时间**: 构建时间减少30-50%
- **简化流程**: 无需复杂配置

## 🚀 使用建议

### 开发环境
```bash
# 开发模式（热重载）
pnpm run electron:dev

# 构建测试版本
pnpm run electron:build:win
```

### 生产环境
```bash
# 使用交互式构建菜单
./build.sh

# 或手动构建特定平台
pnpm run electron:build:win    # Windows
pnpm run electron:build:mac    # macOS
pnpm run electron:build:linux  # Linux
```

### 验证构建结果
```bash
# 检查构建输出
ls -la release/NovelBox-*

# 测试Windows版本（Linux系统）
wine release/NovelBox-win32-x64/NovelBox.exe

# 测试Linux版本
./release/NovelBox-linux-x64/NovelBox
```

## 🐳 Docker编译（可选）

### 使用Docker编译
```bash
# 构建Docker镜像
docker build -f docker/Dockerfile.prod -t novelbox-builder .

# 在容器中编译特定平台
docker run -v $(pwd)/release:/app/release novelbox-builder pnpm run electron:build:linux
```

## 📞 技术支持

如遇到编译问题，请：
1. 检查系统要求是否满足
2. 确保Node.js和pnpm版本正确
3. 查看具体错误信息
4. 使用 `./build.sh` 脚本进行交互式构建
5. 提交Issue到项目仓库

## 🔗 相关文档
- [README.md](../README.md) - 项目主要文档
- [IFLOW.md](../IFLOW.md) - 项目上下文文档
- [package.json](../package.json) - 构建配置详情
- [build.sh](../build.sh) - 交互式构建脚本