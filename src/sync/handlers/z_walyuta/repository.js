const db = require("../../../config/sqlite");

const upsertZWalyuta = db.prepare(`
  INSERT INTO z_walyuta (
    id,
    rev,
    load_hash_sha256,

    adi,
    bellik,
    kodu_txt,

    tenne_adi,
    round_to_nearest_tenne,
    is_base,

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
    @bellik,
    @kodu_txt,

    @tenne_adi,
    @round_to_nearest_tenne,
    @is_base,

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
    bellik = excluded.bellik,
    kodu_txt = excluded.kodu_txt,
    tenne_adi = excluded.tenne_adi,
    round_to_nearest_tenne = excluded.round_to_nearest_tenne,
    is_base = excluded.is_base,
    status_is_aktif = excluded.status_is_aktif,
    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen,
    uytgeme_terminal = excluded.uytgeme_terminal,
    uytgeme_device = excluded.uytgeme_device,
    uytgeme_isci = excluded.uytgeme_isci
`);

function saveZWalyuta(walyuta) {
  upsertZWalyuta.run(walyuta);
}

module.exports = { saveZWalyuta };