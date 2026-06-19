const db = require("../config/sqlite");

function loadRates() {
  return db.prepare(`
    SELECT
      id_walyuta_from,
      id_walyuta_to,
      kurs_tarih,
      rate_current,
      status_is_aktif
    FROM z_kurs_walyuta
    WHERE rate_current > 0
      AND (status_is_aktif IS NULL OR status_is_aktif = 1)
    ORDER BY datetime(kurs_tarih)
  `).all();
}

module.exports = {
  loadRates,
};