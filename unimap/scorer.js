const MY_TARGET_DOMAINS = {
  "Cloud Computing / DevOps": 5,
  "Software Engineering / Development": 4,
  "Distributed Systems / Computer Science": 4,
  "Artificial Intelligence (AI)": 3,
  "Machine Learning (ML)": 3,
  "Data Science / Data Analytics": 2,
  "Embedded Systems / IoT": 2,
  "Cybersecurity / IT Security": 1,
};

export function scoreUniversity(uni, profile) {
  const breakdown = {
    courseRelevance: scoreCourseRelevance(uni),
    fees: scoreFees(uni),
    language: scoreLanguage(uni),
    admission: scoreAdmission(uni),
    universityType: scoreUniversityType(uni),
    workExperience: scoreWorkExperience(uni, profile),
  };

  const total = clamp(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    0,
    100
  );

  return {
    total: Math.round(total),
    breakdown,
  };
}

export function getFeeAmount(uni) {
  const feeText = [uni?.fees, uni?.feesTotal].filter(Boolean).join(" ");
  if (!feeText.trim()) return null;

  const normalized = feeText
    .replace(/,/g, "")
    .replace(/€/g, "EUR")
    .replace(/\s+/g, " ");
  const eurMatch = normalized.match(/(?:EUR|euro[s]?)\s*([0-9]+(?:\.[0-9]+)?)/i);
  const trailingEurMatch = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:EUR|euro[s]?)/i);
  const raw = eurMatch?.[1] || trailingEurMatch?.[1] || "";
  const value = Number.parseFloat(raw);

  return Number.isFinite(value) ? value : null;
}

function scoreCourseRelevance(uni) {
  const domainScore = uni?.domainScore ?? 10;
  const courseScore = Math.round((domainScore / 100) * 35);
  const bonus = MY_TARGET_DOMAINS[uni?.domain] ?? 0;
  return Math.min(35, courseScore + bonus);
}

function scoreFees(uni) {
  if (uni?.isFree || isBlank(uni?.fees)) return 20;

  const amount = getFeeAmount(uni);
  if (amount === null) return 2;
  if (amount < 500) return 17;
  if (amount < 1500) return 12;
  if (amount < 3000) return 7;
  return 2;
}

function scoreLanguage(uni) {
  const language = String(uni?.mainLanguage || "").trim();
  const lower = language.toLowerCase();

  if (lower === "english") return 15;
  if (lower.includes("english")) return 10;
  if (lower === "german") return 3;
  return 0;
}

function scoreAdmission(uni) {
  const admission = String(uni?.admissionModus || "").toLowerCase();

  if (!admission.trim()) return 8;
  if (admission.includes("without admission restriction")) return 15;
  if (admission.includes("entrance exam")) return 5;
  if (admission.includes("restricted") || admission.includes("numerus clausus")) return 8;
  return 8;
}

function scoreUniversityType(uni) {
  const name = String(uni?.universityName || "").toLowerCase();

  if (
    name.includes("university of applied sciences") ||
    name.includes("hochschule") ||
    name.includes("fachhochschule")
  ) {
    return 10;
  }

  if (name.includes("technical university")) return 6;
  return 3;
}

function scoreWorkExperience(uni, profile) {
  const requirements = String(uni?.admissionRequirements || "").toLowerCase();
  const hasExperienceRequirement =
    requirements.includes("professional experience") ||
    requirements.includes("work experience");

  if (hasExperienceRequirement && Number(profile?.workExperienceYears || 0) >= 1) {
    return 5;
  }

  return 3;
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "" || String(value).trim() === "0";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
