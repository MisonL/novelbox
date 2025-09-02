#!/bin/bash

# NovelBox 本地构建脚本
# 用于解决Docker构建时的网络问题

set -e

echo "=========================================="
echo "   NovelBox 本地构建脚本"
echo "=========================================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

# 检查pnpm是否安装
if ! command -v pnpm &> /dev/null; then
    echo "错误: pnpm 未安装"
    exit 1
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

echo "步骤 1: 本地安装依赖..."
pnpm install

echo ""
echo "步骤 2: 本地构建应用..."
pnpm web:build

echo ""
echo "步骤 4: 构建Docker镜像..."
sudo docker build -f docker/Dockerfile.local -t novelbox-web .

echo ""
echo "步骤 5: 停止并删除现有容器..."
sudo docker stop novelbox-container 2>/dev/null || true
sudo docker rm novelbox-container 2>/dev/null || true

echo ""
echo "步骤 6: 启动新容器..."
sudo docker run -d -p 8080:80 --name novelbox-container novelbox-web

echo ""
echo "步骤 7: 显示容器状态..."
sudo docker ps -f name=novelbox-container

echo ""
echo "=========================================="
echo "   构建完成!"
echo "=========================================="
echo ""
echo "访问地址: http://localhost:8080"
echo ""
echo "常用命令:"
echo "  查看日志: sudo docker logs novelbox-container"
echo "  停止容器: sudo docker stop novelbox-container"
echo "  进入容器: sudo docker exec -it novelbox-container sh"