const { getDateRange } = require("../utils/dateRange");

function parseFilters(query = {}) {
  const period = query.period || "THIS_MONTH";
  const range = getDateRange(period);

  return {
    period,
    from: range.from,
    to: range.to,

    depoId: query.depoId || "",
    kagentId: query.kagentId || "",
    urunId: query.urunId || "",
    saticiId: query.saticiId || "",
  };
}

module.exports = {
  parseFilters,
};