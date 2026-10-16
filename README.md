# Lectoguide par READ FRANCE

Free reading guides at **https://outils.vread.fr/lectoguide/** for public-domain works on French school programmes: the
8 public-domain works of the bac de français (épreuve anticipée de juin 2027, session 2028; BO n° 30 of 24 July 2025) and
collège classics. Each guide: the text unit by unit (one summary per chapter, act, letter, soir, poem or part), 5–6 key
passages quoted word for word with their reference, and 5 one-word comprehension questions in Vread's checkpoint format,
validated by READ FRANCE's reading engine. Links to Lectoclasse, Chapter Checks, Lectopoint and vread.fr.

## The SEO engine (historical reuse)

`seo-engine/` is chapter-coffee-club's SSR/SEO engine (vread.fr), copied from its pre-Octave snapshot `70ca369`
(2026-10-05) and adapted to prerender a static site: `render.ts` (template injection, from `api/render.ts`),
`metadata.ts` (meta block and JSON-LD), `entity.ts` (Organization / WebSite / BreadcrumbList / WebPage), `dates.ts`
(lastmod policy, verbatim), `sitemap.ts`, `llms.ts`, `editorial.ts` (editorial checker), `template.html`. Details, blob
hashes and line authors: [PROVENANCE.md](PROVENANCE.md). chapter-coffee-club itself was not modified.

## Content and QA

- `sources/<slug>/`: the Wikisource text cut into units, with `SOURCE.md` (edition, licence, how it was cut).
- `content/guides/<slug>.json`: the guide, written offline from the text (no LLM at runtime).
- `qa/`: the engine item set per guide, the summaries, the cold-answer prompts and answers (summary gate: an
  independent non-reader holding only the guide's summaries), and the engine logs. Every guide: 5/5 pass.

```sh
npm test      # build + SEO logic tests + site/content checks (quotes found in the sources, QA logs 5/5, no thin page)
OCTAVE_CHECKOUT_WEB=../octave-checkout/gas/web LINT_IA=../vread-revenue-lab/content/lint-ia.mjs CHAPTER_COFFEE_CLUB=../chapter-coffee-club npm test
npm run e2e   # Chromium 390 / 1280 px, ?octave_notrack=1; BASE_URL=https://outils.vread.fr/lectoguide/ for live
E=../vread-reading-engine/bin/reading-engine.mjs
node $E qa qa/items/le-cid.json --gate summary --cold qa/cold/le-cid.answers.jsonl --out qa/logs/le-cid
```

## Measurement

`mesure.js` (v:2, cookieless) and `cro.js`, byte-identical to `octave-checkout/gas/web`, to the octave-checkout Apps
Script (site `lectoguide`). `cta_click` = a link to Lectoclasse, Chapter Checks, Lectopoint or vread.fr. A/B `lg-cta`
(by day): the « Pour la classe » box after the questions only (a) or also after the introduction (b); metric `cta`.

© 2026 READ FRANCE SAS. See LICENSE.
