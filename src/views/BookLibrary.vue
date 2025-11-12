<template>
  <div class="book-library-page">
    <AIConfigModal v-model:show-a-i-config-modal="showAIConfigModal" />
    <div class="library-header">
      <div class="header-left">
        <button
          class="config-btn group"
          @click="showAIConfigModal = true"
        >
          <span class="icon group-hover:scale-110 transition-transform">⚙️</span> AI配置
        </button>
        <button
          class="config-btn group"
          @click="openSettings"
        >
          <span class="icon group-hover:scale-110 transition-transform">🔧</span> 系统设置
        </button>
      </div>
      <div class="header-center">
        <h1 class="page-title">
          我的书库
        </h1>
      </div>
      <div class="header-right">
        <button
          class="create-btn group"
          @click="showCreateModal = true"
        >
          <span class="icon group-hover:scale-110 transition-transform">+</span> 创建新书
        </button>
      </div>
    </div>

    <div
      v-if="books.length > 0"
      class="books-container"
    >
      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
      >
        <div class="book-info">
          <h2 class="book-title">
            {{ book.title }}
          </h2>
          <p class="book-desc">
            {{ book.description || '暂无简介' }}
          </p>
          <p class="book-meta">
            最后编辑: {{ formatDate(book.lastEdited) }}
          </p>
        </div>
        <div class="book-actions">
          <button
            class="open-btn"
            @click="openBook(book)"
          >
            打开
          </button>
          <button
            class="edit-btn"
            @click="editBook(book)"
          >
            编辑
          </button>
          <button
            class="delete-btn"
            @click="confirmDelete(book)"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">
        📚
      </div>
      <p class="empty-text">
        您的书库还没有书籍
      </p>
      <p class="empty-subtext">
        点击"创建新书"按钮开始您的创作之旅
      </p>
    </div>

    <!-- 创建书籍对话框 -->
    <div
      v-if="showCreateModal"
      class="modal-overlay"
      @click="closeModal"
    />
    <div
      v-if="showCreateModal"
      class="modal"
    >
      <div class="modal-header">
        <h2 class="modal-title">
          {{ editingBook ? '编辑书籍' : '创建新书' }}
        </h2>
        <button
          class="modal-close"
          @click="closeModal"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="bookTitle">书名</label>
          <input
            id="bookTitle"
            v-model="newBook.title"
            type="text"
            placeholder="请输入书名"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label for="bookDesc">简介</label>
          <div class="desc-input-group">
            <textarea
              id="bookDesc"
              v-model="newBook.description"
              placeholder="请输入书籍简介"
              class="form-textarea"
            />
            <button
              class="ai-gen-btn"
              @click="showAIGenModal = true"
            >
              <span class="icon">🤖</span> AI生成
            </button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="cancel-btn"
          @click="closeModal"
        >
          取消
        </button>
        <button
          class="save-btn"
          @click="saveBook"
        >
          保存
        </button>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click="cancelDelete"
    />
    <div
      v-if="showDeleteModal"
      class="modal"
    >
      <div class="modal-header">
        <h2 class="modal-title">
          确认删除
        </h2>
        <button
          class="modal-close"
          @click="cancelDelete"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <p class="confirm-text">
          确定要删除《{{ bookToDelete?.title }}》吗？此操作不可恢复。
        </p>
      </div>
      <div class="modal-footer">
        <button
          class="cancel-btn"
          @click="cancelDelete"
        >
          取消
        </button>
        <button
          class="delete-confirm-btn"
          @click="deleteBook"
        >
          确认删除
        </button>
      </div>
    </div>

    <!-- AI生成对话框 -->
    <div
      v-if="showAIGenModal"
      class="modal-overlay"
      @click="showAIGenModal = false"
    />
    <div
      v-if="showAIGenModal"
      class="modal"
    >
      <div class="modal-header">
        <h2 class="modal-title">
          AI生成书名简介
        </h2>
        <button
          class="modal-close"
          @click="showAIGenModal = false"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>输入内容</label>
          <textarea
            v-model="aiInputContent"
            placeholder="输入任何有关小说的内容，越详细越好……"
            class="form-textarea h-40"
            :disabled="isGenerating"
          />
        </div>
        <div class="form-group">
          <label>AI输出</label>
          <textarea
            v-model="aiOutputContent"
            placeholder="AI生成的内容将显示在这里"
            class="form-textarea h-40"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="cancel-btn"
          @click="showAIGenModal = false"
        >
          取消
        </button>
        <button
          class="apply-btn"
          :disabled="!aiOutputContent.trim()"
          @click="applyAIContent"
        >
          应用
        </button>
        <button
          class="save-btn"
          :disabled="isGenerating || !aiInputContent.trim()"
          @click="generateDescription"
        >
          {{ isGenerating ? '生成中...' : '生成' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { BookConfigService } from '../services/bookConfigService'
import { Book } from '../services/bookConfigService'
import { replaceBookNameAndDescPromptVariables } from '../services/promptVariableService'

// 异步加载AI配置模态框
const AIConfigModal = defineAsyncComponent(() => import('../components/AIConfigModal.vue'))

const router = useRouter()
const books = ref<Book[]>([])
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingBook = ref<Book | null>(null)
const bookToDelete = ref<Book | null>(null)

const newBook = reactive({
  title: '',
  description: ''
})

const loadBooks = async () => {
  try {
    books.value = await BookConfigService.listBooks()
  } catch (error) {
    console.error('加载书籍数据失败', error)
    books.value = []
  }
}

const saveBooks = async () => {
  for (const book of books.value) {
    try {
      await BookConfigService.saveBook(book)
    } catch (error) {
      console.error('保存书籍失败', error)
      ElMessage.error(error instanceof Error ? error.message : String(error))
    }
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openBook = (book: Book) => {
  // 保存当前选中的书籍ID到本地存储
  localStorage.setItem('currentBookId', book.id)
  // 导航到编辑器页面
  router.push(`/novel-editor/${book.id}`)
}

const editBook = (book: Book) => {
  editingBook.value = book
  newBook.title = book.title
  newBook.description = book.description || ''
  showCreateModal.value = true
}

const confirmDelete = (book: Book) => {
  bookToDelete.value = book
  showDeleteModal.value = true
}

const deleteBook = async () => {
  if (bookToDelete.value) {
    try {
      await BookConfigService.deleteBook(bookToDelete.value.id)
      books.value = books.value.filter(b => b.id !== bookToDelete.value?.id)
      showDeleteModal.value = false
      bookToDelete.value = null
    } catch (error) {
      console.error('删除书籍失败', error)
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  bookToDelete.value = null
}

const saveBook = () => {
  if (!newBook.title.trim()) {
    alert('请输入书名')
    return
  }

  if (editingBook.value) {
    // 编辑现有书籍
    const index = books.value.findIndex(b => b.id === editingBook.value?.id)
    if (index !== -1) {
      books.value[index] = {
        ...books.value[index],
        title: newBook.title,
        description: newBook.description,
        lastEdited: new Date()
      }
    }
  } else {
    // 创建新书籍
    const newBookObj: Book = {
      id: Date.now().toString(),
      title: newBook.title,
      description: newBook.description,
      content: [],
      lastEdited: new Date(),
      setting: '',
      plot: ''
    }
    books.value.push(newBookObj)
  }

  saveBooks()
  closeModal()
}

const closeModal = () => {
  showCreateModal.value = false
  editingBook.value = null
  newBook.title = ''
  newBook.description = ''
}

const showAIConfigModal = ref(false)
const showAIGenModal = ref(false)
const aiInputContent = ref('')
const aiOutputContent = ref('')
const isGenerating = ref(false)

// 初始化数据和配置
onMounted(async () => {
  try {
    // 加载书籍数据
    loadBooks()
  } catch (error) {
    console.error('初始化失败:', error)
  }
})

import { ElMessage } from '../utils/message'

import AIService from '../services/aiService'
import { AIConfigService } from '../services/aiConfigService'

const generateDescription = async () => {
  const aiConfig = await AIConfigService.getCurrentProviderConfig();
  const aiService = new AIService(aiConfig);

  isGenerating.value = true
  try {
    const prompt = await replaceBookNameAndDescPromptVariables(aiInputContent.value)
    const result = await aiService.generateText(prompt)
    aiOutputContent.value = typeof result === 'string' ? result : (result as any)?.text || ''
    ElMessage.success('生成成功')
  } catch (error) {
    console.error('AI生成失败:', error)
    if (error instanceof Error) {
      ElMessage.error(`AI生成失败：${error.message}`)
    } else {
      ElMessage.error('AI生成失败，请检查网络连接和API配置')
    }
  } finally {
    isGenerating.value = false
  }
}
const applyAIContent = () => {
  const content = aiOutputContent.value
  const titleMatch = content.match(/书名[:：]\s*([^\n]+)/)
  const descMatch = content.match(/简介[:：]\s*([\s\S]*?)(?=\n\n|$)/)

  if (titleMatch && descMatch) {
    newBook.title = titleMatch[1].trim()
    newBook.description = descMatch[1].trim()
    showAIGenModal.value = false
    showCreateModal.value = true
  } else {
    ElMessage.warning('无法解析AI输出内容，请确保格式正确')
  }
}

// 打开系统设置
const openSettings = () => {
  console.log('打开系统设置按钮被点击')
  // 优先使用Electron/Web统一API
  if (window.electronAPI && typeof window.electronAPI.openSettings === 'function') {
    window.electronAPI.openSettings()
  } else {
    // 回退到自定义事件（Web环境兼容）
    window.dispatchEvent(new CustomEvent('open-settings'))
  }
}
</script>

<style scoped>
.book-library-page {
  @apply min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-auto p-6 pb-8;
}

.library-header {
  @apply flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0 mb-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100;
}

.header-left {
  @apply flex items-center gap-3 flex-wrap;
}

.header-center {
  @apply flex-1 flex justify-center lg:justify-start;
}

.header-right {
  @apply flex items-center gap-3 flex-wrap;
}

.page-title {
  @apply text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight;
  font-family: "Microsoft YaHei", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  transform: scale(1);
  transition: all 0.3s ease;
}

.page-title:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.config-btn {
  @apply flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-0.5;
}

.config-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.create-btn {
  @apply flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl;
}

.create-btn:active {
  transform: scale(0.98) translateY(0.5px);
}

.icon {
  @apply text-lg;
}

.books-container {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-8;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.book-card {
  @apply bg-white rounded-2xl shadow-lg border border-gray-50 p-6 flex flex-col w-full min-w-[280px] hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer transform;
}

.book-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.book-info {
  @apply flex-1;
}

.book-title {
  @apply text-lg font-semibold mb-3 text-gray-800 leading-tight;
}

.book-desc {
  @apply text-sm text-gray-600 mb-3 line-clamp-3;
}

.book-meta {
  @apply text-xs text-gray-500 mb-4 flex items-center gap-1;
}

.book-meta::before {
  content: "🕒";
  margin-right: 0.25rem;
}

.book-actions {
  @apply flex gap-2 mt-3 justify-center;
}

.edit-btn {
  @apply px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors;
}

.open-btn {
  @apply px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all;
}

.delete-btn {
  @apply px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors;
}

.empty-state {
  @apply flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-lg border border-gray-50 p-12;
}

.empty-icon {
  @apply text-6xl mb-6 filter drop-shadow-sm;
}

.empty-text {
  @apply text-2xl font-bold text-gray-800 mb-3 text-center;
}

.empty-subtext {
  @apply text-sm text-gray-600 text-center leading-relaxed;
}

/* 模态框优化 */
.modal {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  background-color: white !important;
  border-radius: 1rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 15px -3px rgba(0, 0, 0, 0.15) !important;
  z-index: 10001 !important;
  width: 95% !important;
  max-width: 42rem !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  max-height: 90vh !important;
  backdrop-filter: blur(10px);
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-all duration-300;
  z-index: 10000 !important;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100;
}

.modal-title {
  @apply text-2xl font-bold text-gray-800;
}

.modal-close {
  @apply text-2xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer;
}

.modal-body {
  @apply p-6 overflow-y-auto flex-1 overflow-x-hidden;
}

.modal-footer {
  @apply flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50;
}

.form-group {
  @apply mb-5;
}

.form-input,
.form-textarea {
  @apply w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-all duration-200;
}

.form-textarea {
  @apply h-32 resize-y;
}

.desc-input-group {
  @apply relative;
}

.ai-gen-btn {
  @apply absolute right-3 top-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium;
  opacity: 0.8;
  transform: translateY(2px);
}

.ai-gen-btn:hover {
  opacity: 1;
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.h-40 {
  height: 16rem;
}

.modal-actions {
  @apply flex gap-2;
}

.cancel-btn {
  @apply px-6 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors;
}

.save-btn {
  @apply px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all;
}

.delete-confirm-btn {
  @apply px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all;
}

.confirm-text {
  @apply text-center py-4 text-gray-700 text-lg leading-relaxed;
}

.apply-btn {
  @apply px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all;
}
</style>