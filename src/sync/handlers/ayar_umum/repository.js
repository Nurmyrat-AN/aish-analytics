const db = require("../../../config/sqlite");

const upsertAyarUmum = db.prepare(`
  INSERT INTO ayar_umum (
    id,
    rev,
    load_hash_sha256,

    para_adi,
    para_adi_tenne,
    para_adi_round_to_nearest_tenne,

    dowlet_tutumy,
    gelir_gider_girish_fiyati_neye_gore,

    status_is_aktif,

    uytgeme_tarih,
    uytgeme_tarih_yen
  )
  VALUES (
    @id,
    @rev,
    @load_hash_sha256,

    @para_adi,
    @para_adi_tenne,
    @para_adi_round_to_nearest_tenne,

    @dowlet_tutumy,
    @gelir_gider_girish_fiyati_neye_gore,

    @status_is_aktif,

    @uytgeme_tarih,
    @uytgeme_tarih_yen
  )
  ON CONFLICT(id) DO UPDATE SET
    rev = excluded.rev,
    load_hash_sha256 = excluded.load_hash_sha256,

    para_adi = excluded.para_adi,
    para_adi_tenne = excluded.para_adi_tenne,
    para_adi_round_to_nearest_tenne = excluded.para_adi_round_to_nearest_tenne,

    dowlet_tutumy = excluded.dowlet_tutumy,
    gelir_gider_girish_fiyati_neye_gore = excluded.gelir_gider_girish_fiyati_neye_gore,

    status_is_aktif = excluded.status_is_aktif,

    uytgeme_tarih = excluded.uytgeme_tarih,
    uytgeme_tarih_yen = excluded.uytgeme_tarih_yen
`);

const ensureBaseWalyuta = db.prepare(`
  INSERT INTO z_walyuta (
    id,
    adi,
    tenne_adi,
    round_to_nearest_tenne,
    is_base,
    status_is_aktif
  )
  VALUES (
    'z_walyuta-1',
    @para_adi,
    @para_adi_tenne,
    @para_adi_round_to_nearest_tenne,
    1,
    1
  )
  ON CONFLICT(id) DO UPDATE SET
    adi = excluded.adi,
    tenne_adi = excluded.tenne_adi,
    round_to_nearest_tenne = excluded.round_to_nearest_tenne,
    is_base = 1
`);

const resetBaseFlags = db.prepare(`
  UPDATE z_walyuta
  SET is_base = 0
`);

const saveAyarUmum = db.transaction((ayar) => {
  upsertAyarUmum.run(ayar);

  resetBaseFlags.run();

  ensureBaseWalyuta.run({
    para_adi: ayar.para_adi || "mnt",
    para_adi_tenne: ayar.para_adi_tenne || "teňňe",
    para_adi_round_to_nearest_tenne:
      ayar.para_adi_round_to_nearest_tenne || 0,
  });
});

module.exports = { saveAyarUmum };