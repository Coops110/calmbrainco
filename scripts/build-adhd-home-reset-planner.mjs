// One-time asset builder for the ADHD Home Reset Planner product.
// Hand-coded HTML/CSS rendered to PDF + PNG via headless Chrome (Playwright),
// same pipeline philosophy as the first two Calm Brain Co products (see
// Jarvis Vault > 12 - Calm Brain Co > Calm Brain Co Setup and Status.md,
// "Canva's AI design generator was tried first and abandoned"). Not part of
// `npm run build` — run manually once, like generate-icons.mjs.
//
// Outputs:
//   1. C:\Users\ccoop\Documents\Etsy Printables\ADHD Home Reset Planner\
//        ADHD Home Reset Planner - US Letter and A4.pdf   (combined, 22 pages)
//        source-html\*.html                               (the hand-coded source, kept for future edits)
//   2. C:\Users\ccoop\calmbrainco-site\src\assets\products\adhd-home-reset-planner\*.png
//        (cover.png + one PNG per content page, 1632x2112, matching the other two products)

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = 'C:\\Users\\ccoop\\Documents\\Etsy Printables\\ADHD Home Reset Planner';
const HTML_OUT = path.join(DOCS_ROOT, 'source-html');
const PDF_OUT = path.join(DOCS_ROOT, 'ADHD Home Reset Planner - US Letter and A4.pdf');
const PNG_OUT = path.join(SITE_ROOT, 'src', 'assets', 'products', 'adhd-home-reset-planner');

// ---- Brand tokens, copied from src/styles/global.css (locked palette, do not invent new colors) ----
const C = {
  cream: '#FAF6EE',
  ink: '#3F5750',
  inkSoft: '#5A6B65',
  sage: '#5C7A70',
  sageDeep: '#48615A',
  sageTint: '#E9EFE7',
  sand: '#EFE9DC',
  mint: '#E6EEEC',
  peri: '#E3E8EE',
  slate: '#5C7093',
  slateTint: '#E7EAF2',
  clayDeep: '#8F5A3A',
  clayTint: '#F3E7DA',
  plum: '#7A5C74',
  plumTint: '#EFE5EE',
  rule: 'rgba(63,87,80,0.22)',
};

