import assert from "node:assert/strict";
import test from "node:test";

import {
  addToBlacklist,
  clearBlacklist,
  CITY_COORDS,
  computeZoomTransform,
  findClusterHints,
  formatUniversityId,
  getBlacklist,
  getCityCoords,
  getDistance,
  getDurationSemesters,
  isBlacklisted,
  matchesDurationFilter,
  parseUniversities,
  removeFromBlacklist,
  shouldOpenDotAfterPointer,
} from "./app.js";

test("parses DAAD aggregate records into UniMap university objects", () => {
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

test("resolves German city aliases and computes haversine distance", () => {
  assert.deepEqual(getCityCoords("München"), CITY_COORDS.Munich);
  assert.deepEqual(getCityCoords("Köln, Berlin"), CITY_COORDS.Cologne);

  const distance = getDistance(CITY_COORDS.Berlin, CITY_COORDS.Hamburg);
  assert.ok(distance > 250 && distance < 300);
});

test("computes cursor-centered zoom transform with scale clamp", () => {
  const zoomedIn = computeZoomTransform({
    currentScale: 1,
    currentTranslate: { x: 0, y: 0 },
    targetScale: 1.15,
    origin: { x: 100, y: 50 },
  });

  assert.equal(zoomedIn.scale, 1.15);
  assert.ok(Math.abs(zoomedIn.translate.x - -15) < 0.000001);
  assert.ok(Math.abs(zoomedIn.translate.y - -7.5) < 0.000001);

  const clamped = computeZoomTransform({
    currentScale: 7.9,
    currentTranslate: { x: -20, y: -10 },
    targetScale: 20,
    origin: { x: 100, y: 50 },
  });

  assert.equal(clamped.scale, 8);
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

test("parses and filters duration by max semester count", () => {
  assert.equal(getDurationSemesters("3 semesters"), 3);
  assert.equal(getDurationSemesters("4 semester"), 4);
  assert.equal(getDurationSemesters("Duration not listed"), null);

  assert.equal(matchesDurationFilter({ duration: "3 semesters" }, "4"), true);
  assert.equal(matchesDurationFilter({ duration: "5 semesters" }, "4"), false);
  assert.equal(matchesDurationFilter({ duration: "" }, "4"), true);
  assert.equal(matchesDurationFilter({ duration: "5 semesters" }, "all"), true);
});

test("formats university id for detail display", () => {
  assert.equal(formatUniversityId({ id: "w5965" }), "w5965");
  assert.equal(formatUniversityId({ id: "" }), "Not listed");
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
