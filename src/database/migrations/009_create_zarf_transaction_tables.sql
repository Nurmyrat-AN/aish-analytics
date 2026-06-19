CREATE TABLE IF NOT EXISTS transaction_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  source_type TEXT NOT NULL, -- original: faktura | kasa_islemi
  type_numeric INTEGER NOT NULL, -- original: TYPE_NUMERIC
  type_name TEXT, -- original: TYPE
  type_short TEXT, -- original: TYPE_SHORT

  book_1_effect TEXT DEFAULT 'nochange', -- original: book_1
  book_1_effect_ratio INTEGER DEFAULT 0,

  book_2_effect TEXT DEFAULT 'nochange', -- original: book_2
  book_2_effect_ratio INTEGER DEFAULT 0,

  customer_1_effect TEXT DEFAULT 'nochange', -- original: customer_1
  customer_1_effect_ratio INTEGER DEFAULT 0,

  customer_2_effect TEXT DEFAULT 'nochange', -- original: customer_2
  customer_2_effect_ratio INTEGER DEFAULT 0,

  warehouse_1_effect TEXT DEFAULT 'nochange', -- original: warehouse_1
  warehouse_1_effect_ratio INTEGER DEFAULT 0,

  warehouse_2_effect TEXT DEFAULT 'nochange', -- original: warehouse_2
  warehouse_2_effect_ratio INTEGER DEFAULT 0,

  include_in_analytics INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY, -- generated: zarf_id + source_type + index

  transaction_group_id TEXT NOT NULL, -- original: zarf._id
  source_type TEXT NOT NULL, -- original: fatura | kasa_islemi
  source_index INTEGER DEFAULT 0, -- original: index inside lst_fatura or lst_kasa
  load_hash_sha256 TEXT, -- original: zarf.loadHashSha256

  kodu_txt TEXT, -- original: fatura.KoduTxt
  otomatik_id INTEGER DEFAULT 0, -- original: fatura.OtomatikId | kasa_islemi.OtomatikId
  operation_date TEXT, -- original: fatura.Tarihi | kasa_islemi.Tarihi
  type_numeric INTEGER, -- original: fatura.Tipi | kasa_islemi.Tipi

  amount REAL DEFAULT 0, -- original: fatura.ToplamPara | kasa_islemi.Miktari
  amount_without_discount REAL DEFAULT 0, -- original: fatura.ToplamPara_Iskosuz
  return_amount REAL DEFAULT 0, -- original: fatura.gaytargy
  discount_amount REAL DEFAULT 0, -- original: calculated from amount_without_discount - amount
  discount_percent REAL DEFAULT 0, -- original: fatura.iskonto
  tax_amount REAL DEFAULT 0, -- original: fatura.dowletTutumy
  currency_rate REAL DEFAULT 1, -- original: fatura.conversionRateWalyuta | kasa_islemi.Conversion_Rate

  id_account1 TEXT, -- original: fatura.id_defter | kasa_islemi.id_defter1
  id_account2 TEXT, -- original: kasa_islemi.id_defter2

  id_kagent1 TEXT, -- original: fatura.id_must1 | kasa_islemi.id_must1
  id_kagent2 TEXT, -- original: fatura.id_must2 | kasa_islemi.id_must2

  id_depo1 TEXT, -- original: fatura.id_depo1
  id_depo2 TEXT, -- original: fatura.id_depo2
  id_depo_promo TEXT, -- original: fatura.id_depoPromo | zarf.id_depoPromo

  payment_type INTEGER, -- original: fatura.odemeTipi
  received_amount REAL DEFAULT 0, -- original: fatura.sluj_AlinanPara

  kasa_miktar_varan_hesaba REAL DEFAULT 0, -- original: kasa_islemi.Miktar_VaranHesabA
  kasa_miktari_operasyonel_giderin REAL DEFAULT 0, -- original: kasa_islemi.Miktari_OperasyonelGiderin

  total_weight_in_grams REAL DEFAULT 0, -- original: fatura.totalWeightInGrams

  is_group_part INTEGER DEFAULT 0, -- original: fatura.isGrupParcasi
  is_group_first INTEGER DEFAULT 0, -- original: fatura.isGruptaIlk

  is_locked INTEGER DEFAULT 0, -- original: kasa_islemi.isKilitli
  is_operational_income_expense INTEGER DEFAULT 0, -- original: kasa_islemi.isOperasyonelGelirGider

  ozel_kod1 TEXT, -- original: kasa_islemi.OzelKod1
  ozel_kod2 TEXT, -- original: kasa_islemi.OzelKod2
  ozel_kod3 TEXT, -- original: kasa_islemi.OzelKod3
  ozel_kod4 TEXT, -- original: kasa_islemi.OzelKod4
  ozel_kod5 TEXT, -- original: kasa_islemi.OzelKod5

  sluj_ait_oldugu_fatura_kodu_txt TEXT, -- original: kasa_islemi.sluj_AitOlduguFaturaKoduTxt
  sluj_baba_zarf_id TEXT, -- original: fatura.sluj_babaZarfId | kasa_islemi.sluj_babaZarfId
  sluj_id_hangi_faturaya_ait TEXT, -- original: kasa_islemi.sluj_IdHangiFaturayaAit
  sluj_hangi_terminalden_yapildi TEXT, -- original: fatura.sluj_hangiTerminaldenYapildi | kasa_islemi.sluj_hangiTerminaldenYapildi
  sluj_is_yanlis INTEGER DEFAULT 0, -- original: fatura.sluj_isYanlis | kasa_islemi.sluj_isYanlis
  sluj_satici_id TEXT, -- original: fatura.sluj_saticiId | kasa_islemi.sluj_saticiId
  sluj_yln_bellik TEXT, -- original: fatura.sluj_ylnBellik | kasa_islemi.sluj_ylnBellik

  bellik TEXT, -- original: fatura.Bellik | kasa_islemi.Bellik
  status_is_aktif INTEGER, -- original: fatura.StatusIsAktif | kasa_islemi.StatusIsAktif

  uytgeme_tarih TEXT, -- original: uytgeme_tarih
  uytgeme_tarih_yen TEXT, -- original: uytgeme_tarih_yen
  uytgeme_terminal TEXT, -- original: uytgeme_terminal
  uytgeme_device TEXT, -- original: uytgeme_device
  uytgeme_isci TEXT -- original: uytgeme_isci
);

