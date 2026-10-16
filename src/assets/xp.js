/* Lectoguide A/B test (read by cro.js, which loads after this file), guide pages only, by calendar day (Paris).
 * a = the box of READ FRANCE resources (Lectoclasse, Chapter Checks, Lectopoint, Vread) after the five questions only;
 * b = the same box also right after the introduction. ?cta=a|b forces one. Metric: first CTA click (built in). */
window.OCTAVE_XP = [{
  id: 'lg-cta',
  variants: ['a', 'b'],
  mode: 'day',
  tz: 'Europe/Paris',
  param: 'cta',
  pages: '^/lectoguide/(?!methode/|confidentialite/|mentions-legales/)[a-z0-9-]+/$',
}];
