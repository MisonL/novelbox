// MySQL2 stub for build process
export default {};

export interface Pool {
  execute(sql: string, params?: any[]): Promise<[any[], any]>;
  query(sql: string, params?: any[]): Promise<[any[], any]>;
  ping(): Promise<void>;
  end(): Promise<void>;
}

export interface PoolOptions {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | object;
  connectionLimit?: number;
}

export const createPool = (_options: PoolOptions): Pool => {
  throw new Error('MySQL2 is only available in Electron environment');
};