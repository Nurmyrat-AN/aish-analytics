const {
  getDocId,
  getDocRev,
  getLoadHash,
  safeNumber,
} = require("../../utils/doc");

function mapAyarUmum(doc) {
  return {
    id: getDocId(doc),
    rev: getDocRev(doc),
    load_hash_sha256: getLoadHash(doc),

    para_adi: doc.paraAdi || null,
    para_adi_tenne: doc.paraAdi_Tenne || null,
    para_adi_round_to_nearest_tenne: safeNumber(doc.paraAdi_roundToNearestTenne),

    dowlet_tutumy: safeNumber(doc.dowletTutumy),
    gelir_gider_girish_fiyati_neye_gore: safeNumber(doc.gelirGiderGirishFiyatiNeyeGore),

    status_is_aktif: safeNumber(doc.StatusIsAktif),

    uytgeme_tarih: doc.uytgeme_tarih || null,
    uytgeme_tarih_yen: doc.uytgeme_tarih_yen || null,
  };
}

module.exports = { mapAyarUmum };