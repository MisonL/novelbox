import { ElMessage } from 'element-plus'
import type { MessageParamsWithType } from 'element-plus'

/**
 * Element Plus 消息工具函数
 * 解决 TypeScript 严格模式下 ElMessage 调用类型问题
 */

export function showMessage(message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info', duration?: number) {
  const params: MessageParamsWithType = {
    message,
    type,
    duration: duration || (type === 'error' ? 5000 : 3000),
    showClose: true
  }
  
  switch (type) {
    case 'success':
      ElMessage.success(params)
      break
    case 'warning':
      ElMessage.warning(params)
      break
    case 'error':
      ElMessage.error(params)
      break
    case 'info':
    default:
      ElMessage.info(params)
      break
  }
}

export function showSuccess(message: string, duration?: number) {
  showMessage(message, 'success', duration)
}

export function showWarning(message: string, duration?: number) {
  showMessage(message, 'warning', duration)
}

export function showError(message: string, duration?: number) {
  showMessage(message, 'error', duration)
}

export function showInfo(message: string, duration?: number) {
  showMessage(message, 'info', duration)
}

// 向后兼容的默认导出
export default {
  showMessage,
  showSuccess,
  showWarning,
  showError,
  showInfo
}