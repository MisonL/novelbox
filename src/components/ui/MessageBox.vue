<template>
  <teleport to="body">
    <div v-if="visible" class="message-box-overlay" @click="handleOverlayClick">
      <div class="message-box" @click.stop>
        <div class="message-box-header">
          <h3 class="message-box-title">{{ title }}</h3>
        </div>
        <div class="message-box-body">
          <p class="message-box-content">{{ message }}</p>
        </div>
        <div class="message-box-footer">
          <button
            v-if="showCancel"
            class="btn btn-cancel"
            @click="handleCancel"
          >
            {{ cancelButtonText }}
          </button>
          <button
            class="btn btn-confirm"
            @click="handleConfirm"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">

interface Props {
  visible: boolean
  title: string
  message: string
  showCancel?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  type?: 'warning' | 'info' | 'error' | 'success'
}

withDefaults(defineProps<Props>(), {
  showCancel: false,
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'info'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.message-box-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.message-box {
  background: white;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-box-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.message-box-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.message-box-body {
  padding: 20px;
}

.message-box-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.message-box-footer {
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm {
  background: #409eff;
  color: white;
}

.btn-confirm:hover {
  background: #337ecc;
}
</style>
