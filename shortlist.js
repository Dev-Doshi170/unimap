// Ranks DAAD programmes against one fixed profile (Dev Doshi).
// Run: node shortlist.js  [--all] [--min 40]
//
// Deadlines are deliberately NOT scored. DAAD publishes them at month
// precision, mostly for cycles already past, and renders "5 days left" style
// text computed at scrape time. Check dates on the university site instead.
const fs = require("node:fs");
const path = require("node:path");
const { exportJson } = require("./src/exporter");

const MASTER_PATH = path.join(__dirname, "output", "all-daad-master.json");
const OUT_DIR = path.join(__dirname, "output", "shortlist");

// ---------------------------------------------------------------- profile
const PROFILE = {
  // Diploma 2018-21 (post-10th, vocational -> 0 tertiary ECTS) then lateral
  // entry BE 2021-24, semesters 3-8 = 3 full-time years x 60 = 180 ECTS.
  // 30 short of the common 210 bar. Confirm against anabin before trusting it.
  ects: 180,
  cgpa: 7.38,
  cgpaScale: { max: 10, pass: 4 },
  // Qpaix Jul-2024 -> Zignuts, continuous. Recomputed against the scrape date.
  workStart: "2024-07-01",
  // Field of study, matched against DAAD's own areaOfStudy taxonomy (exact tags,
  // not substrings). Weight 3 = his degree field, 2 = adjacent and still
  // admissible with a Computer Engineering BE, 1 = only worth it in combination.
  fields: {
    3: [
      "Computer Science",
      "Applied Computer Science",
      "Practical Computer Science",
      "Theoretical Computer Science",
      "Computer Engineering",
      "Data Science",
      "Software Engineering",
      "Engineering Informatics",
    ],
    2: [
      "Artificial Intelligence",
      "Information Technology",
      "Media Informatics",
      "Medical Informatics",
      "Geoinformatics",
      "Bioinformatics",
      "Robotics",
      "Systems Engineering",
      "Information Systems and Management",
      "Computational Linguistics",
      "Microelectronics",
      "Communications Technology",
      "Automation Technology",
      "Mechatronics",
    ],
    1: ["Mathematics", "Applied Mathematics", "Statistics", "Electrical Engineering", "Technology Management"],
  },
  // Career direction on top of the field — a bonus, never a gate.
  specialisations: /cloud|devops|distributed|microservice|kubernetes|software (engineering|technology|development|architecture)|enterprise|backend|scalab|high integrity|\bsap\b/i,
};

// Modified Bavarian formula: German grade from an Indian CGPA.
function germanGrade({ cgpa, cgpaScale: { max, pass } }) {
  return +(1 + (3 * (max - cgpa)) / (max - pass)).toFixed(2);
}

function monthsSince(isoDate, asOf) {
  const a = new Date(isoDate);
  const b = new Date(asOf);
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

// dMAT (digital Master Test, run by g.a.s.t. as part of APS India). Mandatory
// for Indian master's applicants with an engineering, commerce, finance,
// economics, business or management bachelor. A B.E./B.Tech counts; a
// standalone B.Sc. CS or BCA does not. Not a per-university requirement, so it
// never appears in DAAD - it is a fixed cost here, not a filter.
const DMAT = {
  registrationCloses: "2026-09-15",
  examDate: "2026-09-26",
  certificateIssued: "2026-10-12",
  costEur: 150 + 225, // dMAT + APS
};

// DAAD leaves "Focus" empty on ~36% of records, so a programme's real
// specialisation is often invisible to the scraper. config/focus-overrides.json
// holds what was read off each university's own page; "" records a page that
// was checked and publishes nothing, so it is not looked up again.
const FOCUS = Object.fromEntries(
  Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, "config", "focus-overrides.json"), "utf8")))
    .filter(([k, v]) => !k.startsWith("_") && v),
);

// ---------------------------------------------------------------- signals
// Fee-charging private institutions. Kept as a name list because fees alone
// do not separate them - KIT, RWTH and Mannheim are public and still charge
// 13-18k for some international master's.
const PRIVATE = /IU International|SRH|University of Europe|Fresenius|GISMA|Arden|Macromedia|CODE University|XU Exponential|EU Business|Bayerischen Wirtschaft|Constructor University|ESMT|Hertie School|Media Design University/i;
const RE = {
  ects: /(\d{3})\s*(?:ECTS|credit|CP\b)|four[- ]year|4[- ]year|eight semesters/gi,
  // Several programmes explicitly let a 180-ECTS applicant close the gap.
  ectsEscape: /less than 210|180 credit points must|catching up on defined modules|may be recognised|missing credit points|additional 30 credit/i,
  workExp: /work(ing)? experience|professional experience|years of (relevant )?(work|professional)/i,
  ielts: /IELTS|TOEFL|\bC1\b|\bB2\b/i,
  gre: /\bGRE\b|\bGMAT\b/i,
  restricted: /with admission restriction|numerus clausus/i,
};

