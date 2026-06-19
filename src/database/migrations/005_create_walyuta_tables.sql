CREATE TABLE IF NOT EXISTS z_walyuta (
  id TEXT PRIMARY KEY,
  rev TEXT,
  load_hash_sha256 TEXT,

  adi TEXT NOT NULL,
  bellik TEXT,
  kodu_txt TEXT,

  is_base INTEGER DEFAULT 0,

  tenne_adi TEXT,
  round_to_nearest_tenne REAL DEFAULT 0,

  status_is_aktif INTEGER,

  uytgeme_tarih TEXT,
  uytgeme_tarih_yen TEXT,
  uytgeme_terminal TEXT,
  uytgeme_device TEXT,
  uytgeme_isci TEXT
);

CREATE TABLE IF NOT EXISTS z_kurs_walyuta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  source_id TEXT NOT NULL,
  rev TEXT,
  load_hash_sha256 TEXT,

  id_walyuta_from TEXT NOT NULL,
  id_walyuta_to TEXT NOT NULL,

  kurs_tarih TEXT NOT NULL,
  business_date TEXT NOT NULL,
  rate_current REAL NOT NULL,

  status_is_aktif INTEGER,

  uytgeme_tarih TEXT,
  uytgeme_tarih_yen TEXT,
  uytgeme_terminal TEXT,
  uytgeme_device TEXT,
  uytgeme_isci TEXT
);

CREATE INDEX IF NOT EXISTS idx_z_walyuta_adi
ON z_walyuta(adi);

CREATE INDEX IF NOT EXISTS idx_z_walyuta_status
ON z_walyuta(status_is_aktif);

CREATE INDEX IF NOT EXISTS idx_z_kurs_pair_date
ON z_kurs_walyuta(id_walyuta_from, id_walyuta_to, kurs_tarih);

CREATE INDEX IF NOT EXISTS idx_z_kurs_date
ON z_kurs_walyuta(kurs_tarih);

CREATE INDEX IF NOT EXISTS idx_z_kurs_from
ON z_kurs_walyuta(id_walyuta_from);

CREATE INDEX IF NOT EXISTS idx_z_kurs_to
ON z_kurs_walyuta(id_walyuta_to);

CREATE UNIQUE INDEX IF NOT EXISTS idx_z_kurs_unique_revision
ON z_kurs_walyuta(source_id, rev, kurs_tarih, id_walyuta_from, id_walyuta_to);

CREATE INDEX IF NOT EXISTS idx_z_kurs_business_date
ON z_kurs_walyuta(business_date);