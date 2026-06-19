const db = require("../config/sqlite");

function balance(params = {}) {
  const where = [
    "t.source_type = 'kasa_islemi'",
    "COALESCE(t.sluj_is_yanlis, 0) = 0",
    "t.id_account1 IS NOT NULL",
  ];

  const values = [];

  if (params.defterId) {
    where.push("t.id_account1 = ?");
    values.push(params.defterId);
  }

  return db.prepare(`
    SELECT
      t.id_account1 AS defter_id,
      COALESCE(d.adi, t.id_account1, 'Без кассы') AS defter_adi,
      d.id_walyuta,
      COALESCE(w.adi, 'mnt') AS walyuta_adi,
      COALESCE(SUM(t.amount * tt.book_1_effect_ratio), 0) AS balance,
      COUNT(*) AS operation_count
    FROM transactions t
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN defter d ON d.id = t.id_account1
    LEFT JOIN z_walyuta w ON w.id = d.id_walyuta
    WHERE ${where.join(" AND ")}
    GROUP BY t.id_account1
    ORDER BY defter_adi
  `).all(...values);
}

function movement(params = {}) {
  const where = [
    "t.source_type = 'kasa_islemi'",
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

  if (params.defterId) {
    where.push("t.id_account1 = ?");
    values.push(params.defterId);
  }

  return db.prepare(`
    SELECT
      t.operation_date,
      t.type_numeric,
      tt.type_name,
      t.amount,
      tt.book_1_effect_ratio,
      t.amount * tt.book_1_effect_ratio AS cash_effect,

      t.id_account1 AS defter_id,
      COALESCE(d.adi, t.id_account1, 'Без кассы') AS defter_adi,
      COALESCE(w.adi, 'mnt') AS walyuta_adi,

      t.id_kagent1,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi,

      t.bellik,
      t.sluj_satici_id
    FROM transactions t
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN defter d ON d.id = t.id_account1
    LEFT JOIN z_walyuta w ON w.id = d.id_walyuta
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE ${where.join(" AND ")}
    ORDER BY datetime(t.operation_date) DESC
    LIMIT ?
  `).all(...values, params.limit || 300);
}

function byType(params = {}) {
  const where = [
    "t.source_type = 'kasa_islemi'",
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
      t.type_numeric,
      tt.type_name,
      COALESCE(SUM(t.amount * tt.book_1_effect_ratio), 0) AS total_effect,
      COALESCE(SUM(t.amount), 0) AS total_amount,
      COUNT(*) AS operation_count
    FROM transactions t
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    WHERE ${where.join(" AND ")}
    GROUP BY t.type_numeric
    ORDER BY ABS(total_effect) DESC
  `).all(...values);
}

module.exports = {
  balance,
  movement,
  byType,
};