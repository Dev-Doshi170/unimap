const axios = require("axios");
const fs = require("node:fs");
const path = require("node:path");

const { exportProgrammes } = require("./exporter");
const logger = require("./logger");
const { generateMergedRaw, getJsonFiles } = require("./merger");
const { parseProgramme } = require("./parser");

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) DAAD scraper",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readExistingProgrammes(outputDir) {
  const existingPath = path.join(outputDir, "daad-programs.json");
  if (!fs.existsSync(existingPath)) return [];
  try {
    const existing = readJson(existingPath);
    return Array.isArray(existing) ? existing : [];
  } catch {
    return [];
  }
}

function writeJson(outputPath, data) {
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
}

function extractIdFromUrl(url = "") {
  const match = String(url).match(/[?&]hec-id=(w\d+)/i) || String(url).match(/-(w\d+)\//i);
  return match?.[1] ?? "";
}

function extractProgrammeIds(listData) {
  return extractProgrammeItems(listData).map((item) => item.id);
}

function buildPageDetailUrl(linkUrl) {
  if (!linkUrl) return "";
  if (/^https?:\/\//i.test(linkUrl)) return linkUrl;
  return `https://api.daad.de/api/page${linkUrl}`;
}

function extractProgrammeItems(listData) {
  const items = listData?.results?.items ?? [];
  return [
    ...new Map(
      items
        .map((item) => {
          const id = item?.id || item?.["hec-id"] || item?.hecId || extractIdFromUrl(item?.link?.url);
          return id ? [id, { id, detailUrl: buildPageDetailUrl(item?.link?.url) }] : null;
        })
        .filter(Boolean)
    ).values(),
  ];
}

function withLimit(url, limit) {
  return withQueryParam(url, "hec-limit", limit);
}

function withOffset(url, offset) {
  return withQueryParam(url, "hec-offset", offset);
}

function withQueryParam(url, name, value) {
  const pattern = new RegExp(`([?&]${name}=)[^&]*`);
  if (pattern.test(url)) {
    return url.replace(pattern, `$1${value}`);
  }
  return `${url}${url.includes("?") ? "&" : "?"}${name}=${value}`;
}

function getLimitFromUrl(url) {
  const match = String(url).match(/[?&]hec-limit=(\d+)/);
  return match ? Number(match[1]) : 100;
}

function combineIds(...idLists) {
  return [...new Set(idLists.flat().filter(Boolean))];
}

function combineProgrammeItems(...itemLists) {
  return [
    ...new Map(
      itemLists
        .flat()
        .filter((item) => item?.id)
        .map((item) => [item.id, item])
    ).values(),
  ];
}

async function fetchJson(url, options = {}) {
  const retries = options.retries ?? 3;
  const timeout = options.timeout ?? 30000;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await axios.get(url, {
        headers: REQUEST_HEADERS,
        responseType: "json",
        timeout,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        error.isNotFound = true;
        throw error;
      }

      if (attempt === retries) {
        throw error;
      }

      await sleep(1000 * 2 ** (attempt - 1));
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

async function fetchProgrammeList(datasetKey, datasetConfig) {
  const initial = await fetchJson(datasetConfig.listUrl);
  const count = Number(initial?.results?.count ?? 0);
  let items = extractProgrammeItems(initial);

  if (count > items.length) {
    const limit = Math.max(getLimitFromUrl(datasetConfig.listUrl), 1);
    for (let offset = limit; offset < count; offset += limit) {
      const page = await fetchJson(withOffset(datasetConfig.listUrl, offset));
      items = combineProgrammeItems(items, extractProgrammeItems(page));
    }
  }

  const ids = combineIds(items.map((item) => item.id));
  const detailUrls = new Map(items.map((item) => [item.id, item.detailUrl]).filter(([, url]) => Boolean(url)));
  return { count, ids, detailUrls };
}

function migrateAppliedSciencesRaw(datasetKey, rawDir) {
  if (datasetKey !== "applied_sciences") return 0;

  const legacyRawDir = path.join("output", "raw");
  if (!fs.existsSync(legacyRawDir)) return 0;

  ensureDir(rawDir);
  if (getJsonFiles(rawDir).length > 0) return 0;

  const files = getJsonFiles(legacyRawDir);
  for (const file of files) {
    fs.copyFileSync(path.join(legacyRawDir, file), path.join(rawDir, file));
  }

  if (files.length > 0) {
    logger.info(`[MIGRATE] Copied ${files.length} existing raw files to ${rawDir}`);
  }

  return files.length;
}

async function fetchMissingDetails(datasetKey, datasetConfig, ids, rawDir, options = {}) {
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(options.concurrency ?? 3);
  let completed = 0;

  const tasks = ids.map((id) =>
    limit(async () => {
      completed += 1;
      const rawPath = path.join(rawDir, `${id}.json`);
      if (!options.force && fs.existsSync(rawPath)) {
        logger.info(`[${datasetKey}] [SKIP] ${id} already exists`);
        return { id, skipped: true };
      }

      logger.info(`[${datasetKey}] [${completed}/${ids.length}] Fetching ${id}...`);
      try {
        const detailUrl = options.detailUrls?.get(id) || `${datasetConfig.detailBaseUrl}${id}`;
        const rawData = await fetchJson(detailUrl);
        writeJson(rawPath, rawData);
        return { id, fetched: true };
      } catch (error) {
        if (error.isNotFound) {
          logger.warn(`[${datasetKey}] Skipping ${id}: 404`);
        } else if (error instanceof SyntaxError) {
          logger.error(`[${datasetKey}] Malformed JSON for ${id}: ${options.detailUrls?.get(id) || `${datasetConfig.detailBaseUrl}${id}`}`);
        } else {
          logger.error(`[${datasetKey}] Failed after 3 retries: ${id} (${error.message})`);
        }
        return { id, failed: true };
      }
    })
  );

  return Promise.all(tasks);
}

function parseRawDirectory(datasetKey, datasetConfig, rawDir, activeIds) {
  const activeSet = new Set(activeIds);
  return getJsonFiles(rawDir)
    .map((file) => {
      const fileId = path.basename(file, ".json");
      const status = activeSet.size > 0 && !activeSet.has(fileId) ? "removed" : undefined;
      try {
        return parseProgramme(readJson(path.join(rawDir, file)), fileId, {
          daadBaseUrl: datasetConfig.daadBaseUrl,
          datasetKey,
          status,
        });
      } catch (error) {
        logger.error(`[${datasetKey}] Failed to parse ${file}: ${error.message}`);
        return null;
      }
    })
    .filter(Boolean);
}

async function scrapeDataset(datasetKey, config, options = {}) {
  const datasetConfig = config[datasetKey];
  if (!datasetConfig) {
    throw new Error(`Unknown dataset: ${datasetKey}`);
  }

  const outputDir = datasetConfig.outputDir;
  const rawDir = path.join(outputDir, "raw");
  ensureDir(rawDir);
  migrateAppliedSciencesRaw(datasetKey, rawDir);

  let list;
  try {
    list = await fetchProgrammeList(datasetKey, datasetConfig);
    if (list.ids.length === 0) {
      const existingIds = getJsonFiles(rawDir).map((file) => path.basename(file, ".json"));
      if (existingIds.length > 0) {
        logger.warn(`[${datasetKey}] List returned 0 programmes; using ${existingIds.length} existing raw files.`);
        list = { count: existingIds.length, ids: existingIds };
      }
    }
    logger.info(`[${datasetKey}] Found ${list.ids.length} programmes`);
  } catch (error) {
    logger.error(`[${datasetKey}] List endpoint failed: ${error.message}`);
    return {
      datasetKey,
      name: datasetConfig.name,
      outputDir,
      count: 0,
      programmes: [],
      aborted: true,
    };
  }

  await fetchMissingDetails(datasetKey, datasetConfig, list.ids, rawDir, {
    ...options,
    detailUrls: list.detailUrls,
  });

  let programmes = parseRawDirectory(datasetKey, datasetConfig, rawDir, list.ids);
  if (programmes.length === 0) {
    const existingProgrammes = readExistingProgrammes(outputDir);
    if (existingProgrammes.length > 0) {
      logger.warn(`[${datasetKey}] Keeping existing export because no programmes were parsed.`);
      programmes = existingProgrammes;
    } else if (getJsonFiles(rawDir).length > 0) {
      logger.warn(`[${datasetKey}] Existing raw files were preserved because parsing returned no programmes.`);
    }
  }

  await exportProgrammes(outputDir, programmes);
  const mergedRaw = generateMergedRaw(rawDir, path.join(outputDir, "all-daad-raw.json"));

  logger.success(`[${datasetKey}] Done. ${programmes.length} programmes saved.`);
  return {
    datasetKey,
    name: datasetConfig.name,
    outputDir,
    count: programmes.length,
    rawCount: mergedRaw.length,
    programmes,
  };
}

module.exports = {
  buildPageDetailUrl,
  extractIdFromUrl,
  extractProgrammeIds,
  extractProgrammeItems,
  fetchJson,
  getLimitFromUrl,
  migrateAppliedSciencesRaw,
  parseRawDirectory,
  readExistingProgrammes,
  scrapeDataset,
  withLimit,
  withOffset,
};
