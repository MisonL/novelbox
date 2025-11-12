#!/bin/bash

# 项目健康检查脚本
echo "🔍 开始项目健康检查..."

# 检查依赖安装
echo "📦 检查依赖..."
if ! pnpm install --frozen-lockfile; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 检查 TypeScript 类型
echo "🔍 检查 TypeScript 类型..."
if ! npx vue-tsc --noEmit; then
    echo "⚠️  TypeScript 类型检查发现警告"
fi

# 检查 ESLint
echo "🧹 检查代码规范..."
if ! npx eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --max-warnings 0; then
    echo "⚠️  ESLint 发现问题，但不影响构建"
fi

# 检查构建
echo "🔨 测试构建..."
if ! npx vue-tsc && npx vite build; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 项目健康检查完成！"
echo "💡 建议："
echo "   - 继续修复剩余的 ESLint 警告"
echo "   - 逐步替换代码中的 any 类型"
echo "   - 考虑使用新的 logger.ts 替换 console 语句"