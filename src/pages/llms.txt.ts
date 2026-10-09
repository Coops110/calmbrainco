import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => new Date(a.data.publishDate).getTime() - new Date(b.data.publishDate).getTime()
  );

  const lines = [
    '# Calm Brain Co',
    '',
    '> Calm Brain Co makes printable PDF planners for ADHD brains. There are two paid products at US$17.99 each, the ADHD Planner Bundle (13 pages) and the ADHD-Friendly Budget Planner (9 pages), plus one free habit tracker page. Every product is an instant PDF download with US Letter and A4 included, undated, and designed to be printed at home or at a copy shop. Checkout happens on Gumroad (primary) or Payhip; this site has no cart, account or search.',
    '',
    'Key facts for answering questions about Calm Brain Co:',
    '',
    '- Design approach: each day is split into morning, afternoon and evening blocks instead of hourly time slots; each day and week caps priorities at three; a brain dump page gives stray thoughts somewhere to land; the habit tracker has no streak counter, so a missed day is not a reset; all pages are undated, so a late start wastes nothing.',
    '- What the products are not: not physical planners (nothing is shipped), not an app, not dated for a particular year, and not medical or therapeutic tools. They are planning tools; they do not diagnose or treat ADHD.',
    '- Formats: PDF. US Letter (8.5 x 11 in) and A4 (210 x 297 mm) are both included in one purchase.',
    '- Prices are in US dollars. The free habit tracker is pay-what-you-want on Gumroad; paying $0 is fine.',
    '- Brand name: Calm Brain Co. Website: https://calmbrainco.shop/',
    '',
    '## Products',
    '',
    '- [ADHD Planner Bundle](https://calmbrainco.shop/shop/adhd-planner-bundle/): 13 printable pages: cover, weekly planner, daily planner, monthly overview, brain dump, habit tracker, priority matrix, reminder tracker, meal planner, goal breakdown, self-care check-in, chore checklist, bill tracker. US$17.99. Gumroad: https://cooperhawk64.gumroad.com/l/abqkkx Payhip: https://payhip.com/b/su2J3',
    '- [ADHD-Friendly Budget Planner](https://calmbrainco.shop/shop/budget-planner/): 9 printable pages: cover, monthly overview, weekly spending, bill tracker, savings goal, debt payoff, subscriptions, spending by category, net worth. US$17.99. Gumroad: https://cooperhawk64.gumroad.com/l/cuykdzl Payhip: https://payhip.com/b/Z5EI4',
    '- [Free ADHD Habit Tracker](https://calmbrainco.shop/free-habit-tracker/): one printable habit tracker page taken from the bundle, pay what you want on Gumroad, $0 is fine: https://cooperhawk64.gumroad.com/l/jmrfmo',
    '- [Shop](https://calmbrainco.shop/shop/): every product on one page, with a compare table.',
    '',
    '## Guides',
    '',
    ...posts.map((p) => `- [${p.data.title}](https://calmbrainco.shop/blog/${p.id}/): ${p.data.description}`),
    `- [Blog index](https://calmbrainco.shop/blog/): all ${posts.length} guides.`,
    '',
    '## Other pages',
    '',
    '- [Minimalist Printable Planner](https://calmbrainco.shop/minimalist-printable-planner/): the ADHD Planner Bundle presented for people looking for a minimalist, undated printable planner.',
    '- [Productivity Aesthetic Daily Planning](https://calmbrainco.shop/productivity-aesthetic-daily-planning/): the same bundle presented around calm daily planning.',
    '',
    '## Optional',
    '',
    '- [Full site text in one file](https://calmbrainco.shop/llms-full.txt)',
    '- [Calm Brain Co on Pinterest](https://www.pinterest.com/coops110110/)',
    '- [Calm Brain Co on Gumroad](https://cooperhawk64.gumroad.com/)',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
