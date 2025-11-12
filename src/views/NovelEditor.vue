<template>
  <div class="novel-editor-page">
    <div class="editor-header">
      <div class="title-section">
        <div class="left-section">
          <button
            class="back-btn group"
            @click="backToLibrary"
          >
            <span class="back-icon group-hover:-translate-x-1 transition-transform duration-200">←</span> 返回书库
          </button>
        </div>
        <div class="center-section">
          <h1 class="text-2xl font-bold book-title">
            {{ bookTitle || '小说编辑器' }}
          </h1>
        </div>
        <div class="right-section">
          <button
            class="outline-btn group"
            @click="showOutline = true"
          >
            <span class="outline-icon group-hover:scale-110 transition-transform duration-200">📝</span> 大纲
          </button>
          <button
            class="outline-btn group"
            @click="openSettings"
          >
            <span class="outline-icon group-hover:scale-110 transition-transform duration-200">🔧</span> 设置
          </button>
        </div>
      </div>
      <OutlinePanel
        :show="showOutline"
        :current-book="currentBook"
        :current-chapter="currentChapter"
        @close="showOutline = false"
      />
      <OutlineDetail
        :show="showDetailOutline"
        :current-book="currentBook"
        :current-chapter="currentChapter"
        @close="showDetailOutline = false"
      />
    </div>
    <div class="editor-main">
      <div class="editor-sidebar">
        <ChapterTree
          v-if="activeTab === 'chapters'"
          :chapters="currentBook?.content || []"
          :current-book="currentBook"
          @update:chapters="handleChaptersUpdate"
          @select-chapter="handleChapterSelect"
          @switch-tab="handleSwitchTab"
        />
        <FragmentPane
          v-else
          :book-id="currentBook?.id || ''"
          :current-book="currentBook"
          @switch-tab="handleSwitchTab"
          @update:book="handleBookUpdate"
        />
      </div>
      <div class="editor-content">
        <TextEditor
          :current-chapter="currentChapter"
          :current-book="currentBook"
          @save-content="handleSaveContent"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { BookConfigService, type Chapter, type Book } from '../services/bookConfigService'

// 异步加载大型组件
const OutlinePanel = defineAsyncComponent(() => import('../components/OutlinePanel.vue'))
const OutlineDetail = defineAsyncComponent(() => import('../components/OutlineDetail.vue'))
const TextEditor = defineAsyncComponent(() => import('../components/TextEditor.vue'))
const ChapterTree = defineAsyncComponent(() => import('../components/ChapterTree.vue'))
const FragmentPane = defineAsyncComponent(() => import('../components/FragmentPane.vue'))

const router = useRouter()
const bookTitle = ref('')
const currentChapter = ref<Chapter | null>(null)
const showOutline = ref(false)
const showDetailOutline = ref(false)
const currentBook = ref<Book | null>(null)
const activeTab = ref<'chapters' | 'fragments'>('chapters')

const handleChapterSelect = async (chapter: Chapter) => {
  if (chapter.type === 'chapter' && currentBook.value) {
    const findChapter = (chapters: Chapter[]): Chapter | undefined => {
      for (const ch of chapters) {
        if (ch.id === chapter.id) return ch
        if (ch.children) {
          const found = findChapter(ch.children)
          if (found) return found
        }
      }
      return undefined
    }

    const latestChapter = findChapter(currentBook.value.content)
    if (latestChapter) {
      currentChapter.value = JSON.parse(JSON.stringify(latestChapter))
    } else {
      currentChapter.value = null
    }
  }
}

// 处理标签页切换
const handleSwitchTab = (tab: 'chapters' | 'fragments') => {
  activeTab.value = tab
}

const handleChaptersUpdate = async (chapters: Chapter[]) => {
  if (!currentBook.value) return

  currentBook.value = {
    ...currentBook.value,
    content: chapters,
    lastEdited: new Date()
  }

  await BookConfigService.saveBook(currentBook.value)
}

