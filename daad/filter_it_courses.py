#!/usr/bin/env python3
"""Keep only IT/CS/data/tech-management courses from a daad_course_of_study CSV.

Matches on the COURSE name (so Computer Engineering under Electrical Engineering
still counts), dedupes each University+Course to one row, keeping the deepest
filter path.

  python3 filter_it_courses.py daad_all_courses_english.csv it_courses
"""
import csv, re, sys

TERMS = """
Computer Science|Computer Engineering|Computer Science and Engineering|Computing|
Computational Science|Computer Technology|Computer Systems|Computer Systems Engineering|
Computer Applications|Information Technology|Information Systems|Information Systems Management|
Information Technology Management|Management Information Systems|Information Management|
IT Management|Software Engineering|Software Systems|Software Technology|Software Development|
Computer Networks|Network Engineering|Network Computing|Computer Networking|Cyber Systems|
Cybersecurity|Cyber Security|Systems Engineering|Systems Administration|Internet Computing|
Cloud Computing|Cloud Engineering|Cloud Technology|Cloud Architecture|Cloud Infrastructure|
Cloud Systems|Distributed Systems|Distributed Computing|Edge Computing|High Performance Computing|
Parallel Computing|Grid Computing|Virtualization|Data Science|Data Analytics|Data Engineering|
Big Data|Big Data Analytics|Business Analytics|Business Intelligence|
Business Intelligence and Analytics|Data Mining|Data Management|Data and Information Management|
Applied Data Science|Computational Data Science|Statistical Computing|Analytics Engineering|
Digital Analytics|Management Analytics|Decision Analytics|Decision Science|Data-Driven Management|
Quantitative Management|Artificial Intelligence|AI|Machine Learning|Deep Learning|
Computational Intelligence|Intelligent Systems|Computer Vision|Natural Language Processing|
Robotics|Autonomous Systems|Internet of Things|IoT|Embedded Systems|Quantum Computing|
Human-Computer Interaction|Business Computing|Business Technology|Business Information Systems|
Business Information Technology|Computing for Business|Computer Science for Business|
Computer Science and Business|Computer Science and Business Management|Computing and Business|
Computing and Business Management|Computer Science and Management|Computing and Management|
Information Technology and Business|Information Technology and Management|
Information Systems and Business|Information Systems and Management|
Information Technology for Business|Digital Business|Digital Business Management|
Digital Technology Management|Digital Management|Digital Transformation|Digital Innovation|
Digital Strategy|Technology Management|Technology Strategy|Technology Leadership|
Technology and Innovation Management|Innovation Management|Engineering Management|
IT Project Management|Technology Project Management|Software Project Management|Project Management|
Operations Management|Operations Research|Operations Analytics|Operations Research and Management|
Management Science|Business Management|Business Administration|Strategic Management|
Enterprise Management|Process Management|Knowledge Management|Supply Chain Management|
Digital Transformation Management
""".replace("\n", "").split("|")
TERMS = sorted({t.strip() for t in TERMS if t.strip()}, key=len, reverse=True)

# \b so "AI"/"IoT" don't match inside Sustainable/Biotechnology; - and space interchangeable
PAT = re.compile("|".join(r"\b" + re.escape(t).replace(r"\ ", "[ -]").replace(r"\-", "[ -]") + r"\b"
                          for t in TERMS), re.I)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else "daad_all_courses_english.csv"
    out = sys.argv[2] if len(sys.argv) > 2 else "it_courses"

    best = {}  # (uni, course) -> (depth, path)
    for r in csv.DictReader(open(src)):
        sub = r["Sub filter"]
        hit = PAT.search(f'{r["Main filter"]} {sub} {r["Course"]}')  # anywhere in the line
        if not hit:
            continue
        path = " -> ".join([r["Main filter"]] + ([] if sub == "-" else sub.split(" > ")))
        key = (r["University"], r["Course"])
        depth = path.count("->")
        if key not in best or depth > best[key][0]:
            best[key] = (depth, path, hit.group(0))

    rows = sorted(((v[1], u, c, v[2]) for (u, c), v in best.items()))
    with open(out + ".csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["Sr No", "Filter path", "University", "Course", "Matched term"])
        for sr, (path, uni, course, term) in enumerate(rows, 1):
            w.writerow([sr, path, uni, course, term])

    md = [f"# IT / CS / Data / Tech-Management courses ({len(rows)})\n",
          "| Sr No | Filter path | University | Course |", "|---|---|---|---|"]
    md += [f"| {sr} | {p} | {u} | {c} |" for sr, (p, u, c, _) in enumerate(rows, 1)]
    open(out + ".md", "w").write("\n".join(md) + "\n")
    print(f"wrote {out}.csv and {out}.md ({len(rows)} unique university+course)")


if __name__ == "__main__":
    main()
