// One-time asset builder for the ADHD Family and Household Planner product.
// Hand-coded HTML/CSS rendered to PDF + PNG via headless Chrome (Playwright),
// adapted directly from scripts/build-adhd-home-reset-planner.mjs (same
// pipeline philosophy, same brand tokens, same component helpers). Not part
// of `npm run build` — run manually once, like the other product builders.
//
// Outputs:
//   1. C:\Users\ccoop\Documents\Etsy Printables\ADHD Family and Household Planner\
//        ADHD Family and Household Planner - US Letter and A4.pdf   (combined, 20 pages)
//        source-html\*.html                                          (the hand-coded source, kept for future edits)
//   2. C:\Users\ccoop\calmbrainco-site\src\assets\products\adhd-family-household-planner\*.png
//        (cover.png + one PNG per content page, 1632x2112, matching the other products)

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = 'C:\\Users\\ccoop\\Documents\\Etsy Printables\\ADHD Family and Household Planner';
const HTML_OUT = path.join(DOCS_ROOT, 'source-html');
const PDF_OUT = path.join(DOCS_ROOT, 'ADHD Family and Household Planner - US Letter and A4.pdf');
const PNG_OUT = path.join(SITE_ROOT, 'src', 'assets', 'products', 'adhd-family-household-planner');

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

// ---- Layout components (same set as the Home Reset Planner script) ----
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

// New helper for this product: a line with a printed text label on the left
// instead of a number (e.g. "School", "Pediatrician") and a blank line to fill in.
function labeledLines({ label, hint, color, items }) {
  const lines = items.map((item) =>
    `<div class="lrow"><span class="lrow__n lrow__n--wide">${esc(item)}</span><span class="lrow__line"></span></div>`
  ).join('');
  return `<section class="block" style="background:${color}">
    <h2 class="block__label">${esc(label)}</h2>
    ${hint ? `<p class="block__hint">${esc(hint)}</p>` : ''}
    <div class="lrows">${lines}</div>
  </section>`;
}

