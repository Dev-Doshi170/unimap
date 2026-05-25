const axios = require("axios");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const BASE_SEARCH_URL =
  "https://api.daad.de/api/ajax/hsk/list/en?hec-degreeProgrammeType=w&hec-subjectGroup=2-226,2-229,2-232,2-233,2-234,2-547,2-548&hec-degreeType=37&hec-institutionType=2&hec-teachingLanguage=2";

const OUTPUT_DIR = "./output";
const RAW_DIR = "./output/raw";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR);
}

function cleanHtml(text = "") {
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, {
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X)"
        }
      });
    } catch (error) {
      console.log(
        `Retry ${attempt}/${retries} -> ${url}`
      );

      if (attempt === retries) {
        throw error;
      }

      await sleep(1500);
    }
  }
}

function getOverviewBlock(overview, headline) {
  return (
    overview?.blocks?.find(
      (block) =>
        block?.data?.headline?.toLowerCase() ===
        headline.toLowerCase()
    ) || null
  );
}

async function getCourseDetails(item) {
  try {
    const detailApiUrl =
      "https://api.daad.de/api/page" +
      item.link.url;

    const response =
      await fetchWithRetry(detailApiUrl);

    const rawData = response.data;

    fs.writeFileSync(
      path.join(RAW_DIR, `${item.id}.json`),
      JSON.stringify(rawData, null, 2)
    );

    const moduleData =
      rawData?.page?.sections?.main
        ?.mainContent?.[0]?.modules?.[0]?.data;

    if (!moduleData) {
      throw new Error(
        "moduleData not found"
      );
    }

    const keyFacts =
      moduleData.keyFacts?.data?.items || [];

    const sections =
      moduleData.content || [];

    const overview = sections.find(
      (s) =>
        s?.data?.headline ===
        "Overview and admission"
    );

    const deadlineSection =
      sections.find(
        (s) =>
          s?.data?.headline ===
          "Application deadlines"
      );

    const tuitionSection =
      sections.find(
        (s) =>
          s?.data?.headline ===
          "Tuition fee"
      );

    const languageSection =
      sections.find(
        (s) =>
          s?.data?.headline ===
          "Languages of instruction"
      );

    const getText = (headline) => {
      const block =
        getOverviewBlock(
          overview,
          headline
        );

      return cleanHtml(
        block?.data?.text || ""
      );
    };

    const getItems = (headline) => {
      const block =
        getOverviewBlock(
          overview,
          headline
        );

      return block?.data?.items || [];
    };

    const admissionModusBlock =
      getOverviewBlock(
        overview,
        "Admission modus"
      );

    const degree =
      keyFacts.find(
        (x) => x.name === "Degree"
      )?.text?.[0] || "";

    const duration =
      keyFacts.find(
        (x) =>
          x.name ===
          "Standard period of study (amount)"
      )?.text || "";

    const location =
      keyFacts.find(
        (x) => x.name === "Location"
      )?.text || "";

    let tuitionFee = "";
    let tuitionFeeLink = "";

    tuitionSection?.blocks?.forEach(
      (block) => {
        if (
          block?.data?.headline ===
          "Tuition fees"
        ) {
          tuitionFee = cleanHtml(
            block?.data?.text || ""
          );

          tuitionFeeLink =
            block?.data?.link?.url || "";
        }
      }
    );

    let language = "";

    languageSection?.blocks?.forEach(
      (block) => {
        if (
          block?.data?.headline ===
            "Main language" ||
          block?.data?.headline ===
            "Languages of instruction"
        ) {
          language = cleanHtml(
            block?.data?.text || ""
          );
        }
      }
    );

    const deadlines = [];

    deadlineSection?.blocks?.forEach(
      (block) => {
        block?.data?.items?.forEach(
          (d) => {
            deadlines.push({
              type: cleanHtml(
                d.headline
              ),
              deadline: cleanHtml(
                d.deadline
              ),
              comment: cleanHtml(
                d.comment || ""
              )
            });
          }
        );
      }
    );

    return {
      id: item.id,

      university: item.subline,

      course: item.headline,

      degree,

      duration,

      location,

      admissionSemester:
        getText(
          "Admission semester"
        ),

      areaOfStudy:
        getItems(
          "Area of study"
        ),

      focus:
        getText("Focus"),

      annotation:
        getText(
          "Annotation"
        ),

      admissionModus:
        cleanHtml(
          admissionModusBlock?.data?.text || ""
        ),

      admissionModusLink:
        admissionModusBlock?.data?.link?.url ||
        "",

      admissionRequirements:
        getText(
          "Admission requirements"
        ),

      tuitionFee,

      tuitionFeeLink,

      language,

      deadlines,

      detailUrl:
        "https://www.daad.de" +
        item.link.url,

      rawFile:
        `raw/${item.id}.json`
    };
  } catch (error) {
    console.error(
      `Failed: ${item.headline}`
    );

    console.error(error.message);

    return null;
  }
}

