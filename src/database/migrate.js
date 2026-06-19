const fs = require("fs");
const path = require("path");
const db = require("../config/sqlite");

const migrationsDir = path.join(__dirname, "migrations");

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
`);

function getAppliedMigrations() {
  const rows = db.prepare("SELECT filename FROM schema_migrations").all();
  return new Set(rows.map((r) => r.filename));
}

function runMigrations() {
  const applied = getAppliedMigrations();

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const insertMigration = db.prepare(`
    INSERT INTO schema_migrations (filename, applied_at)
    VALUES (?, ?)
  `);

  const transaction = db.transaction(() => {
    for (const file of files) {
      if (applied.has(file)) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

      console.log(`Running migration: ${file}`);
      db.exec(sql);

      insertMigration.run(file, new Date().toISOString());
    }
  });

  transaction();

  console.log("Migrations completed");
}

runMigrations();