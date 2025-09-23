// macOS UI定位修复 - 动态应用
export function applyMacOSFixes() {
  // 检测是否为macOS
  const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (!isMacOS) return;
  
  // 创建样式元素
  const style = document.createElement('style');
  style.id = 'macos-ui-fixes';
  style.textContent = `
    /* macOS全局UI修复 - 动态注入 */
    
    /* 基础布局修复 */
    body {
      font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Arial, sans-serif !important;
      -webkit-font-smoothing: subpixel-antialiased !important;
      -moz-osx-font-smoothing: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* 强制修复flexbox布局 */
    .novel-editor-page {
      display: flex !important;
      flex-direction: column !important;
      height: 100vh !important;
      width: 100vw !important;
      overflow: hidden !important;
    }
    
    .editor-header {
      flex-shrink: 0 !important;
      padding-top: 28px !important;
    }
    
    .editor-main {
      display: flex !important;
      flex-direction: row !important;
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    
    .editor-sidebar {
      flex-shrink: 0 !important;
      width: 240px !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }
    
    .editor-content {
      flex: 1 1 auto !important;
      min-width: 0 !important;
      overflow: auto !important;
    }
    
    /* 标题栏布局修复 */
    .title-section {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      width: 100% !important;
      position: relative !important;
    }
    
    .left-section, .right-section {
      flex-shrink: 0 !important;
      position: static !important;
    }
    
    .center-section {
      flex: 1 1 auto !important;
      display: flex !important;
      justify-content: center !important;
      min-width: 0 !important;
    }
    
    /* 书库页面修复 */
    .book-library-page {
      display: flex !important;
      flex-direction: column !important;
      min-height: 100vh !important;
    }
    
    .library-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      flex-shrink: 0 !important;
    }
    
    .page-title {
      flex: 1 1 auto !important;
      text-align: center !important;
      margin: 0 !important;
    }
    
    /* 模态框层级修复 */
    .modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 99999 !important;
      background: rgba(0, 0, 0, 0.5) !important;
    }
    
    .modal {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      z-index: 100000 !important;
      margin: 0 !important;
      max-height: 90vh !important;
      max-width: 90vw !important;
    }
    
    /* Element Plus组件修复 */
    .el-dialog__wrapper {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 99999 !important;
    }
    
    .el-dialog {
      margin: 0 !important;
      position: relative !important;
      max-height: 90vh !important;
      max-width: 90vw !important;
    }
    
    .el-select-dropdown, .el-dropdown-menu {
      position: fixed !important;
      z-index: 100001 !important;
    }
    
    /* 强制修复所有flex容器 */
    [class*="flex"] {
      display: flex !important;
    }
    
    [class*="flex-col"] {
      flex-direction: column !important;
    }
    
    [class*="flex-row"] {
      flex-direction: row !important;
    }
    
    [class*="items-center"] {
      align-items: center !important;
    }
    
    [class*="justify-between"] {
      justify-content: space-between !important;
    }
    
    /* 修复按钮和输入框 */
    button, .el-button {
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
    }
    
    /* 防止内容溢出 */
    .book-title, .page-title {
      max-width: 100% !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    
    /* 修复网格布局 */
    .books-container {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
      gap: 1.5rem !important;
    }
    
    /* 强制隐藏溢出的内容 */
    * {
      box-sizing: border-box !important;
    }
    
    /* 修复定位上下文 */
    .app-container {
      position: relative !important;
      isolation: isolate !important;
    }
    
    /* 修复滚动行为 */
    .overflow-auto, .overflow-y-auto {
      overflow: auto !important;
      -webkit-overflow-scrolling: touch !important;
    }
    
    .overflow-hidden {
      overflow: hidden !important;
    }
  `;
  
  // 添加到head
  document.head.appendChild(style);
  
  console.log('macOS UI fixes applied');
  
  // 立即修复按钮点击问题
  document.querySelectorAll('button, .btn, [class*="button"], [class*="btn"]').forEach((btn: Element) => {
    const button = btn as HTMLElement;
    // 确保按钮可点击
    button.style.pointerEvents = 'auto';
    button.style.userSelect = 'none';
    button.style.webkitUserSelect = 'none';
    (button.style as any).mozUserSelect = 'none';
    (button.style as any).msUserSelect = 'none';
    
    // 确保按钮在macOS上正确显示
    if (button.closest('.library-header') || button.closest('.editor-header')) {
      button.style.position = 'relative';
      button.style.zIndex = '1000';
    }
  });
  
  // 监听DOM变化，对新添加的元素应用修复
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // 重新应用flexbox修复，但不要影响按钮和交互元素
          const flexContainers = (node as Element).querySelectorAll('[class*="flex"]:not(button):not(.btn):not([class*="button"])');
          flexContainers.forEach((el: Element) => {
            if (el.className.includes('flex-col') && !el.closest('button, .btn, [class*="button"]')) {
              (el as HTMLElement).style.display = 'flex';
              (el as HTMLElement).style.flexDirection = 'column';
            } else if (el.className.includes('flex-row') && !el.closest('button, .btn, [class*="button"]')) {
              (el as HTMLElement).style.display = 'flex';
              (el as HTMLElement).style.flexDirection = 'row';
            }
          });
        }
      });
    });
  });
  
  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 延迟应用一些修复，确保Vue渲染完成
  setTimeout(() => {
    // 修复可能动态添加的模态框
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modals = document.querySelectorAll('.modal');
    
    modalOverlays.forEach((overlay: Element) => {
      (overlay as HTMLElement).style.position = 'fixed';
      (overlay as HTMLElement).style.top = '0';
      (overlay as HTMLElement).style.left = '0';
      (overlay as HTMLElement).style.right = '0';
      (overlay as HTMLElement).style.bottom = '0';
      (overlay as HTMLElement).style.zIndex = '99999';
    });
    
    modals.forEach((modal: Element) => {
      (modal as HTMLElement).style.position = 'fixed';
      (modal as HTMLElement).style.top = '50%';
      (modal as HTMLElement).style.left = '50%';
      (modal as HTMLElement).style.transform = 'translate(-50%, -50%)';
      (modal as HTMLElement).style.zIndex = '100000';
    });
    
    // 确保按钮点击事件正常工作
    document.querySelectorAll('button, .btn, [class*="button"], [class*="btn"]').forEach((btn: Element) => {
      const button = btn as HTMLElement;
      button.style.pointerEvents = 'auto';
      button.style.userSelect = 'none';
      button.style.webkitUserSelect = 'none';
      (button.style as any).mozUserSelect = 'none';
      (button.style as any).msUserSelect = 'none';
    });
  }, 1000);
}

// 导出函数供主应用调用
export function initMacOSFixes() {
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyMacOSFixes);
  } else {
    applyMacOSFixes();
  }
}