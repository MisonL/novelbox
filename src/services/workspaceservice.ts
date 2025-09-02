import { WorkspaceError } from '../errors/workspaceError';

export class WorkspaceService {
  static getWorkspacePath(): string {
    const workspacePath = localStorage.getItem('workspacePath');
    if (!workspacePath) {
      // 在Web环境下，如果没有设置工作区路径，则设置一个默认路径
      const defaultPath = '/web-workspace';
      localStorage.setItem('workspacePath', defaultPath);
      return defaultPath;
    }
    return workspacePath;
  }
}
