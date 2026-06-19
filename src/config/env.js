require("dotenv").config();

module.exports = {
  sqlitePath: process.env.SQLITE_PATH || "./data/analytics.db",

  couchdb: {
    url: process.env.COUCHDB_URL,
    dbName: process.env.COUCHDB_DB_NAME
  },
};