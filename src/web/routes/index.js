const dashboardRoutes = require("./dashboard");
const settingsRoutes = require("./settings");
const salesRoutes = require("./sales");
const productsRoutes = require("./products");
const customersRoutes = require("./customers");
const cashboxRoutes = require("./cash");
const warehousesRoutes = require("./warehouses");
const biRoutes = require("./bi");
const profitRoutes = require("./profit");

function registerRoutes(app) {
  app.use("/", dashboardRoutes);
  app.use("/", settingsRoutes);
  app.use("/", salesRoutes);
  app.use("/", productsRoutes);
  app.use("/", customersRoutes);
  app.use("/", cashboxRoutes);
  app.use("/", warehousesRoutes);
  app.use("/", biRoutes);
  app.use("/", profitRoutes);
}

module.exports = registerRoutes;