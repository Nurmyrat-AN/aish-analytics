const {
  getDocId,
  getLoadHash,
  boolToInt,
  safeNumber,
} = require("../../utils/doc");

function makeTransactionId(zarfId, sourceType, index, subIndex = 0) {
  return `${zarfId}-${sourceType}-${index}-${subIndex}`;
}


function mapFatura(zarf, fatura, index) {
  return {
    id: makeTransactionId(zarf._id, "fatura", index),

    transaction_group_id: getDocId(zarf),
    source_type: "fatura",
    source_index: index,
    load_hash_sha256: getLoadHash(zarf),

    kodu_txt: fatura.KoduTxt || null,
    otomatik_id: safeNumber(fatura.OtomatikId),
    operation_date: fatura.Tarihi || null,
    type_numeric: safeNumber(fatura.Tipi),

    amount: safeNumber(fatura.ToplamPara),
    amount_without_discount: safeNumber(fatura.ToplamPara_Iskosuz),
    return_amount: safeNumber(fatura.gaytargy),
    discount_amount:
      safeNumber(fatura.ToplamPara_Iskosuz) - safeNumber(fatura.ToplamPara),
    discount_percent: safeNumber(fatura.iskonto),
    tax_amount: safeNumber(fatura.dowletTutumy),
    currency_rate: safeNumber(fatura.conversionRateWalyuta, 1),

    id_account1: fatura.id_defter || null,
    id_account2: null,

    id_kagent1: fatura.id_must1 || null,
    id_kagent2: fatura.id_must2 || null,

    id_depo1: fatura.id_depo1 || null,
    id_depo2: fatura.id_depo2 || null,
    id_depo_promo: fatura.id_depoPromo || zarf.id_depoPromo || null,

    payment_type: safeNumber(fatura.odemeTipi),
    received_amount: safeNumber(fatura.sluj_AlinanPara),

    kasa_miktar_varan_hesaba: 0,
    kasa_miktari_operasyonel_giderin: 0,

    total_weight_in_grams: safeNumber(fatura.totalWeightInGrams),

    is_group_part: boolToInt(fatura.isGrupParcasi),
    is_group_first: boolToInt(fatura.isGruptaIlk),

    is_locked: 0,
    is_operational_income_expense: 0,

    ozel_kod1: null,
    ozel_kod2: null,
    ozel_kod3: null,
    ozel_kod4: null,
    ozel_kod5: null,

    sluj_ait_oldugu_fatura_kodu_txt: null,
    sluj_baba_zarf_id: fatura.sluj_babaZarfId || null,
    sluj_id_hangi_faturaya_ait: null,
    sluj_hangi_terminalden_yapildi:
      fatura.sluj_hangiTerminaldenYapildi || null,
    sluj_is_yanlis: (zarf.yln_bellik ? 1 : 0),
    sluj_satici_id: zarf.yln_isci || fatura.sluj_saticiId || null,
    sluj_yln_bellik: zarf.yln_bellik || fatura.sluj_ylnBellik || null,

    bellik: fatura.Bellik || null,
    status_is_aktif: safeNumber(fatura.StatusIsAktif),

    uytgeme_tarih: fatura.uytgeme_tarih || null,
    uytgeme_tarih_yen: fatura.uytgeme_tarih_yen || null,
    uytgeme_terminal: fatura.uytgeme_terminal || null,
    uytgeme_device: fatura.uytgeme_device || null,
    uytgeme_isci: fatura.uytgeme_isci || null,
  };
}

