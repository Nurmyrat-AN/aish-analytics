const nano = require("nano");
const { couchdb } = require("./env");

const couch = new nano(`${couchdb.url}`);

const db = couch.server.use(couchdb.dbName);

module.exports = db;