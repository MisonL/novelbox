// Multi-module polyfill for Electron renderer process
// This stub provides minimal compatibility for packages that require 'net', 'fs', 'dgram', 'constants', 'timers' modules

// Timers module exports
export const setTimeout = globalThis.setTimeout || (() => ({} as any));
export const setInterval = globalThis.setInterval || (() => ({} as any));
export const setImmediate = () => ({} as any);
export const clearTimeout = globalThis.clearTimeout || (() => ({} as any));
export const clearInterval = globalThis.clearInterval || (() => ({} as any));
export const clearImmediate = () => ({} as any);
export const queueMicrotask = globalThis.queueMicrotask || (() => ({} as any));
export const unref = () => ({} as any);
export const ref = () => ({} as any);

// Timer promises will be merged with FS promises below


// Net module exports
export const createConnection = () => ({});
export const createServer = () => ({});
export const connect = () => ({});
export const Server = function() {};
export const Socket = function() {};
export const Stream = function() {};

// FS module exports
export const readFile = async () => ({});
export const writeFile = async () => ({});
export const mkdir = async () => ({});
export const rmdir = async () => ({});
export const unlink = async () => ({});
export const readdir = async () => [];
export const stat = async () => ({});
export const lstat = async () => ({});
export const access = async () => ({});
export const constants = {
  F_OK: 0,
  R_OK: 4,
  W_OK: 2,
  X_OK: 1
};

// FS Promises exports
export const promises = {
  readFile,
  writeFile,
  mkdir,
  rmdir,
  unlink,
  readdir,
  stat,
  lstat,
  access,
  // Timers Promises (merged with FS promises)
  setTimeout: async (fn: any, delay?: number, ...args: any[]) => { void delay; return fn(...args); },
  setInterval: async (fn: any, delay?: number, ...args: any[]) => { void delay; return fn(...args); },
  setImmediate: async (fn: any, ...args: any[]) => fn(...args)
};

// Dgram exports
export const createSocket = () => ({});
export const SocketType = function() {};

// Constants
export const E2BIG = 7;
export const EACCES = 13;
export const EADDRINUSE = 48;
export const EADDRNOTAVAIL = 49;
export const EAFNOSUPPORT = 47;
export const EAGAIN = 35;
export const EALREADY = 37;
export const EBADF = 9;
export const EBADMSG = 91;
export const EBUSY = 16;
export const ECANCELED = 89;
export const ECHILD = 10;
export const ECONNABORTED = 53;
export const ECONNREFUSED = 61;
export const ECONNRESET = 54;
export const EDEADLK = 11;
export const EDESTADDRREQ = 39;
export const EDOM = 33;
export const EEXIST = 17;
export const EFAULT = 14;
export const EFBIG = 27;
export const EILSEQ = 92;
export const EINPROGRESS = 36;
export const EINTR = 4;
export const EINVAL = 22;
export const EIO = 5;
export const EISCONN = 56;
export const EISDIR = 21;
export const ELOOP = 62;
export const EMFILE = 24;
export const EMLINK = 31;
export const EMSGSIZE = 40;
export const ENAMETOOLONG = 63;
export const ENETDOWN = 50;
export const ENETRESET = 52;
export const ENETUNREACH = 51;
export const ENFILE = 23;
export const ENOBUFS = 55;
export const ENODATA = 96;
export const ENODEV = 19;
export const ENOENT = 2;
export const ENOEXEC = 8;
export const ENOLCK = 77;
export const ENOLINK = 97;
export const ENOMEM = 12;
export const ENOMSG = 90;
export const ENOPROTOOPT = 42;
export const ENOSPC = 28;
export const ENOSR = 98;
export const ENOSTR = 95;
export const ENOSYS = 78;
export const ENOTCONN = 57;
export const ENOTDIR = 20;
export const ENOTEMPTY = 66;
export const ENOTSOCK = 44;
export const ENOTTY = 25;
export const ENXIO = 6;
export const EOVERFLOW = 84;
export const EPERM = 1;
export const EPIPE = 32;
export const EPROTO = 100;
export const EPROTONOSUPPORT = 43;
export const EPROTOTYPE = 41;
export const ERANGE = 34;
export const EROFS = 30;
export const ESPIPE = 29;
export const ESRCH = 3;
export const ETIME = 101;
export const ETIMEDOUT = 60;
export const ETXTBSY = 26;
export const EWOULDBLOCK = 35;
export const EXDEV = 18;

// Main stub object with dynamic subpath support

// Buffer polyfill
export const Buffer = globalThis.Buffer || class Buffer {
  constructor() {}
  static alloc() { return new Buffer(); }
  static from() { return new Buffer(); }
};

// globalThis.Buffer for browser compatibility
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}

// Process polyfill
export const process = {
  env: {},
  nextTick: (fn: any) => setTimeout(fn, 0),
  version: '',
  browser: true
};

const createStub = () => {
  const stub = {
    createConnection,
    createServer,
    connect,
    Server,
    Socket,
    Stream,
    readFile,
    writeFile,
    mkdir,
    rmdir,
    unlink,
    readdir,
    stat,
    lstat,
    access,
    constants,
    promises,
    createSocket,
    SocketType,
    Buffer,
    process,
    E2BIG,
    EACCES,
    EADDRINUSE,
    EADDRNOTAVAIL,
    EAFNOSUPPORT,
    EAGAIN,
    EALREADY,
    EBADF,
    EBADMSG,
    EBUSY,
    ECANCELED,
    ECHILD,
    ECONNABORTED,
    ECONNREFUSED,
    ECONNRESET,
    EDEADLK,
    EDESTADDRREQ,
    EDOM,
    EEXIST,
    EFAULT,
    EFBIG,
    EILSEQ,
    EINPROGRESS,
    EINTR,
    EINVAL,
    EIO,
    EISCONN,
    EISDIR,
    ELOOP,
    EMFILE,
    EMLINK,
    EMSGSIZE,
    ENAMETOOLONG,
    ENETDOWN,
    ENETRESET,
    ENETUNREACH,
    ENFILE,
    ENOBUFS,
    ENODATA,
    ENODEV,
    ENOENT,
    ENOEXEC,
    ENOLCK,
    ENOLINK,
    ENOMEM,
    ENOMSG,
    ENOPROTOOPT,
    ENOSPC,
    ENOSR,
    ENOSTR,
    ENOSYS,
    ENOTCONN,
    ENOTDIR,
    ENOTEMPTY,
    ENOTSOCK,
    ENOTTY,
    ENXIO,
    EOVERFLOW,
    EPERM,
    EPIPE,
    EPROTO,
    EPROTONOSUPPORT,
    EPROTOTYPE,
    ERANGE,
    EROFS,
    ESPIPE,
    ESRCH,
    ETIME,
    ETIMEDOUT,
    ETXTBSY,
    EWOULDBLOCK,
    EXDEV
  };

  // Create a Proxy to handle any subpath imports dynamically
  return new Proxy(stub, {
    get(target: Record<string, any>, prop: string | symbol) {
      // If property doesn't exist, return the stub itself or a stub object
      if (prop in target) {
        return (target as any)[prop as any];
      }
      // Return stub for unknown properties to prevent errors
      return target;
    }
  });
};

const stub = createStub();
export default stub as any;