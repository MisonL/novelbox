// 'os' module polyfill for Electron renderer process
// This stub provides minimal compatibility for packages that require 'os' module

export const arch = () => 'x64';
export const platform = () => 'darwin';
export const type = () => 'Darwin';
export const release = () => '20.6.0';
export const hostname = () => 'localhost';
export const tmpdir = () => '/tmp';
export const homedir = () => '/Users/mison';
export const EOL = '\n';
export const cpus = () => [];
export const totalmem = () => 0;
export const freemem = () => 0;
export const networkInterfaces = () => ({});
export const uptime = () => 0;
export const loadavg = () => [0, 0, 0];

const osStub = {
  arch,
  platform,
  type,
  release,
  hostname,
  tmpdir,
  homedir,
  EOL,
  cpus,
  totalmem,
  freemem,
  networkInterfaces,
  uptime,
  loadavg
};

export default osStub as any;