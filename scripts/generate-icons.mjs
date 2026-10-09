// One-time icon generation from public/favicon.svg (concentric sage circles,
// the brand mark). Run manually with `node scripts/generate-icons.mjs` after
// changing the mark; the outputs are committed static files, not regenerated
// on every build. Fixes HANDOFF.md problem: SVG-only favicon is not in
// Google's supported favicon format list.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public');

const svg = await readFile(path.join(pub, 'favicon.svg'));

// Opaque cream background version for apple-touch-icon / maskable (Apple and
// Android both expect a filled square, not a transparent one).
async function opaquePng(size, pad = 0) {
  const inner = Math.round(size * (1 - pad * 2));
  const fg = await sharp(svg).resize(inner, inner).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#FAF6EE' } })
    .composite([{ input: fg, left: Math.round(size * pad), top: Math.round(size * pad) }])
    .png()
    .toBuffer();
}

async function transparentPng(size) {
  return sharp(svg).resize(size, size).png().toBuffer();
}

const png96 = await transparentPng(96);
await writeFile(path.join(pub, 'favicon-96x96.png'), png96);

const apple180 = await opaquePng(180);
await writeFile(path.join(pub, 'apple-touch-icon.png'), apple180);

const icon192 = await transparentPng(192);
await writeFile(path.join(pub, 'icon-192.png'), icon192);

const icon512 = await transparentPng(512);
await writeFile(path.join(pub, 'icon-512.png'), icon512);

const maskable512 = await opaquePng(512, 0.1);
await writeFile(path.join(pub, 'icon-512-maskable.png'), maskable512);

// favicon.ico: a 32x32 PNG renamed with an ICO wrapper isn't valid; build a
// real (single-frame, 32-bit) ICO container around a 32x32 PNG, which modern
// browsers and crawlers accept.
const png32 = await transparentPng(32);
const ICONDIR = Buffer.alloc(6);
ICONDIR.writeUInt16LE(0, 0); // reserved
ICONDIR.writeUInt16LE(1, 2); // type: icon
ICONDIR.writeUInt16LE(1, 4); // count
const ICONDIRENTRY = Buffer.alloc(16);
ICONDIRENTRY.writeUInt8(32, 0); // width
ICONDIRENTRY.writeUInt8(32, 1); // height
ICONDIRENTRY.writeUInt8(0, 2); // color palette
ICONDIRENTRY.writeUInt8(0, 3); // reserved
ICONDIRENTRY.writeUInt16LE(1, 4); // color planes
ICONDIRENTRY.writeUInt16LE(32, 6); // bits per pixel
ICONDIRENTRY.writeUInt32LE(png32.length, 8); // size of image data
ICONDIRENTRY.writeUInt32LE(6 + 16, 12); // offset
const ico = Buffer.concat([ICONDIR, ICONDIRENTRY, png32]);
await writeFile(path.join(pub, 'favicon.ico'), ico);

console.log('Generated favicon-96x96.png, apple-touch-icon.png, icon-192.png, icon-512.png, icon-512-maskable.png, favicon.ico');
