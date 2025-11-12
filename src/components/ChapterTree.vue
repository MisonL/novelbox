<template>
  <div class="chapter-tree">
    <div class="header-row">
      <SidebarToggle 
        initial-tab="chapters" 
        @toggle="handleToggle" 
      />
      <div class="action-buttons">
        <el-tooltip
          content="导出Word"
          placement="top"
        >
          <el-button
            class="action-button"
            circle
            @click="exportWord"
          >
            <el-icon>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
              >
                <path
                  fill="currentColor"
                  d="M19.5 4h-3V2.5A2.5 2.5 0 0 0 14 0H8a2.5 2.5 0 0 0-2.5 2.5V4h-3A1.5 1.5 0 0 0 1 5.5v15A1.5 1.5 0 0 0 2.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19.5 4zM7 2.5c0-.3.2-.5.5-.5h7c.3 0 .5.2.5.5V4H7V2.5zm12 17c0 .3-.2.5-.5.5h-15c-.3 0-.5-.2-.5-.5v-12c0-.3.2-.5.5-.5h15c.3 0 .5.2.5.5v12z"
                />
                <path
                  fill="currentColor"
                  d="M12.7 14.9l-1.3-1.3V18c0 .6-.4 1-1 1s-1-.4-1-1v-4.4l-1.3 1.3c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l3-3c.4-.4 1-.4 1.4 0l3 3c.4.4.4 1 0 1.4s-1 .4-1.4 0z"
                />
              </svg>
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip
          content="添加卷"
          placement="top"
        >
          <el-button
            class="action-button"
            circle
            @click="addVolume"
          >
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <el-tree
      :data="chapters"
      node-key="id"
      :expand-on-click-node="false"
      default-expand-all
      class="custom-tree"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <div class="node-content">
            <span v-if="editingNodeId !== data.id">{{ data.title }}</span>
            <el-input
              v-else
              ref="editInput"
              v-model="data.title"
              size="small"
              @blur="finishEdit(data)"
              @keyup.enter="finishEdit(data)"
            />
          </div>
          <div class="node-actions">
            <template v-if="editingNodeId !== data.id">
              <el-tooltip
                v-if="data.type === 'volume'"
                content="添加章节"
                placement="top"
              >
                <el-button
                  circle
                  size="small"
                  @click="addChapter(data)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip
                content="重命名"
                placement="top"
              >
                <el-button
                  circle
                  size="small"
                  @click="startEdit(data)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip
                content="删除"
                placement="top"
              >
                <el-button
                  circle
                  size="small"
                  type="danger"
                  @click="removeNode(node, data)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import { type Chapter } from '../services/bookConfigService'
import { DocumentService } from '../services/documentService'
import SidebarToggle from './SidebarToggle.vue'

const props = defineProps<{
  chapters: Chapter[],
  currentBook: any
}>()

const emit = defineEmits(['update:chapters', 'select-chapter', 'switch-tab'])

const editInput = ref<any>(null)
const editingNodeId = ref<string | null>(null)

// 处理切换
const handleToggle = (tab: 'chapters' | 'fragments') => {
  emit('switch-tab', tab)
}

/**
 * 添加新卷
 * 在章节列表中添加一个新的卷节点
 * 验证章节列表的有效性，创建新卷对象并更新列表
 * 添加后自动进入编辑状态，聚焦到标题输入框
 * 如果添加失败，显示错误提示
 */
const addVolume = () => {
  try {
    // 验证输入
    if (!props.chapters || !Array.isArray(props.chapters)) {
      console.error('章节列表无效');
      ElMessage.error('章节列表无效');
      return;
    }
    
    const newVolume: Chapter = {
      id: uuidv4(),
      title: '新卷',
      type: 'volume',
      children: [],
      detailOutline: {
        chapterNumber: '',
        detailContent: ''
      }
    }
    
    const updatedChapters = [...props.chapters, newVolume]
    emit('update:chapters', updatedChapters)
    editingNodeId.value = newVolume.id
    
    nextTick(() => {
      if (editInput.value) {
        editInput.value.focus()
      }
    })
  } catch (error) {
    console.error('添加新卷失败:', error);
    ElMessage.error('添加新卷失败');
  }
}

/**
 * 添加新章节
 * 在指定卷中添加一个新的章节节点
 * 验证卷参数的有效性，确保只能向卷中添加章节
 * 创建新章节对象并更新列表
 * 添加后自动进入编辑状态，聚焦到标题输入框
 * 如果添加失败，显示错误提示
 * @param volume - 要添加章节的卷对象
 */
const addChapter = (volume: Chapter) => {
  try {
    // 验证卷参数
    if (!volume || typeof volume !== 'object') {
      console.error('卷参数无效');
      ElMessage.error('卷参数无效');
      return;
    }
    
    if (volume.type !== 'volume') {
      console.error('只能向卷中添加章节');
      ElMessage.error('只能向卷中添加章节');
      return;
    }
    
    // 确保children数组存在
    if (!volume.children) {
      volume.children = []
    }
    
    const newChapter: Chapter = {
      id: uuidv4(),
      title: '新章节',
      type: 'chapter',
      content: '',
      detailOutline: {
        chapterNumber: '',
        detailContent: ''
      }
    }
    
    volume.children.push(newChapter)
    emit('update:chapters', [...props.chapters])
    editingNodeId.value = newChapter.id
    
    nextTick(() => {
      if (editInput.value) {
        editInput.value.focus()
      }
    })
  } catch (error) {
    console.error('添加新章节失败:', error);
    ElMessage.error('添加新章节失败');
  }
}

