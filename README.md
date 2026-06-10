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
  Each entry's `scholar_id` pins it to a Google Scholar `author_pub_id`.
- `src/content/notes/` — notes & research explainers (MDX, with KaTeX math).
- `src/content/news/` — short dated updates shown on the homepage.
- `src/data/talks.ts` — talks, workshops & schools rendered on `/cv`
  (slide/poster PDFs go in `public/slides/`).

## Citations (auto-updated)

Citation counts come from Google Scholar, not from frontmatter:

- `scripts/fetch_scholar.py` fetches profile `U4DVTL0AAAAJ` and writes
  `src/data/scholar.json` (committed). It refuses to overwrite on fetch
  failure or implausible data, so the site keeps serving last-known-good
  numbers.
- The weekly `sync-scholar` job in `deploy.yml` (Mondays 05:17 UTC, or
  Actions → "Deploy to GitHub Pages" → Run workflow) commits the refreshed
  JSON and redeploys. A failed fetch turns the run red — nothing breaks.
- At build time `src/lib/scholar.ts` merges the JSON into the papers pages
  (badges + totals) by `scholar_id`, falling back to title match; papers on
  Scholar that are missing from `src/content/papers/` show up as build
  warnings.
- New papers: add the Markdown entry, then grab its `scholar_id` from the
  build warning (or run the script locally with `--bootstrap` and check
  `scholar_seed.json`).

Local refresh:

```
python3 -m venv .venv && .venv/bin/pip install -r scripts/requirements.txt
.venv/bin/python scripts/fetch_scholar.py
```

## Deploy

Push to `main` on `github.com/marcobiroli/marcobiroli.github.io`. The workflow in `.github/workflows/deploy.yml` builds and publishes to GitHub Pages. First-time setup: in repo settings → Pages → Build and deployment → Source: **GitHub Actions** (and make `main` the default branch so the weekly cron runs).
