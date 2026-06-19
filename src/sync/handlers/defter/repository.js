const db = require("../../../config/sqlite");

const upsertDefter = db.prepare(`
  INSERT INTO defter (
    id,
    rev,
    load_hash_sha256,

    adi,
    bellik,

    id_walyuta,
    kodu_txt,
    limiti_borcda,
    parent_id,

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

    @id_walyuta,
    @kodu_txt,
    @limiti_borcda,
    @parent_id,

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

    id_walyuta = excluded.id_walyuta,
    kodu_txt = excluded.kodu_txt,
    limiti_borcda = excluded.limiti_borcda,
    parent_id = excluded.parent_id,

    status_is_aktif = excluded.status_is_aktif,

    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen,
    uytgeme_terminal = excluded.uytgeme_terminal,
    uytgeme_device = excluded.uytgeme_device,
    uytgeme_isci = excluded.uytgeme_isci
`);

function saveDefter(defter) {
  upsertDefter.run(defter);
}

module.exports = { saveDefter };