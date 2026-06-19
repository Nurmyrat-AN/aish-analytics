const db = require("../config/sqlite");

function balance(params = {}) {
  const where = ["COALESCE(t.sluj_is_yanlis, 0) = 0"];
  const values = [];

  if (params.kagentId) {
    where.push("t.id_kagent1 = ?");
    values.push(params.kagentId);
  }

  return db.prepare(`
    SELECT
      t.id_kagent1 AS kagent_id,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi,
      COALESCE(SUM(t.amount * tt.customer_1_effect_ratio), 0) AS balance,
      COUNT(*) AS operation_count
    FROM transactions t
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE ${where.join(" AND ")}
      AND t.id_kagent1 IS NOT NULL
    GROUP BY t.id_kagent1
    HAVING ABS(balance) > 0.0001
    ORDER BY ABS(balance) DESC
    LIMIT ?
  `).all(...values, params.limit || 200);
}

function statement(params = {}) {
  const where = ["COALESCE(t.sluj_is_yanlis, 0) = 0"];
  const values = [];

  if (params.kagentId) {
    where.push("t.id_kagent1 = ?");
    values.push(params.kagentId);
  }

  if (params.from) {
    where.push("datetime(t.operation_date) >= datetime(?)");
    values.push(params.from);
  }

  if (params.to) {
    where.push("datetime(t.operation_date) <= datetime(?)");
    values.push(params.to);
  }

  return db.prepare(`
    SELECT
      t.operation_date,
      t.source_type,
      t.type_numeric,
      tt.type_name,
      t.kodu_txt,
      t.amount,
      tt.customer_1_effect_ratio,
      t.amount * tt.customer_1_effect_ratio AS balance_effect,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi
    FROM transactions t
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE ${where.join(" AND ")}
    ORDER BY datetime(t.operation_date) DESC
    LIMIT ?
  `).all(...values, params.limit || 300);
}

function sales(params = {}) {
  const where = [
    "t.source_type = 'fatura'",
    "t.type_numeric = 201",
    "COALESCE(t.sluj_is_yanlis, 0) = 0",
  ];
  const values = [];

  if (params.from) {
    where.push("datetime(t.operation_date) >= datetime(?)");
    values.push(params.from);
  }

  if (params.to) {
    where.push("datetime(t.operation_date) <= datetime(?)");
    values.push(params.to);
  }

  return db.prepare(`
    SELECT
      t.id_kagent1 AS kagent_id,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi,
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COUNT(*) AS check_count,
      COALESCE(AVG(t.amount), 0) AS avg_check
    FROM transactions t
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE ${where.join(" AND ")}
    GROUP BY t.id_kagent1
    ORDER BY total_amount DESC
    LIMIT ?
  `).all(...values, params.limit || 200);
}

module.exports = {
  balance,
  statement,
  sales,
};