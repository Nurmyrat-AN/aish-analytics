const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { sqlitePath } = require("./env");

const dbPath = path.resolve(sqlitePath);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 10000");
db.pragma("synchronous = NORMAL");
db.pragma("foreign_keys = OFF");
db.pragma("temp_store = MEMORY");

module.exports = db;