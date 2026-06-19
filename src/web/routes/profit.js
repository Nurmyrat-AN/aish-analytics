const router = require("express").Router();
const InventoryCostService = require("../../inventory/InventoryCostService");
const FilterBuilder = require("../filters/FilterBuilder");
const { parseFilters } = require("../filters/FilterParser");
const { getDateRange } = require("../utils/dateRange");

router.get("/profit", (req, res) => {
    const tab = req.query.tab || "products";
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
        .urun()
        .kagent()
        .satici()
        .build("/profit");

    res.render("profit/index", {
        title: "Прибыль",
        activeMenu: "profit",
        tab,
        period,
        filters,

        summary: InventoryCostService.summaryCard(params),
        byProduct: InventoryCostService.byProductCard(params),
        byCustomer: InventoryCostService.byCustomerCard(params),
        bySeller: InventoryCostService.bySellerCard(params),
        belowCost: InventoryCostService.belowCostCard(params),
        rows: InventoryCostService.getCardCostForSales(params),
    });
});

module.exports = router;