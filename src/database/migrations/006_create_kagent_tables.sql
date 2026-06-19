CREATE TABLE IF NOT EXISTS kagent (
  id TEXT PRIMARY KEY,
  rev TEXT,
  load_hash_sha256 TEXT,

  adi TEXT NOT NULL,
  kodu_txt TEXT,

  tel TEXT,
  cep_tel TEXT,
  email TEXT,

  adres TEXT,
  adres_jay TEXT,
  adres_koce TEXT,
  adres_korpus TEXT,
  adres_kwartira TEXT,

  unica_adres_welayat TEXT,
  unica_adres_shaher TEXT,
  unica_adres_oba TEXT,

  bellik TEXT,
  customer_class TEXT,
  vazifesi TEXT,

  is_isgar INTEGER DEFAULT 0,
  is_sluj INTEGER DEFAULT 0,
  is_genel_hesabi_etkiliyor INTEGER DEFAULT 1,
  is_sadece_nakit_satin_alabilir INTEGER DEFAULT 0,

  kredi_limiti REAL DEFAULT 0,
  kac_gun_vadeyle_urun_aliyor INTEGER DEFAULT 0,
  maasi REAL DEFAULT 0,

  rayon_marsrutno INTEGER DEFAULT 0,
  rayon_ozi TEXT,

  gps_latitude REAL DEFAULT 0,
  gps_longitude REAL DEFAULT 0,

  status_is_aktif INTEGER,

  uytgeme_tarih TEXT,
  uytgeme_tarih_yen TEXT,
  uytgeme_terminal TEXT,
  uytgeme_device TEXT,
  uytgeme_isci TEXT
);

CREATE TABLE IF NOT EXISTS kagent_barkod (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kagent_id TEXT NOT NULL,
  barkod TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kagent_oz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kagent_id TEXT NOT NULL,
  oz TEXT NOT NULL,
  position INTEGER
);

CREATE INDEX IF NOT EXISTS idx_kagent_adi
ON kagent(adi);

CREATE INDEX IF NOT EXISTS idx_kagent_kodu_txt
ON kagent(kodu_txt);

CREATE INDEX IF NOT EXISTS idx_kagent_tel
ON kagent(tel);

CREATE INDEX IF NOT EXISTS idx_kagent_customer_class
ON kagent(customer_class);

CREATE INDEX IF NOT EXISTS idx_kagent_vazifesi
ON kagent(vazifesi);

CREATE INDEX IF NOT EXISTS idx_kagent_status
ON kagent(status_is_aktif);

CREATE INDEX IF NOT EXISTS idx_kagent_is_isgar
ON kagent(is_isgar);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kagent_barkod_unique
ON kagent_barkod(kagent_id, barkod);

CREATE INDEX IF NOT EXISTS idx_kagent_barkod_barkod
ON kagent_barkod(barkod);

CREATE INDEX IF NOT EXISTS idx_kagent_oz_oz
ON kagent_oz(oz);

CREATE INDEX IF NOT EXISTS idx_kagent_oz_kagent
ON kagent_oz(kagent_id);