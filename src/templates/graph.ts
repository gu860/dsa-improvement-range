import type { AlgorithmTemplate } from '../core/types';

export const bfsNaive = `function bfs(graph, start) {
  const visited = new Set();
  const order = [];
  const queue = [start];
  visited.add(start);
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    trace('visit', {
      data: { graph: { nodes: graph.nodes, edges: graph.edges } },
      highlights: order.slice(),
      pointers: { current: node, queueLen: queue.length },
      description: 'BFS 探索节点 ' + node
    });
    for (const e of graph.edges) {
      if (e.from === node && !visited.has(e.to)) {
        visited.add(e.to);
        queue.push(e.to);
      }
    }
  }
}
const defaultGraph = { nodes: [{id:0,label:'A'},{id:1,label:'B'},{id:2,label:'C'},{id:3,label:'D'},{id:4,label:'E'},{id:5,label:'F'}],
  edges: [{from:0,to:1,weight:2},{from:0,to:2,weight:4},{from:1,to:3,weight:3},{from:2,to:3,weight:1},{from:2,to:4,weight:5},{from:3,to:5,weight:2},{from:4,to:5,weight:1}] };
const graph = data && Array.isArray(data.nodes) && data.nodes.length ? data : defaultGraph;
bfs(graph, 0);
`;

export const dfsOptimized = `function dfs(graph, start) {
  const visited = new Set();
  const order = [];
  function explore(node) {
    visited.add(node);
    order.push(node);
    trace('visit', {
      data: { graph: { nodes: graph.nodes, edges: graph.edges } },
      highlights: order.slice(),
      pointers: { current: node },
      description: 'DFS 探索节点 ' + node
    });
    for (const e of graph.edges) {
      if (e.from === node && !visited.has(e.to)) {
        explore(e.to);
      }
    }
  }
  explore(start);
}
const defaultGraph = { nodes: [{id:0,label:'A'},{id:1,label:'B'},{id:2,label:'C'},{id:3,label:'D'},{id:4,label:'E'},{id:5,label:'F'}],
  edges: [{from:0,to:1,weight:2},{from:0,to:2,weight:4},{from:1,to:3,weight:3},{from:2,to:3,weight:1},{from:2,to:4,weight:5},{from:3,to:5,weight:2},{from:4,to:5,weight:1}] };
const graph = data && Array.isArray(data.nodes) && data.nodes.length ? data : defaultGraph;
dfs(graph, 0);
`;

export const graphTemplates: AlgorithmTemplate[] = [
  {
    id: 'bfs-vs-dfs',
    name: 'BFS vs DFS 图遍历',
    category: 'graph',
    language: 'js',
    naiveCode: bfsNaive,
    optimizedCode: dfsOptimized,
    defaultData: { nodes: [{id:0,label:'A'},{id:1,label:'B'},{id:2,label:'C'},{id:3,label:'D'},{id:4,label:'E'},{id:5,label:'F'}], edges: [{from:0,to:1,weight:2},{from:0,to:2,weight:4},{from:1,to:3,weight:3},{from:2,to:3,weight:1},{from:2,to:4,weight:5},{from:3,to:5,weight:2},{from:4,to:5,weight:1}] },
  },
];
