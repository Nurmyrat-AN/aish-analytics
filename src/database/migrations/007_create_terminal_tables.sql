CREATE TABLE terminal (
    id TEXT PRIMARY KEY,
    rev TEXT,
    load_hash_sha256 TEXT,
    adi TEXT NOT NULL,
    tipi INTEGER,
    fatura_icin_on_ek TEXT,
    satici_id TEXT,
    status_is_aktif INTEGER,
    uytgeme_tarih TEXT,
    uytgeme_tarih_yen TEXT,
    uytgeme_terminal TEXT,
    uytgeme_device TEXT,
    uytgeme_isci TEXT
);