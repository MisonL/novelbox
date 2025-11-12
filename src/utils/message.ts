import { createVNode, render, h, ref } from 'vue'
import MessageComponent from '../components/ui/Message.vue'
import MessageBoxComponent from '../components/ui/MessageBox.vue'

type MessageType = 'success' | 'warning' | 'info' | 'error'

interface MessageOptions {
  message?: string
  type?: MessageType
  duration?: number
  showClose?: boolean
}

let messageContainer: HTMLElement | null = null

function ensureContainer() {
  if (!messageContainer) {
    messageContainer = document.createElement('div')
    messageContainer.className = 'message-container'
    document.body.appendChild(messageContainer)
  }
  return messageContainer
}

export function ElMessage(options: string | MessageOptions) {
  const container = ensureContainer()
  const message = typeof options === 'string' ? options : (options.message ?? '')
  const config = typeof options === 'string' ? {} : options

  const vnode = h(MessageComponent, {
    message,
    ...config
  })

  const component = createVNode(vnode)
  render(component, container)

  return {
    close: () => {
      // 组件内部会自动处理
    }
  }
}

ElMessage.success = (message: string, options?: MessageOptions) => {
  return ElMessage({ ...options, message, type: 'success' })
}

ElMessage.warning = (message: string, options?: MessageOptions) => {
  return ElMessage({ ...options, message, type: 'warning' })
}

ElMessage.info = (message: string, options?: MessageOptions) => {
  return ElMessage({ ...options, message, type: 'info' })
}

ElMessage.error = (message: string, options?: MessageOptions) => {
  return ElMessage({ ...options, message, type: 'error' })
}

interface MessageBoxOptions {
  title?: string
  message: string
  type?: 'warning' | 'info' | 'error' | 'success'
  showCancel?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
}

let messageBoxContainer: HTMLElement | null = null

export function ElMessageBox(options: MessageBoxOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!messageBoxContainer) {
      messageBoxContainer = document.createElement('div')
      messageBoxContainer.className = 'message-box-container'
      document.body.appendChild(messageBoxContainer)
    }

    const visible = ref(true)

    const handleConfirm = () => {
      resolve(true)
      cleanup()
    }

    const handleCancel = () => {
      resolve(false)
      cleanup()
    }

    const handleUpdateVisible = (value: boolean) => {
      if (!value) {
        resolve(false)
        cleanup()
      }
    }

    const cleanup = () => {
      // 组件会在onBeforeUnmount中自动清理
    }

    const vnode = h(MessageBoxComponent, {
      visible: visible.value,
      title: options.title || '提示',
      message: options.message,
      showCancel: options.showCancel,
      confirmButtonText: options.confirmButtonText || '确定',
      cancelButtonText: options.cancelButtonText || '取消',
      type: options.type,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
      'onUpdate:visible': handleUpdateVisible
    })

    const component = createVNode(vnode)
    render(component, messageBoxContainer)
  })
}

ElMessageBox.alert = (message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>) => {
  return ElMessageBox({
    ...options,
    message,
    title: title || '提示',
    showCancel: false
  })
}

ElMessageBox.confirm = (message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>) => {
  return ElMessageBox({
    ...options,
    message,
    title: title || '确认',
    showCancel: true
  })
}

ElMessageBox.prompt = (message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>) => {
  // 简化实现，不支持输入框
  return ElMessageBox({
    ...options,
    message,
    title: title || '输入',
    showCancel: true
  })
}

// 便捷函数导出
export const showMessage = ElMessage
export const showSuccess = ElMessage.success
export const showError = ElMessage.error
export const showWarning = ElMessage.warning
export const showInfo = ElMessage.info

export default ElMessage
