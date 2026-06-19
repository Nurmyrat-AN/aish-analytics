CREATE TABLE IF NOT EXISTS urun (
  id TEXT PRIMARY KEY,
  rev TEXT,
  load_hash_sha256 TEXT,

  adi TEXT NOT NULL,
  kodu_txt TEXT,

  id_fiyat_walyutasy TEXT,
  olcu_birimi TEXT,

  ozel_kod1 TEXT,
  ozel_kod2 TEXT,
  ozel_kod3 TEXT,
  ozel_kod4 TEXT,
  ozel_kod5 TEXT,

  temel_alis_fiyati REAL DEFAULT 0,
  temel_satis_fiyati REAL DEFAULT 0,
  minimum_satis_fiyati REAL DEFAULT 0,

  stokda_en_az REAL DEFAULT 0,
  agramy_gramda_1_esasy_olcegin REAL DEFAULT 0,

  is_eksiye_gidebilir INTEGER DEFAULT 0,
  is_giristen_ucuz_satilabilir INTEGER DEFAULT 0,
  is_promo INTEGER DEFAULT 0,
  is_satisda_duzumi_gorunsin INTEGER DEFAULT 0,
  is_yaramlylyk_bar INTEGER DEFAULT 0,

  status_is_aktif INTEGER,
  uytgeme_tarih TEXT,
  uytgeme_tarih_yen TEXT,
  uytgeme_terminal TEXT,
  uytgeme_device TEXT,
  uytgeme_isci TEXT
);

CREATE TABLE IF NOT EXISTS urun_barkod (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  urun_id TEXT NOT NULL,
  barkod TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS urun_ek_olcu (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  urun_id TEXT NOT NULL,
  olcu_id TEXT,
  adi TEXT,
  temele_orani REAL DEFAULT 0,
  barkod TEXT,
  fiyat REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS urun_duzumi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  urun_id TEXT NOT NULL,
  child_urun_id TEXT,
  qty REAL DEFAULT 0,
  olcu_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_urun_adi ON urun(adi);
CREATE INDEX IF NOT EXISTS idx_urun_kodu_txt ON urun(kodu_txt);
CREATE INDEX IF NOT EXISTS idx_urun_status ON urun(status_is_aktif);
CREATE INDEX IF NOT EXISTS idx_urun_ozel_kod1 ON urun(ozel_kod1);
CREATE INDEX IF NOT EXISTS idx_urun_ozel_kod2 ON urun(ozel_kod2);
CREATE INDEX IF NOT EXISTS idx_urun_ozel_kod3 ON urun(ozel_kod3);
CREATE INDEX IF NOT EXISTS idx_urun_ozel_kod4 ON urun(ozel_kod4);
CREATE INDEX IF NOT EXISTS idx_urun_ozel_kod5 ON urun(ozel_kod5);
CREATE INDEX IF NOT EXISTS idx_urun_fiyat_walyuta ON urun(id_fiyat_walyutasy);
CREATE INDEX IF NOT EXISTS idx_urun_olcu_birimi ON urun(olcu_birimi);

CREATE UNIQUE INDEX IF NOT EXISTS idx_urun_barkod_unique
ON urun_barkod(urun_id, barkod);

CREATE INDEX IF NOT EXISTS idx_urun_barkod_barkod
ON urun_barkod(barkod);

CREATE INDEX IF NOT EXISTS idx_urun_barkod_urun
ON urun_barkod(urun_id);

CREATE INDEX IF NOT EXISTS idx_urun_ek_olcu_urun
ON urun_ek_olcu(urun_id);

CREATE INDEX IF NOT EXISTS idx_urun_duzumi_urun
ON urun_duzumi(urun_id);