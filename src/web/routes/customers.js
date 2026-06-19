const router = require("express").Router();
const CustomerAnalytics = require("../../analytics/CustomerAnalytics");
const FilterBuilder = require("../filters/FilterBuilder");
const { parseFilters } = require("../filters/FilterParser");
const { getDateRange } = require("../utils/dateRange");

router.get("/customers", (req, res) => {
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
    .build("/customers");

  res.render("customers/index", {
    title: "Клиенты",
    activeMenu: "customers",
    tab,
    period,
    filters,

    balance: CustomerAnalytics.balance({ limit: 300 }),
    sales: CustomerAnalytics.sales(params),
    statement: CustomerAnalytics.statement(params),
  });
});

module.exports = router;