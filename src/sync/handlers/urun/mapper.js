const {
  getDocId,
  getDocRev,
  getLoadHash,
  boolToInt,
  safeNumber,
} = require("../../utils/doc");

function mapUrun(doc) {
  return {
    id: getDocId(doc),
    rev: getDocRev(doc),
    load_hash_sha256: getLoadHash(doc),

    adi: doc.Adi || "",
    kodu_txt: doc.KoduTxt || null,

    id_fiyat_walyutasy: doc.idFiyatWalyutasy || null,
    olcu_birimi: doc.OlcuBirimi || null,

    ozel_kod1: doc.OzelKod1 || null,
    ozel_kod2: doc.OzelKod2 || null,
    ozel_kod3: doc.OzelKod3 || null,
    ozel_kod4: doc.OzelKod4 || null,
    ozel_kod5: doc.OzelKod5 || null,

    temel_alis_fiyati: safeNumber(doc.temelAlisFiyati),
    temel_satis_fiyati: safeNumber(doc.temelSatisFiyati),
    minimum_satis_fiyati: safeNumber(doc.minimumSatisFiyati),

    stokda_en_az: safeNumber(doc.Stokda_EnAz),
    agramy_gramda_1_esasy_olcegin: safeNumber(doc.agramyGramda_1EsasyOlcegin),

    is_eksiye_gidebilir: boolToInt(doc.isEksiyeGidebilir),
    is_giristen_ucuz_satilabilir: boolToInt(doc.isGiristenUcuzSatilabilir),
    is_promo: boolToInt(doc.isPromo),
    is_satisda_duzumi_gorunsin: boolToInt(doc.isSatisdaDuzumiGorunsin),
    is_yaramlylyk_bar: boolToInt(doc.isYaramlylykBar),

    status_is_aktif: safeNumber(doc.StatusIsAktif),

    uytgeme_tarih: doc.uytgeme_tarih || null,
    uytgeme_tarih_yen: doc.uytgeme_tarih_yen || null,
    uytgeme_terminal: doc.uytgeme_terminal || null,
    uytgeme_device: doc.uytgeme_device || null,
    uytgeme_isci: doc.uytgeme_isci || null,
  };
}

function mapBarkodlar(doc) {
  return Array.isArray(doc.lst_Barkodlar)
    ? doc.lst_Barkodlar.filter(Boolean)
    : [];
}

function mapEkOlculer(doc) {
  return Array.isArray(doc.lst_EkOlculer)
    ? doc.lst_EkOlculer.map((item) => ({
        olcu_id: item.Id_ekOlcu || item.id_ekOlcu || item.olcuId || null,
        adi: item.Adi || item.adi || null,
        temele_orani: safeNumber(item.TemeleOrani || item.temeleOrani),
        barkod: item.Barkod || item.barkod || null,
        fiyat: safeNumber(item.Fiyat || item.fiyat),
      }))
    : [];
}

function mapDuzumi(doc) {
  return Array.isArray(doc.lst_Duzumi)
    ? doc.lst_Duzumi.map((item) => ({
        child_urun_id: item.Id_Urun || item.id_urun || null,
        qty: safeNumber(item.Sayisi || item.qty),
        olcu_id: item.Id_ekOlcu || item.olcu_id || null,
      }))
    : [];
}

module.exports = {
  mapUrun,
  mapBarkodlar,
  mapEkOlculer,
  mapDuzumi,
};