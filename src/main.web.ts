import './buffer-polyfill'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import { initMacOSFixes } from './macOS-fix'

// 创建Web环境的API模拟
const createWebAPI = () => {
  return {
    // 文件操作
    saveFileAs: async (defaultPath: string) => {
      // 在Web环境中，使用浏览器的下载功能
      const { saveFileAs } = await import('./services/webFileService')
      return saveFileAs(defaultPath)
    },
    
    // 工作区管理
    onWorkspaceChanged: (callback: (workspacePath: string) => void) => {
      // 在Web环境中，工作区路径使用localStorage
      const workspacePath = localStorage.getItem('workspacePath')
      if (workspacePath) {
        callback(workspacePath)
      }
    },
    
    // 设置相关
    onOpenSettings: (callback: () => void) => {
      // 监听设置打开事件
      window.addEventListener('open-settings', callback)
    },
    
    changeWorkspace: async (_fromSettings = false) => {
      // 在Web环境中，使用模拟的文件选择器
      const { changeWorkspace } = await import('./services/webFileService')
      return changeWorkspace()
    },
    
    onTriggerChangeWorkspace: (callback: () => void) => {
      // 监听工作区切换事件
      window.addEventListener('trigger-change-workspace', callback)
    },
    
    // 应用操作 - Web环境中不需要窗口控制
    minimizeWindow: () => console.log('Web环境不支持窗口最小化'),
    maximizeWindow: () => console.log('Web环境不支持窗口最大化'),
    closeWindow: () => console.log('Web环境不支持窗口关闭'),
    
    // AI配置
    onOpenAISettings: (callback: () => void) => {
      // 监听AI设置打开事件
      window.addEventListener('open-ai-settings', callback)
    },
    
    getVersion: () => Promise.resolve('web-version'),
    
    onOpenAboutPage: (callback: () => void) => {
      // 监听关于页面打开事件
      window.addEventListener('open-about-page', callback)
    },
    
    // 系统操作
    openExternal: (url: string) => {
      // 在Web环境中打开新标签页
      window.open(url, '_blank')
    },
    
    // 片段编辑窗口操作 - Web环境中使用模态框
    createFragmentWindow: async (fragment: any) => {
      const { createFragmentWindow } = await import('./services/webFragmentService')
      return createFragmentWindow(fragment)
    },
    
    updateFragmentContent: async (fragment: any) => {
      const { updateFragmentContent } = await import('./services/webFragmentService')
      return updateFragmentContent(fragment)
    },
    
    closeFragmentWindow: (_fragmentId: string) => {
      // 触发关闭片段事件
      window.dispatchEvent(new CustomEvent('close-fragment', { detail: { fragmentId: _fragmentId } }))
    },
    
    minimizeFragmentWindow: (_fragmentId: string) => {
      // Web环境中不支持最小化
      console.log('Web环境不支持片段窗口最小化')
    },
    
    saveFragmentContent: async (fragment: any) => {
      const { saveFragmentContent } = await import('./services/webFragmentService')
      return saveFragmentContent(fragment)
    },
    
    onFragmentSaved: (callback: (fragment: any) => void) => {
      // 监听片段保存事件
      window.addEventListener('fragment-saved', (event: any) => {
        callback(event.detail)
      })
    },
    
    onFragmentData: (callback: (fragment: any) => void) => {
      // 监听片段数据事件
      window.addEventListener('fragment-data', (event: any) => {
        callback(event.detail)
      })
    },
    
    startDrag: () => console.log('Web环境不支持窗口拖动'),
    closeCurrentWindow: () => console.log('Web环境不支持窗口关闭'),
    
    // 片段数据请求
    requestFragmentData: async (windowId: number) => {
      const { requestFragmentData } = await import('./services/webFragmentService')
      return requestFragmentData(windowId)
    },
    
    getCurrentWindowId: () => Promise.resolve({ success: true, id: 1 }),
    
    // 向主窗口发送消息
    sendToMainWindow: (channel: string, ...args: any[]) => {
      // 在Web环境中，直接触发事件
      window.dispatchEvent(new CustomEvent(channel, { detail: args }))
    },
    
    // 监听片段消息
    onFragmentMessage: (callback: (message: string) => void) => {
      window.addEventListener('fragment-message', (event: any) => {
        callback(event.detail)
      })
    },
    
    // 监听内容更新消息
    onContentUpdate: (callback: (fragment: any) => void) => {
      window.addEventListener('content-update', (event: any) => {
        callback(event.detail)
      })
    },
    
    // 代理设置
    setProxy: async (config: { http_proxy: string }) => {
      // 在Web环境中，代理设置没有实际作用，但提供接口兼容性
      console.log('Web环境不支持设置代理:', config.http_proxy)
      return { success: true, message: 'Web环境不支持设置代理' }
    },
    
    removeProxy: async () => {
      // 在Web环境中，代理设置没有实际作用，但提供接口兼容性
      console.log('Web环境不支持移除代理')
      return { success: true, message: 'Web环境不支持移除代理' }
    }
  }
}

// 创建路由 - Web环境使用History模式
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/BookLibrary.vue')
    },
    {
      path: '/editor',
      component: () => import('./views/NovelEditor.vue')
    },
    {
      path: '/fragment-editor',
      component: () => import('./views/FragmentEditor.vue')
    }
  ]
})

// 添加路由变化监听，设置HTML的data-route属性
router.beforeEach((to, _from, next) => {
  // 从路径中提取路由名称
  const routeName = to.path.substring(1) || 'home'
  // 设置HTML的data-route属性
  document.documentElement.setAttribute('data-route', routeName)
  next()
})

// 创建应用
const app = createApp(App)
app.use(router)
app.use(ElementPlus)

// 挂载Web API到全局对象
window.electronAPI = createWebAPI()

// 初始化macOS UI修复
initMacOSFixes()

// 挂载应用
app.mount('#app')