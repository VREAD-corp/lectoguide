/* Lectoguide A/B tests (read by cro.js, which loads after this file).
 * lg-cta: guide pages only, by calendar day (Paris). a = the box of READ FRANCE resources (Lectoclasse, Chapter Checks,
 *   Lectopoint, Vread) after the five questions only; b = the same box also right after the introduction. ?cta=a|b forces
 *   one. Metric: first CTA click (built in).
 * rd-hero: POOLED-READING-01 (2026-10-19): hero a = current, b = first screen shows a real excerpt of the deliverable.
 *   Same id on the 7 reading sites, pooled analysis in vread-revenue-lab. ?hero=b forces b. Home only: b shows two key
 *   passages and two questions of the Candide guide (style.css hides them in a). Metric: first CTA click (a guide card,
 *   the excerpt's link or a READ FRANCE resource); secondary goal 'sample' = the excerpt's link to the full guide. */
window.OCTAVE_XP = [{
  id: 'lg-cta',
  variants: ['a', 'b'],
  mode: 'day',
  tz: 'Europe/Paris',
  param: 'cta',
  pages: '^/lectoguide/(?!methode/|confidentialite/|mentions-legales/)[a-z0-9-]+/$',
}, {
  id: 'rd-hero',
  variants: ['a', 'b'],
  mode: 'tab',
  param: 'hero',
  pages: '^/lectoguide/$',
}];
/* Goal 'sample': a click on a link marked data-sample (no inline handler: the CSP allows scripts from this site only). */
document.addEventListener('click', function (e) {
  var a = e.target && e.target.closest ? e.target.closest('[data-sample]') : null;
  if (a && window.octaveCro) window.octaveCro.goal('sample');
}, true);
