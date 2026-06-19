const {
  getDocId,
  getDocRev,
  getLoadHash,
  boolToInt,
  safeNumber,
} = require("../../utils/doc");

function mapKagent(doc) {
  return {
    id: getDocId(doc),
    rev: getDocRev(doc),
    load_hash_sha256: getLoadHash(doc),

    adi: doc.Adi || "",
    kodu_txt: doc.KoduTxt || null,

    tel: doc.Tel || null,
    cep_tel: doc.CepTel || null,
    email: doc.EMail || null,

    adres: doc.Adres || null,
    adres_jay: doc.Adres_Jay || null,
    adres_koce: doc.Adres_Koce || null,
    adres_korpus: doc.Adres_Korpus || null,
    adres_kwartira: doc.Adres_Kwartira || null,

    unica_adres_welayat: doc.unica_adres_welayat || null,
    unica_adres_shaher: doc.unica_adres_shaher || null,
    unica_adres_oba: doc.unica_adres_oba || null,

    bellik: doc.Bellik || null,
    customer_class: doc.customer_class || null,
    vazifesi: doc.Vazifesi || null,

    is_isgar: boolToInt(doc.isIsgar),
    is_sluj: boolToInt(doc.isSluj),
    is_genel_hesabi_etkiliyor: boolToInt(doc.isGenelHesabiEtkiliyor),
    is_sadece_nakit_satin_alabilir: boolToInt(doc.isSadeceNakitSatinAlabilir),

    kredi_limiti: safeNumber(doc.KrediLimiti),
    kac_gun_vadeyle_urun_aliyor: safeNumber(doc.KacGunVadeyleUrunAliyor),
    maasi: safeNumber(doc.Maasi),

    rayon_marsrutno: safeNumber(doc.rayon_marsrutno),
    rayon_ozi: doc.rayon_ozi || null,

    gps_latitude: safeNumber(doc.gps_latitude),
    gps_longitude: safeNumber(doc.gps_longitude),

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

function mapOzler(doc) {
  if (!Array.isArray(doc.lst_Ozler)) return [];

  return doc.lst_Ozler.map((oz, index) => ({
    oz: oz || "",
    position: index + 1,
  }));
}

module.exports = {
  mapKagent,
  mapBarkodlar,
  mapOzler,
};