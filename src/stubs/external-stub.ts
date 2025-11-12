// External database and proxy dependencies polyfill
// These modules are externalized in the build but need runtime polyfills

// AWS SSL Profiles
export const aws_ssl_profiles = {
  profiles: {}
};

export default aws_ssl_profiles;

// MongoDB dependencies
export const mongodb = {
  MongoClient: class MongoClient {
    constructor() {}
    connect() { return Promise.resolve({}); }
    close() { return Promise.resolve(); }
  },
  ObjectId: class ObjectId { constructor() {} },
  Db: class Db { constructor() {} },
  Collection: class Collection { constructor() {} }
};

export const mongodb_client_encryption = {
  ClientEncryption: class ClientEncryption {
    constructor() {}
  }
};

export const mongodb_connection_string_url = {
  MongoConnectionString: class MongoConnectionString {
    constructor() {}
  }
};

// SQL Server (tedious) dependencies
export const tedious = {
  Connection: class Connection { constructor() {} },
  Request: class Request { constructor() {} },
  config: {}
};

export const connection_string = {
  parse: () => ({})
};

// Other database drivers
export const mysql2 = {
  createConnection: () => ({}),
  createPool: () => ({})
};

export const pg = {
  Pool: class Pool { constructor() {} },
  Client: class Client { constructor() {} }
};

// Proxy agents
export const http_proxy_agent = class HTTPProxyAgent {
  constructor() {}
};

export const https_proxy_agent = class HTTPSProxyAgent {
  constructor() {}
};

export const socks_proxy_agent = class SOCKSProxyAgent {
  constructor() {}
};

export const proxy_from_env = {
  getProxyForUrl: () => null
};

export const global_agent = {
  GLOBAL_AGENT: {}
};

// Keytar
export const keytar = {
  getPassword: () => Promise.resolve(null),
  setPassword: () => Promise.resolve(true),
  deletePassword: () => Promise.resolve(true),
  findPassword: () => Promise.resolve(null),
  findCredentials: () => Promise.resolve([])
};
