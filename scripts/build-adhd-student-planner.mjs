// One-time asset builder for the ADHD Student Planner product.
// Hand-coded HTML/CSS rendered to PDF + PNG via headless Chrome (Playwright),
// same pipeline as the other Calm Brain Co products (see
// scripts/build-adhd-home-reset-planner.mjs, which this file is adapted
// from). Not part of `npm run build` — run manually once, like
// generate-icons.mjs.
//
// Outputs:
//   1. C:\Users\ccoop\Documents\Etsy Printables\ADHD Student Planner\
//        ADHD Student Planner - US Letter and A4.pdf   (combined, 20 pages)
//        source-html\*.html                             (the hand-coded source, kept for future edits)
//   2. C:\Users\ccoop\calmbrainco-site\src\assets\products\adhd-student-planner\*.png
//        (cover.png + one PNG per content page, 1632x2112, matching the other products)

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = 'C:\\Users\\ccoop\\Documents\\Etsy Printables\\ADHD Student Planner';
const HTML_OUT = path.join(DOCS_ROOT, 'source-html');
const PDF_OUT = path.join(DOCS_ROOT, 'ADHD Student Planner - US Letter and A4.pdf');
const PNG_OUT = path.join(SITE_ROOT, 'src', 'assets', 'products', 'adhd-student-planner');

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

