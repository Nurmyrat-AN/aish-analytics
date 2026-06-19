const router = require("express").Router();
const { getDashboardData } = require("../services/dashboardService");

router.get("/", (req, res) => {
  const period = req.query.period || "TODAY";
  const dashboard = getDashboardData(period);

  res.render("dashboard/index", {
    title: "Dashboard",
    activeMenu: "dashboard",
    dashboard,
    period,
  });
});

module.exports = router;