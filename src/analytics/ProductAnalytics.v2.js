const db = require("../config/sqlite");


function stock(params = {}) {
  const where = ["COALESCE(t.sluj_is_yanlis, 0) = 0", 'u.adi LIKE ?'];
  const values = ['%hdw%'];

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
      tl.urun_id AS urun_id,
      u.adi AS urun_adi,
      olc.adi AS urun_birim,
      d.adi AS depo_adi,
      COALESCE(SUM(tl.base_unit_qty_total * 
        CASE WHEN d.id = t.id_depo1 THEN tt.warehouse_1_effect_ratio
           WHEN d.id = t.id_depo2 THEN tt.warehouse_2_effect_ratio
           ELSE 0 END
      ), 0) AS qty,

      (
        SELECT json_group_array(barkod)
        FROM urun_barkod b
        WHERE b.urun_id = tl.urun_id
    ) AS barkod
    
    FROM urun u
    JOIN olc_umum olc ON olc.id=u.olcu_birimi
    JOIN transaction_lines tl ON tl.urun_id = u.id
    JOIN transactions t ON t.id = tl.transaction_id
    JOIN transaction_type tt
      ON tt.source_type = t.source_type
     AND tt.type_numeric = t.type_numeric
    LEFT JOIN depo d ON d.id = t.id_depo1 OR d.id = t.id_depo2
      
    WHERE ${where.join(" AND ")}

    GROUP BY u.id, d.id
    ORDER BY u.adi, d.adi
    `).all(...values).reduce((acc, row) => {
    const existing = acc.find(r => r.urun_id === row.urun_id);
    if (existing) {
      existing.qty += row.qty;
      existing.stoct.push({ depo_adi: row.depo_adi, qty: row.qty });
    } else {
      acc.push({
        urun_id: row.urun_id,
        urun_adi: row.urun_adi,
        urun_birim: row.urun_birim,
        barkod: JSON.parse(row.barkod),
        qty: row.qty,
        stoct: [{ depo_adi: row.depo_adi, qty: row.qty }]
      });
    }
    return acc;
  }, []);

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

module.exports = {
  stock,
};