function mapKasaIslemi(zarf, kasa, index, subIndex = 0) {
  return {
    id: makeTransactionId(zarf._id, "kasa_islemi", index, subIndex),

    transaction_group_id: getDocId(zarf),
    source_type: "kasa_islemi",
    source_index: index,
    load_hash_sha256: getLoadHash(zarf),

    kodu_txt: null,
    otomatik_id: safeNumber(kasa.OtomatikId),
    operation_date: kasa.Tarihi || null,
    type_numeric: safeNumber(kasa.Tipi),

    amount: safeNumber(kasa.Miktari),
    amount_without_discount: 0,
    return_amount: 0,
    discount_amount: 0,
    discount_percent: 0,
    tax_amount: 0,
    currency_rate: safeNumber(kasa.Conversion_Rate, 1),

    id_account1: kasa.id_defter1 || null,
    id_account2: kasa.id_defter2 || null,

    id_kagent1: kasa.id_must1 || null,
    id_kagent2: kasa.id_must2 || null,

    id_depo1: null,
    id_depo2: null,
    id_depo_promo: zarf.id_depoPromo || null,

    payment_type: null,
    received_amount: 0,

    kasa_miktar_varan_hesaba: safeNumber(kasa.Miktar_VaranHesabA),
    kasa_miktari_operasyonel_giderin: safeNumber(
      kasa.Miktari_OperasyonelGiderin
    ),

    total_weight_in_grams: 0,

    is_group_part: 0,
    is_group_first: 0,

    is_locked: boolToInt(kasa.isKilitli),
    is_operational_income_expense: boolToInt(kasa.isOperasyonelGelirGider),

    ozel_kod1: kasa.OzelKod1 || null,
    ozel_kod2: kasa.OzelKod2 || null,
    ozel_kod3: kasa.OzelKod3 || null,
    ozel_kod4: kasa.OzelKod4 || null,
    ozel_kod5: kasa.OzelKod5 || null,

    sluj_ait_oldugu_fatura_kodu_txt:
      kasa.sluj_AitOlduguFaturaKoduTxt || null,
    sluj_baba_zarf_id: kasa.sluj_babaZarfId || null,
    sluj_id_hangi_faturaya_ait: kasa.sluj_IdHangiFaturayaAit || null,
    sluj_hangi_terminalden_yapildi:
      kasa.sluj_hangiTerminaldenYapildi || null,
    sluj_is_yanlis: (zarf.yln_bellik ? 1 : 0),
    sluj_satici_id: zarf.yln_isci || kasa.sluj_saticiId || null,
    sluj_yln_bellik: zarf.yln_bellik || kasa.sluj_ylnBellik || null,

    bellik: kasa.Bellik || null,
    status_is_aktif: safeNumber(kasa.StatusIsAktif),

    uytgeme_tarih: kasa.uytgeme_tarih || null,
    uytgeme_tarih_yen: kasa.uytgeme_tarih_yen || null,
    uytgeme_terminal: kasa.uytgeme_terminal || null,
    uytgeme_device: kasa.uytgeme_device || null,
    uytgeme_isci: kasa.uytgeme_isci || null,
  };
}

function mapLine(zarf, transaction, kalem, lineIndex) {
  return {
    transaction_id: transaction.id,
    transaction_group_id: getDocId(zarf),
    line_no: lineIndex + 1,

    akis_tipi: safeNumber(kalem.AkisTipi),

    urun_id: kalem.Id_Urun || null,
    olcu_id: kalem.Id_ekOlcu || null,
    promo_id: kalem.IdPromo || null,
    parent_urun_id: kalem.parentUrun || null,

    unit_price_given: safeNumber(kalem.berlenBaha),
    currency_rate: safeNumber(kalem.conversionRateWalyuta, 1),

    extra_unit_qty: safeNumber(kalem.ekOlcu_Sayisi),
    extra_unit_to_base_ratio: safeNumber(kalem.ekOlcu_TemeleOrani),

    base_unit_price: safeNumber(kalem.esasOlc_FiyatBiri),
    base_unit_price_without_discount: safeNumber(
      kalem.esasOlc_FiyatBiri_Iskosuz
    ),
    base_unit_qty_total: safeNumber(kalem.esasOlc_SayisiToplam),

    main_unit_main_currency_price_without_discount: safeNumber(
      kalem.anaOlcuAnaDovizFiyatBiriIskosuz
    ),

    line_total: safeNumber(kalem.Fiyat_Toplam),
    line_total_without_discount: safeNumber(kalem.Fiyat_Toplam_Iskosuz),

    discount_percent: safeNumber(kalem.iskonto),
    purchase_price_at_card: safeNumber(kalem.kart_urun_alish_fiyati),

    expiration_date: kalem.yaramlylykMohleti || null,

    bellik: kalem.Bellik || null,
    status_is_aktif: safeNumber(kalem.StatusIsAktif),

    uytgeme_tarih: kalem.uytgeme_tarih || null,
    uytgeme_tarih_yen: kalem.uytgeme_tarih_yen || null,
    uytgeme_terminal: kalem.uytgeme_terminal || null,
    uytgeme_device: kalem.uytgeme_device || null,
    uytgeme_isci: kalem.uytgeme_isci || null,
  };
}

function mapZarf(doc) {
  const transactions = [];
  const lines = [];

  const faturalar = Array.isArray(doc.lst_fatura) ? doc.lst_fatura : [];
  const kasalar = Array.isArray(doc.lst_kasa) ? doc.lst_kasa : [];

  faturalar.forEach((fatura, faturaIndex) => {
    const faturaTransaction = mapFatura(doc, fatura, faturaIndex);
    transactions.push(faturaTransaction);

    const kalemler = Array.isArray(fatura.lstKalems) ? fatura.lstKalems : [];
    kalemler.forEach((kalem, lineIndex) => {
      lines.push(mapLine(doc, faturaTransaction, kalem, lineIndex));
    });

    if (fatura.nakitYaParcaOdeme) {
      transactions.push(
        mapKasaIslemi(doc, fatura.nakitYaParcaOdeme, faturaIndex, 1)
      );
    }
  });

  kasalar.forEach((kasa, kasaIndex) => {
    transactions.push(mapKasaIslemi(doc, kasa, kasaIndex, 0));
  });

  return {
    transactions,
    lines,
  };
}

module.exports = {
  mapZarf,
};