// One-time asset builder for the ADHD Work and Focus Planner product.
// Hand-coded HTML/CSS rendered to PDF + PNG via headless Chrome (Playwright),
// same pipeline as the other Calm Brain Co products (see
// scripts/build-adhd-home-reset-planner.mjs, which this is adapted from).
// Not part of `npm run build`; run manually once, like generate-icons.mjs.
//
// Outputs:
//   1. C:\Users\ccoop\Documents\Etsy Printables\ADHD Work and Focus Planner\
//        ADHD Work and Focus Planner - US Letter and A4.pdf   (combined, 20 pages)
//        source-html\*.html                                   (the hand-coded source, kept for future edits)
//   2. C:\Users\ccoop\calmbrainco-site\src\assets\products\adhd-work-focus-planner\*.png
//        (cover.png + one PNG per content page, 1632x2112, matching the other products)
//
// Spec: _work/research/05-new-product-concepts.md, section 5. Undated, no
// streak mechanics, no invented stats, gender-neutral voice, no hourly
// time-blocking grid (the brand's existing anti-hourly-time-blocking stance).

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = 'C:\\Users\\ccoop\\Documents\\Etsy Printables\\ADHD Work and Focus Planner';
const HTML_OUT = path.join(DOCS_ROOT, 'source-html');
const PDF_OUT = path.join(DOCS_ROOT, 'ADHD Work and Focus Planner - US Letter and A4.pdf');
const PNG_OUT = path.join(SITE_ROOT, 'src', 'assets', 'products', 'adhd-work-focus-planner');

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