(async () => {
  try {
    console.log(
      "Fetching total program count..."
    );

    const firstResponse =
      await fetchWithRetry(
        BASE_SEARCH_URL
      );

    const total =
      firstResponse.data.results.count;

    console.log(
      `Total programs: ${total}`
    );

    const fullListUrl =
      `${BASE_SEARCH_URL}&hec-limit=${total}`;

    console.log(
      "Downloading all program records..."
    );

    const listResponse =
      await fetchWithRetry(
        fullListUrl
      );

    const courses =
      listResponse.data.results.items;

    console.log(
      `Downloaded ${courses.length} programs`
    );

    console.log(
      "Fetching detail pages..."
    );

    const results = (
      await Promise.all(
        courses.map((course) =>
          getCourseDetails(course)
        )
      )
    ).filter(Boolean);

    fs.writeFileSync(
      path.join(
        OUTPUT_DIR,
        "daad-programs.json"
      ),
      JSON.stringify(
        results,
        null,
        2
      )
    );

    const workbook =
      new ExcelJS.Workbook();

    const sheet =
      workbook.addWorksheet(
        "DAAD Programs"
      );

    sheet.columns = [
      {
        header: "ID",
        key: "id",
        width: 20
      },
      {
        header: "University",
        key: "university",
        width: 40
      },
      {
        header: "Course",
        key: "course",
        width: 50
      },
      {
        header: "Degree",
        key: "degree",
        width: 20
      },
      {
        header: "Duration",
        key: "duration",
        width: 20
      },
      {
        header: "Location",
        key: "location",
        width: 20
      },
      {
        header: "Admission Semester",
        key: "admissionSemester",
        width: 25
      },
      {
        header: "Area Of Study",
        key: "areaOfStudy",
        width: 50
      },
      {
        header: "Focus",
        key: "focus",
        width: 60
      },
      {
        header: "Annotation",
        key: "annotation",
        width: 60
      },
      {
        header: "Admission Modus",
        key: "admissionModus",
        width: 40
      },
      {
        header: "Admission Modus Link",
        key: "admissionModusLink",
        width: 60
      },
      {
        header: "Admission Requirements",
        key: "admissionRequirements",
        width: 80
      },
      {
        header: "Tuition Fee",
        key: "tuitionFee",
        width: 30
      },
      {
        header: "Tuition Fee Link",
        key: "tuitionFeeLink",
        width: 60
      },
      {
        header: "Language",
        key: "language",
        width: 20
      },
      {
        header: "Deadlines",
        key: "deadlines",
        width: 80
      },
      {
        header: "Detail URL",
        key: "detailUrl",
        width: 80
      },
      {
        header: "Raw File",
        key: "rawFile",
        width: 30
      }
    ];

    results.forEach((row) => {
      sheet.addRow({
        ...row,
        areaOfStudy:
          row.areaOfStudy.join(", "),
        deadlines:
          row.deadlines
            .map(
              (d) =>
                `${d.type}: ${d.deadline}`
            )
            .join(" | ")
      });
    });

    await workbook.xlsx.writeFile(
      path.join(
        OUTPUT_DIR,
        "daad-programs.xlsx"
      )
    );

    console.log("");
    console.log("================================");
    console.log(
      `SUCCESS: ${results.length} programs exported`
    );
    console.log("================================");
    console.log("");

    console.log(
      "Files created:"
    );
    console.log(
      "output/daad-programs.json"
    );
    console.log(
      "output/daad-programs.xlsx"
    );
    console.log(
      `output/raw/ (${results.length} raw files)`
    );
  } catch (error) {
    console.error(error);
  }
})();