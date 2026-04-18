import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function surname(fullName: string): string {
  const cleaned = fullName.replace(/[.,]/g, '').trim();
  const parts = cleaned.split(/\s+/);
  return parts[parts.length - 1] ?? 'anon';
}

function bibKey(firstAuthor: string, year: number, title: string): string {
  const last = surname(firstAuthor).toLowerCase().replace(/[^a-z]/g, '');
  const firstTitleWord = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .find((w) => w.length > 3 && !['the', 'and', 'for', 'with', 'from'].includes(w)) ?? 'paper';
  return `${last}${year}${firstTitleWord}`;
}

function formatAuthor(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(' ');
  return `${last}, ${first}`;
}

function extractArxivId(url?: string): string | undefined {
  if (!url) return;
  const m = url.match(/arxiv\.org\/(?:abs|pdf)\/([^/?#]+)/i);
  return m?.[1]?.replace(/v\d+$/, '');
}

function extractDoi(url?: string): string | undefined {
  if (!url) return;
  const m = url.match(/doi\.org\/(.+)$/i);
  return m?.[1];
}

export const GET: APIRoute = async () => {
  const papers = (await getCollection('papers')).sort(
    (a, b) => b.data.year - a.data.year,
  );
  const entries: string[] = [];

  for (const p of papers) {
    const d = p.data;
    const key = bibKey(d.authors[0], d.year, d.title);
    const authorField = d.authors.map(formatAuthor).join(' and ');
    const isPreprint = /arxiv/i.test(d.venue) && !d.doi;
    const entryType = isPreprint ? '@misc' : '@article';

    const lines: string[] = [];
    lines.push(`${entryType}{${key},`);
    lines.push(`  title        = {${d.title}},`);
    lines.push(`  author       = {${authorField}},`);
    if (isPreprint) {
      lines.push(`  howpublished = {${d.venue}},`);
    } else {
      lines.push(`  journal      = {${d.venue}},`);
    }
    lines.push(`  year         = {${d.year}},`);

    const doi = extractDoi(d.doi);
    if (doi) lines.push(`  doi          = {${doi}},`);

    const arxivId = extractArxivId(d.arxiv);
    if (arxivId) {
      lines.push(`  eprint       = {${arxivId}},`);
      lines.push(`  archivePrefix= {arXiv},`);
    }

    lines.push(`}`);
    entries.push(lines.join('\n'));
  }

  return new Response(entries.join('\n\n') + '\n', {
    headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' },
  });
};
