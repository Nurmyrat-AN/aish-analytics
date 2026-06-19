const db = require("../config/sqlite");

const upsertUnknownDocument = db.prepare(`
  INSERT INTO sync_unknown_document (
    dokuman_tipi,
    count_seen,
    first_seen_at,
    last_seen_at
  )
  VALUES (
    ?,
    1,
    datetime('now'),
    datetime('now')
  )
  ON CONFLICT(dokuman_tipi) DO UPDATE SET
    count_seen = count_seen + 1,
    last_seen_at = datetime('now')
`);

function saveUnknownDocument(doc) {
  const type = doc?.$dokuman_tipi || "unknown";

  upsertUnknownDocument.run(type);
}

module.exports = {
  saveUnknownDocument,
};