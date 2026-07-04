import type { AlgorithmTemplate } from '../core/types';

export const treeBfsNaive = `function buildTree(arr) {
  if (arr.length === 0) return null;
  const mid = Math.floor(arr.length / 2);
  return {
    value: arr[mid],
    children: [buildTree(arr.slice(0, mid)), buildTree(arr.slice(mid+1))].filter(Boolean)
  };
}
function bfs(root) {
  if (!root) return;
  const queue = [root];
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node.value);
    trace('visit', {
      data: { tree: root },
      highlights: order.slice(),
      description: 'BFS 访问节点 ' + node.value
    });
    if (node.children) node.children.forEach(c => queue.push(c));
  }
}
const values = Array.isArray(data) && data.length ? data : [1,2,3,4,5,6,7,8,9,10];
bfs(buildTree(values));
`;

export const treeDfsOptimized = `function buildTree(arr) {
  if (arr.length === 0) return null;
  const mid = Math.floor(arr.length / 2);
  return {
    value: arr[mid],
    children: [buildTree(arr.slice(0, mid)), buildTree(arr.slice(mid+1))].filter(Boolean)
  };
}
function dfs(node, order) {
  if (!node) return;
  order.push(node.value);
  trace('visit', {
    data: { tree: root },
    highlights: order.slice(),
    description: 'DFS 访问节点 ' + node.value
  });
  if (node.children) node.children.forEach(c => dfs(c, order));
}
const values = Array.isArray(data) && data.length ? data : [1,2,3,4,5,6,7,8,9,10];
const root = buildTree(values);
dfs(root, []);
`;

export const treeTemplates: AlgorithmTemplate[] = [
  {
    id: 'tree-bfs-vs-dfs',
    name: '二叉树 BFS vs DFS',
    category: 'tree',
    language: 'js',
    naiveCode: treeBfsNaive,
    optimizedCode: treeDfsOptimized,
    defaultData: [1,2,3,4,5,6,7,8,9,10],
  },
];
