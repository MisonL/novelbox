<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>系统设置</h1>
      <button
        class="close-button"
        @click="$emit('close')"
      >
        ×
      </button>
    </div>
    
    <div class="settings-content">
      <div class="setting-item">
        <div class="setting-label">
          工作区路径
        </div>
        <div class="setting-control">
          <div class="input-with-button">
            <input 
              id="workspace-path" 
              v-model="workspacePath" 
              type="text" 
              placeholder="请选择工作区路径"
              readonly
            >
            <button
              class="browse-button"
              @click="selectWorkspace"
            >
              浏览
            </button>
          </div>
        </div>
      </div>
      
      <div class="divider" />
      
      <div class="setting-item">
        <div class="setting-label">
          使用系统代理
        </div>
        <div class="setting-control">
          <div class="toggle-switch">
            <input 
              id="use-proxy" 
              v-model="useSystemProxy" 
              type="checkbox" 
              @change="toggleProxy"
            >
            <label for="use-proxy" />
          </div>
        </div>
      </div>
      
      <div class="setting-hint">
        系统默认使用系统代理，如需使用AI配置中的代理，请关闭此选项
      </div>
      
      <div class="divider" />
      
      <!-- 数据库配置 -->
      <div class="setting-section">
        <div class="section-title">
          数据库配置
        </div>
        <div class="setting-description">
          选择数据存储方式，支持多种数据库类型
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            数据库类型
          </div>
          <div class="setting-control">
            <select
              v-model="databaseType"
              class="database-select"
              @change="onDatabaseTypeChange"
            >
              <option 
                v-for="db in supportedDatabases" 
                :key="db.type" 
                :value="db.type"
              >
                {{ db.name }}
              </option>
            </select>
          </div>
          <div
            v-if="getCurrentDatabaseDescription()"
            class="setting-description"
          >
            {{ getCurrentDatabaseDescription() }}
          </div>
        </div>
        
        <!-- MongoDB配置 -->
        <div
          v-if="databaseType === 'mongodb'"
          class="database-config"
        >
          <div class="setting-item">
            <div class="setting-label">
              连接字符串
            </div>
            <div class="setting-control">
              <input 
                v-model="mongodbConfig.connectionString" 
                type="text" 
                placeholder="mongodb://localhost:27017"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              数据库名称
            </div>
            <div class="setting-control">
              <input 
                v-model="mongodbConfig.databaseName" 
                type="text" 
                placeholder="novelbox"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              Atlas免费层
            </div>
            <div class="setting-control">
              <div class="toggle-switch">
                <input 
                  id="mongodb-atlas" 
                  v-model="mongodbConfig.isAtlas" 
                  type="checkbox"
                >
                <label for="mongodb-atlas" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- MySQL配置 -->
        <div
          v-if="databaseType === 'mysql'"
          class="database-config"
        >
          <div class="setting-item">
            <div class="setting-label">
              主机地址
            </div>
            <div class="setting-control">
              <input 
                v-model="mysqlConfig.host" 
                type="text" 
                placeholder="localhost"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              端口
            </div>
            <div class="setting-control">
              <input 
                v-model="mysqlConfig.port" 
                type="number" 
                placeholder="3306"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              用户名
            </div>
            <div class="setting-control">
              <input 
                v-model="mysqlConfig.username" 
                type="text" 
                placeholder="root"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              密码
            </div>
            <div class="setting-control">
              <input 
                v-model="mysqlConfig.password" 
                type="password" 
                placeholder="password"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              数据库名称
            </div>
            <div class="setting-control">
              <input 
                v-model="mysqlConfig.database" 
                type="text" 
                placeholder="novelbox"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              SSL连接
            </div>
            <div class="setting-control">
              <div class="toggle-switch">
                <input 
                  id="mysql-ssl" 
                  v-model="mysqlConfig.ssl" 
                  type="checkbox"
                >
                <label for="mysql-ssl" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- SQL Server配置 -->
        <div
          v-if="databaseType === 'sqlserver'"
          class="database-config"
        >
          <div class="setting-item">
            <div class="setting-label">
              服务器地址
            </div>
            <div class="setting-control">
              <input 
                v-model="sqlserverConfig.server" 
                type="text" 
                placeholder="localhost"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              端口
            </div>
            <div class="setting-control">
              <input 
                v-model="sqlserverConfig.port" 
                type="number" 
                placeholder="1433"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              用户名
            </div>
            <div class="setting-control">
              <input 
                v-model="sqlserverConfig.username" 
                type="text" 
                placeholder="sa"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              密码
            </div>
            <div class="setting-control">
              <input 
                v-model="sqlserverConfig.password" 
                type="password" 
                placeholder="password"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              数据库名称
            </div>
            <div class="setting-control">
              <input 
                v-model="sqlserverConfig.database" 
                type="text" 
                placeholder="novelbox"
                class="config-input"
              >
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              加密连接
            </div>
            <div class="setting-control">
              <div class="toggle-switch">
                <input 
                  id="sqlserver-encrypt" 
                  v-model="sqlserverConfig.encrypt" 
                  type="checkbox"
                >
                <label for="sqlserver-encrypt" />
              </div>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-label">
              信任服务器证书
            </div>
            <div class="setting-control">
              <div class="toggle-switch">
                <input 
                  id="sqlserver-trust" 
                  v-model="sqlserverConfig.trustServerCertificate" 
                  type="checkbox"
                >
                <label for="sqlserver-trust" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- SQLite配置 -->
        <div
          v-if="databaseType === 'sqlite'"
          class="database-config"
        >
          <div class="setting-item">
            <div class="setting-label">
              数据库文件路径
            </div>
            <div class="setting-control">
              <input 
                v-model="sqliteConfig.filePath" 
                type="text" 
                placeholder="./data/novelbox.db"
                class="config-input"
              >
            </div>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            测试连接
          </div>
          <div class="setting-control">
            <button
              class="action-button test-button"
              @click="testDatabaseConnection"
            >
              测试连接
            </button>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            保存配置
          </div>
          <div class="setting-control">
            <button
              class="action-button save-button"
              @click="saveDatabaseConfig"
            >
              保存配置
            </button>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            重置配置
          </div>
          <div class="setting-control">
            <button
              class="action-button reset-button"
              @click="resetDatabaseConfig"
            >
              重置为本地存储
            </button>
          </div>
        </div>
        
        <div
          v-if="databaseMessage"
          class="setting-message"
          :class="databaseMessageType"
        >
          {{ databaseMessage }}
        </div>
      </div>
      
      <div class="divider" />
      
      <!-- Web端数据管理 -->
      <div
        v-if="isWebEnvironment"
        class="setting-section"
      >
        <div class="section-title">
          数据管理
        </div>
        <div class="setting-description">
          Web端数据存储在浏览器中，建议定期导出备份以防数据丢失
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            导出数据
          </div>
          <div class="setting-control">
            <button
              class="action-button export-button"
              @click="exportData"
            >
              导出备份
            </button>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            导入数据
          </div>
          <div class="setting-control">
            <button
              class="action-button import-button"
              @click="importData"
            >
              导入备份
            </button>
          </div>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">
            清除数据
          </div>
          <div class="setting-control">
            <button
              class="action-button clear-button"
              @click="clearData"
            >
              清除所有数据
            </button>
          </div>
        </div>
        
        <div class="setting-warning">
          ⚠️ 注意：清除数据操作不可恢复，请确保已备份重要数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { DatabaseConfig } from '../services/databaseConfigService';

