<template>
  <div class="app-container">
    <router-view></router-view>
    <AIConfigModal v-model:showAIConfigModal="showAIConfigModal" />
    <div v-if="showAbout" class="modal-overlay" @click="closeAbout"></div>
    <div v-if="showAbout" class="modal">
      <About @close="closeAbout" />
    </div>
    <div v-if="showSettings" class="modal-overlay" @click="closeSettings"></div>
    <div v-if="showSettings" class="modal">
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
  // 检查是否在Web环境中
  const isWeb = import.meta.env.__IS_WEB__ || false
  
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
  } else if (isWeb) {
    // Web环境 - 使用事件监听
    window.addEventListener('open-ai-settings', () => {
      showAIConfigModal.value = true
    })
    
    window.addEventListener('open-about-page', () => {
      showAbout.value = true
    })
    
    window.addEventListener('open-settings', () => {
      showSettings.value = true
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
  @apply h-screen overflow-hidden flex justify-center;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
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
  transform: translateY(-3px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.minimized-icon {
  font-weight: bold;
  font-size: 14px;
}
</style>