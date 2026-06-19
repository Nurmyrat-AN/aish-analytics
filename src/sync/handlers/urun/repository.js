const db = require("../../../config/sqlite");

const upsertUrun = db.prepare(`
  INSERT INTO urun (
    id,
    rev,
    load_hash_sha256,

    adi,
    kodu_txt,

    id_fiyat_walyutasy,
    olcu_birimi,

    ozel_kod1,
    ozel_kod2,
    ozel_kod3,
    ozel_kod4,
    ozel_kod5,

    temel_alis_fiyati,
    temel_satis_fiyati,
    minimum_satis_fiyati,

    stokda_en_az,
    agramy_gramda_1_esasy_olcegin,

    is_eksiye_gidebilir,
    is_giristen_ucuz_satilabilir,
    is_promo,
    is_satisda_duzumi_gorunsin,
    is_yaramlylyk_bar,

    status_is_aktif,

    uytgeme_tarih,
    uytgeme_tarih_yen,
    uytgeme_terminal,
    uytgeme_device,
    uytgeme_isci
  )
  VALUES (
    @id,
    @rev,
    @load_hash_sha256,

    @adi,
    @kodu_txt,

    @id_fiyat_walyutasy,
    @olcu_birimi,

    @ozel_kod1,
    @ozel_kod2,
    @ozel_kod3,
    @ozel_kod4,
    @ozel_kod5,

    @temel_alis_fiyati,
    @temel_satis_fiyati,
    @minimum_satis_fiyati,

    @stokda_en_az,
    @agramy_gramda_1_esasy_olcegin,

    @is_eksiye_gidebilir,
    @is_giristen_ucuz_satilabilir,
    @is_promo,
    @is_satisda_duzumi_gorunsin,
    @is_yaramlylyk_bar,

    @status_is_aktif,

    @uytgeme_tarih,
    @uytgeme_tarih_yen,
    @uytgeme_terminal,
    @uytgeme_device,
    @uytgeme_isci
  )
  ON CONFLICT(id) DO UPDATE SET
    rev = excluded.rev,
    load_hash_sha256 = excluded.load_hash_sha256,
    adi = excluded.adi,
    kodu_txt = excluded.kodu_txt,
    id_fiyat_walyutasy = excluded.id_fiyat_walyutasy,
    olcu_birimi = excluded.olcu_birimi,
    ozel_kod1 = excluded.ozel_kod1,
    ozel_kod2 = excluded.ozel_kod2,
    ozel_kod3 = excluded.ozel_kod3,
    ozel_kod4 = excluded.ozel_kod4,
    ozel_kod5 = excluded.ozel_kod5,
    temel_alis_fiyati = excluded.temel_alis_fiyati,
    temel_satis_fiyati = excluded.temel_satis_fiyati,
    minimum_satis_fiyati = excluded.minimum_satis_fiyati,
    stokda_en_az = excluded.stokda_en_az,
    agramy_gramda_1_esasy_olcegin = excluded.agramy_gramda_1_esasy_olcegin,
    is_eksiye_gidebilir = excluded.is_eksiye_gidebilir,
    is_giristen_ucuz_satilabilir = excluded.is_giristen_ucuz_satilabilir,
    is_promo = excluded.is_promo,
    is_satisda_duzumi_gorunsin = excluded.is_satisda_duzumi_gorunsin,
    is_yaramlylyk_bar = excluded.is_yaramlylyk_bar,
    status_is_aktif = excluded.status_is_aktif,
    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen,
    uytgeme_terminal = excluded.uytgeme_terminal,
    uytgeme_device = excluded.uytgeme_device,
    uytgeme_isci = excluded.uytgeme_isci
`);

const deleteBarkodlar = db.prepare(`DELETE FROM urun_barkod WHERE urun_id = ?`);
const insertBarkod = db.prepare(`
  INSERT OR IGNORE INTO urun_barkod (urun_id, barkod)
  VALUES (?, ?)
`);

const deleteEkOlculer = db.prepare(`DELETE FROM urun_ek_olcu WHERE urun_id = ?`);
const insertEkOlcu = db.prepare(`
  INSERT INTO urun_ek_olcu (
    urun_id,
    olcu_id,
    adi,
    temele_orani,
    barkod,
    fiyat
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const deleteDuzumi = db.prepare(`DELETE FROM urun_duzumi WHERE urun_id = ?`);
const insertDuzumi = db.prepare(`
  INSERT INTO urun_duzumi (
    urun_id,
    child_urun_id,
    qty,
    olcu_id
  )
  VALUES (?, ?, ?, ?)
`);

const saveUrun = db.transaction((urun, barkodlar, ekOlculer, duzumi) => {
  upsertUrun.run(urun);

  deleteBarkodlar.run(urun.id);
  for (const barkod of barkodlar) {
    insertBarkod.run(urun.id, barkod);
  }

  deleteEkOlculer.run(urun.id);
  for (const item of ekOlculer) {
    insertEkOlcu.run(
      urun.id,
      item.olcu_id,
      item.adi,
      item.temele_orani,
      item.barkod,
      item.fiyat
    );
  }

  deleteDuzumi.run(urun.id);
  for (const item of duzumi) {
    insertDuzumi.run(
      urun.id,
      item.child_urun_id,
      item.qty,
      item.olcu_id
    );
  }
});

module.exports = {
  saveUrun,
};