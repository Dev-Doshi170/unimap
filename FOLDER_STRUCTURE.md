# Folder Structure

This document describes the current structure of the `study` workspace.

Generated dependency folders such as `node_modules` and Git internals such as `.git` are summarized because they contain package-manager or version-control files rather than project source files.

## Project Summary

This repository contains:

- A Node.js DAAD scraper that fetches German study programme data.
- Generated DAAD JSON/XLSX output files.
- A `unimap` vanilla JavaScript web app that loads the combined DAAD data and scores university programmes.

## Root Folder: `study`

```text
study/
├── .git/
├── README.md
├── FOLDER_STRUCTURE.md
├── all-daad-raw.json
├── combine-json.js
├── daad-programs.json
├── daad-programs.xlsx
├── daad-scraper.js
├── node_modules/
├── output/
├── package-lock.json
├── package.json
├── uniListAppliedSciences.json
└── unimap/
```

### Root Files

- `.git/` - Git repository metadata. This stores commit history, branches, refs, objects, and local Git configuration.
- `README.md` - Minimal root readme containing the project title.
- `FOLDER_STRUCTURE.md` - This folder and file structure documentation.
- `all-daad-raw.json` - Combined raw DAAD API response data from all raw JSON files.
- `combine-json.js` - Node.js script that reads JSON files from `output/raw/` and combines them into `all-daad-raw.json`.
- `daad-programs.json` - Processed DAAD programme data in JSON format.
- `daad-programs.xlsx` - Processed DAAD programme data exported as an Excel spreadsheet.
- `daad-scraper.js` - Main Node.js scraper. It calls the DAAD API, stores raw course detail responses, extracts programme details, and writes JSON/XLSX outputs.
- `node_modules/` - Installed root Node.js dependencies for the scraper scripts. Main dependencies are `axios`, `exceljs`, and `p-limit`.
- `output/` - Generated scraper output folder.
- `package-lock.json` - Exact installed dependency lockfile for the root Node.js project.
- `package.json` - Root package manifest. Defines scraper dependencies.
- `uniListAppliedSciences.json` - JSON data file, likely used as a university list/reference dataset for applied sciences programmes.
- `unimap/` - Frontend web app for exploring and scoring universities using the DAAD data.

## Folder: `output`

```text
output/
├── daad-programs.json
├── daad-programs.xlsx
└── raw/
```

### `output` Files

- `daad-programs.json` - Generated processed programme list from the scraper.
- `daad-programs.xlsx` - Generated spreadsheet version of the processed programme list.
- `raw/` - Contains individual raw DAAD API responses, one JSON file per programme/course id.

## Folder: `output/raw`

This folder contains 92 raw DAAD course-detail JSON files.

```text
output/raw/
├── w15232.json
├── w23207.json
├── w29281.json
├── w31435.json
├── w40883.json
├── w41989.json
├── w44336.json
├── w44338.json
├── w46655.json
├── w48416.json
├── w48425.json
├── w56355.json
├── w58006.json
├── w58177.json
├── w59419.json
├── w5965.json
├── w60464.json
├── w61451.json
├── w61781.json
├── w63849.json
├── w63879.json
├── w64006.json
├── w64105.json
├── w64134.json
├── w64135.json
├── w64245.json
├── w64341.json
├── w64682.json
├── w64706.json
├── w64711.json
├── w64728.json
├── w64732.json
├── w64745.json
├── w64772.json
├── w64814.json
├── w64844.json
├── w64881.json
├── w64964.json
├── w64989.json
├── w65029.json
├── w65096.json
├── w65163.json
├── w65199.json
├── w65229.json
├── w65273.json
├── w65599.json
├── w66233.json
├── w67120.json
├── w67238.json
├── w67239.json
├── w67297.json
├── w67457.json
├── w67521.json
├── w67708.json
├── w67862.json
├── w69119.json
├── w70007.json
├── w70087.json
├── w70240.json
├── w70241.json
├── w70242.json
├── w70248.json
├── w70254.json
├── w70606.json
├── w70803.json
├── w71054.json
├── w7153.json
├── w72013.json
├── w72154.json
├── w72321.json
├── w72392.json
├── w72436.json
├── w72437.json
├── w72471.json
├── w72904.json
├── w72981.json
├── w72984.json
├── w73172.json
├── w73251.json
├── w74100.json
├── w74173.json
├── w74175.json
├── w74901.json
├── w76327.json
├── w76735.json
├── w76837.json
├── w76947.json
├── w76948.json
├── w77134.json
├── w77135.json
├── w7790.json
└── w9362.json
```

Each file is a raw API response saved by `daad-scraper.js` using the programme id as the file name.

## Folder: `unimap`

```text
unimap/
├── README.md
├── app.js
├── data/
├── index.html
├── node_modules/
├── package.json
├── parser.test.js
├── scorer.js
├── scorer.test.js
└── style.css
```

### `unimap` Files

- `README.md` - Documentation for running the UniMap frontend and updating its dataset.
- `app.js` - Main browser application. It loads local DAAD data, parses programmes, applies scoring, and renders the university explorer UI.
- `data/` - Local data folder used by the frontend.
- `index.html` - HTML entry point for the UniMap web app.
- `node_modules/` - Local frontend tooling cache/dependencies. Currently contains Vite-generated dependency data.
- `package.json` - UniMap package manifest. Sets `"type": "module"` and defines the `test` script.
- `parser.test.js` - Node test file for parsing DAAD raw data into app-ready programme records.
- `scorer.js` - Scoring logic for ranking programmes against the user profile.
- `scorer.test.js` - Node test file for scoring behavior.
- `style.css` - Styling for the UniMap interface.

## Folder: `unimap/data`

```text
unimap/data/
└── all-daad-raw.json
```

### `unimap/data` Files

- `all-daad-raw.json` - Local copy of the combined DAAD raw dataset used by `unimap/app.js` via `fetch('./data/all-daad-raw.json')`.

## Folder: `unimap/node_modules`

```text
unimap/node_modules/
└── .vite/
```

### `unimap/node_modules` Files

- `.vite/` - Vite dependency cache created by local frontend tooling.

## Data Flow

```text
daad-scraper.js
  -> output/raw/*.json
  -> output/daad-programs.json
  -> output/daad-programs.xlsx

combine-json.js
  -> reads output/raw/*.json
  -> writes all-daad-raw.json

unimap/app.js
  -> reads unimap/data/all-daad-raw.json
  -> parses and scores programmes
  -> renders the browser UI
```

## Important Commands

From the root folder:

```bash
node daad-scraper.js
node combine-json.js
```

From the `unimap` folder:

```bash
npm test
npx vite --host 127.0.0.1
```
