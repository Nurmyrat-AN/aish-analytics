const db = require("../config/sqlite");

function getCardCostForSales(params = {}) {
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

    if (params.urunId) {
        where.push("tl.urun_id = ?");
        values.push(params.urunId);
    }

    return db.prepare(`
    SELECT
      tl.id AS line_id,
      t.id AS transaction_id,
      t.operation_date,
      t.kodu_txt,

      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,

      t.id_depo1 AS depo_id,
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS depo_adi,

      t.id_kagent1 AS kagent_id,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi,

      t.sluj_hangi_terminalden_yapildi AS satici_id,
      COALESCE(s.adi, t.sluj_hangi_terminalden_yapildi, 'Без продавца') AS satici_adi,

      tl.base_unit_qty_total AS qty,
      tl.line_total AS sale_amount,

      tl.purchase_price_at_card AS cost_unit_price,
      tl.purchase_price_at_card * tl.base_unit_qty_total AS cost_amount,

      tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total) AS profit_amount,

      CASE
        WHEN tl.line_total = 0 THEN 0
        ELSE (
          (tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total))
          / tl.line_total
        ) * 100
      END AS profit_percent
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    LEFT JOIN depo d ON d.id = t.id_depo1
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    LEFT JOIN terminal s ON s.id = t.sluj_hangi_terminalden_yapildi
    WHERE ${where.join(" AND ")}
    ORDER BY datetime(t.operation_date) DESC
    LIMIT ?
  `).all(...values, params.limit || 1000);
}

function summaryCard(params = {}) {
    const rows = getCardCostForSales(params);

    const totalSale = rows.reduce((sum, x) => sum + Number(x.sale_amount || 0), 0);
    const totalCost = rows.reduce((sum, x) => sum + Number(x.cost_amount || 0), 0);
    const totalProfit = rows.reduce((sum, x) => sum + Number(x.profit_amount || 0), 0);

    return {
        sale_amount: totalSale,
        cost_amount: totalCost,
        profit_amount: totalProfit,
        profit_percent: totalSale > 0 ? (totalProfit / totalSale) * 100 : 0,
        line_count: rows.length,
    };
}

function byProductCard(params = {}) {
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
      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,

      SUM(tl.base_unit_qty_total) AS qty,
      SUM(tl.line_total) AS sale_amount,
      SUM(tl.purchase_price_at_card * tl.base_unit_qty_total) AS cost_amount,
      SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total)) AS profit_amount,

      CASE
        WHEN SUM(tl.line_total) = 0 THEN 0
        ELSE (
          SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total))
          / SUM(tl.line_total)
        ) * 100
      END AS profit_percent
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    WHERE ${where.join(" AND ")}
    GROUP BY tl.urun_id
    ORDER BY profit_amount DESC
    LIMIT ?
  `).all(...values, params.limit || 200);
}

function byCustomerCard(params = {}) {
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

      SUM(tl.line_total) AS sale_amount,
      SUM(tl.purchase_price_at_card * tl.base_unit_qty_total) AS cost_amount,
      SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total)) AS profit_amount,
      COUNT(DISTINCT t.id) AS check_count,

      CASE
        WHEN SUM(tl.line_total) = 0 THEN 0
        ELSE (
          SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total))
          / SUM(tl.line_total)
        ) * 100
      END AS profit_percent
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE ${where.join(" AND ")}
    GROUP BY t.id_kagent1
    ORDER BY profit_amount DESC
    LIMIT ?
  `).all(...values, params.limit || 200);
}

function bySellerCard(params = {}) {
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
      t.sluj_hangi_terminalden_yapildi AS satici_id,
      COALESCE(s.adi, t.sluj_hangi_terminalden_yapildi, 'Без продавца') AS satici_adi,

      SUM(tl.line_total) AS sale_amount,
      SUM(tl.purchase_price_at_card * tl.base_unit_qty_total) AS cost_amount,
      SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total)) AS profit_amount,
      COUNT(DISTINCT t.id) AS check_count,

      CASE
        WHEN SUM(tl.line_total) = 0 THEN 0
        ELSE (
          SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total))
          / SUM(tl.line_total)
        ) * 100
      END AS profit_percent
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN terminal s ON s.id = t.sluj_hangi_terminalden_yapildi
    WHERE ${where.join(" AND ")}
    GROUP BY t.sluj_hangi_terminalden_yapildi
    ORDER BY profit_amount DESC
    LIMIT ?
  `).all(...values, params.limit || 200);
}

function belowCostCard(params = {}) {
    const where = [
        "t.source_type = 'fatura'",
        "t.type_numeric = 201",
        "COALESCE(t.sluj_is_yanlis, 0) = 0",
        "tl.line_total < (tl.purchase_price_at_card * tl.base_unit_qty_total)",
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
      t.operation_date,
      t.kodu_txt,

      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi,
      COALESCE(s.adi, t.sluj_hangi_terminalden_yapildi, 'Без продавца') AS satici_adi,

      tl.base_unit_qty_total AS qty,
      tl.line_total AS sale_amount,
      tl.purchase_price_at_card * tl.base_unit_qty_total AS cost_amount,
      tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total) AS profit_amount
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    LEFT JOIN terminal s ON s.id = t.sluj_hangi_terminalden_yapildi
    WHERE ${where.join(" AND ")}
    ORDER BY profit_amount ASC
    LIMIT ?
  `).all(...values, params.limit || 300);
}

module.exports = {
    getCardCostForSales,
    summaryCard,
    byProductCard,
    byCustomerCard,
    bySellerCard,
    belowCostCard,
};