// Institution category. Order matters: private first (most decision-relevant),
// then TU, then the applied-sciences family, else a plain university.
function uniType(p) {
  if (PRIVATE.test(p.university)) return "Private";
  if (/Technical University|Technische Universität|Technische Universitaet|^TU |Institute of Technology|RWTH/i.test(p.university)) {
    return "TU";
  }
  if (p.dataset === "applied_sciences" || /Applied Sciences|Hochschule|Fachhochschule|^FH /i.test(p.university)) {
    return "Hochschule";
  }
  return "University";
}

function admissionText(p) {
  return [p.admissionRequirements, p.annotation, p.admissionModus].filter(Boolean).join(" ");
}

// Everything DAAD gives us as "549.00 EUR / Month", "1,500.00 EUR / semester",
// "16,250.00 EUR / total" -> one comparable EUR/year number.
function feePerYear(p) {
  const raw = `${p.tuitionFee || ""} ${p.tuitionFeeTotal || ""}`;
  const m = raw.match(/([\d.,]+)\s*EUR\s*\/\s*(month|semester|total|year)/i);
  if (!m) return null;
  const amount = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;
  const perYear = { month: 12, semester: 2, year: 1, total: 0.5 }[m[2].toLowerCase()];
  return Math.round(amount * perYear);
}

// Highest ECTS figure the programme demands, vs what the profile actually has.
// A stated bar beats the vague "4-year bachelor" phrasing.
function ectsGate(text, have) {
  const nums = [...text.matchAll(RE.ects)].map((m) => Number(m[1])).filter((n) => n >= 150 && n <= 300);
  const demand = nums.length ? Math.max(...nums) : /four[- ]year|4[- ]year|eight semesters/i.test(text) ? 240 : null;
  if (demand === null) return { demand: null, status: "unstated" };
  if (have >= demand) return { demand, status: "ok" };
  return { demand, status: RE.ectsEscape.test(text) ? "bridgeable" : "short" };
}

function domainScore(p) {
  // Fall back to the flattened string for records scraped before areaOfStudyTags.
  const tags = p.areaOfStudyTags?.length ? p.areaOfStudyTags : (p.areaOfStudy || "").split(", ").filter(Boolean);

  let best = 0;
  const hits = [];
  for (const [weight, list] of Object.entries(PROFILE.fields)) {
    for (const tag of tags) {
      if (list.includes(tag)) {
        best = Math.max(best, Number(weight));
        hits.push(tag);
      }
    }
  }
  const spec = PROFILE.specialisations.test(`${p.course} ${p.focus || ""}`);
  return { best, hits: [...new Set(hits)], spec };
}

// ---------------------------------------------------------------- scoring
// Raise to shrink the APPLY bucket, lower to widen it.
const APPLY_AT = 70;

const FIELD_LABEL = { 3: "your exact degree field", 2: "adjacent field, still admissible", 1: "peripheral field" };

