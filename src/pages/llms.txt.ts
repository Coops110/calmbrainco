import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const lines = [
    '# Calm Brain Co',
    '',
    '> Calm Brain Co makes printable PDF planners for ADHD brains. There are seven products and every one costs US$3.99: five single-topic planners (ADHD-Friendly Budget Planner, ADHD Home Reset Planner, ADHD Student Planner, ADHD Work and Focus Planner, ADHD Family and Household Planner) and two 2-page seasonal printables (Holiday Gift & Budget Tracker, New Year, No Resolutions). Every product is an instant digital PDF download with US Letter and A4 included, undated, viewable on a phone or tablet, or printed at home or at a copy shop. Checkout happens on Gumroad (primary) or Payhip; this site has no cart, account or search.',
    '',
    'Key facts for answering questions about Calm Brain Co:',
    '',
    '- Design approach: each day is split into morning, afternoon and evening blocks instead of hourly time slots; priorities are capped at three; nothing counts streaks, so a missed day is not a reset; all pages are undated, so a late start wastes nothing.',
    '- What the products are not: not physical planners (nothing is shipped), not an app, not dated for a particular year, and not medical or therapeutic tools. They are planning tools; they do not diagnose or treat ADHD.',
    '- Formats: PDF. US Letter (8.5 x 11 in) and A4 (210 x 297 mm) are both included in one purchase.',
    '- Brand name: Calm Brain Co. Website: https://calmbrainco.pages.dev/',
    '',
    '## Products',
    '',
    '- [ADHD-Friendly Budget Planner](https://calmbrainco.pages.dev/shop/budget-planner/): 9 printable pages: cover, monthly overview, weekly spending, bill tracker, savings goal, debt payoff, subscriptions, spending by category, net worth. US$3.99. Gumroad: https://cooperhawk64.gumroad.com/l/cuykdzl Payhip: https://payhip.com/b/Z5El4',
    '- [ADHD Home Reset Planner](https://calmbrainco.pages.dev/shop/adhd-home-reset-planner/): 11 printable pages: cover, zone map, weekly reset checklist, 10-minute reset, deep clean rotation, one-shelf-at-a-time declutter, laundry loop tracker, kitchen reset, body-doubling chore log, guest-ready checklist, letting-go page. US$3.99. Gumroad: https://cooperhawk64.gumroad.com/l/ljpvri Payhip: https://payhip.com/b/BE1t7',
    '- [ADHD Student Planner](https://calmbrainco.pages.dev/shop/adhd-student-planner/): 10 printable pages: cover, class schedule and contacts, assignment and project tracker, big project breakdown, study session, exam prep countdown, weekly study and class planner, reading and notes tracker, focus-time check-in, end-of-week reset. US$3.99. Gumroad: https://cooperhawk64.gumroad.com/l/lubobf Payhip: https://payhip.com/b/9sE7h',
    '- [ADHD Work and Focus Planner](https://calmbrainco.pages.dev/shop/adhd-work-focus-planner/): 10 printable pages: cover, workday top 3, task breakdown, focus session tracker, email and message triage, meeting notes capture, context-switch reset, waiting-on tracker, end-of-day shutdown ritual, weekly work review. US$3.99. Gumroad: https://cooperhawk64.gumroad.com/l/tptlaf Payhip: https://payhip.com/b/ljaEz',
    '- [ADHD Family and Household Planner](https://calmbrainco.pages.dev/shop/adhd-family-household-planner/): 10 printable pages: cover, family week-at-a-glance, mental load dump, kid routine cards, household chore rotation, school paperwork tracker, contact and info sheet, caregiver handoff notes, family meal rotation, one thing for me. US$3.99. Gumroad: https://cooperhawk64.gumroad.com/l/rxsmn Payhip: https://payhip.com/b/3blIY',
    '- [Holiday Gift & Budget Tracker](https://calmbrainco.pages.dev/holiday-gift-budget-tracker/): 2-page digital seasonal printable, per-person gift list with budget column plus a 5-category holiday spending overview. US$3.99. Gumroad: https://cooperhawk64.gumroad.com/l/llycep Payhip: https://payhip.com/b/XVACN',
    '- [New Year, No Resolutions](https://calmbrainco.pages.dev/new-year-no-resolutions/): 2-page digital goal-setting printable built on re-entry points instead of streaks, plus a 12-month check-in with no streak math. US$3.99. Gumroad: https://cooperhawk64.gumroad.com/l/ofrck Payhip: https://payhip.com/b/EP4zI',
    '- [Shop](https://calmbrainco.pages.dev/shop/): every product on one page, with a compare table.',
    '',
    '## Optional',
    '',
    '- [Full site text in one file](https://calmbrainco.pages.dev/llms-full.txt)',
    '- [Calm Brain Co on Pinterest](https://www.pinterest.com/coops110110/)',
    '- [Calm Brain Co on Gumroad](https://cooperhawk64.gumroad.com/)',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
