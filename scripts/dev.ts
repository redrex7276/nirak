import { spawn, ChildProcess } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Shramik Backend Server & Vite Frontend concurrently...\n');

// 1. Spawn Backend Server
const server: ChildProcess = spawn(npmCmd, ['run', 'dev:server'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' }
});

// 2. Spawn Frontend Vite Client
const client: ChildProcess = spawn(npmCmd, ['run', 'dev:client'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = (code?: number) => {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Shutting down dev services...');
  try {
    if (server && !server.killed) {
      if (isWindows && server.pid) {
        spawn('taskkill', ['/pid', String(server.pid), '/f', '/t']);
      } else {
        server.kill('SIGINT');
      }
    }
  } catch {}

  try {
    if (client && !client.killed) {
      if (isWindows && client.pid) {
        spawn('taskkill', ['/pid', String(client.pid), '/f', '/t']);
      } else {
        client.kill('SIGINT');
      }
    }
  } catch {}

  process.exit(code || 0);
};

server.on('error', (err) => {
  console.error('\x1b[31m%s\x1b[0m', 'Backend server process error:', err);
});

client.on('error', (err) => {
  console.error('\x1b[31m%s\x1b[0m', 'Vite client process error:', err);
});

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.warn('\x1b[33m%s\x1b[0m', `Backend server exited with code ${code}`);
  }
});

client.on('exit', (code) => {
  cleanup(code || 0);
});

process.on('SIGINT', () => cleanup(0));
process.on('SIGTERM', () => cleanup(0));
