export interface TalkEntry {
  title: string;
  where: string;
  date: string;
  iso: string;
  kind?: string;
  slides?: string;
  poster?: string;
}

export const talks: TalkEntry[] = [
  {
    title: 'Variational auto-encoders are finite-size mean-field approximators',
    where: 'Schmidt AI in Science Speaker Series, University of Chicago',
    date: '3 March 2026',
    iso: '2026-03-03',
    kind: 'seminar talk',
  },
  {
    title: 'New Vistas in Stochastic Resetting',
    where: 'Higgs Centre for Theoretical Physics, Edinburgh',
    date: '17–19 June 2024',
    iso: '2024-06-17',
    kind: 'contributed poster',
  },
  {
    title: 'LPTMS bi-weekly seminar',
    where: 'LPTMS, Université Paris-Saclay',
    date: 'March 2024',
    iso: '2024-03-01',
    kind: 'invited talk',
  },
  {
    title: 'Interaction, Disorder and Elasticity',
    where: 'École de Physique des Houches',
    date: '3–7 April 2023',
    iso: '2023-04-03',
    kind: 'contributed talk',
  },
  {
    title: 'GDR Interaction, Disorder and Elasticity',
    where: 'Université Grenoble-Alpes',
    date: '28–30 November 2022',
    iso: '2022-11-28',
    kind: 'contributed poster',
  },
  {
    title: 'Asymmetry in interacting particle systems, microscopic and macroscopic effects',
    where: 'INRIA Lille',
    date: '3–5 October 2022',
    iso: '2022-10-03',
  },
];

export const schools: TalkEntry[] = [
  {
    title: 'Theory of Large Deviations and Applications',
    where: 'École de Physique des Houches',
    date: 'July 2024',
    iso: '2024-07-01',
    kind: 'contributed poster',
  },
  {
    title: 'Quantum Localization and Glassy Physics',
    where: "Institut d'études scientifiques de Cargèse",
    date: 'July 2023',
    iso: '2023-07-01',
    kind: 'contributed poster',
  },
  {
    title: 'Statistical Physics of Complex Systems',
    where: 'Beg Rohu Summer School',
    date: 'June 2023',
    iso: '2023-06-01',
    kind: 'contributed poster',
  },
];
