console.warn(
  "[DEPRECATED] daad-scraper.js is kept for backward compatibility. Use `npm run scrape:applied` or `node run.js applied_sciences`."
);

process.argv = [process.argv[0], require.resolve("./run.js"), "applied_sciences", ...process.argv.slice(2)];
require("./run")
  .main()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
