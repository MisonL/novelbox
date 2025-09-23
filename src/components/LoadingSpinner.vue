<!-- 改进的加载状态组件 -->
<template>
  <div 
    v-if="visible" 
    class="loading-overlay"
    :class="{ 'transparent': transparent }"
  >
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loading-text">
        <p class="loading-title">{{ title }}</p>
        <p class="loading-subtitle">{{ subtitle }}</p>
        <div v-if="progress !== undefined" class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
      </div>
      <div v-if="cancelable" class="loading-actions">
        <button 
          class="cancel-btn"
          @click="$emit('cancel')"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title?: string
  subtitle?: string
  progress?: number
  transparent?: boolean
  cancelable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '正在处理',
  subtitle: '请稍候...',
  transparent: false,
  cancelable: false
})

defineEmits<{
  cancel: []
}>()
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-overlay.transparent {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.loading-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-duration: 1.2s;
}

.spinner-ring:nth-child(2) {
  animation-duration: 1s;
  animation-delay: -0.2s;
}

.spinner-ring:nth-child(3) {
  animation-duration: 0.8s;
  animation-delay: -0.4s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.loading-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0 0 16px 0;
}

.loading-progress {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #909399;
}

.loading-actions {
  margin-top: 24px;
}

.cancel-btn {
  background: #f56c6c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #f78989;
  transform: translateY(-1px);
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .loading-content {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .loading-title {
    color: #e0e0e0;
  }
  
  .loading-subtitle {
    color: #a0a0a0;
  }
  
  .progress-bar {
    background: #333;
  }
  
  .progress-text {
    color: #a0a0a0;
  }
}
</style>