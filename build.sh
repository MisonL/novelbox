#!/bin/bash

# NovelBox 交互式构建脚本
# 完善的跨平台构建工具，支持交互式菜单

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

# 样式定义
BOLD='\033[1m'
DIM='\033[2m'
UNDERLINE='\033[4m'

# 全局变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BUILD_LOG="$PROJECT_ROOT/build.log"
ELECTRON_VERSION="38.1.2"
APP_VERSION="1.1.1"

# 打印彩色文本
print_color() {
    echo -e "${1}${2}${NC}"
}

# 打印标题
print_header() {
    echo ""
    print_color $CYAN "╔══════════════════════════════════════════════════════════════╗"
    print_color $CYAN "║                    ${BOLD}NovelBox 构建系统${NC}                    ║"
    print_color $CYAN "║              ${DIM}交互式跨平台构建工具 v$APP_VERSION${NC}              ║"
    print_color $CYAN "╚══════════════════════════════════════════════════════════════╝"
    echo ""
}

# 打印信息
print_info() {
    print_color $BLUE "ℹ️  $1"
}

# 打印成功
print_success() {
    print_color $GREEN "✅ $1"
}

# 打印警告
print_warning() {
    print_color $YELLOW "⚠️  $1"
}

# 打印错误
print_error() {
    print_color $RED "❌ $1"
}

# 打印进度
print_progress() {
    print_color $MAGENTA "🔄 $1"
}

# 记录日志
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$BUILD_LOG"
}

# 检查依赖
check_dependencies() {
    print_info "检查系统依赖..."
    log_message "开始检查依赖"
    
    local missing_deps=()
    
    # 检查Node.js
    if ! command -v node &>/dev/null; then
        missing_deps+=("Node.js")
    else
        local node_version=$(node --version)
        print_success "Node.js: $node_version"
        log_message "Node.js版本: $node_version"
    fi
    
    # 检查pnpm
    if ! command -v pnpm &>/dev/null; then
        missing_deps+=("pnpm")
    else
        local pnpm_version=$(pnpm --version)
        print_success "pnpm: $pnpm_version"
        log_message "pnpm版本: $pnpm_version"
    fi
    
    # 检查系统类型
    case "$OSTYPE" in
        darwin*)
            print_success "macOS系统检测通过"
            log_message "系统类型: macOS"
            ;;
        linux*)
            print_success "Linux系统检测通过"
            log_message "系统类型: Linux"
            ;;
        msys*|mingw*|cygwin*)
            print_success "Windows系统检测通过"
            log_message "系统类型: Windows"
            ;;
        *)
            print_warning "未知系统类型: $OSTYPE"
            log_message "未知系统类型: $OSTYPE"
            ;;
    esac
    
    # 检查Electron
    if ! npx electron --version &>/dev/null; then
        missing_deps+=("Electron")
    else
        local electron_version=$(npx electron --version)
        print_success "Electron: $electron_version"
        log_message "Electron版本: $electron_version"
    fi
    
    # 检查构建工具
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "缺少依赖: ${missing_deps[*]}"
        print_info "请安装缺失的依赖后重试"
        log_message "缺少依赖: ${missing_deps[*]}"
        return 1
    fi
    
    print_success "所有依赖检查通过"
    log_message "依赖检查完成"
    return 0
}

# 清理构建目录
clean_build() {
    print_progress "清理构建目录..."
    log_message "开始清理构建目录"
    
    local clean_dirs=(
        "release/darwin-x64"
        "release/darwin-arm64"
        "release/win32-x64"
        "release/win32-arm64"
        "release/linux-x64"
        "release/linux-arm64"
        "release/linux-armv7l"
        "dist"
        "dist-web"
    )
    
    for dir in "${clean_dirs[@]}"; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"
            print_info "已删除: $dir"
            log_message "删除目录: $dir"
        fi
    done
    
    print_success "构建目录清理完成"
    log_message "清理构建目录完成"
}