// 检测是否为Web环境
const isWebEnvironment = ref(typeof window !== 'undefined' && !window.electronAPI);

const emit = defineEmits(['close']);

// 获取支持的数据库类型
const supportedDatabases = ref<{ type: string; name: string; description: string }[]>([]);

// 加载支持的数据库类型
const loadSupportedDatabases = async () => {
  try {
    const { DatabaseServiceFactory } = await import('../services/databaseServiceFactory');
    supportedDatabases.value = DatabaseServiceFactory.getSupportedDatabases();
  } catch (error) {
    console.error('加载支持的数据库类型失败:', error);
    // 默认只支持本地存储
    supportedDatabases.value = [
      {
        type: 'local',
        name: '本地存储',
        description: '使用浏览器本地存储，适合个人使用'
      }
    ];
  }
};

// 状态
const workspacePath = ref('');
const useSystemProxy = ref(false);

// 数据库配置状态
const databaseType = ref('local');
const databaseMessage = ref('');
const databaseMessageType = ref('');

// MongoDB配置
const mongodbConfig = ref({
  connectionString: '',
  databaseName: '',
  isAtlas: false
});

// MySQL配置
const mysqlConfig = ref({
  host: '',
  port: 3306,
  username: '',
  password: '',
  database: '',
  ssl: false
});

