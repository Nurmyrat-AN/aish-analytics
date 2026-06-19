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

function buildBaseSalesWhere(params = {}) {
  const { where, values } = buildDateFilter(params);

  where.push("t.source_type = 'fatura'");
  where.push("t.type_numeric = 201");

  if (!params.includeWrong) {
    where.push("COALESCE(t.sluj_is_yanlis, 0) = 0");
  }

  if (params.depoId) {
    where.push("t.id_depo1 = ?");
    values.push(params.depoId);
  }

  if (params.kagentId) {
    where.push("t.id_kagent1 = ?");
    values.push(params.kagentId);
  }

  if (params.saticiId) {
    where.push("t.sluj_satici_id = ?");
    values.push(params.saticiId);
  }

  return {
    sql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
  };
}

function summary(params = {}) {
  const filter = buildBaseSalesWhere(params);

  return db.prepare(`
    SELECT
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COUNT(*) AS check_count,
      COALESCE(AVG(t.amount), 0) AS avg_check
    FROM transactions t
    ${filter.sql}
  `).get(...filter.values);
}

function byDay(params = {}) {
  const filter = buildBaseSalesWhere(params);

  return db.prepare(`
    SELECT
      date(t.operation_date) AS day,
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COUNT(*) AS check_count
    FROM transactions t
    ${filter.sql}
    GROUP BY date(t.operation_date)
    ORDER BY day
  `).all(...filter.values);
}

function byProduct(params = {}) {
  const filter = buildBaseSalesWhere(params);

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
    ${filter.sql}
    GROUP BY tl.urun_id
    ORDER BY total_amount DESC
    LIMIT ?
  `).all(...filter.values, params.limit || 100);
}

function byCustomer(params = {}) {
  const filter = buildBaseSalesWhere(params);

  return db.prepare(`
    SELECT
      t.id_kagent1 AS kagent_id,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi,
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COUNT(*) AS check_count,
      COALESCE(AVG(t.amount), 0) AS avg_check
    FROM transactions t
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    ${filter.sql}
    GROUP BY t.id_kagent1
    ORDER BY total_amount DESC
    LIMIT ?
  `).all(...filter.values, params.limit || 100);
}

function bySeller(params = {}) {
  const filter = buildBaseSalesWhere(params);

  return db.prepare(`
    SELECT
      t.sluj_satici_id AS satici_id,
      COALESCE(k.adi, t.sluj_satici_id, 'Без продавца') AS satici_adi,
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COUNT(*) AS check_count,
      COALESCE(AVG(t.amount), 0) AS avg_check
    FROM transactions t
    LEFT JOIN kagent k ON k.id = t.sluj_satici_id
    ${filter.sql}
    GROUP BY t.sluj_satici_id
    ORDER BY total_amount DESC
    LIMIT ?
  `).all(...filter.values, params.limit || 100);
}

function byWarehouse(params = {}) {
  const filter = buildBaseSalesWhere(params);

  return db.prepare(`
    SELECT
      t.id_depo1 AS depo_id,
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS depo_adi,
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COUNT(*) AS check_count
    FROM transactions t
    LEFT JOIN depo d ON d.id = t.id_depo1
    ${filter.sql}
    GROUP BY t.id_depo1
    ORDER BY total_amount DESC
  `).all(...filter.values);
}

function belowMinimumPrice(params = {}) {
  const filter = buildBaseSalesWhere(params);

  return db.prepare(`
    SELECT
      t.operation_date,
      t.kodu_txt,
      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,
      tl.unit_price_given,
      u.minimum_satis_fiyati,
      tl.base_unit_qty_total,
      ((u.minimum_satis_fiyati - tl.unit_price_given) * tl.base_unit_qty_total) AS loss_amount
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN urun u ON u.id = tl.urun_id
    ${filter.sql}
      AND u.minimum_satis_fiyati > 0
      AND tl.unit_price_given < u.minimum_satis_fiyati
    ORDER BY datetime(t.operation_date) DESC
    LIMIT ?
  `).all(...filter.values, params.limit || 100);
}

module.exports = {
  summary,
  byDay,
  byProduct,
  byCustomer,
  bySeller,
  byWarehouse,
  belowMinimumPrice,
};