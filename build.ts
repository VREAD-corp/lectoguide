// Builds the static site into dist/ (GitHub Pages, https://outils.vread.fr/lectoguide/) with the SEO engine extracted
// from chapter-coffee-club (seo-engine/, provenance in PROVENANCE.md): every page is prerendered through
// seo-engine/render.ts into seo-engine/template.html, with its meta block, JSON-LD, sitemap entry and llms.txt line.
// Env: SITE_BASE (default /lectoguide/), SITE_ORIGIN (default https://outils.vread.fr), OUT (default dist).
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from './seo-engine/render.js';
import { notFoundSeo, type SeoData } from './seo-engine/metadata.js';
import { breadcrumbSchema, organizationSchema, webPageSchema, webSiteSchema } from './seo-engine/entity.js';
import { sitemapXml, type SitemapPage } from './seo-engine/sitemap.js';
import { llmsTxt } from './seo-engine/llms.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(ROOT, process.env.OUT || 'dist');
const BASE = process.env.SITE_BASE || '/lectoguide/';
const HOST = process.env.SITE_ORIGIN || 'https://outils.vread.fr';
const TRACK_API = 'https://script.google.com/macros/s/AKfycbzD1IRL8QALluKGZxgGiORFP6-DkC_qFJYR9aOxZiimxa06nbCqpzUI-9iLblp6V2VY/exec';
const UPDATED = '2026-10-16';
const CONTACT = 'octave@vread.fr';

import { SITE } from './site.config.js';

type Unit = { id: string; label: string; file: string; words: number; summary: string };
type Guide = {
  slug: string; title: string; author: string; authorDates: string; published: string; genre: string; programme: 'bac' | 'college';
  level: string; programmeNote: string; source: { label: string; url: string; licence: string }; words: number; units: Unit[];
  intro: string[]; characters: { name: string; role: string }[]; passages: { unit: string; ref: string; title: string; quote: string; note: string }[];
  questions: { id: string; unit: string; ref: string; question: string; answer: string; evidence: string }[]; readingTips: string[]; updated: string;
};

const BAC_ORDER = ['pot-bouille', 'therese-raquin', 'servitude-volontaire', 'pluralite-des-mondes', 'lettres-d-une-peruvienne', 'le-menteur', 'on-ne-badine-pas-avec-l-amour', 'cahier-de-douai'];
const guides: Guide[] = readdirSync(join(ROOT, 'content/guides')).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(ROOT, 'content/guides', f), 'utf8')) as Guide)
  .sort((a, b) => (a.programme === b.programme ? 0 : a.programme === 'bac' ? -1 : 1) || ((BAC_ORDER.indexOf(a.slug) + 1 || 99) - (BAC_ORDER.indexOf(b.slug) + 1 || 99)) || a.title.localeCompare(b.title, 'fr'));

/** QA status of a guide, read from the engine's log (qa/logs/<slug>/<slug>.qa.json): only a full pass is shown. */
function qaOf(slug: string) {
  const f = join(ROOT, 'qa/logs', slug, `lectoguide-${slug}.qa.json`);
  if (!existsSync(f)) return null;
  const r = JSON.parse(readFileSync(f, 'utf8'));
  return { items: r.totals.items as number, ok: r.totals.ok as number, coldPass: r.totals.cold.pass as number, gate: r.coldGate as string, engine: r.engine as string };
}

// Lectoclasse sells kits on these works (non-EU schools); Le Menteur's kit is free. Lectopoint has these texts in its library.
const LECTOCLASSE_KITS = new Set(['pot-bouille', 'therese-raquin', 'servitude-volontaire', 'pluralite-des-mondes', 'lettres-d-une-peruvienne', 'on-ne-badine-pas-avec-l-amour', 'cahier-de-douai']);
const LECTOPOINT_TEXTS = new Set(JSON.parse(readFileSync(join(ROOT, 'content/lectopoint-texts.json'), 'utf8')) as string[]);