// ---- Layout components (identical to the Home Reset Planner builder) ----
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
// Research spec: _work/research/05-new-product-concepts.md, section 5.
// Undated, no streak mechanics, no invented stats, gender-neutral voice,
// no hourly time-blocking grid.
const pages = [
  {
    id: 'cover',
    name: 'Cover',
    alt: 'Cover page of the ADHD Work and Focus Planner listing all ten pages',
    caption: 'The first sheet, if you keep the set in a folder.',
    title: null,
    body: () => `
      <div class="cover">
        <span class="pill">10 PRINTABLE PAGES</span>
        <h1 class="cover__title">The ADHD Work<br/>and Focus Planner</h1>
        <p class="cover__sub">A workday system for getting unstuck,<br/>one tiny step at a time.</p>
        <div class="cover__dots">
          <span class="dot" style="background:${C.sand}"></span>
          <span class="dot" style="background:${C.mint}"></span>
          <span class="dot" style="background:${C.peri}"></span>
          <span class="dot" style="background:${C.sage}"></span>
        </div>
        <p class="cover__list">Workday Top 3 &middot; Task Breakdown &middot; Focus Session Tracker &middot; Email &amp; Message Triage &middot; Meeting Notes</p>
        <p class="cover__list">Context-Switch Reset &middot; Waiting-On Tracker &middot; End-of-Day Shutdown &middot; Weekly Work Review</p>
      </div>`,
  },
  {
    id: 'workday-top-3',
    name: 'Workday Top 3',
    alt: 'Workday Top 3 page: three numbered blank lines for the real priorities of the day',
    caption: 'Three real priorities. Not a task list of twenty.',
    title: 'Workday Top 3',
    subtitle: 'Three things that matter today, chosen on purpose. Everything else is allowed to wait.',
    body: () => `
      <section class="block" style="background:${C.sageTint}">
        <h2 class="block__label">TODAY'S TOP 3</h2>
        <div class="lrows">
          ${[1, 2, 3].map((n) => `<div class="lrow">${numCircle(n)}<span class="lrow__line"></span></div>`).join('')}
        </div>
      </section>
      ${note('A list of twenty looks productive and reads as a failure by 5pm. Three can actually be finished.')}`,
  },
  {
    id: 'task-breakdown',
    name: 'Task Breakdown',
    alt: 'Task Breakdown page: a big task line, four blank steps to get there, and a highlighted next tiny step line',
    caption: 'The big task, broken into steps, then one next tiny step. Pebble, not mountain.',
    title: 'Task Breakdown',
    subtitle: 'One big task, broken down to its next tiny step. The same honest mechanism as the ADHD Planner Bundle\u2019s Goal Breakdown page, applied to work instead of life goals.',
    body: () => `
      ${linesBlock({ label: 'THE BIG TASK', color: C.sand, count: 1 })}
      ${linesBlock({ label: 'STEPS TO GET THERE', hint: 'In any order. Not all of them have to happen today.', color: C.mint, count: 4, lineLabelPrefix: '' })}
      ${linesBlock({ label: 'NEXT TINY STEP, RIGHT NOW', hint: 'Small enough to start in the next two minutes.', color: C.clayTint, count: 1 })}`,
  },
  {
    id: 'focus-session-tracker',
    name: 'Focus Session Tracker',
    alt: 'Focus Session Tracker page: a task line, a body-doubling partner line, and a distraction parking lot checklist',
    caption: 'Task, a body-doubling slot, a distraction parking lot. No clock time printed.',
    title: 'Focus Session Tracker',
    subtitle: 'What you\u2019re focusing on and who you\u2019re doing it with. No fixed start time printed on the page.',
    body: () => `
      ${linesBlock({ label: 'TASK', color: C.peri, count: 1 })}
      ${linesBlock({ label: 'BODY-DOUBLING PARTNER', hint: 'In person, on a call, or just present on video. Leave blank if solo.', color: C.sand, count: 1 })}
      ${checklistBlock({ label: 'DISTRACTION PARKING LOT', hint: 'Write it down, don\u2019t chase it yet.', color: C.slateTint, count: 5 })}`,
  },
  {
    id: 'email-triage',
    name: 'Email and Message Triage',
    alt: 'Email and Message Triage page: three columns of checkboxes labeled reply now, reply later and ignore',
    caption: 'Three buckets only. Reply now, reply later, ignore.',
    title: 'Email and Message Triage',
    subtitle: 'Every message goes in one of three buckets. No inbox-zero required, just a sort.',
    body: () => columns([
      checklistBlock({ label: 'REPLY NOW', color: C.sageTint, count: 6 }),
      checklistBlock({ label: 'REPLY LATER', color: C.sand, count: 6 }),
      checklistBlock({ label: 'IGNORE', color: C.mint, count: 6 }),
    ]),
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes Capture',
    alt: 'Meeting Notes Capture page: meeting name and attendee lines, a decisions made section, and a my action items checklist',
    caption: 'Decisions made, my action items. Nothing else.',
    title: 'Meeting Notes Capture',
    subtitle: 'One page per meeting. Only the two things worth remembering afterward.',
    body: () => `
      <div class="cols cols--2">
        ${linesBlock({ label: 'MEETING', color: C.peri, count: 1 })}
        ${linesBlock({ label: 'WITH', color: C.peri, count: 1 })}
      </div>
      ${linesBlock({ label: 'DECISIONS MADE', color: C.mint, count: 4 })}
      ${checklistBlock({ label: 'MY ACTION ITEMS', color: C.clayTint, count: 5 })}`,
  },
  {
    id: 'context-switch-reset',
    name: 'Context-Switch Reset',
    alt: 'Context-Switch Reset page: three short prompts for what you were doing, what pulled you away, and the next step back in',
    caption: 'Thirty seconds, used between tasks, so the thread isn\u2019t lost.',
    title: 'Context-Switch Reset',
    subtitle: 'Used the moment something interrupts a task, so the thread is findable again afterward.',
    body: () => `
      ${linesBlock({ label: 'WHAT I WAS DOING', color: C.plumTint, count: 1 })}
      ${linesBlock({ label: 'WHAT PULLED ME AWAY', color: C.sand, count: 1 })}
      ${linesBlock({ label: 'NEXT STEP BACK IN', color: C.sageTint, count: 1 })}`,
  },
  {
    id: 'waiting-on-tracker',
    name: 'Waiting-On Tracker',
    alt: 'Waiting-On Tracker page: a table with columns for who, what I need, asked on, and a done circle, across rows',
    caption: 'Blocked on someone else\u2019s reply or action, so it doesn\u2019t quietly vanish.',
    title: 'Waiting-On Tracker',
    subtitle: 'Things that can\u2019t move until someone else responds. A log, not a nag.',
    body: () => tableBlock({ headers: ['WHO', 'WHAT I NEED', 'ASKED ON', 'DONE'], rows: 8, colors: [C.peri, C.sand] }),
  },
  {
    id: 'end-of-day-shutdown',
    name: 'End-of-Day Shutdown Ritual',
    alt: 'End-of-Day Shutdown Ritual page: a what got done checklist, a what did not get done section, and a one line for tomorrow prompt',
    caption: 'What got done, what didn\u2019t, one line for tomorrow. Then the laptop closes.',
    title: 'End-of-Day Shutdown Ritual',
    subtitle: 'A real stopping point, not just stopping. Close the day on purpose.',
    body: () => `
      ${checklistBlock({ label: 'WHAT GOT DONE', color: C.sageTint, count: 5 })}
      ${linesBlock({ label: 'WHAT DIDN\u2019T', hint: 'Not a failure list. Just the truth.', color: C.sand, count: 3 })}
      ${linesBlock({ label: 'ONE LINE FOR TOMORROW', color: C.clayTint, count: 1 })}`,
  },
  {
    id: 'weekly-work-review',
    name: 'Weekly Work Review',
    alt: 'Weekly Work Review page: a what worked this week section and a what to drop next week section, with no score attached',
    caption: 'What worked, what to drop. No score attached.',
    title: 'Weekly Work Review',
    subtitle: 'A short look back, once a week. No grade, no streak, no score.',
    body: () => `
      ${linesBlock({ label: 'WHAT WORKED THIS WEEK', color: C.mint, count: 4 })}
      ${linesBlock({ label: 'WHAT TO DROP NEXT WEEK', color: C.plumTint, count: 4 })}
      ${note('No score attached. The point is what changes next week, not a grade on this one.')}`,
  },
];

// ---- Document shell (identical to the Home Reset Planner builder) ----
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
.cols--2 { grid-template-columns: repeat(2, 1fr); }
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
.cover { padding-top: 200px; text-align: center; display: grid; justify-items: center; gap: 22px; }
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

    // --- Letter: PDF + PNG preview (1632x2112, matching the existing products) ---
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

  // ---- Merge: 10 US Letter pages, then 10 A4 pages, one combined PDF ----
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
