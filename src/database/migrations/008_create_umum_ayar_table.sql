CREATE TABLE IF NOT EXISTS ayar_umum (
  id TEXT PRIMARY KEY,
  rev TEXT,
  load_hash_sha256 TEXT,

  para_adi TEXT,
  para_adi_tenne TEXT,
  para_adi_round_to_nearest_tenne REAL DEFAULT 0,

  dowlet_tutumy REAL DEFAULT 0,
  gelir_gider_girish_fiyati_neye_gore INTEGER,

  status_is_aktif INTEGER,

  uytgeme_tarih TEXT,
  uytgeme_tarih_yen TEXT
);