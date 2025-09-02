"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        invoke: (channel, ...args) => electron_1.ipcRenderer.invoke(channel, ...args)
    }
});
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    saveFileAs: (defaultPath) => electron_1.ipcRenderer.invoke('save-file-as', defaultPath),
    onWorkspaceChanged: (callback) => electron_1.ipcRenderer.on('workspace-changed', (_event, workspacePath) => callback(workspacePath)),
    setProxy: (config) => electron_1.ipcRenderer.send('set_proxy', config),
    removeProxy: () => electron_1.ipcRenderer.send('remove_proxy'),
    // 设置相关
    onOpenSettings: (callback) => electron_1.ipcRenderer.on('open-settings', () => callback()),
    changeWorkspace: (fromSettings = false) => electron_1.ipcRenderer.invoke('change-workspace', fromSettings),
    onTriggerChangeWorkspace: (callback) => electron_1.ipcRenderer.on('trigger-change-workspace', () => callback()),
    // 应用操作
    minimizeWindow: () => electron_1.ipcRenderer.send('minimize-window'),
    maximizeWindow: () => electron_1.ipcRenderer.send('maximize-window'),
    closeWindow: () => electron_1.ipcRenderer.send('close-window'),
    // AI配置
    onOpenAISettings: (callback) => electron_1.ipcRenderer.on('open-ai-settings', () => callback()),
    getVersion: () => electron_1.ipcRenderer.invoke('get-version'),
    onOpenAboutPage: (callback) => electron_1.ipcRenderer.on('open-about-page', () => callback()),
    // 系统操作
    openExternal: (url) => electron_1.ipcRenderer.send('open-external', url),
    // 片段编辑窗口操作
    createFragmentWindow: (fragment) => electron_1.ipcRenderer.invoke('create-fragment-window', fragment),
    updateFragmentContent: (fragment) => electron_1.ipcRenderer.invoke('update-fragment-content', fragment),
    closeFragmentWindow: (fragmentId) => electron_1.ipcRenderer.send('close-fragment-window', fragmentId),
    minimizeFragmentWindow: (fragmentId) => electron_1.ipcRenderer.send('minimize-fragment-window', fragmentId),
    saveFragmentContent: (fragment) => electron_1.ipcRenderer.invoke('save-fragment-content', fragment),
    onFragmentSaved: (callback) => {
        // 先移除所有现有的 fragment-saved 事件监听器
        electron_1.ipcRenderer.removeAllListeners('fragment-saved');
        // 然后添加新的监听器
        return electron_1.ipcRenderer.on('fragment-saved', (_event, fragment) => callback(fragment));
    },
    onFragmentData: (callback) => electron_1.ipcRenderer.on('fragment-data', (_event, fragment) => callback(fragment)),
    startDrag: () => electron_1.ipcRenderer.send('window-drag'),
    closeCurrentWindow: () => electron_1.ipcRenderer.send('close-current-window'),
    // 新增：通知主进程渲染进程已准备好接收片段数据
    requestFragmentData: (windowId) => electron_1.ipcRenderer.invoke('request-fragment-data', windowId),
    // 新增：获取当前窗口ID
    getCurrentWindowId: () => electron_1.ipcRenderer.invoke('get-current-window-id'),
    // 新增：向主窗口发送消息
    sendToMainWindow: (channel, ...args) => electron_1.ipcRenderer.send('send-to-main-window', channel, ...args),
    // 新增：监听片段消息
    onFragmentMessage: (callback) => electron_1.ipcRenderer.on('fragment-message', (_event, message) => callback(message)),
    // 新增：监听内容更新消息
    onContentUpdate: (callback) => electron_1.ipcRenderer.on('content-update', (_event, fragment) => callback(fragment)),
});
// 监听来自主进程的菜单事件
electron_1.ipcRenderer.on('menu-save-file-as', () => {
    document.dispatchEvent(new CustomEvent('menu-save-file-as'));
});
