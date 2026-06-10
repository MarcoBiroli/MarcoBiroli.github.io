#!/usr/bin/env python3
"""Fetch Google Scholar citation stats into src/data/scholar.json.

Run weekly by .github/workflows/deploy.yml; the Astro build merges the JSON
into the papers pages. On any fetch failure or implausible data the script
exits non-zero WITHOUT touching the file, so the last-known-good numbers
keep serving.

Backends:
  - SerpAPI (used automatically when the SERPAPI_KEY env var is set) —
    reliable from CI; Google Scholar blocks GitHub-runner IPs directly.
  - scholarly (no key needed) — works from residential IPs / local runs,
    and is required for --bootstrap.

Usage:
  python scripts/fetch_scholar.py                # refresh scholar.json
  python scripts/fetch_scholar.py --bootstrap    # also dump scholar_seed.json
                                                 # (full metadata, for authoring
                                                 # src/content/papers/ entries)
  python scripts/fetch_scholar.py --force        # skip the sanity gate
"""

from __future__ import annotations

import argparse
import json
import os
import signal
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

AUTHOR_ID = "U4DVTL0AAAAJ"
REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = REPO_ROOT / "src" / "data" / "scholar.json"
SEED_OUTPUT = REPO_ROOT / "scholar_seed.json"

ATTEMPTS = 3
BACKOFF_S = (30, 90)
ATTEMPT_TIMEOUT_S = 180


def fetch_profile(author_id: str) -> dict:
    """The single seam to Google Scholar.

    If scholarly stops working from CI (Scholar blocks datacenter IPs at
    times), swap this implementation for a requests+BeautifulSoup parse of
    the profile page, or the SerpAPI author endpoint — nothing else changes.
    """
    from scholarly import scholarly

    author = scholarly.search_author_id(author_id)
    return scholarly.fill(
        author, sections=["basics", "indices", "counts", "publications"]
    )


class _AttemptTimeout(Exception):
    pass


def _raise_timeout(*_args: object) -> None:
    raise _AttemptTimeout(f"attempt exceeded {ATTEMPT_TIMEOUT_S}s")


def _fetch_with_retries(author_id: str) -> dict:
    last: BaseException | None = None
    use_alarm = hasattr(signal, "SIGALRM")
    for attempt in range(1, ATTEMPTS + 1):
        try:
            if use_alarm:
                signal.signal(signal.SIGALRM, _raise_timeout)
                signal.alarm(ATTEMPT_TIMEOUT_S)
            try:
                return fetch_profile(author_id)
            finally:
                if use_alarm:
                    signal.alarm(0)
        except (KeyboardInterrupt, SystemExit):
            raise
        except BaseException as exc:
            last = exc
            print(
                f"[scholar] attempt {attempt}/{ATTEMPTS} failed: {exc!r}",
                file=sys.stderr,
            )
            if attempt < ATTEMPTS:
                wait = BACKOFF_S[min(attempt - 1, len(BACKOFF_S) - 1)]
                print(f"[scholar] retrying in {wait}s", file=sys.stderr)
                time.sleep(wait)
    raise RuntimeError(f"scholarly gave up after {ATTEMPTS} attempts: {last!r}")


def _fetch_serpapi_payload(author_id: str, api_key: str) -> dict:
    """Google Scholar Author API via SerpAPI — one request, stdlib only."""
    params = urllib.parse.urlencode(
        {
            "engine": "google_scholar_author",
            "author_id": author_id,
            "api_key": api_key,
            "num": 100,
            "hl": "en",
        }
    )
    url = f"https://serpapi.com/search.json?{params}"
    with urllib.request.urlopen(url, timeout=60) as response:
        data = json.load(response)
    if data.get("error"):
        raise RuntimeError(f"SerpAPI error: {data['error']}")

    table = (data.get("cited_by") or {}).get("table") or []

    def metric(name: str) -> int:
        for row in table:
            if name in row:
                return int(row[name].get("all") or 0)
        return 0

    pubs = []
    for article in data.get("articles") or []:
        pub_id = article.get("citation_id")
        if not pub_id:
            continue
        try:
            year = int(article.get("year"))
        except (TypeError, ValueError):
            year = None
        pubs.append(
            {
                "id": pub_id,
                "title": article.get("title", ""),
                "year": year,
                "num_citations": int((article.get("cited_by") or {}).get("value") or 0),
            }
        )
    pubs.sort(key=lambda p: p["id"])
    graph = {
        str(point["year"]): int(point.get("citations") or 0)
        for point in (data.get("cited_by") or {}).get("graph") or []
        if point.get("year") is not None
    }
    return {
        "fetched_at": date.today().isoformat(),
        "citations_total": metric("citations"),
        "h_index": metric("h_index"),
        "i10_index": metric("i10_index"),
        "citations_per_year": graph,
        "publications": pubs,
    }


