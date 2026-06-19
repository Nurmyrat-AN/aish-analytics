const db = require("../config/sqlite");

const settings = [
  ["default_date_range", "today", "string", "Период отчётов по умолчанию"],
  ["exclude_wrong_transactions", "true", "boolean", "Исключать ошибочные операции"],
  ["default_language", "ru", "string", "Язык интерфейса"],
  ["items_per_page", "50", "number", "Количество строк на странице"],
  ["profit_calculation_method", "CARD", "string", "Метод прибыли: FIFO, LIFO, CARD"],
  ["inventory_cost_inbound_scope", "PURCHASE_ONLY", "string", "Входы для себестоимости: PURCHASE_ONLY или ALL_INBOUND"],
  ["exclude_wrong_transactions", "true", "boolean", "Исключать ошибочные операции"],
  ["abc_color_a", "#16a34a", "string", "ABC A цвет"],
  ["abc_color_b", "#f59e0b", "string", "ABC B цвет"],
  ["abc_color_c", "#dc2626", "string", "ABC C цвет"],
  ["xyz_color_x", "#16a34a", "string", "XYZ X цвет"],
  ["xyz_color_y", "#f59e0b", "string", "XYZ Y цвет"],
  ["xyz_color_z", "#dc2626", "string", "XYZ Z цвет"],
  ["abc_a_percent", "80", "number", "ABC: граница A, %"],
  ["abc_b_percent", "95", "number", "ABC: граница B, %"],
  ["abc_calculation_basis", "PROFIT", "string", "ABC: основа расчёта"],
  ["abc_period", "LAST_365_DAYS", "string", "ABC: период анализа"],
  ["xyz_x_cv", "10", "number", "XYZ: граница X, CV %"],
  ["xyz_y_cv", "25", "number", "XYZ: граница Y, CV %"],
  ["xyz_calculation_basis", "QUANTITY", "string", "XYZ: основа расчёта"],
  ["xyz_period", "LAST_180_DAYS", "string", "XYZ: период анализа"],
  ["xyz_bucket", "DAY", "string", "XYZ: период группировки DAY, WEEK, MONTH"],
];

const stmt = db.prepare(`
  INSERT INTO app_settings (key, value, value_type, description)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(key) DO NOTHING
`);

const run = db.transaction(() => {
  for (const row of settings) {
    stmt.run(...row);
  }
});

run();

console.log("app_settings seeded successfully");