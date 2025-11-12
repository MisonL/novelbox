// 'child_process' module polyfill for Electron renderer process
// This stub provides minimal compatibility for packages that require 'child_process' module

export const exec = () => ({ pid: 0, kill: () => {} });
export const execSync = () => ({});
export const spawn = () => ({ pid: 0, kill: () => {} });
export const spawnSync = () => ({ status: 0 });
export const fork = () => ({ pid: 0, kill: () => {} });

const childProcessStub = {
  exec,
  execSync,
  spawn,
  spawnSync,
  fork
};

export default childProcessStub as any;