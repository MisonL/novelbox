<!-- 改进的错误提示组件 -->
<template>
  <transition name="error-fade">
    <div 
      v-if="visible" 
      class="error-toast"
      :class="[
        `error-${type}`,
        { 'error-with-actions': actions && actions.length > 0 }
      ]"
    >
      <div class="error-icon">
        <span v-if="type === 'error'">❌</span>
        <span v-else-if="type === 'warning'">⚠️</span>
        <span v-else-if="type === 'info'">ℹ️</span>
        <span v-else-if="type === 'success'">✅</span>
      </div>
      
      <div class="error-content">
        <h4 class="error-title">{{ title }}</h4>
        <p class="error-message">{{ message }}</p>
        <div v-if="details" class="error-details">
          <button 
            class="details-toggle"
            @click="showDetails = !showDetails"
          >
            {{ showDetails ? '隐藏详情' : '查看详情' }}
          </button>
          <div v-if="showDetails" class="details-content">
            {{ details }}
          </div>
        </div>
        
        <div v-if="actions && actions.length > 0" class="error-actions">
          <button
            v-for="action in actions"
            :key="action.text"
            class="action-btn"
            :class="`action-${action.type || 'primary'}`"
            @click="handleAction(action)"
          >
            {{ action.text }}
          </button>
        </div>
      </div>
      
      <button 
        v-if="closable"
        class="error-close"
        @click="close"
      >
        ✕
      </button>
      
      <!-- 自动关闭进度条 -->
      <div v-if="duration > 0" class="error-progress">
        <div 
          class="progress-bar"
          :style="{ animationDuration: `${duration}ms` }"
        ></div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Action {
  text: string
  type?: 'primary' | 'secondary' | 'danger'
  handler: () => void
}

interface Props {
  visible: boolean
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  details?: string
  actions?: Action[]
  closable?: boolean
  duration?: number // 自动关闭时间，0表示不自动关闭
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  duration: 5000
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'closed': []
}>()

const showDetails = ref(false)
  let closeTimer: ReturnType<typeof setTimeout> | null = null

const close = () => {
  emit('update:visible', false)
  emit('closed')
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const handleAction = (action: Action) => {
  try {
    action.handler()
    close()
  } catch (error) {
    console.error('Action handler error:', error)
  }
}

onMounted(() => {
  if (props.duration > 0) {
    closeTimer = setTimeout(() => {
      close()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (closeTimer) {
    clearTimeout(closeTimer)
  }
})
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  display: flex;
  align-items: flex-start;
  padding: 16px;
  z-index: 10000;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.error-toast.error-error {
  border-left-color: #f56c6c;
}

.error-toast.error-warning {
  border-left-color: #e6a23c;
}

.error-toast.error-info {
  border-left-color: #409eff;
}

.error-toast.error-success {
  border-left-color: #67c23a;
}

.error-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
  min-width: 0;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #303133;
}

.error-message {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #606266;
  line-height: 1.5;
}

.error-details {
  margin-top: 8px;
}

.details-toggle {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  text-decoration: underline;
}

.details-content {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  font-family: monospace;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.error-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-primary {
  background: #409eff;
  color: white;
}

.action-primary:hover {
  background: #66b1ff;
}

.action-secondary {
  background: #f0f2f5;
  color: #606266;
}

.action-secondary:hover {
  background: #e6e8eb;
}

.action-danger {
  background: #f56c6c;
  color: white;
}

.action-danger:hover {
  background: #f78989;
}

.error-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  margin-left: 8px;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.error-close:hover {
  background: #f5f7fa;
  color: #606266;
}

.error-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-animation linear forwards;
}

@keyframes progress-animation {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 过渡动画 */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .error-toast {
    background: #1a1a1a;
    color: #e0e0e0;
  }
  
  .error-title {
    color: #e0e0e0;
  }
  
  .error-message {
    color: #a0a0a0;
  }
  
  .details-content {
    background: #2a2a2a;
    color: #a0a0a0;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .error-toast {
    left: 16px;
    right: 16px;
    max-width: none;
  }
}
</style>