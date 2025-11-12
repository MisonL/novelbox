#!/bin/bash

echo "🧪 测试NovelBox应用是否能正常启动..."
echo "=================================="
echo ""

# 检查应用是否存在
if [ ! -d "release/mac/NovelBox.app" ]; then
    echo "❌ 应用不存在，构建可能失败"
    exit 1
fi

echo "✅ 应用文件存在: release/mac/NovelBox.app"
echo ""

# 显示应用信息
echo "📊 应用大小:"
du -sh release/mac/NovelBox.app
echo ""

echo "📁 应用结构:"
ls -la release/mac/NovelBox.app/Contents/
echo ""

echo "🗂️  资源文件:"
ls -la release/mac/NovelBox.app/Contents/Resources/
echo ""

echo "💻 主程序:"
ls -la release/mac/NovelBox.app/Contents/MacOS/
echo ""

echo "📋 ASAR内容预览:"
if command -v npx &> /dev/null; then
    echo "检查ASAR中的index.html..."
    npx asar list release/mac/NovelBox.app/Contents/Resources/app.asar | head -20
else
    echo "npx不可用，跳过ASAR检查"
fi
echo ""

echo "🎯 测试完成！"
echo ""
echo "如需手动测试："
echo "1. 双击运行: open release/mac/NovelBox.app"
echo "2. 或在终端运行: ./release/mac/NovelBox.app/Contents/MacOS/NovelBox"
echo ""
echo "如果应用启动后窗口仍然空白，错误信息可能是："
echo "- 'Failed to resolve module specifier net'"
echo "- 这说明模块解析问题仍然存在，需要进一步调试"
