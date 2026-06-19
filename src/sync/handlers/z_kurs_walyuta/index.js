const { mapZKursWalyuta } = require("./mapper");
const { saveZKursWalyuta } = require("./repository");

async function sync(doc) {
  const rows = mapZKursWalyuta(doc);

  saveZKursWalyuta(doc._id, rows);

  return {
    synced: true,
    type: "z_kurs_walyuta",
    id: doc._id,
    rows: rows.length,
  };
}

module.exports = { sync };