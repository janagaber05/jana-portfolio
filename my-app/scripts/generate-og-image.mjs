/**
 * Generates public/og-image.png (1200×630).
 * Run: node scripts/generate-og-image.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../public/og-image.png');
const require = createRequire(import.meta.url);

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Install sharp as a devDependency first: npm i -D sharp');
    process.exit(1);
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#141214"/>
  <circle cx="980" cy="80" r="220" fill="#6D0101" fill-opacity="0.28"/>
  <circle cx="160" cy="560" r="180" fill="#FFD5FB" fill-opacity="0.08"/>
  <text x="80" y="320" fill="#FFD5FB" font-family="Bebas Neue, Impact, Arial Black, sans-serif" font-size="188" letter-spacing="8">JANA</text>
  <text x="86" y="390" fill="#FCF4F0" font-family="Inter, Helvetica, Arial, sans-serif" font-size="36" font-weight="500" letter-spacing="4">UX/UI Designer · Cairo</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(outPath, png);
  console.log('Wrote', outPath, `(${png.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
