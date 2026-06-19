function buildGraph(rows) {
  const graph = new Map();

  function addEdge(from, to, rate) {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from).push({ to, rate });
  }

  for (const row of rows) {
    addEdge(row.id_walyuta_from, row.id_walyuta_to, row.rate_current);
    addEdge(row.id_walyuta_to, row.id_walyuta_from, 1 / row.rate_current);
  }

  return graph;
}

function findRate(graph, from, to) {
  if (from === to) return 1;

  const queue = [{ currency: from, rate: 1 }];
  const visited = new Set([from]);

  while (queue.length) {
    const current = queue.shift();
    const edges = graph.get(current.currency) || [];

    for (const edge of edges) {
      if (visited.has(edge.to)) continue;

      const nextRate = current.rate * edge.rate;

      if (edge.to === to) {
        return nextRate;
      }

      visited.add(edge.to);
      queue.push({
        currency: edge.to,
        rate: nextRate,
      });
    }
  }

  return null;
}

module.exports = {
  buildGraph,
  findRate,
};