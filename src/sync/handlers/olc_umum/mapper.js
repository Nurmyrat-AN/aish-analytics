const {
  getDocId,
  getDocRev,
  getLoadHash,
  safeNumber,
} = require("../../utils/doc");

function mapOlcUmum(doc) {
  return {
    id: getDocId(doc),
    rev: getDocRev(doc),
    load_hash_sha256: getLoadHash(doc),

    adi: doc.Adi || "",
    kodu_txt: doc.KoduTxt || null,
    bellik: doc.Bellik || null,

    status_is_aktif: safeNumber(doc.StatusIsAktif),

    uytgeme_tarih: doc.uytgeme_tarih || null,
    uytgeme_tarih_yen: doc.uytgeme_tarih_yen || null,
    uytgeme_terminal: doc.uytgeme_terminal || null,
    uytgeme_device: doc.uytgeme_device || null,
    uytgeme_isci: doc.uytgeme_isci || null,
  };
}

module.exports = { mapOlcUmum };