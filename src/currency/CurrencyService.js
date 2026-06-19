const { loadRates } = require("./CurrencyRepository");
const { buildGraph, findRate } = require("./CurrencyGraph");

class CurrencyService {
  constructor() {
    this.rates = [];
    this.graphCache = new Map();
    this.rateCache = new Map();
    this.initialized = false;
  }

  initialize() {
    this.rates = loadRates();
    this.graphCache.clear();
    this.rateCache.clear();
    this.initialized = true;

    console.log(`CurrencyService initialized. Rates loaded: ${this.rates.length}`);
  }

  normalizeDate(date) {
    if (!date) {
      throw new Error("Currency date is required");
    }

    return new Date(date).toISOString();
  }

  getRate(from, to, date) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!from || !to) {
      throw new Error("Currency from/to is required");
    }

    if (from === to) return 1;

    const normalizedDate = this.normalizeDate(date);
    const rateCacheKey = `${from}|${to}|${normalizedDate}`;

    if (this.rateCache.has(rateCacheKey)) {
      return this.rateCache.get(rateCacheKey);
    }

    const graph = this.getGraphForDate(normalizedDate);
    const rate = findRate(graph, from, to);

    if (!rate) {
      throw new Error(`Currency rate not found: ${from} -> ${to} at ${normalizedDate}`);
    }

    this.rateCache.set(rateCacheKey, rate);

    return rate;
  }

  getGraphForDate(normalizedDate) {
    if (this.graphCache.has(normalizedDate)) {
      return this.graphCache.get(normalizedDate);
    }

    const latestByPair = new Map();

    for (const row of this.rates) {
      const rowDate = this.normalizeDate(row.kurs_tarih);

      if (rowDate > normalizedDate) continue;

      const pairKey = `${row.id_walyuta_from}|${row.id_walyuta_to}`;
      const existing = latestByPair.get(pairKey);

      if (!existing || this.normalizeDate(existing.kurs_tarih) < rowDate) {
        latestByPair.set(pairKey, row);
      }
    }

    const snapshotRows = Array.from(latestByPair.values());
    const graph = buildGraph(snapshotRows);

    this.graphCache.set(normalizedDate, graph);

    return graph;
  }

  clearCache() {
    this.graphCache.clear();
    this.rateCache.clear();
  }

  reload() {
    this.initialize();
  }
}

module.exports = new CurrencyService();