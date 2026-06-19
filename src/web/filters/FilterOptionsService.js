const db = require("../../config/sqlite");

function getDepoOptions() {
  return db.prepare(`
    SELECT id, adi
    FROM depo
    WHERE status_is_aktif IS NULL OR status_is_aktif = 1
    ORDER BY adi
  `).all();
}

function getKagentOptions() {
  return db.prepare(`
    SELECT id, adi
    FROM kagent
    WHERE status_is_aktif IS NULL OR status_is_aktif = 1
    ORDER BY adi
    LIMIT 500
  `).all();
}

function getUrunOptions() {
  return db.prepare(`
    SELECT id, adi
    FROM urun
    WHERE status_is_aktif IS NULL OR status_is_aktif = 1
    ORDER BY adi
    LIMIT 500
  `).all();
}

function getSaticiOptions() {
  return db.prepare(`
    SELECT DISTINCT
      t.sluj_hangi_terminalden_yapildi AS id,
      COALESCE(k.adi, t.sluj_satici_id) AS adi
    FROM transactions t
    LEFT JOIN terminal k ON k.id = t.sluj_hangi_terminalden_yapildi
    WHERE t.sluj_hangi_terminalden_yapildi IS NOT NULL
      AND t.sluj_hangi_terminalden_yapildi <> ''
    ORDER BY adi
  `).all();
}

module.exports = {
  getDepoOptions,
  getKagentOptions,
  getUrunOptions,
  getSaticiOptions,
};