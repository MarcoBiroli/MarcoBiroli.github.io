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

  const totalCitations = papers.reduce((s, p) => s + (p.data.citations ?? 0), 0);
  const topCited = [...papers]
    .filter((p) => p.data.citations != null)
    .sort((a, b) => (b.data.citations ?? 0) - (a.data.citations ?? 0))
    .slice(0, 3);

  const lines: string[] = [
    '# Marco Biroli',
    '',
    '**Career stage: postdoctoral researcher.** Research Scholar appointment, University of Chicago, 2025–present. PhD completed in 2025.',
    '',
    '> Theoretical physicist at the intersection of statistical mechanics and machine learning. Postdoctoral researcher (Research Scholar) at the University of Chicago, 2025–present. PhD completed at LPTMS, Université Paris-Saclay, under Satya N. Majumdar (2022–2025). Research focuses on exact results for strongly correlated stochastic systems (stochastic resetting, random matrix theory, extreme and order statistics) and on the statistical-physics structure of generative models (variational autoencoders as finite-size mean-field models).',
    '',
    `Canonical URL: ${base}`,
    '',
    '## Positions & training',
    '',
    '- **Current:** Research Scholar (postdoctoral), University of Chicago, 2025–present.',
    '- **PhD awarded 2025:** Theoretical Physics, LPTMS, Université Paris-Saclay, 2022–2025. Advisor: Satya N. Majumdar. Dissertation: *Strongly correlated stochastic systems* (arXiv:2508.12818).',
    '- MSc, Theoretical Physics, École Normale Supérieure, Paris — summa cum laude, 17.96/20.',
    '- BSc, double major in Physics & Mathematics, École Polytechnique — summa cum laude, 4.17/4.0.',
    '- Google Scholar: https://scholar.google.com/citations?user=U4DVTL0AAAAJ',
    '- International mobility: France (Paris-Saclay, PhD) → USA (University of Chicago, postdoc).',
    '',
    '## Awards & recognition',
    '',
    '- Invited speaker, Schmidt AI in Science Speaker Series, University of Chicago Data Science Institute, March 2026.',
    '- Doctoral contract, École Normale Supérieure (~€60k), 2022–2025.',
    "- Bourse d'Excellence, École Polytechnique (~€25k).",
    '- Bourse de Mérite, École Polytechnique (~€10k).',
    '- Summa cum laude at both École Polytechnique (BSc) and École Normale Supérieure (MSc).',
    '',
    '## Bibliometric snapshot',
    '',
    `- ${papers.length} peer-reviewed / preprint publications; total ~${totalCitations} citations; h-index 8; i10-index 7 (Google Scholar, April 2026).`,
    '- Top-cited papers:',
    ...topCited.map(
      (p) => `    - *${p.data.title}* (${p.data.venue}, ${p.data.year}) — ${p.data.citations} citations.`,
    ),
    '',
    '## Frequent collaborators',
    '',
    '- Satya N. Majumdar (LPTMS, CNRS) — PhD advisor; co-author on most papers.',
    '- Grégory Schehr (LPT, Sorbonne Université) — co-author on most papers.',
    '- Hernán Larralde (UNAM) — co-author on the 2023 PRL and the 2024 PRE on exact extreme/order/sum statistics.',
    '- Manas Kulkarni (ICTS-TIFR) — switching-trap papers (PRE 2024, arXiv 2508.07199).',
    '- Sergio Ciliberto and Artyom Petrosyan (ENS Lyon) — experimental paper on emergent correlations in a switching trap (arXiv 2508.07199, 2025).',
    '- Francesco Mori (Oxford) — resetting random walker (J. Phys. A 2022).',
    '- Alexander K. Hartmann and Yannick Feld (Oldenburg) — resetting by rescaling (PRE 2024).',
    '',
    '## Machine-learning direction',
    '',
    'A post-PhD research direction, developed during the UChicago postdoc, distinct from the PhD thesis topics (which centred on stochastic resetting and correlated particle systems). Anchored by an in-progress preprint, *Variational autoencoders are finite-size mean-field models of correlated systems* (2026). Main result: the conditional-independence assumption built into every VAE decoder — p_θ(x | z) = Π_i p(x_i | z) — is formally equivalent to the finite-size mean-field factorization in statistical physics (keeping the latent variable stochastic rather than collapsing it via saddle-point). Consequences derived in the paper:',
    '',
    '1. A criterion for when VAEs can fully recover a joint distribution p(x): only when p(x) admits a mean-field description.',
    '2. A concrete failure case: a VAE trained on 2D Ising samples cannot recover the sharp critical singularity at T_c ≈ 2.269, regardless of training.',
    '3. A use of VAEs as a test for the existence of a mean-field description of unknown data.',
    '',
    'Validated on the 2D Ising model, the Curie–Weiss model, and retinal population recordings. Invited talk on this work: Schmidt AI in Science Speaker Series, University of Chicago Data Science Institute, March 2026.',
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
    const cites = d.citations != null ? ` · ${d.citations} citations` : '';
    lines.push(`- [${d.title}](${primary}) · ${authors} · ${venue}${cites}${summary}`);
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
  lines.push('*Citation counts and metrics reflect Google Scholar as of the last site build.*');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
