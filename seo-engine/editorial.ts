// Adapted from chapter-coffee-club@70ca369 src/seo/editorialPatterns.ts (editorialWarnings: tanguywarsmann, 2026-09-19)
// and scripts/seo/check-editorial.ts (read-only checker, --strict exits 1). Kept: an editorial checker that flags
// automated boilerplate blocks and keyword-led introductions instead of prose about the subject. Changed: the audited
// vread.fr patterns become generic rules for programmatic pages (a paragraph repeated on many pages, an introduction
// that repeats the search query, a page too thin to stand on its own).
export interface EditorialPage { slug: string; html: string }

const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
const paragraphs = (html: string) => [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1])).filter((p) => p.split(' ').length >= 25);

export function editorialWarnings(pages: EditorialPage[], opts: { minWords?: number; maxShared?: number } = {}): Array<{ slug: string; issue: string }> {
  const minWords = opts.minWords ?? 900;
  const maxShared = opts.maxShared ?? 2;
  const out: Array<{ slug: string; issue: string }> = [];
  const seen = new Map<string, string[]>();
  for (const p of pages) for (const para of new Set(paragraphs(p.html))) seen.set(para, [...(seen.get(para) ?? []), p.slug]);
  for (const p of pages) {
    const words = text(p.html).split(' ').length;
    if (words < minWords) out.push({ slug: p.slug, issue: `Page trop mince : ${words} mots (minimum ${minWords})` });
    const shared = paragraphs(p.html).filter((para) => (seen.get(para)?.length ?? 0) > maxShared);
    if (shared.length) out.push({ slug: p.slug, issue: `Bloc répété sur plus de ${maxShared} pages : « ${shared[0]!.slice(0, 80)}… »` });
    const intro = paragraphs(p.html)[0] ?? '';
    if (/^(Vous cherchez|Tu cherches|Si tu cherches|Si vous cherchez|Les requêtes comme)/i.test(intro)) out.push({ slug: p.slug, issue: 'Introduction centrée sur des mots-clés plutôt que sur le sujet' });
  }
  return out;
}
