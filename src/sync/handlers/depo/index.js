const { mapDepo } = require("./mapper");
const { saveDepo } = require("./repository");

async function sync(doc) {
  const depo = mapDepo(doc);
  saveDepo(depo);

  return {
    synced: true,
    type: "depo",
    id: depo.id,
  };
}

module.exports = { sync };