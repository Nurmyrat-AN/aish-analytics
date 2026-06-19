CREATE TABLE IF NOT EXISTS olc_umum (
    id TEXT PRIMARY KEY,
    rev TEXT,
    load_hash_sha256 TEXT,

    adi TEXT NOT NULL,
    kodu_txt TEXT,
    bellik TEXT,

    status_is_aktif INTEGER,

    uytgeme_tarih TEXT,
    uytgeme_tarih_yen TEXT,
    uytgeme_terminal TEXT,
    uytgeme_device TEXT,
    uytgeme_isci TEXT
);

CREATE INDEX IF NOT EXISTS idx_olc_umum_adi
ON olc_umum(adi);

CREATE INDEX IF NOT EXISTS idx_olc_umum_status
ON olc_umum(status_is_aktif);