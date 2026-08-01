import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const output = new URL('./ui/', import.meta.url);
await mkdir(output, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: fileURLToPath(new URL(name, output)), fullPage: true });
}

async function targetName(page) {
  return page.locator('.wt-photo__image').getAttribute('alt');
}

async function chooseTarget(page) {
  const name = await targetName(page);
  await page.locator('.wt-option').filter({ hasText: name }).click();
}

for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }]) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => localStorage.setItem('game_locale', 'zh'));
  await page.goto('http://127.0.0.1:4192/?demo=1', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' });
  const size = `${viewport.width}x${viewport.height}`;
  await shot(page, `platform-layout-cover-${size}.png`);
  await page.locator('.wt-primary').click();
  await shot(page, `platform-layout-round-18-${size}.png`);
  const name = await targetName(page);
  await page.locator('.wt-option').filter({ hasNotText: name }).first().click();
  await shot(page, `platform-layout-round-44-${size}.png`);
  await chooseTarget(page);
  await page.waitForSelector('.wt-reveal');
  await page.waitForTimeout(340);
  await shot(page, `platform-layout-reveal-${size}.png`);
  await page.locator('.wt-reveal .wt-primary').click();
  for (let round = 1; round < 5; round += 1) {
    await chooseTarget(page);
    await page.locator('.wt-reveal .wt-primary').click();
  }
  await page.waitForSelector('.wt-result');
  await shot(page, `platform-layout-result-${size}.png`);
  await page.close();
}

await browser.close();
