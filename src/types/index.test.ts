/**
 * 类型定义测试
 */

import { describe, it, expect } from 'vitest'
import type {
  Book,
  Chapter,
  AIProvider,
  AIConfig,
  DatabaseConfig,
  EditorConfig,
  AppConfig,
  PerformanceMetrics,
  UserMetrics,
  AppError
} from '../types/index'

describe('类型定义测试', () => {
  describe('书籍相关类型', () => {
    it('应该定义正确的书籍类型', () => {
      const book: Book = {
        id: 'test-book-id',
        title: '测试书籍',
        author: '测试作者',
        description: '测试描述',
        wordCount: 1000,
        chapters: [],
        settings: {
          autoSave: true,
          autoSaveInterval: 30000,
          defaultFontSize: 14,
          theme: 'light',
          language: 'zh-CN',
          spellCheck: true,
          grammarCheck: false
        },
        metadata: {
          totalChapters: 5,
          totalWords: 10000,
          readingTime: 60,
          tags: ['小说', '测试'],
          coverImage: 'cover.jpg',
          isbn: '978-0-123456-78-9',
          publisher: '测试出版社',
          publishDate: new Date('2023-01-01')
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(book.id).toBe('test-book-id')
      expect(book.title).toBe('测试书籍')
      expect(book.wordCount).toBe(1000)
      expect(book.settings.theme).toBe('light')
      expect(book.metadata.totalChapters).toBe(5)
    })

    it('应该定义正确的章节类型', () => {
      const chapter: Chapter = {
        id: 'test-chapter-id',
        bookId: 'test-book-id',
        title: '测试章节',
        content: '章节内容',
        wordCount: 500,
        parentId: undefined,
        orderIndex: 1,
        isLocked: false,
        metadata: {
          readingTime: 30,
          tags: ['第一章'],
          isDraft: false,
          isCompleted: true,
          wordGoal: 1000,
          deadline: new Date('2023-12-31')
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(chapter.bookId).toBe('test-book-id')
      expect(chapter.title).toBe('测试章节')
      expect(chapter.wordCount).toBe(500)
      expect(chapter.orderIndex).toBe(1)
      expect(chapter.metadata.isCompleted).toBe(true)
    })
  })

  describe('AI服务相关类型', () => {
    it('应该定义正确的AI提供商类型', () => {
      const provider: AIProvider = {
        id: 'openai',
        name: 'OpenAI',
        models: [
          {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            maxTokens: 4096
          }
        ],
        defaultTemperature: 0.7,
        defaultTopP: 0.95,
        requiresApiKey: true,
        supportsStreaming: true
      }

      expect(provider.id).toBe('openai')
      expect(provider.models[0].id).toBe('gpt-3.5-turbo')
      expect(provider.defaultTemperature).toBe(0.7)
    })

    it('应该定义正确的AI配置类型', () => {
      const config: AIConfig = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: 'test-api-key',
        baseURL: 'https://api.openai.com',
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.95,
        systemPrompt: '你是一个有用的助手'
      }

      expect(config.provider).toBe('openai')
      expect(config.apiKey).toBe('test-api-key')
      expect(config.temperature).toBe(0.7)
    })
  })

  describe('数据库相关类型', () => {
    it('应该定义正确的数据库配置类型', () => {
      const dbConfig: DatabaseConfig = {
        type: 'mongodb',
        connection: {
          host: 'localhost',
          port: 27017,
          database: 'novelbox',
          username: 'user',
          password: 'password'
        },
        options: {
          ssl: true,
          poolSize: 10,
          timeout: 30000,
          retryAttempts: 3,
          charset: 'utf8mb4'
        }
      }

      expect(dbConfig.type).toBe('mongodb')
      expect(dbConfig.connection.host).toBe('localhost')
      expect(dbConfig.options?.ssl).toBe(true)
    })
  })

  describe('编辑器相关类型', () => {
    it('应该定义正确的编辑器配置类型', () => {
      const editorConfig: EditorConfig = {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.5,
        tabSize: 2,
        wordWrap: true,
        spellCheck: true,
        grammarCheck: false,
        autoSave: true,
        autoSaveInterval: 30000,
        theme: 'light'
      }

      expect(editorConfig.fontSize).toBe(16)
      expect(editorConfig.wordWrap).toBe(true)
      expect(editorConfig.autoSaveInterval).toBe(30000)
    })
  })

  describe('应用配置相关类型', () => {
    it('应该定义正确的应用配置类型', () => {
      const appConfig: AppConfig = {
        version: '1.1.0',
        environment: 'development',
        features: {
          aiAssist: true,
          autoSave: true,
          cloudSync: false
        },
        api: {
          baseURL: 'https://api.example.com',
          timeout: 30000,
          retries: 3,
          rateLimit: {
            requests: 100,
            window: 60
          }
        },
        logging: {
          level: 'info',
          enabled: true,
          output: 'console'
        },
        security: {
          encryption: {
            algorithm: 'AES-256-GCM',
            keySize: 256
          },
          authentication: {
            enabled: true,
            provider: 'jwt'
          },
          authorization: {
            enabled: true,
            provider: 'rbac'
          }
        }
      }

      expect(appConfig.version).toBe('1.1.0')
      expect(appConfig.environment).toBe('development')
      expect(appConfig.features.aiAssist).toBe(true)
      expect(appConfig.api.timeout).toBe(30000)
    })
  })

  describe('性能指标类型', () => {
    it('应该定义正确的性能指标类型', () => {
      const metrics: PerformanceMetrics = {
        pageLoadTime: 1500,
        renderTime: 200,
        apiResponseTime: 300,
        memoryUsage: 150 * 1024 * 1024, // 150MB
        cpuUsage: 25.5
      }

      expect(metrics.pageLoadTime).toBe(1500)
      expect(metrics.renderTime).toBe(200)
      expect(metrics.memoryUsage).toBe(157286400) // 150MB in bytes
    })
  })

  describe('用户指标类型', () => {
    it('应该定义正确的用户指标类型', () => {
      const metrics: UserMetrics = {
        sessionDuration: 1800, // 30分钟
        pageViews: 25,
        actions: [
          {
            type: 'create_chapter',
            timestamp: new Date(),
            duration: 5000
          },
          {
            type: 'ai_generate',
            timestamp: new Date(),
            duration: 2000,
            metadata: { provider: 'openai', model: 'gpt-3.5-turbo' }
          }
        ],
        errors: [
          {
            message: 'API调用失败',
            stack: 'Error: API调用失败\n    at AIService.generateText',
            timestamp: new Date(),
            context: { provider: 'openai', prompt: 'test prompt' }
          }
        ]
      }

      expect(metrics.sessionDuration).toBe(1800)
      expect(metrics.pageViews).toBe(25)
      expect(metrics.actions).toHaveLength(2)
      expect(metrics.errors).toHaveLength(1)
    })
  })

  describe('错误处理类型', () => {
    it('应该定义正确的错误类型', () => {
      const error: AppError = {
        code: 'API_ERROR',
        message: 'API调用失败',
        details: { status: 500, endpoint: '/api/generate' },
        userMessage: 'AI生成失败，请稍后重试',
        recoverable: true,
        timestamp: new Date()
      }

      expect(error.code).toBe('API_ERROR')
      expect(error.recoverable).toBe(true)
      expect(error.userMessage).toBe('AI生成失败，请稍后重试')
    })
  })

  describe('类型兼容性', () => {
    it('应该支持扩展类型', () => {
      interface CustomBook extends Book {
        customField: string
        customMetadata: Record<string, any>
      }

      const customBook: CustomBook = {
        id: 'custom-id',
        title: '自定义书籍',
        author: '作者',
        description: '描述',
        wordCount: 1000,
        chapters: [],
        settings: {} as any,
        metadata: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        customField: '自定义字段',
        customMetadata: { key: 'value' }
      }

      expect(customBook.customField).toBe('自定义字段')
      expect(customBook.title).toBe('自定义书籍')
    })

    it('应该支持联合类型', () => {
      type Theme = 'light' | 'dark' | 'auto'
      const theme: Theme = 'auto'
      
      expect(theme).toBe('auto')
      
      // 测试非法值会在编译时报错
      // const invalidTheme: Theme = 'invalid' // ❌ 编译错误
    })
  })
})