def _build_payload(author: dict) -> dict:
    pubs = []
    for pub in author.get("publications", []):
        pub_id = pub.get("author_pub_id")
        if not pub_id:
            continue
        bib = pub.get("bib", {})
        raw_year = bib.get("pub_year")
        try:
            year = int(raw_year) if raw_year is not None else None
        except (TypeError, ValueError):
            year = None
        pubs.append(
            {
                "id": pub_id,
                "title": bib.get("title", ""),
                "year": year,
                "num_citations": int(pub.get("num_citations") or 0),
            }
        )
    pubs.sort(key=lambda p: p["id"])
    cites_per_year = {
        str(year): int(count)
        for year, count in (author.get("cites_per_year") or {}).items()
    }
    return {
        "fetched_at": date.today().isoformat(),
        "citations_total": int(author.get("citedby") or 0),
        "h_index": int(author.get("hindex") or 0),
        "i10_index": int(author.get("i10index") or 0),
        "citations_per_year": cites_per_year,
        "publications": pubs,
    }


def _sanity_problems(new: dict, prev: dict | None) -> list[str]:
    problems = []
    if not new["publications"]:
        problems.append("publication list is empty")
    if new["citations_total"] <= 0:
        problems.append("citations_total is not positive")
    if prev:
        prev_total = int(prev.get("citations_total") or 0)
        if prev_total > 0 and new["citations_total"] < 0.7 * prev_total:
            problems.append(
                f"citations_total dropped {prev_total} -> {new['citations_total']}"
            )
        prev_count = len(prev.get("publications") or [])
        if len(new["publications"]) < prev_count - 2:
            problems.append(
                f"publication count dropped {prev_count} -> {len(new['publications'])}"
            )
    return problems


def _write_json(path: Path, payload: object) -> None:
    text = json.dumps(payload, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    tmp.replace(path)


def _bootstrap_seed(author: dict) -> list[dict]:
    from scholarly import scholarly

    pubs = author.get("publications", [])
    detailed = []
    for index, pub in enumerate(pubs, start=1):
        title = pub.get("bib", {}).get("title", "?")
        print(f"[scholar] filling {index}/{len(pubs)}: {title}")
        try:
            full = scholarly.fill(pub)
        except Exception as exc:
            print(f"[scholar]   fill failed ({exc!r}); keeping summary", file=sys.stderr)
            full = pub
        bib = full.get("bib", {})
        detailed.append(
            {
                "author_pub_id": full.get("author_pub_id"),
                "title": bib.get("title"),
                "authors": bib.get("author"),
                "year": bib.get("pub_year"),
                "venue": bib.get("citation"),
                "journal": bib.get("journal"),
                "volume": bib.get("volume"),
                "number": bib.get("number"),
                "pages": bib.get("pages"),
                "publisher": bib.get("publisher"),
                "abstract": bib.get("abstract"),
                "pub_url": full.get("pub_url"),
                "num_citations": full.get("num_citations"),
            }
        )
        time.sleep(1.5)
    return detailed


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--author", default=AUTHOR_ID)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--bootstrap",
        action="store_true",
        help=f"also write full publication metadata to {SEED_OUTPUT.name}",
    )
    parser.add_argument(
        "--force", action="store_true", help="write even if the sanity gate fails"
    )
    args = parser.parse_args()

    api_key = os.environ.get("SERPAPI_KEY")
    author = None
    payload = None

    if api_key and not args.bootstrap:
        print("[scholar] using SerpAPI backend")
        try:
            payload = _fetch_serpapi_payload(args.author, api_key)
        except Exception as exc:
            print(
                f"[scholar] SerpAPI failed ({exc!r}); falling back to scholarly",
                file=sys.stderr,
            )

    if payload is None:
        try:
            author = _fetch_with_retries(args.author)
        except RuntimeError as exc:
            print(f"[scholar] {exc}", file=sys.stderr)
            sys.exit(1)
        payload = _build_payload(author)

    prev = None
    if args.output.exists():
        try:
            prev = json.loads(args.output.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            prev = None

    problems = _sanity_problems(payload, prev)
    if problems and not args.force:
        for problem in problems:
            print(f"[scholar] sanity gate: {problem}", file=sys.stderr)
        print(
            "[scholar] refusing to overwrite (use --force to override)",
            file=sys.stderr,
        )
        sys.exit(1)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    _write_json(args.output, payload)
    print(
        f"[scholar] wrote {args.output}: {payload['citations_total']} citations, "
        f"h-index {payload['h_index']}, {len(payload['publications'])} publications"
    )

    if args.bootstrap:
        if author is None:
            print("[scholar] --bootstrap requires the scholarly backend", file=sys.stderr)
            sys.exit(1)
        seed = _bootstrap_seed(author)
        _write_json(SEED_OUTPUT, seed)
        print(
            f"[scholar] wrote {SEED_OUTPUT} — use it to author src/content/papers/ "
            "entries (set each scholar_id to the author_pub_id)"
        )


if __name__ == "__main__":
    main()
