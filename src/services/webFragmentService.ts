// Web环境下的片段服务模拟

// 存储片段数据
const fragmentData = new Map<string, any>()
const fragmentWindows = new Map<string, any>()

export const createFragmentWindow = async (fragment: any) => {
  try {
    // 确保片段有标题
    if (!fragment.title) {
      fragment.title = '新片段'
    }
    
    // 存储片段数据
    fragmentData.set(fragment.id, fragment)
    
    // 创建模态框来模拟片段窗口
    const modal = document.createElement('div')
    modal.className = 'fragment-modal'
    modal.innerHTML = `
      <div class="fragment-modal-content">
        <div class="fragment-modal-header">
          <h3>${fragment.title}</h3>
          <button class="fragment-modal-close">&times;</button>
        </div>
        <div class="fragment-modal-body">
          <div class="fragment-content">${fragment.content || ''}</div>
        </div>
      </div>
    `
    
    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .fragment-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .fragment-modal-content {
        background: white;
        border-radius: 8px;
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .fragment-modal-header {
        padding: 16px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .fragment-modal-header h3 {
        margin: 0;
        font-size: 18px;
      }
      .fragment-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      .fragment-modal-close:hover {
        color: #333;
      }
      .fragment-modal-body {
        padding: 16px;
        max-height: calc(80vh - 60px);
        overflow-y: auto;
      }
      .fragment-content {
        white-space: pre-wrap;
        font-family: monospace;
        line-height: 1.5;
      }
    `
    
    document.head.appendChild(style)
    document.body.appendChild(modal)
    
    // 存储窗口引用
    fragmentWindows.set(fragment.id, modal)
    
    // 绑定关闭事件
    const closeBtn = modal.querySelector('.fragment-modal-close')
    closeBtn?.addEventListener('click', () => {
      closeModal(fragment.id)
    })
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(fragment.id)
      }
    })
    
    // 发送片段数据事件
    window.dispatchEvent(new CustomEvent('fragment-data', { detail: fragment }))
    
    return { success: true, message: '片段窗口已创建' }
  } catch (error) {
    console.error('创建片段窗口失败:', error)
    return { success: false, message: '创建片段窗口失败' }
  }
}

export const updateFragmentContent = async (fragment: any) => {
  try {
    // 更新片段数据
    if (fragmentData.has(fragment.id)) {
      const existingFragment = fragmentData.get(fragment.id)
      fragmentData.set(fragment.id, {
        ...existingFragment,
        content: fragment.content,
        title: fragment.title,
        isGenerating: fragment.isGenerating,
        wasStopped: fragment.wasStopped,
        hasLastGenerationParams: fragment.hasLastGenerationParams,
        updatedAt: fragment.updatedAt || new Date().toISOString()
      })
    }
    
    // 更新UI
    const modal = fragmentWindows.get(fragment.id)
    if (modal) {
      const contentElement = modal.querySelector('.fragment-content')
      if (contentElement) {
        contentElement.textContent = fragment.content || ''
      }
      
      const headerElement = modal.querySelector('.fragment-modal-header h3')
      if (headerElement) {
        headerElement.textContent = fragment.title || '新片段'
      }
    }
    
    // 发送内容更新事件
    window.dispatchEvent(new CustomEvent('content-update', { detail: fragment }))
    
    return { success: true, message: '片段内容已更新' }
  } catch (error) {
    console.error('更新片段内容失败:', error)
    return { success: false, message: '更新片段内容失败' }
  }
}

export const saveFragmentContent = async (fragment: any) => {
  try {
    // 更新片段数据
    fragmentData.set(fragment.id, fragment)
    
    // 发送保存事件
    window.dispatchEvent(new CustomEvent('fragment-saved', { detail: fragment }))
    
    return { success: true, message: '片段已保存' }
  } catch (error) {
    console.error('保存片段失败:', error)
    return { success: false, message: '保存片段失败' }
  }
}

export const requestFragmentData = async (_windowId: number) => {
  try {
    // 在Web环境中，windowId可能不对应实际的片段ID
    // 这里我们简单地返回第一个片段数据
    const fragments = Array.from(fragmentData.values())
    if (fragments.length > 0) {
      const fragment = fragments[0]
      window.dispatchEvent(new CustomEvent('fragment-data', { detail: fragment }))
      return { success: true, message: '片段数据已发送' }
    }
    
    return { success: false, message: '没有找到片段数据' }
  } catch (error) {
    console.error('请求片段数据失败:', error)
    return { success: false, message: '请求片段数据失败' }
  }
}

const closeModal = (fragmentId: string) => {
  const modal = fragmentWindows.get(fragmentId)
  if (modal) {
    document.body.removeChild(modal)
    fragmentWindows.delete(fragmentId)
    
    // 发送关闭事件
    window.dispatchEvent(new CustomEvent('close-fragment', { detail: { fragmentId } }))
  }
}

export default {
  createFragmentWindow,
  updateFragmentContent,
  saveFragmentContent,
  requestFragmentData,
  content: {
    createFragmentWindow,
    updateFragmentContent,
    saveFragmentContent,
    requestFragmentData
  }
}