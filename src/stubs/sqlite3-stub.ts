// SQLite3 stub for build process
export default {};

export interface Database {
  run(sql: string, params?: any[], callback?: (err: Error | null) => void): void;
  get(sql: string, params?: any[], callback?: (err: Error | null, row: any) => void): void;
  all(sql: string, params?: any[], callback?: (err: Error | null, rows: any[]) => void): void;
  close(callback?: (err: Error | null) => void): void;
  exec(sql: string): void;
}

export const OPEN_READWRITE = 2;
export const OPEN_CREATE = 4;

export const Database = (_filename: string, _mode?: number, _callback?: (err: Error | null) => void): Database => {
  throw new Error('SQLite3 is only available in Electron environment');
};