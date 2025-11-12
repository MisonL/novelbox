<template>
  <div class="fragment-pane">
    <div class="header-row">
      <SidebarToggle 
        initial-tab="fragments" 
        @toggle="handleToggle" 
      />
      <div class="action-buttons">
        <!-- <button class="action-button btn-primary" >
          <Document />
        </button> -->
        <button
          class="action-button btn-primary"
          title="添加片段"
          @click="createFloatingFragment"
        >
          +
        </button>
      </div>
    </div>
    <div class="fragment-list">
      <div 
        v-for="fragment in fragments" 
        :key="fragment.id" 
        class="fragment-item"
        :class="{ 'active': selectedFragmentId === fragment.id }"
        @click="selectFragment(fragment)"
      >
        <div class="fragment-content">
          <div class="fragment-title">
            {{ fragment.title }}
          </div>
          <div class="fragment-preview">
            {{ getPreview(fragment.content) }}
          </div>
        </div>
        <div class="fragment-actions">
          <button
            class="btn-danger"
            title="删除"
            @click.stop="removeFragment(fragment)"
          >
            ×
          </button>
        </div>
      </div>
      <div
        v-if="fragments.length === 0"
        class="empty-state"
      >
        暂无片段，点击上方"+"按钮添加
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from '../utils/message'
// 图标已移除，使用Unicode符号
import { v4 as uuidv4 } from 'uuid'
import SidebarToggle from './SidebarToggle.vue'
import { type Fragment, type Book } from '../services/bookConfigService'

const props = defineProps<{
  bookId: string
  currentBook: Book | null
}>()

const emit = defineEmits(['select-fragment', 'switch-tab', 'update:book'])

const fragments = ref<Fragment[]>([])
const selectedFragmentId = ref<string | null>(null)

// 处理切换
const handleToggle = (tab: 'chapters' | 'fragments') => {
  emit('switch-tab', tab)
}

// 获取片段预览
const getPreview = (content: string): string => {
  if (!content) return '无内容'
  return content.length > 50 ? `${content.substring(0, 50)  }...` : content
}

// 监听片段保存事件
onMounted(() => {
  // 检查是否在 Electron 环境中
  if (window.electronAPI && typeof window.electronAPI.onFragmentSaved === 'function') {
    window.electronAPI.onFragmentSaved(async (savedFragment) => {
      // 保存片段到列表
      const index = fragments.value.findIndex(f => f.id === savedFragment.id)
      if (index > -1) {
        fragments.value[index] = savedFragment
      } else {
        fragments.value.push(savedFragment)
      }

      // 保存到小说文件，等待保存完成
      try {
        await saveFragmentsToBook()
      } catch (error) {
        console.error('保存片段到书籍失败:', error)
      }
    })
  }
})

