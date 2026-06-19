const {
  getDocId,
  getDocRev,
  getLoadHash,
  safeNumber,
} = require("../../utils/doc");

function mapDepo(doc) {
  return {
    id: getDocId(doc),
    rev: getDocRev(doc),
    load_hash_sha256: getLoadHash(doc),

    adi: doc.Adi || "",
    kodu_txt: doc.KoduTxt || null,
    bellik: doc.Bellik || null,

    id_bunun_promo_deposu: doc.id_bununPromoDeposu || doc.id_bunun_promo_deposu || null,
    sorumlu_terminal: doc.sorumluTerminal || doc.SorumluTerminal || null,

    status_is_aktif: safeNumber(doc.StatusIsAktif),

    uytgeme_tarih: doc.uytgeme_tarih || null,
    uytgeme_tarih_yen: doc.uytgeme_tarih_yen || null,
    uytgeme_terminal: doc.uytgeme_terminal || null,
    uytgeme_device: doc.uytgeme_device || null,
    uytgeme_isci: doc.uytgeme_isci || null,
  };
}

module.exports = { mapDepo };