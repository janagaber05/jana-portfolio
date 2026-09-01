import { execSync } from 'node:child_process';

const PORTS = [3000, 5001, 5173];

for (const port of PORTS) {
  try {
    const output = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim();
    if (!output) continue;

    output
      .split('\n')
      .map((pid) => pid.trim())
      .filter(Boolean)
      .forEach((pid) => {
        try {
          process.kill(Number(pid), 'SIGTERM');
        } catch {
          // process may already be gone
        }
      });
  } catch {
    // nothing listening on this port
  }
}
