// SQL Server数据库服务
// 支持Microsoft SQL Server

import { BaseDatabaseService } from './databaseService';
import { Book, Chapter, Fragment } from './bookConfigService';
import { DatabaseConfig, SQLServerConfig } from './databaseConfigService';

// SQL Server相关类型定义
interface SQLServerConnection {
  query(sql: string, params?: any[]): Promise<any>;
  execute(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
  input(name: string, type: any, value: any): SQLServerConnection;
}

interface SQLServerPool {
  request(): SQLServerConnection;
  close(): Promise<void>;
}

// 动态导入SQL Server客户端
let sql: any = null;

export class SQLServerService extends BaseDatabaseService {
  private pool: SQLServerPool | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async connect(): Promise<void> {
    try {
      if (!sql) {
        // 动态导入SQL Server客户端
        sql = await import('mssql');
      }

      const sqlserverConfig = this.config as SQLServerConfig;
      const config = {
        server: sqlserverConfig.server,
        port: sqlserverConfig.port,
        user: sqlserverConfig.username,
        password: sqlserverConfig.password,
        database: sqlserverConfig.database,
        options: {
          encrypt: sqlserverConfig.encrypt || false,
          trustServerCertificate: sqlserverConfig.trustServerCertificate || false
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000
        }
      };

      this.pool = new sql.ConnectionPool(config) as SQLServerPool;
      
      if (!this.pool) {
        throw new Error('SQL Server连接池初始化失败');
      }
      
      await (this.pool as any).connect();
      this.isConnected = true;
    } catch (error) {
      throw new Error(`连接SQL Server失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
        this.isConnected = false;
      }
    } catch (error) {
      throw new Error(`断开SQL Server连接失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      // 测试连接
      const request = this.pool!.request();
      await request.query('SELECT 1');
      return { success: true, message: 'SQL Server连接正常' };
    } catch (error) {
      return { 
        success: false, 
        message: `SQL Server连接测试失败: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  private async initializeTables(): Promise<void> {
    const request = this.pool!.request();
    
    try {
      // 创建书籍表
      await request.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='books' and xtype='U')
        CREATE TABLE books (
          id NVARCHAR(255) PRIMARY KEY,
          title NVARCHAR(500) NOT NULL,
          description NVARCHAR(MAX),
          setting NVARCHAR(MAX),
          plot NVARCHAR(MAX),
          lastEdited DATETIME2 NOT NULL,
          created_at DATETIME2 DEFAULT SYSDATETIME(),
          updated_at DATETIME2 DEFAULT SYSDATETIME()
        )
      `);

      // 创建章节表
      await request.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='chapters' and xtype='U')
        CREATE TABLE chapters (
          id NVARCHAR(255) PRIMARY KEY,
          book_id NVARCHAR(255) NOT NULL,
          title NVARCHAR(500) NOT NULL,
          type NVARCHAR(50) NOT NULL CHECK (type IN ('volume', 'chapter')),
          detail_outline NVARCHAR(MAX),
          content NVARCHAR(MAX),
          parent_id NVARCHAR(255),
          created_at DATETIME2 DEFAULT SYSDATETIME(),
          updated_at DATETIME2 DEFAULT SYSDATETIME(),
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES chapters(id) ON DELETE CASCADE
        )
      `);

      // 创建片段表
      await request.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='fragments' and xtype='U')
        CREATE TABLE fragments (
          id NVARCHAR(255) PRIMARY KEY,
          book_id NVARCHAR(255) NOT NULL,
          title NVARCHAR(500) NOT NULL,
          content NVARCHAR(MAX) NOT NULL,
          created_at DATETIME2 DEFAULT SYSDATETIME(),
          updated_at DATETIME2 DEFAULT SYSDATETIME(),
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
      `);

      // 创建AI配置表
      await request.query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ai_configs' and xtype='U')
        CREATE TABLE ai_configs (
          provider NVARCHAR(255) PRIMARY KEY,
          config NVARCHAR(MAX) NOT NULL,
          created_at DATETIME2 DEFAULT SYSDATETIME(),
          updated_at DATETIME2 DEFAULT SYSDATETIME()
        )
      `);
    } catch (error) {
      throw new Error(`初始化表失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveBook(book: Book): Promise<void> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      await request.input('id', sql.NVarChar, book.id)
        .input('title', sql.NVarChar, book.title)
        .input('description', sql.NVarChar, book.description)
        .input('setting', sql.NVarChar, book.setting)
        .input('plot', sql.NVarChar, book.plot)
        .input('lastEdited', sql.DateTime2, this.formatDate(book.lastEdited))
        .query(`
          MERGE books AS target
          USING (VALUES (@id, @title, @description, @setting, @plot, @lastEdited)) 
          AS source (id, title, description, setting, plot, lastEdited)
          ON target.id = source.id
          WHEN MATCHED THEN
            UPDATE SET 
              title = source.title,
              description = source.description,
              setting = source.setting,
              plot = source.plot,
              lastEdited = source.lastEdited,
              updated_at = SYSDATETIME()
          WHEN NOT MATCHED THEN
            INSERT (id, title, description, setting, plot, lastEdited)
            VALUES (source.id, source.title, source.description, source.setting, source.plot, source.lastEdited);
        `);
    } catch (error) {
      throw new Error(`保存书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBook(bookId: string): Promise<Book | null> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      const result = await request.input('id', sql.NVarChar, bookId)
        .query('SELECT * FROM books WHERE id = @id');
      
      if (!result.recordset || result.recordset.length === 0) return null;
      
      const book = result.recordset[0];
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
      const request = this.pool!.request();
      
      const result = await request.query('SELECT * FROM books ORDER BY lastEdited DESC');
      
      if (!result.recordset) return [];
      
      return result.recordset.map((book: any) => ({
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
      const request = this.pool!.request();
      
      // 删除书籍（级联删除相关章节和片段）
      await request.input('id', sql.NVarChar, bookId)
        .query('DELETE FROM books WHERE id = @id');
    } catch (error) {
      throw new Error(`删除书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveChapter(bookId: string, chapter: Chapter): Promise<void> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      await request.input('id', sql.NVarChar, chapter.id)
        .input('bookId', sql.NVarChar, bookId)
        .input('title', sql.NVarChar, chapter.title)
        .input('type', sql.NVarChar, chapter.type)
        .input('detailOutline', sql.NVarChar, JSON.stringify(chapter.detailOutline))
        .input('content', sql.NVarChar, chapter.content || '')
        .query(`
          MERGE chapters AS target
          USING (VALUES (@id, @bookId, @title, @type, @detailOutline, @content)) 
          AS source (id, book_id, title, type, detail_outline, content)
          ON target.id = source.id AND target.book_id = source.book_id
          WHEN MATCHED THEN
            UPDATE SET 
              title = source.title,
              type = source.type,
              detail_outline = source.detail_outline,
              content = source.content,
              updated_at = SYSDATETIME()
          WHEN NOT MATCHED THEN
            INSERT (id, book_id, title, type, detail_outline, content)
            VALUES (source.id, source.book_id, source.title, source.type, source.detail_outline, source.content);
        `);
    } catch (error) {
      throw new Error(`保存章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getChapter(bookId: string, chapterId: string): Promise<Chapter | null> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      const result = await request.input('bookId', sql.NVarChar, bookId)
        .input('id', sql.NVarChar, chapterId)
        .query('SELECT * FROM chapters WHERE book_id = @bookId AND id = @id');
      
      if (!result.recordset || result.recordset.length === 0) return null;
      
      const chapter = result.recordset[0];
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
      const request = this.pool!.request();
      
      const result = await request.input('bookId', sql.NVarChar, bookId)
        .query('SELECT * FROM chapters WHERE book_id = @bookId ORDER BY created_at');
      
      if (!result.recordset) return [];
      
      return result.recordset.map((chapter: any) => ({
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
      const request = this.pool!.request();
      
      await request.input('bookId', sql.NVarChar, bookId)
        .input('id', sql.NVarChar, chapterId)
        .query('DELETE FROM chapters WHERE book_id = @bookId AND id = @id');
    } catch (error) {
      throw new Error(`删除章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveFragment(bookId: string, fragment: Fragment): Promise<void> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      await request.input('id', sql.NVarChar, fragment.id)
        .input('bookId', sql.NVarChar, bookId)
        .input('title', sql.NVarChar, fragment.title)
        .input('content', sql.NVarChar, fragment.content)
        .input('createdAt', sql.DateTime2, fragment.createdAt)
        .input('updatedAt', sql.DateTime2, fragment.updatedAt)
        .query(`
          MERGE fragments AS target
          USING (VALUES (@id, @bookId, @title, @content, @createdAt, @updatedAt)) 
          AS source (id, book_id, title, content, created_at, updated_at)
          ON target.id = source.id AND target.book_id = source.book_id
          WHEN MATCHED THEN
            UPDATE SET 
              title = source.title,
              content = source.content,
              updated_at = source.updatedAt
          WHEN NOT MATCHED THEN
            INSERT (id, book_id, title, content, created_at, updated_at)
            VALUES (source.id, source.book_id, source.title, source.content, source.created_at, source.updated_at);
        `);
    } catch (error) {
      throw new Error(`保存片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getFragment(bookId: string, fragmentId: string): Promise<Fragment | null> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      const result = await request.input('bookId', sql.NVarChar, bookId)
        .input('id', sql.NVarChar, fragmentId)
        .query('SELECT * FROM fragments WHERE book_id = @bookId AND id = @id');
      
      if (!result.recordset || result.recordset.length === 0) return null;
      
      const fragment = result.recordset[0];
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
      const request = this.pool!.request();
      
      const result = await request.input('bookId', sql.NVarChar, bookId)
        .query('SELECT * FROM fragments WHERE book_id = @bookId ORDER BY created_at DESC');
      
      if (!result.recordset) return [];
      
      return result.recordset.map((fragment: any) => ({
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
      const request = this.pool!.request();
      
      await request.input('bookId', sql.NVarChar, bookId)
        .input('id', sql.NVarChar, fragmentId)
        .query('DELETE FROM fragments WHERE book_id = @bookId AND id = @id');
    } catch (error) {
      throw new Error(`删除片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveAIConfig(provider: string, config: any): Promise<void> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      await request.input('provider', sql.NVarChar, provider)
        .input('config', sql.NVarChar, JSON.stringify(config))
        .query(`
          MERGE ai_configs AS target
          USING (VALUES (@provider, @config)) 
          AS source (provider, config)
          ON target.provider = source.provider
          WHEN MATCHED THEN
            UPDATE SET 
              config = source.config,
              updated_at = SYSDATETIME()
          WHEN NOT MATCHED THEN
            INSERT (provider, config)
            VALUES (source.provider, source.config);
        `);
    } catch (error) {
      throw new Error(`保存AI配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAIConfig(provider: string): Promise<any> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      const result = await request.input('provider', sql.NVarChar, provider)
        .query('SELECT config FROM ai_configs WHERE provider = @provider');
      
      if (!result.recordset || result.recordset.length === 0) return null;
      
      return JSON.parse(result.recordset[0].config);
    } catch (error) {
      console.error('获取AI配置失败:', error);
      return null;
    }
  }

  async listAIConfigs(): Promise<string[]> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      const result = await request.query('SELECT provider FROM ai_configs');
      
      if (!result.recordset) return [];
      
      return result.recordset.map((row: any) => row.provider);
    } catch (error) {
      console.error('列出AI配置失败:', error);
      return [];
    }
  }

  async deleteAIConfig(provider: string): Promise<void> {
    try {
      await this.initializeTables();
      const request = this.pool!.request();
      
      await request.input('provider', sql.NVarChar, provider)
        .query('DELETE FROM ai_configs WHERE provider = @provider');
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
      const request = this.pool!.request();
      
      await request.query('DELETE FROM books');
      await request.query('DELETE FROM chapters');
      await request.query('DELETE FROM fragments');
      await request.query('DELETE FROM ai_configs');
    } catch (error) {
      throw new Error(`清除数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}