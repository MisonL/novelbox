// 'tls' module polyfill for Electron renderer process
export const connect = () => ({});
export const createConnection = () => ({});
export const createServer = () => ({});
export const Server = function() {};
export const TLSSocket = function() {};

const tlsStub = {};
export default tlsStub as any;