// 创建新的浮动片段
const createFloatingFragment = async () => {
  if (!props.currentBook) {
    ElMessage.error('当前没有打开的书籍')
    return
  }

  const newFragment = {
    id: uuidv4(),
    title: '新片段',
    content: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // 检查是否在 Electron 环境中
  if (window.electronAPI && typeof window.electronAPI.createFragmentWindow === 'function') {
    try {
      // 使用Electron API创建真正的独立窗口
      const result = await window.electronAPI.createFragmentWindow(newFragment)

      if (!result.success) {
        ElMessage.error(`创建片段窗口失败: ${result.message || '未知错误'}`)
      }
    } catch (error) {
      console.error('创建片段窗口失败:', error)
      ElMessage.error('创建窗口失败')
    }
  } else {
    // Web环境下的回退处理
    ElMessage.info('Web环境下不支持创建浮动片段窗口')
  }
}

// 从AI生成内容创建片段
const createFragmentFromContent = (content: string, title: string) => {
  if (!props.currentBook) {
    ElMessage.error('当前没有打开的书籍')
    return
  }

  // 创建新片段
  const newFragment = {
    id: uuidv4(),
    title: title || '新片段',
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  try {
    // 使用Electron API创建真正的独立窗口
    window.electronAPI.createFragmentWindow(newFragment)
  } catch (error) {
    console.error('创建片段窗口失败:', error)
    ElMessage.error('创建窗口失败')
  }
}

// 选择片段
const selectFragment = (fragment: Fragment) => {
  selectedFragmentId.value = fragment.id
  emit('select-fragment', fragment)
  
  // 打开片段窗口
  try {
    // 创建纯JavaScript对象副本，确保可序列化
    const serializable = {
      // 确保ID不为空，如果为空则生成一个
      id: fragment.id || uuidv4(),
      title: fragment.title,      // 确保标题被包含
      content: fragment.content,
      createdAt: fragment.createdAt, 
      updatedAt: fragment.updatedAt
    }
    
    window.electronAPI.createFragmentWindow(serializable)
  } catch (error) {
    console.error('打开片段窗口失败:', error)
    ElMessage.error('打开片段窗口失败')
  }
}

// 删除片段
const removeFragment = (fragment: Fragment) => {
  if (!props.currentBook) return

  const index = fragments.value.findIndex(f => f.id === fragment.id)
  if (index > -1) {
    fragments.value.splice(index, 1)
    saveFragmentsToBook()
    ElMessage.success('片段已删除')
    
    if (selectedFragmentId.value === fragment.id) {
      selectedFragmentId.value = null
    }
  }
}

// 保存片段到书籍
const saveFragmentsToBook = async () => {
  if (!props.currentBook) return

  try {
    const updatedBook: Book = {
      ...props.currentBook,
      fragments: fragments.value,
      lastEdited: new Date()
    }
    
    emit('update:book', updatedBook)
  } catch (error) {
    console.error('保存片段失败:', error)
    ElMessage.error('保存片段失败')
  }
}

// 从书籍加载片段
const loadFragments = () => {
  if (!props.currentBook) return
  
  if (props.currentBook.fragments && props.currentBook.fragments.length > 0) {
    fragments.value = props.currentBook.fragments
  } else {
    fragments.value = []
  }
}

// 监听书籍变化，重新加载片段
import { watch } from 'vue'
watch(() => props.currentBook, () => {
  loadFragments()
}, { immediate: true, deep: true })

// 导出方法供外部使用
defineExpose({
  createFragmentFromContent
})
</script>

<style scoped>
.fragment-pane {
  @apply bg-white rounded-lg shadow p-4 h-full overflow-hidden flex flex-col;
}

.header-row {
  @apply flex items-center justify-between mb-4;
}

.action-buttons {
  @apply flex gap-2;
}

.action-button {
  @apply flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 cursor-pointer bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transform: translateY(0);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-button:hover {
  @apply transform scale-105 shadow-md;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.btn-danger {
  @apply flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 text-sm;
}

.fragment-list {
  @apply flex-1 overflow-auto bg-gray-50/50 rounded-lg;
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.fragment-item {
  @apply border-b border-gray-100 p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition-colors duration-200;
  align-items: center;
  min-height: 56px;
  padding: 12px 16px;
}

.fragment-item:hover {
  @apply bg-gray-50;
}

.fragment-item.active {
  @apply bg-blue-50 border-blue-200;
}

.fragment-content {
  @apply flex-1 mr-3;
  min-width: 0;
  overflow: hidden;
}

.fragment-title {
  @apply font-medium mb-1 text-gray-800 leading-tight;
  font-weight: 500;
  line-height: 1.4;
}

.fragment-preview {
  @apply text-sm text-gray-500 line-clamp-2 leading-relaxed;
  line-height: 1.4;
  color: rgba(55, 65, 81, 0.8);
}

.fragment-actions {
  @apply flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200;
}

.empty-state {
  @apply text-center text-gray-400 p-6;
  color: rgba(107, 114, 128, 0.8);
}
</style> 