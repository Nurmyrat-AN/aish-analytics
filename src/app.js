// src/app.js
const { startChangesReader } = require("./sync/runChangesReader");
const { startWebServer } = require("./web/server");

async function main() {
  startWebServer();
  startChangesReader();
}

main();