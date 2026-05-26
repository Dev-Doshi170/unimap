const fs = require("node:fs");
const path = require("node:path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function atomicWriteJson(outputPath, data) {
  ensureDir(path.dirname(outputPath));
  const tmpPath = `${outputPath}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tmpPath, outputPath);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getJsonFiles(rawDir) {
  if (!fs.existsSync(rawDir)) return [];
  return fs
    .readdirSync(rawDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));
}

function normalizeRawSource(source) {
  if (typeof source === "string") return { rawDir: source };
  return source;
}

function mergeRawFiles(rawDirs) {
  const entries = [];
  for (const source of rawDirs) {
    const { rawDir, dataset } = normalizeRawSource(source);
    for (const file of getJsonFiles(rawDir)) {
      const fullPath = path.join(rawDir, file);
      const entry = {
        fileName: file,
        fileId: path.basename(file, ".json"),
        data: readJson(fullPath),
      };
      if (dataset) entry.dataset = dataset;
      entries.push(entry);
    }
  }
  return entries;
}

function generateMergedRaw(rawDir, outputPath) {
  const combined = mergeRawFiles([rawDir]);
  atomicWriteJson(outputPath, combined);
  return combined;
}

function generateCombinedRaw(rawDirs, outputPath) {
  const combined = mergeRawFiles(rawDirs);
  atomicWriteJson(outputPath, combined);
  return combined;
}

module.exports = {
  atomicWriteJson,
  generateCombinedRaw,
  generateMergedRaw,
  getJsonFiles,
  mergeRawFiles,
  normalizeRawSource,
};
