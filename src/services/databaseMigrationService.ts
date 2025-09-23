// 数据库迁移服务
// 用于在不同数据库之间迁移数据

import { DatabaseConfig, DatabaseType } from './databaseConfigService';
import { DatabaseServiceFactory } from './databaseServiceFactory';

export interface MigrationProgress {
  stage: string;
  progress: number;
  total: number;
  message: string;
}

export interface MigrationResult {
  success: boolean;
  message: string;
  details?: {
    booksMigrated: number;
    chaptersMigrated: number;
    fragmentsMigrated: number;
    aiConfigsMigrated: number;
  };
}

export class DatabaseMigrationService {
  private static onProgress?: (progress: MigrationProgress) => void;

  static async migrateData(
    sourceConfig: DatabaseConfig,
    targetConfig: DatabaseConfig,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    this.onProgress = onProgress;

    try {
      this.reportProgress('开始迁移', 0, 5);

      // 创建源数据库和目标数据库服务
      const sourceService = await DatabaseServiceFactory.createService(sourceConfig);
      const targetService = await DatabaseServiceFactory.createService(targetConfig);

      this.reportProgress('连接数据库', 1, 5);

      // 连接数据库
      await sourceService.connect();
      await targetService.connect();

      this.reportProgress('开始导出数据', 2, 5);

      // 从源数据库导出数据
      const sourceData = await sourceService.exportData();

      this.reportProgress('开始导入数据', 3, 5);

      // 将数据导入目标数据库
      await targetService.importData(sourceData);

      this.reportProgress('完成迁移', 4, 5);

      // 断开数据库连接
      await sourceService.disconnect();
      await targetService.disconnect();

      // 计算迁移的统计数据
      const details = this.calculateMigrationDetails(sourceData);

      this.reportProgress('迁移完成', 5, 5);

      return {
        success: true,
        message: '数据迁移成功完成',
        details
      };
    } catch (error) {
      return {
        success: false,
        message: `数据迁移失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  static async migrateFromLocalStorage(
    targetConfig: DatabaseConfig,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    this.onProgress = onProgress;

    try {
      this.reportProgress('开始从本地存储迁移', 0, 4);

      // 创建目标数据库服务
      const targetService = await DatabaseServiceFactory.createService(targetConfig);

      this.reportProgress('连接目标数据库', 1, 4);

      // 连接数据库
      await targetService.connect();

      this.reportProgress('从本地存储导出数据', 2, 4);

      // 从localStorage导出数据
      const localData = this.exportLocalStorageData();

      this.reportProgress('导入数据到目标数据库', 3, 4);

      // 将数据导入目标数据库
      await targetService.importData(localData);

      this.reportProgress('迁移完成', 4, 4);

      // 断开数据库连接
      await targetService.disconnect();

      // 计算迁移的统计数据
      const details = this.calculateMigrationDetails(localData);

      return {
        success: true,
        message: '从本地存储迁移成功完成',
        details
      };
    } catch (error) {
      return {
        success: false,
        message: `从本地存储迁移失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  static async migrateToLocalStorage(
    sourceConfig: DatabaseConfig,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    this.onProgress = onProgress;

    try {
      this.reportProgress('开始迁移到本地存储', 0, 4);

      // 创建源数据库服务
      const sourceService = await DatabaseServiceFactory.createService(sourceConfig);

      this.reportProgress('连接源数据库', 1, 4);

      // 连接数据库
      await sourceService.connect();

      this.reportProgress('从源数据库导出数据', 2, 4);

      // 从源数据库导出数据
      const sourceData = await sourceService.exportData();

      this.reportProgress('导入数据到本地存储', 3, 4);

      // 将数据导入localStorage
      this.importToLocalStorage(sourceData);

      this.reportProgress('迁移完成', 4, 4);

      // 断开数据库连接
      await sourceService.disconnect();

      // 计算迁移的统计数据
      const details = this.calculateMigrationDetails(sourceData);

      return {
        success: true,
        message: '迁移到本地存储成功完成',
        details
      };
    } catch (error) {
      return {
        success: false,
        message: `迁移到本地存储失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private static reportProgress(stage: string, progress: number, total: number): void {
    if (this.onProgress) {
      this.onProgress({
        stage,
        progress,
        total,
        message: `${stage} (${progress}/${total})`
      });
    }
  }

  private static exportLocalStorageData(): any {
    const data: any = {
      books: {},
      aiConfigs: {}
    };

    // 导出书籍数据
    const bookKeys = Object.keys(localStorage).filter(key => key.startsWith('book:'));
    for (const key of bookKeys) {
      const bookId = key.replace('book:', '');
      try {
        const bookData = JSON.parse(localStorage.getItem(key) || '{}');
        data.books[bookId] = bookData;

        // 导出章节
        const chapterKeys = Object.keys(localStorage).filter(k => k.startsWith(`chapter:${bookId}:`));
        data.books[bookId].chapters = chapterKeys.map(chapterKey => {
          return JSON.parse(localStorage.getItem(chapterKey) || '{}');
        });

        // 导出片段
        const fragmentKeys = Object.keys(localStorage).filter(k => k.startsWith(`fragment:${bookId}:`));
        data.books[bookId].fragments = fragmentKeys.map(fragmentKey => {
          return JSON.parse(localStorage.getItem(fragmentKey) || '{}');
        });
      } catch (error) {
        console.error(`导出书籍 ${bookId} 失败:`, error);
      }
    }

    // 导出AI配置
    const aiConfigKeys = Object.keys(localStorage).filter(key => key.startsWith('aiConfig:'));
    for (const key of aiConfigKeys) {
      const provider = key.replace('aiConfig:', '');
      try {
        data.aiConfigs[provider] = JSON.parse(localStorage.getItem(key) || '{}');
      } catch (error) {
        console.error(`导出AI配置 ${provider} 失败:`, error);
      }
    }

    return data;
  }

  private static importToLocalStorage(data: any): void {
    // 导入书籍数据
    if (data.books) {
      for (const bookId in data.books) {
        const book = data.books[bookId];
        localStorage.setItem(`book:${bookId}`, JSON.stringify(book));

        // 导入章节
        if (book.chapters) {
          for (const chapter of book.chapters) {
            localStorage.setItem(`chapter:${bookId}:${chapter.id}`, JSON.stringify(chapter));
          }
        }

        // 导入片段
        if (book.fragments) {
          for (const fragment of book.fragments) {
            localStorage.setItem(`fragment:${bookId}:${fragment.id}`, JSON.stringify(fragment));
          }
        }
      }
    }

    // 导入AI配置
    if (data.aiConfigs) {
      for (const provider in data.aiConfigs) {
        localStorage.setItem(`aiConfig:${provider}`, JSON.stringify(data.aiConfigs[provider]));
      }
    }
  }

  private static calculateMigrationDetails(data: any): {
    booksMigrated: number;
    chaptersMigrated: number;
    fragmentsMigrated: number;
    aiConfigsMigrated: number;
  } {
    let booksMigrated = 0;
    let chaptersMigrated = 0;
    let fragmentsMigrated = 0;
    let aiConfigsMigrated = 0;

    // 计算书籍、章节和片段数量
    if (data.books) {
      booksMigrated = Object.keys(data.books).length;
      for (const bookId in data.books) {
        const book = data.books[bookId];
        if (book.chapters) {
          chaptersMigrated += book.chapters.length;
        }
        if (book.fragments) {
          fragmentsMigrated += book.fragments.length;
        }
      }
    }

    // 计算AI配置数量
    if (data.aiConfigs) {
      aiConfigsMigrated = Object.keys(data.aiConfigs).length;
    }

    return {
      booksMigrated,
      chaptersMigrated,
      fragmentsMigrated,
      aiConfigsMigrated
    };
  }

  static async validateMigration(
    sourceConfig: DatabaseConfig,
    targetConfig: DatabaseConfig
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // 检查源数据库连接
      const sourceService = await DatabaseServiceFactory.createService(sourceConfig);
      await sourceService.connect();
      const sourceTest = await sourceService.testConnection();
      await sourceService.disconnect();

      if (!sourceTest.success) {
        issues.push(`源数据库连接失败: ${sourceTest.message}`);
      }

      // 检查目标数据库连接
      const targetService = await DatabaseServiceFactory.createService(targetConfig);
      await targetService.connect();
      const targetTest = await targetService.testConnection();
      await targetService.disconnect();

      if (!targetTest.success) {
        issues.push(`目标数据库连接失败: ${targetTest.message}`);
      }

      // 检查数据库类型是否相同
      if (sourceConfig.type === targetConfig.type) {
        issues.push('源数据库和目标数据库类型相同，可能不需要迁移');
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      issues.push(`验证失败: ${error instanceof Error ? error.message : String(error)}`);
      return {
        valid: false,
        issues
      };
    }
  }

  static getMigrationInfo(sourceType: DatabaseType, targetType: DatabaseType): {
    description: string;
    considerations: string[];
    estimatedTime: string;
  } {
    const descriptions: Record<DatabaseType, string> = {
      local: '浏览器本地存储',
      mongodb: 'MongoDB数据库',
      mysql: 'MySQL数据库',
      sqlserver: 'SQL Server数据库',
      sqlite: 'SQLite文件数据库'
    };

    const considerations: string[] = [];

    // 通用考虑因素
    considerations.push('确保在迁移前备份所有重要数据');
    considerations.push('迁移过程中请勿关闭应用程序');
    considerations.push('迁移完成后请验证数据完整性');

    // 特定数据库的考虑因素
    if (sourceType === 'local') {
      considerations.push('从本地存储迁移可以解决存储空间限制问题');
      considerations.push('迁移后数据可以在不同设备间共享');
    }

    if (targetType === 'local') {
      considerations.push('迁移到本地存储可能会受到浏览器存储空间限制');
      considerations.push('数据将只能在当前浏览器中访问');
    }

    if (targetType === 'mongodb') {
      considerations.push('MongoDB适合存储大量非结构化数据');
      considerations.push('支持MongoDB Atlas免费层，无需本地服务器');
    }

    if (targetType === 'mysql' || targetType === 'sqlserver') {
      considerations.push('关系型数据库适合结构化数据存储');
      considerations.push('需要单独的数据库服务器或云服务');
    }

    if (targetType === 'sqlite') {
      considerations.push('SQLite是轻量级文件数据库，无需单独服务器');
      considerations.push('适合个人使用和小型项目');
    }

    // 估算迁移时间
    let estimatedTime = '1-5分钟';
    if (sourceType === 'local' || targetType === 'local') {
      estimatedTime = '1-3分钟';
    } else {
      estimatedTime = '3-10分钟';
    }

    return {
      description: `从${descriptions[sourceType]}迁移到${descriptions[targetType]}`,
      considerations,
      estimatedTime
    };
  }
}