#!/usr/bin/env python3
"""Dump DAAD programmes grouped by every 'Course of Study' filter node.

Usage:
  python3 scripts/daad_course_of_study.py "Paderborn University"
  python3 scripts/daad_course_of_study.py "Paderborn University" --degreeType 37 --institutionType 2

Writes daad_course_of_study.md (nested lists) and daad_course_of_study.csv.
"""
import argparse, csv, json, ssl, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

PAGE = 100  # API returns [] for limit > 100

API = "https://api.daad.de/api/ajax/hsk/list/en"

try:  # python.org builds on macOS ship without a CA bundle
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = None


def fetch(params):
    url = API + "?" + urllib.parse.urlencode(params, doseq=True)
    req = urllib.request.Request(url, headers={"accept": "application/json",
                                               "user-agent": "Mozilla/5.0"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
                return json.load(r)
        except Exception as e:
            if attempt == 2:
                raise
            print(f"  retry ({e})", file=sys.stderr)
            time.sleep(2 * (attempt + 1))


def walk(nodes, trail=()):
    """Yield (trail_of_labels, value, count) for every node with results."""
    for n in nodes:
        t = trail + (n["label"],)
        if n.get("count"):
            yield t, n["value"], n["count"]
        yield from walk(n.get("children", []), t)


def programmes(base, value, count):
    p = dict(base, **{"hec-subjectGroup": value, "hec-limit": PAGE, "hec-offset": 0})
    out = []
    while len(out) < count:
        items = fetch(p)["results"]["items"]
        if not items:
            break
        out += [(i.get("subline", ""), i.get("headline", "")) for i in items]
        p["hec-offset"] += PAGE
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query", nargs="?", default="", help="search term, e.g. university name")
    ap.add_argument("--degreeType")
    ap.add_argument("--institutionType")
    ap.add_argument("--teachingLanguage")
    ap.add_argument("--out", default="daad_course_of_study")
    a = ap.parse_args()

    base = {"hec-limit": 1}
    if a.query:
        base["hec-q"] = a.query
    for k in ("degreeType", "institutionType", "teachingLanguage"):
        if getattr(a, k):
            base["hec-" + k] = getattr(a, k)

    facets = fetch(base)["filters"]["facets"]["items"]
    tree = next(f for f in facets if f["name"] == "hec-subjectGroup")["data"]

    nodes = list(walk(tree))
    print(f"{len(nodes)} filter nodes, {sum(n[2] for n in nodes)} rows to fetch", file=sys.stderr)
    with ThreadPoolExecutor(8) as ex:
        listings = list(ex.map(lambda n: programmes(base, n[1], n[2]), nodes))

    md, rows = [f"# Course of Study — {a.query or 'all'}\n"], []
    for (trail, value, count), listing in zip(nodes, listings):
        md.append(f"\n{'#' * min(len(trail) + 1, 6)} {' > '.join(trail)} ({count})\n")
        md.append("| Sr No | University | Course |")
        md.append("|---|---|---|")
        for sr, (uni, course) in enumerate(listing, 1):
            md.append(f"| {sr} | {uni} | {course} |")
            rows.append([" > ".join(trail[:1]), " > ".join(trail[1:]) or "-", sr, uni, course])

    open(a.out + ".md", "w").write("\n".join(md) + "\n")
    with open(a.out + ".csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Main filter", "Sub filter", "Sr No", "University", "Course"])
        w.writerows(rows)
    print(f"wrote {a.out}.md and {a.out}.csv ({len(rows)} rows)", file=sys.stderr)


if __name__ == "__main__":
    main()
