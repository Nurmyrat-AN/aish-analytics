const router = require("express").Router();
const SalesAnalytics = require("../../analytics/SalesAnalytics");
const FilterBuilder = require("../filters/FilterBuilder");
const { parseFilters } = require("../filters/FilterParser");
const { getDateRange } = require("../utils/dateRange");

router.get("/sales", (req, res) => {
  const filtersValues = parseFilters(req.query);
  const period = req.query.period || "THIS_MONTH";
  const { from, to } = getDateRange(period);

  const params = {
    from,
    to,
    includeWrong: false,
    limit: 50,
  };

  const filters = new FilterBuilder(filtersValues)
    .period()
    .depo()
    .kagent()
    .satici()
    .build("/sales");

  res.render("sales/index", {
    title: "Продажи",
    activeMenu: "sales",
    period,
    filters,
    summary: SalesAnalytics.summary(params),
    byDay: SalesAnalytics.byDay(params),
    byProduct: SalesAnalytics.byProduct(params),
    byCustomer: SalesAnalytics.byCustomer(params),
    bySeller: SalesAnalytics.bySeller(params),
    byWarehouse: SalesAnalytics.byWarehouse(params),
    belowMinimumPrice: SalesAnalytics.belowMinimumPrice(params),
  });
});

module.exports = router;