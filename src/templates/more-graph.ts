import type { AlgorithmTemplate } from '../core/types';

const defaultGraph = { nodes: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }, { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' }], edges: [{ from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 2 }, { from: 1, to: 3, weight: 5 }, { from: 2, to: 1, weight: 1 }, { from: 2, to: 3, weight: 8 }, { from: 2, to: 4, weight: 10 }, { from: 3, to: 4, weight: 2 }, { from: 3, to: 5, weight: 6 }, { from: 4, to: 5, weight: 3 }] };

export const dijkstraNaive = `// Dijkstra（朴素）
const defaultGraph = { nodes: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }, { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' }], edges: [{ from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 2 }, { from: 1, to: 3, weight: 5 }, { from: 2, to: 1, weight: 1 }, { from: 2, to: 3, weight: 8 }, { from: 2, to: 4, weight: 10 }, { from: 3, to: 4, weight: 2 }, { from: 3, to: 5, weight: 6 }, { from: 4, to: 5, weight: 3 }] };
function dijkstra(graph, start) {
  const { nodes, edges } = graph;
  const n = nodes.length; const dist = new Array(n).fill(Infinity); dist[start] = 0;
  const visited = new Array(n).fill(false); const adj = Array.from({ length: n }, () => []);
  for (const e of edges) adj[e.from].push({ to: e.to, w: e.weight });
  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let j = 0; j < n; j++) { if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j; }
    if (dist[u] === Infinity) break; visited[u] = true;
    for (const { to, w } of adj[u]) {
      if (!visited[to] && dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        trace('relax', { data: { ...graph }, highlights: [u, to], pointers: { u, to }, description: \`松弛 \${nodes[u].label}->\${nodes[to].label}: dist=\${dist[to]}\` });
      }
    }
    trace('visit', { data: { ...graph }, highlights: [u], description: \`访问 \${nodes[u].label}, dist=\${dist[u]}\` });
  }
  trace('done', { data: { ...graph, graph }, highlights: nodes.map((_, idx) => idx), description: \`最短路径: [\${dist}]\` });
}
const graph = data && Array.isArray(data.nodes) && data.nodes.length ? data : defaultGraph;
dijkstra(graph, 0);
`;

export const dijkstraPQ = `// Dijkstra（优先队列）
const defaultGraph = { nodes: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }, { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' }], edges: [{ from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 2 }, { from: 1, to: 3, weight: 5 }, { from: 2, to: 1, weight: 1 }, { from: 2, to: 3, weight: 8 }, { from: 2, to: 4, weight: 10 }, { from: 3, to: 4, weight: 2 }, { from: 3, to: 5, weight: 6 }, { from: 4, to: 5, weight: 3 }] };
function dijkstraPQ(graph, start) {
  const { nodes, edges } = graph; const n = nodes.length;
  const dist = new Array(n).fill(Infinity); dist[start] = 0;
  const adj = Array.from({ length: n }, () => []);
  for (const e of edges) adj[e.from].push({ to: e.to, w: e.weight });
  const pq = [[0, start]];
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    trace('visit', { data: { ...graph }, highlights: [u], description: \`弹出 \${nodes[u].label}, dist=\${d}\` });
    for (const { to, w } of adj[u]) {
      if (dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w; pq.push([dist[to], to]);
        trace('relax', { data: { ...graph }, highlights: [u, to], description: \`更新 \${nodes[to].label}->\${dist[to]}\` });
      }
    }
  }
  trace('done', { data: { ...graph, graph }, highlights: nodes.map((_, idx) => idx), description: \`最短路径: [\${dist}]\` });
}
const graph = data && Array.isArray(data.nodes) && data.nodes.length ? data : defaultGraph;
dijkstraPQ(graph, 0);
`;

export const primNaive = `// Prim（朴素）
const defaultGraph = { nodes: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }, { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' }], edges: [{ from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 2 }, { from: 1, to: 3, weight: 5 }, { from: 2, to: 1, weight: 1 }, { from: 2, to: 3, weight: 8 }, { from: 2, to: 4, weight: 10 }, { from: 3, to: 4, weight: 2 }, { from: 3, to: 5, weight: 6 }, { from: 4, to: 5, weight: 3 }] };
function primNaive(graph) {
  const { nodes, edges } = graph; const n = nodes.length;
  const adj = Array.from({ length: n }, () => []);
  for (const e of edges) adj[e.from].push({ to: e.to, w: e.weight });
  const key = new Array(n).fill(Infinity); key[0] = 0;
  const parent = new Array(n).fill(-1); const inMST = new Array(n).fill(false);
  for (let count = 0; count < n - 1; count++) {
    let u = -1;
    for (let i = 0; i < n; i++) { if (!inMST[i] && (u === -1 || key[i] < key[u])) u = i; }
    inMST[u] = true;
    for (const { to, w } of adj[u]) { if (!inMST[to] && w < key[to]) { key[to] = w; parent[to] = u; } }
    trace('add', { data: { ...graph }, highlights: [u, parent[u]], description: \`加入 \${nodes[u].label}, parent=\${parent[u] >= 0 ? nodes[parent[u]].label : '-'}\` });
  }
  trace('done', { data: { graph }, description: 'MST 构建完成' });
}
const graph = data && Array.isArray(data.nodes) && data.nodes.length ? data : defaultGraph;
primNaive(graph);
`;

export const primHeap = `// Prim（堆优化）
const defaultGraph = { nodes: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }, { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' }], edges: [{ from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 2 }, { from: 1, to: 3, weight: 5 }, { from: 2, to: 1, weight: 1 }, { from: 2, to: 3, weight: 8 }, { from: 2, to: 4, weight: 10 }, { from: 3, to: 4, weight: 2 }, { from: 3, to: 5, weight: 6 }, { from: 4, to: 5, weight: 3 }] };
function primHeap(graph) {
  const { nodes, edges } = graph; const n = nodes.length;
  const adj = Array.from({ length: n }, () => []);
  for (const e of edges) adj[e.from].push({ to: e.to, w: e.weight });
  const key = new Array(n).fill(Infinity); key[0] = 0;
  const parent = new Array(n).fill(-1); const inMST = new Array(n).fill(false);
  const pq = [[0, 0]];
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [k, u] = pq.shift();
    if (inMST[u]) continue; inMST[u] = true;
    trace('add', { data: { ...graph }, highlights: [u], description: \`加入 \${nodes[u].label}, key=\${k}\` });
    for (const { to, w } of adj[u]) { if (!inMST[to] && w < key[to]) { key[to] = w; parent[to] = u; pq.push([w, to]); } }
  }
  trace('done', { data: { graph }, description: 'MST 构建完成' });
}
const graph = data && Array.isArray(data.nodes) && data.nodes.length ? data : defaultGraph;
primHeap(graph);
`;

export const unionFindQuick = `// 并查集 - QuickFind
function quickFind(ops) {
  const n = 8; let parent = Array.from({ length: n }, (_, i) => i);
  function find(x) { return parent[x]; }
  function union(x, y) {
    const rx = find(x), ry = find(y);
    if (rx === ry) return;
    for (let i = 0; i < n; i++) { if (parent[i] === ry) parent[i] = rx; }
    trace('union', { data: { array: parent }, highlights: [x, y], description: \`合并 \${x} 和 \${y}: [\${parent}]\` });
  }
  for (const [a, b] of ops) union(a, b);
  trace('done', { data: { array: parent }, description: \'最终 parent\' });
}
const ops = Array.isArray(data) && data.length ? data : [[0,1],[2,3],[4,5],[6,7],[0,2],[4,6],[0,4]];
quickFind(ops);
`;

export const unionFindPC = `// 并查集 - 路径压缩+按秩合并
function ufPC(ops) {
  const n = 8; const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  function find(x) {
    if (parent[x] !== x) { parent[x] = find(parent[x]); trace('compress', { data: { array: parent }, highlights: [x], description: \`路径压缩: \${x}->\${parent[x]}\` }); }
    return parent[x];
  }
  function union(x, y) {
    let rx = find(x), ry = find(y);
    if (rx === ry) return;
    if (rank[rx] < rank[ry]) [rx, ry] = [ry, rx];
    parent[ry] = rx; if (rank[rx] === rank[ry]) rank[rx]++;
    trace('union', { data: { array: parent }, highlights: [x, y], description: \`合并 \${x} 和 \${y}, rank=\${rank[rx]}\` });
  }
  for (const [a, b] of ops) union(a, b);
  trace('done', { data: { array: parent }, description: \'最终 parent\' });
}
const ops = Array.isArray(data) && data.length ? data : [[0,1],[2,3],[4,5],[6,7],[0,2],[4,6],[0,4]];
ufPC(ops);
`;

export const moreGraphTemplates: AlgorithmTemplate[] = [
  { id: 'dijkstra', name: 'Dijkstra(朴素) → Dijkstra(堆)', category: '图', language: 'js', naiveCode: dijkstraNaive, optimizedCode: dijkstraPQ, defaultData: defaultGraph },
  { id: 'prim', name: 'Prim(朴素) → Prim(堆)', category: '图', language: 'js', naiveCode: primNaive, optimizedCode: primHeap, defaultData: defaultGraph },
  { id: 'union-find', name: '并查集(QuickFind) → 并查集(路径压缩)', category: '图', language: 'js', naiveCode: unionFindQuick, optimizedCode: unionFindPC, defaultData: [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [4, 6], [0, 4]] },
];
