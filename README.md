# NovelBox

<p align="center">
  <img src="public/icon.ico" alt="NovelBox Logo" width="120" height="120">
</p>

<p align="center">
  <strong>一款强大的AI辅助小说创作工具 | A powerful AI-assisted novel writing tool</strong>
</p>

<p align="center">
  <a href="#chinese-version">中文文档</a> |
  <a href="#english-version">English Documentation</a>
</p>

---

<h2 id="chinese-version">中文文档</h2>

## 项目介绍

NovelBox是一款专为小说创作者设计的桌面应用程序，集成了多种AI模型（OpenAI、Anthropic、Google Gemini、DeepSeek），帮助作家更高效地进行创作。应用提供了直观的章节管理、大纲编辑、AI辅助续写等功能，让您的创作过程更加流畅和高效。

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
  - 支持多种AI模型：OpenAI、Anthropic Claude、Google Gemini、DeepSeek
- **智能校对**：
  - 自动检测错别字和语法错误
  - 智能纠错建议
  - 一键应用修改
- **文档导出**：支持导出为DOCX格式
- **搜索和替换**：快速查找和修改文本内容
- **字数统计**：实时显示章节字数

## 界面预览

| 主界面 | 编辑器界面 |
|:---:|:---:|
| <img src="doc/main_screen.png" width="400"> | <img src="doc/editor_screen.png" width="400"> |

## 安装

### 系统要求
- Windows 10/11 64位操作系统

### 下载与安装
1. 从[Releases](https://github.com/Rain-31/novelbox/releases)页面下载最新版本的安装包
2. 运行下载的安装程序
3. 按照安装向导的指示完成安装

### 从源码构建
```bash
# 克隆仓库
git clone github.com/Rain-31/novelbox.git
cd novelbox

# 安装依赖
pnpm install

# 开发模式运行
pnpm run electron:dev

# 构建应用
pnpm run electron:build

# 打包发布
pnpm run electron:release
```

## 使用方法

1. **创建新书**：在书库页面点击"新建书籍"按钮
2. **进入编辑**：点击书籍卡片进入编辑界面
3. **添加章节**：在左侧章节树中添加新章节或子章节
4. **编写内容**：在编辑器中编写章节内容
5. **AI辅助**：
   - 选中文本后使用扩写/缩写功能
   - 在编辑器底部输入提示并点击"AI续写"按钮
6. **导出文档**：在书籍管理页面选择导出选项，将作品导出为DOCX格式

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI组件**：Element Plus
- **富文本编辑**：QuillJS
- **构建工具**：Vite
- **桌面应用**：Electron
- **文档处理**：docx.js
- **AI集成**：OpenAI API, Anthropic API, Google Generative AI, DeepSeek

## 贡献

我们欢迎各种形式的贡献！

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

本项目采用GNU通用公共许可证v3.0（GPL-3.0）进行许可。详情请参阅[LICENSE](LICENSE)文件。

---

<h2 id="english-version">English Documentation</h2>

## Introduction

NovelBox is a desktop application designed specifically for novel writers, integrating various AI models (OpenAI, Anthropic, Google Gemini, DeepSeek) to help authors create more efficiently. The application provides intuitive chapter management, outline editing, AI-assisted continuation, and other features to make your creative process smoother and more productive.

## Features

- **Book Library Management**: Create and manage multiple novel projects
- **Chapter Tree Structure**: Intuitive organization and management of chapters
- **Rich Text Editor**: Support for formatted text editing
- **Outline Feature**: Help plan and organize story plots
- **AI-Assisted Writing**:
  - Smart Continuation: Automatically generate subsequent content based on context
  - Content Expansion/Condensation: Adjust text length
  - Targeted Rewriting: Intelligently rewrite selected content according to specific requirements
  - Title Generation: Smart suggestions for book titles that match the content style
  - Synopsis Generation: One-click generation of engaging book descriptions
  - Support for Multiple AI Models: OpenAI, Anthropic Claude, Google Gemini, etc.
- **Smart Proofreading**:
  - Automatic detection of typos and grammatical errors
  - Intelligent correction suggestions
  - One-click apply modifications
- **Document Export**: Support for exporting to DOCX format
- **Search and Replace**: Quickly find and modify text content
- **Word Count**: Real-time display of chapter word count

## Installation

### System Requirements
- Windows 10/11 64-bit operating system

### Download and Installation
1. Download the latest installation package from the [Releases](https://github.com/Rain-31/novelbox/releases) page
2. Run the downloaded installer
3. Follow the installation wizard instructions to complete the installation

### Build from Source
```bash
# Clone repository
git clone https://github.com/Rain-31/novelbox.git
cd novelbox

# Install dependencies
pnpm install

# Run in development mode
pnpm run electron:dev

# Build application
pnpm run electron:build

# Package for release
pnpm run electron:release
```

## Usage

1. **Create New Book**: Click the "New Book" button on the library page
2. **Enter Editing**: Click on a book card to enter the editing interface
3. **Add Chapters**: Add new chapters or subchapters in the chapter tree on the left
4. **Write Content**: Write chapter content in the editor
5. **AI Assistance**:
   - Use expand/condense features after selecting text
   - Enter prompts at the bottom of the editor and click "AI Continue" button
6. **Export Document**: Select export options on the book management page to export your work as a DOCX format

## Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **UI Components**: Element Plus
- **Rich Text Editing**: QuillJS
- **Build Tool**: Vite
- **Desktop Application**: Electron
- **Document Processing**: docx.js
- **AI Integration**: OpenAI API, Anthropic API, Google Generative AI, DeepSeek

## Contributing

We welcome contributions of all forms!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for writers everywhere
</p>
