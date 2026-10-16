// Copied from chapter-coffee-club@70ca369 src/seo/dates.ts (tanguywarsmann, 2026-10-02). Unchanged.
const DAY_MS = 24 * 60 * 60 * 1000;

/** `last_modified` is `timestamp without time zone` in Postgres: PostgREST
 * serialises it without an offset, which JavaScript would read as local time. */
export function parseDbDate(value: string | null | undefined): number | null {
  if (!value) return null;
  const normalised = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`;
  const time = Date.parse(normalised);
  return Number.isFinite(time) ? time : null;
}

export interface ModifiedRow {
  published_at?: string | null; created_at?: string | null;
  updated_at?: string | null; last_modified?: string | null;
}

/** Date to advertise as the last content change (sitemap lastmod, JSON-LD
 * dateModified). Only a modification more than 24 hours after publication
 * counts: a same-day touch-up is not a reason for Google to re-crawl, and a
 * blanket bump would teach it to ignore the signal altogether. */
export function contentLastModified(row: ModifiedRow, now = Date.now()): string | null {
  const published = parseDbDate(row.published_at) ?? parseDbDate(row.created_at);
  const modified = parseDbDate(row.last_modified) ?? parseDbDate(row.updated_at);
  const candidate = modified !== null && (published === null || Math.abs(modified - published) > DAY_MS) ? modified : published ?? modified;
  if (candidate === null || candidate > now) return null;
  return new Date(candidate).toISOString();
}
