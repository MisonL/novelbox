/**
 * 工具函数集合
 * 包含项目中常用的工具函数
 */

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`
}

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 等待时间
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param func 要执行的函数
 * @param limit 时间限制
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 判断是否为有效邮箱
 * @param email 邮箱地址
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 判断是否为有效URL
 * @param url URL地址
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 安全地解析JSON
 * @param jsonString JSON字符串
 * @param defaultValue 默认值
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch {
    return defaultValue
  }
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * 格式化日期时间
 * @param date 日期对象
 * @param format 格式字符串
 */
export function formatDateTime(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 计算文本字数（中文按字符计算，英文按单词计算）
 * @param text 文本内容
 */
export function countWords(text: string): number {
  if (!text) return 0
  
  // 移除HTML标签
  const plainText = text.replace(/<[^>]*>/g, '')
  
  // 计算中文字符
  const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) || []
  
  // 计算英文单词
  const englishWords = plainText.match(/[a-zA-Z]+/g) || []
  
  return chineseChars.length + englishWords.length
}

/**
 * 读取文件内容为文本
 * @param file 文件对象
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

/**
 * 下载文件
 * @param content 文件内容
 * @param filename 文件名
 * @param mimeType MIME类型
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string = 'text/plain'): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}

/**
 * 本地存储工具函数
 */
export const localStorage = {
  /**
   * 设置本地存储
   */
  set(key: string, value: any): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('本地存储设置失败:', error)
    }
  },
  
  /**
   * 获取本地存储
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key)
      return item ? safeJsonParse(item, defaultValue) : defaultValue
    } catch (error) {
      console.error('本地存储获取失败:', error)
      return defaultValue
    }
  },
  
  /**
   * 删除本地存储
   */
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error('本地存储删除失败:', error)
    }
  },
  
  /**
   * 清空本地存储
   */
  clear(): void {
    try {
      window.localStorage.clear()
    } catch (error) {
      console.error('本地存储清空失败:', error)
    }
  }
}

/**
 * 会话存储工具函数
 */
export const sessionStorage = {
  /**
   * 设置会话存储
   */
  set(key: string, value: any): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('会话存储设置失败:', error)
    }
  },
  
  /**
   * 获取会话存储
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? safeJsonParse(item, defaultValue) : defaultValue
    } catch (error) {
      console.error('会话存储获取失败:', error)
      return defaultValue
    }
  },
  
  /**
   * 删除会话存储
   */
  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key)
    } catch (error) {
      console.error('会话存储删除失败:', error)
    }
  },
  
  /**
   * 清空会话存储
   */
  clear(): void {
    try {
      window.sessionStorage.clear()
    } catch (error) {
      console.error('会话存储清空失败:', error)
    }
  }
}

export default {
  delay,
  deepClone,
  generateId,
  formatFileSize,
  debounce,
  throttle,
  isValidEmail,
  isValidUrl,
  safeJsonParse,
  getFileExtension,
  formatDateTime,
  countWords,
  readFileAsText,
  downloadFile,
  copyToClipboard,
  localStorage,
  sessionStorage
}