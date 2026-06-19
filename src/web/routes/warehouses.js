const router = require("express").Router();
const WarehouseAnalytics = require("../../analytics/WarehouseAnalytics");
const FilterBuilder = require("../filters/FilterBuilder");
const { parseFilters } = require("../filters/FilterParser");
const { getDateRange } = require("../utils/dateRange");

router.get("/warehouse", (req, res) => {
  const tab = req.query.tab || "stock";
  const filtersValues = parseFilters(req.query);
  const period = req.query.period || "THIS_MONTH";
  const { from, to } = getDateRange(period);

  const params = {
    from,
    to,
    limit: 500,
  };

  const filters = new FilterBuilder(filtersValues)
    .hidden("tab", tab)
    .period()
    .depo()
    .urun()
    .build("/warehouse");

  res.render("warehouse/index", {
    title: "Склад",
    activeMenu: "warehouse",
    tab,
    period,
    filters,

    stock: WarehouseAnalytics.stock({ limit: 500 }),
    negativeStock: WarehouseAnalytics.negativeStock({ limit: 500 }),
    movement: WarehouseAnalytics.movement(params),
    inbound: WarehouseAnalytics.inbound(params),
    outbound: WarehouseAnalytics.outbound(params),
  });
});

module.exports = router;