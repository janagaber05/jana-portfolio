import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  {
    example: path.join(root, 'backend', '.env.example'),
    env: path.join(root, 'backend', '.env'),
  },
  {
    example: path.join(root, 'backend', 'dashboard', '.env.example'),
    env: path.join(root, 'backend', 'dashboard', '.env'),
  },
  {
    example: path.join(root, 'my-app', '.env.example'),
    env: path.join(root, 'my-app', '.env'),
  },
];

let created = 0;

for (const { example, env } of targets) {
  if (fs.existsSync(env)) continue;
  if (!fs.existsSync(example)) continue;

  fs.copyFileSync(example, env);
  created += 1;
  console.log(`Created ${path.relative(root, env)} from example`);
}

if (created === 0) {
  console.log('Env files already exist (or no examples found).');
} else {
  console.log('\nAdd your Supabase URL and keys to the new .env files, then restart npm start.');
}
