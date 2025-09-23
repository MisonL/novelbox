// 数据库配置服务
// 支持多种数据库类型的配置管理

export type DatabaseType = 'mongodb' | 'mysql' | 'sqlserver' | 'sqlite' | 'local';

export interface MongoDBConfig {
  type: 'mongodb';
  connectionString: string;
  databaseName: string;
  isAtlas?: boolean;
}

export interface MySQLConfig {
  type: 'mysql';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface SQLServerConfig {
  type: 'sqlserver';
  server: string;
  port: number;
  username: string;
  password: string;
  database: string;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
}

export interface SQLiteConfig {
  type: 'sqlite';
  filePath: string;
}

export interface LocalConfig {
  type: 'local';
}

export type DatabaseConfig = 
  | MongoDBConfig 
  | MySQLConfig 
  | SQLServerConfig 
  | SQLiteConfig 
  | LocalConfig;

export class DatabaseConfigService {
  private static readonly CONFIG_KEY = 'databaseConfig';

  static async saveConfig(config: DatabaseConfig): Promise<void> {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      throw new Error(`保存数据库配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async loadConfig(): Promise<DatabaseConfig> {
    try {
      const configStr = localStorage.getItem(this.CONFIG_KEY);
      if (!configStr) {
        // 默认使用本地存储
        return { type: 'local' };
      }
      return JSON.parse(configStr) as DatabaseConfig;
    } catch (error) {
      console.error('加载数据库配置失败:', error);
      return { type: 'local' };
    }
  }

  static async clearConfig(): Promise<void> {
    try {
      localStorage.removeItem(this.CONFIG_KEY);
    } catch (error) {
      throw new Error(`清除数据库配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async testConnection(config: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      // 这里会调用具体的数据库服务来测试连接
      const { DatabaseServiceFactory } = await import('./databaseServiceFactory');
      const service = await DatabaseServiceFactory.createService(config);
      return await service.testConnection();
    } catch (error) {
      return {
        success: false,
        message: `测试连接失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}