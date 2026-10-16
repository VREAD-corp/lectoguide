// Adapted from chapter-coffee-club@70ca369 api/sitemap.xml.ts (gpt-engineer-app 7 lines, tanguywarsmann 25, Claude 2;
// from 2025-09-18). Kept: one <url> per canonical, self-canonical page; noindex and future pages left out; lastmod is the
// hand-maintained date of the last real content change (static pages) or the publication date unless the content
// really changed more than 24 h later (contentLastModified), never a blanket bump at each deploy. Changed: written to a
// file at build time instead of served by a Vercel function.
import { contentLastModified } from './dates.js';
import { escapeXml, isPublishedNow } from './publication.js';
import type { SeoData } from './metadata.js';

export interface SitemapPage { seo: SeoData; published_at?: string | null; last_modified?: string | null }

export function sitemapXml(pages: SitemapPage[], now = Date.now()): string {
  const entries = pages
    .filter((p) => !p.seo.noindex && p.seo.canonical && isPublishedNow({ slug: p.seo.canonical, published_at: p.published_at }, now))
    .map((p) => {
      const date = p.seo.lastModified ?? contentLastModified({ published_at: p.published_at, last_modified: p.last_modified }, now)?.slice(0, 10);
      return `<url><loc>${escapeXml(p.seo.canonical)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('\n')}</urlset>\n`;
}
