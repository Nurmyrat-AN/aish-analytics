const { mapOlcUmum } = require("./mapper");
const { saveOlcUmum } = require("./repository");

async function sync(doc) {
  const olc = mapOlcUmum(doc);
  saveOlcUmum(olc);

  return {
    synced: true,
    type: "olc_umum",
    id: olc.id,
  };
}

module.exports = { sync };