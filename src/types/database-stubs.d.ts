declare module 'mongodb' {
  export interface MongoClientOptions {
    ssl?: boolean;
    sslValidate?: boolean;
    sslCA?: string;
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
  }
  
  export class MongoClient {
    constructor(connectionString: string, options?: MongoClientOptions);
    db(name?: string): any;
    close(): Promise<void>;
    connect(): Promise<void>;
  }
}

declare module 'mysql2/promise' {
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
  
  export function createPool(options: PoolOptions): Pool;
}

declare module 'sqlite3' {
  export interface Database {
    run(sql: string, params?: any[], callback?: (err: Error | null) => void): void;
    get(sql: string, params?: any[], callback?: (err: Error | null, row: any) => void): void;
    all(sql: string, params?: any[], callback?: (err: Error | null, rows: any[]) => void): void;
    close(callback?: (err: Error | null) => void): void;
  }
  
  export function Database(filename: string, callback?: (err: Error | null) => void): Database;
}

declare module 'mssql' {
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
  
  export function connect(config: config): Promise<ConnectionPool>;
}