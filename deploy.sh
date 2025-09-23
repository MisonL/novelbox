#!/bin/bash

# NovelBox Docker 部署脚本
# 用于简化重新部署操作

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否运行
check_docker() {
    print_info "检查 Docker 服务状态..."
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker 服务未运行或当前用户没有权限访问 Docker"
        print_info "请尝试运行: sudo systemctl start docker"
        exit 1
    fi
    print_success "Docker 服务正常运行"
}

# 停止并删除现有容器
stop_container() {
    print_info "停止并删除现有容器..."
    
    # 检查是否存在名为 novelbox-container 的容器
    if docker ps -q -f name=novelbox-container | grep -q .; then
        print_info "停止容器..."
        docker stop novelbox-container >/dev/null 2>&1 || true
        print_success "容器已停止"
    else
        print_warning "未找到运行中的容器"
    fi
    
    # 检查是否存在名为 novelbox-container 的容器（包括已停止的）
    if docker ps -aq -f name=novelbox-container | grep -q .; then
        print_info "删除容器..."
        docker rm novelbox-container >/dev/null 2>&1 || true
        print_success "容器已删除"
    else
        print_warning "未找到容器"
    fi
}

# 构建 Docker 镜像
build_image() {
    print_info "开始构建 Docker 镜像..."
    
    # 首先尝试使用 BuildKit 构建
    print_info "尝试使用 BuildKit 构建..."
    export DOCKER_BUILDKIT=1
    
    # 检查 buildx 是否可用
    if ! docker buildx version >/dev/null 2>&1; then
        print_warning "Docker Buildx 不可用，回退到传统构建方式..."
        export DOCKER_BUILDKIT=0
        if docker build -f docker/Dockerfile.prod -t novelbox-web .; then
            print_success "Docker 镜像构建成功（使用传统构建器）"
            return 0
        else
            print_error "Docker 镜像构建失败"
            return 1
        fi
    fi
    
    # 使用 buildx 构建
    if docker buildx build -f docker/Dockerfile.prod -t novelbox-web . --load 2>buildkit_error.log; then
        print_success "Docker 镜像构建成功（使用 BuildKit）"
        # 清理错误日志文件
        rm -f buildkit_error.log
        return 0
    fi
    
    # 如果 BuildKit 构建失败，显示错误信息并回退到传统构建方式
    print_warning "BuildKit 构建失败，回退到传统构建方式..."
    if [ -f buildkit_error.log ] && [ -s buildkit_error.log ]; then
        print_warning "BuildKit 错误信息:"
        cat buildkit_error.log
        rm -f buildkit_error.log
    fi
    
    export DOCKER_BUILDKIT=0
    
    if docker build -f docker/Dockerfile.prod -t novelbox-web .; then
        print_success "Docker 镜像构建成功（使用传统构建器）"
        return 0
    else
        print_error "Docker 镜像构建失败"
        return 1
    fi
}

# 运行新容器
run_container() {
    print_info "启动新容器..."
    
    # 检查端口 8080 是否被占用
    if docker ps -a --format "table {{.Ports}}" | grep -q ":8080->"; then
        print_warning "端口 8080 已被占用，使用端口 8081"
        PORT=8081
    else
        PORT=8080
    fi
    
    if docker run -d -p ${PORT}:80 --name novelbox-container novelbox-web; then
        print_success "容器启动成功，使用端口 ${PORT}"
        return 0
    else
        print_error "容器启动失败"
        return 1
    fi
}

# 显示容器状态
show_status() {
    print_info "容器状态:"
    docker ps -f name=novelbox-container
    
    # 获取容器使用的端口
    if docker ps -q -f name=novelbox-container | grep -q .; then
        PORT=$(docker port novelbox-container 80 2>/dev/null | cut -d: -f2)
        
        echo ""
        print_info "访问地址:"
        echo "  本地访问: http://localhost:${PORT}"
        # 注意：hostname -I 在 macOS 上可能不可用
        if command -v hostname >/dev/null 2>&1 && hostname | grep -q "Darwin"; then
            # macOS 系统
            echo "  网络访问: http://$(ipconfig getifaddr en0):${PORT}"
        else
            # Linux 系统
            echo "  网络访问: http://$(hostname -I 2>/dev/null | awk '{print $1}'):${PORT}"
        fi
        
        echo ""
        print_info "常用命令:"
        echo "  查看日志: docker logs novelbox-container"
        echo "  停止容器: docker stop novelbox-container"
        echo "  进入容器: docker exec -it novelbox-container sh"
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "      NovelBox Docker 部署脚本"
    echo "=========================================="
    echo ""
    
    check_docker
    stop_container
    if build_image; then
        if run_container; then
            show_status
            echo ""
            print_success "部署完成!"
        else
            print_error "容器启动失败，部署未完成"
            exit 1
        fi
    else
        print_error "镜像构建失败，部署未完成"
        exit 1
    fi
}

# 执行主函数
main "$@"