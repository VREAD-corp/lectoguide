// Adapted from chapter-coffee-club@70ca369 api/render.ts (gpt-engineer-app 132 lines, tanguywarsmann 295, Claude 13; from
// 2026-03-05). Kept: the fallback template, the <!--SEO_INJECT--> marker (added before </head> when a template lacks it),
// the sanitizer that strips every SEO tag baked into the template before injection (same regex list), the injection of
// the meta block and of the initial HTML into <div id="root">, and setHtmlLang (verbatim). Changed: it is a pure
// function run at build time for each page (static prerender for GitHub Pages) instead of a Vercel handler; no Supabase
// fetch, no domain redirects, no bootstrap JSON for a SPA.
import { buildMetaBlock, type SeoData } from './metadata.js';
import type { SiteConfig } from './site.js';

export const FALLBACK_TEMPLATE = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><!--SEO_INJECT--></head><body><div id="root"></div></body></html>`;

export function setHtmlLang(html: string, locale: string): string {
  return html.replace(/<html\b([^>]*)>/i, (_match, attrs: string) => {
    const cleanAttrs = attrs.replace(/\s+lang=(["']).*?\1/i, "");
    return `<html${cleanAttrs} lang="${locale}">`;
  });
}

export function prepareTemplate(content: string | null | undefined): string {
  if (!content) return FALLBACK_TEMPLATE;
  if (content.includes("<!--SEO_INJECT-->")) return content;
  // Template found but missing marker — inject it
  return content.replace("</head>", "<!--SEO_INJECT-->\n</head>");
}

export function sanitizeTemplate(template: string): string {
  // Strip all SEO tags baked into the template to avoid duplicates with injected metaBlock
  return template
    .replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<link\s+rel=["']alternate["'][^>]*>\s*/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<title\b[^>]*>[^<]*<\/title>\s*/gi, "")
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+property=["']og:[^"']*["'][^>]*>\s*/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>\s*/gi, "")
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[^<]*<\/script>\s*/gi, "");
}

export function renderPage(template: string, seo: SeoData, site: SiteConfig): string {
  const templateSanitized = sanitizeTemplate(prepareTemplate(template));
  const metaBlock = buildMetaBlock(seo, site);
  let htmlOut = templateSanitized.replace("<!--SEO_INJECT-->", () => metaBlock);
  if (seo.appHtml) {
    htmlOut = htmlOut.replace('<div id="root"></div>', () => `<div id="root">${seo.appHtml}</div>`);
  }
  return setHtmlLang(htmlOut, seo.lang || site.locale);
}
