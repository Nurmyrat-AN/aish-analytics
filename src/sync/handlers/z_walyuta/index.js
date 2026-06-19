const { mapZWalyuta } = require("./mapper");
const { saveZWalyuta } = require("./repository");

async function sync(doc) {
  const walyuta = mapZWalyuta(doc);
  saveZWalyuta(walyuta);

  return {
    synced: true,
    type: "z_walyuta",
    id: walyuta.id,
  };
}

module.exports = { sync };