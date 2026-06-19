const db = require("../../../config/sqlite");

const deleteBySourceId = db.prepare(`
  DELETE FROM z_kurs_walyuta
  WHERE source_id = ?
`);

const insertRate = db.prepare(`
  INSERT INTO z_kurs_walyuta (
    source_id,
    rev,
    load_hash_sha256,

    id_walyuta_from,
    id_walyuta_to,

    business_date,
    kurs_tarih,
    rate_current,

    status_is_aktif,

    uytgeme_tarih,
    uytgeme_tarih_yen,
    uytgeme_terminal,
    uytgeme_device,
    uytgeme_isci
  )
  VALUES (
    @source_id,
    @rev,
    @load_hash_sha256,

    @id_walyuta_from,
    @id_walyuta_to,

    @business_date,
    @kurs_tarih,
    @rate_current,

    @status_is_aktif,

    @uytgeme_tarih,
    @uytgeme_tarih_yen,
    @uytgeme_terminal,
    @uytgeme_device,
    @uytgeme_isci
  )
`);

const saveZKursWalyuta = db.transaction((sourceId, rows) => {
  deleteBySourceId.run(sourceId);

  for (const row of rows) {
    insertRate.run(row);
  }
});

module.exports = {
  saveZKursWalyuta,
};