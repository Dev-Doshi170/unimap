const path = require("node:path");

const { generateMergedRaw } = require("./src/merger");

const RAW_DIR = path.join("output", "raw");
const OUTPUT_FILE = "all-daad-raw.json";

console.warn(
  "[DEPRECATED] combine-json.js is kept for backward compatibility. New runs update dataset-specific files and unimap/data/all-daad-raw.json via `npm run scrape`."
);

const combined = generateMergedRaw(RAW_DIR, OUTPUT_FILE);
console.log(`Combined ${combined.length} files into ${OUTPUT_FILE}`);
