// Static checks of the built site and of the guide content (npm test builds dist/ first).
// Optional: OCTAVE_CHECKOUT_WEB=../octave-checkout/gas/web (vendored scripts identical), LINT_IA=../vread-revenue-lab/content/lint-ia.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { editorialWarnings } from '../seo-engine/editorial.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const BASE = '/lectoguide/';
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const html: Record<string, string> = Object.fromEntries(pages.map((f) => [f.slice(DIST.length), readFileSync(f, 'utf8')]));
const text = (h: string) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');
const guides = readdirSync(join(ROOT, 'content/guides')).map((f) => JSON.parse(readFileSync(join(ROOT, 'content/guides', f), 'utf8')));
const norm = (s: string) => s.normalize('NFC').replace(/[’ʼ]/g, "'").replace(/\s+/g, ' ').trim();

test('10 to 30 guides, every page: lang fr, title, description, one h1, canonical (except 404), unique titles', () => {
  assert.ok(guides.length >= 10 && guides.length <= 30, `${guides.length} guides`);
  assert.ok(guides.every((g) => ['bac', 'lycee', 'college'].includes(g.programme)));
  assert.equal(pages.length, guides.length + 5);
  for (const [p, h] of Object.entries(html)) {
    assert.match(h, /<html lang="fr">/, p);
    assert.match(h, /<title data-rh="true">[^<]{20,}<\/title>/, p);
    assert.match(h, new RegExp(`<meta data-rh="true" name="description" content="[^"]{${p === '/404.html' ? 20 : 80},}" />`), p);
    assert.equal((h.match(/<h1[\s>]/g) || []).length, 1, `${p}: one h1`);
    if (p !== '/404.html') assert.match(h, new RegExp(`<link data-rh="true" rel="canonical" href="https://outils\\.vread\\.fr${BASE}`), p);
    else assert.match(h, /noindex/);
  }
  const titles = Object.values(html).map((h) => h.match(/<title[^>]*>([^<]+)/)![1]);
  assert.equal(new Set(titles).size, titles.length);
});