/**
 * 开始编辑节点
 * 将指定节点设置为编辑状态，显示标题输入框
 * 验证节点数据的有效性，确保节点ID存在
 * 设置编辑状态后，聚焦到标题输入框
 * 如果开始编辑失败，显示错误提示
 * @param data - 要编辑的节点数据
 */
const startEdit = (data: Chapter) => {
  try {
    // 验证数据
    if (!data || typeof data !== 'object') {
      console.error('节点数据无效');
      ElMessage.error('节点数据无效');
      return;
    }
    
    if (!data.id || typeof data.id !== 'string') {
      console.error('节点ID无效');
      ElMessage.error('节点ID无效');
      return;
    }
    
    editingNodeId.value = data.id
    
    nextTick(() => {
      if (editInput.value) {
        editInput.value.focus()
      }
    })
  } catch (error) {
    console.error('开始编辑节点失败:', error);
    ElMessage.error('开始编辑节点失败');
  }
}

/**
 * 完成编辑
 * 退出编辑状态，保存节点标题
 * 验证节点数据和标题的有效性
 * 如果标题为空，使用默认标题并显示警告
 * 更新章节列表，触发重新渲染
 * 如果完成编辑失败，显示错误提示
 * @param data - 编辑完成的节点数据
 */
const finishEdit = (data: Chapter) => {
  try {
    // 验证数据
    if (!data || typeof data !== 'object') {
      console.error('节点数据无效');
      ElMessage.error('节点数据无效');
      return;
    }
    
    if (!data.title || typeof data.title !== 'string') {
      console.error('节点标题无效');
      ElMessage.error('节点标题无效');
      return;
    }
    
    if (!data.title.trim()) {
      ElMessage.warning('标题不能为空');
      data.title = data.type === 'volume' ? '新卷' : '新章节';
    }
    
    editingNodeId.value = null;
    emit('update:chapters', [...props.chapters]);
  } catch (error) {
    console.error('完成编辑失败:', error);
    ElMessage.error('完成编辑失败');
  }
}

/**
 * 删除节点
 * 从章节树中删除指定的节点
 * 支持删除根节点（卷）和子节点（章节）
 * 验证节点参数的有效性，确保节点ID存在
 * 根据节点层级执行不同的删除逻辑
 * 如果删除失败，显示错误提示
 * @param node - 要删除的节点信息
 * @param data - 要删除的节点数据
 */
const removeNode = (node: any, data: Chapter) => {
  try {
    // 验证参数
    if (!node || typeof node !== 'object') {
      console.error('节点参数无效');
      ElMessage.error('节点参数无效');
      return;
    }
    
    if (!data || typeof data !== 'object') {
      console.error('节点数据无效');
      ElMessage.error('节点数据无效');
      return;
    }
    
    if (!data.id || typeof data.id !== 'string') {
      console.error('节点ID无效');
      ElMessage.error('节点ID无效');
      return;
    }
    
    if (node.level === 1) {
      // 删除根节点(卷)
      const index = props.chapters.findIndex(item => item.id === data.id)
      if (index === -1) {
        console.warn('未找到要删除的卷');
        ElMessage.warning('未找到要删除的卷');
        return;
      }
      
      const updatedChapters = [...props.chapters]
      updatedChapters.splice(index, 1)
      emit('update:chapters', updatedChapters)
    } else {
      // 删除子节点(章节)
      const parent = node.parent
      if (!parent || !parent.data) {
        console.warn('未找到父节点');
        ElMessage.warning('未找到父节点');
        return;
      }
      
      const children = parent.data.children || []
      const index = children.findIndex((item: Chapter) => item.id === data.id)
      if (index === -1) {
        console.warn('未找到要删除的章节');
        ElMessage.warning('未找到要删除的章节');
        return;
      }
      
      children.splice(index, 1)
      emit('update:chapters', [...props.chapters])
    }
  } catch (error) {
    console.error('删除节点失败:', error);
    ElMessage.error('删除节点失败');
  }
}

/**
 * 处理节点点击
 * 当用户点击章节树中的节点时，触发章节选择事件
 * 验证节点数据的有效性，确保节点ID存在
 * 通知父组件当前选中的章节
 * 如果处理失败，显示错误提示
 * @param data - 被点击的节点数据
 */
const handleNodeClick = (data: Chapter) => {
  try {
    // 验证数据
    if (!data || typeof data !== 'object') {
      console.error('节点数据无效');
      ElMessage.error('节点数据无效');
      return;
    }
    
    if (!data.id || typeof data.id !== 'string') {
      console.error('节点ID无效');
      ElMessage.error('节点ID无效');
      return;
    }
    
    emit('select-chapter', data);
  } catch (error) {
    console.error('处理节点点击失败:', error);
    ElMessage.error('处理节点点击失败');
  }
}

