#!/bin/bash

# NovelBox 跨平台编译脚本 - 交互式菜单
# NovelBox Cross-platform Build Script - Interactive Menu

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的文本
print_color() {
    echo -e "${1}${2}${NC}"
}

# 打印标题
print_header() {
    echo ""
    print_color $CYAN "╔══════════════════════════════════════════════════════════════╗"
    print_color $CYAN "║                    NovelBox 编译系统                        ║"
    print_color $CYAN "║              Cross-platform Build System                    ║"
    print_color $CYAN "╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

# 检查依赖
check_dependencies() {
    print_color $BLUE "📋 检查系统依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_color $RED "❌ Node.js 未安装"
        exit 1
    fi
    
    # 检查pnpm
    if ! command -v pnpm &> /dev/null; then
        print_color $RED "❌ pnpm 未安装"
        print_color $YELLOW "请运行: npm install -g pnpm"
        exit 1
    fi
    
    # 检查Docker（可选）
    if command -v docker &> /dev/null; then
        print_color $GREEN "✅ Docker 已安装"
    else
        print_color $YELLOW "⚠️  Docker 未安装（可选）"
    fi
    
    print_color $GREEN "✅ 依赖检查通过"
    echo ""
}

# 显示系统信息
show_system_info() {
    print_color $PURPLE "📊 系统信息："
    echo "操作系统: $(uname -s)"
    echo "架构: $(uname -m)"
    echo "Node.js版本: $(node --version)"
    echo "pnpm版本: $(pnpm --version)"
    echo ""
}

# 显示当前编译状态
show_build_status() {
    print_color $BLUE "📁 当前编译状态："
    
    local supported_platforms=()
    local skipped_platforms=()
    
    # 检查各平台支持情况
    if [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        supported_platforms+=("Windows")
    fi
    
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        supported_platforms+=("Linux")
    fi
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        supported_platforms+=("macOS")
    else
        skipped_platforms+=("macOS")
    fi
    
    # 显示文件状态
    if [ -d "release/NovelBox-win32-x64" ]; then
        print_color $GREEN "✅ Windows版本已编译"
    elif [[ " ${supported_platforms[@]} " =~ " Windows " ]]; then
        print_color $YELLOW "⏳ Windows版本待编译"
    else
        print_color $RED "❌ Windows版本不支持"
    fi
    
    if [ -d "release/NovelBox-linux-x64" ]; then
        print_color $GREEN "✅ Linux版本已编译"
    elif [[ " ${supported_platforms[@]} " =~ " Linux " ]]; then
        print_color $YELLOW "⏳ Linux版本待编译"
    else
        print_color $RED "❌ Linux版本不支持"
    fi
    
    if [ -d "release/NovelBox-darwin-x64" ]; then
        print_color $GREEN "✅ macOS版本已编译"
    elif [[ " ${supported_platforms[@]} " =~ " macOS " ]]; then
        print_color $YELLOW "⏳ macOS版本待编译"
    else
        print_color $RED "❌ macOS版本不支持 (需macOS系统)"
    fi
    
    # 显示支持的平台
    if [[ ${#supported_platforms[@]} -gt 0 ]]; then
        print_color $GREEN "✅ 当前系统支持: ${supported_platforms[*]}"
    fi
    
    if [[ ${#skipped_platforms[@]} -gt 0 ]]; then
        print_color $YELLOW "⚠️  将跳过: ${skipped_platforms[*]}"
    fi
    
    echo ""
}

# 检查系统是否支持特定平台
is_platform_supported() {
    local platform=$1
    case $platform in
        "win")
            # Windows在Linux上需要Wine，但可生成可执行文件
            return 0
            ;;
        "mac")
            # macOS只能在macOS上编译
            [[ "$OSTYPE" == "darwin"* ]]
            return $?
            ;;
        "linux")
            # Linux可在任何系统上编译
            return 0
            ;;
    esac
}

# 检查Wine环境（用于Windows构建）
check_wine_environment() {
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        if ! command -v wine &> /dev/null; then
            print_color $YELLOW "⚠️  Wine未安装，将跳过Windows安装程序创建"
            print_color $YELLOW "   仅生成可执行文件目录"
            return 1
        else
            print_color $GREEN "✅ Wine已安装，支持完整Windows构建"
            return 0
        fi
    fi
    return 0
}

# 检查macOS构建环境
check_macos_environment() {
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_color $YELLOW "⚠️  当前系统不支持macOS版本编译"
        print_color $YELLOW "   当前系统: $OSTYPE"
        print_color $YELLOW "   支持系统: macOS (darwin*)"
        return 1
    fi
    
    # 检查Xcode命令行工具
    if ! command -v xcode-select &> /dev/null; then
        print_color $YELLOW "⚠️  未检测到Xcode命令行工具"
        print_color $YELLOW "   macOS构建需要安装Xcode命令行工具"
        return 1
    fi
    
    return 0
}

# 优雅地构建Windows版本
build_windows() {
    print_color $CYAN "🪟 开始构建Windows版本..."
    
    # 在非Windows系统上始终使用目录模式
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        print_color $YELLOW "⚠️  在非Windows系统上构建Windows版本"
        print_color $BLUE "📁 仅生成可执行文件目录（跳过打包）"
        
        pnpm run electron:build:win
    else
        # Windows系统上完整构建
        print_color $GREEN "✅ Windows系统，支持完整构建"
        CSC_IDENTITY_AUTO_DISCOVERY=false pnpm run electron:build:win
    fi
    
    if [ -d "release/NovelBox-win32-x64" ]; then
        print_color $GREEN "✅ Windows版本构建完成！"
        print_color $GREEN "   文件位置: release/NovelBox-win32-x64/NovelBox.exe"
    else
        print_color $RED "❌ Windows版本构建失败"
    fi
}

# 优雅地构建Linux版本
build_linux() {
    print_color $CYAN "🐧 开始构建Linux版本..."
    
    pnpm run electron:build:linux
    
    if [ -d "release/NovelBox-linux-x64" ]; then
        print_color $GREEN "✅ Linux版本构建完成！"
        print_color $GREEN "   文件位置: release/NovelBox-linux-x64/NovelBox"
    else
        print_color $RED "❌ Linux版本构建失败"
    fi
}

# 优雅地构建macOS版本
build_macos() {
    print_color $CYAN "🍎 开始构建macOS版本..."
    
    # 检查macOS构建环境
    if ! check_macos_environment; then
        print_color $YELLOW "⚠️  跳过macOS版本构建"
        return 0
    fi
    
    print_color $GREEN "✅ macOS构建环境检查通过"
    pnpm run electron:build:mac
    
    if [ -d "release/NovelBox-darwin-x64" ]; then
        print_color $GREEN "✅ macOS版本构建完成！"
        print_color $GREEN "   文件位置: release/NovelBox-darwin-x64/NovelBox.app"
    else
        print_color $RED "❌ macOS版本构建失败"
    fi
}

# 清理构建目录
clean_build() {
    print_color $YELLOW "🧹 清理构建目录..."
    rm -rf release/
    rm -rf dist/
    print_color $GREEN "✅ 清理完成"
}

# 显示帮助
show_help() {
    echo ""
    print_color $CYAN "📖 使用帮助："
    echo ""
    echo "直接运行脚本进入交互式菜单："
    echo "  ./build.sh"
    echo ""
    echo "命令行参数："
    echo "  ./build.sh --windows    # 仅构建Windows版本"
    echo "  ./build.sh --macos      # 仅构建macOS版本"
    echo "  ./build.sh --linux      # 仅构建Linux版本"
    echo "  ./build.sh --all        # 构建所有平台版本"
    echo "  ./build.sh --clean      # 清理构建目录"
    echo "  ./build.sh --help       # 显示帮助信息"
    echo ""
}

# 主菜单
main_menu() {
    while true; do
        print_header
        check_dependencies
        show_system_info
        show_build_status
        
        print_color $PURPLE "🎯 请选择构建选项："
    echo ""
    echo "1) 🪟   构建Windows版本"
    echo "2) 🐧  构建Linux版本"
    echo "3) 🍎  构建macOS版本"
    echo "4) 🌐  构建所有平台"
    echo "5) 🧹  清理构建目录"
    echo "6) ❌  退出"
    echo ""
        
        read -p "请输入选项 [1-6]: " choice
        
        case $choice in
            1)
                build_windows
                ;;
            2)
                build_linux
                ;;
            3)
                build_macos
                ;;
            4)
                print_color $CYAN "🌐 开始构建所有平台..."
                build_windows
                build_linux
                build_macos
                ;;
            5)
                clean_build
                ;;
            6)
                print_color $GREEN "👋 感谢使用！再见！"
                exit 0
                ;;
            *)
                print_color $RED "❌ 无效选项，请重新选择"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

# 处理命令行参数
if [[ $# -eq 0 ]]; then
    # 无参数，启动交互式菜单
    main_menu
else
    # 处理命令行参数
    case "$1" in
        -w|--windows)
            check_dependencies
            build_windows
            ;;
        -m|--macos)
            check_dependencies
            build_macos
            ;;
        -l|--linux)
            check_dependencies
            build_linux
            ;;
        -a|--all)
            check_dependencies
            build_windows
            build_linux
            build_macos
            ;;
        -c|--clean)
            clean_build
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_color $RED "❌ 未知参数: $1"
            show_help
            exit 1
            ;;
    esac
fi