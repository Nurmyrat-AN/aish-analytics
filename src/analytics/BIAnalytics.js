const db = require("../config/sqlite");

function getSetting(key, fallback) {
    const row = db.prepare(`
    SELECT value
    FROM app_settings
    WHERE key = ?
  `).get(key);

    return row ? row.value : fallback;
}

function getNumberSetting(key, fallback) {
    const value = Number(getSetting(key, fallback));
    return Number.isFinite(value) ? value : fallback;
}

function getAbcBasisExpression(basis) {
    if (basis === "REVENUE") {
        return "SUM(tl.line_total)";
    }

    if (basis === "QUANTITY") {
        return "SUM(tl.base_unit_qty_total)";
    }

    return "SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total))";
}

function abc(params = {}) {
    const basis = params.basis || getSetting("abc_calculation_basis", "PROFIT");
    const aPercent = getNumberSetting("abc_a_percent", 80);
    const bPercent = getNumberSetting("abc_b_percent", 95);
    const metricExpression = getAbcBasisExpression(basis);

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

    const rows = db.prepare(`
    SELECT
      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,
      ${metricExpression} AS metric_value,
      SUM(tl.line_total) AS revenue,
      SUM(tl.base_unit_qty_total) AS qty,
      SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total)) AS profit
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    WHERE ${where.join(" AND ")}
    GROUP BY tl.urun_id
    HAVING metric_value > 0
    ORDER BY metric_value DESC
  `).all(...values);

    const total = rows.reduce((sum, r) => sum + Number(r.metric_value || 0), 0);

    let cumulative = 0;

    return rows.map((row) => {
        const value = Number(row.metric_value || 0);
        cumulative += value;

        const cumulativePercent = total > 0 ? (cumulative / total) * 100 : 0;

        let abcClass = "C";

        if (cumulativePercent <= aPercent) {
            abcClass = "A";
        } else if (cumulativePercent <= bPercent) {
            abcClass = "B";
        }

        return {
            ...row,
            cumulative_percent: cumulativePercent,
            abc_class: abcClass,
        };
    });
}

function getXyzBasisValue(row, basis) {
    if (basis === "REVENUE") return Number(row.revenue || 0);
    if (basis === "PROFIT") return Number(row.profit || 0);
    return Number(row.qty || 0);
}

