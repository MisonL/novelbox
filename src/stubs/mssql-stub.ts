// MSSQL stub for build process
export default {};

export interface ConnectionPool {
  connect(): Promise<void>;
  close(): Promise<void>;
  request(): Request;
}

export interface Request {
  input(name: string, type: any, value: any): Request;
  query(sql: string): Promise<{ recordset: any[] }>;
}

export interface config {
  server: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
  connectionTimeout?: number;
  requestTimeout?: number;
  pool?: {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
  };
}

export const connect = (_config: config): Promise<ConnectionPool> => {
  throw new Error('MSSQL is only available in Electron environment');
};