#!/usr/bin/env node

/**
 * NovelBox Spec-Kit 开发工具
 * 基于GitHub Spec-Kit理念的规范驱动开发工具
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 工具函数
function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log('red', `❌ ${message}`);
  process.exit(1);
}

function success(message) {
  log('green', `✅ ${message}`);
}

function info(message) {
  log('blue', `ℹ️  ${message}`);
}

function warning(message) {
  log('yellow', `⚠️  ${message}`);
}

// Spec-Kit 命令实现
class SpecKit {
  constructor() {
    this.projectRoot = process.cwd();
    this.specDir = path.join(this.projectRoot, '.github');
    this.specFile = path.join(this.specDir, 'spec.md');
    this.planFile = path.join(this.specDir, 'plan.md');
    this.tasksFile = path.join(this.specDir, 'tasks.md');
  }

  // 初始化Spec-Kit
  init() {
    info('初始化 NovelBox Spec-Kit 开发环境...');
    
    // 创建.github目录
    if (!fs.existsSync(this.specDir)) {
      fs.mkdirSync(this.specDir, { recursive: true });
    }

    // 创建基础配置文件
    this.createGitHubTemplates();
    this.createVSCodeSettings();
    this.createNPMScripts();
    
    success('Spec-Kit 初始化完成！');
    info('请查看 .github/ 目录中的配置文件');
  }

  // 创建GitHub模板
  createGitHubTemplates() {
    // Pull Request模板
    const prTemplate = `# Pull Request

## 📋 变更说明
<!-- 简要描述这个PR的主要变更 -->

## 🎯 变更类型
- [ ] 🐛 Bug修复
- [ ] ✨ 新功能
- [ ] 📚 文档更新
- [ ] 🎨 代码重构
- [ ] ⚡ 性能优化
- [ ] 🔧 配置变更

## 🧪 测试情况
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成

## 📚 相关文档
<!-- 链接到相关文档或规格说明 -->

## 🔗 相关问题
<!-- 链接到相关的Issue -->
Fixes #

## 📸 截图（如适用）
<!-- 添加截图展示变更效果 -->

## ⚠️ 注意事项
<!-- 任何需要reviewer特别注意的地方 -->

## ✅ 检查清单
- [ ] 代码遵循项目编码规范
- [ ] 添加了必要的测试用例
- [ ] 更新了相关文档
- [ ] 通过了所有CI检查`;

    // Issue模板
    const issueTemplate = `---
name: 功能请求
about: 建议一个新功能或改进
title: '[FEATURE] '
labels: 'enhancement'
assignees: ''

---

## 🎯 功能描述
<!-- 清晰描述你希望的功能 -->

## 📝 使用场景
<!-- 描述这个功能的使用场景和用户故事 -->

## 💡 解决方案
<!-- 描述你认为可行的解决方案 -->

## 📊 优先级
- [ ] 低
- [ ] 中
- [ ] 高
- [ ] 紧急

## 🔗 相关资源
<!-- 链接到相关文档、截图或其他资源 -->

## ✅ 验收标准
<!-- 定义这个功能完成的标准 -->
- [ ] 标准1
- [ ] 标准2
- [ ] 标准3`;

    // 工作流配置
    const workflowConfig = `name: CI

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Run type check
      run: pnpm run type-check
      
    - name: Run linter
      run: pnpm run lint
      
    - name: Run tests
      run: pnpm test`;

    // 写入文件
    const templatesDir = path.join(this.specDir, 'pull_request_template.md');
    fs.writeFileSync(templatesDir, prTemplate);
    
    const issuesDir = path.join(this.specDir, 'ISSUE_TEMPLATE');
    if (!fs.existsSync(issuesDir)) {
      fs.mkdirSync(issuesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(issuesDir, 'feature_request.md'), issueTemplate);

    // GitHub Actions
    const workflowsDir = path.join(this.specDir, 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(workflowsDir, 'ci.yml'), workflowConfig);

    success('GitHub模板创建完成');
  }

  // 创建VSCode配置
  createVSCodeSettings() {
    const vscodeDir = path.join(this.projectRoot, '.vscode');
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir, { recursive: true });
    }

    const settings = {
      "typescript.preferences.importModuleSpecifier": "relative",
      "typescript.suggest.autoImports": true,
      "typescript.updateImportsOnFileMove.enabled": "always",
      "editor.formatOnSave": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
      },
      "files.associations": {
        "*.vue": "vue"
      },
      "eslint.validate": [
        "javascript",
        "javascriptreact", 
        "typescript",
        "typescriptreact",
        "vue"
      ],
      "vetur.validation.template": false,
      "volar.takeOverMode.enabled": true
    };

    const extensions = {
      "recommendations": [
        "Vue.volar",
        "Vue.vscode-typescript-vue-plugin",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next"
      ]
    };

    fs.writeFileSync(
      path.join(vscodeDir, 'settings.json'),
      JSON.stringify(settings, null, 2)
    );

    fs.writeFileSync(
      path.join(vscodeDir, 'extensions.json'),
      JSON.stringify(extensions, null, 2)
    );

    success('VSCode配置创建完成');
  }

  // 创建NPM脚本
  createNPMScripts() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // 添加Spec-Kit脚本
    packageJson.scripts = {
      ...packageJson.scripts,
      "spec:check": "node scripts/spec-kit.js check",
      "spec:validate": "node scripts/spec-kit.js validate",
      "spec:test": "node scripts/spec-kit.js test",
      "test:unit": "vitest run",
      "test:watch": "vitest watch",
      "test:coverage": "vitest run --coverage",
      "lint:fix": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
      "type-check": "vue-tsc --noEmit"
    };

    // 添加开发依赖
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      "@vitest/coverage-c8": "^0.33.0",
      "vitest": "^0.34.0",
      "@vue/test-utils": "^2.4.0",
      "jsdom": "^22.0.0"
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    success('NPM脚本更新完成');
  }

  // 验证规范
  validate() {
    info('验证项目规范...');
    
    const checks = [
      this.checkSpecFile(),
      this.checkProjectStructure(),
      this.checkCodeQuality(),
      this.checkTests()
    ];

    const results = checks.map(check => check());
    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    if (passed === total) {
      success(`✅ 所有规范检查通过 (${passed}/${total})`);
    } else {
      warning(`⚠️  规范检查完成，通过 ${passed}/${total} 项`);
      results.forEach(result => {
        if (!result.passed) {
          error(`❌ ${result.message}`);
        }
      });
    }
  }

  // 检查规范文件
  checkSpecFile() {
    return () => {
      if (!fs.existsSync(this.specFile)) {
        return {
          passed: false,
          message: '缺少项目规范文件 (.github/spec.md)'
        };
      }
      
      const specContent = fs.readFileSync(this.specFile, 'utf8');
      const requiredSections = [
        '项目概述',
        '开发目标',
        '技术架构',
        '功能规格',
        '技术规格'
      ];

      const missingSections = requiredSections.filter(section => 
        !specContent.includes(section)
      );

      if (missingSections.length > 0) {
        return {
          passed: false,
          message: `规范文件缺少必要章节: ${missingSections.join(', ')}`
        };
      }

      return { passed: true, message: '规范文件完整' };
    };
  }

  // 检查项目结构
  checkProjectStructure() {
    return () => {
      const requiredDirs = [
        'src/components',
        'src/services',
        'src/views',
        'src/utils',
        'src/types'
      ];

      const missingDirs = requiredDirs.filter(dir => 
        !fs.existsSync(path.join(this.projectRoot, dir))
      );

      if (missingDirs.length > 0) {
        return {
          passed: false,
          message: `缺少必要目录: ${missingDirs.join(', ')}`
        };
      }

      return { passed: true, message: '项目结构完整' };
    };
  }

  // 检查代码质量
  checkCodeQuality() {
    return () => {
      try {
        execSync('pnpm run lint', { stdio: 'ignore' });
        return { passed: true, message: '代码质量检查通过' };
      } catch (error) {
        return {
          passed: false,
          message: '代码质量检查失败，请运行 pnpm run lint:fix 修复'
        };
      }
    };
  }

  // 检查测试
  checkTests() {
    return () => {
      const testFiles = this.findTestFiles();
      
      if (testFiles.length === 0) {
        return {
          passed: false,
          message: '未找到测试文件，请添加测试用例'
        };
      }

      try {
        execSync('pnpm run test:unit', { stdio: 'ignore' });
        return { passed: true, message: '所有测试通过' };
      } catch (error) {
        return {
          passed: false,
          message: '测试执行失败，请检查测试用例'
        };
      }
    };
  }

  // 查找测试文件
  findTestFiles() {
    const testFiles = [];
    const srcDir = path.join(this.projectRoot, 'src');
    
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.test.ts') || file.endsWith('.spec.ts')) {
          testFiles.push(filePath);
        }
      });
    }

    if (fs.existsSync(srcDir)) {
      walkDir(srcDir);
    }

    return testFiles;
  }

  // 运行测试
  test() {
    info('运行项目测试...');
    const result = this.checkTests()();
    
    if (result.passed) {
      success(result.message);
    } else {
      error(result.message);
      process.exit(1);
    }
  }

  // 创建测试配置
  createTestConfig() {
    const vitestConfig = `import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})`;

    fs.writeFileSync('vitest.config.ts', vitestConfig);
    success('测试配置创建完成');
  }

  // 显示帮助
  help() {
    log('cyan', '📖 NovelBox Spec-Kit 使用帮助');
    console.log('');
    console.log('用法: node spec-kit.js [命令]');
    console.log('');
    console.log('命令:');
    console.log('  init        初始化Spec-Kit开发环境');
    console.log('  validate    验证项目规范');
    console.log('  test        运行测试用例');
    console.log('  help        显示帮助信息');
    console.log('');
    console.log('示例:');
    console.log('  node scripts/spec-kit.js init');
    console.log('  node scripts/spec-kit.js validate');
    console.log('');
  }
}

// 主程序
function main() {
  const command = process.argv[2];
  const specKit = new SpecKit();

  switch (command) {
    case 'init':
      specKit.init();
      specKit.createTestConfig();
      break;
    case 'validate':
      specKit.validate();
      break;
    case 'test':
      specKit.test();
      break;
    case 'help':
    case '--help':
    case '-h':
      specKit.help();
      break;
    default:
      if (!command) {
        specKit.help();
      } else {
        error(`未知命令: ${command}`);
        specKit.help();
        process.exit(1);
      }
  }
}

if (require.main === module) {
  main();
}

module.exports = SpecKit;