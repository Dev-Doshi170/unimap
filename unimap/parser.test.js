import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  addToBlacklist,
  clearBlacklist,
  CITY_COORDS,
  classifyDomain,
  computeZoomTransform,
  computeSpreadPoint,
  DOMAIN_MAP,
  findClusterHints,
  formatUniversityId,
  getBlacklist,
  getCityCoords,
  getDistance,
  getDurationSemesters,
  isBlacklisted,
  getFilterDrawerAriaState,
  getFilterSidebarAriaState,
  getMobileResultSummary,
  isFilterDrawerCloseTarget,
  matchesDatasetFilter,
  matchesDomainFilter,
  matchesDurationFilter,
  matchesSearchFilter,
  parseUniversities,
  removeFromBlacklist,
  shouldOpenDotAfterPointer,
} from "./app.js";

test("keeps filters in a collapsible left sidebar on desktop and drawer-only on mobile", () => {
  const css = readFileSync(new URL("./style.css", import.meta.url), "utf8");
  const desktopFilterDrawer = css.match(/\.filter-drawer\s*\{(?<rules>[^}]*)\}/)?.groups?.rules ?? "";

  assert.match(css, /\.mobile-result-summary,\n\.mobile-filter-toggle\s*\{\n\s*display: none;/);
  assert.match(css, /\.desktop-filter-collapse\s*\{/);
  assert.match(desktopFilterDrawer, /position:\s*fixed;/);
  assert.match(desktopFilterDrawer, /top:\s*4\.5rem;/);
  assert.match(desktopFilterDrawer, /bottom:\s*0\.75rem;/);
  assert.match(desktopFilterDrawer, /left:\s*1rem;/);
  assert.match(desktopFilterDrawer, /width:\s*min\(320px, calc\(100vw - 2rem\)\);/);
  assert.match(desktopFilterDrawer, /transform:\s*none;/);
  assert.match(css, /\.filter-drawer\.collapsed\s*\{[\s\S]*transform:\s*translateX\(calc\(-100% - 1rem\)\);/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.mobile-result-summary,\n\s*\.mobile-filter-toggle\s*\{\n\s*display: inline-flex;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.filter-drawer\s*\{[\s\S]*position:\s*fixed;/);
  assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.desktop-filter-collapse\s*\{[\s\S]*display:\s*none;/);
});

test("keeps fixed filter panel outside the blurred topbar", () => {
  const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
  const topbar = html.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0] ?? "";
  const filterPanelIndex = html.indexOf('id="filter-drawer"');
  const topbarEndIndex = html.indexOf("</header>");

  assert.equal(topbar.includes('id="filter-drawer"'), false);
  assert.ok(filterPanelIndex > topbarEndIndex);
});

test("formats the mobile result summary for the compact header", () => {
  assert.equal(getMobileResultSummary(0), "0 shown");
  assert.equal(getMobileResultSummary(1), "1 shown");
  assert.equal(getMobileResultSummary(128), "128 shown");
  assert.equal(getMobileResultSummary(Number.NaN), "0 shown");
});

test("derives accessible drawer state for the mobile filters sheet", () => {
  assert.deepEqual(getFilterDrawerAriaState(false), {
    expanded: "false",
    hidden: true,
  });
  assert.deepEqual(getFilterDrawerAriaState(true), {
    expanded: "true",
    hidden: false,
  });
});

test("keeps desktop inline filters available to assistive technology", () => {
  assert.deepEqual(getFilterDrawerAriaState(false, false), {
    expanded: "false",
    hidden: false,
  });
});

test("derives accessible state for the desktop filter sidebar", () => {
  assert.deepEqual(getFilterSidebarAriaState(false), {
    expanded: "true",
    label: "Collapse filters",
  });
  assert.deepEqual(getFilterSidebarAriaState(true), {
    expanded: "false",
    label: "Expand filters",
  });
});

test("detects drawer close targets from delegated mobile taps", () => {
  const closeTarget = {
    closest(selector) {
      return selector === "[data-filter-drawer-close]" ? this : null;
    },
  };
  const regularFilterControl = {
    closest() {
      return null;
    },
  };

  assert.equal(isFilterDrawerCloseTarget(closeTarget), true);
  assert.equal(isFilterDrawerCloseTarget(regularFilterControl), false);
  assert.equal(isFilterDrawerCloseTarget(null), false);
});

test("parses DAAD aggregate records into UniMap university objects", () => {
  const rawData = [
    {
      fileId: "w5965",
      dataset: "universities",
      data: {
        page: {
          sections: {
            main: {
              mainContent: [
                {
                  modules: [
                    {
                      data: {
                        resultId: "w5965",
                        url: "/detail/software-technology-w5965/?hec-id=w5965",
                        head: { title: "Software Technology" },
                        keyFacts: {
                          data: {
                            items: [
                              { name: "Degree", text: ["Master of Science", "Master"] },
                              { name: "Standard period of study (amount)", text: "3 semesters" },
                              { name: "Deadlines", text: ["September 2026"] },
                            ],
                          },
                        },
                        content: [
                          {
                            data: { id: "hsk-detail-overview", headline: "Overview and admission" },
                            blocks: [
                              { data: { headline: "Study Type", text: "graduate" } },
                              { data: { headline: "Admission modus", text: "Without admission restriction" } },
                              {
                                data: {
                                  headline: "Admission requirements",
                                  text: "Bachelor&apos;s degree<br>Professional experience preferred",
                                },
                              },
                            ],
                          },
                          {
                            data: { id: "hsk-detail-fees", headline: "Tuition fees" },
                            blocks: [
                              {
                                type: "textWithLink",
                                data: {
                                  headline: "Tuition fees",
                                  text: "",
                                  link: { url: "https://example.edu/fees" },
                                },
                              },
                              { type: "text", data: { headline: null, text: "Semester fee EUR 215.20" } },
                            ],
                          },
                          {
                            data: { id: "hsk-detail-languages", headline: "Languages of instruction" },
                            blocks: [{ data: { headline: "Main language", text: "English" } }],
                          },
                        ],
                        sidebar: [
                          {
                            type: "sidebarHead",
                            data: {
                              universityName: "Stuttgart University of Applied Sciences",
                              universityTown: "Stuttgart",
                              universityFederalState: "Baden-Württemberg",
                              logo: { src: { large: { href: "https://example.edu/logo.png" } } },
                              link: { url: "https://example.edu" },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ];

  const [uni] = parseUniversities(rawData);

  assert.equal(uni.id, "w5965");
  assert.equal(uni.dataset, "universities");
  assert.equal(uni.domain, "Software Engineering / Development");
  assert.equal(uni.domainScore, 95);
  assert.equal(uni.courseName, "Software Technology");
  assert.equal(uni.universityName, "Stuttgart University of Applied Sciences");
  assert.equal(uni.city, "Stuttgart");
  assert.equal(uni.state, "Baden-Württemberg");
  assert.equal(uni.logoUrl, "https://example.edu/logo.png");
  assert.equal(uni.websiteUrl, "https://example.edu");
  assert.equal(uni.daadUrl, "https://www.daad.de/detail/software-technology-w5965/?hec-id=w5965");
  assert.equal(uni.degree, "Master of Science, Master");
  assert.equal(uni.duration, "3 semesters");
  assert.deepEqual(uni.deadlines, ["September 2026"]);
  assert.equal(uni.fees, "");
  assert.equal(uni.feesTotal, "Semester fee EUR 215.20");
  assert.equal(uni.feesLink, "https://example.edu/fees");
  assert.equal(uni.mainLanguage, "English");
  assert.equal(uni.admissionModus, "Without admission restriction");
  assert.equal(uni.admissionRequirements, "Bachelor's degree Professional experience preferred");
  assert.equal(uni.studyType, "graduate");
  assert.equal(uni.isFree, true);
});

test("defaults missing dataset metadata to applied sciences", () => {
  const rawData = [
    {
      fileId: "w5965",
      data: {
        page: {
          sections: {
            main: {
              mainContent: [
                {
                  modules: [
                    {
                      data: {
                        head: { title: "Legacy Programme" },
                        content: [],
                        sidebar: [],
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  ];

  const [uni] = parseUniversities(rawData);

  assert.equal(uni.dataset, "applied_sciences");
});

test("classifies course domains using the exact priority map", () => {
  assert.equal(DOMAIN_MAP.at(-1).domain, "Other / Unclassified");
  assert.deepEqual(classifyDomain("MSc Cloud Computing"), {
    domain: "Cloud Computing / DevOps",
    domainScore: 100,
  });
  assert.deepEqual(classifyDomain("Mathematics of Machine Learning"), {
    domain: "Machine Learning (ML)",
    domainScore: 83,
  });
  assert.deepEqual(classifyDomain("Human-Computer Interaction"), {
    domain: "Human-Computer Interaction / UX",
    domainScore: 35,
  });
  assert.deepEqual(classifyDomain("Public Administration"), {
    domain: "Other / Unclassified",
    domainScore: 10,
  });
});

test("matches domain filter values", () => {
  const uni = { domain: "Cloud Computing / DevOps" };
  assert.equal(matchesDomainFilter(uni, "all"), true);
  assert.equal(matchesDomainFilter(uni, "Cloud Computing / DevOps"), true);
  assert.equal(matchesDomainFilter(uni, "Software Engineering / Development"), false);
});

test("resolves German city aliases and computes haversine distance", () => {
  assert.deepEqual(getCityCoords("München"), CITY_COORDS.Munich);
  assert.deepEqual(getCityCoords("Köln, Berlin"), CITY_COORDS.Cologne);

  const distance = getDistance(CITY_COORDS.Berlin, CITY_COORDS.Hamburg);
  assert.ok(distance > 250 && distance < 300);
});

test("computes spread zoom scale without shifting current pan", () => {
  const zoomedIn = computeZoomTransform({
    currentScale: 1,
    currentTranslate: { x: 12, y: -8 },
    targetScale: 1.15,
    origin: { x: 100, y: 50 },
  });

  assert.equal(zoomedIn.scale, 1.15);
  assert.deepEqual(zoomedIn.translate, { x: 12, y: -8 });

  const clamped = computeZoomTransform({
    currentScale: 7.9,
    currentTranslate: { x: -20, y: -10 },
    targetScale: 20,
    origin: { x: 100, y: 50 },
  });

  assert.equal(clamped.scale, 8);
});

test("computes spread zoom positions without scaling dot size", () => {
  const center = { x: 100, y: 100 };
  const point = { x: 120, y: 100 };

  assert.deepEqual(computeSpreadPoint(point, center, 1), point);
  assert.deepEqual(computeSpreadPoint(point, center, 2), { x: 136, y: 100 });
  assert.deepEqual(computeSpreadPoint(point, center, 0.5), { x: 112, y: 100 });
});

test("distinguishes dot click from drag by total pointer movement", () => {
  assert.equal(
    shouldOpenDotAfterPointer({ x: 10, y: 10 }, { x: 12, y: 14 }),
    true
  );
  assert.equal(
    shouldOpenDotAfterPointer({ x: 10, y: 10 }, { x: 16, y: 14 }),
    false
  );
});

test("finds cluster badges only near default zoom", () => {
  const positions = [
    { id: "a", x: 0, y: 0, distanceFromCenter: 0 },
    { id: "b", x: 10, y: 0, distanceFromCenter: 10 },
    { id: "c", x: 18, y: 0, distanceFromCenter: 18 },
    { id: "d", x: 100, y: 0, distanceFromCenter: 100 },
  ];

  assert.deepEqual(findClusterHints(positions, 1), [{ id: "c", count: 3 }]);
  assert.deepEqual(findClusterHints(positions, 1.6), []);
});

test("parses and filters duration by exact semester count", () => {
  assert.equal(getDurationSemesters("3 semesters"), 3);
  assert.equal(getDurationSemesters("4 semester"), 4);
  assert.equal(getDurationSemesters("Duration not listed"), null);

  assert.equal(matchesDurationFilter({ duration: "3 semesters" }, "3"), true);
  assert.equal(matchesDurationFilter({ duration: "3 semesters" }, "4"), false);
  assert.equal(matchesDurationFilter({ duration: "4 semesters" }, "4"), true);
  assert.equal(matchesDurationFilter({ duration: "5 semesters" }, "4"), false);
  assert.equal(matchesDurationFilter({ duration: "" }, "4"), false);
  assert.equal(matchesDurationFilter({ duration: "5 semesters" }, "all"), true);
  assert.equal(matchesDurationFilter({ duration: "" }, "all"), true);
});

test("matches dataset filter values", () => {
  assert.equal(matchesDatasetFilter({ dataset: "applied_sciences" }, "all"), true);
  assert.equal(matchesDatasetFilter({ dataset: "applied_sciences" }, "applied_sciences"), true);
  assert.equal(matchesDatasetFilter({ dataset: "universities" }, "applied_sciences"), false);
  assert.equal(matchesDatasetFilter({ dataset: "universities" }, "universities"), true);
});

test("formats university id for detail display", () => {
  assert.equal(formatUniversityId({ id: "w5965" }), "w5965");
  assert.equal(formatUniversityId({ id: "" }), "Not listed");
});

test("matches search text against university and course names", () => {
  const uni = {
    universityName: "Stuttgart University of Applied Sciences",
    courseName: "Software Technology",
  };

  assert.equal(matchesSearchFilter(uni, ""), true);
  assert.equal(matchesSearchFilter(uni, "stuttgart"), true);
  assert.equal(matchesSearchFilter(uni, "software"), true);
  assert.equal(matchesSearchFilter(uni, "cloud"), false);
});

test("stores blacklist ids without duplicates and removes them", () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };

  clearBlacklist();
  addToBlacklist("w5965");
  addToBlacklist("w5965");
  addToBlacklist("w72981");

  assert.deepEqual(getBlacklist(), ["w5965", "w72981"]);
  assert.equal(isBlacklisted("w5965"), true);

  removeFromBlacklist("w5965");
  assert.deepEqual(getBlacklist(), ["w72981"]);
  assert.equal(isBlacklisted("w5965"), false);

  clearBlacklist();
  assert.deepEqual(getBlacklist(), []);

  delete globalThis.localStorage;
});