CREATE TABLE IF NOT EXISTS transaction_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  transaction_id TEXT NOT NULL, -- original: generated transaction id
  transaction_group_id TEXT NOT NULL, -- original: zarf._id
  line_no INTEGER, -- original: index inside fatura.lstKalems

  akis_tipi INTEGER DEFAULT 0, -- original: AkisTipi

  urun_id TEXT, -- original: Id_Urun
  olcu_id TEXT, -- original: Id_ekOlcu
  promo_id TEXT, -- original: IdPromo
  parent_urun_id TEXT, -- original: parentUrun

  unit_price_given REAL DEFAULT 0, -- original: berlenBaha
  currency_rate REAL DEFAULT 1, -- original: conversionRateWalyuta

  extra_unit_qty REAL DEFAULT 0, -- original: ekOlcu_Sayisi
  extra_unit_to_base_ratio REAL DEFAULT 0, -- original: ekOlcu_TemeleOrani

  base_unit_price REAL DEFAULT 0, -- original: esasOlc_FiyatBiri
  base_unit_price_without_discount REAL DEFAULT 0, -- original: esasOlc_FiyatBiri_Iskosuz
  base_unit_qty_total REAL DEFAULT 0, -- original: esasOlc_SayisiToplam

  main_unit_main_currency_price_without_discount REAL DEFAULT 0, -- original: anaOlcuAnaDovizFiyatBiriIskosuz

  line_total REAL DEFAULT 0, -- original: Fiyat_Toplam
  line_total_without_discount REAL DEFAULT 0, -- original: Fiyat_Toplam_Iskosuz

  discount_percent REAL DEFAULT 0, -- original: iskonto
  purchase_price_at_card REAL DEFAULT 0, -- original: kart_urun_alish_fiyati

  expiration_date TEXT, -- original: yaramlylykMohleti

  bellik TEXT, -- original: Bellik
  status_is_aktif INTEGER, -- original: StatusIsAktif

  uytgeme_tarih TEXT, -- original: uytgeme_tarih
  uytgeme_tarih_yen TEXT, -- original: uytgeme_tarih_yen
  uytgeme_terminal TEXT, -- original: uytgeme_terminal
  uytgeme_device TEXT, -- original: uytgeme_device
  uytgeme_isci TEXT -- original: uytgeme_isci
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transaction_type_unique
ON transaction_type(source_type, type_numeric);

CREATE INDEX IF NOT EXISTS idx_transactions_group
ON transactions(transaction_group_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
ON transactions(operation_date);

CREATE INDEX IF NOT EXISTS idx_transactions_type
ON transactions(source_type, type_numeric);

CREATE INDEX IF NOT EXISTS idx_transactions_kagent1
ON transactions(id_kagent1);

CREATE INDEX IF NOT EXISTS idx_transactions_kagent2
ON transactions(id_kagent2);

CREATE INDEX IF NOT EXISTS idx_transactions_account1
ON transactions(id_account1);

CREATE INDEX IF NOT EXISTS idx_transactions_account2
ON transactions(id_account2);

CREATE INDEX IF NOT EXISTS idx_transactions_depo1
ON transactions(id_depo1);

CREATE INDEX IF NOT EXISTS idx_transactions_depo2
ON transactions(id_depo2);

CREATE INDEX IF NOT EXISTS idx_transactions_terminal
ON transactions(sluj_hangi_terminalden_yapildi);

CREATE INDEX IF NOT EXISTS idx_transactions_satici
ON transactions(sluj_satici_id);

CREATE INDEX IF NOT EXISTS idx_transactions_yanlis
ON transactions(sluj_is_yanlis);

CREATE INDEX IF NOT EXISTS idx_transaction_lines_transaction
ON transaction_lines(transaction_id);

CREATE INDEX IF NOT EXISTS idx_transaction_lines_group
ON transaction_lines(transaction_group_id);

CREATE INDEX IF NOT EXISTS idx_transaction_lines_urun
ON transaction_lines(urun_id);

CREATE INDEX IF NOT EXISTS idx_transaction_lines_olcu
ON transaction_lines(olcu_id);

CREATE INDEX IF NOT EXISTS idx_transaction_lines_promo
ON transaction_lines(promo_id);