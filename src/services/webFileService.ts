// Web环境下的文件服务模拟
// 注意：Web端数据存储在localStorage中，存在以下限制：
// 1. 存储空间有限（通常5-10MB）
// 2. 清除浏览器数据会丢失所有作品
// 3. 更换浏览器或设备无法访问之前的作品
// 建议定期使用导出功能备份重要作品

export const saveFileAs = async (defaultPath: string) => {
  try {
    // 创建一个隐藏的a标签来触发下载
    const link = document.createElement('a')
    link.style.display = 'none'
    
    // 获取要下载的内容
    const content = localStorage.getItem('currentDocument') || ''
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = defaultPath || 'document.docx'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
    
    return { success: true, filePath: defaultPath }
  } catch (error) {
    console.error('保存文件失败:', error)
    return { success: false, message: '保存文件失败' }
  }
}

export const changeWorkspace = async () => {
  try {
    // 在Web环境中，使用一个简单的输入框来模拟工作区选择
    const workspacePath = prompt('请输入工作区路径:', '/workspace')
    
    if (workspacePath) {
      localStorage.setItem('workspacePath', workspacePath)
      return { success: true, path: workspacePath }
    }
    
    return { success: false, message: '用户取消选择' }
  } catch (error) {
    console.error('更换工作区失败:', error)
    return { success: false, message: '更换工作区失败' }
  }
}

export const readFile = async (filePath: string) => {
  try {
    // 在Web环境中，从localStorage读取文件
    const content = localStorage.getItem(`file:${filePath}`)
    if (content) {
      return { success: true, content }
    }
    return { success: false, message: '文件不存在' }
  } catch (error) {
    console.error('读取文件失败:', error)
    return { success: false, message: '读取文件失败' }
  }
}

export const writeFile = async (filePath: string, content: string) => {
  try {
    // 在Web环境中，将文件保存到localStorage
    localStorage.setItem(`file:${filePath}`, content)
    return { success: true }
  } catch (error) {
    console.error('写入文件失败:', error)
    return { success: false, message: '写入文件失败' }
  }
}

export const listFiles = async (dirPath: string) => {
  try {
    // 在Web环境中，从localStorage获取文件列表
    const files: string[] = []
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith(`file:${dirPath}/`)) {
        const fileName = key.replace(`file:${dirPath}/`, '')
        files.push(fileName)
      }
    })
    
    return {
      success: true,
      items: files.map(name => ({
        name,
        type: 'file' as const
      }))
    }
  } catch (error) {
    console.error('列出文件失败:', error)
    return { success: false, message: '列出文件失败' }
  }
}

export const deleteFile = async (filePath: string) => {
  try {
    // 在Web环境中，从localStorage删除文件
    localStorage.removeItem(`file:${filePath}`)
    return { success: true }
  } catch (error) {
    console.error('删除文件失败:', error)
    return { success: false, message: '删除文件失败' }
  }
}

// 导出所有数据
export const exportAllData = async () => {
  try {
    // 收集所有localStorage数据
    const allData: { [key: string]: string } = {};
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      // 只导出应用相关的数据，排除浏览器系统数据
      if (key.startsWith('file:') || 
          key === 'workspacePath' || 
          key.startsWith('aiConfig:') ||
          key.startsWith('bookConfig:') ||
          key === 'currentDocument') {
        allData[key] = localStorage.getItem(key) || '';
      }
    });
    
    // 创建JSON文件
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.style.display = 'none';
    const url = URL.createObjectURL(blob);
    link.href = url;
    
    // 使用当前时间作为文件名
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    link.download = `novelbox-backup-${timestamp}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    return { success: true, message: '数据导出成功' };
  } catch (error) {
    console.error('导出数据失败:', error);
    return { success: false, message: '导出数据失败' };
  }
};

// 导入数据
export const importData = async () => {
  try {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    return new Promise((resolve) => {
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: false, message: '未选择文件' });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            // 询问用户是否要覆盖现有数据
            if (confirm('导入数据将覆盖现有数据，是否继续？')) {
              // 导入数据到localStorage
              Object.keys(data).forEach(key => {
                localStorage.setItem(key, data[key]);
              });
              
              resolve({ success: true, message: '数据导入成功，请刷新页面' });
            } else {
              resolve({ success: false, message: '用户取消导入' });
            }
          } catch (error) {
            console.error('解析导入文件失败:', error);
            resolve({ success: false, message: '导入文件格式错误' });
          }
        };
        
        reader.onerror = () => {
          resolve({ success: false, message: '读取文件失败' });
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    });
  } catch (error) {
    console.error('导入数据失败:', error);
    return { success: false, message: '导入数据失败' };
  }
};

// 清除所有数据
export const clearAllData = async () => {
  try {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      // 收集所有应用相关的key
      const keysToRemove: string[] = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('file:') || 
            key === 'workspacePath' || 
            key.startsWith('aiConfig:') ||
            key.startsWith('bookConfig:') ||
            key === 'currentDocument') {
          keysToRemove.push(key);
        }
      });
      
      // 删除所有相关数据
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      return { success: true, message: '所有数据已清除，请刷新页面' };
    }
    
    return { success: false, message: '用户取消操作' };
  } catch (error) {
    console.error('清除数据失败:', error);
    return { success: false, message: '清除数据失败' };
  }
};

export default {
  saveFileAs,
  changeWorkspace,
  readFile,
  writeFile,
  listFiles,
  deleteFile,
  exportAllData,
  importData,
  clearAllData,
  content: {
    saveFileAs,
    changeWorkspace,
    readFile,
    writeFile,
    listFiles,
    deleteFile,
    exportAllData,
    importData,
    clearAllData
  }
}