// ---- Fonts, embedded as base64 data URIs so file:// HTML has zero path dependencies ----
async function loadFontDataUri(relPath, mime = 'font/woff2') {
  const buf = await readFile(path.join(SITE_ROOT, 'node_modules', relPath));
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Reusable SVG icons (match the checkbox/circle look in the existing product pages) ----
const checkboxSvg = (color = C.slate) =>
  `<svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true"><rect x="2" y="2" width="22" height="22" rx="6" fill="none" stroke="${color}" stroke-width="2.4"/></svg>`;
const circleSvg = (color = C.slate, size = 30) =>
  `<svg viewBox="0 0 30 30" width="${size}" height="${size}" aria-hidden="true"><circle cx="15" cy="15" r="12.5" fill="none" stroke="${color}" stroke-width="2.4"/></svg>`;
const numCircle = (n) =>
  `<span class="numcircle">${n}</span>`;

// ---- Layout components ----
function linesBlock({ label, hint, color, count = 3, lineLabelPrefix = null }) {
  const lines = Array.from({ length: count }, (_, i) =>
    `<div class="lrow">${lineLabelPrefix ? `<span class="lrow__n">${lineLabelPrefix}${i + 1}</span>` : ''}<span class="lrow__line"></span></div>`
  ).join('');
  return `<section class="block" style="background:${color}">
    <h2 class="block__label">${esc(label)}</h2>
    ${hint ? `<p class="block__hint">${esc(hint)}</p>` : ''}
    <div class="lrows">${lines}</div>
  </section>`;
}

function checklistBlock({ label, hint, color, count = 6 }) {
  const rows = Array.from({ length: count }, () =>
    `<div class="crow">${checkboxSvg(C.slate)}<span class="crow__line"></span></div>`
  ).join('');
  return `<section class="block" style="background:${color}">
    <h2 class="block__label">${esc(label)}</h2>
    ${hint ? `<p class="block__hint">${esc(hint)}</p>` : ''}
    <div class="crows">${rows}</div>
  </section>`;
}

function columns(blocks) {
  return `<div class="cols cols--${blocks.length}">${blocks.join('')}</div>`;
}

function tableBlock({ headers, rows, colors = [C.mint, C.sand] }) {
  const n = headers.length;
  // All data columns equal width, last column (status circle) narrower.
  const template = `${Array.from({ length: n - 1 }, () => '1fr').join(' ')} 0.55fr`;
  const colStyle = `grid-template-columns:${template}`;
  const head = `<div class="trow trow--head" style="${colStyle}">${headers.map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
  const body = Array.from({ length: rows }, (_, i) => {
    const bg = colors[i % colors.length];
    const cells = headers
      .map((h, ci) =>
        ci === n - 1
          ? `<span class="tcell tcell--circle">${circleSvg(C.slate, 26)}</span>`
          : `<span class="tcell"></span>`
      )
      .join('');
    return `<div class="trow" style="background:${bg};${colStyle}">${cells}</div>`;
  }).join('');
  return `<section class="tableblock">${head}${body}</section>`;
}

function note(text, cls = 'note') {
  return `<p class="${cls}">${esc(text)}</p>`;
}

// ---- Page content definitions, in print order ----
// Research spec: _work/research/05-new-product-concepts.md, section 2.
// Undated, no streak mechanics, no invented stats, gender-neutral voice.
const pages = [
  {
    id: 'cover',
    name: 'Cover',
    alt: 'Cover page of the ADHD Home Reset Planner listing all eleven pages',
    caption: 'The first sheet, if you keep the set in a folder.',
    title: null,
    body: () => `
      <div class="cover">
        <span class="pill">11 PRINTABLE PAGES</span>
        <h1 class="cover__title">The ADHD Home<br/>Reset Planner</h1>
        <p class="cover__sub">A cleaning system for brains that lose the thread<br/>halfway through a room.</p>
        <div class="cover__dots">
          <span class="dot" style="background:${C.sand}"></span>
          <span class="dot" style="background:${C.mint}"></span>
          <span class="dot" style="background:${C.peri}"></span>
          <span class="dot" style="background:${C.sage}"></span>
        </div>
        <p class="cover__list">Zone Map &middot; Weekly Reset &middot; 10-Minute Reset &middot; Deep Clean Rotation &middot; One Shelf at a Time</p>
        <p class="cover__list">Laundry Loop &middot; Kitchen Reset &middot; Body-Doubling Log &middot; Guest-Ready &middot; Letting Go</p>
      </div>`,
  },
  {
    id: 'zone-map',
    name: 'Zone Map',
    alt: 'Zone Map page: six blank zone cards to name a home zone and list what is in it, plus a seven-day row to assign a zone to each day of the week',
    caption: 'Name your own zones, then assign them to days as the week actually goes.',
    title: 'Zone Map',
    subtitle: 'Split the home into zones that make sense for your place. No fixed rotation: you assign a zone to a day as the week actually goes.',
    body: () => `
      <section class="block" style="background:${C.mint}">
        <h2 class="block__label">NAME YOUR ZONES</h2>
        <p class="block__hint">Six zones is a starting point. Use fewer, or rename them to match your home.</p>
        <div class="zonegrid">
          ${Array.from({ length: 6 }, (_, i) => `
            <div class="zonecard" style="background:${C.cream}">
              <span class="zonecard__n">Zone ${i + 1}</span>
              <span class="zonecard__line"></span>
              <span class="zonecard__line zonecard__line--sm"></span>
            </div>`).join('')}
        </div>
      </section>
      <section class="block" style="background:${C.sand}">
        <h2 class="block__label">ASSIGN ZONES TO DAYS</h2>
        <p class="block__hint">Write a zone in each box. Leave a day blank on purpose if that's what the week needs.</p>
        <div class="daygrid">
          ${['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d) => `
            <div class="daycell">
              <span class="daycell__d">${d}</span>
              <span class="daycell__line"></span>
            </div>`).join('')}
        </div>
      </section>`,
  },
  {
    id: 'weekly-reset',
    name: 'Weekly Reset Checklist',
    alt: 'Weekly Reset Checklist page: a single list of blank checkbox lines for the handful of things that keep a home functional, done in any order on any day',
    caption: 'The handful of things that keep a home functional. Any order, any day.',
    title: 'Weekly Reset Checklist',
    subtitle: 'The short list, not the whole house. Check items off in whatever order the week allows.',
    body: () => checklistBlock({ label: 'THIS WEEK', hint: 'Fill in your own. There is no required order.', color: C.sageTint, count: 9 }),
  },
  {
    id: 'ten-minute-reset',
    name: 'The 10-Minute Reset',
    alt: 'The 10-Minute Reset page: three numbered blank lines to pick three small tasks, with a printed reference list of ten-minute task ideas underneath',
    caption: 'No timer printed on the page. Pick three things, not ten.',
    title: 'The 10-Minute Reset',
    subtitle: 'For the days there are ten spare minutes and nothing more. Pick three, not ten.',
    body: () => `
      <section class="block" style="background:${C.clayTint}">
        <h2 class="block__label">PICK 3</h2>
        <div class="lrows">
          ${[1, 2, 3].map((n) => `<div class="lrow">${numCircle(n)}<span class="lrow__line"></span></div>`).join('')}
        </div>
      </section>
      <section class="block" style="background:${C.cream};border:1px solid ${C.rule}">
        <h2 class="block__label" style="color:${C.inkSoft}">IF YOU NEED IDEAS</h2>
        <p class="refnote">Clear one surface &middot; start one load of laundry &middot; corral stray items into a basket &middot; wipe down one thing &middot; take out one bag of trash &middot; put away what's by the door</p>
      </section>`,
  },
  {
    id: 'deep-clean-rotation',
    name: 'Deep Clean Rotation',
    alt: 'Deep Clean Rotation page: a table with columns for task, area, last done and a done circle, eight undated rows for monthly and seasonal tasks',
    caption: 'Monthly and seasonal tasks, spread out and undated. Checked off whenever they get done.',
    title: 'Deep Clean Rotation',
    subtitle: 'The tasks that are not weekly. No month printed anywhere: check "last done" by hand whenever one gets done.',
    body: () => tableBlock({ headers: ['TASK', 'AREA', 'LAST DONE', 'DONE'], rows: 8, colors: [C.peri, C.sand] }),
  },
  {
    id: 'one-shelf',
    name: 'One Shelf at a Time',
    alt: 'One Shelf at a Time page: a single declutter prompt with a blank line for the one spot being decluttered today, and keep, toss and unsure tally lines',
    caption: 'One small declutter prompt. Not a dated 30-day challenge.',
    title: 'One Shelf at a Time',
    subtitle: 'One shelf, one drawer, one corner. Not the whole room, and not a dated challenge with a day number attached.',
    body: () => `
      <section class="block" style="background:${C.plumTint}">
        <h2 class="block__label">TODAY'S ONE SPOT</h2>
        <div class="lrows"><div class="lrow"><span class="lrow__line"></span></div></div>
        <div class="tallyrow">
          <div class="tallycell"><span class="tallycell__label">KEEP</span><span class="tallycell__line"></span></div>
          <div class="tallycell"><span class="tallycell__label">TOSS</span><span class="tallycell__line"></span></div>
          <div class="tallycell"><span class="tallycell__label">UNSURE</span><span class="tallycell__line"></span></div>
        </div>
      </section>
      ${note('One spot is the whole assignment. Stopping after one is finishing the page, not quitting early.')}`,
  },
  {
    id: 'laundry-loop',
    name: 'Laundry Loop Tracker',
    alt: 'Laundry Loop Tracker page: a table with four stage columns, washed, dried, folded and put away, each with a circle to mark, across six load rows',
    caption: 'Wash, dry, fold, put away as four separate stages, so a load is never lost halfway.',
    title: 'Laundry Loop Tracker',
    subtitle: 'Four stages instead of one "do laundry" box, so a load that stalls after drying is still visible, not lost.',
    body: () => tableBlock({ headers: ['LOAD', 'WASHED', 'DRIED', 'FOLDED', 'PUT AWAY'], rows: 6, colors: [C.mint, C.slateTint] }),
  },
  {
    id: 'kitchen-reset',
    name: 'Kitchen Reset',
    alt: 'Kitchen Reset page: three columns of checkbox lines for dishes, counters and surfaces, and trash, recycling and fridge check',
    caption: 'Dishes, counters, trash and recycling, a fridge check. The three things that make a kitchen feel done.',
    title: 'Kitchen Reset',
    subtitle: 'The parts of a kitchen that actually make it feel reset, split into three short lists.',
    body: () => columns([
      checklistBlock({ label: 'DISHES', color: C.sand, count: 5 }),
      checklistBlock({ label: 'COUNTERS & SURFACES', color: C.mint, count: 5 }),
      checklistBlock({ label: 'TRASH, RECYCLING & FRIDGE', color: C.peri, count: 5 }),
    ]),
  },
  {
    id: 'body-doubling-log',
    name: 'Body-Doubling Chore Log',
    alt: 'Body-Doubling Chore Log page: a table with columns for who, room, how long and how it went, across six session rows',
    caption: 'Who you did it with, which room, how long, how it went.',
    title: 'Body-Doubling Chore Log',
    subtitle: 'For the chores that go easier with someone else in the room, in person or on a call. A log, not a schedule.',
    body: () => tableBlock({ headers: ['WHO', 'ROOM', 'HOW LONG', 'HOW IT WENT'], rows: 6, colors: [C.sageTint, C.clayTint] }),
  },
  {
    id: 'guest-ready',
    name: 'Guest-Ready Checklist',
    alt: 'Guest-Ready Checklist page: a single list of blank checkbox lines, the fast version of a reset for when someone is coming over in an hour',
    caption: 'The fast version. Someone is coming over in an hour.',
    title: 'Guest-Ready Checklist',
    subtitle: 'Not the deep clean. The fast, visible version for when someone is on their way over.',
    body: () => checklistBlock({ label: 'THE FAST VERSION', hint: 'The things a guest actually sees. Everything else can wait.', color: C.slateTint, count: 8 }),
  },
  {
    id: 'letting-go',
    name: "What I'm Letting Go This Week",
    alt: "What I'm Letting Go This Week page: a permission page with one blank line to name the thing not getting done this week on purpose, and a line for what happened instead",
    caption: 'A permission page. Naming the one thing not getting done, on purpose.',
    title: "What I'm Letting Go This Week",
    subtitle: 'One thing, named on purpose, is not the same as a task quietly failing.',
    body: () => `
      <section class="block" style="background:${C.sageTint}">
        <h2 class="block__label">THIS WEEK, I'M LETTING GO OF</h2>
        <div class="lrows"><div class="lrow"><span class="lrow__line"></span></div></div>
      </section>
      <section class="block" style="background:${C.sand}">
        <h2 class="block__label">WHAT I DID INSTEAD</h2>
        <div class="lrows"><div class="lrow"><span class="lrow__line"></span></div></div>
      </section>
      ${note("That's allowed. A planner that only tracks what got done misses the thing that got chosen instead.")}`,
  },
];

// ---- Document shell ----
async function buildShell(fontInstrument, fontCaveat) {
  return ({ sizeName, title, subtitle, bodyHtml }) => {
    const isLetter = sizeName === 'letter';
    const W = isLetter ? '816px' : '794px';
    const H = isLetter ? '1056px' : '1123px';
    const isCover = title === null;
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
@font-face { font-family: 'Instrument Sans'; src: url('${fontInstrument}') format('woff2'); font-weight: 100 900; font-style: normal; }
@font-face { font-family: 'Caveat'; src: url('${fontCaveat}') format('woff2'); font-weight: 600; font-style: normal; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: ${C.cream}; }
body {
  width: ${W}; height: ${H}; overflow: hidden;
  font-family: 'Instrument Sans', 'Segoe UI', sans-serif;
  color: ${C.ink};
}
.page { width: 100%; height: 100%; padding: 47px 48px 0; position: relative; }
.eyebrow { display:inline-flex; align-items:center; padding: 8px 18px; border-radius: 999px; background: ${C.sageTint}; color: ${C.sageDeep}; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; }
h1.pagetitle { margin: 0; font-size: 34px; font-weight: 700; letter-spacing: -0.01em; color: ${C.ink}; }
.pagetitle-row { display:flex; align-items:baseline; justify-content:space-between; gap: 20px; }
.subtitle { margin: 10px 0 0; font-size: 14.5px; line-height: 1.5; color: ${C.inkSoft}; max-width: 58ch; }
.block { border-radius: 16px; padding: 18px 22px 20px; margin-top: 18px; }
.block__label { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; color: ${C.sageDeep}; text-transform: uppercase; }
.block__hint { margin: 4px 0 0; font-size: 12.5px; color: ${C.inkSoft}; }
.lrows { margin-top: 14px; display: grid; gap: 14px; }
.lrow { display: flex; align-items: center; gap: 10px; }
.lrow__n { font-size: 13px; color: ${C.inkSoft}; font-weight: 600; min-width: 14px; }
.lrow__line { flex: 1; border-bottom: 1px solid ${C.rule}; height: 1px; }
.numcircle { width: 24px; height: 24px; border-radius: 50%; background: ${C.sage}; color: ${C.cream}; font-size: 12px; font-weight: 700; display:inline-flex; align-items:center; justify-content:center; flex: none; }
.crows { margin-top: 14px; display: grid; gap: 13px; }
.crow { display: flex; align-items: center; gap: 10px; }
.crow__line { flex: 1; border-bottom: 1px solid ${C.rule}; height: 1px; }
.cols { display: grid; gap: 16px; margin-top: 18px; }
.cols--3 { grid-template-columns: repeat(3, 1fr); }
.cols .block { margin-top: 0; }
.tableblock { margin-top: 18px; border-radius: 16px; overflow: hidden; }
.trow { display: grid; align-items: center; padding: 11px 16px; gap: 10px; }
.trow--head { background: transparent !important; padding-bottom: 6px; }
.trow--head span { font-size: 11.5px; font-weight: 700; letter-spacing: 0.07em; color: ${C.inkSoft}; text-transform: uppercase; }
.tcell { display: block; height: 1px; border-bottom: 1px solid ${C.rule}; }
.tcell--circle { border: none; display:flex; justify-content:flex-start; }
.zonegrid { margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.zonecard { border-radius: 12px; padding: 14px 16px 16px; display: grid; gap: 10px; }
.zonecard__n { font-size: 13px; font-weight: 700; color: ${C.sageDeep}; }
.zonecard__line { display:block; border-bottom: 1px solid ${C.rule}; height: 20px; }
.zonecard__line--sm { height: 16px; }
.daygrid { margin-top: 14px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
.daycell { display: grid; gap: 8px; }
.daycell__d { font-size: 12px; font-weight: 700; color: ${C.sageDeep}; letter-spacing: 0.05em; }
.daycell__line { display: block; border-bottom: 1px solid ${C.rule}; height: 34px; }
.tallyrow { margin-top: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.tallycell { display: grid; gap: 8px; }
.tallycell__label { font-size: 12px; font-weight: 700; color: ${C.sageDeep}; letter-spacing: 0.06em; }
.tallycell__line { display: block; border-bottom: 1px solid ${C.rule}; height: 24px; }
.refnote { margin: 8px 0 0; font-size: 13px; line-height: 1.6; color: ${C.inkSoft}; }
.note { margin-top: 16px; font-size: 13px; line-height: 1.5; color: ${C.inkSoft}; max-width: 56ch; }
/* Cover */
.cover { padding-top: 220px; text-align: center; display: grid; justify-items: center; gap: 22px; }
.pill { display: inline-flex; padding: 9px 20px; border-radius: 999px; background: ${C.sageTint}; color: ${C.sageDeep}; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; }
.cover__title { font-size: 48px; font-weight: 700; color: ${C.sageDeep}; line-height: 1.12; letter-spacing: -0.01em; margin: 6px 0 0; }
.cover__sub { font-size: 17px; color: ${C.inkSoft}; line-height: 1.5; max-width: 34em; margin: 0; }
.cover__dots { display: flex; gap: 10px; margin-top: 6px; }
.dot { width: 18px; height: 18px; border-radius: 50%; }
.cover__list { font-size: 14px; color: ${C.inkSoft}; margin: 2px 0 0; }
</style></head>
<body>
  <div class="page">
    ${isCover ? bodyHtml : `
      <div class="pagetitle-row"><h1 class="pagetitle">${esc(title)}</h1></div>
      ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}
      ${bodyHtml}
    `}
  </div>
</body></html>`;
  };
}

async function main() {
  await mkdir(HTML_OUT, { recursive: true });
  await mkdir(PNG_OUT, { recursive: true });

  const fontInstrument = await loadFontDataUri('@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2');
  const fontCaveat = await loadFontDataUri('@fontsource/caveat/files/caveat-latin-600-normal.woff2');
  const shell = await buildShell(fontInstrument, fontCaveat);

  const browser = await chromium.launch();
  const letterPdfs = [];
  const a4Pdfs = [];

  for (const p of pages) {
    const bodyHtml = p.body();
    const htmlLetter = shell({ sizeName: 'letter', title: p.title, subtitle: p.subtitle, bodyHtml });
    const htmlA4 = shell({ sizeName: 'a4', title: p.title, subtitle: p.subtitle, bodyHtml });

    await writeFile(path.join(HTML_OUT, `${p.id}-letter.html`), htmlLetter, 'utf-8');
    await writeFile(path.join(HTML_OUT, `${p.id}-a4.html`), htmlA4, 'utf-8');

    // --- Letter: PDF + PNG preview (1632x2112, matching the existing two products) ---
    const pageLetter = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
    await pageLetter.setContent(htmlLetter, { waitUntil: 'load' });
    await pageLetter.evaluate(() => document.fonts.ready);
    const pngName = p.id === 'cover' ? 'cover.png' : `${p.id}.png`;
    await pageLetter.screenshot({ path: path.join(PNG_OUT, pngName) });
    await pageLetter.close();

    const pdfPageLetter = await browser.newPage({ viewport: { width: 816, height: 1056 } });
    await pdfPageLetter.setContent(htmlLetter, { waitUntil: 'load' });
    await pdfPageLetter.evaluate(() => document.fonts.ready);
    const letterBuf = await pdfPageLetter.pdf({ width: '8.5in', height: '11in', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    letterPdfs.push(letterBuf);
    await pdfPageLetter.close();

    // --- A4: PDF only (site previews use the Letter render) ---
    const pdfPageA4 = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    await pdfPageA4.setContent(htmlA4, { waitUntil: 'load' });
    await pdfPageA4.evaluate(() => document.fonts.ready);
    const a4Buf = await pdfPageA4.pdf({ width: '8.27in', height: '11.69in', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    a4Pdfs.push(a4Buf);
    await pdfPageA4.close();

    console.log(`rendered: ${p.id} (letter + a4, pdf + png)`);
  }

  await browser.close();

  // ---- Merge: 11 US Letter pages, then 11 A4 pages, one combined PDF ----
  const merged = await PDFDocument.create();
  for (const buf of [...letterPdfs, ...a4Pdfs]) {
    const src = await PDFDocument.load(buf);
    const [copied] = await merged.copyPages(src, [0]);
    merged.addPage(copied);
  }
  const mergedBytes = await merged.save();
  await writeFile(PDF_OUT, mergedBytes);

  console.log(`\nCombined PDF: ${PDF_OUT} (${merged.getPageCount()} pages)`);
  console.log(`PNG previews: ${PNG_OUT}`);
}

await main();
