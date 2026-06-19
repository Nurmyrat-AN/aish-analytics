const { mapTerminal } = require("./mapper");
const { saveTerminal } = require("./repository");

async function sync(doc) {
  const terminal = mapTerminal(doc);
  saveTerminal(terminal);

  return {
    synced: true,
    type: "terminal",
    id: terminal.id,
  };
}

module.exports = { sync };