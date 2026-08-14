function cleanHtml(text = "") {
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function toText(value) {
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ");
  if (value === null || value === undefined) return "";
  return cleanHtml(value);
}

function dataText(data = {}) {
  if (Array.isArray(data.items)) return toText(data.items.map((item) => item?.text ?? item));
  return toText(data.text ?? "");
}

function parseProgramme(rawData, fileId, context = {}) {
  const datasetKey = context.datasetKey || "<datasetKey>";
  const mdata = rawData?.page?.sections?.main?.mainContent?.[0]?.modules?.[0]?.data ?? {};
  const head = mdata.head ?? {};
  const sidebar = mdata.sidebar ?? [];
  const sidebarHead = sidebar.find((s) => s.type === "sidebarHead")?.data ?? {};
  const kfItems = mdata.keyFacts?.data?.items ?? [];
  const content = mdata.content ?? [];

  function getKF(nameFragment) {
    const item = kfItems.find((i) => i.name?.toLowerCase().includes(nameFragment.toLowerCase()));
    if (!item) return "";
    return toText(item.text);
  }

  function getBlock(sectionId, headline) {
    const section = content.find((c) => c.data?.id === sectionId);
    if (!section) return { text: "", items: [], link: null };
    const block = section.blocks?.find((b) => b.data?.headline === headline);
    if (!block) return { text: "", items: [], link: null };
    return {
      text: dataText(block.data),
      // DAAD ships these as arrays; keep them so they stay filterable as facets.
      items: (block.data?.items ?? []).map(toText).filter(Boolean),
      link: block.data?.link?.url ?? null,
    };
  }

  function getDeadlines() {
    const kf = kfItems.find((i) => i.name === "Deadlines");
    if (kf) {
      const values = Array.isArray(kf.text) ? kf.text : [kf.text];
      return values.map(toText).filter(Boolean);
    }

    const section = content.find((c) => c.data?.id === "hsk-detail-deadlines");
    if (!section) return [];
    return (
      section.blocks?.flatMap((block) => {
        const label = toText(block.data?.headline);
        if (Array.isArray(block.data?.items)) {
          return block.data.items.map((item) => {
            const dates = [item?.headline, item?.deadline, item?.comment].map(toText).filter(Boolean).join(": ");
            return [label, dates].filter(Boolean).join(": ");
          });
        }
        const dates = toText(block.data?.text);
        return [[label, dates].filter(Boolean).join(": ")];
      }) ?? []
    ).filter(Boolean);
  }

  const fees = getBlock("hsk-detail-fees", "Tuition fees");
  const admissionBlock = getBlock("hsk-detail-overview", "Admission modus");

  const section = content.find((c) => c.data?.id === "hsk-detail-fees");
  const blocks = section?.blocks ?? [];
  const second = blocks.find((b) => !b.data?.headline && b.data?.text);

  const programme = {
    id: fileId,
    university: toText(sidebarHead.universityName),
    universityCity: toText(sidebarHead.universityTown),
    universityState: toText(sidebarHead.universityFederalState),
    universityLogo: sidebarHead.logo?.src?.large?.href ?? "",
    universityWebsite: sidebarHead.link?.url ?? "",
    course: toText(head.title),
    courseSubline: toText(head.subline),
    degree: getKF("degree"),
    duration: getKF("period"),
    location: getKF("location"),
    admissionSemester: getBlock("hsk-detail-overview", "Admission semester").text,
    areaOfStudy: getBlock("hsk-detail-overview", "Area of study").text,
    areaOfStudyTags: getBlock("hsk-detail-overview", "Area of study").items,
    focus: getBlock("hsk-detail-overview", "Focus").text,
    annotation: getBlock("hsk-detail-overview", "Annotation").text,
    admissionModus: admissionBlock.text,
    admissionModusLink: admissionBlock.link,
    admissionRequirements: getBlock("hsk-detail-overview", "Admission requirements").text,
    tuitionFee: fees.text,
    tuitionFeeLink: fees.link,
    tuitionFeeTotal: toText(second?.data?.text),
    language: getBlock("hsk-detail-languages", "Main language").text,
    deadlines: getDeadlines(),
    detailUrl: `${context.daadBaseUrl || "https://www.daad.de"}${mdata.url ?? ""}`,
    rawFile: `output/${datasetKey}/raw/${fileId}.json`,
  };

  if (context.status) programme.status = context.status;
  return programme;
}

module.exports = {
  cleanHtml,
  parseProgramme,
  toText,
};
