// Adapted from chapter-coffee-club@70ca369 src/seo/metadata.ts (tanguywarsmann 378 lines, Claude 190; 2026-09-19 to
// 2026-10-05). Kept: escapeHtml (verbatim), the SeoData shape, buildMetaBlock (title, description, robots, canonical,
// Open Graph, Twitter card, JSON-LD with `<` escaped, data-rh markers). Changed: the vread.fr / vread-app.com domain
// config and hreflang pair become one SiteConfig (one site, one language); the app's SEO_MAP, blog and noindex routes
// are not copied.
import type { SiteConfig } from './site.js';

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface SeoData {
  lang?: 'fr' | 'en';
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  ogImage?: string;
  jsonLd?: object[];
  noindex?: boolean;
  status?: number;
  /** Dernier vrai changement de contenu (AAAA-MM-JJ) : lastmod du sitemap. */
  lastModified?: string;
  /** HTML injecté dans <div id="root"> (contenu initial) */
  appHtml?: string;
}

export function buildMetaBlock(seo: SeoData, site: SiteConfig): string {
  const t = escapeHtml(seo.title);
  const d = escapeHtml(seo.description);
  const lines: string[] = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
  ];

  if (seo.noindex) {
    lines.push(`<meta name="robots" content="noindex, nofollow" />`);
  } else {
    lines.push(`<meta name="robots" content="index, follow" />`);
    lines.push(`<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`);
  }

  // Open Graph
  lines.push(`<meta property="og:title" content="${t}" />`);
  lines.push(`<meta property="og:description" content="${d}" />`);
  lines.push(`<meta property="og:type" content="${seo.ogType}" />`);
  if (seo.canonical) lines.push(`<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`);
  lines.push(`<meta property="og:locale" content="${site.ogLocale}" />`);
  const image = seo.ogImage ?? site.ogImage;
  if (image) lines.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
  lines.push(`<meta property="og:site_name" content="${escapeHtml(site.brand)}" />`);

  // Twitter
  lines.push(`<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`);
  lines.push(`<meta name="twitter:title" content="${t}" />`);
  lines.push(`<meta name="twitter:description" content="${d}" />`);
  if (image) lines.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);

  // JSON-LD
  if (seo.jsonLd) {
    for (const ld of seo.jsonLd) {
      lines.push(
        `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`
      );
    }
  }

  return lines.join("\n    ").replace(/<(title|meta|link|script)\b/g, '<$1 data-rh="true"');
}

export function notFoundSeo(site: SiteConfig): SeoData {
  return { title: `404 – Page introuvable | ${site.brand}`, description: "La page que vous cherchez n'existe pas.",
    canonical: '', ogType: 'website', noindex: true, status: 404, lang: site.locale,
    appHtml: `<main><h1>Page introuvable</h1><p>La page que vous cherchez n’existe pas.</p><a href="${site.base}">Accueil</a></main>`,
  };
}