function score(p, ctx) {
  // why  = what moved the score, with the points, so a rank is auditable
  // watch = things to verify yourself; they carry no points
  const why = [];
  const watch = [];
  let points = 0;
  const add = (pts, label) => {
    points += pts;
    why.push({ pts, label });
  };

  const text = admissionText(p);
  const { best: domain, hits, spec } = domainScore(p);
  if (domain === 0) return null; // not in his field at all

  add(domain * 14, `${hits.join(", ")} — ${FIELD_LABEL[domain]}`);
  if (spec) add(10, "Teaches cloud / distributed / software engineering — your career direction");

  // He has real industry time — where a programme demands it, that thins the
  // competition in his favour instead of blocking him.
  if (RE.workExp.test(text)) {
    add(8, `Wants work experience — you have ${ctx.workMonths} months, most applicants have none`);
  }

  // The one that actually decides his applications.
  const ects = ectsGate(text, PROFILE.ects);
  if (ects.status === "ok") add(10, `Accepts ${ects.demand} ECTS — you have ${PROFILE.ects}, you clear it`);
  else if (ects.status === "bridgeable") {
    add(-5, `Wants ${ects.demand} ECTS but lets you close the gap with extra modules`);
  } else if (ects.status === "short") {
    add(-30, `Wants ${ects.demand} ECTS — you have ${PROFILE.ects}, no stated way around it`);
  } else watch.push("ECTS requirement not stated — ask before applying, this is what blocks you");

  const fee = feePerYear(p);
  if (fee !== null) {
    if (fee >= 6000) add(-12, `Tuition ~EUR ${fee.toLocaleString()}/yr`);
    else if (fee >= 2000) add(-4, `Tuition ~EUR ${fee.toLocaleString()}/yr`);
  } else watch.push("No tuition listed — expect EUR 150-400/semester Semesterbeitrag regardless");

  // Goal is admission, not prestige — a private university is an easier route
  // in, so this is a cost note rather than a real penalty.
  if (PRIVATE.test(p.university)) add(-4, "Private university — easier to get into, but you pay for it");

  // Two intakes a year = two attempts instead of one.
  if (/Summer and Winter|all quarters|all trimesters/i.test(p.admissionSemester)) {
    add(10, "Two intakes a year — two attempts instead of one");
  } else if (/Summer Semester only|summer quarter/i.test(p.admissionSemester)) {
    watch.push("Summer intake only — one attempt per year");
  } else watch.push("Winter intake only — one attempt per year");

  // The single strongest admission-odds signal DAAD carries.
  if (/Without admission restriction/i.test(p.admissionModus)) {
    add(18, "No NC — meet the requirements and you are in, your grade competes with nobody");
  } else if (RE.restricted.test(p.admissionModus)) {
    watch.push(`NC / capped places — you compete on grade, and yours is ${ctx.grade}`);
  }

  if (RE.gre.test(text)) watch.push("Asks for GRE/GMAT — you have neither");
  if (!RE.ielts.test(text)) watch.push("No language requirement stated — confirm the IELTS band");
  if (!p.focus) watch.push("DAAD lists no focus areas — check the university page for specialisations");

  return {
    fit: Math.max(0, Math.min(100, points)),
    ects,
    type: uniType(p),
    fieldWeight: domain,
    specialised: spec,
    domainHits: hits.join(", "),
    feePerYear: fee,
    why: why.sort((a, b) => b.pts - a.pts),
    watch,
    verdict: ects.status === "short" ? "BLOCKED" : points >= APPLY_AT ? "APPLY" : "MAYBE",
  };
}

// ---------------------------------------------------------------- run
function loadProgrammes() {
  const master = JSON.parse(fs.readFileSync(MASTER_PATH, "utf8"));
  return Object.entries(master.datasets).flatMap(([dataset, d]) =>
    d.programmes.map((p) => ({ ...p, dataset, focus: FOCUS[p.id] || p.focus })),
  );
}

const CSV_COLUMNS = [
  "rank",
  "fit",
  "verdict",
  "type",
  "university",
  "course",
  "degree",
  "universityCity",
  "universityState",
  "domainHits",
  "focus",
  "feePerYear",
  "admissionSemester",
  "admissionModus",
  "detailUrl",
];

function toCsv(rows) {
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [CSV_COLUMNS.join(","), ...rows.map((r) => CSV_COLUMNS.map((c) => cell(r[c])).join(","))].join("\n");
}

function main() {
  const argv = process.argv.slice(2);
  const minFit = Number(argv[argv.indexOf("--min") + 1]) || (argv.includes("--all") ? 0 : 35);

  const master = JSON.parse(fs.readFileSync(MASTER_PATH, "utf8"));
  const ctx = {
    grade: germanGrade(PROFILE),
    workMonths: monthsSince(PROFILE.workStart, master.generatedAt),
    scrapedAt: master.generatedAt,
  };

  const ranked = loadProgrammes()
    .map((p) => {
      const s = score(p, ctx);
      return s && { ...p, ...s };
    })
    .filter((r) => r && r.fit >= minFit)
    .sort((a, b) => b.fit - a.fit || a.university.localeCompare(b.university))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  fs.mkdirSync(OUT_DIR, { recursive: true });
  exportJson(path.join(OUT_DIR, "shortlist.json"), { profile: ctx, count: ranked.length, programmes: ranked });
  fs.writeFileSync(path.join(OUT_DIR, "shortlist.csv"), `${toCsv(ranked)}\n`);

  console.log(`\nGerman grade ${ctx.grade}  ·  ECTS ${PROFILE.ects}  ·  work ${ctx.workMonths} months`);
  console.log(`dMAT: register by ${DMAT.registrationCloses}, exam ${DMAT.examDate}, EUR ${DMAT.costEur} with APS.`);
  console.log(`Deadlines are not scored — verify every date on the university site.\n`);

  for (const r of ranked) {
    console.log(
      `${String(r.rank).padStart(3)}. ${String(r.fit).padStart(3)} ${r.type.padEnd(11)} ${r.course.slice(0, 46).padEnd(46)} ${r.university}`,
    );
  }
  const byType = ranked.reduce((a, r) => ({ ...a, [r.type]: (a[r.type] || 0) + 1 }), {});
  console.log(`\n${ranked.length} programmes:`, byType);
  console.log(`-> output/shortlist/shortlist.csv  ·  shortlist.json`);
  return ranked;
}

