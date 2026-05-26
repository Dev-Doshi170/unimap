const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { exportJson } = require("../src/exporter");
const { generateCombinedRaw, generateMergedRaw } = require("../src/merger");
const { parseProgramme } = require("../src/parser");
const { buildPageDetailUrl, extractProgrammeIds, extractProgrammeItems, parseRawDirectory, withLimit, withOffset } = require("../src/scraper");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "daad-scraper-test-"));
}

function makeRaw(overrides = {}) {
  return {
    page: {
      sections: {
        main: {
          mainContent: [
            {
              modules: [
                {
                  data: {
                    resultId: "w1234",
                    url: "/en/detail/example-w1234/?hec-id=w1234",
                    head: {
                      title: "Software Systems",
                      subline: "full time",
                    },
                    keyFacts: {
                      data: {
                        items: [
                          { name: "Degree", text: ["Master of Science", "Master"] },
                          { name: "Standard period of study (amount)", text: "4 semesters" },
                          { name: "Location", text: "Berlin" },
                          { name: "Deadlines", text: ["July 2026", "August 2026"] },
                        ],
                      },
                    },
                    content: [
                      {
                        data: { id: "hsk-detail-overview" },
                        blocks: [
                          { data: { headline: "Admission semester", text: "Winter Semester" } },
                          { data: { headline: "Area of study", text: "Computer Science" } },
                          { data: { headline: "Focus", text: "Distributed Systems" } },
                          { data: { headline: "Annotation", text: "Research-oriented" } },
                          {
                            data: {
                              headline: "Admission modus",
                              text: "Without admission restriction",
                              link: { url: "https://example.edu/admission" },
                            },
                          },
                          { data: { headline: "Admission requirements", text: "Bachelor&apos;s degree" } },
                        ],
                      },
                      {
                        data: { id: "hsk-detail-fees" },
                        blocks: [
                          {
                            data: {
                              headline: "Tuition fees",
                              text: "1,200 EUR / semester",
                              link: { url: "https://example.edu/fees" },
                            },
                          },
                          { data: { headline: null, text: "Total EUR 4,800" } },
                        ],
                      },
                      {
                        data: { id: "hsk-detail-languages" },
                        blocks: [{ data: { headline: "Main language", text: "English" } }],
                      },
                    ],
                    sidebar: [
                      {
                        type: "sidebarHead",
                        data: {
                          universityName: "Example University",
                          universityTown: "Berlin",
                          universityFederalState: "Berlin",
                          logo: { src: { large: { href: "https://example.edu/logo.png" } } },
                          link: { url: "https://example.edu" },
                        },
                      },
                    ],
                    ...overrides,
                  },
                },
              ],
            },
          ],
        },
      },
    },
  };
}

test("extractProgrammeIds reads ids from DAAD list results", () => {
  const listData = {
    results: {
      items: [
        { id: "w100" },
        { "hec-id": "w200" },
        { link: { url: "/detail/example-w300/?hec-id=w300" } },
        { id: "" },
      ],
    },
  };
  const ids = extractProgrammeIds(listData);

  assert.deepEqual(ids, ["w100", "w200", "w300"]);
  assert.deepEqual(extractProgrammeItems(listData)[2], {
    id: "w300",
    detailUrl: "https://api.daad.de/api/page/detail/example-w300/?hec-id=w300",
  });
});

test("buildPageDetailUrl creates the DAAD page API URL from list links", () => {
  assert.equal(
    buildPageDetailUrl("/en/studying-in-germany/universities/all-degree-programmes/detail/example-w1/?hec-id=w1"),
    "https://api.daad.de/api/page/en/studying-in-germany/universities/all-degree-programmes/detail/example-w1/?hec-id=w1"
  );
});

test("withLimit preserves raw comma-separated subject filters", () => {
  const url = "https://api.daad.de/api/ajax/hsk/list/en?hec-subjectGroup=2-226,2-229&hec-limit=100";

  assert.equal(
    withLimit(url, 170),
    "https://api.daad.de/api/ajax/hsk/list/en?hec-subjectGroup=2-226,2-229&hec-limit=170"
  );
  assert.equal(
    withOffset(url, 100),
    "https://api.daad.de/api/ajax/hsk/list/en?hec-subjectGroup=2-226,2-229&hec-limit=100&hec-offset=100"
  );
});

