import type { CollectionEntry } from 'astro:content';
import rawScholar from '../data/scholar.json';

export interface ScholarPublication {
  id: string;
  title: string;
  year: number | null;
  num_citations: number;
}

export interface ScholarData {
  fetched_at: string | null;
  citations_total: number;
  h_index: number;
  i10_index: number;
  citations_per_year: Record<string, number>;
  publications: ScholarPublication[];
}

export const scholar = rawScholar as ScholarData;

export const SCHOLAR_USER = 'U4DVTL0AAAAJ';
export const SCHOLAR_PROFILE_URL = `https://scholar.google.com/citations?user=${SCHOLAR_USER}`;

export interface ScholarStats {
  total: number;
  hIndex: number;
  i10: number;
  asOf: string;
}

export function scholarStats(): ScholarStats | null {
  if (!scholar.fetched_at || scholar.citations_total <= 0) return null;
  return {
    total: scholar.citations_total,
    hIndex: scholar.h_index,
    i10: scholar.i10_index,
    asOf: scholar.fetched_at,
  };
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export interface PaperScholarInfo {
  citations: number;
  url: string;
}

/**
 * Maps each curated paper (by collection entry id) to its Scholar citation
 * info. Primary key: frontmatter scholar_id === Scholar author_pub_id;
 * fallback: normalized title. Logs build warnings for curated papers with
 * no Scholar match and for Scholar papers missing from the collection.
 */
export function scholarInfoFor(
  papers: CollectionEntry<'papers'>[],
): Map<string, PaperScholarInfo> {
  const result = new Map<string, PaperScholarInfo>();
  if (scholar.publications.length === 0) return result;

  const byId = new Map(scholar.publications.map((p) => [p.id, p]));
  const byTitle = new Map(
    scholar.publications.map((p) => [normalizeTitle(p.title), p]),
  );
  const matched = new Set<string>();

  for (const paper of papers) {
    const sid = paper.data.scholar_id;
    const match =
      (sid ? byId.get(sid) : undefined) ??
      byTitle.get(normalizeTitle(paper.data.title));
    if (match) {
      matched.add(match.id);
      result.set(paper.id, {
        citations: match.num_citations,
        url: `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${SCHOLAR_USER}&citation_for_view=${match.id}`,
      });
    } else {
      console.warn(
        `[scholar] no citation data matched for "${paper.data.title}"` +
          (sid ? ` (scholar_id: ${sid})` : ' (no scholar_id set)'),
      );
    }
  }

  const unmatched = scholar.publications.filter((p) => !matched.has(p.id));
  if (unmatched.length > 0) {
    console.warn(
      `[scholar] ${unmatched.length} Scholar publication(s) have no entry in src/content/papers/:`,
    );
    for (const p of unmatched) {
      console.warn(`  - "${p.title}" (${p.year ?? '?'}) scholar_id: ${p.id}`);
    }
  }

  return result;
}