const handleSaveContent = async (chapterId: string, content: string) => {
  if (!currentBook.value) return

  const updateChapters = (chapters: Chapter[]): Chapter[] => {
    return chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          content
        }
      }
      if (ch.children) {
        return {
          ...ch,
          children: updateChapters(ch.children)
        }
      }
      return ch
    })
  }

  currentBook.value = {
    ...currentBook.value,
    content: updateChapters(currentBook.value.content),
    lastEdited: new Date()
  }

  await BookConfigService.saveBook(currentBook.value)
}

const handleBookUpdate = async (book: Book) => {
  if (!currentBook.value) return

  currentBook.value = {
    ...currentBook.value,
    ...book,
    lastEdited: new Date()
  }

  await BookConfigService.saveBook(currentBook.value)
}

const backToLibrary = () => {
  router.push('/')
}

// 定义事件处理函数
let switchToFragmentsHandler: (() => void) | null = null;

onMounted(async () => {
  const currentBookId = localStorage.getItem('currentBookId')
  if (currentBookId) {
    try {
      const book = await BookConfigService.getBook(currentBookId)
      if (book) {
        bookTitle.value = book.title
        currentBook.value = book
      }
    } catch (e) {
      console.error('获取书籍信息失败', e)
    }
  }

  // 监听从主进程发来的切换到片段栏的消息
  if (window.electronAPI) {
    // 注册一个监听器，监听switch-to-fragments事件
    switchToFragmentsHandler = () => {
      activeTab.value = 'fragments';
    };

    // 自定义事件监听
    document.addEventListener('switch-to-fragments', switchToFragmentsHandler);
  }
})

// 在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  if (switchToFragmentsHandler) {
    document.removeEventListener('switch-to-fragments', switchToFragmentsHandler);
  }
});

// 打开系统设置
const openSettings = () => {
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
.novel-editor-page {
  @apply flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden;
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 100vh;
  padding: 3rem !important;
  box-sizing: border-box !important;
}

.editor-header {
  @apply p-8 bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100/80 sticky top-0 z-20;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(20px);
  position: relative;
  padding-left: 2rem;
  padding-right: 2rem;
  margin-left: 1rem;
  margin-right: 1rem;
  border-radius: 0 0 1rem 1rem;
}

.editor-header:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
}

.title-section {
  @apply flex items-center justify-between gap-6 max-w-6xl mx-auto;
  position: relative;
  width: 100%;
  max-width: 100%;
  align-items: center;
  min-height: 60px;
  padding: 0 1rem;
}

.left-section {
  @apply flex-shrink-0;
  position: static;
  z-index: 10;
  min-width: 0;
  display: flex;
  align-items: center;
}

.center-section {
  @apply flex-1 flex justify-center;
  position: static;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-align: center;
}

.back-btn {
  @apply flex items-center gap-3 px-8 py-4 text-base font-medium text-gray-700 bg-white border border-gray-200/80 rounded-2xl hover:bg-gray-50 hover:border-gray-300/80 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-md;
  min-width: fit-content;
  white-space: nowrap;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.back-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.05), rgba(209, 213, 219, 0.05));
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: inherit;
}

.back-btn:hover:before {
  opacity: 1;
}

.back-btn:active {
  transform: translateY(0.25rem);
}

.back-btn:hover {
  transform: translateY(-1px);
}

.back-icon {
  @apply text-2xl transition-transform duration-300 group-hover:scale-110;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.editor-main {
  @apply flex-1 flex gap-6 min-h-0;
  display: flex !important;
  flex-direction: row !important;
  min-height: 0 !important;
  overflow: hidden !important;
  max-height: calc(100vh - 120px);
  align-items: stretch;
  position: relative;
  padding: 2rem 2rem;
  padding-top: 2rem;
}

.editor-main:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent);
}

.editor-sidebar {
  @apply flex-shrink-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80;
  flex-shrink: 0 !important;
  width: 320px !important;
  overflow: hidden !important;
  max-height: calc(100vh - 160px);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin: 0.5rem;
}

