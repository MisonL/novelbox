#!/bin/bash

# NovelBox 快速构建脚本
# 一键构建Electron应用

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 NovelBox 快速构建${NC}"
echo "=================================="
echo ""

# 清理旧构建
echo -e "${YELLOW}1. 清理旧构建...${NC}"
rm -rf dist/* release/mac/* 2>/dev/null || true

# 构建应用
echo -e "${YELLOW}2. 构建Electron应用...${NC}"
npm run electron:build

echo ""
echo -e "${GREEN}✅ 构建完成！${NC}"
echo ""
echo "应用位置: release/mac/NovelBox.app"
echo ""
