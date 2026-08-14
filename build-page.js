const fs = require("node:fs");
const { programmes, profile } = require("./output/shortlist/shortlist.json");

const rows = programmes.map((p) => ({
  r: p.rank,
  f: p.fit,
  v: p.verdict,
  t: p.type,
  u: p.university,
  c: p.course,
  d: (p.degree || "").replace(/, Master$/, ""),
  loc: [p.universityCity, p.universityState].filter(Boolean).join(", "),
  tags: p.domainHits,
  focus: (p.focus || "").slice(0, 180),
  fee: p.feePerYear,
  sem: p.admissionSemester,
  open: /Without admission restriction/i.test(p.admissionModus || ""),
  ects: p.ects.status,
  spec: p.specialised,
  url: p.detailUrl,
  why: p.why,
  watch: p.watch,
}));

const byType = rows.reduce((a, r) => ({ ...a, [r.t]: (a[r.t] || 0) + 1 }), {});
const stats = {
  total: rows.length,
  open: rows.filter((r) => r.open).length,
  spec: rows.filter((r) => r.spec).length,
  ectsOk: rows.filter((r) => r.ects === "ok" || r.ects === "bridgeable").length,
  ectsUnknown: rows.filter((r) => r.ects === "unstated").length,
  free: rows.filter((r) => !r.fee).length,
  byType,
};

// Standalone document so it opens straight from the filesystem, no server.
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Studienplatz Ledger</title>
<style>
:root{
  --paper:#F3F4F1; --card:#FBFBF9; --ink:#191C1A; --muted:#6B7370; --rule:#DEE1DB;
  --accent:#2E5D4E; --accent-soft:#E4EDE8;
  --ok:#3F7A5E; --warn:#A8722A; --stop:#9B3A32;
  --shadow:0 1px 2px rgba(25,28,26,.06);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --paper:#141715; --card:#1B1F1C; --ink:#E8EAE6; --muted:#8B938E; --rule:#2B312D;
    --accent:#74A98F; --accent-soft:#22302A;
    --ok:#6FB08E; --warn:#D2A05C; --stop:#D4736A;
    --shadow:0 1px 2px rgba(0,0,0,.4);
  }
}
:root[data-theme="dark"]{
  --paper:#141715; --card:#1B1F1C; --ink:#E8EAE6; --muted:#8B938E; --rule:#2B312D;
  --accent:#74A98F; --accent-soft:#22302A;
  --ok:#6FB08E; --warn:#D2A05C; --stop:#D4736A;
  --shadow:0 1px 2px rgba(0,0,0,.4);
}
*{box-sizing:border-box}
body{
  margin:0; background:var(--paper); color:var(--ink);
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
  font-size:15px; line-height:1.55; -webkit-font-smoothing:antialiased;
}
.wrap{max-width:1220px; margin:0 auto; padding:44px 24px 80px; display:flex; flex-direction:column; gap:30px}
h1{
  font-family:ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  font-size:clamp(30px,4.4vw,46px); font-weight:600; letter-spacing:-.018em;
  margin:0; text-wrap:balance;
}
.lede{margin:0; color:var(--muted); max-width:62ch}
.eyebrow{
  font-size:11px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--accent); font-weight:650; margin:0 0 10px;
}
.gates{display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:1px;
  background:var(--rule); border:1px solid var(--rule); border-radius:9px; overflow:hidden}
.gate{background:var(--card); padding:14px 16px; display:flex; flex-direction:column; gap:3px}
.gate b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:22px; font-weight:600;
  font-variant-numeric:tabular-nums; letter-spacing:-.02em}
.gate span{font-size:11.5px; color:var(--muted); letter-spacing:.03em}
.note{
  border-left:2px solid var(--warn); background:var(--card); border-radius:0 8px 8px 0;
  padding:14px 18px; display:flex; flex-direction:column; gap:6px; box-shadow:var(--shadow);
}
.note h2{margin:0; font-size:13px; letter-spacing:.05em; text-transform:uppercase; color:var(--warn)}
.note p{margin:0; font-size:14px; color:var(--ink)}
.note p+p{color:var(--muted)}
.controls{display:flex; flex-wrap:wrap; gap:9px; align-items:center}
button.chip,input.search{
  font:inherit; font-size:13px; color:var(--ink); background:var(--card);
  border:1px solid var(--rule); border-radius:99px; padding:7px 15px; cursor:pointer;
}
button.chip[aria-pressed="true"]{background:var(--accent); border-color:var(--accent); color:var(--paper)}
input.search{cursor:text; min-width:230px; flex:1; border-radius:8px}
button.chip:focus-visible,input.search:focus-visible,a:focus-visible{outline:2px solid var(--accent); outline-offset:2px}
.tablewrap{overflow-x:auto; border:1px solid var(--rule); border-radius:9px; background:var(--card); box-shadow:var(--shadow)}
table{border-collapse:collapse; width:100%; min-width:900px}
thead th{
  position:sticky; top:0; background:var(--card); z-index:2; text-align:left;
  font-size:10.5px; letter-spacing:.11em; text-transform:uppercase; color:var(--muted);
  font-weight:650; padding:11px 12px; border-bottom:1px solid var(--rule); white-space:nowrap;
}
tbody td{padding:11px 12px; border-bottom:1px solid var(--rule); vertical-align:top}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--accent-soft)}
.num{font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums;
  font-size:13px; color:var(--muted)}
