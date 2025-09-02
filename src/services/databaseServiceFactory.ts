// 数据库服务工厂
// 根据配置创建相应的数据库服务实例

import { DatabaseConfig, DatabaseType } from './databaseConfigService';
import { DatabaseService } from './databaseService';
import { LocalDatabaseService } from './localDatabaseService';

// 检测是否为Web环境
const isWebEnvironment = typeof window !== 'undefined' && !window.electronAPI;

export class DatabaseServiceFactory {
  static async createService(config: DatabaseConfig): Promise<DatabaseService> {
    // 在Web环境中，只支持本地存储
    if (isWebEnvironment && config.type !== 'local') {
      console.warn(`Web环境不支持${config.type}数据库，将使用本地存储替代`);
      return new LocalDatabaseService(config);
    }

    try {
      switch (config.type) {
        case 'mongodb':
          const { MongoDBService } = await import('./mongodbService');
          return new MongoDBService(config);
        
        case 'mysql':
          const { MySQLService } = await import('./mysqlService');
          return new MySQLService(config);
        
        case 'sqlserver':
          const { SQLServerService } = await import('./sqlserverService');
          return new SQLServerService(config);
        
        case 'sqlite':
          const { SQLiteService } = await import('./sqliteService');
          return new SQLiteService(config);
        
        case 'local':
        default:
          return new LocalDatabaseService(config);
      }
    } catch (error) {
      console.error(`创建${config.type}数据库服务失败:`, error);
      // 如果创建失败，回退到本地存储
      return new LocalDatabaseService(config);
    }
  }

  static getSupportedDatabases(): { type: DatabaseType; name: string; description: string }[] {
    const databases = [
      {
        type: 'local',
        name: '本地存储',
        description: '使用浏览器本地存储，适合个人使用'
      }
    ];

    // 在非Web环境中，添加其他数据库选项
    if (!isWebEnvironment) {
      databases.push(
        {
          type: 'mongodb',
          name: 'MongoDB',
          description: '支持MongoDB Atlas免费层和本地MongoDB'
        },
        {
          type: 'mysql',
          name: 'MySQL',
          description: '支持MySQL数据库'
        },
        {
          type: 'sqlserver',
          name: 'SQL Server',
          description: '支持Microsoft SQL Server'
        },
        {
          type: 'sqlite',
          name: 'SQLite',
          description: '轻量级文件数据库'
        }
      );
    }

    return databases;
  }
}