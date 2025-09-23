// SQLite数据库服务
// 支持SQLite文件数据库

import { BaseDatabaseService } from './databaseService';
import { Book, Chapter, Fragment } from './bookConfigService';
import { DatabaseConfig, SQLiteConfig } from './databaseConfigService';

// SQLite相关类型定义
interface SQLiteDatabase {
  run(sql: string, params?: any[]): { lastID: number; changes: number };
  get(sql: string, params?: any[]): any;
  all(sql: string, params?: any[]): any[];
  exec(sql: string): void;
  close(): void;
}

interface SQLite {
  Database: new (filename: string, options?: any) => SQLiteDatabase;
  OPEN_READWRITE: number;
  OPEN_CREATE: number;
}

// 动态导入SQLite客户端
let sqlite: SQLite | null = null;

export class SQLiteService extends BaseDatabaseService {
  private db: SQLiteDatabase | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    try {
      if (!sqlite) {
        // 动态导入SQLite客户端
        const sqliteModule = await import('sqlite3') as any;
        sqlite = sqliteModule.default || sqliteModule;
      }
      
      if (!sqlite || !sqlite.Database) {
        throw new Error('SQLite客户端初始化失败');
      }

      const sqliteConfig = this.config as SQLiteConfig;
      this.db = new (sqlite.Database as any)(
        sqliteConfig.filePath,
        (sqlite.OPEN_READWRITE || 2) | (sqlite.OPEN_CREATE || 4),
        (err: any) => {
          if (err) {
            throw new Error(`连接SQLite失败: ${err.message}`);
          }
        }
      );

      // 启用外键约束
      if (this.db) {
        (this.db as any).exec('PRAGMA foreign_keys = ON');
      }
      
      this.isConnected = true;
    } catch (error) {
      throw new Error(`连接SQLite失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
        this.isConnected = false;
      }
    } catch (error) {
      throw new Error(`断开SQLite连接失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      // 测试连接
      this.db!.get('SELECT 1');
      return { success: true, message: 'SQLite连接正常' };
    } catch (error) {
      return { 
        success: false, 
        message: `SQLite连接测试失败: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  private async initializeTables(): Promise<void> {
    try {
      // 创建书籍表
      this.db!.exec(`
        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          setting TEXT,
          plot TEXT,
          lastEdited DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建章节表
      this.db!.exec(`
        CREATE TABLE IF NOT EXISTS chapters (
          id TEXT PRIMARY KEY,
          book_id TEXT NOT NULL,
          title TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('volume', 'chapter')),
          detail_outline TEXT,
          content TEXT,
          parent_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES chapters(id) ON DELETE CASCADE
        )
      `);

      // 创建片段表
      this.db!.exec(`
        CREATE TABLE IF NOT EXISTS fragments (
          id TEXT PRIMARY KEY,
          book_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
      `);

      // 创建AI配置表
      this.db!.exec(`
        CREATE TABLE IF NOT EXISTS ai_configs (
          provider TEXT PRIMARY KEY,
          config TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      throw new Error(`初始化表失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveBook(book: Book): Promise<void> {
    try {
      await this.initializeTables();
      
      this.db!.run(
        `INSERT OR REPLACE INTO books (id, title, description, setting, plot, lastEdited) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          book.id,
          book.title,
          book.description,
          book.setting,
          book.plot,
          this.formatDate(book.lastEdited)
        ]
      );
    } catch (error) {
      throw new Error(`保存书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBook(bookId: string): Promise<Book | null> {
    try {
      await this.initializeTables();
      
      const book = this.db!.get('SELECT * FROM books WHERE id = ?', [bookId]);
      
      if (!book) return null;
      
      return {
        id: book.id,
        title: book.title,
        description: book.description,
        setting: book.setting,
        plot: book.plot,
        lastEdited: this.parseDate(book.lastEdited),
        content: []
      };
    } catch (error) {
      console.error('获取书籍失败:', error);
      return null;
    }
  }

  async listBooks(): Promise<Book[]> {
    try {
      await this.initializeTables();
      
      const books = this.db!.all('SELECT * FROM books ORDER BY lastEdited DESC');
      
      if (!books) return [];
      
      return books.map(book => ({
        id: book.id,
        title: book.title,
        description: book.description,
        setting: book.setting,
        plot: book.plot,
        lastEdited: this.parseDate(book.lastEdited),
        content: []
      }));
    } catch (error) {
      console.error('列出书籍失败:', error);
      return [];
    }
  }

  async deleteBook(bookId: string): Promise<void> {
    try {
      await this.initializeTables();
      
      // 删除书籍（级联删除相关章节和片段）
      this.db!.run('DELETE FROM books WHERE id = ?', [bookId]);
    } catch (error) {
      throw new Error(`删除书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveChapter(bookId: string, chapter: Chapter): Promise<void> {
    try {
      await this.initializeTables();
      
      this.db!.run(
        `INSERT OR REPLACE INTO chapters (id, book_id, title, type, detail_outline, content) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          chapter.id,
          bookId,
          chapter.title,
          chapter.type,
          JSON.stringify(chapter.detailOutline),
          chapter.content || ''
        ]
      );
    } catch (error) {
      throw new Error(`保存章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getChapter(bookId: string, chapterId: string): Promise<Chapter | null> {
    try {
      await this.initializeTables();
      
      const chapter = this.db!.get(
        'SELECT * FROM chapters WHERE book_id = ? AND id = ?',
        [bookId, chapterId]
      );
      
      if (!chapter) return null;
      
      return {
        id: chapter.id,
        title: chapter.title,
        type: chapter.type,
        detailOutline: JSON.parse(chapter.detail_outline),
        content: chapter.content
      };
    } catch (error) {
      console.error('获取章节失败:', error);
      return null;
    }
  }

  async listChapters(bookId: string): Promise<Chapter[]> {
    try {
      await this.initializeTables();
      
      const chapters = this.db!.all(
        'SELECT * FROM chapters WHERE book_id = ? ORDER BY created_at',
        [bookId]
      );
      
      if (!chapters) return [];
      
      return chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        type: chapter.type,
        detailOutline: JSON.parse(chapter.detail_outline),
        content: chapter.content
      }));
    } catch (error) {
      console.error('列出章节失败:', error);
      return [];
    }
  }

  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    try {
      await this.initializeTables();
      
      this.db!.run(
        'DELETE FROM chapters WHERE book_id = ? AND id = ?',
        [bookId, chapterId]
      );
    } catch (error) {
      throw new Error(`删除章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveFragment(bookId: string, fragment: Fragment): Promise<void> {
    try {
      await this.initializeTables();
      
      this.db!.run(
        `INSERT OR REPLACE INTO fragments (id, book_id, title, content, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          fragment.id,
          bookId,
          fragment.title,
          fragment.content,
          fragment.createdAt,
          fragment.updatedAt
        ]
      );
    } catch (error) {
      throw new Error(`保存片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getFragment(bookId: string, fragmentId: string): Promise<Fragment | null> {
    try {
      await this.initializeTables();
      
      const fragment = this.db!.get(
        'SELECT * FROM fragments WHERE book_id = ? AND id = ?',
        [bookId, fragmentId]
      );
      
      if (!fragment) return null;
      
      return {
        id: fragment.id,
        title: fragment.title,
        content: fragment.content,
        createdAt: fragment.created_at,
        updatedAt: fragment.updated_at
      };
    } catch (error) {
      console.error('获取片段失败:', error);
      return null;
    }
  }

  async listFragments(bookId: string): Promise<Fragment[]> {
    try {
      await this.initializeTables();
      
      const fragments = this.db!.all(
        'SELECT * FROM fragments WHERE book_id = ? ORDER BY created_at DESC',
        [bookId]
      );
      
      if (!fragments) return [];
      
      return fragments.map(fragment => ({
        id: fragment.id,
        title: fragment.title,
        content: fragment.content,
        createdAt: fragment.created_at,
        updatedAt: fragment.updated_at
      }));
    } catch (error) {
      console.error('列出片段失败:', error);
      return [];
    }
  }

  async deleteFragment(bookId: string, fragmentId: string): Promise<void> {
    try {
      await this.initializeTables();
      
      this.db!.run(
        'DELETE FROM fragments WHERE book_id = ? AND id = ?',
        [bookId, fragmentId]
      );
    } catch (error) {
      throw new Error(`删除片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveAIConfig(provider: string, config: any): Promise<void> {
    try {
      await this.initializeTables();
      
      this.db!.run(
        `INSERT OR REPLACE INTO ai_configs (provider, config) 
         VALUES (?, ?)`,
        [provider, JSON.stringify(config)]
      );
    } catch (error) {
      throw new Error(`保存AI配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAIConfig(provider: string): Promise<any> {
    try {
      await this.initializeTables();
      
      const result = this.db!.get(
        'SELECT config FROM ai_configs WHERE provider = ?',
        [provider]
      );
      
      if (!result) return null;
      
      return JSON.parse(result.config);
    } catch (error) {
      console.error('获取AI配置失败:', error);
      return null;
    }
  }

  async listAIConfigs(): Promise<string[]> {
    try {
      await this.initializeTables();
      
      const results = this.db!.all('SELECT provider FROM ai_configs');
      
      if (!results) return [];
      
      return results.map(row => row.provider);
    } catch (error) {
      console.error('列出AI配置失败:', error);
      return [];
    }
  }

  async deleteAIConfig(provider: string): Promise<void> {
    try {
      await this.initializeTables();
      
      this.db!.run('DELETE FROM ai_configs WHERE provider = ?', [provider]);
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
      
      this.db!.run('DELETE FROM books');
      this.db!.run('DELETE FROM chapters');
      this.db!.run('DELETE FROM fragments');
      this.db!.run('DELETE FROM ai_configs');
    } catch (error) {
      throw new Error(`清除数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}