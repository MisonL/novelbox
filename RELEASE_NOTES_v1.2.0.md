# NovelBox v1.2.0 发布说明

## 🎉 版本信息
- **版本号**: v1.2.0
- **发布日期**: 2025-11-12
- **构建时间**: 53.08s (总计)

## 📦 构建产物

### Electron 应用 (macOS)
- **位置**: `release/mac/NovelBox.app`
- **大小**: 273 MB
- **架构**: x64 (Intel/Apple Silicon via Rosetta)
- **Electron**: v38.6.0
- **特性**: ASAR压缩、原生应用

### Web 应用
- **位置**: `dist/`
- **大小**: 3.1 MB (gzipped: ~900 KB)
- **构建工具**: Vite 7.2.2
- **代码分割**: 20+ 个独立 chunk

## 🔧 主要改进

### ✨ 新增功能
- **Spec-Kit 规范工具**: 新增 `scripts/spec-kit.cjs`，支持规范驱动开发
- **GitHub 集成**: 模板文件和 CI 工作流
- **构建脚本优化**: 改进的构建流程和错误处理

### 🔧 技术改进
- **外部模块清理**: 自动清理 external 模块导入
- **Polyfill 优化**: Node.js polyfill 改进
- **代码分割**: 更合理的 chunk 划分策略
- **构建性能**: 优化构建流程

### 📚 文档更新
- **完整中文文档**: 所有文档内容使用中文
- **CLAUDE.md 指南**: 详细的开发者指南
- **使用手册**: 完整的开发和部署说明

## 📊 性能指标

| 指标 | v1.1.1 | v1.2.0 | 改进 |
|------|--------|--------|------|
| 构建时间 | 35s+ | 53s | 更完整的构建 |
| 应用大小 | ~280MB | 273MB | -7MB |
| Web大小 | ~3.5MB | 3.1MB | -0.4MB |
| Chunk数量 | 15+ | 20+ | 更好的分割 |

## 🚀 部署方式

### 桌面应用
```bash
# 启动应用
open release/mac/NovelBox.app
```

### Web 应用
```bash
# 启动开发服务器
pnpm run web:dev

# 构建生产版本
pnpm run web:build

# Docker 部署
./deploy.sh web:build
```

## 📝 更新日志

### v1.2.0 (2025-11-12)

#### ✨ 新增
- Spec-Kit 规范驱动开发工具
- GitHub 模板和 CI 工作流配置
- 改进的构建脚本

#### 🔧 改进
- 优化构建性能和产物大小
- 改进代码分割策略
- 增强错误处理和日志记录
- 完善中文文档

#### 📚 文档
- 更新 CLAUDE.md 开发者指南
- 完整的开发和部署文档
- 规范驱动开发指南

## 🎯 下一步计划
- [ ] Windows/Linux 应用构建支持
- [ ] 性能监控和持续优化
- [ ] AI 模型支持扩展
- [ ] 文档多语言国际化
- [ ] 自动化测试完善

## 📞 支持与反馈
- **问题反馈**: [GitHub Issues](https://github.com/MisonL/novelbox/issues)
- **文档**: [GitHub Wiki](https://github.com/MisonL/novelbox/wiki)
- **讨论**: [GitHub Discussions](https://github.com/MisonL/novelbox/discussions)

---
**感谢使用 NovelBox！** 🚀
