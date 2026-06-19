const db = require("../config/sqlite");

const getStmt = db.prepare(`
  SELECT value
  FROM sync_meta
  WHERE key = ?
`);

const setStmt = db.prepare(`
  INSERT INTO sync_meta (
    key,
    value,
    updated_at
  )
  VALUES (
    ?,
    ?,
    datetime('now')
  )
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = datetime('now')
`);

function getSyncMeta(key, fallback = null) {
  const row = getStmt.get(key);
  return row ? row.value : fallback;
}

function setSyncMeta(key, value) {
  setStmt.run(key, String(value));
}

function getLastSeq() {
  return getSyncMeta("couchdb_last_seq", "0");
}

function setLastSeq(seq) {
  setSyncMeta("couchdb_last_seq", seq);
}

module.exports = {
  getSyncMeta,
  setSyncMeta,
  getLastSeq,
  setLastSeq,
};