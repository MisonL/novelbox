<template>
  <teleport to="body">
    <div v-if="visible" :class="['message', type]" @click="handleClick">
      <span class="message-content">{{ message }}</span>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  duration?: number
  showClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  showClose: false
})

const visible = ref(false)
let timer: number | null = null

const show = () => {
  visible.value = true
  if (props.duration > 0) {
    timer = window.setTimeout(() => {
      hide()
    }, props.duration)
  }
}

const hide = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const handleClick = () => {
  if (props.showClose) {
    hide()
  }
}

onMounted(() => {
  show()
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})

defineExpose({
  show,
  hide
})
</script>

<style scoped>
.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 9999;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease-out;
}

.message.success {
  background: #67c23a;
}

.message.warning {
  background: #e6a23c;
}

.message.info {
  background: #409eff;
}

.message.error {
  background: #f56c6c;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
