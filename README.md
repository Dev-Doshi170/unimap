# DAAD Scraper and UniMap Data Pipeline

## 1. Project Overview

This project scrapes DAAD study programme data for English-taught Master's programmes in computer science related subject groups. It stores full raw DAAD detail responses, parses normalized programme records, exports JSON and Excel files, and keeps the `unimap` frontend data file current.

The frontend contract is preserved: `unimap/data/all-daad-raw.json` is always an array of `{ fileName, fileId, data }`, where `data` is the full DAAD API detail response.

## 2. Folder Structure

```text
study/
├── config/
│   └── datasets.json
├── src/
│   ├── exporter.js
│   ├── logger.js
│   ├── merger.js
│   ├── parser.js
│   └── scraper.js
├── output/
│   ├── applied_sciences/
│   │   ├── raw/
│   │   ├── daad-programs.json
│   │   ├── daad-programs.xlsx
│   │   └── all-daad-raw.json
│   ├── universities/
│   │   ├── raw/
│   │   ├── daad-programs.json
│   │   ├── daad-programs.xlsx
│   │   └── all-daad-raw.json
│   ├── raw/
│   └── all-daad-master.json
├── unimap/
│   └── data/
│       └── all-daad-raw.json
├── run.js
├── combine-json.js
├── daad-scraper.js
├── package.json
└── README.md
```

`output/raw/` and root `all-daad-raw.json` are kept for backward compatibility.

## 3. Data Flow Diagram

```text
config/datasets.json
        |
        v
run.js selects dataset(s)
        |
        v
src/scraper.js fetches DAAD list and missing detail files
        |
        v
output/<dataset>/raw/w*.json
        |
        +--> src/parser.js   --> output/<dataset>/daad-programs.json
        |                    --> output/<dataset>/daad-programs.xlsx
        |
        +--> src/merger.js   --> output/<dataset>/all-daad-raw.json
                             --> unimap/data/all-daad-raw.json
                             --> output/all-daad-master.json
```

## 4. How To Add A New DAAD Dataset

Add a new entry to `config/datasets.json` with:

- `name`: Display name used in logs and master output.
- `outputDir`: Dataset output folder under `output/`.
- `listUrl`: DAAD list API URL.
- `detailBaseUrl`: Detail API prefix, usually `https://api.daad.de/api/ajax/hsk/detail/en?hec-id=`.
- `daadBaseUrl`: Usually `https://www.daad.de`.

Then run:

```bash
npm run scrape
```

## 5. How To Update Subject Filters

Edit the `hec-subjectGroup` query parameter in the relevant dataset `listUrl` in `config/datasets.json`. Keep the rest of the URL structure intact unless DAAD changes the API.

## 6. Commands Reference

```bash
npm run scrape
npm run scrape:applied
npm run scrape:universities
npm run test
node run.js --force
node run.js universities --force
```

`--force` re-downloads details even when raw files already exist.

## 7. Output Files Explained

- `output/<dataset>/raw/w*.json`: Full raw DAAD detail responses, one file per programme id.
- `output/<dataset>/daad-programs.json`: Parsed programme records for analysis.
- `output/<dataset>/daad-programs.xlsx`: Excel export with core fields, formatted headers, and readable column widths.
- `output/<dataset>/all-daad-raw.json`: Dataset-level raw merge in UniMap-compatible envelope format.
- `output/all-daad-master.json`: Master parsed output grouped by dataset.
- `unimap/data/all-daad-raw.json`: Combined raw data for the frontend.

## 8. How UniMap Frontend Uses The Data

`unimap/app.js` loads:

```js
fetch("./data/all-daad-raw.json")
```

It expects an array of entries shaped like:

```json
{
  "fileName": "w7790.json",
  "fileId": "w7790",
  "data": {}
}
```

The scraper preserves that shape exactly and only updates `unimap/data/all-daad-raw.json` inside the `unimap` folder.

## 9. Incremental Update Behavior

- Existing raw files in `output/<dataset>/raw/` are skipped by default.
- `output/raw/` is copied into `output/applied_sciences/raw/` on first applied-sciences run if the new raw folder is empty.
- Missing programme ids from the current list are kept on disk and marked with `status: "removed"` in parsed JSON.
- Existing non-empty dataset exports are not replaced with empty output if a run cannot parse any programmes.
- `--force` re-downloads detail files for the selected dataset(s).

## 10. Troubleshooting Common Errors

- List endpoint fails: that dataset is aborted, the error is logged, and other datasets continue.
- Detail page returns 404: that programme is skipped and the run continues.
- Network timeout: requests retry three times with exponential backoff.
- Malformed JSON: the programme is skipped and the URL/id is logged.
- UniMap shows no data: verify `unimap/data/all-daad-raw.json` exists and contains `{ fileName, fileId, data }` entries.
- Excel file will not open: close any already-open copy of the XLSX and rerun the scraper.
# unimap.
