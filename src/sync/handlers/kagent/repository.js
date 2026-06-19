const db = require("../../../config/sqlite");

const upsertKagent = db.prepare(`
  INSERT INTO kagent (
    id,
    rev,
    load_hash_sha256,

    adi,
    kodu_txt,

    tel,
    cep_tel,
    email,

    adres,
    adres_jay,
    adres_koce,
    adres_korpus,
    adres_kwartira,

    unica_adres_welayat,
    unica_adres_shaher,
    unica_adres_oba,

    bellik,
    customer_class,
    vazifesi,

    is_isgar,
    is_sluj,
    is_genel_hesabi_etkiliyor,
    is_sadece_nakit_satin_alabilir,

    kredi_limiti,
    kac_gun_vadeyle_urun_aliyor,
    maasi,

    rayon_marsrutno,
    rayon_ozi,

    gps_latitude,
    gps_longitude,

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

    @tel,
    @cep_tel,
    @email,

    @adres,
    @adres_jay,
    @adres_koce,
    @adres_korpus,
    @adres_kwartira,

    @unica_adres_welayat,
    @unica_adres_shaher,
    @unica_adres_oba,

    @bellik,
    @customer_class,
    @vazifesi,

    @is_isgar,
    @is_sluj,
    @is_genel_hesabi_etkiliyor,
    @is_sadece_nakit_satin_alabilir,

    @kredi_limiti,
    @kac_gun_vadeyle_urun_aliyor,
    @maasi,

    @rayon_marsrutno,
    @rayon_ozi,

    @gps_latitude,
    @gps_longitude,

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

    tel = excluded.tel,
    cep_tel = excluded.cep_tel,
    email = excluded.email,

    adres = excluded.adres,
    adres_jay = excluded.adres_jay,
    adres_koce = excluded.adres_koce,
    adres_korpus = excluded.adres_korpus,
    adres_kwartira = excluded.adres_kwartira,

    unica_adres_welayat = excluded.unica_adres_welayat,
    unica_adres_shaher = excluded.unica_adres_shaher,
    unica_adres_oba = excluded.unica_adres_oba,

    bellik = excluded.bellik,
    customer_class = excluded.customer_class,
    vazifesi = excluded.vazifesi,

    is_isgar = excluded.is_isgar,
    is_sluj = excluded.is_sluj,
    is_genel_hesabi_etkiliyor = excluded.is_genel_hesabi_etkiliyor,
    is_sadece_nakit_satin_alabilir = excluded.is_sadece_nakit_satin_alabilir,

    kredi_limiti = excluded.kredi_limiti,
    kac_gun_vadeyle_urun_aliyor = excluded.kac_gun_vadeyle_urun_aliyor,
    maasi = excluded.maasi,

    rayon_marsrutno = excluded.rayon_marsrutno,
    rayon_ozi = excluded.rayon_ozi,

    gps_latitude = excluded.gps_latitude,
    gps_longitude = excluded.gps_longitude,

    status_is_aktif = excluded.status_is_aktif,

    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen,
    uytgeme_terminal = excluded.uytgeme_terminal,
    uytgeme_device = excluded.uytgeme_device,
    uytgeme_isci = excluded.uytgeme_isci
`);

const deleteBarkodlar = db.prepare(`DELETE FROM kagent_barkod WHERE kagent_id = ?`);

const insertBarkod = db.prepare(`
  INSERT OR IGNORE INTO kagent_barkod (kagent_id, barkod)
  VALUES (?, ?)
`);

const deleteOzler = db.prepare(`DELETE FROM kagent_oz WHERE kagent_id = ?`);

const insertOz = db.prepare(`
  INSERT INTO kagent_oz (kagent_id, oz, position)
  VALUES (?, ?, ?)
`);

const saveKagent = db.transaction((kagent, barkodlar, ozler) => {
  upsertKagent.run(kagent);

  deleteBarkodlar.run(kagent.id);
  for (const barkod of barkodlar) {
    insertBarkod.run(kagent.id, barkod);
  }

  deleteOzler.run(kagent.id);
  for (const item of ozler) {
    insertOz.run(kagent.id, item.oz, item.position);
  }
});

module.exports = {
  saveKagent,
};