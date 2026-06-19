const CurrencyService = require("./CurrencyService");

CurrencyService.initialize();

const rate = CurrencyService.getRate(
  "z_walyuta-dzchb_c3d4ed15-d445-4b57-bca3-7949b4eec0a5",
  "z_walyuta-1",
  "2025-12-28T20:00:00+05:00"
);

console.log("Rate:", rate);