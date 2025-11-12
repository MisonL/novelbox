<template>
  <div class="app-container">
    <transition
      name="page"
      mode="out-in"
      appear
    >
      <router-view />
    </transition>
    <AIConfigModal v-model:show-a-i-config-modal="showAIConfigModal" />
    <div
      v-if="showAbout"
      class="modal-overlay"
      @click="closeAbout"
    />
    <div
      v-if="showAbout"
      class="modal"
    >
      <About @close="closeAbout" />
    </div>
    <div
      v-if="showSettings"
      class="modal-overlay"
      @click="closeSettings"
    />
    <div
      v-if="showSettings"
      class="modal"
    >
      <Settings @close="closeSettings" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'

// 异步加载大型组件
const AIConfigModal = defineAsyncComponent(() => import('./components/AIConfigModal.vue'))
const About = defineAsyncComponent(() => import('./views/About.vue'))
const Settings = defineAsyncComponent(() => import('./views/Settings.vue'))

const showAIConfigModal = ref(false)
const showAbout = ref(false)
const showSettings = ref(false)

onMounted(() => {
  // 根据是否存在 electronAPI 来区分环境
  if (window.electronAPI) {
    // Electron环境
    window.electronAPI.onOpenAISettings(() => {
      showAIConfigModal.value = true
    })
    
    if (window.electronAPI.onOpenAboutPage) {
      window.electronAPI.onOpenAboutPage(() => {
        showAbout.value = true
      })
    }
    
    if (window.electronAPI.onOpenSettings) {
      window.electronAPI.onOpenSettings(() => {
        showSettings.value = true
      })
    }
    
    // 监听工作区变更事件
    if (window.electronAPI.onWorkspaceChanged) {
      window.electronAPI.onWorkspaceChanged((workspacePath) => {
        console.log('工作区已更改:', workspacePath)
        // 工作区变更由主进程处理，这里只记录日志
      })
    }
    
    // 监听触发工作区切换事件
    if (window.electronAPI.onTriggerChangeWorkspace) {
      window.electronAPI.onTriggerChangeWorkspace(async () => {
        try {
          await window.electronAPI.changeWorkspace();
        } catch (error) {
          console.error('更换工作区失败:', error);
        }
      })
    }
  } else {
    // 非 Electron 环境（浏览器 dev/preview）- 使用事件监听
    window.addEventListener('open-ai-settings', () => {
      showAIConfigModal.value = true
    })
    
    window.addEventListener('open-about-page', () => {
      showAbout.value = true
    })
    
    window.addEventListener('open-settings', () => {
      console.log('App.vue收到open-settings事件')
      showSettings.value = true
      console.log('showSettings已设置为true:', showSettings.value)
    })
    
    // 监听工作区变更事件
    window.addEventListener('workspace-changed', (event: any) => {
      console.log('工作区已更改:', event.detail)
    })
    
    // 监听触发工作区切换事件
    window.addEventListener('trigger-change-workspace', async () => {
      try {
        // 在Web环境中，使用模拟的changeWorkspace函数
        const { changeWorkspace } = await import('./services/webFileService')
        await changeWorkspace()
      } catch (error) {
        console.error('更换工作区失败:', error)
      }
    })
  }
  
  // 检查是否需要重新打开设置页面
  const reopenSettings = localStorage.getItem('reopenSettings')
  if (reopenSettings === 'true') {
    // 清除标记
    localStorage.removeItem('reopenSettings')
    // 打开设置页面
    showSettings.value = true
  }
})

function closeAbout() {
  showAbout.value = false
}

function closeSettings() {
  showSettings.value = false
}
</script>

<style scoped>
.app-container {
  @apply h-screen w-full overflow-hidden flex flex-col;
  padding: 2rem !important;
  box-sizing: border-box !important;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.page-enter-from.page-leave-active {
  opacity: 0;
  transform: translateX(0);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  transition: opacity 0.3s ease;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  margin: 0;
  max-height: 90vh;
  max-width: 90vw;
  transition: all 0.3s ease;
}

/* 最小化的片段样式 */
.minimized-fragments {
  position: fixed;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 900;
}

.minimized-fragment-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.minimized-fragment-item:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.minimized-icon {
  font-weight: bold;
  font-size: 14px;
}

/* 全局加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>