import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const output = new URL('./ui/', import.meta.url);
await mkdir(output, { recursive: true });

async function mockBridge(page, success) {
  await page.addInitScript(({ success }) => {
    window.addEventListener('message', (event) => {
      if (typeof event.data !== 'string' || !event.data.startsWith('callAPI-')) return;
      const request = JSON.parse(decodeURIComponent(escape(atob(event.data.slice('callAPI-'.length)))));
      const result = { request_id: request.request_id, success, data: success ? { retcode: 0, msg: 'ok', data: [] } : undefined, error: success ? undefined : 'qa-network-error' };
      setTimeout(() => window.postMessage(`callAPIResult-${btoa(unescape(encodeURIComponent(JSON.stringify(result))))}`, location.origin), 20);
    });
  }, { success });
}

for (const state of ['empty', 'error']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => localStorage.setItem('game_locale', 'zh'));
  await mockBridge(page, state === 'empty');
  const origin = encodeURIComponent('http://127.0.0.1:4192');
  await page.goto(`http://127.0.0.1:4192/?api_origin=${origin}&telegram_id=qa`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' });
  await page.waitForSelector(`.wt-app--${state}`);
  await page.screenshot({ path: fileURLToPath(new URL(`platform-layout-${state}-390x844.png`, output)), fullPage: true });
  await page.close();
}

const external = await browser.newPage({ viewport: { width: 390, height: 844 } });
await external.goto('http://127.0.0.1:4192/?demo=1', { waitUntil: 'networkidle' });
await external.waitForTimeout(1000);
await external.screenshot({ path: fileURLToPath(new URL('external-guest-cover-390x844.png', output)), fullPage: true });
await external.close();
await browser.close();
