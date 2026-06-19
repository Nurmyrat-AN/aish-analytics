const router = require("express").Router();
const BIAnalytics = require("../../analytics/BIAnalytics");
const { getDateRange } = require("../utils/dateRange");

router.get("/bi/abc", (req, res) => {
  const period = req.query.period || "LAST_365_DAYS";
  const { from, to } = getDateRange(period);

  const rows = BIAnalytics.abc({ from, to });

  res.render("bi/abc", {
    title: "ABC анализ",
    activeMenu: "bi",
    period,
    rows,
  });
});

router.get("/bi/xyz", (req, res) => {
  const period = req.query.period || "LAST_180_DAYS";
  const { from, to } = getDateRange(period);

  const rows = BIAnalytics.xyz({ from, to });

  res.render("bi/xyz", {
    title: "XYZ анализ",
    activeMenu: "bi",
    period,
    rows,
  });
});

router.get("/bi/abc-xyz", (req, res) => {
  const period = req.query.period || "LAST_365_DAYS";
  const { from, to } = getDateRange(period);

  const rows = BIAnalytics.abcXyz({ from, to });

  res.render("bi/abc-xyz", {
    title: "ABC × XYZ",
    activeMenu: "bi",
    period,
    rows,
  });
});

router.get("/bi/minimum-price", (req, res) => {
  const period = req.query.period || "LAST_30_DAYS";
  const { from, to } = getDateRange(period);

  const rows = BIAnalytics.minimumPriceViolations({
    from,
    to,
    limit: 500,
  });

  res.render("bi/minimum-price", {
    title: "Продажи ниже минимальной цены",
    activeMenu: "bi",
    period,
    rows,
  });
});

router.get("/bi/slow-moving", (req, res) => {
  const days = Number(req.query.days || 90);

  const rows = BIAnalytics.slowMoving({
    days,
    limit: 500,
  });

  res.render("bi/slow-moving", {
    title: "Slow Moving",
    activeMenu: "bi",
    days,
    rows,
  });
});

router.get("/bi/dead-stock", (req, res) => {
  const days = Number(req.query.days || 180);

  const rows = BIAnalytics.deadStock({
    days,
    limit: 500,
  });

  res.render("bi/dead-stock", {
    title: "Dead Stock",
    activeMenu: "bi",
    days,
    rows,
  });
});

module.exports = router;