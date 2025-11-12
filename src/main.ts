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
import './style.css'
import App from './App.vue'
import { initMacOSFixes } from './macOS-fix'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 预加载关键组件
const BookLibrary = () => import('./views/BookLibrary.vue')
const NovelEditor = () => import('./views/NovelEditor.vue')
const FragmentEditor = () => import('./views/FragmentEditor.vue')

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: BookLibrary,
      // 预加载策略
      meta: { preload: true }
    },
    {
      path: '/novel-editor/:id?',
      component: NovelEditor
    },
    {
      path: '/fragment-editor',
      component: FragmentEditor
    },
  ]
})

// 预加载关键路由
if (router.currentRoute.value.path === '/') {
  NovelEditor()
  FragmentEditor()
}

// 添加路由变化监听，设置HTML的data-route属性
router.beforeEach((to, _from, next) => {
  // 从路径中提取路由名称
  const routeName = to.path.substring(1) || 'home';
  // 设置HTML的data-route属性
  document.documentElement.setAttribute('data-route', routeName);
  next();
});

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化macOS UI修复
initMacOSFixes()

app.mount('#app')