.fit{font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums;
  font-weight:600; font-size:14px}
.course{font-weight:560; line-height:1.35}
.course a{color:inherit; text-decoration:none; border-bottom:1px solid var(--rule)}
.course a:hover{border-bottom-color:var(--accent); color:var(--accent)}
.sub{display:block; color:var(--muted); font-size:12.5px; margin-top:3px; font-weight:400}
.uni{line-height:1.35}
.pill{
  display:inline-block; font-size:11px; letter-spacing:.04em; padding:2.5px 9px;
  border-radius:99px; border:1px solid var(--rule); white-space:nowrap;
}
.pill.TU{color:var(--accent); border-color:var(--accent)}
.pill.Hochschule{color:var(--ok); border-color:var(--ok)}
.pill.Private{color:var(--warn); border-color:var(--warn)}
.marks{display:flex; flex-wrap:wrap; gap:4px}
.mark{font-size:10.5px; letter-spacing:.05em; text-transform:uppercase; padding:2px 7px;
  border-radius:4px; background:var(--accent-soft); color:var(--accent); white-space:nowrap}
.mark.ok{background:transparent; color:var(--ok); border:1px solid var(--ok)}
.mark.fee{background:transparent; color:var(--warn); border:1px solid var(--warn)}
.count{font-size:13px; color:var(--muted); font-variant-numeric:tabular-nums}
.tabs{display:flex; gap:2px; border-bottom:1px solid var(--rule)}
button.tab{
  font:inherit; font-size:14px; font-weight:560; color:var(--muted); background:none;
  border:0; border-bottom:2px solid transparent; padding:9px 15px; cursor:pointer; margin-bottom:-1px;
}
button.tab[aria-selected="true"]{color:var(--accent); border-bottom-color:var(--accent)}
button.tab:focus-visible{outline:2px solid var(--accent); outline-offset:2px}
section{display:flex; flex-direction:column; gap:14px}
.cards{display:flex; flex-direction:column; gap:12px}
.card{border:1px solid var(--rule); border-radius:10px; background:var(--card); box-shadow:var(--shadow); overflow:hidden}
.cardhead{display:flex; gap:14px; align-items:flex-start; padding:15px 18px; border-bottom:1px solid var(--rule)}
.rank{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums;
  font-size:13px; color:var(--muted); min-width:2.2ch; padding-top:4px;
}
.cardtitle{flex:1; min-width:0}
.cardtitle h3{
  margin:0; font-size:17px; font-weight:600; line-height:1.3; text-wrap:balance;
  font-family:ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
}
.cardtitle h3 a{color:inherit; text-decoration:none; border-bottom:1px solid var(--rule)}
.cardtitle h3 a:hover{color:var(--accent); border-bottom-color:var(--accent)}
.cardtitle p{margin:4px 0 0; font-size:13px; color:var(--muted)}
.cardmeta{display:flex; align-items:center; gap:10px; flex-shrink:0}
.score{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums;
  font-size:21px; font-weight:600; color:var(--accent); letter-spacing:-.02em;
}
.cardbody{display:grid; grid-template-columns:1.35fr 1fr; gap:1px; background:var(--rule)}
.col{background:var(--card); padding:14px 18px 16px; display:flex; flex-direction:column; gap:9px}
.col h4{
  margin:0; font-size:10.5px; letter-spacing:.11em; text-transform:uppercase;
  color:var(--muted); font-weight:650;
}
ul.why,ul.watch{margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:7px}
ul.why li{display:flex; gap:10px; align-items:baseline; font-size:13.5px; line-height:1.45}
.pts{
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-variant-numeric:tabular-nums;
  font-size:12.5px; font-weight:600; min-width:3.5ch; text-align:right; flex-shrink:0;
}
.pts.up{color:var(--ok)} .pts.down{color:var(--stop)}
ul.why li.total{border-top:1px solid var(--rule); padding-top:7px; color:var(--muted)}
ul.watch li{
  font-size:13px; line-height:1.45; padding-left:14px; position:relative; color:var(--ink);
}
ul.watch li::before{content:"⚠"; position:absolute; left:0; color:var(--warn); font-size:11px; top:2px}
.clear{margin:0; font-size:13px; color:var(--ok)}
.focusline{margin:4px 0 0; font-size:12.5px; color:var(--muted); line-height:1.45}
@media (max-width:760px){ .cardbody{grid-template-columns:1fr} }
footer{color:var(--muted); font-size:13px; border-top:1px solid var(--rule); padding-top:18px}
footer code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px}
@media (max-width:640px){ .wrap{padding:28px 14px 60px} }
</style>
</head>
<body>

