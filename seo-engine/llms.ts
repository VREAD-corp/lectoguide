// Adapted from chapter-coffee-club@70ca369 api/llms.txt.ts (Claude, 2026-10-05). Kept: /llms.txt as a short, factual map
// of the site for answer engines, built from the same entity data as the pages so that it cannot drift from them
// (title, one-line definition, facts, reference pages). Changed: generic over a SiteConfig and a list of pages.
import type { SiteConfig } from './site.js';

export function llmsTxt(site: SiteConfig, facts: string[], sections: Array<{ title: string; links: Array<{ name: string; url: string; note: string }> }>): string {
  return `# ${site.brand}

> ${site.description}

## Faits

${facts.map((f) => `- ${f}`).join('\n')}

${sections.map((s) => `## ${s.title}\n\n${s.links.map((l) => `- [${l.name}](${l.url}) : ${l.note}`).join('\n')}`).join('\n\n')}
`;
}
