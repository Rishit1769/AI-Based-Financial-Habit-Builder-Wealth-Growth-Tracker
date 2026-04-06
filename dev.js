// dev.js — starts backend (nodemon) + frontend (vite) concurrently.
//
// WHY: This project folder contains '&' in its name.
// cmd.exe treats '&' as a command separator, so ANY approach that routes
// through cmd.exe (.cmd shims, shell:true, concurrently, etc.) breaks.
// Fix: call the JS entry points of nodemon and vite directly via node.exe
// (a real .exe, not a cmd shim), passing the CWD via Win32 CreateProcess —
// which never interprets '&' as anything special.

const { spawn } = require('child_process');
const path = require('path');
const fs   = require('fs');

const RESET   = '\x1b[0m';
const CYAN    = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RED     = '\x1b[31m';

const ROOT     = __dirname;
const NODE_EXE = process.execPath; // absolute path to current node.exe

const processes = [];

function start(label, color, cwd, args) {
  // Verify the entry point exists before spawning
  if (!fs.existsSync(args[0])) {
    console.error(`${RED}[${label}] Entry not found: ${args[0]}${RESET}`);
    console.error(`${RED}[${label}] Run: npm install inside ${cwd}${RESET}`);
    return;
  }

  const proc = spawn(NODE_EXE, args, {
    cwd,
    shell: false,  // bypass cmd.exe entirely
    stdio: 'pipe',
    env: { ...process.env },
  });

  const prefix = `${color}[${label}]${RESET} `;

  proc.stdout.on('data', (d) =>
    d.toString().split('\n').forEach((line) => {
      if (line.trim()) console.log(prefix + line);
    })
  );

  proc.stderr.on('data', (d) =>
    d.toString().split('\n').forEach((line) => {
      if (line.trim()) console.error(prefix + line);
    })
  );

  proc.on('close', (code) => {
    console.log(`${color}[${label}]${RESET} exited (${code ?? 0})`);
    processes.forEach((p) => { try { p.kill(); } catch (_) {} });
    process.exit(code ?? 0);
  });

  processes.push(proc);
}

// Graceful Ctrl+C
process.on('SIGINT', () => {
  console.log('\nStopping all processes...');
  processes.forEach((p) => { try { p.kill('SIGINT'); } catch (_) {} });
  process.exit(0);
});

// ── Backend: node <nodemon entry> server.js ──────────────────────────────────
start(
  'BACKEND', CYAN,
  path.join(ROOT, 'backend'),
  [
    path.join(ROOT, 'backend', 'node_modules', 'nodemon', 'bin', 'nodemon.js'),
    'server.js',
  ]
);

// ── Frontend: node <vite entry> ──────────────────────────────────────────────
start(
  'FRONTEND', MAGENTA,
  path.join(ROOT, 'frontend'),
  [
    path.join(ROOT, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js'),
  ]
);