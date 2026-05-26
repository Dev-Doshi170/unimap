const fs = require("node:fs");
const path = require("node:path");

const { exportJson } = require("./src/exporter");
const logger = require("./src/logger");
const { generateCombinedRaw } = require("./src/merger");
const { migrateAppliedSciencesRaw, parseRawDirectory, readExistingProgrammes, scrapeDataset } = require("./src/scraper");

const CONFIG_PATH = path.join(__dirname, "config", "datasets.json");
const UNIMAP_RAW_PATH = path.join(__dirname, "unimap", "data", "all-daad-raw.json");
const MASTER_PATH = path.join(__dirname, "output", "all-daad-master.json");

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

function parseArgs(argv) {
  const args = argv.slice(2);
  return {
    force: args.includes("--force"),
    datasetKey: args.find((arg) => !arg.startsWith("--")),
  };
}

function ensureAppliedMigration(config) {
  const applied = config.applied_sciences;
  if (!applied) return;
  migrateAppliedSciencesRaw("applied_sciences", path.join(applied.outputDir, "raw"));
}

function loadProgrammesForDataset(datasetKey, datasetConfig, processedResults) {
  const processed = processedResults.get(datasetKey);
  if (processed && !processed.aborted) return processed.programmes;

  const existing = readExistingProgrammes(datasetConfig.outputDir);
  if (existing.length > 0) return existing;

  const rawDir = path.join(datasetConfig.outputDir, "raw");
  if (!fs.existsSync(rawDir)) return [];
  return parseRawDirectory(datasetKey, datasetConfig, rawDir, []);
}

function buildMaster(config, processedResults) {
  const datasets = {};
  for (const [datasetKey, datasetConfig] of Object.entries(config)) {
    const programmes = loadProgrammesForDataset(datasetKey, datasetConfig, processedResults);
    datasets[datasetKey] = {
      name: datasetConfig.name,
      count: programmes.length,
      programmes,
    };
  }

  const master = {
    generatedAt: new Date().toISOString(),
    datasets,
  };
  exportJson(MASTER_PATH, master);
  return master;
}

function updateCombinedRaw(config) {
  ensureAppliedMigration(config);
  const rawSources = Object.entries(config).map(([datasetKey, datasetConfig]) => ({
    rawDir: path.join(datasetConfig.outputDir, "raw"),
    dataset: datasetKey,
  }));
  return generateCombinedRaw(rawSources, UNIMAP_RAW_PATH);
}

async function main() {
  const config = readConfig();
  const { datasetKey, force } = parseArgs(process.argv);
  const datasetKeys = datasetKey ? [datasetKey] : Object.keys(config);

  for (const key of datasetKeys) {
    if (!config[key]) {
      throw new Error(`Unknown dataset "${key}". Available datasets: ${Object.keys(config).join(", ")}`);
    }
  }

  const processedResults = new Map();
  for (const key of datasetKeys) {
    const result = await scrapeDataset(key, config, { force });
    processedResults.set(key, result);
  }

  const combinedRaw = updateCombinedRaw(config);
  const master = buildMaster(config, processedResults);

  console.log("");
  for (const key of datasetKeys) {
    const result = processedResults.get(key);
    if (result?.aborted) {
      console.log(`! ${key}: aborted - ${result.outputDir}/`);
    } else {
      console.log(`✓ ${key}: ${result.count} programmes - ${result.outputDir}/`);
    }
  }
  console.log(`✓ unimap/data/all-daad-raw.json updated (${combinedRaw.length} total)`);
  console.log(`✓ output/all-daad-master.json updated`);

  return master;
}

if (require.main === module) {
  main().catch((error) => {
    logger.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildMaster,
  main,
  parseArgs,
  readConfig,
  updateCombinedRaw,
};
