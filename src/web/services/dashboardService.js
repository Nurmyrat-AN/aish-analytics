const db = require("../../config/sqlite");
const CurrencyService = require("../../currency/CurrencyService");
const { getDateRange } = require("../utils/dateRange");

const BASE_CURRENCY_ID = "z_walyuta-1";

function getBaseCurrencyName() {
    const row = db.prepare(`
    SELECT adi
    FROM z_walyuta
    WHERE id = ?
  `).get(BASE_CURRENCY_ID);

    return row?.adi || "mnt";
}

function getTodayRange() {
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
        from: start.toISOString(),
        to: end.toISOString(),
    };
}

function getSalesSummary(from, to) {
    const row = db.prepare(`
    SELECT
      COALESCE(SUM(t.amount), 0) AS total_sales,
      COUNT(*) AS check_count
    FROM transactions t
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
  `).get(from, to);

    const totalSales = row.total_sales || 0;
    const checkCount = row.check_count || 0;

    return {
        totalSales,
        checkCount,
        avgCheck: checkCount > 0 ? totalSales / checkCount : 0,
    };
}

function getProfitCard(from, to) {
    const row = db.prepare(`
    SELECT
      COALESCE(SUM(
        tl.line_total - (tl.purchase_price_at_card * tl.base_unit_qty_total)
      ), 0) AS profit
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
  `).get(from, to);

    return row.profit || 0;
}

