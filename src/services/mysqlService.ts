// MySQL数据库服务
// 支持MySQL数据库

import { BaseDatabaseService } from './databaseService';
import { Book, Chapter, Fragment } from './bookConfigService';
import { DatabaseConfig, MySQLConfig } from './databaseConfigService';

// MySQL相关类型定义
interface MySQLConnection {
  query(sql: string, params?: any[]): Promise<any>;
  execute(sql: string, params?: any[]): Promise<any>;
  end(): Promise<void>;
  ping(): Promise<void>;
}

interface MySQLPool {
  getConnection(): Promise<MySQLConnection>;
  end(): Promise<void>;
}

// 动态导入MySQL客户端
let mysql: any = null;

// 检测是否为Web环境
const isWebEnvironment = typeof window !== 'undefined' && !window.electronAPI;

export class MySQLService extends BaseDatabaseService {
  private pool: MySQLPool | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    try {
      // 在Web环境中直接抛出错误
      if (isWebEnvironment) {
        throw new Error('Web环境不支持MySQL数据库连接');
      }

      if (!mysql) {
        // 动态导入MySQL客户端
        mysql = await import('mysql2/promise');
      }

      const mysqlConfig = this.config as MySQLConfig;
      this.pool = mysql.createPool({
        host: mysqlConfig.host,
        port: mysqlConfig.port,
        user: mysqlConfig.username,
        password: mysqlConfig.password,
        database: mysqlConfig.database,
        ssl: mysqlConfig.ssl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // 测试连接
      if (!this.pool) {
        throw new Error('MySQL连接池初始化失败');
      }
      await (this.pool as any).ping();
      this.isConnected = true;
    } catch (error) {
      throw new Error(`连接MySQL失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
        this.isConnected = false;
      }
    } catch (error) {
      throw new Error(`断开MySQL连接失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // 在Web环境中直接返回不支持
      if (isWebEnvironment) {
        return { 
          success: false, 
          message: 'Web环境不支持MySQL数据库连接' 
        };
      }

      if (!this.isConnected) {
        await this.connect();
      }
      
      // 测试连接
      await (this.pool as any)!.ping();
      return { success: true, message: 'MySQL连接正常' };
    } catch (error) {
      return { 
        success: false, 
        message: `MySQL连接测试失败: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  private async getConnection(): Promise<MySQLConnection> {
    if (!this.pool) {
      throw new Error('数据库未连接');
    }
    return await this.pool.getConnection();
  }

  private async initializeTables(): Promise<void> {
    const connection = await this.getConnection();
    
    try {
      // 创建书籍表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS books (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          setting TEXT,
          plot TEXT,
          lastEdited DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // 创建章节表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS chapters (
          id VARCHAR(255) PRIMARY KEY,
          book_id VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          type ENUM('volume', 'chapter') NOT NULL,
          detail_outline JSON,
          content LONGTEXT,
          parent_id VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES chapters(id) ON DELETE CASCADE
        )
      `);

      // 创建片段表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS fragments (
          id VARCHAR(255) PRIMARY KEY,
          book_id VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          content LONGTEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
      `);

      // 创建AI配置表
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS ai_configs (
          provider VARCHAR(255) PRIMARY KEY,
          config JSON NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    } finally {
      connection.end();
    }
  }

  async saveBook(book: Book): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute(
          `INSERT INTO books (id, title, description, setting, plot, lastEdited) 
           VALUES (?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           title = VALUES(title), 
           description = VALUES(description), 
           setting = VALUES(setting), 
           plot = VALUES(plot), 
           lastEdited = VALUES(lastEdited)`,
          [
            book.id,
            book.title,
            book.description,
            book.setting,
            book.plot,
            this.formatDate(book.lastEdited)
          ]
        );
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`保存书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBook(bookId: string): Promise<Book | null> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM books WHERE id = ?',
          [bookId]
        );
        
        if (!rows || rows.length === 0) return null;
        
        const book = rows[0];
        return {
          id: book.id,
          title: book.title,
          description: book.description,
          setting: book.setting,
          plot: book.plot,
          lastEdited: this.parseDate(book.lastEdited),
          content: []
        };
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('获取书籍失败:', error);
      return null;
    }
  }

  async listBooks(): Promise<Book[]> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute('SELECT * FROM books ORDER BY lastEdited DESC');
        
        if (!rows) return [];
        
        return rows.map((book: any) => ({
          id: book.id,
          title: book.title,
          description: book.description,
          setting: book.setting,
          plot: book.plot,
          lastEdited: this.parseDate(book.lastEdited),
          content: []
        }));
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('列出书籍失败:', error);
      return [];
    }
  }

  async deleteBook(bookId: string): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        // 删除书籍（级联删除相关章节和片段）
        await connection.execute('DELETE FROM books WHERE id = ?', [bookId]);
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`删除书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveChapter(bookId: string, chapter: Chapter): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute(
          `INSERT INTO chapters (id, book_id, title, type, detail_outline, content, parent_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           title = VALUES(title), 
           type = VALUES(type), 
           detail_outline = VALUES(detail_outline), 
           content = VALUES(content), 
           parent_id = VALUES(parent_id)`,
          [
            chapter.id,
            bookId,
            chapter.title,
            chapter.type,
            JSON.stringify(chapter.detailOutline),
            chapter.content || '',
            null // parent_id 暂时设为null，后续可以根据需要实现层级关系
          ]
        );
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`保存章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getChapter(bookId: string, chapterId: string): Promise<Chapter | null> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM chapters WHERE book_id = ? AND id = ?',
          [bookId, chapterId]
        );
        
