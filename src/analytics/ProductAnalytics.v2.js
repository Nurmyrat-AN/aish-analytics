const db = require("../config/sqlite");


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
      tl.urun_id AS urun_id,
      u.adi AS urun_adi,
      olc.adi AS urun_birim,
      d.adi AS depo_adi,
      COALESCE(SUM(tl.base_unit_qty_total * 
        CASE WHEN d.id = t.id_depo1 THEN tt.warehouse_1_effect_ratio
           WHEN d.id = t.id_depo2 AND tt.type_numeric=601 THEN tt.warehouse_2_effect_ratio
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
      if (row.qty > 0) {
        existing.stoct.push({ depo_adi: row.depo_adi, qty: row.qty });
      }
    } else {
      acc.push({
        urun_id: row.urun_id,
        urun_adi: row.urun_adi,
        urun_birim: row.urun_birim,
        barkod: JSON.parse(row.barkod),
        qty: row.qty,
        stoct: row.qty > 0 ? [{ depo_adi: row.depo_adi, qty: row.qty }] : []
      });
    }
    return acc;
  }, []);
}

function transactions(params = {}) {
  const where = ["COALESCE(t.sluj_is_yanlis, 0) = 0"];
  const values = [];

  if (!params.urunId) {
    throw "No urun id"
  }

  if (params.depoId) {
    where.push("t.id_depo1 = ?");
    values.push(params.depoId);
  }

  return db.prepare(`
      SELECT 
      
      t.kodu_txt,
      tt.type_name,
      t.type_numeric,
      tl.base_unit_qty_total,
      d1.adi depo1,
      d2.adi depo2,
      t.operation_date date,
      (
        SELECT SUM(itl.base_unit_qty_total * 
          (
            CASE WHEN itt.type_numeric=601 THEN 0
            
            ELSE  itt.warehouse_1_effect_ratio END
          )
        ) 
        FROM transaction_lines itl
        JOIN transactions it ON it.id = itl.transaction_id
        JOIN transaction_type itt
          ON itt.source_type = it.source_type
          AND itt.type_numeric = it.type_numeric

        
        WHERE itl.urun_id = ? AND it.operation_date<=t.operation_date AND it.sluj_is_yanlis=0
      ) AS ost

      FROM transaction_lines tl
      JOIN transactions t ON t.id = tl.transaction_id
      JOIN transaction_type tt
        ON tt.source_type = t.source_type
      AND tt.type_numeric = t.type_numeric
      JOIN depo d1 ON t.id_depo1=d1.id
      JOIN depo d2 ON t.id_depo2=d2.id

      WHERE tl.urun_id= ? AND t.sluj_is_yanlis=0

      ORDER BY t.operation_date DESC
    `).all(params.urunId, params.urunId);
}

module.exports = {
  stock,
  transactions
};