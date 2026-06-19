const db = require("../../../config/sqlite");

const upsertTransaction = db.prepare(`
  INSERT INTO transactions (
    id,
    transaction_group_id,
    source_type,
    source_index,
    load_hash_sha256,

    kodu_txt,
    otomatik_id,
    operation_date,
    type_numeric,

    amount,
    amount_without_discount,
    return_amount,
    discount_amount,
    discount_percent,
    tax_amount,
    currency_rate,

    id_account1,
    id_account2,

    id_kagent1,
    id_kagent2,

    id_depo1,
    id_depo2,
    id_depo_promo,

    payment_type,
    received_amount,

    kasa_miktar_varan_hesaba,
    kasa_miktari_operasyonel_giderin,

    total_weight_in_grams,

    is_group_part,
    is_group_first,

    is_locked,
    is_operational_income_expense,

    ozel_kod1,
    ozel_kod2,
    ozel_kod3,
    ozel_kod4,
    ozel_kod5,

    sluj_ait_oldugu_fatura_kodu_txt,
    sluj_baba_zarf_id,
    sluj_id_hangi_faturaya_ait,
    sluj_hangi_terminalden_yapildi,
    sluj_is_yanlis,
    sluj_satici_id,
    sluj_yln_bellik,

    bellik,
    status_is_aktif,

    uytgeme_tarih,
    uytgeme_tarih_yen,
    uytgeme_terminal,
    uytgeme_device,
    uytgeme_isci
  )
  VALUES (
    @id,
    @transaction_group_id,
    @source_type,
    @source_index,
    @load_hash_sha256,

    @kodu_txt,
    @otomatik_id,
    @operation_date,
    @type_numeric,

    @amount,
    @amount_without_discount,
    @return_amount,
    @discount_amount,
    @discount_percent,
    @tax_amount,
    @currency_rate,

    @id_account1,
    @id_account2,

    @id_kagent1,
    @id_kagent2,

    @id_depo1,
    @id_depo2,
    @id_depo_promo,

    @payment_type,
    @received_amount,

    @kasa_miktar_varan_hesaba,
    @kasa_miktari_operasyonel_giderin,

    @total_weight_in_grams,

    @is_group_part,
    @is_group_first,

    @is_locked,
    @is_operational_income_expense,

    @ozel_kod1,
    @ozel_kod2,
    @ozel_kod3,
    @ozel_kod4,
    @ozel_kod5,

    @sluj_ait_oldugu_fatura_kodu_txt,
    @sluj_baba_zarf_id,
    @sluj_id_hangi_faturaya_ait,
    @sluj_hangi_terminalden_yapildi,
    @sluj_is_yanlis,
    @sluj_satici_id,
    @sluj_yln_bellik,

    @bellik,
    @status_is_aktif,

    @uytgeme_tarih,
    @uytgeme_tarih_yen,
    @uytgeme_terminal,
    @uytgeme_device,
    @uytgeme_isci
  )
  ON CONFLICT(id) DO UPDATE SET
    transaction_group_id = excluded.transaction_group_id,
    source_type = excluded.source_type,
    source_index = excluded.source_index,
    load_hash_sha256 = excluded.load_hash_sha256,

    kodu_txt = excluded.kodu_txt,
    otomatik_id = excluded.otomatik_id,
    operation_date = excluded.operation_date,
    type_numeric = excluded.type_numeric,

    amount = excluded.amount,
    amount_without_discount = excluded.amount_without_discount,
    return_amount = excluded.return_amount,
    discount_amount = excluded.discount_amount,
    discount_percent = excluded.discount_percent,
    tax_amount = excluded.tax_amount,
    currency_rate = excluded.currency_rate,

    id_account1 = excluded.id_account1,
    id_account2 = excluded.id_account2,

    id_kagent1 = excluded.id_kagent1,
    id_kagent2 = excluded.id_kagent2,

    id_depo1 = excluded.id_depo1,
    id_depo2 = excluded.id_depo2,
    id_depo_promo = excluded.id_depo_promo,

    payment_type = excluded.payment_type,
    received_amount = excluded.received_amount,

    kasa_miktar_varan_hesaba = excluded.kasa_miktar_varan_hesaba,
    kasa_miktari_operasyonel_giderin = excluded.kasa_miktari_operasyonel_giderin,

    total_weight_in_grams = excluded.total_weight_in_grams,

    is_group_part = excluded.is_group_part,
    is_group_first = excluded.is_group_first,

    is_locked = excluded.is_locked,
    is_operational_income_expense = excluded.is_operational_income_expense,

    ozel_kod1 = excluded.ozel_kod1,
    ozel_kod2 = excluded.ozel_kod2,
    ozel_kod3 = excluded.ozel_kod3,
    ozel_kod4 = excluded.ozel_kod4,
    ozel_kod5 = excluded.ozel_kod5,

    sluj_ait_oldugu_fatura_kodu_txt = excluded.sluj_ait_oldugu_fatura_kodu_txt,
    sluj_baba_zarf_id = excluded.sluj_baba_zarf_id,
    sluj_id_hangi_faturaya_ait = excluded.sluj_id_hangi_faturaya_ait,
    sluj_hangi_terminalden_yapildi = excluded.sluj_hangi_terminalden_yapildi,
    sluj_is_yanlis = excluded.sluj_is_yanlis,
    sluj_satici_id = excluded.sluj_satici_id,
    sluj_yln_bellik = excluded.sluj_yln_bellik,

    bellik = excluded.bellik,
    status_is_aktif = excluded.status_is_aktif,

    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen,
    uytgeme_terminal = excluded.uytgeme_terminal,
    uytgeme_device = excluded.uytgeme_device,
    uytgeme_isci = excluded.uytgeme_isci
`);

