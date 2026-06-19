const db = require("../config/sqlite");

function stock(params = {}) {
  const where = ["COALESCE(t.sluj_is_yanlis, 0) = 0"];
  const values = [];

  if (params.depoId) {
    where.push("t.id_depo1 = ?");
    values.push(params.depoId);
  }

  if (params.urunId) {
    where.push("tl.urun_id = ?");
    values.push(params.urunId);
  }

  return db.prepare(`
    SELECT
      t.id_depo1 AS depo_id,
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS depo_adi,

      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,

      COALESCE(SUM(tl.base_unit_qty_total * tt.warehouse_1_effect_ratio), 0) AS qty
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN depo d ON d.id = t.id_depo1
    LEFT JOIN urun u ON u.id = tl.urun_id
    WHERE ${where.join(" AND ")}
    GROUP BY t.id_depo1, tl.urun_id
    ORDER BY depo_adi, urun_adi
    LIMIT ?
  `).all(...values, params.limit || 500);
}

function negativeStock(params = {}) {
  return stock({ ...params, limit: params.limit || 1000 })
    .filter((x) => Number(x.qty) < 0);
}

function movement(params = {}) {
  const where = ["COALESCE(t.sluj_is_yanlis, 0) = 0"];
  const values = [];

  if (params.from) {
    where.push("datetime(t.operation_date) >= datetime(?)");
    values.push(params.from);
  }

  if (params.to) {
    where.push("datetime(t.operation_date) <= datetime(?)");
    values.push(params.to);
  }

  if (params.depoId) {
    where.push("t.id_depo1 = ?");
    values.push(params.depoId);
  }

  return db.prepare(`
    SELECT
      t.operation_date,
      t.kodu_txt,
      t.source_type,
      t.type_numeric,
      tt.type_name,

      t.id_depo1 AS depo_id,
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS depo_adi,

      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,

      tl.base_unit_qty_total AS qty,
      tt.warehouse_1_effect_ratio,
      tl.base_unit_qty_total * tt.warehouse_1_effect_ratio AS qty_effect,

      tl.line_total
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN depo d ON d.id = t.id_depo1
    LEFT JOIN urun u ON u.id = tl.urun_id
    WHERE ${where.join(" AND ")}
    ORDER BY datetime(t.operation_date) DESC
    LIMIT ?
  `).all(...values, params.limit || 500);
}

function inbound(params = {}) {
  return movement(params).filter((x) => Number(x.qty_effect) > 0);
}

function outbound(params = {}) {
  return movement(params).filter((x) => Number(x.qty_effect) < 0);
}

module.exports = {
  stock,
  negativeStock,
  movement,
  inbound,
  outbound,
};