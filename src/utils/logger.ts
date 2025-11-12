/**
 * 简单的日志系统
 * 替代直接使用 console 的方式
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production' || 
                       (typeof window !== 'undefined' && !window.electron);
    this.level = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level}:`;
    
    if (typeof message === 'string') {
      return `${prefix} ${message}`;
    }
    return `${prefix} ${JSON.stringify(message)}`;
  }

  error(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  warn(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  info(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  debug(message: any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage('DEBUG', message), ...args);
    }
  }

  // 设置日志级别
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  // 获取当前日志级别
  getLevel(): LogLevel {
    return this.level;
  }
}

// 创建全局日志实例
export const logger = new Logger();

// 在生产环境中禁用 console.log，但保留 error 和 warn
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.info = () => {};
  
  // 确保 error 和 warn 仍然可用
  console.warn = console.warn;
  console.error = console.error;
}