function tableBlock({ headers, rows, colors = [C.mint, C.sand], endCircle = true }) {
  const n = headers.length;
  // When the last column is a done/status circle, give it less width than
  // the text columns. When it's just another text column (e.g. a one-line
  // takeaway), all columns share width equally.
  const template = endCircle
    ? `${Array.from({ length: n - 1 }, () => '1fr').join(' ')} 0.55fr`
    : `${Array.from({ length: n }, () => '1fr').join(' ')}`;
  const colStyle = `grid-template-columns:${template}`;
  const head = `<div class="trow trow--head" style="${colStyle}">${headers.map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
  const body = Array.from({ length: rows }, (_, i) => {
    const bg = colors[i % colors.length];
    const cells = headers
      .map((h, ci) =>
        endCircle && ci === n - 1
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

function weekRow({ label, hint, color }) {
  return `<section class="block" style="background:${color}">
    <h2 class="block__label">${esc(label)}</h2>
    ${hint ? `<p class="block__hint">${esc(hint)}</p>` : ''}
    <div class="daygrid">
      ${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => `
        <div class="daycell">
          <span class="daycell__d">${d}</span>
          <span class="daycell__line"></span>
        </div>`).join('')}
    </div>
  </section>`;
}

function timeBlock({ label, color }) {
  return `<section class="block" style="background:${color}">
    <h2 class="block__label">${esc(label)}</h2>
    <div class="timeblock__circle">${circleSvg(C.slate, 34)}</div>
    <div class="lrows" style="margin-top:12px"><div class="lrow"><span class="lrow__line"></span></div></div>
  </section>`;
}

// ---- Page content definitions, in print order ----
// Research spec: calmbrainco-redesign/_work/research/05-new-product-concepts.md, section 4.
// Undated, no streak mechanics, no invented stats, gender-neutral voice, no
// specific age group named.
const pages = [
  {
    id: 'cover',
    name: 'Cover',
    alt: 'Cover page of the ADHD Student Planner listing all ten pages',
    caption: 'The first sheet, if you keep the set in a folder.',
    title: null,
    body: () => `
      <div class="cover">
        <span class="pill">10 PRINTABLE PAGES</span>
        <h1 class="cover__title">The ADHD<br/>Student Planner</h1>
        <p class="cover__sub">A school planner for brains that do their best<br/>work the night before, on purpose.</p>
        <div class="cover__dots">
          <span class="dot" style="background:${C.sand}"></span>
          <span class="dot" style="background:${C.mint}"></span>
          <span class="dot" style="background:${C.peri}"></span>
          <span class="dot" style="background:${C.sage}"></span>
        </div>
        <p class="cover__list">Class Schedule &middot; Assignment Tracker &middot; Big Project Breakdown &middot; Study Session &middot; Exam Prep Countdown</p>
        <p class="cover__list">Weekly Study Planner &middot; Reading Tracker &middot; Focus-Time Check-In &middot; End-of-Week Reset</p>
      </div>`,
  },
  {
    id: 'class-schedule',
    name: 'Class Schedule & Contacts',
    alt: 'Class Schedule and Contacts page: a table with columns for class, instructor, contact and office hours, six rows',
    caption: 'Every class and how to reach whoever teaches it, in one place.',
    title: 'Class Schedule & Contacts',
    subtitle: 'Classes, instructors, and office hours, written once instead of searched for every time.',
    body: () => tableBlock({ headers: ['CLASS', 'INSTRUCTOR', 'CONTACT', 'OFFICE HOURS'], rows: 6, colors: [C.mint, C.sand], endCircle: false }),
  },
  {
    id: 'assignment-tracker',
    name: 'Assignment & Project Tracker',
    alt: 'Assignment and Project Tracker page: a table with columns for assignment, class, due in days and a done circle, eight rows',
    caption: "Due in blank days, not a calendar date. The page stays undated.",
    title: 'Assignment & Project Tracker',
    subtitle: "Written as \"due in ___ days,\" filled in by hand, instead of a printed date. Update the number as it gets closer.",
    body: () => tableBlock({ headers: ['ASSIGNMENT', 'CLASS', 'DUE IN (DAYS)', 'DONE'], rows: 8, colors: [C.peri, C.sand], endCircle: true }),
  },
  {
    id: 'project-breakdown',
    name: 'Big Project Breakdown',
    alt: 'Big Project Breakdown page: four stacked blocks, the project, this month, this week, and the next tiny step',
    caption: 'The project, this month, this week, then one next tiny step.',
    title: 'Big Project Breakdown',
    subtitle: "The same mountain-to-pebble mechanism as the ADHD Planner Bundle's Goal Breakdown page, applied to a paper or project instead of a life goal.",
    body: () => [
      linesBlock({ label: 'THE PROJECT', color: C.peri, count: 1 }),
      linesBlock({ label: 'THIS MONTH', color: C.slateTint, count: 1 }),
      linesBlock({ label: 'THIS WEEK', color: C.sand, count: 1 }),
      linesBlock({ label: 'NEXT TINY STEP', hint: 'Not the next big chunk. The next step small enough to actually start.', color: C.sageTint, count: 1 }),
    ].join(''),
  },
  {
    id: 'study-session',
    name: 'Study Session',
    alt: 'Study Session page: subject and task lines, a body-doubling slot line, and a distraction parking lot checklist',
    caption: 'Subject, who you studied with, and somewhere to park distractions.',
    title: 'Study Session',
    subtitle: 'No start time printed on the page. Subject, a body-doubling slot if one applies, and a place to park distractions instead of chasing them.',
    body: () => [
      linesBlock({ label: 'SUBJECT & TASK', color: C.mint, count: 1 }),
      linesBlock({ label: 'BODY-DOUBLING SLOT', hint: 'Who, if anyone, and where. Leave it blank if this session is solo.', color: C.clayTint, count: 1 }),
      checklistBlock({ label: 'DISTRACTION PARKING LOT', hint: 'Write it down, then come back to studying.', color: C.sand, count: 4 }),
    ].join(''),
  },
  {
    id: 'exam-countdown',
    name: 'Exam Prep Countdown',
    alt: 'Exam Prep Countdown page: ten blank countdown cards, each with a days-left line and a review task line, no semester dates printed',
    caption: 'Your own countdown, not a semester date baked into the page.',
    title: 'Exam Prep Countdown',
    subtitle: 'No exam date printed anywhere. Fill in your own days-left count per card and a review task to match.',
    body: () => `
      <section class="block" style="background:${C.plumTint}">
        <h2 class="block__label">REVIEW COUNTDOWN</h2>
        <p class="block__hint">Write the days-left count yourself, in any order, and one review task per card.</p>
        <div class="countdowngrid">
          ${Array.from({ length: 10 }, () => `
            <div class="zonecard" style="background:${C.cream}">
              <span class="zonecard__n">DAYS LEFT: ___</span>
              <span class="zonecard__line zonecard__line--sm"></span>
            </div>`).join('')}
        </div>
      </section>`,
  },
  {
    id: 'weekly-planner',
    name: 'Weekly Study & Class Planner',
    alt: 'Weekly Study and Class Planner page: three stacked rows for class, study and life, each with seven blank day columns, Monday to Sunday',
    caption: 'Class, study, life. Three blocks a day, not an hourly grid.',
    title: 'Weekly Study & Class Planner',
    subtitle: 'Three chunks a day, same as the rest of the Calm Brain Co system, applied to a school week: class, study, and everything else.',
    body: () => [
      weekRow({ label: 'CLASS', color: C.mint }),
      weekRow({ label: 'STUDY', color: C.sand }),
      weekRow({ label: 'LIFE', color: C.sageTint }),
    ].join(''),
  },
  {
    id: 'reading-tracker',
    name: 'Reading & Notes Tracker',
    alt: 'Reading and Notes Tracker page: a table with columns for reading, how far, and a one-line takeaway, seven rows',
    caption: 'What to read, how far you got, and one line to remember it by.',
    title: 'Reading & Notes Tracker',
    subtitle: 'What to read, how far you got, and a one-line takeaway so a chapter does not have to be re-read from scratch later.',
    body: () => tableBlock({ headers: ['READING', 'HOW FAR', 'TAKEAWAY'], rows: 7, colors: [C.slateTint, C.clayTint], endCircle: false }),
  },
  {
    id: 'focus-checkin',
    name: 'Focus-Time Check-In',
    alt: 'Focus-Time Check-In page: four time-of-day blocks, morning, afternoon, evening and night, each with a circle to mark and a notes line',
    caption: 'Noticing when focus tends to come easier. Self-observation, not a claim.',
    title: 'Focus-Time Check-In',
    subtitle: 'A self-observation page, not a medical claim. Mark the time of day focus tends to come easier, then schedule harder classes or study blocks around it.',
    body: () => columns([
      timeBlock({ label: 'MORNING', color: C.sand }),
      timeBlock({ label: 'AFTERNOON', color: C.mint }),
      timeBlock({ label: 'EVENING', color: C.peri }),
      timeBlock({ label: 'NIGHT', color: C.plumTint }),
    ]),
  },
  {
    id: 'week-reset',
    name: 'End-of-Week Reset',
    alt: "End-of-Week Reset page: a done-this-week checklist, a rolls-to-next-week lines block, and a weekend brain dump lines block",
    caption: "What's actually done, what rolls over, and a brain dump for the weekend.",
    title: 'End-of-Week Reset',
    subtitle: "What actually got done this week, what rolls to next week, and a brain dump before the weekend starts.",
    body: () => [
      checklistBlock({ label: 'DONE THIS WEEK', color: C.sageTint, count: 6 }),
      linesBlock({ label: 'ROLLS TO NEXT WEEK', color: C.sand, count: 3 }),
      linesBlock({ label: 'WEEKEND BRAIN DUMP', color: C.mint, count: 5 }),
    ].join(''),
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
.cols--4 { grid-template-columns: repeat(4, 1fr); }
.cols .block { margin-top: 0; }
.tableblock { margin-top: 18px; border-radius: 16px; overflow: hidden; }
.trow { display: grid; align-items: center; padding: 11px 16px; gap: 10px; }
.trow--head { background: transparent !important; padding-bottom: 6px; }
.trow--head span { font-size: 11.5px; font-weight: 700; letter-spacing: 0.07em; color: ${C.inkSoft}; text-transform: uppercase; }
.tcell { display: block; height: 1px; border-bottom: 1px solid ${C.rule}; }
.tcell--circle { border: none; display:flex; justify-content:flex-start; }
.zonegrid { margin-top: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.countdowngrid { margin-top: 14px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.zonecard { border-radius: 12px; padding: 14px 16px 16px; display: grid; gap: 10px; }
.zonecard__n { font-size: 12.5px; font-weight: 700; color: ${C.sageDeep}; letter-spacing: 0.01em; }
.zonecard__line { display:block; border-bottom: 1px solid ${C.rule}; height: 20px; }
.zonecard__line--sm { height: 16px; }
.daygrid { margin-top: 14px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
.daycell { display: grid; gap: 8px; }
.daycell__d { font-size: 12px; font-weight: 700; color: ${C.sageDeep}; letter-spacing: 0.05em; }
.daycell__line { display: block; border-bottom: 1px solid ${C.rule}; height: 34px; }
.timeblock__circle { margin-top: 14px; display: flex; justify-content: center; }
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