// New helper for this product: numbered steps (morning/bedtime routine cards),
// same visual language as the numCircle used on the Home Reset Planner's
// "10-Minute Reset" page, generalized to any count.
function numberedBlock({ label, hint, color, count = 6 }) {
  const lines = Array.from({ length: count }, (_, i) =>
    `<div class="lrow">${numCircle(i + 1)}<span class="lrow__line"></span></div>`
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
// Research spec: _work/research/05-new-product-concepts.md, section 3.
// Undated, no streak mechanics, no invented stats, gender-neutral voice
// throughout: "ADHD parent" / "household", never "mom".
const pages = [
  {
    id: 'cover',
    name: 'Cover',
    alt: 'Cover page of the ADHD Family and Household Planner listing all ten pages',
    caption: 'The first sheet, if you keep the set in a folder.',
    title: null,
    body: () => `
      <div class="cover">
        <span class="pill">10 PRINTABLE PAGES</span>
        <h1 class="cover__title">The ADHD Family<br/>and Household Planner</h1>
        <p class="cover__sub">A household system for the ADHD parent who is done<br/>being the only one who remembers everything.</p>
        <div class="cover__dots">
          <span class="dot" style="background:${C.sand}"></span>
          <span class="dot" style="background:${C.mint}"></span>
          <span class="dot" style="background:${C.peri}"></span>
          <span class="dot" style="background:${C.plum}"></span>
        </div>
        <p class="cover__list">Family Week at a Glance &middot; Mental Load Dump &middot; Kid Routine Cards &middot; Household Chore Rotation &middot; School Paperwork Tracker</p>
        <p class="cover__list">Contact &amp; Info Sheet &middot; Caregiver Handoff Notes &middot; Family Meal Rotation &middot; One Thing for Me</p>
      </div>`,
  },
  {
    id: 'week-at-a-glance',
    name: 'Family Week at a Glance',
    alt: 'Family Week at a Glance page: a seven-day grid, Monday to Sunday, with each day split into morning, afternoon and evening lines to write who needs to be where',
    caption: 'Where everyone needs to be, visible to the whole household, not just the planner-keeper.',
    title: 'Family Week at a Glance',
    subtitle: 'Morning, afternoon, evening, same three chunks as the rest of the brand. Posted somewhere the whole household can see it, not kept in one head.',
    body: () => `
      <section class="block" style="background:${C.mint}">
        <h2 class="block__label">WHO NEEDS TO BE WHERE</h2>
        <p class="block__hint">One line per block, per day. Short enough to read at a glance.</p>
        <div class="weekgrid">
          ${['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d) => `
            <div class="weekcell">
              <span class="weekcell__d">${d}</span>
              <span class="weekcell__slot"><span class="weekcell__tag">AM</span><span class="weekcell__line"></span></span>
              <span class="weekcell__slot"><span class="weekcell__tag">PM</span><span class="weekcell__line"></span></span>
              <span class="weekcell__slot"><span class="weekcell__tag">EVE</span><span class="weekcell__line"></span></span>
            </div>`).join('')}
        </div>
      </section>`,
  },
  {
    id: 'mental-load-dump',
    name: 'Mental Load Dump',
    alt: 'Mental Load Dump page: two columns of blank lines, one for everything being carried and one for what needs to go on someone else\u2019s radar too',
    caption: 'The invisible-labor page. Everything being carried that nobody else can see.',
    title: 'Mental Load Dump',
    subtitle: 'A brain dump, but for the household. The second column is for the parts worth making visible to someone else, not just to this page.',
    body: () => columns([
      linesBlock({ label: "WHAT I'M CARRYING", hint: 'Appointments, numbers, deadlines, anything living only in your head.', color: C.clayTint, count: 7 }),
      linesBlock({ label: 'WHAT SOMEONE ELSE SHOULD KNOW TOO', hint: "The items worth saying out loud, not just writing down.", color: C.peri, count: 7 }),
    ]),
  },
  {
    id: 'kid-routine-cards',
    name: 'Kid Routine Cards',
    alt: 'Kid Routine Cards page: two numbered sequences, morning and bedtime, each with six blank numbered steps written once and reused every day',
    caption: 'Morning and bedtime sequences, written plainly, reusable every day without rewriting.',
    title: 'Kid Routine Cards',
    subtitle: 'Write the sequence once. Point to the card instead of repeating the steps out loud every single day.',
    body: () => columns([
      numberedBlock({ label: 'MORNING', hint: 'In order, start to out the door.', color: C.sand, count: 6 }),
      numberedBlock({ label: 'BEDTIME', hint: 'In order, start to lights out.', color: C.slateTint, count: 6 }),
    ]),
  },
  {
    id: 'chore-rotation',
    name: 'Household Chore Rotation',
    alt: 'Household Chore Rotation page: a table with columns for chore, who has it this week, and a done circle, across eight rows',
    caption: 'Who does what this week, for the whole family, re-assigned weekly rather than fixed forever.',
    title: 'Household Chore Rotation',
    subtitle: 'Re-assigned every week on purpose. A fixed chart assumes the same person can always take the same job; this one does not.',
    body: () => tableBlock({ headers: ['CHORE', 'WHO THIS WEEK', 'DONE'], rows: 8, colors: [C.mint, C.sageTint] }),
  },
  {
    id: 'school-paperwork',
    name: 'School Paperwork Tracker',
    alt: 'School Paperwork Tracker page: a table with columns for item, due in how many days, and a done circle, across eight rows',
    caption: 'Permission slips, forms, things due back. Written as "due in," not a calendar date.',
    title: 'School Paperwork Tracker',
    subtitle: '"Due in" instead of a date, so the page never goes stale and nothing has to be copied over to a new sheet.',
    body: () => tableBlock({ headers: ['ITEM', 'DUE IN', 'DONE'], rows: 8, colors: [C.peri, C.sand] }),
  },
  {
    id: 'contact-info-sheet',
    name: 'Contact and Info Sheet',
    alt: 'Contact and Info Sheet page: a single list of labeled blank lines for school, pediatrician, dentist, emergency contact, neighbor, sitter and allergy or medical notes',
    caption: 'School, doctor, emergency numbers, sitter. One page instead of five apps.',
    title: 'Contact and Info Sheet',
    subtitle: 'The numbers everyone in the household might need, in one place a sitter or co-parent can actually find.',
    body: () => labeledLines({
      label: 'KEEP THIS WHERE ANYONE CAN FIND IT',
      hint: null,
      color: C.plumTint,
      items: ['School', 'Teacher / homeroom', 'Pediatrician', 'Dentist', 'Emergency contact', 'Neighbor / backup', 'Sitter / babysitter', 'Allergies or medical notes'],
    }),
  },
  {
    id: 'caregiver-handoff',
    name: 'Caregiver Handoff Notes',
    alt: 'Caregiver Handoff Notes page: two blocks of blank lines, what is happening this week and what a partner, co-parent or sitter needs to know',
    caption: 'What a partner, co-parent, or sitter needs to know this week, in one place.',
    title: 'Caregiver Handoff Notes',
    subtitle: 'Written for whoever is stepping in, so nothing has to be explained twice, out loud, on the way out the door.',
    body: () => `
      ${linesBlock({ label: 'WHAT\u2019S HAPPENING THIS WEEK', color: C.sageTint, count: 4 })}
      ${linesBlock({ label: 'WHAT THEY SHOULD KNOW', hint: 'Routines, preferences, anything that is not obvious from the outside.', color: C.sand, count: 4 })}`,
  },
  {
    id: 'meal-rotation',
    name: 'Family Meal Rotation',
    alt: 'Family Meal Rotation page: a table with columns for meal, groceries needed, and a make-again circle, across eight rows',
    caption: 'A short list of repeatable, kid-tolerated meals, not a new plan every single day.',
    title: 'Family Meal Rotation',
    subtitle: 'Meals worth keeping on hand because they already work. Pulled from when there is nothing left to plan for the week.',
    body: () => tableBlock({ headers: ['MEAL', 'GROCERIES NEEDED', 'MAKE AGAIN'], rows: 8, colors: [C.clayTint, C.mint] }),
  },
  {
    id: 'one-thing-for-me',
    name: 'One Thing for Me',
    alt: 'One Thing for Me page: a single blank line for one small thing the parent does for themselves this week',
    caption: 'A single, deliberately small self-care line for the parent. Not a full page, so it never feels like one more thing.',
    title: 'One Thing for Me',
    subtitle: 'Deliberately small, and deliberately one line. A whole page would be one more thing to fall behind on.',
    body: () => `
      <section class="block" style="background:${C.slateTint}">
        <h2 class="block__label">THIS WEEK, FOR ME</h2>
        <div class="lrows"><div class="lrow"><span class="lrow__line"></span></div></div>
      </section>
      ${note('One line. Not a self-care plan, not a routine to maintain on top of everything else, just one thing.')}`,
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
.lrow__n--wide { min-width: 170px; }
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
.weekgrid { margin-top: 14px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
.weekcell { display: grid; gap: 9px; }
.weekcell__d { font-size: 12px; font-weight: 700; color: ${C.sageDeep}; letter-spacing: 0.05em; }
.weekcell__slot { display: grid; gap: 3px; }
.weekcell__tag { font-size: 9.5px; font-weight: 700; color: ${C.inkSoft}; letter-spacing: 0.06em; }
.weekcell__line { display: block; border-bottom: 1px solid ${C.rule}; height: 22px; }
.refnote { margin: 8px 0 0; font-size: 13px; line-height: 1.6; color: ${C.inkSoft}; }
.note { margin-top: 16px; font-size: 13px; line-height: 1.5; color: ${C.inkSoft}; max-width: 56ch; }
/* Cover */
.cover { padding-top: 200px; text-align: center; display: grid; justify-items: center; gap: 22px; }
.pill { display: inline-flex; padding: 9px 20px; border-radius: 999px; background: ${C.sageTint}; color: ${C.sageDeep}; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; }
.cover__title { font-size: 44px; font-weight: 700; color: ${C.sageDeep}; line-height: 1.14; letter-spacing: -0.01em; margin: 6px 0 0; }
.cover__sub { font-size: 17px; color: ${C.inkSoft}; line-height: 1.5; max-width: 36em; margin: 0; }
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
