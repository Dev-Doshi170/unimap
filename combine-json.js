const fs = require("fs");
const path = require("path");

const RAW_DIR = "./output/raw";
const OUTPUT_FILE = "./all-daad-raw.json";

async function combineJsonFiles() {
  const files = fs
    .readdirSync(RAW_DIR)
    .filter((file) => file.endsWith(".json"));

  console.log(`Found ${files.length} JSON files`);

  const combined = [];

  for (const file of files) {
    try {
      const fullPath = path.join(RAW_DIR, file);

      const content = fs.readFileSync(
        fullPath,
        "utf8"
      );

      const json = JSON.parse(content);

      combined.push({
        fileName: file,
        fileId: path.basename(file, ".json"),
        data: json,
      });
    } catch (err) {
      console.error(
        `Failed to read ${file}:`,
        err.message
      );
    }
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(combined, null, 2)
  );

  console.log(
    `Combined ${combined.length} files into ${OUTPUT_FILE}`
  );
}

combineJsonFiles();