        if (!rows || rows.length === 0) return null;
        
        const chapter = rows[0];
        return {
          id: chapter.id,
          title: chapter.title,
          type: chapter.type,
          detailOutline: JSON.parse(chapter.detail_outline),
          content: chapter.content
        };
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('获取章节失败:', error);
      return null;
    }
  }

  async listChapters(bookId: string): Promise<Chapter[]> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM chapters WHERE book_id = ? ORDER BY created_at',
          [bookId]
        );
        
        if (!rows) return [];
        
        return rows.map((chapter: any) => ({
          id: chapter.id,
          title: chapter.title,
          type: chapter.type,
          detailOutline: JSON.parse(chapter.detail_outline),
          content: chapter.content
        }));
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('列出章节失败:', error);
      return [];
    }
  }

  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute(
          'DELETE FROM chapters WHERE book_id = ? AND id = ?',
          [bookId, chapterId]
        );
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`删除章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveFragment(bookId: string, fragment: Fragment): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute(
          `INSERT INTO fragments (id, book_id, title, content, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           title = VALUES(title), 
           content = VALUES(content), 
           updated_at = VALUES(updated_at)`,
          [
            fragment.id,
            bookId,
            fragment.title,
            fragment.content,
            fragment.createdAt,
            fragment.updatedAt
          ]
        );
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`保存片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getFragment(bookId: string, fragmentId: string): Promise<Fragment | null> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM fragments WHERE book_id = ? AND id = ?',
          [bookId, fragmentId]
        );
        
        if (!rows || rows.length === 0) return null;
        
        const fragment = rows[0];
        return {
          id: fragment.id,
          title: fragment.title,
          content: fragment.content,
          createdAt: fragment.created_at,
          updatedAt: fragment.updated_at
        };
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('获取片段失败:', error);
      return null;
    }
  }

  async listFragments(bookId: string): Promise<Fragment[]> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT * FROM fragments WHERE book_id = ? ORDER BY created_at DESC',
          [bookId]
        );
        
        if (!rows) return [];
        
        return rows.map((fragment: any) => ({
          id: fragment.id,
          title: fragment.title,
          content: fragment.content,
          createdAt: fragment.created_at,
          updatedAt: fragment.updated_at
        }));
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('列出片段失败:', error);
      return [];
    }
  }

  async deleteFragment(bookId: string, fragmentId: string): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute(
          'DELETE FROM fragments WHERE book_id = ? AND id = ?',
          [bookId, fragmentId]
        );
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`删除片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveAIConfig(provider: string, config: any): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute(
          `INSERT INTO ai_configs (provider, config) 
           VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE 
           config = VALUES(config)`,
          [provider, JSON.stringify(config)]
        );
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`保存AI配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAIConfig(provider: string): Promise<any> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute(
          'SELECT config FROM ai_configs WHERE provider = ?',
          [provider]
        );
        
        if (!rows || rows.length === 0) return null;
        
        return JSON.parse(rows[0].config);
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('获取AI配置失败:', error);
      return null;
    }
  }

  async listAIConfigs(): Promise<string[]> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        const [rows] = await connection.execute('SELECT provider FROM ai_configs');
        
        if (!rows) return [];
        
        return rows.map((row: any) => row.provider);
      } finally {
        connection.end();
      }
    } catch (error) {
      console.error('列出AI配置失败:', error);
      return [];
    }
  }

  async deleteAIConfig(provider: string): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute('DELETE FROM ai_configs WHERE provider = ?', [provider]);
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`删除AI配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async exportData(): Promise<any> {
    try {
      const books = await this.listBooks();
      const aiConfigs = await this.listAIConfigs();
      
      const data: any = {
        books: {},
        aiConfigs: {}
      };
      
      // 导出书籍数据
      for (const book of books) {
        data.books[book.id] = book;
        
        // 导出章节
        const chapters = await this.listChapters(book.id);
        data.books[book.id].chapters = chapters;
        
        // 导出片段
        const fragments = await this.listFragments(book.id);
        data.books[book.id].fragments = fragments;
      }
      
      // 导出AI配置
      for (const provider of aiConfigs) {
        const config = await this.getAIConfig(provider);
        data.aiConfigs[provider] = config;
      }
      
      return data;
    } catch (error) {
      throw new Error(`导出数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async importData(data: any): Promise<void> {
    try {
      // 导入书籍
      if (data.books) {
        for (const bookId in data.books) {
          const book = data.books[bookId];
          await this.saveBook(book);
          
          // 导入章节
          if (book.chapters) {
            for (const chapter of book.chapters) {
              await this.saveChapter(bookId, chapter);
            }
          }
          
          // 导入片段
          if (book.fragments) {
            for (const fragment of book.fragments) {
              await this.saveFragment(bookId, fragment);
            }
          }
        }
      }
      
      // 导入AI配置
      if (data.aiConfigs) {
        for (const provider in data.aiConfigs) {
          await this.saveAIConfig(provider, data.aiConfigs[provider]);
        }
      }
    } catch (error) {
      throw new Error(`导入数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await this.initializeTables();
      const connection = await this.getConnection();
      
      try {
        await connection.execute('DELETE FROM books');
        await connection.execute('DELETE FROM chapters');
        await connection.execute('DELETE FROM fragments');
        await connection.execute('DELETE FROM ai_configs');
      } finally {
        connection.end();
      }
    } catch (error) {
      throw new Error(`清除数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}