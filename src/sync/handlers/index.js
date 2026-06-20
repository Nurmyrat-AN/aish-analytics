const { saveUnknownDocument } = require("../unknownDocumentRepository");

const handlers = {
    urun: require("./urun"),
    kagent: require("./kagent"),
    defter: require("./defter"),
    depo: require("./depo"),
    olc_umum: require("./olc_umum"),
    terminal: require("./terminal"),
    z_walyuta: require("./z_walyuta"),
    ayar_umum: require("./ayar_umum"),
    zarf: require("./zarf"),
    z_kurs_walyuta: require("./z_kurs_walyuta"),
};

function registerHandler(type, handler) {
    handlers[type] = handler;
}

const skippedTypes = []

async function handleDocument(doc) {
    if (!doc || !doc.$dokuman_tipi) return;

    const handler = handlers[doc.$dokuman_tipi];

    if (!handler) {
        saveUnknownDocument(doc);
        skippedTypes.push({
            [doc.$dokuman_tipi]: doc
        })
        return {
            skipped: true,
            reason: "NO_HANDLER",
            type: doc.$dokuman_tipi,
            id: doc._id,
        };
    }

    return handler.sync(doc);
}

module.exports = {
    registerHandler,
    handleDocument,
    skippedTypes,
};