/**
 * 全局类型定义
 * 项目中使用的TypeScript类型定义
 */

// 基础类型
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface BaseConfig {
  version: string
  lastModified: Date
}

// 书籍相关类型
export interface Book extends BaseEntity {
  title: string
  author: string
  description: string
  genre?: string
  wordCount: number
  chapters: Chapter[]
  settings: BookSettings
  metadata: BookMetadata
}

export interface Chapter extends BaseEntity {
  bookId: string
  title: string
  content: string
  wordCount: number
  parentId?: string
  orderIndex: number
  isLocked: boolean
  metadata: ChapterMetadata
}

export interface BookSettings {
  autoSave: boolean
  autoSaveInterval: number
  defaultFontSize: number
  theme: 'light' | 'dark' | 'auto'
  language: string
  spellCheck: boolean
  grammarCheck: boolean
}

export interface BookMetadata {
  totalChapters: number
  totalWords: number
  readingTime: number
  tags: string[]
  coverImage?: string
  isbn?: string
  publisher?: string
  publishDate?: Date
}

export interface ChapterMetadata {
  readingTime: number
  tags: string[]
  isDraft: boolean
  isCompleted: boolean
  wordGoal?: number
  deadline?: Date
}

// AI服务相关类型
export interface AIProvider {
  id: string
  name: string
  models: AIModel[]
  defaultTemperature: number
  defaultTopP: number
  requiresApiKey: boolean
  supportsStreaming: boolean
}

export interface AIModel {
  id: string
  name: string
  maxTokens?: number
  description?: string
  pricing?: ModelPricing
}

export interface ModelPricing {
  input: number // per 1K tokens
  output: number // per 1K tokens
  currency: string
}

export interface AIConfig {
  provider: string
  model: string
  apiKey?: string
  baseURL?: string
  temperature: number
  topP: number
  maxTokens: number
  systemPrompt?: string
}

export interface AIRequest {
  prompt: string
  messages?: ChatMessage[]
  options?: AIOptions
  context?: AIContext
}

export interface AIResponse {
  text: string
  usage?: TokenUsage
  model?: string
  finishReason?: string
  error?: AIError
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  name?: string
}

export interface AIOptions {
  temperature?: number
  topP?: number
  maxTokens?: number
  stream?: boolean
  stopSequences?: string[]
  presencePenalty?: number
  frequencyPenalty?: number
}

export interface AIContext {
  bookId?: string
  chapterId?: string
  userId?: string
  sessionId?: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface AIError {
  code: string
  message: string
  provider?: string
  model?: string
  retryable?: boolean
}

// 数据库相关类型
export interface DatabaseConfig {
  type: 'local' | 'mongodb' | 'mysql' | 'sqlite' | 'sqlserver'
  connection: DatabaseConnection
  options?: DatabaseOptions
}

export interface DatabaseConnection {
  host?: string
  port?: number
  database: string
  username?: string
  password?: string
  filename?: string // for SQLite
  connectionString?: string
}

export interface DatabaseOptions {
  ssl?: boolean
  poolSize?: number
  timeout?: number
  retryAttempts?: number
  charset?: string
}

export interface DatabaseMigration {
  version: string
  description: string
  up: () => Promise<void>
  down: () => Promise<void>
}

// 文件系统相关类型
export interface FileInfo {
  name: string
  path: string
  size: number
  type: 'file' | 'directory'
  modifiedAt: Date
  createdAt: Date
  extension?: string
}

export interface FileStorageConfig {
  type: 'local' | 'cloud'
  basePath: string
  maxFileSize: number
  allowedExtensions: string[]
}

// UI相关类型
export interface UITheme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      small: string
      medium: string
      large: string
    }
  }
}

export interface UIPosition {
  x: number
  y: number
  width?: number
  height?: number
}

export interface UISize {
  width: number
  height: number
}

// 编辑器相关类型
export interface EditorConfig {
  fontSize: number
  fontFamily: string
  lineHeight: number
  tabSize: number
  wordWrap: boolean
  spellCheck: boolean
  grammarCheck: boolean
  autoSave: boolean
  autoSaveInterval: number
  theme: string
}

export interface EditorState {
  content: string
  selection: EditorSelection
  undoStack: EditorAction[]
  redoStack: EditorAction[]
  isDirty: boolean
  wordCount: number
}

export interface EditorSelection {
  start: number
  end: number
  text: string
}

export interface EditorAction {
  type: 'insert' | 'delete' | 'format'
  range: EditorSelection
  text: string
  timestamp: Date
}

// 网络请求相关类型
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
  timestamp: Date
}

export interface APIError {
  code: string
  message: string
  details?: any
  retryable?: boolean
}

export interface RequestConfig {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  params?: Record<string, any>
}

// 错误处理相关类型
export interface AppError {
  code: string
  message: string
  details?: any
  userMessage?: string
  recoverable?: boolean
  timestamp: Date
}

export interface ErrorHandler {
  handle(error: AppError): void
  canHandle(error: AppError): boolean
  getPriority(): number
}

// 配置相关类型
export interface AppConfig {
  version: string
  environment: 'development' | 'staging' | 'production'
  features: FeatureFlags
  api: APIConfig
  logging: LoggingConfig
  security: SecurityConfig
}

export interface FeatureFlags {
  [key: string]: boolean
}

export interface APIConfig {
  baseURL: string
  timeout: number
  retries: number
  rateLimit: RateLimitConfig
}

export interface RateLimitConfig {
  requests: number
  window: number // seconds
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  enabled: boolean
  output: 'console' | 'file' | 'remote'
}

export interface SecurityConfig {
  encryption: EncryptionConfig
  authentication: AuthConfig
  authorization: AuthConfig
}

export interface EncryptionConfig {
  algorithm: string
  keySize: number
}

export interface AuthConfig {
  enabled: boolean
  provider: string
  options?: Record<string, any>
}

// 性能监控相关类型
export interface PerformanceMetrics {
  pageLoadTime?: number
  renderTime?: number
  apiResponseTime?: number
  memoryUsage?: number
  cpuUsage?: number
}

export interface UserMetrics {
  sessionDuration: number
  pageViews: number
  actions: UserAction[]
  errors: UserError[]
}

export interface UserAction {
  type: string
  timestamp: Date
  duration?: number
  metadata?: Record<string, any>
}

export interface UserError {
  message: string
  stack?: string
  timestamp: Date
  context?: Record<string, any>
}