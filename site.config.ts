// Site configuration of Lectoguide (read by build.ts and the tests).
import type { SiteConfig } from './seo-engine/site.js';

const HOST = process.env.SITE_ORIGIN || 'https://outils.vread.fr';
const BASE = process.env.SITE_BASE || '/lectoguide/';
const CONTACT = 'octave@vread.fr';

export const SITE: SiteConfig = {
  origin: HOST + BASE.replace(/\/$/, ''), base: BASE, brand: 'Lectoguide par READ FRANCE', alternateName: ['Lectoguide'], legalName: 'READ FRANCE',
  locale: 'fr', ogLocale: 'fr_FR', email: CONTACT, organizationId: 'https://outils.vread.fr/#org',
  description: 'Fiches de lecture gratuites des œuvres du domaine public au programme du bac de français et du collège : le texte partie par partie, les passages clés avec leurs références, cinq questions pour vérifier sa lecture.',
  address: { streetAddress: '11 rue Rouvet', postalCode: '75019', addressLocality: 'Paris', addressCountry: 'FR' },
};
