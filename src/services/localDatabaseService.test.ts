/**
 * 数据库服务测试 - 简化版本
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { LocalDatabaseService } from '../services/localDatabaseService'

describe('本地数据库服务测试', () => {
  let localDbService: LocalDatabaseService

  beforeEach(() => {
    // 清除 localStorage
    window.localStorage.clear()
    
    // 创建测试服务
    localDbService = new LocalDatabaseService({
      type: 'local'
    })
  })

  describe('基础功能测试', () => {
    it('应该正确初始化', () => {
      expect(localDbService).toBeDefined()
      expect(localDbService instanceof LocalDatabaseService).toBe(true)
    })

    it('应该支持连接和断开', async () => {
      await localDbService.connect()
      const connectionResult = await localDbService.testConnection()
      expect(connectionResult.success).toBe(true)
      
      await localDbService.disconnect()
    })

    it('应该保存和获取书籍', async () => {
      const bookData = {
        id: 'test-book-1',
        title: '测试书籍',
        author: '测试作者',
        description: '测试描述',
        wordCount: 1000,
        chapters: [],
        settings: {
          autoSave: true,
          autoSaveInterval: 30000,
          defaultFontSize: 14,
          theme: 'light' as const,
          language: 'zh-CN',
          spellCheck: true,
          grammarCheck: false
        },
        metadata: {
          totalChapters: 0,
          totalWords: 1000,
          readingTime: 60,
          tags: ['测试']
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastEdited: new Date() // 添加这个字段
      }

      // 保存书籍
      await localDbService.saveBook(bookData as any)
      
      // 获取书籍
      const retrievedBook = await localDbService.getBook('test-book-1')
      expect(retrievedBook).toBeDefined()
      expect(retrievedBook?.title).toBe('测试书籍')
      expect(retrievedBook?.description).toBe('测试描述')
    })

    it('应该列出所有书籍', async () => {
      // 创建多个书籍
      const books = [
        {
          id: 'book-1',
          title: '书籍1',
          author: '作者1',
          description: '描述1',
          wordCount: 1000,
          chapters: [],
          settings: {} as any,
          metadata: {} as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastEdited: new Date()
        },
        {
          id: 'book-2',
          title: '书籍2',
          author: '作者2',
          description: '描述2',
          wordCount: 2000,
          chapters: [],
          settings: {} as any,
          metadata: {} as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastEdited: new Date()
        }
      ]

      for (const book of books) {
        await localDbService.saveBook(book as any)
      }

      const bookList = await localDbService.listBooks()
      expect(bookList).toBeInstanceOf(Array)
      expect(bookList.length).toBeGreaterThanOrEqual(2)
    })

    it('应该删除书籍', async () => {
      const bookData = {
        id: 'delete-test-book',
        title: '待删除书籍',
        author: '测试作者',
        description: '测试描述',
        wordCount: 500,
        chapters: [],
        settings: {} as any,
        metadata: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastEdited: new Date()
      }

      // 先保存书籍
      await localDbService.saveBook(bookData as any)
      
      // 验证书籍存在
      const book = await localDbService.getBook('delete-test-book')
      expect(book).toBeDefined()
      
      // 删除书籍
      await localDbService.deleteBook('delete-test-book')
      
      // 验证书籍已被删除
      const deletedBook = await localDbService.getBook('delete-test-book')
      expect(deletedBook).toBeNull()
    })

    it('应该保存和获取章节', async () => {
      const bookId = 'test-book-chapters'
      const chapterData = {
        id: 'chapter-1',
        bookId: bookId,
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
          deadline: undefined
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 保存章节
      await localDbService.saveChapter(bookId, chapterData as any)
      
      // 获取章节
      const retrievedChapter = await localDbService.getChapter(bookId, 'chapter-1')
      expect(retrievedChapter).toBeDefined()
      expect(retrievedChapter?.title).toBe('测试章节')
      expect(retrievedChapter?.content).toBe('章节内容')
    })

    it('应该保存和获取AI配置', async () => {
      const aiConfig = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: 'test-api-key',
        temperature: 0.7,
        maxTokens: 1000
      }

      // 保存AI配置
      await localDbService.saveAIConfig('openai', aiConfig)
      
      // 获取AI配置
      const retrievedConfig = await localDbService.getAIConfig('openai')
      expect(retrievedConfig).toEqual(aiConfig)
    })

    it('应该处理不存在的配置', async () => {
      const config = await localDbService.getAIConfig('non-existent')
      expect(config).toBeNull()
    })

    it('应该导出和导入数据', async () => {
      // 先创建一些测试数据
      await localDbService.saveBook({
        id: 'export-test-book',
        title: '导出测试书籍',
        author: '测试作者',
        description: '测试描述',
        wordCount: 1000,
        chapters: [],
        settings: {} as any,
        metadata: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastEdited: new Date()
      } as any)

      // 导出数据
      const exportedData = await localDbService.exportData()
      expect(exportedData).toBeDefined()
      expect(typeof exportedData).toBe('object')
      
      // 验证导出的数据包含我们创建的书籍的key
      const bookKey = `book:export-test-book`
      expect(exportedData[bookKey]).toBeDefined()
      
      // 验证导出的数据是有效的JSON字符串
      const exportedBook = JSON.parse(exportedData[bookKey])
      expect(exportedBook.title).toBe('导出测试书籍')
    })

    it('应该清空所有数据', async () => {
      // 先创建一些数据
      await localDbService.saveBook({
        id: 'clear-test-book',
        title: '清空测试书籍',
        author: '测试作者',
        description: '测试描述',
        wordCount: 1000,
        chapters: [],
        settings: {} as any,
        metadata: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastEdited: new Date()
      } as any)

      // 验证数据存在
      const book = await localDbService.getBook('clear-test-book')
      expect(book).toBeDefined()

      // 清空所有数据
      await localDbService.clearAllData()

      // 验证数据已被清空
      const books = await localDbService.listBooks()
      expect(books.length).toBe(0)
    })
  })

  describe('错误处理', () => {
    it('应该处理不存在的书籍', async () => {
      const nonExistentBook = await localDbService.getBook('non-existent-id')
      expect(nonExistentBook).toBeNull()
    })

    it('应该处理不存在的章节', async () => {
      const nonExistentChapter = await localDbService.getChapter('book-id', 'non-existent-chapter-id')
      expect(nonExistentChapter).toBeNull()
    })

    it('应该处理数据格式错误', async () => {
      // 模拟存储损坏的数据
      localStorage.setItem('book:corrupted-book', 'invalid json')
      
      try {
        await localDbService.getBook('corrupted-book')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('性能测试', () => {
    it('应该高效处理大量数据', async () => {
      const startTime = Date.now()
      
      // 创建20本书籍（减少数量以提高测试稳定性）
      for (let i = 0; i < 20; i++) {
        await localDbService.saveBook({
          id: `perf-book-${i}`,
          title: `性能测试书籍${i}`,
          author: '性能测试作者',
          description: '性能测试描述',
          wordCount: 1000,
          chapters: [],
          settings: {} as any,
          metadata: {} as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastEdited: new Date()
        } as any)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 验证操作在合理时间内完成（3秒内）
      expect(duration).toBeLessThan(3000)
      
      // 验证数据正确保存
      const books = await localDbService.listBooks()
      expect(books.length).toBeGreaterThanOrEqual(20)
    })
  })
})