<div class="wrap">
  <header>
    <p class="eyebrow">Master's in Germany · English-taught · scraped from DAAD</p>
    <h1>Studienplatz Ledger</h1>
    <p class="lede">Every programme in computer science, computer engineering and data science,
    ranked by how likely you are to get in — not by how famous the university is.</p>
  </header>

  <div class="gates">
    <div class="gate"><b>${stats.total}</b><span>programmes in your fields</span></div>
    <div class="gate"><b>${stats.open}</b><span>open admission, no NC</span></div>
    <div class="gate"><b>${stats.spec}</b><span>cloud / distributed / SE slant</span></div>
    <div class="gate"><b>${stats.free}</b><span>no tuition fee listed</span></div>
    <div class="gate"><b>${stats.ectsUnknown}</b><span>ECTS rule unstated</span></div>
  </div>

  <div class="note">
    <h2>Two things this table cannot tell you</h2>
    <p><b>dMAT.</b> Your B.E. is an engineering qualification, so the test is mandatory for
    Summer&nbsp;2027 and later. Register by <b>15 Sep 2026</b>, exam 26 Sep, certificate 12 Oct.
    €375 including APS. It applies to every row equally — it is not a way to choose between them.</p>
    <p><b>Deadlines.</b> Deliberately not shown. DAAD publishes them at month precision, mostly for
    cycles already past, and its “5 days left” text is computed at scrape time. Open the DAAD link
    and check the university's own page for every programme you actually apply to.</p>
  </div>

  <div class="tabs" role="tablist">
    <button class="tab" role="tab" data-view="top" aria-selected="true">Top 30 matches</button>
    <button class="tab" role="tab" data-view="all" aria-selected="false">Full list · ${stats.total}</button>
  </div>

  <section id="view-top">
    <p class="lede" style="margin-bottom:6px">The 30 highest-scoring programmes, with the exact reason each one
    is here and what to check before you apply. Every point is accounted for — the numbers add up to the score.</p>
    <div class="cards" id="cards"></div>
  </section>

  <section id="view-all" hidden>
  <div class="controls">
    <button class="chip" data-type="all" aria-pressed="true">All ${stats.total}</button>
    <button class="chip" data-type="Hochschule" aria-pressed="false">Hochschule ${byType.Hochschule || 0}</button>
    <button class="chip" data-type="TU" aria-pressed="false">TU ${byType.TU || 0}</button>
    <button class="chip" data-type="University" aria-pressed="false">University ${byType.University || 0}</button>
    <button class="chip" data-type="Private" aria-pressed="false">Private ${byType.Private || 0}</button>
    <button class="chip" data-flag="open" aria-pressed="false">No NC only</button>
    <input class="search" type="search" placeholder="Search course, university or city…" aria-label="Search" />
  </div>
  <p class="count" id="count"></p>

  <div class="tablewrap">
    <table>
      <thead><tr>
        <th>#</th><th>Fit</th><th>Course</th><th>University</th><th>Type</th><th>Signals</th>
      </tr></thead>
      <tbody id="body"></tbody>
    </table>
  </div>
  </section>

  <footer>
    Grade ${profile.grade} (modified Bavarian) · 180 ECTS · ${profile.workMonths} months experience.
    Scraped ${profile.scrapedAt.slice(0, 10)} from DAAD. Regenerate with <code>node shortlist.js</code>.
  </footer>
</div>

