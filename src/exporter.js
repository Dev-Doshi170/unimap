const ExcelJS = require("exceljs");
const fs = require("node:fs");
const path = require("node:path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function exportJson(outputPath, data) {
  ensureDir(path.dirname(outputPath));
  const tmpPath = `${outputPath}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tmpPath, outputPath);
}

function deadlineText(deadlines) {
  if (!Array.isArray(deadlines)) return "";
  return deadlines.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).join("\n");
}

function truncate(value, maxLength) {
  const text = String(value ?? "");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}...`;
}

async function exportExcel(outputPath, programmes) {
  ensureDir(path.dirname(outputPath));
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("DAAD Programs");

  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.columns = [
    { header: "ID", key: "id" },
    { header: "University", key: "university" },
    { header: "City", key: "universityCity" },
    { header: "State", key: "universityState" },
    { header: "Course", key: "course" },
    { header: "Degree", key: "degree" },
    { header: "Duration", key: "duration" },
    { header: "Admission Modus", key: "admissionModus" },
    { header: "Fees", key: "tuitionFee" },
    { header: "Fee Total", key: "tuitionFeeTotal" },
    { header: "Language", key: "language" },
    { header: "Deadlines", key: "deadlines" },
    { header: "Admission Requirements", key: "admissionRequirements" },
    { header: "Detail URL", key: "detailUrl" },
    { header: "University Website", key: "universityWebsite" },
  ];

  sheet.getRow(1).font = { bold: true };

  for (const programme of programmes) {
    sheet.addRow({
      ...programme,
      deadlines: deadlineText(programme.deadlines),
      admissionRequirements: truncate(programme.admissionRequirements, 500),
    });
  }

  for (const column of sheet.columns) {
    const lengths = [String(column.header || "").length];
    column.eachCell({ includeEmpty: true }, (cell) => {
      lengths.push(String(cell.value ?? "").length);
    });
    column.width = Math.min(Math.max(...lengths, 12) + 2, 80);
  }

  await workbook.xlsx.writeFile(outputPath);
}

async function exportProgrammes(outputDir, programmes) {
  const jsonPath = path.join(outputDir, "daad-programs.json");
  const excelPath = path.join(outputDir, "daad-programs.xlsx");
  exportJson(jsonPath, programmes);
  await exportExcel(excelPath, programmes);
  return { jsonPath, excelPath };
}

module.exports = {
  deadlineText,
  exportExcel,
  exportJson,
  exportProgrammes,
  truncate,
};
