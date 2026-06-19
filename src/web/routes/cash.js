const router = require("express").Router();
const CashAnalytics = require("../../analytics/CashAnalytics");
const FilterBuilder = require("../filters/FilterBuilder");
const { parseFilters } = require("../filters/FilterParser");
const { getDateRange } = require("../utils/dateRange");

router.get("/cash", (req, res) => {
  const tab = req.query.tab || "balance";
  const filtersValues = parseFilters(req.query);
  const period = req.query.period || "THIS_MONTH";
  const { from, to } = getDateRange(period);

  const params = {
    from,
    to,
    limit: 300,
  };

  const filters = new FilterBuilder(filtersValues)
    .hidden("tab", tab)
    .period()
    .kagent()
    .satici()
    .build("/cash");

  res.render("cash/index", {
    title: "Кассы",
    activeMenu: "cash",
    tab,
    period,
    filters,

    balance: CashAnalytics.balance(),
    movement: CashAnalytics.movement(params),
    byType: CashAnalytics.byType(params),
  });
});

module.exports = router;