<script>
const ROWS = ${JSON.stringify(rows)};
const body = document.getElementById("body");
const count = document.getElementById("count");
let type = "all", openOnly = false, q = "";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function marks(r) {
  const m = [];
  if (r.open) m.push('<span class="mark ok">no NC</span>');
  if (r.spec) m.push('<span class="mark">specialised</span>');
  if (r.ects === "ok") m.push('<span class="mark ok">180 ECTS ok</span>');
  if (r.ects === "bridgeable") m.push('<span class="mark">ECTS bridgeable</span>');
  if (/Summer and Winter/i.test(r.sem)) m.push('<span class="mark">2 intakes</span>');
  if (r.fee) m.push('<span class="mark fee">€' + r.fee.toLocaleString() + '/yr</span>');
  return '<div class="marks">' + m.join("") + "</div>";
}

function render() {
  const list = ROWS.filter((r) => {
    if (type !== "all" && r.t !== type) return false;
    if (openOnly && !r.open) return false;
    if (!q) return true;
    return (r.c + " " + r.u + " " + r.loc + " " + r.tags + " " + r.focus).toLowerCase().includes(q);
  });
  count.textContent = list.length + " of " + ROWS.length + " programmes";
  body.innerHTML = list.map((r) => \`<tr>
    <td class="num">\${r.r}</td>
    <td class="fit">\${r.f}</td>
    <td class="course"><a href="\${esc(r.url)}" target="_blank" rel="noopener">\${esc(r.c)}</a>
      <span class="sub">\${esc(r.d)}\${r.tags ? " · " + esc(r.tags) : ""}</span></td>
    <td class="uni">\${esc(r.u)}<span class="sub">\${esc(r.loc)}</span></td>
    <td><span class="pill \${r.t}">\${r.t}</span></td>
    <td>\${marks(r)}</td>
  </tr>\`).join("");
}

document.querySelectorAll("button.chip").forEach((b) => {
  b.addEventListener("click", () => {
    if (b.dataset.flag === "open") {
      openOnly = !openOnly;
      b.setAttribute("aria-pressed", String(openOnly));
    } else {
      type = b.dataset.type;
      document.querySelectorAll("button.chip[data-type]").forEach((o) =>
        o.setAttribute("aria-pressed", String(o === b)));
    }
    render();
  });
});
document.querySelector("input.search").addEventListener("input", (e) => {
  q = e.target.value.toLowerCase().trim();
  render();
});

// ---- Top 30: the score, itemised
function renderTop() {
  document.getElementById("cards").innerHTML = ROWS.slice(0, 30).map((r) => \`<article class="card">
    <div class="cardhead">
      <span class="rank">\${r.r}</span>
      <div class="cardtitle">
        <h3><a href="\${esc(r.url)}" target="_blank" rel="noopener">\${esc(r.c)}</a></h3>
        <p>\${esc(r.u)} · \${esc(r.loc || "—")} · \${esc(r.d)}</p>
      </div>
      <div class="cardmeta">
        <span class="pill \${r.t}">\${r.t}</span>
        <span class="score">\${r.f}</span>
      </div>
    </div>
    <div class="cardbody">
      <div class="col">
        <h4>What earns the points</h4>
        <ul class="why">\${r.why.map((w) => \`<li>
          <span class="pts \${w.pts > 0 ? "up" : "down"}">\${w.pts > 0 ? "+" : ""}\${w.pts}</span>
          <span>\${esc(w.label)}</span></li>\`).join("")}
          <li class="total"><span class="pts">= \${r.f}</span><span>fit score</span></li>
        </ul>
      </div>
      <div class="col">
        <h4>Keep in mind</h4>
        \${r.watch.length
          ? '<ul class="watch">' + r.watch.map((w) => "<li>" + esc(w) + "</li>").join("") + "</ul>"
          : '<p class="clear">Nothing outstanding in the DAAD record.</p>'}
        \${r.focus ? '<p class="focusline"><b>Focus:</b> ' + esc(r.focus) + "</p>" : ""}
      </div>
    </div>
  </article>\`).join("");
}

document.querySelectorAll("button.tab").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll("button.tab").forEach((o) => o.setAttribute("aria-selected", String(o === t)));
    document.getElementById("view-top").hidden = t.dataset.view !== "top";
    document.getElementById("view-all").hidden = t.dataset.view !== "all";
  });
});

renderTop();
render();
</script>
</body>
</html>
`;

const out = process.argv[2] || "output/shortlist/shortlist.html";
fs.writeFileSync(out, html);
console.log("wrote", out, (html.length / 1024).toFixed(0) + "KB");
