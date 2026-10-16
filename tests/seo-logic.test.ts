// Adapted from chapter-coffee-club@70ca369 tests/seo/logic.test.ts (tanguywarsmann 193 lines, Claude 138): the cases that
// cover the extracted engine (escaping of the meta block and JSON-LD, lastmod policy, noindex without canonical,
// future pages out of the sitemap, the template injection), rewritten against the SiteConfig API.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMetaBlock, notFoundSeo, type SeoData } from '../seo-engine/metadata.ts';
import { contentLastModified, parseDbDate } from '../seo-engine/dates.ts';
import { sitemapXml } from '../seo-engine/sitemap.ts';
import { renderPage, FALLBACK_TEMPLATE, prepareTemplate } from '../seo-engine/render.ts';
import { llmsTxt } from '../seo-engine/llms.ts';
import { editorialWarnings } from '../seo-engine/editorial.ts';
import { SITE } from '../site.config.ts';

const page = (over: Partial<SeoData> = {}): SeoData => ({ title: 'Titre', description: 'Description', canonical: 'https://outils.vread.fr/lectoguide/x/', ogType: 'article', ...over });

test('JSON-LD and attributes are escaped (no script break-out, no attribute injection)', () => {
  const html = buildMetaBlock(page({ title: '</script><script>alert(1)</script>', ogImage: 'https://example.com/" onload="alert(1)', jsonLd: [{ name: '</script><script>alert(1)</script>' }] }), SITE);
  assert.ok(!html.includes('</script><script>'));
  assert.ok(!html.includes(' onload="'));
  assert.match(html, /\\u003c\/script>/);
});

test('noindex pages carry no canonical; indexable pages carry exactly one', () => {
  const nf = buildMetaBlock(notFoundSeo(SITE), SITE);
  assert.ok(!nf.includes('rel="canonical"') && nf.includes('noindex, nofollow'));
  const ok = buildMetaBlock(page(), SITE);
  assert.equal((ok.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(!ok.includes('hreflang'), 'one site, one language: no hreflang pair');
});

test('lastmod is the publication date unless the content changed more than 24 h later', () => {
  const published = { published_at: '2025-05-10T12:00:00Z', created_at: '2025-05-09T12:00:00Z' };
  assert.equal(contentLastModified({ ...published, updated_at: '2025-05-11T12:00:00Z' }), '2025-05-10T12:00:00.000Z');
  assert.equal(contentLastModified({ ...published, last_modified: '2025-05-10 18:00:00.5' }), '2025-05-10T12:00:00.000Z');
  assert.equal(contentLastModified({ ...published, last_modified: '2026-09-29 16:41:52.999466' }), '2026-09-29T16:41:52.999Z');
  assert.equal(contentLastModified({ ...published, last_modified: '2099-01-01T00:00:00Z' }), null);
  assert.equal(contentLastModified({ published_at: null, created_at: '2025-05-09T12:00:00Z' }), '2025-05-09T12:00:00.000Z');
  assert.equal(contentLastModified({}), null);
  assert.equal(parseDbDate('2026-09-29 16:41:52.999466'), Date.parse('2026-09-29T16:41:52.999Z'));
});

test('future publications and noindex pages stay out of the sitemap; hand-set lastmod wins', () => {
  const xml = sitemapXml([
    { seo: page({ canonical: 'https://outils.vread.fr/lectoguide/a/', lastModified: '2026-10-16' }) },
    { seo: page({ canonical: 'https://outils.vread.fr/lectoguide/b/' }), published_at: '2099-01-01T00:00:00Z' },
    { seo: notFoundSeo(SITE) },
    { seo: page({ canonical: 'https://outils.vread.fr/lectoguide/c/?a=1&b=2' }), published_at: '2025-05-10T12:00:00Z' },
  ], Date.parse('2026-10-16T20:00:00Z'));
  assert.ok(xml.includes('<loc>https://outils.vread.fr/lectoguide/a/</loc><lastmod>2026-10-16</lastmod>'));
  assert.ok(!xml.includes('/b/'));
  assert.ok(xml.includes('?a=1&amp;b=2</loc><lastmod>2025-05-10</lastmod>'));
  assert.equal((xml.match(/<url>/g) || []).length, 2);
});

test('the template keeps one injection point, sheds its baked SEO tags and receives the page', () => {
  assert.equal(prepareTemplate(null), FALLBACK_TEMPLATE);
  assert.ok(prepareTemplate('<html><head></head><body><div id="root"></div></body></html>').includes('<!--SEO_INJECT-->\n</head>'));
  const tpl = '<!doctype html><html lang="en"><head><title>Old</title><meta name="description" content="old"><link rel="canonical" href="x"><!--SEO_INJECT--></head><body><div id="root"></div></body></html>';
  const out = renderPage(tpl, page({ appHtml: '<main><h1>Fiche</h1></main>' }), SITE);
  assert.ok(out.startsWith('<!doctype html><html lang="fr">'));
  assert.equal((out.match(/<title/g) || []).length, 1);
  assert.ok(!out.includes('content="old"') && !out.includes('href="x"'));
  assert.ok(out.includes('<div id="root"><main><h1>Fiche</h1></main></div>'));
});

test('llms.txt is built from the site entity and the page list', () => {
  const t = llmsTxt(SITE, ['Fait A'], [{ title: 'Section', links: [{ name: 'Page', url: 'https://outils.vread.fr/lectoguide/p/', note: 'note' }] }]);
  assert.ok(t.startsWith(`# ${SITE.brand}\n\n> ${SITE.description}`));
  assert.ok(t.includes('- Fait A') && t.includes('- [Page](https://outils.vread.fr/lectoguide/p/) : note'));
});

test('editorial checker flags thin pages, shared boilerplate and keyword-led intros', () => {
  const long = (w: string) => `<p>${Array(950).fill(w).join(' ')}</p>`;
  const shared = '<p>' + Array(30).fill('bloc commun répété').join(' ') + '</p>';
  const w = editorialWarnings([{ slug: 'a', html: long('alpha') + shared }, { slug: 'b', html: long('beta') + shared }, { slug: 'c', html: '<p>' + 'Vous cherchez un résumé ' + Array(40).fill('mot').join(' ') + '</p>' + shared }]);
  assert.ok(w.some((x) => x.slug === 'c' && /mince/.test(x.issue)));
  assert.ok(w.some((x) => /répété/.test(x.issue)));
  assert.ok(w.some((x) => x.slug === 'c' && /mots-clés/.test(x.issue)));
  assert.deepEqual(editorialWarnings([{ slug: 'a', html: long('alpha') }]), []);
});