test("parseProgramme extracts normalized fields with dataset raw path", () => {
  const programme = parseProgramme(makeRaw(), "w1234", { datasetKey: "universities" });

  assert.equal(programme.id, "w1234");
  assert.equal(programme.university, "Example University");
  assert.equal(programme.universityCity, "Berlin");
  assert.equal(programme.universityState, "Berlin");
  assert.equal(programme.course, "Software Systems");
  assert.equal(programme.degree, "Master of Science, Master");
  assert.equal(programme.duration, "4 semesters");
  assert.equal(programme.location, "Berlin");
  assert.equal(programme.admissionSemester, "Winter Semester");
  assert.equal(programme.areaOfStudy, "Computer Science");
  assert.equal(programme.admissionModusLink, "https://example.edu/admission");
  assert.equal(programme.admissionRequirements, "Bachelor's degree");
  assert.equal(programme.tuitionFee, "1,200 EUR / semester");
  assert.equal(programme.tuitionFeeLink, "https://example.edu/fees");
  assert.equal(programme.tuitionFeeTotal, "Total EUR 4,800");
  assert.equal(programme.language, "English");
  assert.deepEqual(programme.deadlines, ["July 2026", "August 2026"]);
  assert.equal(programme.detailUrl, "https://www.daad.de/en/detail/example-w1234/?hec-id=w1234");
  assert.equal(programme.rawFile, "output/universities/raw/w1234.json");
});

test("generateMergedRaw preserves UniMap envelope shape", () => {
  const dir = makeTempDir();
  const rawDir = path.join(dir, "raw");
  fs.mkdirSync(rawDir);
  fs.writeFileSync(path.join(rawDir, "w2.json"), JSON.stringify({ id: "w2" }));
  fs.writeFileSync(path.join(rawDir, "w1.json"), JSON.stringify({ id: "w1" }));

  const outputPath = path.join(dir, "all-daad-raw.json");
  const merged = generateMergedRaw(rawDir, outputPath);

  assert.deepEqual(
    merged.map((entry) => ({ fileName: entry.fileName, fileId: entry.fileId, data: entry.data })),
    [
      { fileName: "w1.json", fileId: "w1", data: { id: "w1" } },
      { fileName: "w2.json", fileId: "w2", data: { id: "w2" } },
    ]
  );
  assert.deepEqual(JSON.parse(fs.readFileSync(outputPath, "utf8")), merged);
});

test("generateCombinedRaw adds dataset metadata to UniMap aggregate entries", () => {
  const dir = makeTempDir();
  const appliedRawDir = path.join(dir, "applied", "raw");
  const universitiesRawDir = path.join(dir, "universities", "raw");
  fs.mkdirSync(appliedRawDir, { recursive: true });
  fs.mkdirSync(universitiesRawDir, { recursive: true });
  fs.writeFileSync(path.join(appliedRawDir, "w1.json"), JSON.stringify({ id: "w1" }));
  fs.writeFileSync(path.join(universitiesRawDir, "w2.json"), JSON.stringify({ id: "w2" }));

  const outputPath = path.join(dir, "all-daad-raw.json");
  const merged = generateCombinedRaw(
    [
      { rawDir: appliedRawDir, dataset: "applied_sciences" },
      { rawDir: universitiesRawDir, dataset: "universities" },
    ],
    outputPath
  );

  assert.deepEqual(
    merged.map((entry) => ({ fileId: entry.fileId, dataset: entry.dataset })),
    [
      { fileId: "w1", dataset: "applied_sciences" },
      { fileId: "w2", dataset: "universities" },
    ]
  );
});

test("exportJson writes pretty JSON atomically without leaving tmp file", () => {
  const dir = makeTempDir();
  const outputPath = path.join(dir, "programmes.json");

  exportJson(outputPath, [{ id: "w1" }]);

  assert.equal(fs.existsSync(`${outputPath}.tmp`), false);
  assert.equal(fs.readFileSync(outputPath, "utf8"), '[\n  {\n    "id": "w1"\n  }\n]\n');
});

test("parseRawDirectory marks files missing from active list as removed", () => {
  const dir = makeTempDir();
  const rawDir = path.join(dir, "raw");
  fs.mkdirSync(rawDir);
  fs.writeFileSync(path.join(rawDir, "w1.json"), JSON.stringify(makeRaw({ resultId: "w1" })));
  fs.writeFileSync(path.join(rawDir, "w2.json"), JSON.stringify(makeRaw({ resultId: "w2" })));

  const programmes = parseRawDirectory(
    "applied_sciences",
    { daadBaseUrl: "https://www.daad.de" },
    rawDir,
    ["w1"]
  );

  assert.equal(programmes.find((programme) => programme.id === "w1").status, undefined);
  assert.equal(programmes.find((programme) => programme.id === "w2").status, "removed");
});
