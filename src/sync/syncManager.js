const crypto = require('crypto');
const { handleDocument } = require("./handlers");

async function syncDocument(doc) {
    if (!doc) {
        return {
            skipped: true,
            reason: "EMPTY_DOC",
        };
    }

    if (doc._deleted) {
        return {
            skipped: true,
            reason: "DELETED_DOC",
            id: doc._id,
        };
    }

    return handleDocument(doc);
}

async function syncBatch(docs) {
    const stats = {
        total: docs.length,
        synced: 0,
        skipped: 0,
        deleted: 0,
        errors: 0,
    };

    for (let doc of docs) {
        try {
            if (doc.load) {

                const dtoKey = verKeyForDto(doc._id);

                const decrypted = decryptAES(dtoKey, doc.load);
                try {
                    doc = { ...doc, ...JSON.parse(decrypted) };
                    delete doc['load'];
                } catch (e) {
                    throw e
                }
            }
            const result = await syncDocument(doc);

            if (result?.reason === "DELETED_DOC") {
                stats.deleted++;
            } else if (result?.skipped) {
                stats.skipped++;
            } else {
                stats.synced++;
            }
        } catch (error) {
            stats.errors++;
            console.error("Sync error:", doc?._id, error.message);
        }
    }

    return stats;
}


let dicKeys = null;

async function loadKeys() {
    console.log('DECRYPT sluj_ana.json');

    const slujAna =
        'XvfWxBjBFnPH8kulhXbyrsljrHOGdOV4wNO+frok+Vxkq05aHCm6p5UcupfhF2Y43dgi2AX/W+VoRjLKJ2sIgZ2U9UMT3QTLVFT3/VWakIZko7hgn55grt5D2eDE3MAGEdT/xhj9f7lIOucLWxU6WHDFBwjwCu+gWAE0r88G6vovzSVRI3XS/SDghivTd5yWgs/xJ0gAFVPSLOmNlMssrxFxIcYjMki7dQ0BwjvpPOq6uY2ia/iXe+yf+DDK/yix7uLVOrBObV2hfDhB1KuiBFiYcGLoGH125bm+dKYEqGVcPDQhAjuWzp1r51XJx9UIpjRR/aWfJtFnSqxP5e9uX3tkzJV7ePubc5vIng8qTMIpzGw8iXPQLwnKgyc2rGToKPWdg+VsUs6SsyMKw2iUROQUFiFuzTiUhyG03vHppPho18ktH4UV7fp6MeyCtlJctQdu+EWOkG72y1BFlQx2pXGJq09Gbum39RVw3Cx06IJRMpzqKw+8r7HsU4jXfmF1KrJGENZfNpki9kThbfyM+iI8sgtDd2Rd0hnoqGVN2v2ukRwwwkvkj2vbj7QbU+uWT8QHMk4juLb6fn1ljegjOyEvg3MoLadmlccYWPcQyJRe37Hj14x0VkJClePmvsF0JvimVAkehm6GEg5GjCHy74IbzNi1ZNjkSi27cfWh9GrelWv+IWDJalHNZPLOL68aPJGz1vf4morM0D2A0edZA6I5HV9Y2mchvCKAw29efu4epn0xDVFewuNrVA0MpsF9k6bzp/iXE9Au5pYCfGQWcQ==';

    const decrypted = decryptAES('LEGIT', slujAna);

    dicKeys = JSON.parse(decrypted);

    console.log('KEYS LOADED');
}

function decryptAES(key, base64Cipher) {
    const iv = Buffer.alloc(16, 0);

    if (key.length < 32) {
        key = key.padEnd(32, '1');
    }

    if (key.length > 32) {
        key = key.substring(0, 32);
    }

    const aesKey = Buffer.from(key, 'utf8');

    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);

    let decrypted = decipher.update(base64Cipher, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

function verKeyForDto(id) {
    const key2020 = dicKeys['_key2020'];

    let i = id.indexOf('-');

    if (i > 0) {
        id = id.substring(i);
    }

    return key2020.substring(16) + id;
}

module.exports = {
    syncDocument,
    syncBatch,
    loadKeys,
};