function getBucketKey(dateText, bucket) {
    const d = new Date(dateText);

    if (bucket === "MONTH") {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    if (bucket === "WEEK") {
        const temp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const day = temp.getUTCDay() || 7;
        temp.setUTCDate(temp.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);

        return `${temp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
    }

    return d.toISOString().slice(0, 10);
}

function buildBuckets(from, to, bucket) {
    const result = [];
    const current = new Date(from);
    const end = new Date(to);

    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
        result.push(getBucketKey(current.toISOString(), bucket));

        if (bucket === "MONTH") {
            current.setMonth(current.getMonth() + 1);
        } else if (bucket === "WEEK") {
            current.setDate(current.getDate() + 7);
        } else {
            current.setDate(current.getDate() + 1);
        }
    }

    return [...new Set(result)];
}

function stddev(values, avg) {
    if (!values.length) return 0;

    const variance =
        values.reduce((sum, x) => sum + Math.pow(x - avg, 2), 0) / values.length;

    return Math.sqrt(variance);
}

function xyz(params = {}) {
    const basis = params.basis || getSetting("xyz_calculation_basis", "QUANTITY");
    const bucket = params.bucket || getSetting("xyz_bucket", "DAY");

    const xCv = getNumberSetting("xyz_x_cv", 10);
    const yCv = getNumberSetting("xyz_y_cv", 25);

    const from = params.from;
    const to = params.to;

    if (!from || !to) {
        throw new Error("XYZ analysis requires from/to dates");
    }

    const buckets = buildBuckets(from, to, bucket);

    const rows = db.prepare(`
    SELECT
      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,
      t.operation_date,
      COALESCE(SUM(tl.base_unit_qty_total), 0) AS qty,
      COALESCE(SUM(tl.line_total), 0) AS revenue,
      COALESCE(SUM(tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total)), 0) AS profit
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
    GROUP BY tl.urun_id, date(t.operation_date)
  `).all(from, to);

    const productMap = new Map();

    for (const row of rows) {
        if (!productMap.has(row.urun_id)) {
            productMap.set(row.urun_id, {
                urun_id: row.urun_id,
                urun_adi: row.urun_adi,
                buckets: new Map(),
            });
        }

        const key = getBucketKey(row.operation_date, bucket);
        const value = getXyzBasisValue(row, basis);

        const product = productMap.get(row.urun_id);
        product.buckets.set(key, (product.buckets.get(key) || 0) + value);
    }

    const result = [];

    for (const product of productMap.values()) {
        const values = buckets.map((b) => Number(product.buckets.get(b) || 0));
        const total = values.reduce((sum, x) => sum + x, 0);
        const avg = values.length ? total / values.length : 0;
        const sd = stddev(values, avg);
        const cv = avg > 0 ? (sd / avg) * 100 : 0;

        let xyzClass = "Z";

        if (cv <= xCv) {
            xyzClass = "X";
        } else if (cv <= yCv) {
            xyzClass = "Y";
        }

        result.push({
            urun_id: product.urun_id,
            urun_adi: product.urun_adi,
            total,
            average: avg,
            stddev: sd,
            cv,
            xyz_class: xyzClass,
        });
    }

    return result.sort((a, b) => b.total - a.total);
}

function abcXyz(params = {}) {
    const abcRows = abc(params);
    const xyzRows = xyz(params);

    const xyzMap = new Map();
    for (const row of xyzRows) {
        xyzMap.set(row.urun_id, row);
    }

    const result = [];

    for (const a of abcRows) {
        const x = xyzMap.get(a.urun_id);

        if (!x) continue;

        result.push({
            urun_id: a.urun_id,
            urun_adi: a.urun_adi,

            abc_class: a.abc_class,
            xyz_class: x.xyz_class,
            matrix_class: `${a.abc_class}${x.xyz_class}`,

            abc_metric: a.metric_value,
            abc_cumulative_percent: a.cumulative_percent,

            xyz_total: x.total,
            xyz_average: x.average,
            xyz_stddev: x.stddev,
            xyz_cv: x.cv,

            revenue: a.revenue,
            profit: a.profit,
            qty: a.qty,
        });
    }

    return result.sort((a, b) => {
        if (a.matrix_class === b.matrix_class) {
            return Number(b.abc_metric || 0) - Number(a.abc_metric || 0);
        }

        return a.matrix_class.localeCompare(b.matrix_class);
    });
}

function minimumPriceViolations(params = {}) {
    const where = [
        "t.source_type = 'fatura'",
        "t.type_numeric = 201",
        "COALESCE(t.sluj_is_yanlis, 0) = 0",
        "u.minimum_satis_fiyati > 0",
        "tl.unit_price_given < u.minimum_satis_fiyati",
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
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_adi,
      COALESCE(s.adi, t.sluj_satici_id, 'Без продавца') AS satici_adi,
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS depo_adi,

      tl.urun_id,
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS urun_adi,

      tl.unit_price_given,
      u.minimum_satis_fiyati,
      tl.base_unit_qty_total,

      (u.minimum_satis_fiyati - tl.unit_price_given) AS diff_per_unit,
      ((u.minimum_satis_fiyati - tl.unit_price_given) * tl.base_unit_qty_total) AS loss_amount
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN urun u ON u.id = tl.urun_id
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    LEFT JOIN kagent s ON s.id = t.sluj_satici_id
    LEFT JOIN depo d ON d.id = t.id_depo1
    WHERE ${where.join(" AND ")}
    ORDER BY datetime(t.operation_date) DESC
    LIMIT ?
  `).all(...values, params.limit || 500);
}

