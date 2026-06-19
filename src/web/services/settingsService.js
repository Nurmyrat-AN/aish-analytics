const db = require("../../config/sqlite");

function getAllSettings() {
  return db.prepare(`
    SELECT key, value, value_type, description
    FROM app_settings
    ORDER BY key
  `).all();
}

function updateSetting(key, value) {
  db.prepare(`
    UPDATE app_settings
    SET value = ?, updated_at = datetime('now')
    WHERE key = ?
  `).run(value, key);
}

module.exports = { getAllSettings, updateSetting };