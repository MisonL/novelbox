// 全局polyfill
import { Buffer } from 'buffer'
window.Buffer = Buffer
// 兼容性处理
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {},
    version: '',
     browser: true
  } as any
}

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import NovelEditor from './views/NovelEditor.vue'
import BookLibrary from './views/BookLibrary.vue'
import FragmentEditor from './views/FragmentEditor.vue'
import { initMacOSFixes } from './macOS-fix'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: BookLibrary
    },
    {
      path: '/editor',
      component: NovelEditor
    },
    {
      path: '/fragment-editor',
      component: FragmentEditor
    }
  ]
})

// 添加路由变化监听，设置HTML的data-route属性
router.beforeEach((to, _from, next) => {
  // 从路径中提取路由名称
  const routeName = to.path.substring(1) || 'home';
  // 设置HTML的data-route属性
  document.documentElement.setAttribute('data-route', routeName);
  next();
});

const app = createApp(App)

// Element Plus configuration for macOS
app.use(ElementPlus, {
  // macOS specific settings
  zIndex: 3000,
  size: 'default',
  button: {
    autoInsertSpace: true
  }
})

app.use(router)

// 初始化macOS UI修复
initMacOSFixes()

app.mount('#app')
