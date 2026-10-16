// Browser test (Chromium, 390 and 1280 px). Local by default; live with BASE_URL=https://outils.vread.fr/lectoguide/
// Always ?octave_notrack=1: our own visits are counted apart, never as audience.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
let BASE = process.env.BASE_URL, srv = null;
if (!BASE) {
  const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
  srv = createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = join(DIST, p.replace(/^\/lectoguide\//, ''));
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
    if (!p.startsWith('/lectoguide/') || !existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': T[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f));
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  BASE = `http://127.0.0.1:${srv.address().port}/lectoguide/`;
}
const browser = await chromium.launch();
const results = [];
const step = async (n, fn) => { try { await fn(); results.push(['ok', n]); } catch (e) { results.push(['FAIL', `${n}: ${e.message}`]); } };
for (const width of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const errors = []; const hits = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { if (r.url().includes('script.google.com')) hits.push(r.postData() || ''); });
  await step(`${width}: home lists the guides, no horizontal scroll`, async () => {
    await page.goto(BASE + '?octave_notrack=1', { waitUntil: 'networkidle' });
    assert.ok(await page.locator('.carte-fiche').count() >= 10);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width + 1);
  });
  await step(`${width}: a guide page: summaries, passages, questions with answers behind a click`, async () => {
    await page.goto(BASE + 'le-cid/?octave_notrack=1&cta=a', { waitUntil: 'networkidle' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width + 1);
    assert.equal(await page.locator('ol.questions > li').count(), 5);
    assert.equal(await page.locator('ol.questions details[open]').count(), 0);
    await page.locator('ol.questions summary').first().click();
    assert.equal(await page.locator('ol.questions details[open]').count(), 1);
    assert.equal(await page.locator('.cta-haut').isVisible(), false, 'arm a: no top box');
  });
  await step(`${width}: A/B arm b shows the resources box after the introduction`, async () => {
    await page.goto(BASE + 'le-cid/?octave_notrack=1&cta=b', { waitUntil: 'networkidle' });
    assert.equal(await page.getAttribute('html', 'data-xp-lg-cta'), 'b');
    assert.equal(await page.locator('.cta-haut').isVisible(), true);
  });
  await step(`${width}: tracking hits are flagged notrack`, async () => {
    for (const h of hits) if (h.includes('"event"')) assert.match(h, /"excluded":"notrack"/);
  });
  await step(`${width}: no page error`, async () => assert.deepEqual(errors, []));
  await ctx.close();
}
await browser.close(); if (srv) srv.close();
for (const [s, n] of results) console.log(s.padEnd(4), n);
const failed = results.filter(([s]) => s !== 'ok').length;
console.log(`${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
