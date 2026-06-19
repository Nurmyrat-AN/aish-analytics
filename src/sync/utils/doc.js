function getDocId(doc) {
  return doc?._id || "";
}

function getDocRev(doc) {
  return doc?._rev || null;
}

function getLoadHash(doc) {
  return doc?.loadHashSha256 || null;
}

function boolToInt(value) {
  return value ? 1 : 0;
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeText(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

module.exports = {
  getDocId,
  getDocRev,
  getLoadHash,
  boolToInt,
  safeNumber,
  safeText,
};