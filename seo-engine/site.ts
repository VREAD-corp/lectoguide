// NEW (Octave for READ FRANCE SAS, 2026-10-16). The per-site configuration that replaces the constants chapter-coffee-club
// hard-coded for vread.fr / vread-app.com (FR_DOMAIN, EN_DOMAIN, BRAND, LEGAL_NAME… in src/seo/entity.ts), so that the
// extracted engine can serve a site of its own. One site, one language: no hreflang pair.
export interface SiteConfig {
  /** Origin + base path, no trailing slash: https://outils.vread.fr/lectoguide */
  origin: string;
  base: string;
  brand: string;
  alternateName?: string[];
  legalName: string;
  locale: 'fr' | 'en';
  ogLocale: string;
  description: string;
  email: string;
  address: { streetAddress: string; postalCode: string; addressLocality: string; addressCountry: string };
  organizationId: string;
  logo?: string;
  sameAs?: string[];
  ogImage?: string;
}
