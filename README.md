# marcobiroli.github.io

Personal site for Marco Biroli. Astro + MDX, deployed to GitHub Pages.

## Dev

```
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview
```

## Content

- `src/content/papers/` — one Markdown file per publication (frontmatter only).
- `src/content/notes/` — notes & research explainers (MDX, with KaTeX math).
- `src/components/demos/` — interactive Canvas figures, embedded from notes.

## Deploy

Push to `main` on `github.com/marcobiroli/marcobiroli.github.io`. The workflow in `.github/workflows/deploy.yml` builds and publishes to GitHub Pages. First-time setup: in repo settings → Pages → Build and deployment → Source: **GitHub Actions**.

## TODO (content, not code)

- [ ] Drop a headshot at `public/photo.jpg` (or remove the `<img>` from `src/pages/index.astro`).
- [ ] Drop a CV at `public/cv.pdf`.
- [ ] Spot-check author order in `src/content/papers/open-vote-network.md` (the Scholar listing truncated the middle of the list) and in any paper where you want a different display.
- [ ] Add a real email address in `src/components/Footer.astro` if different from `marco.biroli@gmail.com`.
