# Lectoguide par READ FRANCE

Free reading guides at **https://outils.vread.fr/lectoguide/** for public-domain works on French school programmes: the
8 public-domain works of the bac de français (épreuve anticipée de juin 2027; BO n° 30 of 24 July 2025), lycée classics
(seconde: Phèdre, Le Malade imaginaire, Candide, Le Dernier Jour d'un condamné) and collège classics (26 guides on
2026-10-17; 34 on 2026-10-21 with La Parure, Un cœur simple, Cyrano de Bergerac, Zadig, L'Île des esclaves, Le Jeu de
l'amour et du hasard, Pierre et Jean and Tartuffe, picked from public Google suggestions such as « fiche de lecture <titre> »
and « <titre> résumé par chapitre »). `programme` is `bac`, `lycee` or `college`; `programmeSources` lists the official texts behind
`programmeNote` (education.gouv.fr BO pages, éduscol), shown on the page with the date they were checked. Each guide: the text unit by unit (one summary per chapter, act, letter, soir, poem or part), 5–6 key
passages quoted word for word with their reference, and 5 one-word comprehension questions in Vread's checkpoint format,
validated by READ FRANCE's reading engine. Bac guides link to their Lectoclasse kit page (`/lectoclasse/kits/<slug>/`). Links to Lectoclasse, Chapter Checks, Lectopoint and vread.fr.

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
npm run e2e   # Chromium 390 / 1440 px, ?octave_notrack=1; BASE_URL=https://outils.vread.fr/lectoguide/ for live
E=../vread-reading-engine/bin/reading-engine.mjs
node $E qa qa/items/le-cid.json --gate summary --cold qa/cold/le-cid.answers.jsonl --out qa/logs/le-cid
```

## Measurement

`mesure.js` (v:2, cookieless) and `cro.js`, byte-identical to `octave-checkout/gas/web`, to the octave-checkout Apps
Script (site `lectoguide`). `cta_click` = a link to Lectoclasse, Chapter Checks, Lectopoint or vread.fr. A/B `lg-cta`
(by day): the « Pour la classe » box after the questions only (a) or also after the introduction (b); metric `cta`. A/B `rd-hero`
(POOLED-READING-01, by tab, home only, same id on the 7 reading sites of outils.vread.fr, pooled analysis in
vread-revenue-lab): current hero (a) or a verbatim excerpt of the Candide guide in the first screen (b); metric `cta`
(a guide card, the excerpt's link or a READ FRANCE resource; cards carry `data-cta`), goal `sample` (`data-sample`).

## SEO (2026-10-18)

Inner pages carry a breadcrumb from the hub (outils.vread.fr › Lectoguide › …, visible + BreadcrumbList). Guides: Article
+ LearningResource, author READ FRANCE SAS with `url` https://outils.vread.fr/a-propos/ (the hub page on who writes and
who publishes); the Octave disclosure stays on every guide. Home: visible « Questions fréquentes » = FAQPage. Cluster
inside the reading group: each guide links its Lectoclasse kit (`/lectoclasse/kits/<slug>/`) and its Lectopoint text
(`/lectopoint/?texte=<slug>`, `LECTOPOINT_PART` for a tale of a collection). Sitemap lastmod = date of the last content
change (`updated` of each guide; `SEO_UPDATED` for the home, method and privacy pages).

© 2026 READ FRANCE SAS. See LICENSE.
