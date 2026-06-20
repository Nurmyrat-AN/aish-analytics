const fs = require("fs");
const path = require("path");
const db = require("../config/sqlite");

const TABLES_TO_KEEP = [
  "sqlite_sequence"
];

const rows = db.prepare(`
  SELECT name
  FROM sqlite_master
  WHERE type = 'table'
    AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'app_settings' AND name NOT LIKE 'transaction_type'
`).all();

const reset = db.transaction(() => {
  db.pragma("foreign_keys = OFF");

  for (const row of rows) {
    if (TABLES_TO_KEEP.includes(row.name)) continue;
    db.prepare(`DELETE FROM ${row.name}`).run();
  }

  db.prepare(`DELETE FROM sqlite_sequence`).run();

  db.pragma("foreign_keys = ON");
});

reset();

console.log("Local SQLite database cleared successfully.");