const u = (p = '') => BASE + p.replace(/^\//, '');
const abs = (p = '') => SITE.origin + '/' + p.replace(/^\//, '');
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ');
const hours = (w: number) => { const m = Math.round(w / 230); return m < 60 ? `${Math.max(5, Math.round(m / 5) * 5)} minutes` : `${Math.round(m / 30) / 2} h`.replace('.', ','); };
const typo = (html: string) => html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/).map((part, i) => (i % 2 ? part
  : part.replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« '))).join('');
const byUnit = (g: Guide) => {
  const l = g.units[0]?.label ?? '';
  if (/^chapitre/i.test(l)) return 'chapitre par chapitre';
  if (/^acte/i.test(l)) return 'acte par acte';
  if (/soir/i.test(l) || /préface/i.test(l)) return 'soir par soir';
  if (/^lettres?/i.test(l)) return 'lettre par lettre';
  if (g.slug === 'cahier-de-douai') return 'poème par poème';
  return 'partie par partie';
};
const progLabel = (g: Guide) => (g.programme === 'bac' ? 'Bac de français, épreuve anticipée de juin 2027' : 'Collège');

const LOGO = `<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path d="M4 7c4-1.5 8-1.5 12 1 4-2.5 8-2.5 12-1v18c-4-1.5-8-1.5-12 1-4-2.5-8-2.5-12-1z" fill="#FAF6EF" stroke="#2D251F" stroke-width="2" stroke-linejoin="round"/><path d="M16 8v18" stroke="#2D251F" stroke-width="1.6"/><path d="M19 14l2.5 2.5L26 12" fill="none" stroke="#5B3A29" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const NAV: [string, string][] = [['', 'Les fiches'], ['methode/', 'La méthode']];
const shell = (path: string, body: string) => typo(`<a class="skip" href="#main">Aller au contenu</a>
<header class="site"><div class="wrap">
<a class="brand" href="${u('')}">${LOGO}<span>Lectoguide<small>par READ FRANCE</small></span></a>
<nav aria-label="Principale"><ul>${NAV.map(([p, t]) => `<li><a href="${u(p)}"${p === path ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul></nav>
</div></header>
<main id="main"><div class="wrap">
${body}
</div></main>
<footer class="site"><div class="wrap">
<p><strong>Lectoguide</strong> est une activité de READ FRANCE, l’éditeur de Vread. READ FRANCE SAS, 11 rue Rouvet, 75019 Paris. Contact : <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>
<p>Fiches gratuites, sans compte. Ressource privée, sans lien avec le ministère de l’Éducation nationale. Les œuvres sont dans le domaine public ; les fiches sont © 2026 READ FRANCE SAS.</p>
<ul><li><a href="${u('methode/')}">Comment les fiches sont faites</a></li><li><a href="${u('confidentialite/')}">Confidentialité</a></li><li><a href="${u('mentions-legales/')}">Mentions légales</a></li><li><a href="https://outils.vread.fr/lectopoint/">Lectopoint, les points de contrôle à imprimer</a></li></ul>
</div></footer>`);

function ressources(g: Guide, where: 'haut' | 'bas') {
  const lc = g.slug === 'le-menteur'
    ? `<li><a href="https://outils.vread.fr/lectoclasse/echantillon/" data-mesure="cta_click">Lectoclasse : le kit complet du Menteur, gratuit</a> (questions par acte, corrigé, fiche d’oral, texte intégral à imprimer).</li>`
    : LECTOCLASSE_KITS.has(g.slug)
      ? `<li><a href="https://outils.vread.fr/lectoclasse/" data-mesure="cta_click">Lectoclasse : le kit de lecture ${g.slug === 'cahier-de-douai' ? 'du Cahier de Douai' : 'de cette œuvre'}</a>, questions et corrigés prêts à imprimer, pour les établissements français hors Union européenne.</li>`
      : `<li><a href="https://outils.vread.fr/lectoclasse/college/" data-mesure="cta_click">Lectoclasse au collège</a> : un rallye-lecture de 12 classiques, avec un exemple gratuit sur Le Petit Poucet.</li>`;
  const lp = LECTOPOINT_TEXTS.has(g.slug)
    ? `<li><a href="https://outils.vread.fr/lectopoint/?texte=${g.slug}" data-mesure="cta_click">Lectopoint : vos propres points de contrôle sur ce texte</a>, découpé en parties, à imprimer (gratuit).</li>`
    : `<li><a href="https://outils.vread.fr/lectopoint/" data-mesure="cta_click">Lectopoint</a> : collez un texte du domaine public et préparez un point de contrôle par partie, à imprimer (gratuit).</li>`;
  return `<aside class="ressources ${where === 'haut' ? 'cta-haut' : 'cta-bas'}" aria-label="Ressources READ FRANCE">
<h2>${where === 'haut' ? 'Pour la classe' : 'Aller plus loin avec READ FRANCE'}</h2>
<ul>${lc}${lp}
<li><a href="https://outils.vread.fr/chapter-checks/" data-mesure="cta_click" hreflang="en">Chapter Checks</a> : le même travail en anglais, pour les classiques étudiés aux États-Unis (AP Literature).</li>
<li><a href="https://www.vread.fr/" data-mesure="cta_click">Vread : lire et prouver sa lecture</a>. L’application pose une question toutes les 30 à 40 pages du livre que vous lisez.</li></ul>
</aside>`;
}

function guidePage(g: Guide): { seo: SeoData; published_at: string } {
  const path = `${g.slug}/`;
  const qa = qaOf(g.slug);
  const qaOk = qa && qa.items === 5 && qa.ok === 5 && qa.coldPass === 5 && qa.gate === 'summary';
  const unitWord = byUnit(g);
  const prog = progLabel(g);
  const others = guides.filter((x) => x.programme === g.programme && x.slug !== g.slug);
  const title = `${g.title} (${g.author}) : résumé ${unitWord}, passages clés, questions`;
  const description = `${g.title} de ${g.author} (${g.published}) : le texte ${unitWord} en ${g.units.length} résumés, ${g.passages.length} passages clés avec leur référence et 5 questions pour vérifier sa lecture. ${prog}.`;
  const body = `<nav class="fil" aria-label="Fil d’Ariane"><a href="${u('')}">Les fiches</a> › <a href="${u('')}#${g.programme}">${g.programme === 'bac' ? 'Bac de français' : 'Collège'}</a> › ${esc(g.title)}</nav>
<article class="fiche">
<h1>${esc(g.title)}, de ${esc(g.author)}</h1>
<p class="chapeau">Guide de lecture : le texte ${unitWord}, les passages à connaître et cinq questions pour vérifier qu’on a lu.</p>
<dl class="carte">
<div><dt>Auteur</dt><dd>${esc(g.author)} (${esc(g.authorDates)})</dd></div>
<div><dt>Publication</dt><dd>${esc(g.published)}</dd></div>
<div><dt>Genre</dt><dd>${esc(g.genre)}</dd></div>
<div><dt>Longueur</dt><dd>${nf(g.words)} mots, environ ${hours(g.words)} de lecture</dd></div>
<div><dt>Niveau</dt><dd>${esc(g.level)}</dd></div>
</dl>
<p class="programme"><strong>${prog}.</strong> ${esc(g.programmeNote)}</p>
${g.intro.map((p) => `<p>${esc(p)}</p>`).join('\n')}
${ressources(g, 'haut')}
<h2 id="avant">Avant de lire</h2>
<ul>${g.readingTips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<h2 id="personnages">${g.slug === 'servitude-volontaire' || g.slug === 'cahier-de-douai' ? 'Les noms à connaître' : 'Les personnages'}</h2>
<dl class="perso">${g.characters.map((c) => `<div><dt>${esc(c.name)}</dt><dd>${esc(c.role)}</dd></div>`).join('')}</dl>
<h2 id="resume">Le texte ${unitWord}</h2>
<p class="small">Ces résumés servent à se repérer pendant la lecture ou à retrouver un passage. Ils ne remplacent pas le texte : les questions plus bas portent sur des détails qu’ils ne donnent pas.</p>
${g.units.map((x) => `<section class="unite" id="${esc(x.id)}"><h3>${esc(x.label)} <small>${nf(x.words)} mots</small></h3><p>${esc(x.summary)}</p></section>`).join('\n')}
<h2 id="passages">Les passages clés</h2>
${g.passages.map((p) => `<section class="passage"><h3>${esc(p.title)} <small>${esc(p.ref)}</small></h3><blockquote><p>« ${esc(p.quote)} »</p></blockquote><p>${esc(p.note)}</p></section>`).join('\n')}
<h2 id="questions">Cinq questions pour vérifier sa lecture</h2>
<p>Chaque réponse tient en un mot, et ce mot est dans le texte. C’est le format des points de contrôle de l’application Vread : une question précise sur un passage, que l’on réussit en ayant lu ce passage.</p>
<ol class="questions">${g.questions.map((q) => `<li><p class="ref">${esc(q.ref)}</p><p class="q">${esc(q.question)}</p><details><summary>La réponse et son passage</summary><p><strong>${esc(q.answer)}</strong></p><blockquote><p>« ${esc(q.evidence)} »</p></blockquote></details></li>`).join('\n')}</ol>
${qaOk ? `<p class="small">Questions vérifiées le ${UPDATED.split('-').reverse().join('/')} avec le moteur de lecture de READ FRANCE : forme de la question, réponse présente dans la partie citée, aucun doublon, et un lecteur qui n’avait que les résumés de cette page n’a trouvé aucune des cinq réponses.</p>` : ''}
${ressources(g, 'bas')}
<h2 id="source">Le texte et ses droits</h2>
<p>${esc(g.author)} est mort en ${esc(g.authorDates.split('-')[1])} : le texte est dans le domaine public. Édition suivie : <a href="${esc(g.source.url)}" rel="noopener">${esc(g.source.label)}</a> (${esc(g.source.licence)}). Les citations reprennent cette édition ; les références (${unitWord.split(' ')[0]}s, dates, paragraphes) suivent son découpage.</p>
${others.length ? `<h2 id="autres">${g.programme === 'bac' ? 'Les autres œuvres du programme' : 'D’autres classiques du collège'}</h2><ul class="autres">${others.map((o) => `<li><a href="${u(o.slug + '/')}">${esc(o.title)}</a>, ${esc(o.author)}</li>`).join('')}</ul>` : ''}
</article>`;
  const seo: SeoData = {
    title, description, canonical: abs(path), ogType: 'article', lang: 'fr', lastModified: g.updated,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'LearningResource', '@id': `${abs(path)}#guide`, name: `${g.title}, de ${g.author} : guide de lecture`, url: abs(path), inLanguage: 'fr',
        isAccessibleForFree: true, learningResourceType: ['fiche de lecture', 'questionnaire'], educationalLevel: g.level, datePublished: UPDATED, dateModified: g.updated,
        author: { '@id': SITE.organizationId }, publisher: { '@id': SITE.organizationId }, isPartOf: { '@id': `${SITE.origin}/#website` },
        about: { '@type': 'Book', name: g.title, author: { '@type': 'Person', name: g.author }, datePublished: g.published.slice(0, 4), inLanguage: 'fr', genre: g.genre }, description },
      breadcrumbSchema(SITE, [{ name: 'Les fiches', path: '/' }, { name: g.title, path: `/${path}` }]),
    ],
    appHtml: shell(path, body),
  };
  return { seo, published_at: `${UPDATED}T12:00:00Z` };
}

function staticPage(path: string, title: string, description: string, body: string, extra: object[] = [], type: 'WebPage' | 'AboutPage' | 'CollectionPage' = 'WebPage'): { seo: SeoData } {
  return { seo: { title, description, canonical: abs(path), ogType: 'website', lang: 'fr', lastModified: UPDATED,
    jsonLd: [webPageSchema(SITE, { type, path: `/${path}`, name: title, description, dateModified: UPDATED }), ...extra], appHtml: shell(path, body) } };
}

const card = (g: Guide) => `<li class="carte-fiche"><a href="${u(g.slug + '/')}"><strong>${esc(g.title)}</strong></a><span>${esc(g.author)}, ${esc(g.published)} · ${esc(g.genre)} · ${nf(g.words)} mots</span><span class="small">${esc(g.level)}</span></li>`;
const bac = guides.filter((g) => g.programme === 'bac');
const col = guides.filter((g) => g.programme === 'college');
const home = staticPage('', 'Lectoguide : fiches de lecture des classiques au programme, bac de français et collège',
  `${guides.length} fiches de lecture gratuites sur les œuvres du domaine public au programme : résumé partie par partie, passages clés avec leurs références, 5 questions pour vérifier sa lecture.`,
  `<h1>Fiches de lecture des classiques au programme</h1>
<p class="chapeau">${guides.length} œuvres du domaine public, du bac de français au collège. Pour chacune : le texte partie par partie, les passages à connaître avec leur référence, et cinq questions dont la réponse tient en un mot du texte.</p>
<p>Les fiches sont faites pour accompagner la lecture, pas pour l’éviter. Les résumés aident à se repérer ; les questions portent sur des détails qu’ils ne donnent pas. Chaque citation a été vérifiée mot pour mot dans l’édition suivie, et chaque question passée au moteur de lecture de READ FRANCE (<a href="${u('methode/')}">la méthode</a>).</p>
<h2 id="bac">Bac de français, épreuve anticipée de juin 2027</h2>
<p class="small">Œuvres du programme national publié au Bulletin officiel n° 30 du 24 juillet 2025 (note de service du 4 juillet 2025, session 2028 du baccalauréat), pour les années scolaires 2026-2027. Seules les œuvres du domaine public ont une fiche : ${bac.length} sur les 13 du programme.</p>
<ul class="grille">${bac.map(card).join('')}</ul>
<h2 id="college">Collège</h2>
<p class="small">Le programme du collège ne fixe pas de liste d’œuvres : ce sont des classiques souvent choisis en classe, de la 6e à la 3e.</p>
<ul class="grille">${col.map(card).join('')}</ul>
<aside class="ressources" aria-label="Ressources READ FRANCE"><h2>Pour la classe</h2><ul>
<li><a href="https://outils.vread.fr/lectoclasse/" data-mesure="cta_click">Lectoclasse</a> : kits de lecture prêts à imprimer sur les œuvres du bac, pour les établissements français hors Union européenne. Le kit du Menteur est gratuit.</li>
<li><a href="https://outils.vread.fr/lectopoint/" data-mesure="cta_click">Lectopoint</a> : préparez vos propres points de contrôle sur un texte du domaine public, gratuit.</li>
<li><a href="https://outils.vread.fr/chapter-checks/" data-mesure="cta_click" hreflang="en">Chapter Checks</a> : contrôles de lecture des classiques anglais et américains (AP Literature).</li>
<li><a href="https://www.vread.fr/" data-mesure="cta_click">Vread : lire et prouver sa lecture</a>, une question toutes les 30 à 40 pages.</li></ul></aside>`,
  [webSiteSchema(SITE), organizationSchema(SITE), { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Fiches de lecture Lectoguide', itemListElement: guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(g.slug + '/'), name: g.title })) }],
  'CollectionPage');

const methode = staticPage('methode/', 'Comment les fiches Lectoguide sont faites : sources, citations, questions vérifiées',
  'La méthode des fiches Lectoguide : texte original du domaine public, résumés écrits à partir du texte, citations vérifiées mot pour mot, questions d’un mot passées au moteur de lecture de READ FRANCE.',
  `<h1>Comment les fiches sont faites</h1>
<p class="chapeau">Une fiche Lectoguide part du texte, jamais d’une autre fiche. Voici les étapes, puis leurs limites.</p>
<h2>Le texte</h2>
<p>Chaque œuvre est reprise de Wikisource, dans une édition ancienne identifiée sur la fiche (éditeur, année). Le texte est découpé selon ses propres unités : chapitres, actes, lettres, soirs, poèmes, ou pour un texte d’un seul tenant, des parties définies par numéros de paragraphes. Tous les auteurs sont morts avant 1925 ; les textes sont donc libres en France comme à l’étranger.</p>
<h2>Les résumés et les passages</h2>
<p>Les résumés sont écrits à partir du texte, partie par partie, en trois à six phrases. Chaque nom et chaque événement a été recherché dans le texte avant d’être écrit. Les passages clés sont des citations courtes (45 mots au plus), copiées de l’édition suivie et vérifiées par programme : une citation qui ne se retrouve pas mot pour mot dans sa partie bloque la publication.</p>
<h2>Les cinq questions</h2>
<p>Elles suivent le format des points de contrôle de l’application Vread : une question ouverte sur un fait précis d’une partie, une réponse d’un seul mot qui figure dans cette partie. Le moteur de lecture de READ FRANCE vérifie la forme (35 à 160 caractères, pas de oui ou non, pas de choix multiple, réponse absente de la question et pas trop générique), la présence de la réponse et du passage dans la partie citée, et l’absence de doublon.</p>
<p>Il fait aussi passer un test « avec le résumé seul » : un lecteur qui n’a pas le texte, mais seulement les résumés de la fiche, doit répondre en citant le résumé. S’il trouve, la question est réécrite. Ce lecteur est un agent qui n’a jamais vu le texte, ni les réponses.</p>
<h2>Les limites</h2>
<ul>
<li>Une réponse d’un mot vérifie qu’un passage a été lu, pas qu’il a été compris. Pour l’analyse, il faut d’autres exercices, à l’écrit ou à l’oral.</li>
<li>Les références suivent l’édition de Wikisource. Dans une édition scolaire, les numéros de pages diffèrent, mais les chapitres, actes et scènes sont les mêmes.</li>
<li>Les fiches ne disent rien des attentes d’un correcteur ou d’un examinateur : nous ne publions que ce que le texte et le Bulletin officiel permettent de vérifier.</li>
</ul>
<p>Une erreur ? Écrivez à <a href="mailto:${CONTACT}">${CONTACT}</a> en citant la fiche et le passage.</p>`);

const confidentialite = staticPage('confidentialite/', 'Confidentialité : Lectoguide par READ FRANCE',
  'Lectoguide ne demande aucun compte et ne dépose aucun cookie. La mesure d’audience est agrégée, sans identifiant.',
  `<h1>Confidentialité</h1>
<p class="chapeau">Lectoguide ne demande ni compte, ni adresse e-mail, et ne dépose aucun cookie.</p>
<h2>Mesure d’audience</h2>
<p>Pour savoir quelles fiches servent, nous comptons de façon agrégée, par jour et par page : les pages vues, les clics vers les autres ressources de READ FRANCE (Lectoclasse, Lectopoint, Chapter Checks, Vread), l’ouverture des réponses aux questions, la profondeur de lecture de la page, le temps avant le premier clic par tranche, les erreurs techniques et les indicateurs de vitesse. Pour le test de position de l’encadré « Pour la classe », nous comptons quelle version a été affichée.</p>
<p>Ces compteurs ne contiennent ni cookie, ni adresse IP, ni identifiant. Le navigateur envoie seulement le nom du site, la page, l’événement, le domaine du site d’où vous venez, d’éventuels paramètres de campagne (utm) et le type d’écran. Le stockage de session du navigateur garde, le temps de l’onglet, ce qui a déjà été compté. Si votre navigateur envoie le signal « Do Not Track » ou « Global Privacy Control », rien n’est envoyé.</p>
<p>Les compteurs sont enregistrés dans un tableur Google de READ FRANCE (Google Apps Script). Cette mesure est exemptée de consentement au sens des lignes directrices de la CNIL sur les traceurs, parce qu’elle se limite à des statistiques anonymes du site.</p>
<h2>Contact</h2>
<p>READ FRANCE SAS, 11 rue Rouvet, 75019 Paris. <a href="mailto:${CONTACT}">${CONTACT}</a>. Vous pouvez aussi saisir la CNIL (cnil.fr).</p>
<p class="small">Mise à jour : 16 octobre 2026.</p>`);

const mentions = staticPage('mentions-legales/', 'Mentions légales : Lectoguide par READ FRANCE',
  'Éditeur, hébergeur, droits sur les textes et sur les fiches de Lectoguide, site de fiches de lecture gratuites de READ FRANCE SAS.',
  `<h1>Mentions légales</h1>
<p>Éditeur : READ FRANCE SAS, 11 rue Rouvet, 75019 Paris, RCS Paris 988 741 773. Directeur de la publication : le président de la société. Contact : <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>
<p>Hébergeur : GitHub Pages, GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
<h2>Droits</h2>
<p>Les œuvres citées sont dans le domaine public. Les transcriptions viennent de Wikisource (licence CC BY-SA 4.0). Les résumés, notes et questions des fiches sont © 2026 READ FRANCE SAS : vous pouvez les imprimer pour votre classe ; toute autre reproduction demande notre accord.</p>
<p>Lectoguide est une ressource privée, sans lien avec le ministère de l’Éducation nationale.</p>`);

// ------------------------------------------------------------------------------------------------ write
/** The template's source comments (provenance notes) stay in the repo, not in the published pages. */
const stripComments = (html: string) => html.replace(/[ \t]*<!--(?!SEO_INJECT)[\s\S]*?-->\n?/g, '');
const template = readFileSync(join(ROOT, 'seo-engine/template.html'), 'utf8').replaceAll('%BASE%', BASE).replace('%TRACK_API%', TRACK_API);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const out: Array<{ path: string; page: SitemapPage }> = [
  { path: '', page: home }, { path: 'methode/', page: methode }, { path: 'confidentialite/', page: confidentialite }, { path: 'mentions-legales/', page: mentions },
  ...guides.map((g) => ({ path: g.slug + '/', page: guidePage(g) })),
];
for (const { path, page } of out) {
  const f = join(OUT, path, 'index.html');
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, stripComments(renderPage(template, page.seo, SITE)));
}
writeFileSync(join(OUT, '404.html'), stripComments(renderPage(template, { ...notFoundSeo(SITE), appHtml: shell('404', `<h1>Page introuvable</h1><p><a href="${u('')}">Toutes les fiches</a></p>`) }, SITE)));
cpSync(join(ROOT, 'src/assets'), join(OUT, 'assets'), { recursive: true });
for (const f of ['mesure.js', 'cro.js']) cpSync(join(ROOT, 'src/assets', f), join(OUT, f));
writeFileSync(join(OUT, 'sitemap.xml'), sitemapXml(out.map((o) => o.page)));
writeFileSync(join(OUT, 'llms.txt'), llmsTxt(SITE, [
  'Éditeur : READ FRANCE SAS, Paris (l’éditeur de l’application Vread). Fiches gratuites, sans compte.',
  `${guides.length} fiches sur des œuvres du domaine public : ${bac.length} du programme du bac de français (épreuve anticipée de juin 2027), ${col.length} classiques du collège.`,
  'Chaque fiche : résumé partie par partie, passages clés cités mot pour mot avec leur référence, 5 questions à réponse d’un mot vérifiées par le moteur de lecture de READ FRANCE.',
  'Textes repris de Wikisource (CC BY-SA 4.0), auteurs morts avant 1925.',
], [
  { title: 'Bac de français', links: bac.map((g) => ({ name: `${g.title}, ${g.author}`, url: abs(g.slug + '/'), note: `${g.genre}, ${g.published}` })) },
  { title: 'Collège', links: col.map((g) => ({ name: `${g.title}, ${g.author}`, url: abs(g.slug + '/'), note: `${g.genre}, ${g.published}, ${g.level}` })) },
  { title: 'Méthode', links: [{ name: 'Comment les fiches sont faites', url: abs('methode/'), note: 'sources, citations, questions vérifiées, limites' }] },
]));
writeFileSync(join(OUT, '.nojekyll'), '');
console.log(`dist: ${out.length} pages (${guides.length} guides)`);
