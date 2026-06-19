const db = require("../config/sqlite");

const EFFECT_RATIO = {
  increase: 1,
  decrease: -1,
  nochange: 0,
};

const transactionTypes = [
  // fatura
  ["fatura", 101, "Inbound/Purchase", "In./Purch.", "decrease", "nochange", "increase", "nochange", "increase", "nochange"],
  ["fatura", 102, "Inbound/Return", "In./Rtrn", "decrease", "nochange", "increase", "nochange", "increase", "nochange"],
  ["fatura", 103, "Inbound/Other", "In./Other", "decrease", "nochange", "increase", "nochange", "increase", "nochange"],
  ["fatura", 201, "Outbound/Sale", "Out./Sale", "decrease", "nochange", "decrease", "nochange", "decrease", "nochange"],
  ["fatura", 202, "Outbound/Return", "Out./Rtrn.", "decrease", "nochange", "decrease", "nochange", "decrease", "nochange"],
  ["fatura", 203, "Outbound/Expense", "Out./Expn", "decrease", "nochange", "decrease", "nochange", "decrease", "nochange"],
  ["fatura", 204, "Outbound/Other", "Out./Othr.", "decrease", "nochange", "decrease", "nochange", "decrease", "nochange"],
  ["fatura", 601, "Warehouse to warehouse transfer", "Wrhs. trnsf.", "nochange", "nochange", "decrease", "nochange", "decrease", "increase"],

  // kasa_islemi
  ["kasa_islemi", 101, "Inbound/Payment", "In./Paym", "increase", "nochange", "increase", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 102, "Inbound/Deposit", "In./Dpst", "increase", "nochange", "decrease", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 103, "Inbound/Loan", "In./Loan", "increase", "nochange", "increase", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 104, "Inbound/Other", "In./Other", "increase", "nochange", "increase", "nochange", "nochange", "nochange"],

  ["kasa_islemi", 201, "Outbound/Payment", "Out./Paym.", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 202, "Outbound/Expense", "Out./Expns", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 203, "Outbound/Loan", "Out./Loan", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 204, "Outbound/Other", "Out./Other", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],

  ["kasa_islemi", 400, "Book to book transfer", "Book transf.", "decrease", "increase", "nochange", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 500, "Customer to customer transfer", "Customer transf.", "decrease", "decrease", "increase", "decrease", "nochange", "nochange"],

  ["kasa_islemi", 1001, "Initial balance: Credit", "Init./Crdt.", "decrease", "nochange", "increase", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 1002, "Initial balance: Debt", "Init./Debt", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],

  ["kasa_islemi", 1101, "Inbound product cheapened", "In. prdc. chp.", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 1102, "Inbound product's price increased", "In. prdc. prc. incr", "decrease", "nochange", "increase", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 1201, "Outbound product cheapened", "Out prdc. chp.", "decrease", "nochange", "increase", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 1202, "Outbound product's price increased", "Out. prdc. prc. incr.", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],

  ["kasa_islemi", 1301, "Service provided (sold)", "Srv. prov.", "decrease", "nochange", "decrease", "nochange", "nochange", "nochange"],
  ["kasa_islemi", 1302, "Service received (bought)", "Srv. recv.", "decrease", "nochange", "increase", "nochange", "nochange", "nochange"],
];

const insert = db.prepare(`
  INSERT INTO transaction_type (
    source_type,
    type_numeric,
    type_name,
    type_short,

    book_1_effect,
    book_1_effect_ratio,
    book_2_effect,
    book_2_effect_ratio,

    customer_1_effect,
    customer_1_effect_ratio,
    customer_2_effect,
    customer_2_effect_ratio,

    warehouse_1_effect,
    warehouse_1_effect_ratio,
    warehouse_2_effect,
    warehouse_2_effect_ratio,

    include_in_analytics
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  ON CONFLICT(source_type, type_numeric)
  DO UPDATE SET
    type_name = excluded.type_name,
    type_short = excluded.type_short,

    book_1_effect = excluded.book_1_effect,
    book_1_effect_ratio = excluded.book_1_effect_ratio,
    book_2_effect = excluded.book_2_effect,
    book_2_effect_ratio = excluded.book_2_effect_ratio,

    customer_1_effect = excluded.customer_1_effect,
    customer_1_effect_ratio = excluded.customer_1_effect_ratio,
    customer_2_effect = excluded.customer_2_effect,
    customer_2_effect_ratio = excluded.customer_2_effect_ratio,

    warehouse_1_effect = excluded.warehouse_1_effect,
    warehouse_1_effect_ratio = excluded.warehouse_1_effect_ratio,
    warehouse_2_effect = excluded.warehouse_2_effect,
    warehouse_2_effect_ratio = excluded.warehouse_2_effect_ratio,
    include_in_analytics = 1
`);

const run = db.transaction(() => {
  for (const row of transactionTypes) {
    const [
      sourceType,
      typeNumeric,
      typeName,
      typeShort,
      book1,
      book2,
      customer1,
      customer2,
      warehouse1,
      warehouse2,
    ] = row;

    insert.run(
      sourceType,
      typeNumeric,
      typeName,
      typeShort,

      book1,
      EFFECT_RATIO[book1],
      book2,
      EFFECT_RATIO[book2],

      customer1,
      EFFECT_RATIO[customer1],
      customer2,
      EFFECT_RATIO[customer2],

      warehouse1,
      EFFECT_RATIO[warehouse1],
      warehouse2,
      EFFECT_RATIO[warehouse2]
    );
  }
});

run();

console.log("transaction_type seeded successfully");