// SQL Server配置
const sqlserverConfig = ref({
  server: '',
  port: 1433,
  username: '',
  password: '',
  database: '',
  encrypt: false,
  trustServerCertificate: false
});

// SQLite配置
const sqliteConfig = ref({
  filePath: './data/novelbox.db'
});

// 初始化设置
onMounted(async () => {
  // 从localStorage读取工作区路径
  const savedPath = localStorage.getItem('workspacePath');
  if (savedPath) {
    workspacePath.value = savedPath;
  }
  
  // 从localStorage读取代理设置
  const proxyEnabled = localStorage.getItem('useSystemProxy');
  useSystemProxy.value = proxyEnabled !== 'false'; // 默认为true
  
  // 加载支持的数据库类型
  await loadSupportedDatabases();
  
  // 加载数据库配置
  await loadDatabaseConfig();
});

// 加载数据库配置
const loadDatabaseConfig = async () => {
  try {
    const { DatabaseConfigService } = await import('../services/databaseConfigService');
    const config = await DatabaseConfigService.loadConfig();
    
    databaseType.value = config.type;
    
    if (config.type === 'mongodb') {
      mongodbConfig.value = {
        connectionString: config.connectionString || '',
        databaseName: config.databaseName || '',
        isAtlas: config.isAtlas || false
      };
    } else if (config.type === 'mysql') {
      mysqlConfig.value = {
        host: config.host || '',
        port: config.port || 3306,
        username: config.username || '',
        password: config.password || '',
        database: config.database || '',
        ssl: config.ssl || false
      };
    } else if (config.type === 'sqlserver') {
      sqlserverConfig.value = {
        server: config.server || '',
        port: config.port || 1433,
        username: config.username || '',
        password: config.password || '',
        database: config.database || '',
        encrypt: config.encrypt || false,
        trustServerCertificate: config.trustServerCertificate || false
      };
    } else if (config.type === 'sqlite') {
      sqliteConfig.value = {
        filePath: config.filePath || './data/novelbox.db'
      };
    }
  } catch (error) {
    console.error('加载数据库配置失败:', error);
  }
};

// 数据库类型变更
const onDatabaseTypeChange = () => {
  databaseMessage.value = '';
  databaseMessageType.value = '';
};

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    databaseMessage.value = '正在测试连接...';
    databaseMessageType.value = 'info';
    
    const config = getCurrentDatabaseConfig();
    const { DatabaseConfigService } = await import('../services/databaseConfigService');
    const result = await DatabaseConfigService.testConnection(config);
    
    if (result.success) {
      databaseMessage.value = result.message;
      databaseMessageType.value = 'success';
    } else {
      databaseMessage.value = result.message;
      databaseMessageType.value = 'error';
    }
  } catch (error) {
    databaseMessage.value = `测试失败: ${error instanceof Error ? error.message : String(error)}`;
    databaseMessageType.value = 'error';
  }
};

