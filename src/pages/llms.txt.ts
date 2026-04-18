import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const papers = (await getCollection('papers')).sort(
    (a, b) => b.data.year - a.data.year,
  );
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  const base = site?.toString().replace(/\/$/, '') ?? 'https://marcobiroli.github.io';

  const lines: string[] = [
    '# Marco Biroli',
    '',
    '> Research Scholar at the University of Chicago. Theoretical physicist working on extreme-value statistics, stochastic resetting, random matrix theory, and strongly correlated particle systems — and, increasingly, on applications of these tools in machine learning.',
    '',
    `Canonical URL: ${base}`,
    '',
    '## Background',
    '',
    '- PhD in theoretical physics, LPTMS, Université Paris-Saclay (2022–2025), advisor: Satya N. Majumdar.',
    '- MSc, École Normale Supérieure (summa cum laude).',
    '- BSc, École Polytechnique — double major physics & mathematics (summa cum laude).',
    '- Google Scholar: https://scholar.google.com/citations?user=U4DVTL0AAAAJ',
    '- h-index 8, ~216 citations (April 2026).',
    '',
    '## Publications',
    '',
  ];

  for (const p of papers) {
    const d = p.data;
    const primary = d.doi ?? d.arxiv ?? `${base}/papers`;
    const authors = d.authors.join(', ');
    const venue = `${d.venue}, ${d.year}`;
    const summary = d.summary ? ` — ${d.summary}` : '';
    lines.push(`- [${d.title}](${primary}) · ${authors} · ${venue}${summary}`);
    if (d.arxiv && d.arxiv !== primary) lines.push(`    - arXiv: ${d.arxiv}`);
    if (d.doi && d.doi !== primary) lines.push(`    - DOI: ${d.doi}`);
  }

  lines.push('', '## Notes', '');
  for (const n of notes) {
    const url = `${base}/notes/${n.id}`;
    const date = n.data.date.toISOString().slice(0, 10);
    lines.push(`- [${n.data.title}](${url}) · ${date} — ${n.data.summary}`);
    lines.push(`    - Raw markdown: ${base}/notes/${n.id}.md`);
  }

  lines.push('', '## Related endpoints', '');
  lines.push(`- Full prose dump: ${base}/llms-full.txt`);
  lines.push(`- BibTeX of all publications: ${base}/papers.bib`);
  lines.push(`- RSS feed (notes): ${base}/rss.xml`);
  lines.push(`- Sitemap: ${base}/sitemap-index.xml`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
