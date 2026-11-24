// One-off verification crawl against the local wrangler emulation of the
// built dist/. Not part of the build; run manually: node scripts/verify-site.mjs
const BASE = 'http://127.0.0.1:8788';
const PAGES = [
  '/', '/shop/', '/shop/budget-planner/', '/shop/adhd-home-reset-planner/',
  '/shop/adhd-student-planner/', '/shop/adhd-work-focus-planner/',
  '/shop/adhd-family-household-planner/', '/holiday-gift-budget-tracker/',
  '/new-year-no-resolutions/',
  '/blog/', '/blog/hourly-time-blocking-doesnt-work-for-adhd/',
  '/blog/budget-spreadsheet-doesnt-work-for-adhd/',
];

let failures = 0;

for (const path of PAGES) {
  const res = await fetch(BASE + path);
  const html = await res.text();
  const problems = [];

  if (res.status !== 200) problems.push(`status ${res.status}`);

  // Em-dash check (brief hard constraint).
  if (html.includes('—')) problems.push('contains an em-dash (U+2014)');

  // Every <img> needs width and height.
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  for (const img of imgs) {
    if (!/\swidth="\d+"/.test(img) || !/\sheight="\d+"/.test(img)) {
      problems.push(`img missing width/height: ${img.slice(0, 90)}`);
    }
  }

  // Exactly one canonical (noindex pages may have zero).
  const canonicals = html.match(/rel="canonical"/g) || [];
  if (canonicals.length > 1) problems.push(`${canonicals.length} canonical tags`);

  // Exactly one <h1>.
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) problems.push(`${h1s.length} <h1> elements`);

  // Internal links should be root-relative with a trailing slash (or an
  // anchor/mailto/external). Collect for a second-pass existence check.
  const hrefs = [...html.matchAll(/href="(\/[^"#]*)"/g)].map((m) => m[1]);
  const badSlash = hrefs.filter((h) => h !== '/' && !h.endsWith('/') && !h.includes('.'));
  if (badSlash.length) problems.push(`internal hrefs without trailing slash: ${badSlash.join(', ')}`);

  if (problems.length) {
    failures++;
    console.log(`FAIL ${path}`);
    problems.forEach((p) => console.log(`  - ${p}`));
  } else {
    console.log(`ok   ${path}`);
  }
}

console.log(failures ? `\n${failures} page(s) with problems` : '\nAll pages clean');
process.exit(failures ? 1 : 0);
