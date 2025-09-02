/// <reference types="vite/client" />

declare interface Window {
  electronAPI: {
    // 文件操作
    saveFileAs: (defaultPath: string) => Promise<{ success: boolean; filePath?: string; message?: string }>;
    onWorkspaceChanged: (callback: (workspacePath: string) => void) => void;
    
    // 设置相关
    onOpenSettings: (callback: () => void) => void;
    changeWorkspace: (fromSettings?: boolean) => Promise<{ success: boolean; path?: string; message?: string }>;
    onTriggerChangeWorkspace: (callback: () => void) => void;
    
    // 应用操作
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    
    // AI配置
    onOpenAISettings: (callback: () => void) => void;
    getVersion: () => Promise<string>;
    onOpenAboutPage: (callback: () => void) => void;
    
    // 系统操作
    openExternal: (url: string) => void;
    
    // 片段编辑窗口操作
    createFragmentWindow: (fragment: any) => Promise<{ success: boolean; message?: string }>;
    updateFragmentContent: (fragment: any) => Promise<{ success: boolean; message?: string }>;
    closeFragmentWindow: (fragmentId: string) => void;
    minimizeFragmentWindow: (fragmentId: string) => void;
    saveFragmentContent: (fragment: any) => Promise<{ success: boolean; message?: string }>;
    onFragmentSaved: (callback: (fragment: any) => void) => void;
    onFragmentData: (callback: (fragment: any) => void) => void;
    startDrag: () => void;
    closeCurrentWindow: () => void;
    
    // 片段数据请求
    requestFragmentData: (windowId: number) => Promise<{ success: boolean; message?: string }>;
    getCurrentWindowId: () => Promise<{ success: boolean; id?: number }>;
    
    // 向主窗口发送消息
    sendToMainWindow: (channel: string, ...args: any[]) => void;
    
    // 监听片段消息
    onFragmentMessage: (callback: (message: string) => void) => void;
    
    // 监听内容更新消息
    onContentUpdate: (callback: (fragment: any) => void) => void;
    
    // 代理设置
    setProxy: (config: { http_proxy: string }) => Promise<{ success: boolean; message?: string }>;
    removeProxy: () => Promise<{ success: boolean; message?: string }>;
  };
}

// 环境变量类型声明
interface ImportMetaEnv {
  readonly __APP_ENV__: string
  readonly __IS_WEB__: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}