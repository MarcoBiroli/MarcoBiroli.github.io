import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSortedPapers } from '../lib/papers';
import { scholarInfoFor, scholarStats } from '../lib/scholar';

export const GET: APIRoute = async ({ site }) => {
  const papers = await getSortedPapers();
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  const base = site?.toString().replace(/\/$/, '') ?? 'https://marcobiroli.github.io';

  const scholarMap = scholarInfoFor(papers);
  const stats = scholarStats();
  const citesOf = (p: (typeof papers)[number]) => scholarMap.get(p.id)?.citations;
  const topCited = [...papers]
    .filter((p) => (citesOf(p) ?? 0) > 0)
    .sort((a, b) => (citesOf(b) ?? 0) - (citesOf(a) ?? 0))
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
    stats
      ? `- ${papers.length} peer-reviewed / preprint publications; ${stats.total} total citations; h-index ${stats.hIndex}; i10-index ${stats.i10} (Google Scholar, ${stats.asOf}).`
      : `- ${papers.length} peer-reviewed / preprint publications.`,
    ...(topCited.length > 0
      ? [
          '- Top-cited papers:',
          ...topCited.map(
            (p) =>
              `    - *${p.data.title}* (${p.data.venue}, ${p.data.year}) — ${citesOf(p)} citations.`,
          ),
        ]
      : []),
    '',
    '## Frequent collaborators',
    '',
    '- Satya N. Majumdar (LPTMS, CNRS) — PhD advisor; co-author on most papers.',
    '- Grégory Schehr (LPT, Sorbonne Université) — co-author on most papers.',
    '- Hernán Larralde (UNAM) — co-author on the 2023 PRL and the 2024 PRE on exact extreme/order/sum statistics.',
    '- Manas Kulkarni (ICTS-TIFR) — switching-trap papers (PRE 2024, PRL 2026).',
    '- Sergio Ciliberto and Artyom Petrosyan (ENS Lyon) — experimental paper on emergent correlations in a switching trap (PRL 137, 037102, 2026).',
    '- Max Welling (University of Amsterdam) and Vincenzo Vitelli (University of Chicago) — VAE / latent mean-field paper (arXiv:2606.08694, 2026).',
    '- Francesco Mori (Oxford) — resetting random walker (J. Phys. A 2022).',
    '- Alexander K. Hartmann and Yannick Feld (Oldenburg) — resetting by rescaling (PRE 2024).',
    '',
    '## Machine-learning direction',
    '',
    'A post-PhD research direction, developed during the UChicago postdoc, distinct from the PhD thesis topics (which centred on stochastic resetting and correlated particle systems). Anchored by the preprint *Discovering and decoding latent mean-field structure with variational autoencoders* (Biroli, Welling & Vitelli, 2026, arXiv:2606.08694). Main result: the conditional-independence assumption built into every VAE decoder — p_θ(x | z) = Π_i p(x_i | z) — is formally equivalent to the finite-size mean-field factorization in statistical physics (keeping the latent variable stochastic rather than collapsing it via saddle-point). Consequences derived in the paper:',
    '',
    '1. A criterion for when VAEs can fully recover a joint distribution p(x): only when p(x) admits a mean-field description.',
    '2. A concrete failure case: a VAE trained on 2D Ising samples cannot recover the sharp critical singularity at T_c ≈ 2.269, regardless of training.',
    '3. A use of VAEs as a test for the existence of a mean-field description of unknown data.',
    '',
    'Validated on a hierarchy of solvable models with scalar, vector and tensor order parameters (Curie–Weiss, Hopfield, Maier–Saupe) — recovering the full Hopfield pattern matrix from equilibrium samples alone — and on salamander retinal recordings, where a two-latent VAE recovers the stored patterns of the neural population. Invited talk on this work: Schmidt AI in Science Speaker Series, University of Chicago Data Science Institute, March 2026.',
    '',
'## AI safety',
    '',
    'The same statistical-physics toolkit applied to the robustness of aligned language models. *Escaping alignment: a physical trap model of best-of-N jailbreaking* (2026, arXiv:2609.32116) models each jailbreak attempt as thermally activated escape: every prompt carries a baseline safety level and every augmentation a random barrier. Four interpretable parameters fix the full two-budget (N augmentations × M samples) attack surface, extrapolate attack success rates from N ≤ 100 to N = 10^4, collapse five distinct models onto one scaling function, and predict results at unseen generation temperatures. The apparent power-law scaling of attack success in N reported previously is shown to be a finite-size artifact of the adversarial dataset.',
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
    const numCites = citesOf(p);
    const cites = numCites != null && numCites > 0 ? ` · ${numCites} citations` : '';
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
  lines.push(
    `*Citation counts and metrics reflect Google Scholar as of ${stats?.asOf ?? 'the last site build'}.*`,
  );
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
