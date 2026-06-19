const router = require("express").Router();
const ProductAnalytics = require("../../analytics/ProductAnalytics");
const FilterBuilder = require("../filters/FilterBuilder");
const { parseFilters } = require("../filters/FilterParser");
const { getDateRange } = require("../utils/dateRange");

router.get("/products", (req, res) => {
  const tab = req.query.tab || "stock";
  const filtersValues = parseFilters(req.query);
  const period = req.query.period || "THIS_MONTH";
  const { from, to } = getDateRange(period);

  const params = {
    from,
    to,
    limit: 200,
  };

  const filters = new FilterBuilder(filtersValues)
    .hidden("tab", tab)
    .period()
    .depo()
    .urun()
    .build("/products");

  res.render("products/index", {
    title: "Товары",
    activeMenu: "products",
    tab,
    period,
    filters,

    stock: ProductAnalytics.stock({ limit: 500 }),
    negativeStock: ProductAnalytics.negativeStock({ limit: 500 }),
    sales: ProductAnalytics.sales(params),
    purchases: ProductAnalytics.purchases(params),
    movement: ProductAnalytics.movement(params),
  });
});

module.exports = router;