"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const main_1 = require("@electron/remote/main");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
// 强制使用浅色主题，防止应用受系统主题影响
electron_1.nativeTheme.themeSource = 'light';
// 存储片段窗口的映射表
const fragmentWindows = new Map();
// 存储等待发送的片段数据
const pendingFragmentData = new Map();
// 窗口焦点状态位图，用于跟踪所有窗口的焦点状态
// key: windowId, value: 是否有焦点
const windowFocusStateBitmap = new Map();
// 跟踪应用全局焦点状态
let hasAnyWindowFocus = true;
// 管理片段窗口可见性
function updateAllWindowsAlwaysOnTop(hasAppFocus) {
    // 更新所有片段窗口的可见性
    fragmentWindows.forEach((window) => {
        if (!window.isDestroyed()) {
            // 根据应用焦点状态控制窗口可见性
            if (!hasAppFocus) {
                try {
                    // 应用失去焦点时，最小化所有片段窗口
                    if (window.isVisible()) {
                        window.hide();
                    }
                }
                catch (e) {
                    console.error('隐藏窗口失败:', e);
                }
            }
            else {
                // 应用获得焦点时，恢复所有片段窗口
                if (!window.isVisible()) {
                    window.show();
                }
            }
        }
    });
}
/**
 * 检测鼠标是否在应用程序区域内
 * @returns {boolean} 如果鼠标在窗口内返回true，否则返回false
 */
