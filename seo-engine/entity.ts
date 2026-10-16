// Adapted from chapter-coffee-club@70ca369 src/seo/entity.ts (Claude, 2026-10-05, for the founder). Kept: one source of
// truth for the entity, stable @id identifiers so that every page describes the same organisation, and the builders
// organizationSchema, webSiteSchema, breadcrumbSchema and webPageSchema (same fields). Changed: the Vread constants
// (domains, App Store, figures, mascot, ratings) become a SiteConfig; the app schema and the dated app figures are not
// copied (no app figure may describe another product). No aggregateRating anywhere.
import type { SiteConfig } from './site.js';

export function organizationSchema(site: SiteConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': site.organizationId,
    name: site.legalName + ' SAS',
    legalName: site.legalName,
    url: 'https://outils.vread.fr/',
    ...(site.logo ? { logo: site.logo } : {}),
    email: site.email,
    address: { '@type': 'PostalAddress', ...site.address },
    contactPoint: { '@type': 'ContactPoint', email: site.email, contactType: 'customer service', availableLanguage: ['French'] },
    ...(site.sameAs?.length ? { sameAs: site.sameAs } : {}),
  };
}

export function webSiteSchema(site: SiteConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.origin}/#website`,
    name: site.brand,
    ...(site.alternateName?.length ? { alternateName: site.alternateName } : {}),
    url: `${site.origin}/`,
    inLanguage: site.locale,
    description: site.description,
    publisher: { '@id': site.organizationId },
  };
}

export function breadcrumbSchema(site: SiteConfig, items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: `${site.origin}${item.path}`,
    })),
  };
}

export function webPageSchema(site: SiteConfig, options: { type?: 'WebPage' | 'AboutPage' | 'CollectionPage'; path: string; name: string; description: string; dateModified?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': options.type || 'WebPage',
    '@id': `${site.origin}${options.path}#webpage`,
    url: `${site.origin}${options.path}`,
    name: options.name,
    description: options.description,
    inLanguage: site.locale,
    isPartOf: { '@id': `${site.origin}/#website` },
    publisher: { '@id': site.organizationId },
    ...(options.dateModified ? { dateModified: options.dateModified } : {}),
  };
}