# 构建macOS应用
build_macos_app() {
    local arch="${1:-x64}"
    local app_name="NovelBox"
    local app_dir="release/darwin-$arch"
    local app_path="$app_dir/$app_name.app"
    
    print_progress "构建macOS $arch 应用..."
    log_message "开始构建macOS $arch 应用"
    
    # 检查前端构建
    if [ ! -d "dist" ]; then
        print_error "前端构建文件不存在，请先运行: pnpm run build"
        log_message "错误: 缺少前端构建文件"
        return 1
    fi
    
    # 清理并创建目录结构
    rm -rf "$app_dir"
    mkdir -p "$app_path/Contents/MacOS"
    mkdir -p "$app_path/Contents/Resources"
    mkdir -p "$app_path/Contents/Frameworks"
    
    print_info "复制前端构建文件..."
    cp -r dist/* "$app_path/Contents/Resources/"
    
    print_info "复制Electron运行时..."
    local electron_path="node_modules/.pnpm/electron@$ELECTRON_VERSION/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron"
    local electron_framework_path="node_modules/.pnpm/electron@$ELECTRON_VERSION/node_modules/electron/dist/Electron.app/Contents/Frameworks"
    local electron_resources_path="node_modules/.pnpm/electron@$ELECTRON_VERSION/node_modules/electron/dist/Electron.app/Contents/Resources"
    
    if [ ! -f "$electron_path" ]; then
        print_error "Electron二进制文件不存在"
        log_message "错误: Electron二进制文件不存在"
        return 1
    fi
    
    cp "$electron_path" "$app_path/Contents/MacOS/$app_name"
    chmod +x "$app_path/Contents/MacOS/$app_name"
    
    # 复制框架和资源
    [ -d "$electron_framework_path" ] && cp -r "$electron_framework_path"/* "$app_path/Contents/Frameworks/"
    [ -d "$electron_resources_path" ] && find "$electron_resources_path" -maxdepth 1 -mindepth 1 ! -name "default_app.asar" -exec cp -r {} "$app_path/Contents/Resources/" \;
    
    # 创建配置文件
    create_macos_config_files "$app_path"
    
    # 显示应用大小
    if command -v du &>/dev/null; then
        local size=$(du -sh "$app_path" 2>/dev/null | cut -f1)
        print_success "macOS $arch 应用构建完成！大小: $size"
        log_message "macOS $arch 应用构建完成，大小: $size"
    else
        print_success "macOS $arch 应用构建完成！"
        log_message "macOS $arch 应用构建完成"
    fi
    
    return 0
}

# 构建Windows应用
build_windows_app() {
    local arch="${1:-x64}"
    local app_name="NovelBox"
    local app_dir="release/win32-$arch"
    local app_path="$app_dir/$app_name.exe"
    
    print_progress "构建Windows $arch 应用..."
    log_message "开始构建Windows $arch 应用"
    
    # 检查前端构建
    if [ ! -d "dist" ]; then
        print_error "前端构建文件不存在，请先运行: pnpm run build"
        log_message "错误: 缺少前端构建文件"
        return 1
    fi
    
    # 清理并创建目录结构
    rm -rf "$app_dir"
    mkdir -p "$app_dir/resources"
    
    print_info "复制前端构建文件..."
    cp -r dist/* "$app_dir/resources/"
    
    print_info "复制Electron运行时..."
    local electron_path="node_modules/.pnpm/electron@$ELECTRON_VERSION/node_modules/electron/dist/electron.exe"
    
    if [ ! -f "$electron_path" ]; then
        print_error "Windows Electron二进制文件不存在，尝试使用electron-packager"
        log_message "错误: Windows Electron二进制文件不存在"
        
        # 尝试使用electron-packager
        if command -v electron-packager &>/dev/null; then
            print_info "使用electron-packager构建Windows应用..."
            electron-packager . NovelBox --platform=win32 --arch=$arch --out=release/ --overwrite --prune=false
            print_success "Windows $arch 应用构建完成（electron-packager）"
            log_message "Windows $arch 应用构建完成（electron-packager）"
            return 0
        else
            print_error "electron-packager未安装，无法构建Windows应用"
            log_message "错误: electron-packager未安装"
            return 1
        fi
    fi
    
    # 复制Electron可执行文件
    cp "$electron_path" "$app_path"
    
    # 创建Windows配置文件
    create_windows_config_files "$app_dir"
    
    # 显示应用大小
    if command -v du &>/dev/null; then
        local size=$(du -sh "$app_dir" 2>/dev/null | cut -f1)
        print_success "Windows $arch 应用构建完成！大小: $size"
        log_message "Windows $arch 应用构建完成，大小: $size"
    else
        print_success "Windows $arch 应用构建完成！"
        log_message "Windows $arch 应用构建完成"
    fi
    
    return 0
}

# 构建Linux应用
build_linux_app() {
    local arch="${1:-x64}"
    local app_name="NovelBox"
    local app_dir="release/linux-$arch"
    local app_path="$app_dir/$app_name"
    
    print_progress "构建Linux $arch 应用..."
    log_message "开始构建Linux $arch 应用"
    
    # 检查前端构建
    if [ ! -d "dist" ]; then
        print_error "前端构建文件不存在，请先运行: pnpm run build"
        log_message "错误: 缺少前端构建文件"
        return 1
    fi
    
    # 清理并创建目录结构
    rm -rf "$app_dir"
    mkdir -p "$app_dir/resources"
    
    print_info "复制前端构建文件..."
    cp -r dist/* "$app_dir/resources/"
    
    print_info "复制Electron运行时..."
    local electron_path="node_modules/.pnpm/electron@$ELECTRON_VERSION/node_modules/electron/dist/electron"
    
    if [ ! -f "$electron_path" ]; then
        print_error "Linux Electron二进制文件不存在"
        log_message "错误: Linux Electron二进制文件不存在"
        return 1
    fi
    
    # 复制Electron可执行文件
    cp "$electron_path" "$app_path"
    chmod +x "$app_path"
    
    # 创建Linux配置文件
    create_linux_config_files "$app_dir"
    
    # 显示应用大小
    if command -v du &>/dev/null; then
        local size=$(du -sh "$app_dir" 2>/dev/null | cut -f1)
        print_success "Linux $arch 应用构建完成！大小: $size"
        log_message "Linux $arch 应用构建完成，大小: $size"
    else
        print_success "Linux $arch 应用构建完成！"
        log_message "Linux $arch 应用构建完成"
    fi
    
    return 0
}

# 创建macOS配置文件
create_macos_config_files() {
    local app_path="$1"
    
    print_info "创建macOS配置文件..."
    
    # 创建Info.plist
    cat > "$app_path/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>NovelBox</string>
    <key>CFBundleExecutable</key>
    <string>NovelBox</string>
    <key>CFBundleIdentifier</key>
    <string>app.novelbox</string>
    <key>CFBundleName</key>
    <string>NovelBox</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>$APP_VERSION</string>
    <key>CFBundleVersion</key>
    <string>$APP_VERSION</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2024 NovelBox Team. All rights reserved.</string>
</dict>
</plist>
EOF
    
    # 创建package.json
    cat > "$app_path/Contents/Resources/package.json" << EOF
{
  "name": "novelbox",
  "version": "$APP_VERSION",
  "description": "NovelBox - AI增强版小说创作工具",
  "main": "main.js",
  "author": "NovelBox Team",
  "license": "GPL-3.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/MisonL/novelbox.git"
  },
  "homepage": "https://github.com/MisonL/novelbox",
  "keywords": [
    "novel",
    "writing",
    "ai",
    "electron",
    "vue"
  ]
}
EOF
    
    # 创建main.js
    cat > "$app_path/Contents/Resources/main.js" << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

// 安全日志函数，防止EPIPE错误
function safeLog(...args) {
    try {
        console.log(...args);
    } catch (error) {
        // 忽略控制台错误
    }
}

function createWindow() {
    safeLog('🚀 创建主窗口...');
    
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        show: false,
        titleBarStyle: 'default',
        center: true,
        resizable: true,
        movable: true,
        minimizable: true,
        maximizable: true,
        closable: true,
        focusable: true,
        alwaysOnTop: false,
        fullscreenable: true,
        skipTaskbar: false,
        frame: true,
        transparent: false,
        backgroundColor: '#ffffff'
    });

    // 加载应用界面
    const indexPath = path.join(__dirname, 'index.html');
    safeLog('📁 加载文件:', indexPath);
    
    mainWindow.loadFile(indexPath).then(() => {
        safeLog('✅ 主界面加载成功');
        mainWindow.show();
    }).catch(err => {
        safeLog('❌ 加载失败:', err);
    });

    // 窗口事件
    mainWindow.on('closed', () => {
        safeLog('🏠 主窗口已关闭');
    });

    mainWindow.on('ready-to-show', () => {
        safeLog('🎯 窗口准备显示');
    });

    // 开发工具（生产环境可禁用）
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

// 应用事件处理
app.whenReady().then(() => {
    safeLog('🍎 应用准备就绪');
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    safeLog('🚪 所有窗口已关闭');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    safeLog('👋 应用即将退出');
});

// 错误处理
process.on('uncaughtException', (error) => {
    safeLog('❌ 未捕获异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    safeLog('❌ 未处理的Promise拒绝:', reason);
});

// 退出时清理
process.on('exit', (code) => {
    safeLog('🚪 进程退出，代码:', code);
});
EOF
}

# 创建Windows配置文件
create_windows_config_files() {
    local app_dir="$1"
    
    print_info "创建Windows配置文件..."
    
    # 创建package.json
    cat > "$app_dir/resources/package.json" << EOF
{
  "name": "novelbox",
  "version": "$APP_VERSION",
  "description": "NovelBox - AI增强版小说创作工具",
  "main": "main.js",
  "author": "NovelBox Team",
  "license": "GPL-3.0"
}
EOF
    
    # 创建main.js
    cat > "$app_dir/resources/main.js" << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        show: false,
        center: true
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html')).then(() => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        app.quit();
    });
}

app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
EOF
}

# 创建Linux配置文件
create_linux_config_files() {
    local app_dir="$1"
    
    print_info "创建Linux配置文件..."
    
    # 创建package.json
    cat > "$app_dir/resources/package.json" << EOF
{
  "name": "novelbox",
  "version": "$APP_VERSION",
  "description": "NovelBox - AI增强版小说创作工具",
  "main": "main.js",
  "author": "NovelBox Team",
  "license": "GPL-3.0"
}
EOF
    
    # 创建main.js
    cat > "$app_dir/resources/main.js" << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        show: false,
        center: true,
        icon: path.join(__dirname, 'icon-256.png')
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html')).then(() => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        app.quit();
    });
}

app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
EOF
    
    # 创建.desktop文件
    cat > "$app_dir/NovelBox.desktop" << EOF
[Desktop Entry]
Name=NovelBox
Comment=AI增强版小说创作工具
Exec=$app_dir/NovelBox
Icon=$app_dir/resources/icon-256.png
Terminal=false
Type=Application
Categories=Office;TextEditor;
EOF
}

# 验证应用
verify_app() {
    local app_path="$1"
    
    print_info "验证应用结构..."
    
    local errors=0
    
    if [ ! -f "$app_path/Contents/MacOS/NovelBox" ]; then
        print_error "可执行文件不存在"
        ((errors++))
    fi
    
    if [ ! -f "$app_path/Contents/Resources/package.json" ]; then
        print_error "package.json不存在"
        ((errors++))
    fi
    
    if [ ! -f "$app_path/Contents/Resources/index.html" ]; then
        print_error "index.html不存在"
        ((errors++))
    fi
    
    if [ ! -f "$app_path/Contents/Resources/main.js" ]; then
        print_error "main.js不存在"
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "应用结构验证通过"
        log_message "应用结构验证通过"
        return 0
    else
        print_error "应用结构验证失败，发现 $errors 个错误"
        log_message "应用结构验证失败，发现 $errors 个错误"
        return 1
    fi
}

# 测试应用
test_app() {
    local app_path="$1"
    
    print_info "测试应用启动..."
    log_message "开始测试应用启动"
    
    cd "$app_path/Contents/Resources"
    
    # 尝试运行应用
    timeout 10s npx electron . &
    local pid=$!
    
    sleep 3
    
    if ps -p $pid > /dev/null 2>&1; then
        print_success "应用成功启动 (PID: $pid)"
        log_message "应用成功启动 (PID: $pid)"
        kill $pid 2>/dev/null
        return 0
    else
        print_error "应用启动失败或超时"
        log_message "应用启动失败或超时"
        return 1
    fi
}

# 创建Windows安装程序
create_windows_installer() {
    local app_path="$1"
    local arch="$2"
    
    print_info "创建Windows安装程序..."
    log_message "创建Windows $arch 安装程序"
    
    # 创建NSIS脚本
    local nsis_script="$app_path/installer.nsi"
    
    cat > "$nsis_script" << 'EOF'
!include "MUI2.nsh"

; 基本设置
Name "NovelBox"
OutFile "NovelBox-Setup.exe"
InstallDir "$PROGRAMFILES\NovelBox"
InstallDirRegKey HKLM "Software\NovelBox" "Install_Dir"
RequestExecutionLevel admin

; 页面设置
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; 语言设置
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "SimpChinese"

; 安装部分
Section "Install"
    SetOutPath "$INSTDIR"
    File /r "*.*"
    
    ; 创建桌面快捷方式
    CreateDirectory "$SMPROGRAMS\NovelBox"
    CreateShortcut "$SMPROGRAMS\NovelBox\NovelBox.lnk" "$INSTDIR\NovelBox.exe" "" "$INSTDIR\resources\icon-256.png"
    CreateShortcut "$DESKTOP\NovelBox.lnk" "$INSTDIR\NovelBox.exe" "" "$INSTDIR\resources\icon-256.png"
    
    ; 写入注册表
    WriteRegStr HKLM SOFTWARE\NovelBox "Install_Dir" "$INSTDIR"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\NovelBox" "DisplayName" "NovelBox"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\NovelBox" "UninstallString" '"$INSTDIR\uninstall.exe"'
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\NovelBox" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\NovelBox" "NoRepair" 1
SectionEnd

; 卸载部分
Section "Uninstall"
    Delete "$INSTDIR\*.*"
    RMDir /r "$INSTDIR"
    
    Delete "$SMPROGRAMS\NovelBox\NovelBox.lnk"
    Delete "$DESKTOP\NovelBox.lnk"
    RMDir "$SMPROGRAMS\NovelBox"
    
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\NovelBox"
    DeleteRegKey HKLM SOFTWARE\NovelBox
SectionEnd
EOF
    
    # 检查NSIS是否可用
    if command -v makensis &>/dev/null; then
        print_info "使用NSIS创建安装程序..."
        cd "$app_path"
        makensis installer.nsi
        
        if [ $? -eq 0 ]; then
            print_success "Windows安装程序创建成功: $app_path/NovelBox-Setup.exe"
            log_message "Windows安装程序创建成功"
        else
            print_error "创建安装程序失败"
            log_message "错误: 创建安装程序失败"
        fi
        cd - > /dev/null
    else
        print_warning "NSIS未安装，跳过安装程序创建"
        print_info "您可以在Windows系统上手动运行: makensis installer.nsi"
        log_message "NSIS未安装，跳过安装程序创建"
    fi
}

# 创建Linux AppImage
create_linux_appimage() {
    local app_path="$1"
    local arch="$2"
    
    print_info "创建Linux AppImage..."
    log_message "创建Linux $arch AppImage"
    
    # 创建AppDir结构
    local appdir_path="${app_path}-AppDir"
    mkdir -p "$appdir_path/usr/bin"
    mkdir -p "$appdir_path/usr/share/applications"
    mkdir -p "$appdir_path/usr/share/icons/hicolor/256x256/apps"
    
    # 复制应用文件
    cp -r "$app_path"/* "$appdir_path/usr/bin/"
    
    # 创建桌面文件
    cat > "$appdir_path/usr/share/applications/novelbox.desktop" << EOF
[Desktop Entry]
Name=NovelBox
Comment=AI增强版小说创作工具
Exec=NovelBox
Icon=novelbox
Terminal=false
Type=Application
Categories=Office;TextEditor;
EOF
    
    # 复制图标
    if [ -f "$app_path/resources/icon-256.png" ]; then
        cp "$app_path/resources/icon-256.png" "$appdir_path/usr/share/icons/hicolor/256x256/apps/novelbox.png"
    fi
    
    # 创建AppRun脚本
    cat > "$appdir_path/AppRun" << 'EOF'
#!/bin/bash
HERE="$(dirname "$(readlink -f "$0")")"
export PATH="${HERE}/usr/bin/:${PATH}"
export LD_LIBRARY_PATH="${HERE}/usr/lib/:${LD_LIBRARY_PATH}"
export XDG_DATA_DIRS="${HERE}/usr/share/:${XDG_DATA_DIRS}"
cd "$HERE/usr/bin"
exec ./NovelBox "$@"
EOF
    chmod +x "$appdir_path/AppRun"
    
    # 检查appimagetool
    if command -v appimagetool &>/dev/null; then
        print_info "使用appimagetool创建AppImage..."
        appimagetool "$appdir_path" "${app_path}.AppImage"
        
        if [ $? -eq 0 ]; then
            print_success "Linux AppImage创建成功: ${app_path}.AppImage"
            log_message "Linux AppImage创建成功"
            rm -rf "$appdir_path"
        else
            print_error "创建AppImage失败"
            log_message "错误: 创建AppImage失败"
        fi
    else
        print_warning "appimagetool未安装，跳过AppImage创建"
        print_info "您可以在Linux系统上安装appimagetool后手动创建AppImage"
        log_message "appimagetool未安装，跳过AppImage创建"
    fi
}

# 交互式菜单
interactive_menu() {
    while true; do
        print_header
        echo ""
        print_info "请选择操作:"
        echo ""
        echo "  ${GREEN}1${NC}) 构建 macOS x64 应用"
        echo "  ${GREEN}2${NC}) 构建 macOS ARM64 应用"
        echo "  ${GREEN}3${NC}) 构建所有macOS版本"
        echo "  ${YELLOW}4${NC}) 清理构建目录"
        echo "  ${BLUE}5${NC}) 检查依赖"
        echo "  ${CYAN}6${NC}) 显示构建报告"
        echo "  ${WHITE}7${NC}) 查看日志"
        echo "  ${MAGENTA}8${NC}) 高级选项"
        echo "  ${RED}9${NC}) 跨平台构建菜单"
        echo "  ${RED}0${NC}) 退出"
        echo ""
        
        read -p "请选择 [0-9]: " choice
        
        case $choice in
            1)
                if check_dependencies; then
                    build_macos_app "x64"
                    verify_app "release/darwin-x64/NovelBox.app"
                    test_app "release/darwin-x64/NovelBox.app"
                fi
                ;;
            2)
                if check_dependencies; then
                    build_macos_app "arm64"
                    verify_app "release/darwin-arm64/NovelBox.app"
                    test_app "release/darwin-arm64/NovelBox.app"
                fi
                ;;
            3)
                if check_dependencies; then
                    print_info "开始构建所有macOS版本..."
                    build_macos_app "x64"
                    verify_app "release/darwin-x64/NovelBox.app"
                    test_app "release/darwin-x64/NovelBox.app"
                    
                    if [[ "$OSTYPE" == "darwin"* ]] && [[ $(uname -m) == "arm64" ]]; then
                        print_info "构建ARM64版本..."
                        build_macos_app "arm64"
                        verify_app "release/darwin-arm64/NovelBox.app"
                        test_app "release/darwin-arm64/NovelBox.app"
                    else
                        print_warning "当前系统不支持ARM64构建"
                    fi
                fi
                ;;
            4)
                clean_build
                ;;
            5)
                check_dependencies
                ;;
            6)
                show_build_report
                ;;
            7)
                if [ -f "$BUILD_LOG" ]; then
                    less "$BUILD_LOG"
                else
                    print_warning "日志文件不存在"
                fi
                ;;
            8)
                advanced_options_menu
                ;;
            9)
                cross_platform_menu
                ;;
            0)
                print_info "感谢使用NovelBox构建系统！"
                print_color $CYAN "🎉 构建愉快，再见！"
                exit 0
                ;;
            *)
                print_error "无效选择，请重新输入"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

# 高级选项菜单
advanced_options_menu() {
    while true; do
        echo ""
        print_info "高级选项:"
        echo ""
        echo "  ${GREEN}1${NC}) 自定义构建配置"
        echo "  ${GREEN}2${NC}) 构建调试版本"
        echo "  ${GREEN}3${NC}) 构建发布版本"
        echo "  ${YELLOW}4${NC}) 压缩应用包"
        echo "  ${BLUE}5${NC}) 生成校验和"
        echo "  ${CYAN}6${NC}) 批量重命名"
        echo "  ${RED}0${NC}) 返回主菜单"
        echo ""
        
        read -p "请选择 [0-6]: " choice
        
        case $choice in
            1)
                custom_build_config
                ;;
            2)
                build_debug_version
                ;;
            3)
                build_release_version
                ;;
            4)
                compress_app_package
                ;;
            5)
                generate_checksums
                ;;
            6)
                batch_rename
                ;;
            0)
                return
                ;;
            *)
                print_error "无效选择，请重新输入"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

# 快速构建模式
quick_build() {
    local platform="${1:-macos}"
    local arch="${2:-x64}"
    
    print_header
    print_info "快速构建模式: $platform $arch"
    
    if ! check_dependencies; then
        exit 1
    fi
    
    case "$platform" in
        macos)
            build_macos_app "$arch"
            verify_app "release/darwin-$arch/NovelBox.app"
            test_app "release/darwin-$arch/NovelBox.app"
            ;;
        windows)
            build_windows_app "$arch"
            verify_app "release/win32-$arch/NovelBox"
            test_app "release/win32-$arch/NovelBox"
            ;;
        linux)
            build_linux_app "$arch"
            verify_app "release/linux-$arch/NovelBox"
            test_app "release/linux-$arch/NovelBox"
            ;;
        all)
            print_info "构建所有平台..."
            build_macos_app "$arch"
            build_windows_app "$arch"
            build_linux_app "$arch"
            ;;
        *)
            print_error "不支持的平台: $platform"
            print_info "支持的平台: macos, windows, linux, all"
            exit 1
            ;;
    esac
    
    show_build_report
}

# 跨平台构建菜单
cross_platform_menu() {
    while true; do
        echo ""
        print_info "跨平台构建选项:"
        echo ""
        echo "  ${GREEN}1${NC}) 构建 Windows x64 应用"
        echo "  ${GREEN}2${NC}) 构建 Windows ARM64 应用"
        echo "  ${GREEN}3${NC}) 构建 Linux x64 应用"
        echo "  ${GREEN}4${NC}) 构建 Linux ARM64 应用"
        echo "  ${GREEN}5${NC}) 构建所有Windows版本"
        echo "  ${GREEN}6${NC}) 构建所有Linux版本"
        echo "  ${YELLOW}7${NC}) 构建所有平台（全架构）"
        echo "  ${BLUE}8${NC}) 创建Windows安装程序"
        echo "  ${CYAN}9${NC}) 创建Linux AppImage"
        echo "  ${RED}0${NC}) 返回主菜单"
        echo ""
        
        read -p "请选择 [0-9]: " choice
        
        case $choice in
            1)
                if check_dependencies; then
                    build_windows_app "x64"
                    verify_app "release/win32-x64/NovelBox"
                    test_app "release/win32-x64/NovelBox"
                fi
                ;;
            2)
                if check_dependencies; then
                    build_windows_app "arm64"
                    verify_app "release/win32-arm64/NovelBox"
                    test_app "release/win32-arm64/NovelBox"
                fi
                ;;
            3)
                if check_dependencies; then
                    build_linux_app "x64"
                    verify_app "release/linux-x64/NovelBox"
                    test_app "release/linux-x64/NovelBox"
                fi
                ;;
            4)
                if check_dependencies; then
                    build_linux_app "arm64"
                    verify_app "release/linux-arm64/NovelBox"
                    test_app "release/linux-arm64/NovelBox"
                fi
                ;;
            5)
                if check_dependencies; then
                    build_windows_app "x64"
                    build_windows_app "arm64"
                fi
                ;;
            6)
                if check_dependencies; then
                    build_linux_app "x64"
                    build_linux_app "arm64"
                fi
                ;;
            7)
                if check_dependencies; then
                    print_info "开始构建所有平台..."
                    build_macos_app "x64"
                    build_windows_app "x64"
                    build_linux_app "x64"
                    
                    if [[ "$OSTYPE" == "darwin"* ]] && [[ $(uname -m) == "arm64" ]]; then
                        build_macos_app "arm64"
                    fi
                    
                    build_windows_app "arm64"
                    build_linux_app "arm64"
                fi
                ;;
            8)
                create_windows_installer_menu
                ;;
            9)
                create_linux_appimage_menu
                ;;
            0)
                return
                ;;
            *)
                print_error "无效选择，请重新输入"
                ;;
        esac
        
        echo ""
        read -p "按回车键继续..."
    done
}

# Windows安装程序菜单
create_windows_installer_menu() {
    echo ""
    print_info "Windows安装程序创建选项:"
    echo ""
    echo "  ${GREEN}1${NC}) 为 x64 版本创建安装程序"
    echo "  ${GREEN}2${NC}) 为 ARM64 版本创建安装程序"
    echo "  ${GREEN}3${NC}) 为所有版本创建安装程序"
    echo "  ${RED}0${NC}) 返回"
    echo ""
    
    read -p "请选择 [0-3]: " choice
    
    case $choice in
        1)
            if [ -d "release/win32-x64/NovelBox" ]; then
                create_windows_installer "release/win32-x64/NovelBox" "x64"
            else
                print_error "Windows x64 应用未构建，请先构建应用"
            fi
            ;;
        2)
            if [ -d "release/win32-arm64/NovelBox" ]; then
                create_windows_installer "release/win32-arm64/NovelBox" "arm64"
            else
                print_error "Windows ARM64 应用未构建，请先构建应用"
            fi
            ;;
        3)
            for arch in x64 arm64; do
                if [ -d "release/win32-$arch/NovelBox" ]; then
                    create_windows_installer "release/win32-$arch/NovelBox" "$arch"
                else
                    print_warning "Windows $arch 应用未构建，跳过"
                fi
            done
            ;;
        0)
            return
            ;;
        *)
            print_error "无效选择，请重新输入"
            ;;
    esac
}

# 显示构建报告
show_build_report() {
    print_header
    print_info "构建报告:"
    echo ""
    
    if [ -f "$BUILD_LOG" ]; then
        grep "应用构建完成" "$BUILD_LOG" | tail -10
        echo ""
        print_info "详细日志: $BUILD_LOG"
    fi
    
    # 显示构建结果
    if [ -d "release" ]; then
        print_info "构建结果:"
        
        # macOS应用
        find release -name "*.app" -type d 2>/dev/null | while read -r app; do
            local size=$(du -sh "$app" 2>/dev/null | cut -f1)
            local name=$(basename "$app")
            local path=$(dirname "$app" | sed 's/release\///')
            print_success "   macOS $path: $name - $size"
        done
        
        # Windows应用
        find release -name "NovelBox.exe" -type f 2>/dev/null | while read -r exe; do
            local size=$(du -sh "$(dirname "$exe")" 2>/dev/null | cut -f1)
            local path=$(dirname "$exe" | sed 's/release\///')
            print_success "   Windows $path: NovelBox.exe - $size"
        done
        
        # Linux应用
        find release -name "NovelBox" -type f -executable 2>/dev/null | while read -r bin; do
            if [[ "$bin" != *".app"* ]]; then
                local size=$(du -sh "$(dirname "$bin")" 2>/dev/null | cut -f1)
                local path=$(dirname "$bin" | sed 's/release\///')
                print_success "   Linux $path: NovelBox - $size"
            fi
        done
        
        # 安装程序
        find release -name "*.exe" -type f 2>/dev/null | grep -i setup | while read -r installer; do
            local size=$(du -sh "$installer" 2>/dev/null | cut -f1)
            local name=$(basename "$installer")
            print_success "   🎯 安装程序: $name - $size"
        done
        
        # AppImage
        find release -name "*.AppImage" -type f 2>/dev/null | while read -r appimage; do
            local size=$(du -sh "$appimage" 2>/dev/null | cut -f1)
            local name=$(basename "$appimage")
            print_success "   🎯 AppImage: $name - $size"
        done
    fi
}

# Linux AppImage菜单
create_linux_appimage_menu() {
    echo ""
    print_info "Linux AppImage创建选项:"
    echo ""
    echo "  ${GREEN}1${NC}) 为 x64 版本创建AppImage"
    echo "  ${GREEN}2${NC}) 为 ARM64 版本创建AppImage"
    echo "  ${GREEN}3${NC}) 为所有版本创建AppImage"
    echo "  ${RED}0${NC}) 返回"
    echo ""
    
    read -p "请选择 [0-3]: " choice
    
    case $choice in
        1)
            if [ -d "release/linux-x64/NovelBox" ]; then
                create_linux_appimage "release/linux-x64/NovelBox" "x64"
            else
                print_error "Linux x64 应用未构建，请先构建应用"
            fi
            ;;
        2)
            if [ -d "release/linux-arm64/NovelBox" ]; then
                create_linux_appimage "release/linux-arm64/NovelBox" "arm64"
            else
                print_error "Linux ARM64 应用未构建，请先构建应用"
            fi
            ;;
        3)
            for arch in x64 arm64; do
                if [ -d "release/linux-$arch/NovelBox" ]; then
                    create_linux_appimage "release/linux-$arch/NovelBox" "$arch"
                else
                    print_warning "Linux $arch 应用未构建，跳过"
                fi
            done
            ;;
        0)
            return
            ;;
        *)
            print_error "无效选择，请重新输入"
            ;;
    esac
}

# 显示帮助
show_help() {
    echo "NovelBox 交互式构建系统 v$APP_VERSION"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  -i, --interactive       交互式菜单模式（默认）"
    echo "  -q, --quick [平台] [架构] 快速构建模式"
    echo "  -c, --clean             清理构建目录"
    echo "  -d, --deps              检查依赖"
    echo "  -r, --report            显示构建报告"
    echo "  -l, --logs              查看构建日志"
    echo ""
    echo "平台选项:"
    echo "  macos                   macOS系统"
    echo "  windows                 Windows系统"
    echo "  linux                   Linux系统"
    echo "  all                     所有平台"
    echo ""
    echo "架构选项:"
    echo "  x64                     x64架构（默认）"
    echo "  arm64                   ARM64架构"
    echo ""
    echo "示例:"
    echo "  $0                      # 交互式菜单"
    echo "  $0 -q macos x64         # 快速构建macOS x64"
    echo "  $0 -q windows x64       # 快速构建Windows x64"
    echo "  $0 -q linux x64         # 快速构建Linux x64"
    echo "  $0 -q all x64           # 快速构建所有平台x64"
    echo "  $0 -c                   # 清理构建目录"
    echo "  $0 -d                   # 检查依赖"
    echo ""
}

# 主函数
main() {
    cd "$PROJECT_ROOT"
    
    # 创建日志文件
    touch "$BUILD_LOG"
    
    # 处理命令行参数
    case "${1:-}" in
        "-h"|"--help")
            show_help
            ;;
        "-c"|"--clean")
            clean_build
            ;;
        "-d"|"--deps")
            check_dependencies
            ;;
        "-r"|"--report")
            show_build_report
            ;;
        "-l"|"--logs")
            if [ -f "$BUILD_LOG" ]; then
                less "$BUILD_LOG"
            else
                print_warning "日志文件不存在"
            fi
            ;;
        "-q"|"--quick")
            quick_build "${2:-macos}" "${3:-x64}"
            ;;
        "-i"|"--interactive"|"")
            interactive_menu
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
main "$@"