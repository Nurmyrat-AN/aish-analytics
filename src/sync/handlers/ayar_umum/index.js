const { mapAyarUmum } = require("./mapper");
const { saveAyarUmum } = require("./repository");

async function sync(doc) {
  const ayar = mapAyarUmum(doc);
  saveAyarUmum(ayar);

  return {
    synced: true,
    type: "ayar_umum",
    id: ayar.id,
  };
}

module.exports = { sync };