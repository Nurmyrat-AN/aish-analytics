const express = require("express");
const path = require("path");

const registerRoutes = require("./routes");

function startWebServer() {
  const app = express();

  app.disable("x-powered-by");

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use("/public", express.static(path.join(__dirname, "public")));

  registerRoutes(app);

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Web server started: http://localhost:${port}`);
  });

  return app;
}

module.exports = {
  startWebServer,
};