function slowMoving(params = {}) {
    const days = Number(params.days || 90);

    return db.prepare(`
    SELECT
      u.id AS urun_id,
      u.adi AS urun_adi,

      COALESCE(stock.qty, 0) AS current_stock,
      last_sale.last_sale_date,
      COALESCE(sales.qty_sold, 0) AS qty_sold,
      COALESCE(sales.revenue, 0) AS revenue,

      CAST(julianday('now') - julianday(last_sale.last_sale_date) AS INTEGER) AS days_without_sale
    FROM urun u

    LEFT JOIN (
      SELECT
        tl.urun_id,
        SUM(tl.base_unit_qty_total * tt.warehouse_1_effect_ratio) AS qty
      FROM transaction_lines tl
      JOIN transactions t ON t.id = tl.transaction_id
      JOIN transaction_type tt
        ON tt.source_type = t.source_type
       AND tt.type_numeric = t.type_numeric
      WHERE COALESCE(t.sluj_is_yanlis, 0) = 0
      GROUP BY tl.urun_id
    ) stock ON stock.urun_id = u.id

    LEFT JOIN (
      SELECT
        tl.urun_id,
        MAX(t.operation_date) AS last_sale_date
      FROM transaction_lines tl
      JOIN transactions t ON t.id = tl.transaction_id
      WHERE t.source_type = 'fatura'
        AND t.type_numeric = 201
        AND COALESCE(t.sluj_is_yanlis, 0) = 0
      GROUP BY tl.urun_id
    ) last_sale ON last_sale.urun_id = u.id

    LEFT JOIN (
      SELECT
        tl.urun_id,
        SUM(tl.base_unit_qty_total) AS qty_sold,
        SUM(tl.line_total) AS revenue
      FROM transaction_lines tl
      JOIN transactions t ON t.id = tl.transaction_id
      WHERE t.source_type = 'fatura'
        AND t.type_numeric = 201
        AND COALESCE(t.sluj_is_yanlis, 0) = 0
        AND datetime(t.operation_date) >= datetime('now', '-' || ? || ' days')
      GROUP BY tl.urun_id
    ) sales ON sales.urun_id = u.id

    WHERE COALESCE(stock.qty, 0) > 0
      AND (
        last_sale.last_sale_date IS NULL
        OR datetime(last_sale.last_sale_date) < datetime('now', '-' || ? || ' days')
      )

    ORDER BY current_stock DESC
    LIMIT ?
  `).all(days, days, params.limit || 500);
}

function deadStock(params = {}) {
  const days = Number(params.days || 180);

  return db.prepare(`
    SELECT
      u.id AS urun_id,
      u.adi AS urun_adi,

      COALESCE(stock.qty, 0) AS current_stock,
      last_sale.last_sale_date,

      CASE
        WHEN last_sale.last_sale_date IS NULL THEN NULL
        ELSE CAST(julianday('now') - julianday(last_sale.last_sale_date) AS INTEGER)
      END AS days_without_sale

    FROM urun u

    LEFT JOIN (
      SELECT
        tl.urun_id,
        SUM(tl.base_unit_qty_total * tt.warehouse_1_effect_ratio) AS qty
      FROM transaction_lines tl
      JOIN transactions t ON t.id = tl.transaction_id
      JOIN transaction_type tt
        ON tt.source_type = t.source_type
       AND tt.type_numeric = t.type_numeric
      WHERE COALESCE(t.sluj_is_yanlis, 0) = 0
      GROUP BY tl.urun_id
    ) stock ON stock.urun_id = u.id

    LEFT JOIN (
      SELECT
        tl.urun_id,
        MAX(t.operation_date) AS last_sale_date
      FROM transaction_lines tl
      JOIN transactions t ON t.id = tl.transaction_id
      WHERE t.source_type = 'fatura'
        AND t.type_numeric = 201
        AND COALESCE(t.sluj_is_yanlis, 0) = 0
      GROUP BY tl.urun_id
    ) last_sale ON last_sale.urun_id = u.id

    WHERE COALESCE(stock.qty, 0) > 0
      AND (
        last_sale.last_sale_date IS NULL
        OR datetime(last_sale.last_sale_date) < datetime('now', '-' || ? || ' days')
      )

    ORDER BY
      last_sale.last_sale_date IS NULL DESC,
      days_without_sale DESC,
      current_stock DESC
    LIMIT ?
  `).all(days, params.limit || 500);
}

module.exports = {
    abc,
    xyz,
    abcXyz,
    minimumPriceViolations,
    slowMoving,
    deadStock,
};