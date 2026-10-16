# Provenance of the SEO engine (`seo-engine/`)

Source: **VREAD-corp/chapter-coffee-club**, the code of vread.fr, at its last pre-Octave snapshot
**`70ca3698203844e58d6b427ff5961decb300e76b`** (2026-10-05). The founder's rule: only what existed before 2026-10-09 is
historical. Files were read with `git show 70ca369:<path>` and copied by hand into this new repository: no fork, no
history, no `.env`, and **chapter-coffee-club was not modified** (it deploys vread.fr). Component H12 (SSR/SEO engine)
and H13 (editorial checker) of `octave-asset-ventures/assets/ASSETS.md`. Line authors from `git blame 70ca369`.

| Lectoguide file | Status | chapter-coffee-club source @70ca369 | Blob | First → last commit before snapshot | Line authors | What was kept / changed |
|---|---|---|---|---|---|---|
| `seo-engine/dates.ts` | verbatim | `src/seo/dates.ts` | `8b3efd485441` | d131decb 2026-10-02 | tanguywarsmann 27 | unchanged (lastmod policy: `parseDbDate`, `contentLastModified`) |
| `seo-engine/metadata.ts` | adapted | `src/seo/metadata.ts` | `f4353af30685` | cd6f6fba 2026-09-19 → a888019d 2026-10-05 | tanguywarsmann 378, Claude 190 | `escapeHtml` verbatim; `SeoData`; `buildMetaBlock` (robots, canonical, OG, Twitter, JSON-LD with `<` escaped, `data-rh`) on a `SiteConfig`; hreflang pair, app routes and SEO_MAP not copied; `notFoundSeo` adapted |
| `seo-engine/entity.ts` | adapted | `src/seo/entity.ts` | `b89afaadec35` | d37671e0 → a888019d 2026-10-05 | Claude 260 (for the founder) | stable `@id`s; `organizationSchema`, `webSiteSchema`, `breadcrumbSchema`, `webPageSchema` on a `SiteConfig`; Vread figures, app schema, store ratings, mascot not copied |
| `seo-engine/publication.ts` | excerpt | `src/seo/publication.ts` | `cbf55be78ecd` | cd6f6fba 2026-09-19 → d131decb 2026-10-02 | tanguywarsmann 31 | `isPublishedNow`, `escapeXml` verbatim; blog URL helpers not copied |
| `seo-engine/render.ts` | adapted | `api/render.ts` | `55a7048f767d` | 81febb28 2026-03-05 → a888019d 2026-10-05 | gpt-engineer-app 132, tanguywarsmann 295, Claude 13 | fallback template, `SEO_INJECT` marker logic, template sanitizer (same 8 regexes), meta + root injection, `setHtmlLang` verbatim; build-time function instead of a Vercel handler; no Supabase, redirects or SPA bootstrap |
| `seo-engine/template.html` | adapted | `api/_template.html` | `a5a34dc7b828` | 81febb28 2026-03-05 → a888019d 2026-10-05 | gpt-engineer-app 40, tanguywarsmann 25, Claude 5, Vin-CC 1 | same shell (charset, viewport, theme colour, icon, SEO fallback stripped at render, `SEO_INJECT`, `#root`); no GA, SPA bundle, fonts or Vread icons |
| `seo-engine/sitemap.ts` | adapted | `api/sitemap.xml.ts` | `67f57b774658` | 7fe93fd1 2025-09-18 → d37671e0 2026-10-05 | gpt-engineer-app 7, tanguywarsmann 25, Claude 2 | one `<url>` per canonical page, noindex and future pages out, hand-set lastmod or `contentLastModified`; written at build time |
| `seo-engine/llms.ts` | adapted | `api/llms.txt.ts` | `0b26fda21a4c` | d37671e0 → a888019d 2026-10-05 | Claude 61 | llms.txt built from the entity data (title, definition, facts, reference pages) |
| `seo-engine/editorial.ts` | adapted | `src/seo/editorialPatterns.ts` (`editorialWarnings`) + `scripts/seo/check-editorial.ts` | `91c12f5fc88f`, `d447c77c1f64` | 7b60c7ad 2026-09-19 → a888019d 2026-10-05 | tanguywarsmann 35 + 10, Claude 20 | editorial checker (automated boilerplate, keyword-led intros); vread.fr's audited patterns replaced by generic rules (thin page, block shared by many pages) |
| `tests/seo-logic.test.ts` | adapted | `tests/seo/logic.test.ts` | `8b115fd89740` | 79ed5105 2026-09-19 → a888019d 2026-10-05 | tanguywarsmann 193, Claude 138 | the escaping, lastmod, noindex/canonical, sitemap and template cases, rewritten for `SiteConfig`; the lastmod assertions are verbatim |

`seo-engine/site.ts` and `site.config.ts` are new (the per-site configuration that replaces the hard-coded vread.fr
constants). Authors: tanguywarsmann is the founder; Claude lines are the team's AI-assisted work before 2026-10-09;
gpt-engineer-app is Lovable, whose terms leave generated code to the customer. No outside-contractor line was copied
(Virgile Rietsch / Algomax and samir have no line in these files at the snapshot).

Not used: `api/robots.txt.ts` (a site under outils.vread.fr/<repo>/ cannot serve /robots.txt; the hub's robots.txt and
sitemap index list this site's sitemap), `src/seo/canonicalPolicy.ts`, `editorial.ts` (blog patches), `articleContent.ts`
(needs `sanitize-html`; our pages are generated from JSON, not from CMS HTML).

`tests/provenance.test.ts` re-checks the verbatim parts against the snapshot when `CHAPTER_COFFEE_CLUB` points to a checkout.
