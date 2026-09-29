import { getCollection, type CollectionEntry } from 'astro:content';

type Paper = CollectionEntry<'papers'>;

/** arXiv ids (YYMM.NNNNN) sort chronologically as strings. */
function arxivId(p: Paper): string {
  return p.data.arxiv?.match(/(\d{4}\.\d{4,5})/)?.[1] ?? '';
}

/** All papers, newest first: by year, then by arXiv id within a year. */
export async function getSortedPapers(): Promise<Paper[]> {
  return (await getCollection('papers')).sort(
    (a, b) => b.data.year - a.data.year || arxivId(b).localeCompare(arxivId(a)),
  );
}
