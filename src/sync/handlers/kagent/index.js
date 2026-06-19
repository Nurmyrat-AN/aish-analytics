const { mapKagent, mapBarkodlar, mapOzler } = require("./mapper");
const { saveKagent } = require("./repository");

async function sync(doc) {
  const kagent = mapKagent(doc);
  const barkodlar = mapBarkodlar(doc);
  const ozler = mapOzler(doc);

  saveKagent(kagent, barkodlar, ozler);

  return {
    synced: true,
    type: "kagent",
    id: kagent.id,
  };
}

module.exports = {
  sync,
};