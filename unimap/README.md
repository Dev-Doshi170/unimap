# UniMap

UniMap is a vanilla JavaScript university explorer for Dev Doshi's Germany study profile. It loads local DAAD data, scores each programme, and renders universities as dots around Dev: closer dots are better matches.

## Run

From this folder:

```bash
npx vite --host 127.0.0.1
```

Or serve it statically:

```bash
npx serve .
```

## Update Data

Replace `data/all-daad-raw.json` with a fresh copy of the combined DAAD aggregate JSON. The expected shape is:

```js
[{ fileName: "w15232.json", fileId: "w15232", data: { page: { sections: {} } } }]
```

The app reads it with `fetch('./data/all-daad-raw.json')`, so no runtime API calls are needed for the dataset.

## Scoring

Scoring is implemented in `scorer.js` and returns `{ total, breakdown }`. The 100-point score combines course relevance, fees, teaching language, admission ease, university type preference, and work-experience fit using the weighted rules from the project brief. Filters can switch the orbit distance from overall score to course relevance, fees, or admission ease.
