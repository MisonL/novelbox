/**
 * AI服务错误处理工具
 * 提供统一的错误处理、重试机制和超时管理
 */

export interface AIErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

export interface AIErrorResponse {
  error: string;
  code?: string;
  provider?: string;
  retryable: boolean;
  suggestedAction?: string;
}

export class AIErrorHandler {
  private config: Required<AIErrorHandlerConfig>;

  constructor(config: AIErrorHandlerConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      timeout: config.timeout ?? 60000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      maxDelay: config.maxDelay ?? 30000
    };
  }

  /**
   * 统一错误处理
   */
  handleError(error: any, provider: string): AIErrorResponse {
    const errorResponse: AIErrorResponse = {
      error: '未知错误',
      provider,
      retryable: false,
      suggestedAction: '请联系技术支持'
    };

    if (error.name === 'AbortError') {
      errorResponse.error = '请求已超时或被取消';
      errorResponse.code = 'ABORT_ERROR';
      errorResponse.retryable = false;
      errorResponse.suggestedAction = '请检查网络连接或稍后重试';
    } else if (error.code === 'ECONNREFUSED') {
      errorResponse.error = '无法连接到AI服务';
      errorResponse.code = 'CONNECTION_REFUSED';
      errorResponse.retryable = true;
      errorResponse.suggestedAction = '请检查网络连接或代理设置';
    } else if (error.code === 'ETIMEDOUT') {
      errorResponse.error = '连接超时';
      errorResponse.code = 'TIMEOUT';
      errorResponse.retryable = true;
      errorResponse.suggestedAction = '请检查网络连接或稍后重试';
    } else if (error.status === 401) {
      errorResponse.error = 'API密钥无效或已过期';
      errorResponse.code = 'UNAUTHORIZED';
      errorResponse.retryable = false;
      errorResponse.suggestedAction = '请检查AI配置中的API密钥';
    } else if (error.status === 403) {
      errorResponse.error = '访问被拒绝';
      errorResponse.code = 'FORBIDDEN';
      errorResponse.retryable = false;
      errorResponse.suggestedAction = '请检查API密钥权限或账户状态';
    } else if (error.status === 429) {
      errorResponse.error = '请求频率过高，请稍后再试';
      errorResponse.code = 'RATE_LIMIT';
      errorResponse.retryable = true;
      errorResponse.suggestedAction = '请降低请求频率或等待一段时间后重试';
    } else if (error.status === 500) {
      errorResponse.error = 'AI服务内部错误';
      errorResponse.code = 'INTERNAL_ERROR';
      errorResponse.retryable = true;
      errorResponse.suggestedAction = '请稍后重试';
    } else if (error.status === 503) {
      errorResponse.error = 'AI服务暂时不可用';
      errorResponse.code = 'SERVICE_UNAVAILABLE';
      errorResponse.retryable = true;
      errorResponse.suggestedAction = '请稍后重试';
    } else if (error.message?.includes('network')) {
      errorResponse.error = '网络错误';
      errorResponse.code = 'NETWORK_ERROR';
      errorResponse.retryable = true;
      errorResponse.suggestedAction = '请检查网络连接';
    } else if (error.message) {
      errorResponse.error = error.message;
      errorResponse.retryable = this.isRetryableError(error.message);
      errorResponse.suggestedAction = errorResponse.retryable ? '请稍后重试' : '请联系技术支持';
    }

    // 确保error字段总是有值
    if (!errorResponse.error) {
      errorResponse.error = '未知错误';
    }

    return errorResponse;
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(errorMessage: string): boolean {
    const retryablePatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /service unavailable/i,
      /internal error/i,
      /rate limit/i,
      /too many requests/i,
      /gateway/i,
      /proxy/i
    ];

    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * 指数退避延迟
   */
  private async backoffDelay(attempt: number): Promise<void> {
    const delay = Math.min(
      this.config.retryDelay * Math.pow(this.config.backoffMultiplier, attempt - 1),
      this.config.maxDelay
    );
    
    // 添加随机抖动以避免惊群效应
    const jitter = Math.random() * 0.1 * delay;
    await new Promise(resolve => setTimeout(resolve, delay + jitter));
  }

  /**
   * 执行带重试的异步操作
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    provider: string,
    signal?: AbortSignal
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      if (signal?.aborted) {
        throw new Error('操作已中止');
      }

      try {
        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), this.config.timeout);
        });

        // 执行操作并设置超时
        const result = await Promise.race([
          operation(),
          timeoutPromise
        ]);

        return result;
      } catch (error) {
        lastError = error;
        const errorResponse = this.handleError(error, provider);
        
        console.warn(`尝试 ${attempt}/${this.config.maxRetries} 失败:`, errorResponse.error);
        
        // 如果错误不可重试，立即抛出
        if (!errorResponse.retryable) {
          throw new Error(`${errorResponse.error} (${errorResponse.suggestedAction})`);
        }
        
        // 如果不是最后一次尝试，等待后退延迟
        if (attempt < this.config.maxRetries) {
          console.log(`等待 ${this.config.retryDelay * Math.pow(this.config.backoffMultiplier, attempt - 1)}ms 后重试...`);
          await this.backoffDelay(attempt);
        }
      }
    }

    // 所有重试都失败
    const finalError = this.handleError(lastError, provider);
    throw new Error(`${finalError.error} (${finalError.suggestedAction})`);
  }

  /**
   * 创建中止控制器
   */
  createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * 检查是否应该中止
   */
  shouldAbort(signal?: AbortSignal): boolean {
    return signal?.aborted ?? false;
  }
}

/**
 * 全局AI错误处理器实例
 */
export const aiErrorHandler = new AIErrorHandler({
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000,
  backoffMultiplier: 2,
  maxDelay: 30000
});