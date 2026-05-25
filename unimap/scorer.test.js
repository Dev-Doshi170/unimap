import assert from "node:assert/strict";
import test from "node:test";

import { scoreUniversity } from "./scorer.js";

const profile = {
  workExperienceYears: 1.5,
};

test("scores a free English software Hochschule as a strong match", () => {
  const result = scoreUniversity(
    {
      courseName: "Software Engineering",
      universityName: "Heilbronn University of Applied Sciences",
      fees: "",
      isFree: true,
      mainLanguage: "English",
      admissionModus: "Without admission restriction",
      admissionRequirements: "Applicants need one year of professional experience.",
    },
    profile
  );

  assert.equal(result.total, 100);
  assert.deepEqual(result.breakdown, {
    courseRelevance: 35,
    fees: 20,
    language: 15,
    admission: 15,
    universityType: 10,
    workExperience: 5,
  });
});

test("extracts fee tiers from EUR text and scores admission defaults", () => {
  const result = scoreUniversity(
    {
      courseName: "Cloud and Distributed Systems",
      universityName: "Technical University Example",
      fees: "Tuition is EUR 1,200 per semester.",
      isFree: false,
      mainLanguage: "English and German",
      admissionModus: "",
      admissionRequirements: "",
    },
    profile
  );

  assert.equal(result.breakdown.courseRelevance, 30);
  assert.equal(result.breakdown.fees, 12);
  assert.equal(result.breakdown.language, 10);
  assert.equal(result.breakdown.admission, 8);
  assert.equal(result.breakdown.universityType, 6);
  assert.equal(result.breakdown.workExperience, 3);
  assert.equal(result.total, 69);
});
