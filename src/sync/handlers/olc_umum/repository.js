const db = require("../../../config/sqlite");

const upsertOlcUmum = db.prepare(`
  INSERT INTO olc_umum (
    id,
    rev,
    load_hash_sha256,

    adi,
    kodu_txt,
    bellik,

    status_is_aktif,

    uytgeme_tarih,
    uytgeme_tarih_yen,
    uytgeme_terminal,
    uytgeme_device,
    uytgeme_isci
  )
  VALUES (
    @id,
    @rev,
    @load_hash_sha256,

    @adi,
    @kodu_txt,
    @bellik,

    @status_is_aktif,

    @uytgeme_tarih,
    @uytgeme_tarih_yen,
    @uytgeme_terminal,
    @uytgeme_device,
    @uytgeme_isci
  )
  ON CONFLICT(id) DO UPDATE SET
    rev = excluded.rev,
    load_hash_sha256 = excluded.load_hash_sha256,
    adi = excluded.adi,
    kodu_txt = excluded.kodu_txt,
    bellik = excluded.bellik,
    status_is_aktif = excluded.status_is_aktif,
    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen,
    uytgeme_terminal = excluded.uytgeme_terminal,
    uytgeme_device = excluded.uytgeme_device,
    uytgeme_isci = excluded.uytgeme_isci
`);

function saveOlcUmum(olc) {
  upsertOlcUmum.run(olc);
}

module.exports = { saveOlcUmum };