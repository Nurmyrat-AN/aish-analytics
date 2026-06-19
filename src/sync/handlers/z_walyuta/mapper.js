const {
  getDocId,
  getDocRev,
  getLoadHash,
  safeNumber,
} = require("../../utils/doc");

function mapZWalyuta(doc) {
  const id = getDocId(doc);

  return {
    id,
    rev: getDocRev(doc),
    load_hash_sha256: getLoadHash(doc),

    adi: doc.Adi || "",
    bellik: doc.Bellik || null,
    kodu_txt: doc.KoduTxt || null,

    tenne_adi: doc.tenneAdi || doc.TenneAdi || null,
    round_to_nearest_tenne: safeNumber(
      doc.roundToNearestTenne || doc.RoundToNearestTenne
    ),

    is_base: id === "z_walyuta-1" ? 1 : 0,

    status_is_aktif: safeNumber(doc.StatusIsAktif),

    uytgeme_tarih: doc.uytgeme_tarih || null,
    uytgeme_tarih_yen: doc.uytgeme_tarih_yen || null,
    uytgeme_terminal: doc.uytgeme_terminal || null,
    uytgeme_device: doc.uytgeme_device || null,
    uytgeme_isci: doc.uytgeme_isci || null,
  };
}

module.exports = { mapZWalyuta };