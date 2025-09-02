// MongoDB数据库服务
// 支持MongoDB Atlas免费层和本地MongoDB

import { BaseDatabaseService } from './databaseService';
import { Book, Chapter, Fragment } from './bookConfigService';
import { DatabaseConfig, MongoDBConfig } from './databaseConfigService';

// MongoDB相关类型定义
interface MongoDBDocument {
  _id?: string;
  id: string;
  [key: string]: any;
}

interface MongoDBCollection {
  insertOne(document: MongoDBDocument): Promise<any>;
  findOne(query: any): Promise<any>;
  find(query: any): Promise<any>;
  updateOne(query: any, update: any): Promise<any>;
  deleteOne(query: any): Promise<any>;
  deleteMany(query: any): Promise<any>;
}

interface MongoDBDatabase {
  collection(name: string): MongoDBCollection;
}

interface MongoClient {
  db(name?: string): MongoDBDatabase;
  close(): Promise<void>;
}

// 动态导入MongoDB客户端
let MongoClient: any = null;

export class MongoDBService extends BaseDatabaseService {
  private client: MongoClient | null = null;
  private db: MongoDBDatabase | null = null;
  private config: MongoDBConfig;

  constructor(config: DatabaseConfig) {
    super(config);
    this.config = config as MongoDBConfig;
  }

