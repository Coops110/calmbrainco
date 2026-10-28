// One-time asset builder for two new seasonal mini-printables, built the
// same way as build-adhd-family-household-planner.mjs (same brand tokens,
// same component helpers, same Letter+A4 PDF/PNG pipeline). Both are free /
// pay-what-you-want lead magnets, same tier as free-habit-tracker.astro --
// real research grounded the angle, not invented: holiday gift/budget
// tracking (confirmed real search demand) and a "no resolutions" goal page
// built directly on the re-entry-point / flexible-goal pattern that ADHD
// coaching sources actually recommend, which also happens to be this
// brand's own existing voice (no streaks, no guilt).
//
// Outputs, per product:
//   C:\Users\ccoop\Documents\Etsy Printables\<Product>\
//     <Product> - US Letter and A4.pdf   (combined, cover + 2 content pages x 2 sizes)
//     source-html\*.html
//   C:\Users\ccoop\calmbrainco-site\src\assets\products\<slug>\*.png

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');

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

async function loadFontDataUri(relPath, mime = 'font/woff2') {
  const buf = await readFile(path.join(SITE_ROOT, 'node_modules', relPath));
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const checkboxSvg = (color = C.slate) =>
  `<svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true"><rect x="2" y="2" width="22" height="22" rx="6" fill="none" stroke="${color}" stroke-width="2.4"/></svg>`;
const circleSvg = (color = C.slate, size = 30) =>
  `<svg viewBox="0 0 30 30" width="${size}" height="${size}" aria-hidden="true"><circle cx="15" cy="15" r="12.5" fill="none" stroke="${color}" stroke-width="2.4"/></svg>`;

function linesBlock({ label, hint, color, count = 3 }) {
  const lines = Array.from({ length: count }, () =>
    `<div class="lrow"><span class="lrow__line"></span></div>`
  ).join('');
  return `<section class="block" style="background:${color}">
    <h2 class="block__label">${esc(label)}</h2>
    ${hint ? `<p class="block__hint">${esc(hint)}</p>` : ''}
    <div class="lrows">${lines}</div>
  </section>`;
}

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

// Table where the first column's text is pre-printed (not a blank line) --
// used for the holiday spending categories (label, blank, blank, circle).
function labeledTableBlock({ headers, labels, colors = [C.mint, C.sand] }) {
  const n = headers.length;
  const template = `1.1fr ${Array.from({ length: n - 2 }, () => '1fr').join(' ')} 0.55fr`;
  const colStyle = `grid-template-columns:${template}`;
  const head = `<div class="trow trow--head" style="${colStyle}">${headers.map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
  const body = labels.map((label, i) => {
    const bg = colors[i % colors.length];
    const midCells = Array.from({ length: n - 2 }, () => `<span class="tcell"></span>`).join('');
    return `<div class="trow" style="background:${bg};${colStyle}"><span class="tcell tcell--label">${esc(label)}</span>${midCells}<span class="tcell tcell--circle">${circleSvg(C.slate, 26)}</span></div>`;
  }).join('');
  return `<section class="tableblock">${head}${body}</section>`;
}

// Table where the first column's text is pre-printed, followed by a circle,
// then a blank note line -- used for the 12-month check-in (label, circle, blank).
function labeledCircleThenLineTableBlock({ headers, labels, colors = [C.mint, C.sand] }) {
  const template = '0.7fr 0.55fr 1fr';
  const colStyle = `grid-template-columns:${template}`;
  const head = `<div class="trow trow--head" style="${colStyle}">${headers.map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
  const body = labels.map((label, i) => {
    const bg = colors[i % colors.length];
    return `<div class="trow" style="background:${bg};${colStyle}"><span class="tcell tcell--label">${esc(label)}</span><span class="tcell tcell--circle">${circleSvg(C.slate, 26)}</span><span class="tcell"></span></div>`;
  }).join('');
  return `<section class="tableblock">${head}${body}</section>`;
}

function note(text) {
  return `<p class="note">${esc(text)}</p>`;
}

function columns(blocks) {
  return `<div class="cols cols--${blocks.length}">${blocks.join('')}</div>`;
}

// ---- Product A: Holiday Gift & Budget Tracker ----
const holidayPages = [
  {
    id: 'cover',
    name: 'Cover',
    alt: 'Cover page of the Holiday Gift and Budget Tracker listing both pages',
    caption: 'The first sheet, if you keep the set in a folder.',
    title: null,
    body: () => `
      <div class="cover">
        <span class="pill">DIGITAL &middot; 2 PAGES</span>
        <h1 class="cover__title">Holiday Gift &amp;<br/>Budget Tracker</h1>
        <p class="cover__sub">Short bursts, not one overwhelming shopping trip.<br/>One page per person, one page for the whole budget.</p>
        <div class="cover__dots">
          <span class="dot" style="background:${C.sand}"></span>
          <span class="dot" style="background:${C.mint}"></span>
          <span class="dot" style="background:${C.peri}"></span>
          <span class="dot" style="background:${C.clayTint}"></span>
        </div>
      </div>
      <a class="cover__navlink" style="--navtop:900px">Gift List &amp; Budget &rarr;</a>
      <a class="cover__navlink" style="--navtop:938px">Holiday Spending Overview &rarr;</a>`,
  },
  {
    id: 'gift-list-budget',
    name: 'Gift List & Budget',
    alt: 'Gift List and Budget page: a table with columns for who, budget, gift idea, and a bought circle, across ten rows',
    caption: 'Who, how much, what idea, bought yet. One page instead of five browser tabs.',
    title: 'Gift List & Budget',
    subtitle: 'Write the budget down before you shop, not after. A number on paper is easier to stick to than one in your head.',
    body: () => tableBlock({ headers: ['WHO', 'BUDGET', 'GIFT IDEA', 'BOUGHT'], rows: 10, colors: [C.mint, C.sand] }),
  },
  {
    id: 'spending-overview',
    name: 'Holiday Spending Overview',
    alt: 'Holiday Spending Overview page: a table with pre-printed categories (gifts, food and entertaining, travel, decor and cards, other) and columns for budgeted, actual, and a done circle',
    caption: 'Five honest categories, not a line item for every receipt.',
    title: 'Holiday Spending Overview',
    subtitle: 'Budgeted next to actual, five categories wide. Close enough to catch a problem early, loose enough to actually keep using.',
    body: () => labeledTableBlock({
      headers: ['CATEGORY', 'BUDGETED', 'ACTUAL', 'DONE'],
      labels: ['Gifts', 'Food & Entertaining', 'Travel', 'Decor & Cards', 'Other'],
      colors: [C.peri, C.sand],
    }),
  },
];

// ---- Product B: New Year, No Resolutions ----
const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const newYearPages = [
  {
    id: 'cover',
    name: 'Cover',
    alt: 'Cover page of the New Year, No Resolutions goal page listing both pages',
    caption: 'The first sheet, if you keep the set in a folder.',
    title: null,
    body: () => `
      <div class="cover">
        <span class="pill">DIGITAL &middot; 2 PAGES</span>
        <h1 class="cover__title">New Year,<br/>No Resolutions</h1>
        <p class="cover__sub">Resolutions assume a brain that runs on streaks.<br/>This page assumes the real one: re-entry points, not restarts from zero.</p>
        <div class="cover__dots">
          <span class="dot" style="background:${C.sageTint}"></span>
          <span class="dot" style="background:${C.slateTint}"></span>
          <span class="dot" style="background:${C.plumTint}"></span>
          <span class="dot" style="background:${C.mint}"></span>
        </div>
      </div>
      <a class="cover__navlink" style="--navtop:900px">Instead of a Resolution &rarr;</a>
      <a class="cover__navlink" style="--navtop:938px">Monthly Check-In, Not a Streak &rarr;</a>`,
  },
  {
    id: 'instead-of-a-resolution',
    name: 'Instead of a Resolution',
    alt: 'Instead of a Resolution page: four labeled blank lines for the goal, the smallest version, the restart rule if a day is missed, and the restart rule if a week is missed',
    caption: 'The re-entry point written down before you need it, not improvised mid-guilt-spiral in February.',
    title: 'Instead of a Resolution',
    subtitle: 'Vague goals like "be more organized" give an ADHD brain nothing to grab onto. This page asks four specific questions instead.',
    body: () => labeledLines({
      label: 'WRITE IT DOWN NOW, WHILE IT\u2019S EASY',
      hint: null,
      color: C.sageTint,
      items: [
        'The goal, in one plain sentence',
        'The smallest version of it that still counts',
        'If I miss a day, I...',
        'If I miss a whole week, I...',
      ],
    }),
  },
  {
    id: 'monthly-checkin',
    name: 'Monthly Check-In, Not a Streak',
    alt: 'Monthly Check-In page: a twelve-row table, one row per month, with a did-I-move-toward-it circle and a one-line note column, no streak counter anywhere',
    caption: 'Twelve honest check-ins across the year. No chain to protect, no zero to explain.',
    title: 'Monthly Check-In, Not a Streak',
    subtitle: 'One circle a month, not thirty a month. A quiet January is still on the page -- it just is not a failure.',
    body: () => `
      ${labeledCircleThenLineTableBlock({
        headers: ['MONTH', 'MOVED TOWARD IT?', 'ONE NOTE'],
        labels: months,
        colors: [C.slateTint, C.peri],
      })}
      ${note('No row is a failure. A blank month just means nothing to note that month -- skip it and keep going next month.')}
    `,
  },
];

const shellStyle = (bodyWidthLetter = '816px') => `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: ${C.cream}; }
.page { width: 100%; height: 100%; padding: 47px 48px 0; position: relative; }
.pagetitle-row { display:flex; align-items:baseline; justify-content:space-between; gap: 20px; }
h1.pagetitle { margin: 0; font-size: 34px; font-weight: 700; letter-spacing: -0.01em; color: ${C.ink}; }
.subtitle { margin: 10px 0 0; font-size: 14.5px; line-height: 1.5; color: ${C.inkSoft}; max-width: 58ch; }
.block { border-radius: 16px; padding: 18px 22px 20px; margin-top: 18px; }
.block__label { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; color: ${C.sageDeep}; text-transform: uppercase; }
.block__hint { margin: 4px 0 0; font-size: 12.5px; color: ${C.inkSoft}; }
.lrows { margin-top: 14px; display: grid; gap: 16px; }
.lrow { display: flex; align-items: center; gap: 10px; }
.lrow__n { font-size: 13px; color: ${C.inkSoft}; font-weight: 600; min-width: 14px; }
.lrow__n--wide { min-width: 280px; font-size: 14px; }
.lrow__line { flex: 1; border-bottom: 1px solid ${C.rule}; height: 1px; }
.cols { display: grid; gap: 16px; margin-top: 18px; }
.cols--2 { grid-template-columns: repeat(2, 1fr); }
.cols .block { margin-top: 0; }
.tableblock { margin-top: 18px; border-radius: 16px; overflow: hidden; }
.trow { display: grid; align-items: center; padding: 11px 16px; gap: 10px; }
.trow--head { background: transparent !important; padding-bottom: 6px; }
.trow--head span { font-size: 11.5px; font-weight: 700; letter-spacing: 0.07em; color: ${C.inkSoft}; text-transform: uppercase; }
.tcell { display: block; height: 1px; border-bottom: 1px solid ${C.rule}; }
.tcell--label { border: none; font-size: 13px; font-weight: 700; color: ${C.ink}; }
.tcell--circle { border: none; display:flex; justify-content:flex-start; }
.note { margin-top: 16px; font-size: 13px; line-height: 1.5; color: ${C.inkSoft}; max-width: 56ch; }
.cover { padding-top: 200px; text-align: center; display: grid; justify-items: center; gap: 22px; }
.pill { display: inline-flex; padding: 9px 20px; border-radius: 999px; background: ${C.sageTint}; color: ${C.sageDeep}; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; }
.cover__title { font-size: 44px; font-weight: 700; color: ${C.sageDeep}; line-height: 1.14; letter-spacing: -0.01em; margin: 6px 0 0; }
.cover__sub { font-size: 17px; color: ${C.inkSoft}; line-height: 1.5; max-width: 36em; margin: 0; }
.cover__dots { display: flex; gap: 10px; margin-top: 6px; }
.dot { width: 18px; height: 18px; border-radius: 50%; }
.cover__list { font-size: 14px; color: ${C.inkSoft}; margin: 2px 0 0; }
/* Fixed-position nav links -- exact Y so the PDF link-rect script can target
   them precisely without guessing at flow-layout heights. */
.cover__navlink { position: absolute; left: 0; right: 0; top: var(--navtop); height: 34px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; color: ${C.sage}; text-decoration: underline; text-decoration-color: ${C.rule}; text-underline-offset: 3px; }
`;

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
html, body { width: ${W}; height: ${H}; overflow: hidden; font-family: 'Instrument Sans', 'Segoe UI', sans-serif; color: ${C.ink}; }
${shellStyle()}
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

async function buildProduct({ browser, shell, pages, docsFolder, pdfName, pngSlug }) {
  const DOCS_ROOT = `C:\\Users\\ccoop\\Documents\\Etsy Printables\\${docsFolder}`;
  const HTML_OUT = path.join(DOCS_ROOT, 'source-html');
  const PDF_OUT = path.join(DOCS_ROOT, pdfName);
  const PNG_OUT = path.join(SITE_ROOT, 'src', 'assets', 'products', pngSlug);
  await mkdir(HTML_OUT, { recursive: true });
  await mkdir(PNG_OUT, { recursive: true });

  const letterPdfs = [];
  const a4Pdfs = [];

  for (const p of pages) {
    const bodyHtml = p.body();
    const htmlLetter = shell({ sizeName: 'letter', title: p.title, subtitle: p.subtitle, bodyHtml });
    const htmlA4 = shell({ sizeName: 'a4', title: p.title, subtitle: p.subtitle, bodyHtml });

    await writeFile(path.join(HTML_OUT, `${p.id}-letter.html`), htmlLetter, 'utf-8');
    await writeFile(path.join(HTML_OUT, `${p.id}-a4.html`), htmlA4, 'utf-8');

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

    const pdfPageA4 = await browser.newPage({ viewport: { width: 794, height: 1123 } });
    await pdfPageA4.setContent(htmlA4, { waitUntil: 'load' });
    await pdfPageA4.evaluate(() => document.fonts.ready);
    const a4Buf = await pdfPageA4.pdf({ width: '8.27in', height: '11.69in', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    a4Pdfs.push(a4Buf);
    await pdfPageA4.close();

    console.log(`  rendered: ${p.id} (letter + a4, pdf + png)`);
  }

  const merged = await PDFDocument.create();
  for (const buf of [...letterPdfs, ...a4Pdfs]) {
    const src = await PDFDocument.load(buf);
    const [copied] = await merged.copyPages(src, [0]);
    merged.addPage(copied);
  }
  const mergedBytes = await merged.save();
  await writeFile(PDF_OUT, mergedBytes);
  console.log(`  -> ${PDF_OUT} (${merged.getPageCount()} pages)`);
  console.log(`  -> PNG previews: ${PNG_OUT}`);
}

async function main() {
  const fontInstrument = await loadFontDataUri('@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2');
  const fontCaveat = await loadFontDataUri('@fontsource/caveat/files/caveat-latin-600-normal.woff2');
  const shell = await buildShell(fontInstrument, fontCaveat);
  const browser = await chromium.launch();

  console.log('Holiday Gift & Budget Tracker:');
  await buildProduct({
    browser, shell, pages: holidayPages,
    docsFolder: 'Holiday Gift and Budget Tracker',
    pdfName: 'Holiday Gift and Budget Tracker - US Letter and A4.pdf',
    pngSlug: 'holiday-gift-budget-tracker',
  });

  console.log('New Year, No Resolutions:');
  await buildProduct({
    browser, shell, pages: newYearPages,
    docsFolder: 'New Year No Resolutions',
    pdfName: 'New Year No Resolutions - US Letter and A4.pdf',
    pngSlug: 'new-year-no-resolutions',
  });

  await browser.close();
}

await main();