// 保存数据库配置
const saveDatabaseConfig = async () => {
  try {
    const config = getCurrentDatabaseConfig();
    const { DatabaseConfigService } = await import('../services/databaseConfigService');
    await DatabaseConfigService.saveConfig(config);
    
    databaseMessage.value = '配置保存成功';
    databaseMessageType.value = 'success';
  } catch (error) {
    databaseMessage.value = `保存失败: ${error instanceof Error ? error.message : String(error)}`;
    databaseMessageType.value = 'error';
  }
};

// 重置数据库配置
const resetDatabaseConfig = async () => {
  try {
    if (confirm('确定要重置为本地存储吗？')) {
      const { DatabaseConfigService } = await import('../services/databaseConfigService');
      await DatabaseConfigService.clearConfig();
      
      databaseType.value = 'local';
      databaseMessage.value = '已重置为本地存储';
      databaseMessageType.value = 'success';
    }
  } catch (error) {
    databaseMessage.value = `重置失败: ${error instanceof Error ? error.message : String(error)}`;
    databaseMessageType.value = 'error';
  }
};

// 获取当前数据库配置
const getCurrentDatabaseConfig = (): DatabaseConfig => {
  switch (databaseType.value) {
    case 'mongodb':
      return {
        type: 'mongodb',
        connectionString: mongodbConfig.value.connectionString,
        databaseName: mongodbConfig.value.databaseName,
        isAtlas: mongodbConfig.value.isAtlas
      } as DatabaseConfig;
    case 'mysql':
      return {
        type: 'mysql',
        host: mysqlConfig.value.host,
        port: mysqlConfig.value.port,
        username: mysqlConfig.value.username,
        password: mysqlConfig.value.password,
        database: mysqlConfig.value.database,
        ssl: mysqlConfig.value.ssl
      } as DatabaseConfig;
    case 'sqlserver':
      return {
        type: 'sqlserver',
        server: sqlserverConfig.value.server,
        port: sqlserverConfig.value.port,
        username: sqlserverConfig.value.username,
        password: sqlserverConfig.value.password,
        database: sqlserverConfig.value.database,
        encrypt: sqlserverConfig.value.encrypt,
        trustServerCertificate: sqlserverConfig.value.trustServerCertificate
      } as DatabaseConfig;
    case 'sqlite':
      return {
        type: 'sqlite',
        filePath: sqliteConfig.value.filePath
      } as DatabaseConfig;
    case 'local':
    default:
      return {
        type: 'local'
      } as DatabaseConfig;
  }
};

// 获取当前数据库类型的描述
const getCurrentDatabaseDescription = () => {
  const database = supportedDatabases.value.find(db => db.type === databaseType.value);
  return database ? database.description : '';
};

// 选择工作区
const selectWorkspace = async () => {
  try {
    if (isWebEnvironment.value) {
      // Web环境下的工作区选择
      const newPath = prompt('请输入工作区路径:', workspacePath.value || '/web-workspace');
      if (newPath) {
        workspacePath.value = newPath;
        localStorage.setItem('workspacePath', newPath);
      }
    } else {
      // 桌面环境下的工作区选择
      await window.electronAPI.changeWorkspace(true);
    }
  } catch (error) {
    console.error('更换工作区失败:', error);
  }
};

// 切换代理
const toggleProxy = async () => {
  try {
    // 保存设置到localStorage
    localStorage.setItem('useSystemProxy', useSystemProxy.value.toString());
  } catch (error) {
    console.error('设置代理失败:', error);
    useSystemProxy.value = !useSystemProxy.value; // 恢复之前的状态
  }
};