function isMouseInAppWindows() {
    try {
        // 获取当前鼠标在屏幕上的位置
        const mousePosition = electron_1.screen.getCursorScreenPoint();
        // 检查所有窗口
        const allWindows = electron_1.BrowserWindow.getAllWindows();
        for (const win of allWindows) {
            if (win.isDestroyed() || !win.isVisible() || win.isMinimized())
                continue;
            const bounds = win.getBounds();
            if (mousePosition.x >= bounds.x &&
                mousePosition.x <= bounds.x + bounds.width &&
                mousePosition.y >= bounds.y &&
                mousePosition.y <= bounds.y + bounds.height) {
                return true;
            }
        }
        return false;
    }
    catch (error) {
        console.error('检测鼠标位置失败:', error);
        return false;
    }
}
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, process.env.VITE_DEV_SERVER_URL ? '../dist/electron/preload.js' : './preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        frame: true,
        titleBarStyle: 'default',
        icon: path.join(__dirname, '../public/icon.ico'),
        // 设置背景色
        backgroundColor: '#ffffff'
    });
    // 监听主窗口焦点事件
    win.on('focus', () => {
        if (!win.isVisible()) {
            return;
        }
        // 更新主窗口焦点状态
        const mainWindowId = 'main-' + win.id;
        windowFocusStateBitmap.set(mainWindowId, true);
        // 检查是否有任何窗口有焦点
        let hasAnyFocus = false;
        windowFocusStateBitmap.forEach((hasFocus, _id) => {
            if (hasFocus) {
                hasAnyFocus = true;
            }
        });
        if (!hasAnyWindowFocus && hasAnyFocus) {
            hasAnyWindowFocus = true;
            updateAllWindowsAlwaysOnTop(true);
        }
    });
    // 监听主窗口失去焦点事件
    win.on('blur', () => {
        // 更新主窗口焦点状态
        const mainWindowId = 'main-' + win.id;
        windowFocusStateBitmap.set(mainWindowId, false);
        if (!isMouseInAppWindows()) {
            // 检查是否所有窗口都失去了焦点
            let hasAnyFocus = false;
            windowFocusStateBitmap.forEach((hasFocus, _id) => {
                if (hasFocus) {
                    hasAnyFocus = true;
                }
            });
            if (hasAnyWindowFocus && !hasAnyFocus) {
                hasAnyWindowFocus = false;
                updateAllWindowsAlwaysOnTop(false);
            }
        }
    });
    // 监听主窗口关闭事件，同时关闭所有片段窗口
    win.on('close', () => {
        // 关闭所有片段窗口
        fragmentWindows.forEach((window) => {
            window.close();
        });
    });
    // 监听主窗口最小化事件
    win.on('minimize', () => {
        // 最小化所有片段窗口
        fragmentWindows.forEach((window) => {
            if (window.isVisible()) {
                window.hide();
            }
        });
    });
    // 监听主窗口恢复事件
    win.on('restore', () => {
        // 恢复所有片段窗口
        fragmentWindows.forEach((window) => {
            if (!window.isVisible()) {
                window.show();
            }
        });
    });
    // 监听主窗口显示事件
    win.on('show', () => {
        // 显示所有片段窗口
        fragmentWindows.forEach((window) => {
            if (!window.isDestroyed() && !window.isVisible()) {
                window.show();
            }
        });
    });
    // 注册F12快捷键
    win.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12') {
            win.webContents.toggleDevTools();
            event.preventDefault();
        }
    });
    // 检查localStorage中是否有工作区数据
    win.webContents.on('did-finish-load', async () => {
        const workspacePath = await win.webContents.executeJavaScript('localStorage.getItem("workspacePath")');
        const hasWorkspace = workspacePath !== null;
        const dirExists = hasWorkspace ? await fs.access(workspacePath).then(() => true).catch(() => false) : false;
        if (!hasWorkspace || !dirExists) {
            const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
                title: '选择工作区目录',
                properties: ['openDirectory']
            });
            if (!canceled && filePaths.length > 0) {
                const workspacePath = filePaths[0].replace(/\\/g, '\\\\');
                win.webContents.send('workspace-changed', workspacePath);
                win.webContents.executeJavaScript(`
          localStorage.setItem('workspacePath', '${workspacePath.replace(/\\/g, '\\\\')}');
          window.location.reload();
        `);
            }
        }
    });
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    }
    else {
        // 设置CSP头
        win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' data: file: http: https: app:"]
                }
            });
        });
        // 使用file://协议加载本地文件
        win.loadFile(path.join(__dirname, '../../dist/index.html'));
    }
    (0, main_1.enable)(win.webContents);
}
// 创建应用菜单
function createMenu() {
    const isMac = process.platform === 'darwin';
    const template = [
        // { role: 'appMenu' }
        ...(isMac ? [{
                label: electron_1.app.name,
                submenu: [
                    { role: 'about', label: '关于' },
                    { type: 'separator' },
                    { role: 'services', label: '服务' },
                    { type: 'separator' },
                    { role: 'hide', label: '隐藏' },
                    { role: 'hideOthers', label: '隐藏其他' },
                    { role: 'unhide', label: '显示全部' },
                    { type: 'separator' },
                    { role: 'quit', label: '退出' }
                ]
            }] : []),
        // { role: 'fileMenu' }
        {
            label: '文件',
            submenu: [
                {
                    label: '更换工作区',
                    click: async () => {
                        const win = electron_1.BrowserWindow.getFocusedWindow();
                        if (win) {
                            // 直接调用IPC处理函数
                            win.webContents.send('trigger-change-workspace');
                        }
                    }
                },
                {
                    label: 'AI配置',
                    click: () => {
                        const win = electron_1.BrowserWindow.getFocusedWindow();
                        if (win) {
                            win.webContents.send('open-ai-settings');
                        }
                    }
                },
                {
                    label: '全局设置',
                    click: () => {
                        const win = electron_1.BrowserWindow.getFocusedWindow();
                        if (win) {
                            win.webContents.send('open-settings');
                        }
                    }
                },
                { type: 'separator' },
                isMac ? { role: 'close', label: '关闭' } : { role: 'quit', label: '退出' }
            ]
        },
        {
            role: 'help',
            label: '帮助',
            submenu: [
                {
                    label: '使用帮助',
                    click: async () => {
                        // 打开帮助文档
                        // 在开发环境和打包环境中使用不同的路径
                        let helpPath;
                        if (process.env.NODE_ENV === 'development') {
                            helpPath = path.join(electron_1.app.getAppPath(), 'public', 'help', 'help.html');
                        }
                        else {
                            // 在打包环境中，使用extraResources路径
                            helpPath = path.join(process.resourcesPath, 'help', 'help.html');
                        }
                        await electron_1.shell.openPath(helpPath).catch(async (err) => {
                            console.error('打开帮助文档失败:', err);
                            // 如果直接打开失败，尝试用默认浏览器打开
                            await electron_1.shell.openExternal('file://' + helpPath).catch(e => {
                                console.error('使用浏览器打开帮助文档失败:', e);
                            });
                        });
                    }
                },
                {
                    label: '访问官网',
                    click: async () => {
                        await electron_1.shell.openExternal('https://github.com/Rain-31/novelbox');
                    }
                },
                {
                    label: '关于',
                    click: async () => {
                        const win = electron_1.BrowserWindow.getFocusedWindow();
                        if (win) {
                            win.webContents.send('open-about-page');
                        }
                    }
                },
            ]
        }
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
electron_1.app.whenReady().then(() => {
    createWindow();
    createMenu();
    // 注册F12快捷键
    electron_1.globalShortcut.register('F12', () => {
        const win = electron_1.BrowserWindow.getFocusedWindow();
        if (win) {
            win.webContents.toggleDevTools();
        }
    });
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    // 关闭所有片段窗口
    fragmentWindows.forEach((window) => {
        window.close();
    });
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// 确保应用退出时关闭所有窗口
electron_1.app.on('before-quit', () => {
    electron_1.BrowserWindow.getAllWindows().forEach((window) => {
        if (!window.isDestroyed()) {
            window.destroy(); // 使用destroy强制关闭
        }
    });
});
// 在应用退出时注销所有快捷键
electron_1.app.on('will-quit', () => {
    electron_1.globalShortcut.unregisterAll();
});
// 设置代理
electron_1.ipcMain.on('set_proxy', (event, arg) => {
    const win = electron_1.BrowserWindow.getFocusedWindow();
    if (win) {
        const { http_proxy } = arg;
        // 处理系统代理
        if (http_proxy === 'system') {
            // 使用系统代理设置
            win.webContents.session.setProxy({ mode: 'system' })
                .then(() => {
                event.sender.send('proxy_status', { success: true });
            })
                .catch((error) => {
                console.error('设置系统代理失败:', error);
                event.sender.send('proxy_status', { success: false, error });
            });
        }
        else {
            // 使用自定义代理
            win.webContents.session.setProxy({ proxyRules: http_proxy })
                .then(() => {
                event.sender.send('proxy_status', { success: true });
            })
                .catch((error) => {
                console.error('设置代理失败:', error);
                event.sender.send('proxy_status', { success: false, error });
            });
        }
    }
});
// 移除代理
electron_1.ipcMain.on('remove_proxy', (event) => {
    const win = electron_1.BrowserWindow.getFocusedWindow();
    if (win) {
        win.webContents.session.setProxy({})
            .then(() => {
            event.sender.send('proxy_status', { success: true });
        })
            .catch((error) => {
            console.error('移除代理失败:', error);
            event.sender.send('proxy_status', { success: false, error });
        });
    }
});
// 导出文件
electron_1.ipcMain.handle('save-file-as', async (_event, defaultPath) => {
    try {
        const { canceled, filePath: savePath } = await electron_1.dialog.showSaveDialog({
            title: '导出文件',
            defaultPath: defaultPath || path.join(electron_1.app.getPath('documents'), '未命名.docx'),
            filters: [
                { name: 'Word文档', extensions: ['docx'] },
                { name: '所有文件', extensions: ['*'] }
            ]
        });
        if (canceled || !savePath) {
            return { success: false, message: '导出文件已取消' };
        }
        return { success: true, filePath: savePath };
    }
    catch (error) {
        console.error('导出文件失败:', error);
        return { success: false, message: `导出文件失败: ${error}` };
    }
});
// 窗口控制
electron_1.ipcMain.on('minimize-window', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win)
        win.minimize();
});
electron_1.ipcMain.on('maximize-window', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        if (win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win.maximize();
        }
    }
});
electron_1.ipcMain.on('close-window', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        // 确保窗口关闭前清理相关资源
        win.webContents.session.clearCache();
        win.close();
    }
});
// 文件操作相关的 IPC 处理程序
// 读取文件
electron_1.ipcMain.handle('read-file', async (_event, filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return { success: true, content };
    }
    catch (error) {
        console.error('读取文件失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 写入文件
electron_1.ipcMain.handle('write-file', async (_event, { filePath, content }) => {
    try {
        // 确保目录存在
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
    }
    catch (error) {
        console.error('写入文件失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 写入二进制文件
electron_1.ipcMain.handle('write-blob-file', async (_event, { filePath, buffer }) => {
    try {
        // 确保目录存在
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, buffer);
        return { success: true };
    }
    catch (error) {
        console.error('写入二进制文件失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 列出目录内容
electron_1.ipcMain.handle('list-files', async (_event, dirPath) => {
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        return {
            success: true,
            items: items.map(item => ({
                name: item.name,
                type: item.isDirectory() ? 'directory' : 'file'
            }))
        };
    }
    catch (error) {
        console.error('列出目录内容失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 删除文件
electron_1.ipcMain.handle('delete-file', async (_event, filePath) => {
    try {
        await fs.unlink(filePath);
        return { success: true };
    }
    catch (error) {
        console.error('删除文件失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 获取版本号
electron_1.ipcMain.handle('get-version', () => {
    return electron_1.app.getVersion();
});
// 选择并应用工作区目录
electron_1.ipcMain.handle('change-workspace', async (event, fromSettings = false) => {
    try {
        const win = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!win) {
            return { success: false, message: '无法获取窗口实例' };
        }
        const { canceled, filePaths } = await electron_1.dialog.showOpenDialog({
            title: '选择工作区目录',
            properties: ['openDirectory']
        });
        if (canceled || filePaths.length === 0) {
            return { success: false, message: '用户取消选择' };
        }
        const workspacePath = filePaths[0];
        // 发送工作区变更事件
        win.webContents.send('workspace-changed', workspacePath);
        // 将工作区路径保存到localStorage并重新加载
        // 如果是从设置页面调用的，设置一个标记，以便重新加载后重新打开设置页面
        await win.webContents.executeJavaScript(`
      localStorage.setItem('workspacePath', '${workspacePath.replace(/\\/g, '\\\\')}');
      ${fromSettings ? "localStorage.setItem('reopenSettings', 'true');" : ""}
      window.location.reload();
    `);
        return { success: true, path: workspacePath };
    }
    catch (error) {
        console.error('更换工作区失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 打开外部链接
electron_1.ipcMain.on('open-external', (_event, url) => {
    electron_1.shell.openExternal(url);
});
// 创建片段编辑窗口
electron_1.ipcMain.handle('create-fragment-window', async (_event, fragment) => {
    try {
        // 检查窗口是否已经存在
        if (fragmentWindows.has(fragment.id)) {
            const existingWindow = fragmentWindows.get(fragment.id);
            if (existingWindow && !existingWindow.isDestroyed()) {
                existingWindow.focus();
                return { success: true, message: '窗口已存在，已切换至该窗口' };
            }
        }
        // 确保片段有标题
        if (!fragment.title) {
            fragment.title = '新片段';
        }
        // 创建新窗口 - 极简样式
        const fragmentWindow = new electron_1.BrowserWindow({
            width: 550,
            height: 350,
            frame: false, // 无边框窗口
            modal: false,
            show: false,
            backgroundColor: '#00000000', // 透明背景
            // 设置关闭时的行为
            closable: true,
            alwaysOnTop: true, // 窗口始终保持在最前面
            transparent: true, // 添加透明支持
            webPreferences: {
                preload: path.join(__dirname, process.env.VITE_DEV_SERVER_URL ? '../dist/electron/preload.js' : './preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                webSecurity: true
            },
            // 移除vibrancy和roundedCorners，它们在Windows下兼容性不好
            resizable: false, // 禁止调整大小以保持圆角外观
        });
        if (process.env.NODE_ENV === 'development') {
            fragmentWindow.webContents.openDevTools({ mode: 'detach' });
        }
        // 存储窗口引用
        fragmentWindows.set(fragment.id, fragmentWindow);
        // 初始化焦点状态位图 - 新创建的窗口默认有焦点
        windowFocusStateBitmap.set(fragment.id, true);
        // 设置窗口标题
        fragmentWindow.setTitle(fragment.title);
        // 存储片段数据，等待渲染进程请求
        pendingFragmentData.set(fragmentWindow.id, fragment);
        // 监听片段窗口焦点事件
        fragmentWindow.on('focus', () => {
            // 更新片段窗口焦点状态
            windowFocusStateBitmap.set(fragment.id, true);
            // 检查是否有任何窗口有焦点
            let hasAnyFocus = false;
            windowFocusStateBitmap.forEach((hasFocus, _id) => {
                if (hasFocus) {
                    hasAnyFocus = true;
                }
            });
            if (!hasAnyWindowFocus && hasAnyFocus) {
                hasAnyWindowFocus = true;
                updateAllWindowsAlwaysOnTop(true);
            }
        });
        // 监听片段窗口失去焦点事件
        fragmentWindow.on('blur', () => {
            // 更新片段窗口焦点状态
            windowFocusStateBitmap.set(fragment.id, false);
            if (!isMouseInAppWindows()) {
                // 检查是否所有窗口都失去了焦点
                let hasAnyFocus = false;
                windowFocusStateBitmap.forEach((hasFocus, _id) => {
                    if (hasFocus) {
                        hasAnyFocus = true;
                    }
                });
                if (hasAnyWindowFocus && !hasAnyFocus) {
                    hasAnyWindowFocus = false;
                    updateAllWindowsAlwaysOnTop(false);
                }
            }
        });
        // 获取主窗口
        const mainWindows = electron_1.BrowserWindow.getAllWindows().filter(win => !fragmentWindows.has(win.id.toString()));
        const mainWindow = mainWindows.length > 0 ? mainWindows[0] : null;
        // 如果主窗口已最小化，则新创建的片段窗口也应该最小化
        if (mainWindow && mainWindow.isMinimized()) {
            fragmentWindow.once('ready-to-show', () => {
                fragmentWindow.minimize();
            });
        }
        // 加载页面
        if (process.env.VITE_DEV_SERVER_URL) {
            await fragmentWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/fragment-editor`);
        }
        else {
            await fragmentWindow.loadFile(path.join(__dirname, '../../dist/index.html'), {
                hash: '/fragment-editor'
            });
        }
        // 显示窗口
        fragmentWindow.show();
        fragmentWindow.on('show', () => {
            windowFocusStateBitmap.set(fragment.id, true);
        });
        // 窗口关闭时清理引用
        fragmentWindow.on('closed', () => {
            if (fragmentWindows.has(fragment.id)) {
                fragmentWindows.delete(fragment.id);
            }
            pendingFragmentData.delete(fragmentWindow.id);
            // 清理焦点状态位图
            windowFocusStateBitmap.delete(fragment.id);
            // 重新检查焦点状态
            let hasAnyFocus = false;
            windowFocusStateBitmap.forEach((hasFocus, _id) => {
                if (hasFocus) {
                    hasAnyFocus = true;
                }
            });
            // 更新全局焦点状态
            hasAnyWindowFocus = hasAnyFocus;
        });
        // 添加关闭事件处理
        fragmentWindow.on('close', () => {
            if (fragmentWindows.has(fragment.id)) {
                fragmentWindows.delete(fragment.id);
            }
            pendingFragmentData.delete(fragmentWindow.id);
            // 清理焦点状态位图
            windowFocusStateBitmap.delete(fragment.id);
        });
        return { success: true, message: '片段窗口已创建' };
    }
    catch (error) {
        console.error('创建片段窗口失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 更新片段窗口内容
electron_1.ipcMain.handle('update-fragment-content', async (_event, fragment) => {
    try {
        // 检查窗口是否存在
        if (!fragmentWindows.has(fragment.id)) {
            return { success: false, message: '找不到对应的片段窗口' };
        }
        const fragmentWindow = fragmentWindows.get(fragment.id);
        if (!fragmentWindow || fragmentWindow.isDestroyed()) {
            return { success: false, message: '片段窗口已销毁' };
        }
        // 存储更新后的片段数据
        const oldFragment = pendingFragmentData.get(fragmentWindow.id);
        if (oldFragment) {
            pendingFragmentData.set(fragmentWindow.id, {
                ...oldFragment,
                content: fragment.content,
                title: fragment.title,
                isGenerating: fragment.isGenerating,
                wasStopped: fragment.wasStopped,
                hasLastGenerationParams: fragment.hasLastGenerationParams,
                updatedAt: fragment.updatedAt || new Date().toISOString()
            });
        }
        // 向窗口发送内容更新消息
        fragmentWindow.webContents.send('content-update', {
            id: fragment.id,
            content: fragment.content,
            title: fragment.title,
            isGenerating: fragment.isGenerating,
            wasStopped: fragment.wasStopped,
            hasLastGenerationParams: fragment.hasLastGenerationParams,
            updatedAt: fragment.updatedAt || new Date().toISOString()
        });
        return { success: true, message: '片段内容已更新' };
    }
    catch (error) {
        console.error('更新片段窗口内容失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 新增：响应渲染进程请求片段数据
electron_1.ipcMain.handle('request-fragment-data', (_event, windowId) => {
    try {
        // 获取为该窗口保存的片段数据
        const fragment = pendingFragmentData.get(windowId);
        if (!fragment) {
            console.error('没有找到对应的片段数据:', windowId);
            return { success: false, message: '没有找到对应的片段数据' };
        }
        // 获取发出请求的窗口
        const win = electron_1.BrowserWindow.fromId(windowId);
        if (!win) {
            console.error('没有找到对应的窗口:', windowId);
            return { success: false, message: '没有找到对应的窗口' };
        }
        // 发送片段数据到窗口
        win.webContents.send('fragment-data', fragment);
        return { success: true, message: '片段数据已发送' };
    }
    catch (error) {
        console.error('处理片段数据请求失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 获取当前窗口ID
electron_1.ipcMain.handle('get-current-window-id', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (!win) {
        return { success: false, message: '无法获取窗口ID' };
    }
    return { success: true, id: win.id };
});
// 关闭片段窗口
electron_1.ipcMain.on('close-fragment-window', (_event, fragmentId) => {
    const fragmentWindow = fragmentWindows.get(fragmentId);
    if (fragmentWindow && !fragmentWindow.isDestroyed()) {
        fragmentWindow.close();
    }
});
// 关闭当前窗口
electron_1.ipcMain.on('close-current-window', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        win.close();
    }
});
// 最小化片段窗口
electron_1.ipcMain.on('minimize-fragment-window', (_event, fragmentId) => {
    const fragmentWindow = fragmentWindows.get(fragmentId);
    if (fragmentWindow && !fragmentWindow.isDestroyed()) {
        fragmentWindow.minimize();
    }
});
// 保存片段内容
electron_1.ipcMain.handle('save-fragment-content', async (_event, fragment) => {
    try {
        // 将保存事件广播到主窗口，让主窗口进行数据存储
        electron_1.BrowserWindow.getAllWindows().forEach(win => {
            // 排除片段窗口本身
            if (!fragmentWindows.has(fragment.id) || win !== fragmentWindows.get(fragment.id)) {
                win.webContents.send('fragment-saved', fragment);
            }
        });
        return { success: true, message: '片段已保存' };
    }
    catch (error) {
        console.error('保存片段失败:', error);
        return {
            success: false,
            error: {
                message: error.message,
                code: error.code
            }
        };
    }
});
// 处理窗口拖动
// 由于无边框窗口需要自定义拖动，我们使用CSS的-webkit-app-region: drag替代
// 在HTML元素上添加这个CSS属性即可实现拖动，不需要额外的JS处理
electron_1.ipcMain.on('window-drag', (event) => {
    const win = electron_1.BrowserWindow.fromWebContents(event.sender);
    if (win) {
        win.moveTop(); // 确保窗口在最前面
    }
});
// 处理从片段窗口发送到主窗口的消息
electron_1.ipcMain.on('send-to-main-window', (_event, channel, ...args) => {
    try {
        // 获取所有非片段窗口（主窗口）
        const mainWindows = electron_1.BrowserWindow.getAllWindows().filter(win => {
            // 检查窗口ID是否在fragmentWindows映射中
            const isFragmentWindow = Array.from(fragmentWindows.values()).some(fw => fw.id === win.id);
            return !isFragmentWindow;
        });
        // 将消息转发给主窗口
        if (mainWindows.length > 0) {
            const mainWindow = mainWindows[0]; // 假设只有一个主窗口
            if (!mainWindow.isDestroyed()) {
                // 处理片段编辑器的特殊消息类型
                if (typeof channel === 'string' && channel.startsWith('{')) {
                    try {
                        // 如果channel是JSON字符串，则通过fragment-message发送
                        mainWindow.webContents.send('fragment-message', channel);
                    }
                    catch (err) {
                        console.error('发送fragment-message失败:', err);
                    }
                }
                else {
                    // 使用原来的方式，通过executeJavaScript执行自定义事件
                    mainWindow.webContents.executeJavaScript(`
            document.dispatchEvent(new CustomEvent('${channel}', { detail: ${JSON.stringify(args)} }));
          `).catch(err => console.error('执行脚本失败:', err));
                }
            }
            else {
                console.error('主窗口已销毁，无法发送消息');
            }
        }
        else {
            console.error('找不到主窗口，无法发送消息');
        }
    }
    catch (error) {
        console.error('转发消息到主窗口失败:', error);
    }
});