/**
 * 导出Word文档
 * 将当前书籍的所有章节内容导出为Word文档
 * 验证当前书籍和标题的有效性
 * 打开保存对话框让用户选择保存位置
 * 使用DocumentService执行导出操作
 * 如果导出失败，显示详细的错误提示
 */
const exportWord = async () => {
  try {
    // 验证当前书籍
    if (!props.currentBook) {
      ElMessage.error('请先选择一本书籍');
      return;
    }
    
    if (!props.currentBook.title || typeof props.currentBook.title !== 'string') {
      ElMessage.error('书籍标题无效');
      return;
    }
    
    // 打开保存对话框
    const defaultPath = `${props.currentBook.title}.docx`;
    
    // 验证electronAPI是否存在
    if (!window.electronAPI || typeof window.electronAPI.saveFileAs !== 'function') {
      ElMessage.error('导出功能不可用');
      return;
    }
    
    // 使用类型断言处理API返回结果的不一致性
    const result = await window.electronAPI.saveFileAs(defaultPath) as unknown as { 
      success: boolean; 
      message?: string; 
      filePath?: string 
    };

    if (!result || typeof result !== 'object') {
      ElMessage.error('保存对话框返回结果无效');
      return;
    }
    
    if (!result.success) {
      if (result.message) {
        ElMessage.error(result.message);
      }
      return; // 用户取消了保存
    }
    
    if (!result.filePath || typeof result.filePath !== 'string') {
      ElMessage.error('保存路径无效');
      return;
    }
    
    const documentService = DocumentService.getInstance();
    const fileName = await documentService.exportToWord(props.currentBook, result.filePath as string);
    
    if (!fileName || typeof fileName !== 'string') {
      ElMessage.error('导出结果无效');
      return;
    }
    
    ElMessage.success(`文档已导出为: ${fileName}`);
  } catch (error) {
    console.error('导出Word文档失败:', error);
    ElMessage.error(`导出Word文档失败: ${  error instanceof Error ? error.message : '未知错误'}`);
  }
}
</script>

<style scoped>
.chapter-tree {
  @apply bg-white rounded-2xl shadow-lg h-full overflow-hidden flex flex-col;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  margin: 0.5rem;
}

.header-row {
  @apply flex items-center justify-between mb-6 pb-4 border-b border-gray-100/70;
  align-items: center;
  position: relative;
}

.header-row:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -1rem;
  right: -1rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
}

.action-buttons {
  @apply flex gap-3;
}

.action-button {
  @apply flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200/80 bg-white/90 hover:bg-white hover:border-gray-300 transition-all duration-200;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transform: translateY(0);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-button:before {
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

.action-button:hover {
  @apply transform scale-105 shadow-lg;
  border-color: rgba(59, 130, 246, 0.15);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06);
}

.action-button:hover:before {
  opacity: 1;
}

.action-button:active {
  transform: scale(0.98);
}

.custom-tree {
  @apply flex-1 overflow-auto bg-gray-50/30 rounded-xl;
  flex: 1 1 auto;
  min-height: 0;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(5px);
}

.custom-tree-node {
  @apply flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50/70 transition-all duration-200;
  align-items: center;
  min-height: 52px;
  position: relative;
  border-radius: 12px;
}

.custom-tree-node:hover {
  @apply bg-gray-50/80 shadow-sm;
}

.custom-tree-node:active {
  @apply bg-blue-50/60;
}

.node-content {
  @apply flex-1 mr-4;
  min-width: 0;
  overflow: hidden;
}

.node-actions {
  @apply flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200;
}

:deep(.el-tree-node__content) {
  @apply h-auto min-h-[52px] py-2 px-0;
  align-items: center;
}

:deep(.el-button--small) {
  @apply px-2 py-1 text-xs min-w-[28px] h-[28px] inline-flex items-center justify-center;
}

:deep(.el-tree-node) {
  @apply transition-all duration-200;
}

:deep(.el-tree-node:hover) {
  @apply bg-gray-50/80;
}

:deep(.el-tree-node.is-current) {
  @apply bg-blue-50/70 shadow-sm;
}

:deep(.el-tree-node.is-current .el-tree-node__content) {
  @apply bg-blue-50/70;
}

:deep(.el-tree-node.is-current) {
  border: 1px solid rgba(59, 130, 246, 0.1);
}

/* 优化响应式布局 */
@media (max-width: 768px) {
  .chapter-tree {
    @apply p-4;
  }
  
  .header-row {
    @apply mb-4 pb-3;
  }
  
  .action-buttons {
    @apply gap-2;
  }
  
  .action-button {
    @apply w-9 h-9;
  }
}

@media (max-width: 640px) {
  .chapter-tree {
    @apply p-3;
  }
  
  .header-row {
    @apply flex-col items-start gap-3;
  }
  
  .action-buttons {
    @apply self-end;
  }
}
</style>