import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function stripMdxDirectives(body: string): string {
  return body
    .split('\n')
    .filter((line) => !/^\s*(import|export)\s/.test(line))
    .join('\n')
    .trim();
}

export const GET: APIRoute = async ({ site }) => {
  const papers = (await getCollection('papers')).sort(
    (a, b) => b.data.year - a.data.year,
  );
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  const base = site?.toString().replace(/\/$/, '') ?? 'https://marcobiroli.github.io';

  const parts: string[] = [
    '# Marco Biroli — full site content',
    '',
    'Research Scholar, University of Chicago. Statistical physics of extreme values, stochastic resetting, random matrix theory, correlated particle systems; applications at the stat-physics × machine-learning boundary. Previously PhD at LPTMS, Université Paris-Saclay under Satya N. Majumdar.',
    '',
    `Source website: ${base}`,
    '',
    '## Publications',
    '',
  ];

  for (const p of papers) {
    const d = p.data;
    parts.push(`### ${d.title}`);
    parts.push('');
    parts.push(`- Authors: ${d.authors.join(', ')}`);
    parts.push(`- Venue: ${d.venue}, ${d.year}`);
    if (d.citations != null) parts.push(`- Citations: ${d.citations}`);
    if (d.doi) parts.push(`- DOI: ${d.doi}`);
    if (d.arxiv) parts.push(`- arXiv: ${d.arxiv}`);
    if (d.code) parts.push(`- Code: ${d.code}`);
    if (d.summary) {
      parts.push('');
      parts.push(d.summary);
    }
    parts.push('');
  }

  parts.push('## Notes and research explainers', '');

  for (const n of notes) {
    const body = stripMdxDirectives(n.body ?? '');
    parts.push(`### ${n.data.title}`);
    parts.push('');
    parts.push(`- Date: ${n.data.date.toISOString().slice(0, 10)}`);
    parts.push(`- URL: ${base}/notes/${n.id}`);
    parts.push(`- Raw markdown: ${base}/notes/${n.id}.md`);
    parts.push('');
    parts.push(`> ${n.data.summary}`);
    parts.push('');
    parts.push(body);
    parts.push('');
  }

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
