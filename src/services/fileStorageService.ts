import { DirectoryNotFoundError } from '../errors/fileStorageError';
import { readFile as webReadFile, writeFile as webWriteFile, listFiles as webListFiles, deleteFile as webDeleteFile } from './webFileService';

type FileItem = {
  name: string;
  type: 'file' | 'directory';
};

declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
      };
    };
  }
}

// 检测是否为 Web 环境
const isWeb = typeof window !== 'undefined' && !window.electron;

export class FileStorageService {
  static async readFile(filePath: string): Promise<string> {
    if (isWeb) {
      const result = await webReadFile(filePath);
      if (!result.success) {
        throw new Error(`Failed to read file: ${result.message}`);
      }
      return result.content || '';
    }

    const result = await window.electron!.ipcRenderer.invoke('read-file', filePath);
    if (!result.success) {
      throw new Error(`Failed to read file: ${result.error}`);
    }
    return result.content;
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    if (isWeb) {
      const result = await webWriteFile(filePath, content);
      if (!result.success) {
        throw new Error(`Failed to write file: ${result.message}`);
      }
      return;
    }

    const result = await window.electron!.ipcRenderer.invoke('write-file', { filePath, content });
    if (!result.success) {
      if (result.error?.code === 'ENOENT') {
        throw new DirectoryNotFoundError();
      }
      throw new Error(`Failed to write file: ${result.error}`);
    }
  }

  static async listFiles(dirPath: string = '.'): Promise<FileItem[]> {
    if (isWeb) {
      const result = await webListFiles(dirPath);
      if (!result.success) {
        throw new Error(`Failed to list files: ${result.message}`);
      }
      return result.items || [];
    }

    const result = await window.electron!.ipcRenderer.invoke('list-files', dirPath);
    if (!result.success) {
      throw new Error(`Failed to list files: ${result.error}`);
    }
    return result.items;
  }

  static async deleteFile(filePath: string): Promise<void> {
    if (isWeb) {
      const result = await webDeleteFile(filePath);
      if (!result.success) {
        throw new Error(`Failed to delete file: ${result.message}`);
      }
      return;
    }

    const result = await window.electron!.ipcRenderer.invoke('delete-file', filePath);
    if (!result.success) {
      if (result.error?.code === 'ENOENT') {
        throw new DirectoryNotFoundError();
      }
      throw new Error(`Failed to delete file: ${result.error}`);
    }
  }

  static async writeBlobFile(filePath: string, blob: Blob): Promise<void> {
    if (isWeb) {
      // Web 环境使用 writeFile 方法
      const content = await blob.text();
      return this.writeFile(filePath, content);
    }

    const buffer = await blob.arrayBuffer();
    const result = await window.electron!.ipcRenderer.invoke('write-blob-file', {
      filePath,
      buffer: Buffer.from(buffer)
    });
    if (!result.success) {
      if (result.error?.code === 'ENOENT') {
        throw new DirectoryNotFoundError();
      }
      throw new Error(`Failed to write blob file: ${result.error}`);
    }
  }
}