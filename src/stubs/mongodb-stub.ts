// MongoDB stub for build process
export default {};

export class MongoClient {
  constructor(_connectionString: string, _options?: any) {}
  
  async connect(): Promise<void> {
    throw new Error('MongoDB is only available in Electron environment');
  }
  
  db(_name?: string): any {
    throw new Error('MongoDB is only available in Electron environment');
  }
  
  async close(): Promise<void> {
    throw new Error('MongoDB is only available in Electron environment');
  }
}