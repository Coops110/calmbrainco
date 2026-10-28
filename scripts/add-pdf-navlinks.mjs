// Adds real clickable internal-navigation links to the cover page of a
// 3-page-per-size planner PDF built by build-holiday-and-newyear-minis.mjs
// (cover + 2 content pages, US Letter block then A4 block, 6 pages total).
// pdf-lib doesn't expose a high-level "add internal link" API, so this uses
// its low-level annotation primitives directly: a Link annotation with a
// Dest pointing at another page's object reference, same mechanism used by
// every real "Jump to a page" PDF nav.
//
// Link rect coordinates are computed from the exact CSS --navtop values
// used in the cover's .cover__navlink elements (900px / 938px, each 34px
// tall, full page width), not estimated -- the HTML and this script must be
// kept in sync if the cover layout ever changes.
//
// Usage: node scripts/add-pdf-navlinks.mjs "<path to the merged PDF>"

import { PDFDocument, PDFName, PDFArray, PDFNumber, PDFRef } from 'pdf-lib';
import { readFile, writeFile } from 'node:fs/promises';

const inPath = process.argv[2];
if (!inPath) {
  console.error('Usage: node scripts/add-pdf-navlinks.mjs "<path to pdf>"');
  process.exit(1);
}

// CSS px -> PDF pt scale is identical for both sizes (same DPI), so one
// pair of link-rect geometries (computed once, in CSS px, against the
// Letter page's 816x1056 box) is reused for both the Letter and A4 cover,
// just rescaled against each size's own page box.
const CSS_W = 816, CSS_H = 1056;
const LINKS = [
  { top: 900, height: 34 }, // -> content page 1
  { top: 938, height: 34 }, // -> content page 2
];

function rectFor(pageWidthPt, pageHeightPt, link) {
  const sx = pageWidthPt / CSS_W;
  const sy = pageHeightPt / CSS_H;
  const yTopFromBottomCss = CSS_H - link.top;
  const yBottomFromBottomCss = CSS_H - (link.top + link.height);
  return {
    x1: 0,
    x2: pageWidthPt,
    y1: yBottomFromBottomCss * sy,
    y2: yTopFromBottomCss * sy,
  };
}

function addLink(pdfDoc, page, rect, destPage) {
  const annotDict = pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [rect.x1, rect.y1, rect.x2, rect.y2],
    Border: [0, 0, 0],
    Dest: [destPage.ref, PDFName.of('Fit')],
  });
  const annotRef = pdfDoc.context.register(annotDict);

  const existing = page.node.get(PDFName.of('Annots'));
  let annots = existing ? pdfDoc.context.lookup(existing, PDFArray) : undefined;
  if (!annots) {
    annots = pdfDoc.context.obj([]);
    page.node.set(PDFName.of('Annots'), annots);
  }
  annots.push(annotRef);
}

async function main() {
  const bytes = await readFile(inPath);
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();

  if (pages.length !== 6) {
    throw new Error(`Expected 6 pages (cover+2 letter, cover+2 a4), got ${pages.length} -- geometry assumes this exact layout.`);
  }

  // Letter block: pages[0]=cover, pages[1]=content1, pages[2]=content2
  const letterCover = pages[0];
  const { width: lw, height: lh } = letterCover.getSize();
  LINKS.forEach((link, i) => {
    addLink(pdfDoc, letterCover, rectFor(lw, lh, link), pages[1 + i]);
  });

  // A4 block: pages[3]=cover, pages[4]=content1, pages[5]=content2
  const a4Cover = pages[3];
  const { width: aw, height: ah } = a4Cover.getSize();
  LINKS.forEach((link, i) => {
    addLink(pdfDoc, a4Cover, rectFor(aw, ah, link), pages[4 + i]);
  });

  const outBytes = await pdfDoc.save();
  await writeFile(inPath, outBytes);
  console.log(`Added 4 internal nav links (2 Letter cover -> content, 2 A4 cover -> content) to:\n  ${inPath}`);
}

await main();
