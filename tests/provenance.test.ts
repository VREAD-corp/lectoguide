// The verbatim parts of seo-engine/ against chapter-coffee-club@70ca369 (CHAPTER_COFFEE_CLUB=../chapter-coffee-club).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CCC = process.env.CHAPTER_COFFEE_CLUB;
const show = (p: string) => execFileSync('git', ['-C', CCC!, 'show', `70ca369:${p}`], { encoding: 'utf8' });
const mine = (p: string) => readFileSync(join(ROOT, 'seo-engine', p), 'utf8');
const fn = (src: string, start: string) => { const i = src.indexOf(start); assert.ok(i >= 0, start); const j = src.indexOf('\n}\n', i); return src.slice(i, j + 2); };

test('verbatim parts match the pre-Octave snapshot of chapter-coffee-club', { skip: !CCC }, () => {
  assert.equal(execFileSync('git', ['-C', CCC!, 'rev-parse', '70ca369'], { encoding: 'utf8' }).trim(), '70ca3698203844e58d6b427ff5961decb300e76b');
  assert.equal(mine('dates.ts').split('\n').slice(1).join('\n'), show('src/seo/dates.ts'));
  assert.equal(fn(mine('metadata.ts'), 'export function escapeHtml'), fn(show('src/seo/metadata.ts'), 'export function escapeHtml'));
  for (const f of ['export function isPublishedNow', 'export function escapeXml']) assert.equal(fn(mine('publication.ts'), f), fn(show('src/seo/publication.ts'), f));
  assert.equal(fn(mine('render.ts'), 'export function setHtmlLang').replace('locale: string', 'locale: Locale'), fn(show('api/render.ts'), 'function setHtmlLang').replace(/^function/, 'export function'));
  const sanitizer = (s: string) => s.match(/\.replace\(\/<meta\\s\+name=\["'\]robots[\s\S]*?ld\\\+json[^\n]*\n/)![0];
  assert.equal(sanitizer(mine('render.ts')).replace(/\s+/g, ' '), sanitizer(show('api/render.ts')).replace(/\s+/g, ' '));
  assert.ok(show('api/render.ts').includes('const FALLBACK_TEMPLATE = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><!--SEO_INJECT--></head><body><div id="root"></div></body></html>`;'));
  assert.ok(mine('render.ts').includes('export const FALLBACK_TEMPLATE = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><!--SEO_INJECT--></head><body><div id="root"></div></body></html>`;'));
});
