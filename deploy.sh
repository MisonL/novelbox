#!/bin/bash

# NovelBox Docker 部署脚本
# 简化Web版本部署

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 帮助信息
show_help() {
    cat << EOF
NovelBox Docker 部署脚本 v1.0

用法:
    ./deploy.sh [命令]

命令:
    web:dev       启动Web开发环境 (Docker)
    web:build     构建Web生产镜像
    stop         停止并删除容器
    clean        清理Docker资源
    help         显示此帮助信息

示例:
    ./deploy.sh web:dev     # 启动开发环境
    ./deploy.sh web:build   # 构建生产镜像

EOF
}

# 检查Docker
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker服务未运行${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker服务正常${NC}"
}

# 停止容器
stop_container() {
    echo -e "${YELLOW}停止容器...${NC}"
    docker stop novelbox-container >/dev/null 2>&1 || true
    docker rm novelbox-container >/dev/null 2>&1 || true
    echo -e "${GREEN}✅ 容器已停止${NC}"
}

# Web开发环境
web_dev() {
    echo -e "${BLUE}启动Web开发环境...${NC}"
    check_docker
    stop_container
    docker run -d -p 5173:80 --name novelbox-container novelbox-web 2>/dev/null || {
        echo -e "${YELLOW}容器已存在或端口被占用${NC}"
        docker start novelbox-container 2>/dev/null || true
    }
    echo -e "${GREEN}✅ Web应用已启动${NC}"
    echo -e "${BLUE}访问地址: http://localhost:5173${NC}"
}

# 构建Web镜像
web_build() {
    echo -e "${BLUE}构建Web镜像...${NC}"
    check_docker
    export DOCKER_BUILDKIT=1
    docker build -f docker/Dockerfile.prod -t novelbox-web . 2>/dev/null || {
        export DOCKER_BUILDKIT=0
        docker build -f docker/Dockerfile.prod -t novelbox-web .
    }
    echo -e "${GREEN}✅ 镜像构建完成${NC}"
}

# 清理资源
clean_docker() {
    echo -e "${YELLOW}清理Docker资源...${NC}"
    stop_container
    docker rmi novelbox-web >/dev/null 2>&1 || true
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 主函数
main() {
    case "${1:-help}" in
        "web:dev")
            web_dev
            ;;
        "web:build")
            web_build
            ;;
        "stop")
            stop_container
            ;;
        "clean")
            clean_docker
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