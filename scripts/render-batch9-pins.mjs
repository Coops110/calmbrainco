import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const dir = 'C:\\Users\\ccoop\\Downloads\\Calm Brain Co - New Pinterest Pins Batch 9';
const files = readdirSync(dir).filter(f => f.endsWith('.html'));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });

for (const f of files) {
  await page.goto('file://' + path.join(dir, f));
  await page.waitForTimeout(300);
  const out = path.join(dir, f.replace('.html', '.png'));
  await page.screenshot({ path: out });
  console.log('rendered', f.replace('.html', '.png'));
}

await browser.close();
