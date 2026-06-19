const {
  getDepoOptions,
  getKagentOptions,
  getUrunOptions,
  getSaticiOptions,
} = require("./FilterOptionsService");

class FilterBuilder {
  constructor(values = {}) {
    this.values = values;
    this.items = [];
  }

  period() {
    this.items.push({
      type: "select",
      name: "period",
      label: "Период",
      value: this.values.period || "THIS_MONTH",
      options: [
        ["TODAY", "Сегодня"],
        ["YESTERDAY", "Вчера"],
        ["THIS_MONTH", "Этот месяц"],
        ["LAST_30_DAYS", "Последние 30 дней"],
        ["LAST_90_DAYS", "Последние 90 дней"],
        ["LAST_180_DAYS", "Последние 180 дней"],
        ["LAST_365_DAYS", "Последние 365 дней"],
        ["ALL_TIME", "Всё время"],
      ],
    });

    return this;
  }

  depo() {
    this.items.push({
      type: "select",
      name: "depoId",
      label: "Склад",
      value: this.values.depoId || "",
      options: [["", "Все"], ...getDepoOptions().map(x => [x.id, x.adi])],
    });

    return this;
  }

  kagent() {
    this.items.push({
      type: "select",
      name: "kagentId",
      label: "Клиент",
      value: this.values.kagentId || "",
      options: [["", "Все"], ...getKagentOptions().map(x => [x.id, x.adi])],
    });

    return this;
  }

  urun() {
    this.items.push({
      type: "select",
      name: "urunId",
      label: "Товар",
      value: this.values.urunId || "",
      options: [["", "Все"], ...getUrunOptions().map(x => [x.id, x.adi])],
    });

    return this;
  }

  satici() {
    this.items.push({
      type: "select",
      name: "saticiId",
      label: "Продавец",
      value: this.values.saticiId || "",
      options: [["", "Все"], ...getSaticiOptions().map(x => [x.id, x.adi])],
    });

    return this;
  }

  hidden(name, value) {
    this.items.push({
      type: "hidden",
      name,
      value,
    });

    return this;
  }

  build(action) {
    return {
      action,
      items: this.items,
    };
  }
}

module.exports = FilterBuilder;