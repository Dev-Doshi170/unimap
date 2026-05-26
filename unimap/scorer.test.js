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
      domain: "Software Engineering / Development",
      domainScore: 95,
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
      domain: "Cloud Computing / DevOps",
      domainScore: 100,
      universityName: "Technical University Example",
      fees: "Tuition is EUR 1,200 per semester.",
      isFree: false,
      mainLanguage: "English and German",
      admissionModus: "",
      admissionRequirements: "",
    },
    profile
  );

  assert.equal(result.breakdown.courseRelevance, 35);
  assert.equal(result.breakdown.fees, 12);
  assert.equal(result.breakdown.language, 10);
  assert.equal(result.breakdown.admission, 8);
  assert.equal(result.breakdown.universityType, 6);
  assert.equal(result.breakdown.workExperience, 3);
  assert.equal(result.total, 74);
});

test("scores course relevance from domainScore and target-domain bonus", () => {
  const ai = scoreUniversity(
    {
      domain: "Artificial Intelligence (AI)",
      domainScore: 85,
      fees: "EUR 2,000",
      mainLanguage: "German",
      admissionModus: "Restricted",
      universityName: "Example University",
      admissionRequirements: "",
    },
    profile
  );
  const other = scoreUniversity(
    {
      domain: "Other / Unclassified",
      domainScore: 10,
      fees: "EUR 2,000",
      mainLanguage: "German",
      admissionModus: "Restricted",
      universityName: "Example University",
      admissionRequirements: "",
    },
    profile
  );

  assert.equal(ai.breakdown.courseRelevance, 33);
  assert.equal(other.breakdown.courseRelevance, 4);
});