.editor-content {
  @apply flex-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
  max-height: calc(100vh - 160px);
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  margin: 0.5rem;
}

.right-section {
  @apply flex-shrink-0 flex items-center gap-4;
  position: static;
  z-index: 10;
  min-width: 0;
  display: flex;
  align-items: center;
}

.outline-btn {
  @apply flex items-center gap-3 px-8 py-4 text-base font-medium text-gray-700 bg-white border border-gray-200/80 rounded-2xl hover:bg-gray-50 hover:border-gray-300/80 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-md;
  min-width: fit-content;
  white-space: nowrap;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.outline-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(147, 197, 253, 0.03));
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: inherit;
}

.outline-btn:hover:before {
  opacity: 1;
}

.outline-btn:active {
  transform: translateY(0.25rem);
}

.outline-btn:hover {
  transform: translateY(-1px);
}

.outline-icon {
  @apply text-2xl transition-transform duration-300 group-hover:scale-110;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.book-title {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @apply text-2xl font-bold text-gray-800 leading-tight;
  font-family: "Microsoft YaHei", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", Arial, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* 响应式设计优化 */
@media (max-width: 1440px) {
  .editor-sidebar {
    width: 300px !important;
  }
  
  .editor-main {
    padding: 1.5rem 1.5rem;
    gap: 1.5rem;
  }
  
  .title-section {
    gap: 2rem;
  }
  
  .editor-header {
    padding: 1.5rem 1.5rem;
  }
}

@media (max-width: 1280px) {
  .editor-sidebar {
    width: 280px !important;
  }
  
  .editor-main {
    padding: 1.25rem 1.25rem;
    gap: 1.25rem;
  }
  
  .title-section {
    gap: 1.5rem;
  }
  
  .editor-header {
    padding: 1.25rem 1.25rem;
  }
}

@media (max-width: 1024px) {
  .editor-sidebar {
    width: 260px !important;
  }
  
  .editor-main {
    padding: 1rem 1rem;
    gap: 1rem;
  }
  
  .title-section {
    gap: 1rem;
  }
  
  .editor-header {
    padding: 1rem 1rem;
  }
}

@media (max-width: 768px) {
  .title-section {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    max-width: 100%;
    padding: 0 0.5rem;
  }
  
  .center-section {
    order: -1;
  }
  
  .editor-main {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1rem;
  }
  
  .editor-sidebar {
    width: 100% !important;
    max-height: 250px;
    margin: 0.25rem;
  }
  
  .editor-content {
    max-height: calc(100vh - 350px);
    margin: 0.25rem;
  }
  
  .back-btn {
    justify-content: center;
    width: 100%;
    max-width: 200px;
  }
  
  .outline-btn {
    justify-content: center;
    width: 100%;
    max-width: 120px;
  }
  
  .editor-header {
    padding: 1rem 0.75rem;
    margin: 0 0.5rem;
  }
}

@media (max-width: 640px) {
  .editor-main {
    gap: 0.75rem;
    padding: 0.75rem 0.75rem;
  }
  
  .editor-sidebar {
    max-height: 200px;
    margin: 0.125rem;
  }
  
  .editor-content {
    max-height: calc(100vh - 300px);
    margin: 0.125rem;
  }
  
  .title-section {
    gap: 0.75rem;
    padding: 0 0.25rem;
  }
  
  .book-title {
    font-size: 1.5rem;
  }
  
  .editor-header {
    padding: 0.75rem 0.5rem;
    margin: 0 0.25rem;
  }
}

/* 滚动条美化 */
.editor-sidebar::-webkit-scrollbar,
.editor-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.editor-sidebar::-webkit-scrollbar-track,
.editor-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.editor-sidebar::-webkit-scrollbar-thumb,
.editor-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.editor-sidebar::-webkit-scrollbar-thumb:hover,
.editor-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>