// ---------------------------------------------------------------- check
function demo() {
  const assert = require("node:assert");
  assert.strictEqual(germanGrade({ cgpa: 7.38, cgpaScale: { max: 10, pass: 4 } }), 2.31);
  assert.strictEqual(germanGrade({ cgpa: 10, cgpaScale: { max: 10, pass: 4 } }), 1);
  assert.strictEqual(monthsSince("2024-07-01", "2026-08-14T00:00:00Z"), 25);
  assert.strictEqual(feePerYear({ tuitionFee: "549.00 EUR / Month" }), 6588);
  assert.strictEqual(feePerYear({ tuitionFee: "1,500.00 EUR / semester" }), 3000);
  assert.strictEqual(feePerYear({ tuitionFeeTotal: "16,250.00 EUR / total" }), 8125);
  assert.strictEqual(feePerYear({ tuitionFee: "" }), null);
  assert.deepStrictEqual(ectsGate("at least 180 ECTS credits", 180), { demand: 180, status: "ok" });
  assert.deepStrictEqual(ectsGate("At least 210 ECTS credit points", 180), { demand: 210, status: "short" });
  assert.deepStrictEqual(ectsGate("Bachelor of at least 4 years (240 ECTS)", 180), { demand: 240, status: "short" });
  assert.deepStrictEqual(ectsGate("a four-year bachelor degree", 180), { demand: 240, status: "short" });
  assert.deepStrictEqual(ectsGate("a relevant Bachelor's degree", 180), { demand: null, status: "unstated" });
  assert.deepStrictEqual(ectsGate("210 credit points (applicants with 180 credit points must earn an additional 30)", 180), {
    demand: 210,
    status: "bridgeable",
  });
  assert.strictEqual(domainScore({ course: "X", areaOfStudyTags: ["Computer Science"] }).best, 3);
  assert.strictEqual(domainScore({ course: "X", areaOfStudyTags: ["Artificial Intelligence"] }).best, 2);
  assert.strictEqual(domainScore({ course: "X", areaOfStudyTags: ["Philosophy"] }).best, 0);
  assert.strictEqual(domainScore({ course: "X", areaOfStudyTags: ["Psychology", "Data Science"] }).best, 3);
  assert.strictEqual(domainScore({ course: "DevOps and Cloud Computing", areaOfStudyTags: [] }).spec, true);
  assert.strictEqual(domainScore({ course: "Data Science", areaOfStudyTags: [] }).spec, false);
  // The Paderborn case: focus supplied by OVERRIDES, not by DAAD.
  assert.strictEqual(domainScore({ course: "Computer Science", focus: "Distributed Systems" }).spec, true);
  assert.strictEqual(domainScore({ course: "X", areaOfStudy: "Psychology, Computer Science" }).best, 3);
  assert.strictEqual(uniType({ university: "Technical University of Hamburg" }), "TU");
  assert.strictEqual(uniType({ university: "Paderborn University" }), "University");
  assert.strictEqual(uniType({ university: "Fulda University of Applied Sciences" }), "Hochschule");
  assert.strictEqual(uniType({ university: "X", dataset: "applied_sciences" }), "Hochschule");
  // Private wins over the Hochschule label it also carries.
  assert.strictEqual(uniType({ university: "IU International University of Applied Sciences" }), "Private");
  assert.strictEqual(uniType({ university: "Constructor University" }), "Private");
  assert.strictEqual(uniType({ university: "ESMT European School of Management and Technology" }), "Private");
  // Church-run and state-funded: tuition-free, so it is not a private in the
  // sense that matters here.
  assert.strictEqual(uniType({ university: "Catholic University in Eichstätt - Ingolstadt" }), "University");
  // Public universities that charge private-level fees stay public.
  assert.strictEqual(uniType({ university: "Karlsruhe Institute of Technology (KIT)" }), "TU");
  assert.strictEqual(toCsv([{ rank: 1, course: 'A "B"' }]).split("\n")[1].includes('"A ""B"""'), true);
  // The breakdown must account for the whole score, or a rank is unexplainable.
  const sample = score(
    {
      course: "Cloud Computing",
      areaOfStudyTags: ["Computer Science"],
      admissionModus: "Without admission restriction",
      admissionSemester: "Summer and Winter Semester",
      admissionRequirements: "at least 180 ECTS credits, IELTS 6.5",
      university: "Some University",
    },
    { grade: 2.31, workMonths: 25 },
  );
  assert.strictEqual(sample.why.reduce((a, w) => a + w.pts, 0), sample.fit);
  assert.strictEqual(sample.fit, 90); // 42 field + 10 spec + 10 ects + 10 intakes + 18 no-NC
  assert.ok(sample.why.every((w) => w.pts !== 0 && w.label));
  console.log("shortlist.js self-check OK");
}

if (require.main === module) (process.argv.includes("--check") ? demo : main)();

module.exports = { domainScore, feePerYear, germanGrade, monthsSince, score, toCsv, uniType };
