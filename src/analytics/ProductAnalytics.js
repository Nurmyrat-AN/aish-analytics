const db = require("../config/sqlite");

function buildDateFilter(params) {
  const where = [];
  const values = [];

  if (params.from) {
    where.push("datetime(t.operation_date) >= datetime(?)");
    values.push(params.from);
  }

  if (params.to) {
    where.push("datetime(t.operation_date) <= datetime(?)");
    values.push(params.to);
  }

  return { where, values };
}

function buildBaseWhere(params = {}) {
  const { where, values } = buildDateFilter(params);

  where.push("COALESCE(t.sluj_is_yanlis, 0) = 0");

  if (params.urunId) {
    where.push("tl.urun_id = ?");
    values.push(params.urunId);
  }

  if (params.depoId) {
    where.push("t.id_depo1 = ?");
    values.push(params.depoId);
  }

  return {
    sql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
  };
}

function movement(params = {}) {
  const filter = buildBaseWhere(params);

  return db.prepare(`
    SELECT
      t.operation_date,
      t.kodu_txt,
      t.source_type,
      t.type_numeric,
      tt.type_name,

      t.id_depo1,
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS depo_adi,

      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,

      tl.base_unit_qty_total,
      tt.warehouse_1_effect_ratio,
      tl.base_unit_qty_total * tt.warehouse_1_effect_ratio AS qty_effect,

      tl.line_total,
      tl.purchase_price_at_card
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN urun u ON u.id = tl.urun_id
    LEFT JOIN depo d ON d.id = t.id_depo1
    ${filter.sql}
    ORDER BY datetime(t.operation_date) DESC
    LIMIT ?
  `).all(...filter.values, params.limit || 200);
}

function sales(params = {}) {
  const filter = buildBaseWhere(params);

  const extraWhere = filter.sql
    ? `${filter.sql} AND t.source_type = 'fatura' AND t.type_numeric = 201`
    : `WHERE t.source_type = 'fatura' AND t.type_numeric = 201`;

  return db.prepare(`
    SELECT
      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,
      COALESCE(SUM(tl.line_total), 0) AS total_amount,
      COALESCE(SUM(tl.base_unit_qty_total), 0) AS qty,
      COUNT(DISTINCT t.id) AS check_count
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    ${extraWhere}
    GROUP BY tl.urun_id
    ORDER BY total_amount DESC
    LIMIT ?
  `).all(...filter.values, params.limit || 100);
}

function purchases(params = {}) {
  const filter = buildBaseWhere(params);

  const extraWhere = filter.sql
    ? `${filter.sql} AND t.source_type = 'fatura' AND t.type_numeric = 101`
    : `WHERE t.source_type = 'fatura' AND t.type_numeric = 101`;

  return db.prepare(`
    SELECT
      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,
      COALESCE(SUM(tl.line_total), 0) AS total_amount,
      COALESCE(SUM(tl.base_unit_qty_total), 0) AS qty,
      COUNT(DISTINCT t.id) AS doc_count
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    ${extraWhere}
    GROUP BY tl.urun_id
    ORDER BY total_amount DESC
    LIMIT ?
  `).all(...filter.values, params.limit || 100);
}

function stock(params = {}) {
  const where = ["COALESCE(t.sluj_is_yanlis, 0) = 0"];
  const values = [];

  if (params.urunId) {
    where.push("tl.urun_id = ?");
    values.push(params.urunId);
  }

  if (params.depoId) {
    where.push("t.id_depo1 = ?");
    values.push(params.depoId);
  }

  return db.prepare(`
    SELECT
      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,
      t.id_depo1 AS depo_id,
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS depo_adi,
      COALESCE(SUM(tl.base_unit_qty_total * tt.warehouse_1_effect_ratio), 0) AS qty
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN urun u ON u.id = tl.urun_id
    LEFT JOIN depo d ON d.id = t.id_depo1
    WHERE ${where.join(" AND ")}
    GROUP BY tl.urun_id, t.id_depo1
    ORDER BY urun_adi
    LIMIT ?
  `).all(...values, params.limit || 500);
}

function negativeStock(params = {}) {
  return stock({ ...params, limit: params.limit || 500 })
    .filter((x) => Number(x.qty) < 0);
}

module.exports = {
  movement,
  sales,
  purchases,
  stock,
  negativeStock,
};