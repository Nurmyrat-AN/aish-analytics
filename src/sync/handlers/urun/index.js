const {
  mapUrun,
  mapBarkodlar,
  mapEkOlculer,
  mapDuzumi,
} = require("./mapper");

const { saveUrun } = require("./repository");

async function sync(doc) {
  const urun = mapUrun(doc);
  const barkodlar = mapBarkodlar(doc);
  const ekOlculer = mapEkOlculer(doc);
  const duzumi = mapDuzumi(doc);

  saveUrun(urun, barkodlar, ekOlculer, duzumi);

  return {
    synced: true,
    type: "urun",
    id: urun.id,
  };
}

module.exports = {
  sync,
};