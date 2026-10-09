// Generates one 1200x630 PNG per page into public/og/ before `astro build`
// runs (HANDOFF.md problem #6: the live site has one portrait 850x1100
// og-default.png for every page). Hand-built SVG + @resvg/resvg-js rather
// than satori: the only fonts available locally are variable woff2 files,
// which the underlying fontdb crate resvg uses cannot load directly, so this
// renders with the OS's installed sans-serif (Segoe UI on Windows) instead.
// Close enough for a social preview card; the real page uses Instrument Sans.
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'og');

const COLORS = {
  cream: '#FAF6EE',
  ink: '#3F5750',
  inkSoft: '#5A6B65',
  sage: '#5C7A70',
  sageDeep: '#48615A',
  sand: '#EFE9DC',
};

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Greedy character-count wrap. Good enough for a title card; not a real
// text-measurement layout engine.
function wrap(text, maxCharsPerLine, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === maxLines - 1 && lines.length > 0) break;
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) lines.length = maxLines;
  return lines;
}

function card({ eyebrow, title, caption }) {
  const W = 1200;
  const H = 630;
  const lines = wrap(title, 22, 3);
  const titleFontSize = lines.length >= 3 ? 56 : 64;
  const lineHeight = titleFontSize * 1.12;
  const titleBlockHeight = lines.length * lineHeight;
  const titleStartY = 300 - titleBlockHeight / 2 + titleFontSize * 0.8;

  const titleTspans = lines
    .map((line, i) => `<tspan x="96" y="${titleStartY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${COLORS.cream}" />
  <rect x="0" y="0" width="${W}" height="${H}" fill="${COLORS.sand}" opacity="0.55" />
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="${COLORS.cream}" rx="18" />

  <circle cx="120" cy="120" r="28" fill="${COLORS.sage}" />
  <circle cx="120" cy="120" r="16" fill="${COLORS.cream}" />
  <circle cx="120" cy="120" r="7" fill="${COLORS.sage}" />
  <text x="164" y="130" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="${COLORS.ink}">Calm Brain Co</text>

  ${eyebrow ? `<text x="96" y="220" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="2" fill="${COLORS.inkSoft}">${escapeXml(eyebrow.toUpperCase())}</text>` : ''}

  <text font-family="Segoe UI, Arial, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.ink}">${titleTspans}</text>

  ${caption ? `<text x="96" y="${H - 72}" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="500" fill="${COLORS.sageDeep}">${escapeXml(caption)}</text>` : ''}
</svg>`;
}

async function renderCard(name, opts) {
  const svg = card(opts);
  const resvg = new Resvg(svg, {
    font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' },
    background: COLORS.cream,
  });
  const png = resvg.render().asPng();
  await writeFile(path.join(outDir, `${name}.png`), png);
  console.log(`og/${name}.png`);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await renderCard('default', { title: 'Printable planners for ADHD brains', caption: 'calmbrainco.shop' });
  await renderCard('home', { title: 'Plan the day you actually have.', caption: 'Printable planners for ADHD brains' });
  await renderCard('shop', { eyebrow: 'Shop', title: 'Printable ADHD planners, instant PDF', caption: '$17.99 each, undated, US Letter and A4' });
  await renderCard('adhd-planner-bundle', { eyebrow: 'Planner', title: 'ADHD Planner Bundle', caption: '13 pages, $17.99, undated PDF' });
  await renderCard('budget-planner', { eyebrow: 'Planner', title: 'ADHD-Friendly Budget Planner', caption: '9 pages, $17.99, undated PDF' });
  await renderCard('adhd-home-reset-planner', { eyebrow: 'Planner', title: 'ADHD Home Reset Planner', caption: '11 pages, $17.99, undated PDF' });
  await renderCard('adhd-student-planner', { eyebrow: 'Planner', title: 'ADHD Student Planner', caption: '10 pages, $17.99, undated PDF' });
  await renderCard('adhd-work-focus-planner', { eyebrow: 'Planner', title: 'ADHD Work and Focus Planner', caption: '10 pages, $17.99, undated PDF' });
  await renderCard('free-habit-tracker', { eyebrow: 'Free', title: 'A habit tracker with no streak to break', caption: 'Pay what you want, $0 is fine' });
  await renderCard('minimalist-printable-planner', { eyebrow: 'Shop', title: 'A minimalist printable planner', caption: '13 undated pages, $17.99' });
  await renderCard('productivity-aesthetic-daily-planning', { eyebrow: 'Shop', title: 'Calm, aesthetic daily planning', caption: '13 undated pages, $17.99' });
  await renderCard('blog', { eyebrow: 'Blog', title: 'Planning guides for ADHD brains' });

  const blogDir = path.join(root, 'src', 'content', 'blog');
  const files = (await readdir(blogDir)).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const raw = await (await import('node:fs/promises')).readFile(path.join(blogDir, file), 'utf-8');
    const titleMatch = raw.match(/title:\s*"(.*?)"/);
    const title = titleMatch ? titleMatch[1] : slug;
    await renderCard(`blog-${slug}`, { eyebrow: 'Blog', title });
  }
}

await main();
