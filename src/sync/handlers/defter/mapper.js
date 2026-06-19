const {
  getDocId,
  getDocRev,
  getLoadHash,
  safeNumber,
} = require("../../utils/doc");

function mapDefter(doc) {
  return {
    id: getDocId(doc),
    rev: getDocRev(doc),
    load_hash_sha256: getLoadHash(doc),

    adi: doc.Adi || "",
    bellik: doc.Bellik || null,

    id_walyuta: doc.IdWalyuta || doc.id_walyuta || null,
    kodu_txt: doc.KoduTxt || null,
    limiti_borcda: safeNumber(doc.LimitiBorcda),
    parent_id: doc.ParentId || null,

    status_is_aktif: safeNumber(doc.StatusIsAktif),

    uytgeme_tarih: doc.uytgeme_tarih || null,
    uytgeme_tarih_yen: doc.uytgeme_tarih_yen || null,
    uytgeme_terminal: doc.uytgeme_terminal || null,
    uytgeme_device: doc.uytgeme_device || null,
    uytgeme_isci: doc.uytgeme_isci || null,
  };
}

module.exports = { mapDefter };