test('internal links resolve; sitemap lists every indexable page', () => {
  for (const [p, h] of Object.entries(html)) for (const [, href] of h.matchAll(/(?:href|src)="(\/lectoguide\/[^"#?]*)/g)) {
    let f = join(DIST, href.slice(BASE.length)); if (href.endsWith('/')) f = join(f, 'index.html');
    assert.ok(existsSync(f), `${p} -> ${href}`);
  }
  const sm = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  assert.equal((sm.match(/<loc>/g) || []).length, guides.length + 4);
  for (const g of guides) assert.ok(sm.includes(`<loc>https://outils.vread.fr/lectoguide/${g.slug}/</loc><lastmod>`), g.slug);
  assert.ok(readFileSync(join(DIST, 'llms.txt'), 'utf8').startsWith('# Lectoguide par READ FRANCE'));
});

test('JSON-LD parses, names READ FRANCE, no rating or review; each guide is a free LearningResource about its Book', () => {
  for (const [p, h] of Object.entries(html)) for (const [, j] of h.matchAll(/<script data-rh="true" type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(j); assert.doesNotMatch(j, /aggregateRating|"review"|ratingValue/i, p);
  }
  for (const g of guides) {
    const h = html[`/${g.slug}/index.html`];
    const lr = [...h.matchAll(/<script data-rh="true" type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((d) => d['@type'] === 'LearningResource');
    assert.ok(lr && lr.isAccessibleForFree && lr.about['@type'] === 'Book' && lr.about.author.name === g.author, g.slug);
    assert.equal(lr.publisher['@id'], 'https://outils.vread.fr/#org');
  }
  assert.match(html['/index.html'], /"legalName":"READ FRANCE"/);
});

test('tracking: xp.js then cro.js (site lectoguide), mesure.js v:2 knows lectoguide; no third-party script', () => {
  const mesure = readFileSync(join(DIST, 'mesure.js'), 'utf8');
  assert.match(mesure, /v:2/); assert.match(mesure, /lecto\[pg\]/);
  for (const [p, h] of Object.entries(html)) {
    assert.match(h, /<script src="\/lectoguide\/assets\/xp\.js"><\/script>\n\s*<script src="\/lectoguide\/cro\.js" data-site="lectoguide" data-api="https:\/\/script\.google\.com\/macros\/s\/AKfycbzD1IRL8Q/, p);
    assert.match(h, /mesure\.js" defer/, p);
    assert.deepEqual([...h.matchAll(/<script[^>]+src="(https?:[^"]+)"/g)].map((m) => m[1]), [], p);
  }
  const xp = readFileSync(join(DIST, 'assets/xp.js'), 'utf8');
  assert.match(xp, /id: 'lg-cta'/);
  const re = new RegExp(xp.match(/pages: '([^']+)'/)![1]);
  assert.ok(re.test('/lectoguide/le-cid/') && !re.test('/lectoguide/') && !re.test('/lectoguide/methode/') && !re.test('/lectoguide/confidentialite/'));
});

test('vendored mesure.js and cro.js are byte-identical to the octave-checkout masters', { skip: !process.env.OCTAVE_CHECKOUT_WEB }, () => {
  for (const f of ['mesure.js', 'cro.js']) assert.equal(readFileSync(join(ROOT, 'src/assets', f), 'utf8'), readFileSync(join(process.env.OCTAVE_CHECKOUT_WEB!, f), 'utf8'), f);
});

test('brand and links: « Lectoguide par READ FRANCE », endorsed line; each guide links to Lectoclasse, Chapter Checks and « lire et prouver sa lecture »', () => {
  for (const [p, h] of Object.entries(html)) {
    const t = text(h);
    assert.match(h, /Lectoguide<small>par READ FRANCE<\/small>/, p);
    assert.match(t, /activité de READ FRANCE, l’éditeur de Vread/, p);
    assert.doesNotMatch(t, /Vread (Lectoguide|Classe|Guide)/, p);
    // Claims we cannot back, in our own words (the guides' literary content is checked against the text instead).
    assert.doesNotMatch(text(h.replace(/<article class="fiche">[\s\S]*?<\/article>/, ' ')), /garanti|certifi|officiel(le)? de|savoir qui a (vraiment )?lu|agréé/i, p);
  }
  for (const g of guides) {
    const h = html[`/${g.slug}/index.html`];
    assert.match(h, /href="https:\/\/outils\.vread\.fr\/lectoclasse\/[^"]*" data-mesure="cta_click"/, g.slug);
    assert.match(h, /href="https:\/\/outils\.vread\.fr\/chapter-checks\/" data-mesure="cta_click"/, g.slug);
    assert.match(h, /href="https:\/\/www\.vread\.fr\/" data-mesure="cta_click">Vread[ \u00a0]: lire et prouver sa lecture<\/a>/, g.slug);
    assert.equal((h.match(/class="ressources cta-haut"/g) || []).length, 1);
  }
});

test('content: every unit summarised, 5 one-word questions, quotes and evidence found word for word in the source text', () => {
  for (const g of guides) {
    assert.ok(g.units.length >= 3 && g.units.every((u: { summary: string }) => u.summary.split(' ').length >= 15), g.slug);
    assert.equal(g.questions.length, 5, g.slug);
    assert.ok(g.passages.length >= 5, g.slug);
    const unitText = (id: string) => norm(readFileSync(join(ROOT, g.units.find((u: { id: string }) => u.id === id).file), 'utf8'));
    for (const p of g.passages) { assert.ok(p.quote.split(' ').length <= 50, `${g.slug} long quote`); assert.ok(unitText(p.unit).includes(norm(p.quote)), `${g.slug}: passage « ${p.quote.slice(0, 50)} »`); }
    for (const q of g.questions) {
      assert.ok(!/\s/.test(q.answer.trim()), `${g.slug} ${q.id} one word`);
      assert.ok(unitText(q.unit).includes(norm(q.evidence)), `${g.slug} ${q.id} evidence`);
    }
    assert.ok(+g.authorDates.split('-')[1] < 1925, `${g.slug}: public domain`);
    assert.match(g.source.url, /^https:\/\/(fr\.wikisource\.org|www\.gutenberg\.org)\//, g.slug);
  }
});

test('a pupil who only reads the page fails the questions: no answer word appears in the rest of the guide', () => {
  const fold = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9-]+/g, ' ');
  for (const g of guides) {
    const rest = ` ${fold([...g.intro, g.programmeNote, ...g.units.map((u: { summary: string }) => u.summary), ...g.passages.flatMap((p: { title: string; quote: string; note: string }) => [p.title, p.quote, p.note]),
      ...g.characters.flatMap((c: { name: string; role: string }) => [c.name, c.role]), ...g.readingTips].join(' '))} `;
    for (const q of g.questions) assert.ok(!rest.includes(` ${fold(q.answer).trim()} `), `${g.slug} ${q.id}: « ${q.answer} » is given away by the guide`);
  }
});

test('engine QA: each guide passed every gate, the summary cold-answer gate included (5/5)', () => {
  for (const g of guides) {
    const f = join(ROOT, 'qa/logs', g.slug, `lectoguide-${g.slug}.qa.json`);
    assert.ok(existsSync(f), `${g.slug}: no QA log`);
    const r = JSON.parse(readFileSync(f, 'utf8'));
    assert.equal(r.coldGate, 'summary', g.slug);
    assert.deepEqual([r.totals.items, r.totals.ok, r.totals.cold.pass], [5, 5, 5], g.slug);
    const items = JSON.parse(readFileSync(join(ROOT, 'qa/items', `${g.slug}.json`), 'utf8')).items;
    assert.deepEqual(items.map((i: { question: string; answer: string }) => [i.question, i.answer]), g.questions.map((q: { question: string; answer: string }) => [q.question, q.answer]), `${g.slug}: page and QA set differ`);
    assert.match(html[`/${g.slug}/index.html`], /un lecteur qui n’avait que les résumés de cette page n’a trouvé aucune des cinq réponses/);
  }
});

test('no thin page, no boilerplate shared by more than 2 guides (editorial checker from chapter-coffee-club)', () => {
  const list = guides.map((g) => ({ slug: g.slug, html: html[`/${g.slug}/index.html`].replace(/<aside[\s\S]*?<\/aside>|<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>/g, ' ') }));
  assert.deepEqual(editorialWarnings(list, { minWords: 900, maxShared: 2 }).filter((w) => !/Chaque réponse tient en un mot|Ces résumés servent|Textes officiels consultés|Fiche écrite par Octave/.test(w.issue)), []);
});

test('anti-AI grid (lint-ia) on every page', { skip: !process.env.LINT_IA }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'lg-lint-'));
  for (const [p, h] of Object.entries(html)) {
    if (p === '/404.html') continue;
    const f = join(dir, p.replace(/\//g, '_') + '.txt');
    writeFileSync(f, text(h.replace(/<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>|<blockquote[\s\S]*?<\/blockquote>/g, ' ')));
    const out = execFileSync('node', [process.env.LINT_IA!, f], { encoding: 'utf8' });
    const score = +(out.match(/(\d+)\s*\/\s*100/) || [])[1]!;
    assert.ok(score >= 85 && /\/100\s+OK/.test(out), `${p}: ${out.slice(0, 500)}`);
  }
});

test('programme: home has the bac, lycée and collège sections; official texts linked where a guide cites them; bac kits link to their Lectoclasse page', () => {
  const home = html['/index.html'];
  for (const id of ['bac', 'lycee', 'college']) assert.match(home, new RegExp(`<h2 id="${id}">`), id);
  for (const g of guides) {
    const h = html[`/${g.slug}/index.html`];
    for (const s of g.programmeSources ?? []) {
      assert.match(s.url, /^https:\/\/(www\.education\.gouv\.fr|eduscol\.education\.gouv\.fr)\//, `${g.slug}: official source`);
      assert.ok(h.includes(`href="${s.url}"`), `${g.slug}: ${s.url}`);
    }
    if (g.programme === 'lycee' || (g.programmeSources ?? []).length) assert.ok((g.programmeSources ?? []).length >= 1, `${g.slug}: sources`);
    assert.match(text(h), /Fiche écrite par Octave, l’assistant IA de READ FRANCE/, `${g.slug}: AI disclosure`);
    if (g.programme === 'bac') assert.ok(h.includes(`href="https://outils.vread.fr/lectoclasse/kits/${g.slug}/"`), `${g.slug}: kit page`);
    assert.doesNotMatch(text(h), /session 2027/i, g.slug);
  }
});
