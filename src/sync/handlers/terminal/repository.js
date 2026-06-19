const db = require("../../../config/sqlite");

const upsertTerminal = db.prepare(`
  INSERT INTO terminal (
    id,
    rev,
    load_hash_sha256,

    adi,
    tipi,
    fatura_icin_on_ek,
    satici_id,

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
    @tipi,
    @fatura_icin_on_ek,
    @satici_id,

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
    tipi = excluded.tipi,
    fatura_icin_on_ek = excluded.fatura_icin_on_ek,
    satici_id = excluded.satici_id,
    status_is_aktif = excluded.status_is_aktif,
    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen,
    uytgeme_terminal = excluded.uytgeme_terminal,
    uytgeme_device = excluded.uytgeme_device,
    uytgeme_isci = excluded.uytgeme_isci
`);

function saveTerminal(terminal) {
  upsertTerminal.run(terminal);
}

module.exports = { saveTerminal };