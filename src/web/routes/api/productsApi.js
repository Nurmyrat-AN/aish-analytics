const router = require("express").Router();
const ProductAnalytics = require("../../../analytics/ProductAnalytics.v2");

router.get("/api/products/stock", (req, res) => {
  const rows = ProductAnalytics.stock({
    depoId: req.query.depoId || "",
    urunId: req.query.urunId || "",
    limit: Number(req.query.limit || 10),
  });

  res.json({
    success: true,
    count: rows.length,
    data: rows,
  });
});

module.exports = router;