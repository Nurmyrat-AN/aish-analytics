CREATE TABLE IF NOT EXISTS defter (
  id TEXT PRIMARY KEY,
  rev TEXT,
  load_hash_sha256 TEXT,

  adi TEXT NOT NULL,
  bellik TEXT,

  id_walyuta TEXT,
  kodu_txt TEXT,
  limiti_borcda REAL DEFAULT 0,
  parent_id TEXT,

  status_is_aktif INTEGER,

  uytgeme_tarih TEXT,
  uytgeme_tarih_yen TEXT,
  uytgeme_terminal TEXT,
  uytgeme_device TEXT,
  uytgeme_isci TEXT
);

CREATE INDEX IF NOT EXISTS idx_defter_adi
ON defter(adi);

CREATE INDEX IF NOT EXISTS idx_defter_status
ON defter(status_is_aktif);

CREATE INDEX IF NOT EXISTS idx_defter_walyuta
ON defter(id_walyuta);

CREATE INDEX IF NOT EXISTS idx_defter_parent
ON defter(parent_id);