function getReturns(from, to) {
    const row = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE source_type = 'fatura'
      AND type_numeric IN (102, 202)
      AND COALESCE(sluj_is_yanlis, 0) = 0
      AND datetime(operation_date) BETWEEN datetime(?) AND datetime(?)
  `).get(from, to);

    return row.total || 0;
}

function getSalesByWarehouse(from, to) {
    return db.prepare(`
    SELECT
      COALESCE(d.adi, t.id_depo1, 'Без склада') AS name,
      COALESCE(SUM(t.amount), 0) AS amount
    FROM transactions t
    LEFT JOIN depo d ON d.id = t.id_depo1
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
    GROUP BY t.id_depo1
    ORDER BY amount DESC
    LIMIT 10
  `).all(from, to);
}

function getCashBalances() {
    const rows = db.prepare(`
    SELECT
      t.id_account1 AS defter_id,
      COALESCE(d.adi, t.id_account1, 'Без кассы') AS defter_name,
      COALESCE(d.id_walyuta, ?) AS currency_id,
      COALESCE(w.adi, 'mnt') AS currency_name,
      COALESCE(SUM(t.amount * tt.book_1_effect_ratio), 0) AS balance
    FROM transactions t
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN defter d ON d.id = t.id_account1
    LEFT JOIN z_walyuta w ON w.id = d.id_walyuta
    WHERE t.source_type = 'kasa_islemi'
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND t.id_account1 IS NOT NULL
    GROUP BY t.id_account1
    ORDER BY balance DESC
  `).all(BASE_CURRENCY_ID);

    let totalBase = 0;

    for (const row of rows) {
        let rate = 1;

        try {
            rate = CurrencyService.getRate(
                row.currency_id || BASE_CURRENCY_ID,
                BASE_CURRENCY_ID,
                new Date().toISOString()
            );
        } catch {
            rate = 1;
        }

        row.balance_base = row.balance * rate;
        totalBase += row.balance_base;
    }

    return {
        totalBase,
        details: rows,
    };
}

function getCustomerDebt() {
    const rows = db.prepare(`
    SELECT
      t.id_kagent1 AS kagent_id,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_name,
      COALESCE(SUM(t.amount * tt.customer_1_effect_ratio), 0) AS balance
    FROM transactions t
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE COALESCE(t.sluj_is_yanlis, 0) = 0
      AND t.id_kagent1 IS NOT NULL
    GROUP BY t.id_kagent1
    HAVING ABS(balance) > 0.0001
    ORDER BY ABS(balance) DESC
    LIMIT 10
  `).all();

    const total = rows.reduce((sum, r) => sum + Number(r.balance || 0), 0);

    return {
        total,
        details: rows,
    };
}

function getNegativeStockCount() {
    const row = db.prepare(`
    SELECT COUNT(*) AS count
    FROM (
      SELECT
        tl.urun_id,
        t.id_depo1,
        SUM(tl.base_unit_qty_total * tt.warehouse_1_effect_ratio) AS qty
      FROM transaction_lines tl
      JOIN transactions t ON t.id = tl.transaction_id
      JOIN transaction_type tt
        ON tt.source_type = t.source_type
       AND tt.type_numeric = t.type_numeric
      WHERE COALESCE(t.sluj_is_yanlis, 0) = 0
        AND tl.urun_id IS NOT NULL
        AND t.id_depo1 IS NOT NULL
      GROUP BY tl.urun_id, t.id_depo1
      HAVING qty < 0
    )
  `).get();

    return row.count || 0;
}

function getBelowMinimumPrice(from, to) {
    const row = db.prepare(`
    SELECT
      COUNT(*) AS count,
      COALESCE(SUM((u.minimum_satis_fiyati - tl.unit_price_given) * tl.base_unit_qty_total), 0) AS loss_amount
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN urun u ON u.id = tl.urun_id
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND u.minimum_satis_fiyati > 0
      AND tl.unit_price_given < u.minimum_satis_fiyati
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
  `).get(from, to);

    return {
        count: row.count || 0,
        lossAmount: row.loss_amount || 0,
    };
}
function getSalesByDay(from, to) {
    return db.prepare(`
    SELECT
      date(operation_date) AS day,
      COALESCE(SUM(amount), 0) AS amount,
      COUNT(*) AS checks
    FROM transactions
    WHERE source_type = 'fatura'
      AND type_numeric = 201
      AND COALESCE(sluj_is_yanlis, 0) = 0
      AND datetime(operation_date) BETWEEN datetime(?) AND datetime(?)
    GROUP BY date(operation_date)
    ORDER BY day
  `).all(from, to);
}

function getTopProducts(from, to) {
    return db.prepare(`
    SELECT
      COALESCE(u.adi, tl.urun_id, 'Без товара') AS name,
      COALESCE(SUM(tl.line_total), 0) AS amount,
      COALESCE(SUM(tl.base_unit_qty_total), 0) AS qty
    FROM transaction_lines tl
    JOIN transactions t ON t.id = tl.transaction_id
    LEFT JOIN urun u ON u.id = tl.urun_id
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
    GROUP BY tl.urun_id
    ORDER BY amount DESC
    LIMIT 10
  `).all(from, to);
}

function getTopCustomers(from, to) {
    return db.prepare(`
    SELECT
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS name,
      COALESCE(SUM(t.amount), 0) AS amount,
      COUNT(*) AS checks
    FROM transactions t
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
    GROUP BY t.id_kagent1
    ORDER BY amount DESC
    LIMIT 10
  `).all(from, to);
}

function getTopSellers(from, to) {
    return db.prepare(`
    SELECT
      COALESCE(k.adi, t.sluj_hangi_terminalden_yapildi, 'Без продавца') AS name,
      COALESCE(SUM(t.amount), 0) AS amount,
      COUNT(*) AS checks
    FROM transactions t
    LEFT JOIN terminal k ON k.id = t.sluj_hangi_terminalden_yapildi
    WHERE t.source_type = 'fatura'
      AND t.type_numeric = 201
      AND COALESCE(t.sluj_is_yanlis, 0) = 0
      AND datetime(t.operation_date) BETWEEN datetime(?) AND datetime(?)
    GROUP BY t.sluj_hangi_terminalden_yapildi
    ORDER BY amount DESC
    LIMIT 10
  `).all(from, to);
}

function getLatestOperations() {
    return db.prepare(`
    SELECT
      t.operation_date,
      t.source_type,
      t.type_numeric,
      t.amount,
      t.kodu_txt,
      COALESCE(k.adi, t.id_kagent1, 'Без клиента') AS kagent_name
    FROM transactions t
    LEFT JOIN kagent k ON k.id = t.id_kagent1
    WHERE COALESCE(t.sluj_is_yanlis, 0) = 0
    ORDER BY datetime(t.operation_date) DESC
    LIMIT 20
  `).all();
}

function getDashboardData(period = "TODAY") {
    const { from, to } = getDateRange(period);

    const sales = getSalesSummary(from, to);
    const profit = getProfitCard(from, to);
    const returns = getReturns(from, to);
    const cash = getCashBalances();
    const debt = getCustomerDebt();
    const belowMin = getBelowMinimumPrice(from, to);

    const salesByDay = getSalesByDay(from, to)
    const topProducts = getTopProducts(from, to)
    const topCustomers = getTopCustomers(from, to)
    const topSellers = getTopSellers(from, to)
    const latestOperations = getLatestOperations()
    const negativeStockCount = getNegativeStockCount()

    return {
        period: { from, to },
        currencyName: getBaseCurrencyName(),

        cards: {
            sales,
            profit,
            returns,
            cash,
            debt,
            negativeStockCount,
            belowMin,
        },

        details: {
            salesByWarehouse: getSalesByWarehouse(from, to),
            cash: cash.details,
            debt: debt.details,
            salesByDay,
            topProducts,
            topCustomers,
            topSellers,
            latestOperations,
        },
    };
}

module.exports = {
    getDashboardData,
};