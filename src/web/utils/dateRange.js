function toIsoStart(d) {
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function toIsoEnd(d) {
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function getDateRange(period = "TODAY") {
  const now = new Date();
  let from = new Date(now);
  let to = new Date(now);

  if (period === "YESTERDAY") {
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
  }

  if (period === "THIS_MONTH") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (period === "LAST_30_DAYS") {
    from.setDate(from.getDate() - 30);
  }

  if (period === "LAST_90_DAYS") {
    from.setDate(from.getDate() - 90);
  }

  if (period === "LAST_180_DAYS") {
    from.setDate(from.getDate() - 180);
  }

  if (period === "LAST_365_DAYS") {
    from.setDate(from.getDate() - 365);
  }

  if (period === "ALL_TIME") {
    from.setDate(from.getDate() - 1000 * 365);
  }

  return {
    from: toIsoStart(from),
    to: toIsoEnd(to),
    period,
  };
}

module.exports = { getDateRange };