// 导出数据
const exportData = async () => {
  if (!isWebEnvironment.value) return;
  
  try {
    // 动态导入webFileService
    const { exportAllData } = await import('../services/webFileService');
    const result = await exportAllData();
    
    if (result.success) {
      alert('数据导出成功！');
    } else {
      alert(`导出失败：${result.message}`);
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    alert('导出数据失败');
  }
};

// 导入数据
const importData = async () => {
  if (!isWebEnvironment.value) return;
  
  try {
    // 动态导入webFileService
    const { importData: importDataFunc } = await import('../services/webFileService');
    const result = await importDataFunc() as { success: boolean; message: string };
    
    if (result.success) {
      alert(result.message);
    } else {
      alert(`导入失败：${result.message}`);
    }
  } catch (error) {
    console.error('导入数据失败:', error);
    alert('导入数据失败');
  }
};

// 清除数据
const clearData = async () => {
  if (!isWebEnvironment.value) return;
  
  try {
    // 动态导入webFileService
    const { clearAllData } = await import('../services/webFileService');
    const result = await clearAllData();
    
    if (result.success) {
      alert(result.message);
    } else {
      alert(`清除失败：${result.message}`);
    }
  } catch (error) {
    console.error('清除数据失败:', error);
    alert('清除数据失败');
  }
};
</script>

<style scoped>
.settings-container {
  width: 600px;
  max-width: 90vw;
  padding: 0;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.settings-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.settings-content {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.close-button {
  font-size: 22px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
  color: #666;
  transition: color 0.2s;
}

.close-button:hover {
  color: #000;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  gap: 24px;
}

.setting-label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  min-width: 100px;
}

.setting-control {
  flex: 1;
  max-width: 320px;
  display: flex;
  justify-content: flex-end;
}

.divider {
  height: 1px;
  background-color: #eaeaea;
  margin: 0;
}

.input-with-button {
  display: flex;
  width: 100%;
  gap: 8px;
}

input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f8f9fa;
  color: #333;
}

input[type="text"]:focus {
  border-color: #4a90e2;
  outline: none;
}

.browse-button {
  padding: 12px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 15px;
  white-space: nowrap;
  min-width: 100px;
}

.browse-button:hover {
  background-color: #357ab8;
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 22px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 22px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + label {
  background-color: #4a90e2;
}

.toggle-switch input:checked + label:before {
  transform: translateX(22px);
}

.setting-hint {
  padding: 0 24px 16px;
  font-size: 12px;
  color: #888;
  margin-top: -8px;
  text-align: right;
}

.note {
  color: #ff9800;
  font-style: italic;
}

/* Web端数据管理样式 */
.setting-section {
  padding: 16px 24px 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.setting-description {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.4;
}

.action-button {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.2s;
  min-width: 120px;
}

.export-button {
  background-color: #4caf50;
  color: white;
}

.export-button:hover {
  background-color: #45a049;
}

.import-button {
  background-color: #2196f3;
  color: white;
}

.import-button:hover {
  background-color: #1976d2;
}

.clear-button {
  background-color: #f44336;
  color: white;
}

.clear-button:hover {
  background-color: #d32f2f;
}

.setting-warning {
  padding: 12px 24px 16px;
  font-size: 12px;
  color: #f44336;
  background-color: #ffebee;
  border-radius: 4px;
  margin: 0 24px 16px;
  line-height: 1.4;
}

/* 数据库配置样式 */
.database-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  color: #333;
}

.database-select:focus {
  border-color: #4a90e2;
  outline: none;
}

.database-config {
  background-color: #f8f9fa;
  border-radius: 4px;
  margin: 0 -24px;
  padding: 0 24px;
}

.config-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  background-color: white;
  color: #333;
}

.config-input:focus {
  border-color: #4a90e2;
  outline: none;
}

.test-button {
  background-color: #ff9800;
  color: white;
}

.test-button:hover {
  background-color: #f57c00;
}

.save-button {
  background-color: #4caf50;
  color: white;
}

.save-button:hover {
  background-color: #45a049;
}

.reset-button {
  background-color: #9e9e9e;
  color: white;
}

.reset-button:hover {
  background-color: #757575;
}

.setting-message {
  padding: 12px 24px;
  font-size: 13px;
  border-radius: 4px;
  margin: 16px 24px 0;
  line-height: 1.4;
}

.setting-message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.setting-message.error {
  background-color: #ffebee;
  color: #c62828;
}

.setting-message.info {
  background-color: #e3f2fd;
  color: #1565c0;
}
</style> 