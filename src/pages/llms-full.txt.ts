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

  const totalCitations = papers.reduce((s, p) => s + (p.data.citations ?? 0), 0);

  const parts: string[] = [
    '# Marco Biroli — full site content',
    '',
    'Theoretical physicist working at the intersection of statistical mechanics and machine learning. Research Scholar at the University of Chicago (2025–present); PhD from LPTMS, Université Paris-Saclay, under Satya N. Majumdar (2022–2025).',
    '',
    `Source website: ${base}`,
    '',
    '## Research areas',
    '',
    'The throughline across Marco Biroli\'s work is exact results for strongly correlated stochastic systems — classes where analytical tractability survives despite non-trivial correlations, typically because a small set of hidden variables carries the correlation structure. Three active threads:',
    '',
    '1. **Stochastic resetting and correlated particles.** N non-interacting Brownian particles on a line, all reset to a common point at Poisson times, become correlated through the shared reset event alone. Exact closed-form extreme-value, order, and spacing statistics follow (Biroli–Larralde–Majumdar–Schehr, PRL 2023). Subsequent works extend this to non-Poissonian resetting, first-passage–triggered resets, switching harmonic traps, and an experimental verification in 2025 (arXiv:2508.07199).',
    '',
    '2. **Random matrix theory under resetting.** Dyson Brownian motion of eigenvalues subject to collective resetting. Stationary density, extreme-eigenvalue statistics, and the crossover between repulsion- and reset-dominated regimes (Biroli–Majumdar–Schehr, PRE 2025).',
    '',
    '3. **Statistical physics of learning.** The VAE / mean-field equivalence described below.',
    '',
    '## Positions & training',
    '',
    '- Research Scholar, University of Chicago, 2025–present.',
    '- PhD, Theoretical Physics, LPTMS, Université Paris-Saclay, 2022–2025. Advisor: Satya N. Majumdar.',
    '- MSc, École Normale Supérieure, Paris — summa cum laude (17.96/20).',
    '- BSc, École Polytechnique — double major Physics & Mathematics, summa cum laude (4.17/4.0).',
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
    `- ${papers.length} peer-reviewed / preprint publications.`,
    `- ~${totalCitations} total citations; h-index 8; i10-index 7 (Google Scholar, April 2026).`,
    '- Most-cited paper: *Extreme statistics and spacing distribution in a Brownian gas correlated by resetting*, Phys. Rev. Lett. 130, 207101 (2023) — 61 citations.',
    '',
    '## Frequent collaborators',
    '',
    '- Satya N. Majumdar (LPTMS, CNRS) — PhD advisor; co-author on the majority of papers.',
    '- Grégory Schehr (LPT, Sorbonne Université) — co-author on the majority of papers.',
    '- Hernán Larralde (UNAM) — co-author on the 2023 PRL and on the 2024 PRE on exact extreme/order/sum statistics.',
    '- Manas Kulkarni (ICTS-TIFR) — switching-trap papers.',
    '- Sergio Ciliberto and Artyom Petrosyan (ENS Lyon) — experimental paper on emergent correlations in a switching trap (arXiv 2508.07199, 2025).',
    '- Francesco Mori (Oxford) — resetting random walker (J. Phys. A 2022).',
    '- Alexander K. Hartmann and Yannick Feld (Oldenburg) — resetting by rescaling (PRE 2024).',
    '',
    '## Machine-learning direction — detail',
    '',
    'The machine-learning thread is anchored by an in-progress preprint, *Variational autoencoders are finite-size mean-field models of correlated systems* (2026). Main result, taken directly from the paper:',
    '',
    '> The conditional-independence assumption p_θ(x | z) = Π_i p(x_i | z) that every VAE decoder makes is formally equivalent to the finite-size mean-field factorization of the joint distribution (keeping the latent h stochastic rather than collapsing it to ⟨h⟩ via saddle-point). Therefore a VAE can succeed in recovering p(x) only when p(x) admits a mean-field description.',
    '',
    'The paper validates this on (i) the 2D Ising model, where VAEs necessarily fail to capture the critical singularity, (ii) the Curie–Weiss mean-field model, where they succeed, and (iii) retinal population recordings.',
    '',
    'This work was the subject of an invited talk at the University of Chicago Schmidt AI in Science Speaker Series, 3 March 2026.',
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

  parts.push('---');
  parts.push('*All bibliometric data reflect Google Scholar at the time of the last site build.*');
  parts.push('');

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
