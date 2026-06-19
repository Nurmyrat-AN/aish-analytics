CREATE TABLE IF NOT EXISTS depo (
    id TEXT PRIMARY KEY,
    rev TEXT,
    load_hash_sha256 TEXT,

    adi TEXT NOT NULL,
    kodu_txt TEXT,
    bellik TEXT,

    id_bunun_promo_deposu TEXT,

    sorumlu_terminal TEXT,

    status_is_aktif INTEGER,

    uytgeme_tarih TEXT,
    uytgeme_tarih_yen TEXT,
    uytgeme_terminal TEXT,
    uytgeme_device TEXT,
    uytgeme_isci TEXT
);

CREATE INDEX IF NOT EXISTS idx_depo_adi
ON depo(adi);

CREATE INDEX IF NOT EXISTS idx_depo_status
ON depo(status_is_aktif);

CREATE INDEX IF NOT EXISTS idx_depo_terminal
ON depo(sorumlu_terminal);

CREATE INDEX IF NOT EXISTS idx_depo_promo
ON depo(id_bunun_promo_deposu);