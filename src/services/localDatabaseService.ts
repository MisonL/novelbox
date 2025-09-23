// 本地数据库服务
// 使用localStorage作为存储后端

import { BaseDatabaseService } from './databaseService';
import { Book, Chapter, Fragment } from './bookConfigService';

export class LocalDatabaseService extends BaseDatabaseService {
  private readonly BOOK_PREFIX = 'book:';
  private readonly CHAPTER_PREFIX = 'chapter:';
  private readonly FRAGMENT_PREFIX = 'fragment:';
  private readonly AI_CONFIG_PREFIX = 'aiConfig:';

  async connect(): Promise<void> {
    // 本地存储不需要连接
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    // 本地存储不需要断开连接
    this.isConnected = false;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // 测试localStorage是否可用
      const testKey = 'test_connection';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (value === 'test') {
        return { success: true, message: '本地存储连接正常' };
      } else {
        return { success: false, message: '本地存储不可用' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `本地存储测试失败: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  async saveBook(book: Book): Promise<void> {
    try {
      const bookData = {
        ...book,
        lastEdited: this.formatDate(book.lastEdited)
      };
      localStorage.setItem(`${this.BOOK_PREFIX}${book.id}`, JSON.stringify(bookData));
    } catch (error) {
      throw new Error(`保存书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getBook(bookId: string): Promise<Book | null> {
    try {
      const bookStr = localStorage.getItem(`${this.BOOK_PREFIX}${bookId}`);
      if (!bookStr) return null;
      
      const bookData = JSON.parse(bookStr);
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
      const books: Book[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.BOOK_PREFIX)) {
          const bookId = key.replace(this.BOOK_PREFIX, '');
          const book = await this.getBook(bookId);
          if (book) {
            books.push(book);
          }
        }
      }
      
      return books;
    } catch (error) {
      console.error('列出书籍失败:', error);
      return [];
    }
  }

  async deleteBook(bookId: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.BOOK_PREFIX}${bookId}`);
      
      // 同时删除相关的章节和片段
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(`${this.CHAPTER_PREFIX}${bookId}:`) || 
            key.startsWith(`${this.FRAGMENT_PREFIX}${bookId}:`)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      throw new Error(`删除书籍失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveChapter(bookId: string, chapter: Chapter): Promise<void> {
    try {
      localStorage.setItem(`${this.CHAPTER_PREFIX}${bookId}:${chapter.id}`, JSON.stringify(chapter));
    } catch (error) {
      throw new Error(`保存章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getChapter(bookId: string, chapterId: string): Promise<Chapter | null> {
    try {
      const chapterStr = localStorage.getItem(`${this.CHAPTER_PREFIX}${bookId}:${chapterId}`);
      if (!chapterStr) return null;
      
      return JSON.parse(chapterStr) as Chapter;
    } catch (error) {
      console.error('获取章节失败:', error);
      return null;
    }
  }

  async listChapters(bookId: string): Promise<Chapter[]> {
    try {
      const chapters: Chapter[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(`${this.CHAPTER_PREFIX}${bookId}:`)) {
          const chapterStr = localStorage.getItem(key);
          if (chapterStr) {
            chapters.push(JSON.parse(chapterStr) as Chapter);
          }
        }
      }
      
      return chapters;
    } catch (error) {
      console.error('列出章节失败:', error);
      return [];
    }
  }

  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.CHAPTER_PREFIX}${bookId}:${chapterId}`);
    } catch (error) {
      throw new Error(`删除章节失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveFragment(bookId: string, fragment: Fragment): Promise<void> {
    try {
      localStorage.setItem(`${this.FRAGMENT_PREFIX}${bookId}:${fragment.id}`, JSON.stringify(fragment));
    } catch (error) {
      throw new Error(`保存片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getFragment(bookId: string, fragmentId: string): Promise<Fragment | null> {
    try {
      const fragmentStr = localStorage.getItem(`${this.FRAGMENT_PREFIX}${bookId}:${fragmentId}`);
      if (!fragmentStr) return null;
      
      return JSON.parse(fragmentStr) as Fragment;
    } catch (error) {
      console.error('获取片段失败:', error);
      return null;
    }
  }

  async listFragments(bookId: string): Promise<Fragment[]> {
    try {
      const fragments: Fragment[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(`${this.FRAGMENT_PREFIX}${bookId}:`)) {
          const fragmentStr = localStorage.getItem(key);
          if (fragmentStr) {
            fragments.push(JSON.parse(fragmentStr) as Fragment);
          }
        }
      }
      
      return fragments;
    } catch (error) {
      console.error('列出片段失败:', error);
      return [];
    }
  }

  async deleteFragment(bookId: string, fragmentId: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.FRAGMENT_PREFIX}${bookId}:${fragmentId}`);
    } catch (error) {
      throw new Error(`删除片段失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveAIConfig(provider: string, config: any): Promise<void> {
    try {
      localStorage.setItem(`${this.AI_CONFIG_PREFIX}${provider}`, JSON.stringify(config));
    } catch (error) {
      throw new Error(`保存AI配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAIConfig(provider: string): Promise<any> {
    try {
      const configStr = localStorage.getItem(`${this.AI_CONFIG_PREFIX}${provider}`);
      if (!configStr) return null;
      
      return JSON.parse(configStr);
    } catch (error) {
      console.error('获取AI配置失败:', error);
      return null;
    }
  }

  async listAIConfigs(): Promise<string[]> {
    try {
      const providers: string[] = [];
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.AI_CONFIG_PREFIX)) {
          providers.push(key.replace(this.AI_CONFIG_PREFIX, ''));
        }
      }
      
      return providers;
    } catch (error) {
      console.error('列出AI配置失败:', error);
      return [];
    }
  }

  async deleteAIConfig(provider: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.AI_CONFIG_PREFIX}${provider}`);
    } catch (error) {
      throw new Error(`删除AI配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async exportData(): Promise<any> {
    try {
      const data: any = {};
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.BOOK_PREFIX) ||
            key.startsWith(this.CHAPTER_PREFIX) ||
            key.startsWith(this.FRAGMENT_PREFIX) ||
            key.startsWith(this.AI_CONFIG_PREFIX)) {
          data[key] = localStorage.getItem(key);
        }
      }
      
      return data;
    } catch (error) {
      throw new Error(`导出数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async importData(data: any): Promise<void> {
    try {
      for (const key in data) {
        localStorage.setItem(key, data[key]);
      }
    } catch (error) {
      throw new Error(`导入数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        if (key.startsWith(this.BOOK_PREFIX) ||
            key.startsWith(this.CHAPTER_PREFIX) ||
            key.startsWith(this.FRAGMENT_PREFIX) ||
            key.startsWith(this.AI_CONFIG_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      throw new Error(`清除数据失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}