  async connect(): Promise<void> {
    try {
      if (!MongoClient) {
        // 动态导入MongoDB客户端
        const mongodb = await import('mongodb');
        MongoClient = mongodb.MongoClient;
      }

      this.client = new MongoClient(this.config.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.config.databaseName);
      this.isConnected = true;
    } catch (error) {
      throw new Error(`连接MongoDB失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.isConnected = false;
      }
    } catch (error) {
      throw new Error(`断开MongoDB连接失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      // 测试连接
      await this.db!.collection('test').findOne({});
      return { success: true, message: 'MongoDB连接正常' };
    } catch (error) {
      return { 
        success: false, 
        message: `MongoDB连接测试失败: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  private getCollection(name: string): MongoDBCollection {
    if (!this.db) {
      throw new Error('数据库未连接');
    }
    return this.db.collection(name);
  }

  async saveBook(book: Book): Promise<void> {
    try {
      const collection = this.getCollection('books');
      const bookData = {
        ...book,
        lastEdited: this.formatDate(book.lastEdited)
      };
      
      await collection.updateOne(
        { id: book.id },
        { $set: bookData },
        { upsert: true }
      );
    } catch (error) {
      throw new Error(`保存书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBook(bookId: string): Promise<Book | null> {
    try {
      const collection = this.getCollection('books');
      const bookData = await collection.findOne({ id: bookId });
      
      if (!bookData) return null;
      
      return {
        ...bookData,
        lastEdited: this.parseDate(bookData.lastEdited)
      };
    } catch (error) {
      console.error('获取书籍失败:', error);
      return null;
    }
  }

  async listBooks(): Promise<Book[]> {
    try {
      const collection = this.getCollection('books');
      const cursor = await collection.find({});
      const books = await cursor.toArray();
      
      return books.map(book => ({
        ...book,
        lastEdited: this.parseDate(book.lastEdited)
      }));
    } catch (error) {
      console.error('列出书籍失败:', error);
      return [];
    }
  }

  async deleteBook(bookId: string): Promise<void> {
    try {
      const booksCollection = this.getCollection('books');
      const chaptersCollection = this.getCollection('chapters');
      const fragmentsCollection = this.getCollection('fragments');
      
      // 删除书籍
      await booksCollection.deleteOne({ id: bookId });
      
      // 删除相关章节
      await chaptersCollection.deleteMany({ bookId });
      
      // 删除相关片段
      await fragmentsCollection.deleteMany({ bookId });
    } catch (error) {
      throw new Error(`删除书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveChapter(bookId: string, chapter: Chapter): Promise<void> {
    try {
      const collection = this.getCollection('chapters');
      const chapterData = {
        ...chapter,
        bookId
      };
      
      await collection.updateOne(
        { bookId, id: chapter.id },
        { $set: chapterData },
        { upsert: true }
      );
    } catch (error) {
      throw new Error(`保存章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getChapter(bookId: string, chapterId: string): Promise<Chapter | null> {
    try {
      const collection = this.getCollection('chapters');
      const chapterData = await collection.findOne({ bookId, id: chapterId });
      
      if (!chapterData) return null;
      
      return chapterData as Chapter;
    } catch (error) {
      console.error('获取章节失败:', error);
      return null;
    }
  }

  async listChapters(bookId: string): Promise<Chapter[]> {
    try {
      const collection = this.getCollection('chapters');
      const cursor = await collection.find({ bookId });
      const chapters = await cursor.toArray();
      
      return chapters as Chapter[];
    } catch (error) {
      console.error('列出章节失败:', error);
      return [];
    }
  }

  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    try {
      const collection = this.getCollection('chapters');
      await collection.deleteOne({ bookId, id: chapterId });
    } catch (error) {
      throw new Error(`删除章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveFragment(bookId: string, fragment: Fragment): Promise<void> {
    try {
      const collection = this.getCollection('fragments');
      const fragmentData = {
        ...fragment,
        bookId
      };
      
      await collection.updateOne(
        { bookId, id: fragment.id },
        { $set: fragmentData },
        { upsert: true }
      );
    } catch (error) {
      throw new Error(`保存片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getFragment(bookId: string, fragmentId: string): Promise<Fragment | null> {
    try {
      const collection = this.getCollection('fragments');
      const fragmentData = await collection.findOne({ bookId, id: fragmentId });
      
      if (!fragmentData) return null;
      
      return fragmentData as Fragment;
    } catch (error) {
      console.error('获取片段失败:', error);
      return null;
    }
  }

  async listFragments(bookId: string): Promise<Fragment[]> {
    try {
      const collection = this.getCollection('fragments');
      const cursor = await collection.find({ bookId });
      const fragments = await cursor.toArray();
      
      return fragments as Fragment[];
    } catch (error) {
      console.error('列出片段失败:', error);
      return [];
    }
  }

  async deleteFragment(bookId: string, fragmentId: string): Promise<void> {
    try {
      const collection = this.getCollection('fragments');
      await collection.deleteOne({ bookId, id: fragmentId });
    } catch (error) {
      throw new Error(`删除片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveAIConfig(provider: string, config: any): Promise<void> {
    try {
      const collection = this.getCollection('ai_configs');
      await collection.updateOne(
        { provider },
        { $set: { provider, config } },
        { upsert: true }
      );
    } catch (error) {
      throw new Error(`保存AI配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAIConfig(provider: string): Promise<any> {
    try {
      const collection = this.getCollection('ai_configs');
      const result = await collection.findOne({ provider });
      
      if (!result) return null;
      
      return result.config;
    } catch (error) {
      console.error('获取AI配置失败:', error);
      return null;
    }
  }

  async listAIConfigs(): Promise<string[]> {
    try {
      const collection = this.getCollection('ai_configs');
      const cursor = await collection.find({});
      const configs = await cursor.toArray();
      
      return configs.map(c => c.provider);
    } catch (error) {
      console.error('列出AI配置失败:', error);
      return [];
    }
  }

  async deleteAIConfig(provider: string): Promise<void> {
    try {
      const collection = this.getCollection('ai_configs');
      await collection.deleteOne({ provider });
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
      const booksCollection = this.getCollection('books');
      const chaptersCollection = this.getCollection('chapters');
      const fragmentsCollection = this.getCollection('fragments');
      const aiConfigsCollection = this.getCollection('ai_configs');
      
      await booksCollection.deleteMany({});
      await chaptersCollection.deleteMany({});
      await fragmentsCollection.deleteMany({});
      await aiConfigsCollection.deleteMany({});
    } catch (error) {
      throw new Error(`清除数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}