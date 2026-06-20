const couchDb = require("../config/couchdb");
const { skippedTypes } = require("./handlers");
const { syncBatch, loadKeys, testDocById } = require("./syncManager");
const { getLastSeq, setLastSeq } = require("./syncMeta");

function startChangesReader() {
    const since = getLastSeq();
    loadKeys();

    console.log("CouchDB changesReader started from seq:", since);

    const reader = couchDb.changesReader.start({
        since,
        includeDocs: true,
        batchSize: 1000,
    });

    // testDocById(couchDb, 'zarf-nvfew_cec42aca-cc9f-4518-8918-ddf9a523cb00')

    reader.on("batch", async (changes) => {
        const docs = changes.map((change) => change.doc).filter(Boolean);

        const stats = await syncBatch(docs);

        const lastChange = changes[changes.length - 1];
        if (lastChange && lastChange.seq) {
            setLastSeq(lastChange.seq);
        }


        // if (docs.length < 1000) {
        //     console.log("Skipped types:", skippedTypes);
        // }

        console.log("Batch synced:", stats);
    });

    reader.on("error", (err) => {
        console.error("changesReader error:", err.message);
    });

    reader.on("end", () => {
        console.log("changesReader ended");
    });

    return reader;
}

module.exports = {
    startChangesReader,
};