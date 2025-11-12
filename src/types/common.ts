/**
 * 通用类型定义
 * 用于减少代码中的 any 使用
 */

import type { Book, Chapter, AIConfig } from './index';
import type { Fragment } from '../services/bookConfigService';

// 数据库服务通用接口类型
export interface DatabaseService {
  getBook(bookId: string): Promise<Book | null>;
  getChapter(bookId: string, chapterId: string): Promise<Chapter | null>;
  getFragment(bookId: string, fragmentId: string): Promise<Fragment | null>;
  saveAIConfig(provider: string, config: AIConfig): Promise<void>;
  getAIConfig(provider: string): Promise<AIConfig | null>;
  exportData(): Promise<ExportData>;
  importData(data: ImportData): Promise<void>;
}

// 统一使用 src/types/index.ts 中的 AIConfig 类型定义

// 导出/导入数据类型
export interface ExportData {
  books: Book[];
  chapters: Chapter[];
  fragments: Fragment[];
  aiConfigs: AIConfig[];
  metadata: {
    version: string;
    timestamp: string;
    appVersion?: string;
  };
}

export interface ImportData {
  books?: Book[];
  chapters?: Chapter[];
  fragments?: Fragment[];
  aiConfigs?: AIConfig[];
}

// 响应类型
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
}

// 错误响应类型
export interface AIErrorResponse {
  error: string;
  type?: string;
  param?: string;
  code?: string | number;
  details?: string;
  retryable?: boolean;
}

// 分页参数类型
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 搜索参数类型
export interface SearchParams {
  query: string;
  type?: 'book' | 'chapter' | 'fragment';
  bookId?: string;
  chapterId?: string;
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

// 文件操作类型
export interface FileOperationResult {
  success: boolean;
  path?: string;
  size?: number;
  error?: string;
  message?: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: number;
  isDirectory: boolean;
}

// 通用配置类型
export interface AppConfig {
  version: string;
  build: string;
  environment: 'development' | 'production' | 'test';
  features: Record<string, boolean>;
  settings: Record<string, any>;
}

// 事件类型
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: number;
  source?: string;
}

// 缓存键类型
export type CacheKey = string | number;

export interface CacheEntry<T = any> {
  key: CacheKey;
  value: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

// 工具函数类型
export type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

export type ThrottledFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

// 组件 Props 类型
export interface BaseComponentProps {
  class?: string;
  style?: Record<string, any>;
  id?: string;
}

// 表单字段类型
export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

// API 请求类型
export interface APIRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}