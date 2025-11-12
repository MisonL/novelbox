#!/bin/bash

# NovelBox 简化构建脚本
# 轻量级、现代化的构建工具

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 帮助信息
show_help() {
    cat << EOF
NovelBox 构建脚本 v1.0

用法:
    ./build.sh [命令] [选项]

命令:
    dev                 启动开发服务器 (前端)
    electron:dev        启动Electron开发模式
    build               构建前端应用
    electron:build      构建Electron应用 (当前平台)
    electron:build-all  构建所有平台
    clean               清理构建输出
    web:build           构建Web版本
    help                显示此帮助信息

示例:
    ./build.sh build              # 构建前端
    ./build.sh electron:build     # 构建Electron应用
    ./build.sh clean              # 清理输出

EOF
}

# 执行npm script
run_npm() {
    echo -e "${BLUE}执行: npm run $1${NC}"
    npm run "$1"
}

# 主函数
main() {
    case "${1:-help}" in
        "dev"|"dev:*")
            run_npm "dev"
            ;;

        "electron:dev")
            run_npm "electron:dev"
            ;;

        "build")
            run_npm "build"
            ;;

        "electron:build")
            run_npm "electron:build"
            ;;

        "electron:build-all")
            echo -e "${YELLOW}构建所有平台...${NC}"
            echo -e "${YELLOW}注意: 这可能需要较长时间${NC}"
            echo ""
            read -p "继续? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                run_npm "electron:build:mac-arm64" || true
                run_npm "electron:build:win-arm64" || true
                run_npm "electron:build:linux-arm64" || true
                echo -e "${GREEN}✅ 所有平台构建完成${NC}"
            else
                echo "已取消"
            fi
            ;;

        "clean")
            run_npm "clean"
            echo -e "${GREEN}✅ 清理完成${NC}"
            ;;

        "web:build")
            run_npm "web:build"
            ;;

        "help"|"-h"|"--help")
            show_help
            ;;

        *)
            echo -e "${RED}❌ 未知命令: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
