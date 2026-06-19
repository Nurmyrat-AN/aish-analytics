const {
  getDocId,
  getDocRev,
  getLoadHash,
  safeNumber,
} = require("../../utils/doc");

function mapOneRate(sourceDoc, item) {
  return {
    source_id: getDocId(sourceDoc),
    rev: item._rev || getDocRev(sourceDoc),
    load_hash_sha256: getLoadHash(sourceDoc),

    id_walyuta_from: item.IdWalyuta_From || sourceDoc.IdWalyuta_From,
    id_walyuta_to: item.IdWalyuta_To || sourceDoc.IdWalyuta_To,

    business_date: item.hangiTarihte || sourceDoc.hangiTarihte || null,
    kurs_tarih: item.uytgeme_tarih || sourceDoc.uytgeme_tarih || null,

    rate_current: safeNumber(item.RateCurrent),

    status_is_aktif: safeNumber(item.StatusIsAktif),

    uytgeme_tarih: item.uytgeme_tarih || null,
    uytgeme_tarih_yen: item.uytgeme_tarih_yen || null,
    uytgeme_terminal: item.uytgeme_terminal || null,
    uytgeme_device: item.uytgeme_device || null,
    uytgeme_isci: item.uytgeme_isci || null,
  };
}

function mapZKursWalyuta(doc) {
  const rows = [];

  if (Array.isArray(doc.lst_tarih_bunun)) {
    for (const item of doc.lst_tarih_bunun) {
      rows.push(mapOneRate(doc, item));
    }
  }

  rows.push(mapOneRate(doc, doc));

  return rows.filter((row) =>
    row.source_id &&
    row.id_walyuta_from &&
    row.id_walyuta_to &&
    row.kurs_tarih &&
    row.rate_current > 0
  );
}

module.exports = {
  mapZKursWalyuta,
};