CREATE TABLE IF NOT EXISTS sync_unknown_document (
  dokuman_tipi TEXT PRIMARY KEY,
  count_seen INTEGER DEFAULT 1,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS sync_unknown_document_type
ON sync_unknown_document(dokuman_tipi);