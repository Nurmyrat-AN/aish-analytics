const router = require("express").Router();
const { getAllSettings, updateSetting } = require("../services/settingsService");

router.get("/settings", (req, res) => {
  res.render("settings/index", {
    title: "Settings",
    activeMenu: "settings",
    settings: getAllSettings(),
  });
});

router.post("/settings", (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    updateSetting(key, value);
  }

  res.redirect("/settings");
});

module.exports = router;