// 数据库服务接口
// 定义所有数据库服务必须实现的方法

import { Book, Chapter, Fragment } from './bookConfigService';
import { DatabaseConfig } from './databaseConfigService';

export interface DatabaseService {
  // 连接管理
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<{ success: boolean; message: string }>;
  
  // 书籍管理
  saveBook(book: Book): Promise<void>;
  getBook(bookId: string): Promise<Book | null>;
  listBooks(): Promise<Book[]>;
  deleteBook(bookId: string): Promise<void>;
  
  // 章节管理
  saveChapter(bookId: string, chapter: Chapter): Promise<void>;
  getChapter(bookId: string, chapterId: string): Promise<Chapter | null>;
  listChapters(bookId: string): Promise<Chapter[]>;
  deleteChapter(bookId: string, chapterId: string): Promise<void>;
  
  // 片段管理
  saveFragment(bookId: string, fragment: Fragment): Promise<void>;
  getFragment(bookId: string, fragmentId: string): Promise<Fragment | null>;
  listFragments(bookId: string): Promise<Fragment[]>;
  deleteFragment(bookId: string, fragmentId: string): Promise<void>;
  
  // AI配置管理
  saveAIConfig(provider: string, config: any): Promise<void>;
  getAIConfig(provider: string): Promise<any>;
  listAIConfigs(): Promise<string[]>;
  deleteAIConfig(provider: string): Promise<void>;
  
  // 数据导入导出
  exportData(): Promise<any>;
  importData(data: any): Promise<void>;
  
  // 数据清理
  clearAllData(): Promise<void>;
}

// 抽象基类，提供通用实现
export abstract class BaseDatabaseService implements DatabaseService {
  protected config: DatabaseConfig;
  protected isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<{ success: boolean; message: string }>;
  
  abstract saveBook(book: Book): Promise<void>;
  abstract getBook(bookId: string): Promise<Book | null>;
  abstract listBooks(): Promise<Book[]>;
  abstract deleteBook(bookId: string): Promise<void>;
  
  abstract saveChapter(bookId: string, chapter: Chapter): Promise<void>;
  abstract getChapter(bookId: string, chapterId: string): Promise<Chapter | null>;
  abstract listChapters(bookId: string): Promise<Chapter[]>;
  abstract deleteChapter(bookId: string, chapterId: string): Promise<void>;
  
  abstract saveFragment(bookId: string, fragment: Fragment): Promise<void>;
  abstract getFragment(bookId: string, fragmentId: string): Promise<Fragment | null>;
  abstract listFragments(bookId: string): Promise<Fragment[]>;
  abstract deleteFragment(bookId: string, fragmentId: string): Promise<void>;
  
  abstract saveAIConfig(provider: string, config: any): Promise<void>;
  abstract getAIConfig(provider: string): Promise<any>;
  abstract listAIConfigs(): Promise<string[]>;
  abstract deleteAIConfig(provider: string): Promise<void>;
  
  abstract exportData(): Promise<any>;
  abstract importData(data: any): Promise<void>;
  
  abstract clearAllData(): Promise<void>;

  // 通用辅助方法
  protected generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  protected formatDate(date: Date): string {
    return date.toISOString();
  }

  protected parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}