// Adapted from chapter-coffee-club@70ca369 src/seo/publication.ts (tanguywarsmann, 2026-09-19 / 10-02). Kept verbatim:
// isPublishedNow (a future date stays out of the sitemap) and escapeXml. The blog-specific URL helpers are not copied.
export interface PublishedRow {
  slug: string; published_at?: string | null; created_at?: string | null;
  updated_at?: string | null; last_modified?: string | null; canonical_url?: string | null; title?: string | null;
}
export function isPublishedNow(row: PublishedRow, now = Date.now()): boolean {
  return !row.published_at || Date.parse(row.published_at) <= now;
}
export function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
