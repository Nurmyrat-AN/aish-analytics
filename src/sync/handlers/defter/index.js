const { mapDefter } = require("./mapper");
const { saveDefter } = require("./repository");

async function sync(doc) {
  const defter = mapDefter(doc);
  saveDefter(defter);

  return {
    synced: true,
    type: "defter",
    id: defter.id,
  };
}

module.exports = { sync };