const deleteLinesByGroup = db.prepare(`
  DELETE FROM transaction_lines
  WHERE transaction_group_id = ?
`);

const insertLine = db.prepare(`
  INSERT INTO transaction_lines (
    transaction_id,
    transaction_group_id,
    line_no,

    akis_tipi,

    urun_id,
    olcu_id,
    promo_id,
    parent_urun_id,

    unit_price_given,
    currency_rate,

    extra_unit_qty,
    extra_unit_to_base_ratio,

    base_unit_price,
    base_unit_price_without_discount,
    base_unit_qty_total,

    main_unit_main_currency_price_without_discount,

    line_total,
    line_total_without_discount,

    discount_percent,
    purchase_price_at_card,

    expiration_date,

    bellik,
    status_is_aktif,

    uytgeme_tarih,
    uytgeme_tarih_yen,
    uytgeme_terminal,
    uytgeme_device,
    uytgeme_isci
  )
  VALUES (
    @transaction_id,
    @transaction_group_id,
    @line_no,

    @akis_tipi,

    @urun_id,
    @olcu_id,
    @promo_id,
    @parent_urun_id,

    @unit_price_given,
    @currency_rate,

    @extra_unit_qty,
    @extra_unit_to_base_ratio,

    @base_unit_price,
    @base_unit_price_without_discount,
    @base_unit_qty_total,

    @main_unit_main_currency_price_without_discount,

    @line_total,
    @line_total_without_discount,

    @discount_percent,
    @purchase_price_at_card,

    @expiration_date,

    @bellik,
    @status_is_aktif,

    @uytgeme_tarih,
    @uytgeme_tarih_yen,
    @uytgeme_terminal,
    @uytgeme_device,
    @uytgeme_isci
  )
`);

const saveZarfTransactions = db.transaction((transactions, lines) => {
  if (!transactions.length) return;

  const groupId = transactions[0].transaction_group_id;

  for (const transaction of transactions) {
    upsertTransaction.run(transaction);
  }

  deleteLinesByGroup.run(groupId);

  for (const line of lines) {
    insertLine.run(line);
  }
});

module.exports = {
  saveZarfTransactions,
};