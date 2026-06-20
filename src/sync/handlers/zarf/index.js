const { mapZarf } = require("./mapper");
const { saveZarfTransactions } = require("./repository");

async function sync(doc) {

  const { transactions, lines } = mapZarf(doc);

  saveZarfTransactions(transactions, lines);

  return {
    synced: true,
    type: "zarf",
    id: doc._id,
    transactions: transactions.length,
    lines: lines.length,
  };
}

module.exports = { sync };