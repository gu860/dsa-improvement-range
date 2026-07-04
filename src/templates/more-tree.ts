import type { AlgorithmTemplate } from '../core/types';

const defaultTree = {
  tree: {
    value: 1,
    left: {
      value: 2,
      left: { value: 4, left: null, right: null },
      right: { value: 5, left: null, right: null },
    },
    right: {
      value: 3,
      left: { value: 6, left: null, right: null },
      right: { value: 7, left: null, right: null },
    },
  },
};

const rootLine = `const root = data && data.tree ? data.tree : data;`;

export const treeHeightRec = `// 树高度（递归）
${rootLine}
function heightRec(node) {
  if (!node) return 0;
  const h = 1 + Math.max(heightRec(node.left), heightRec(node.right));
  trace('height', { data: { tree: root, current: node.value }, highlights: [node.value], description: \`节点 \${node.value} 高度=\${h}\` });
  return h;
}
const h = heightRec(root);
trace('done', { data: { tree: root }, description: \`树高度: \${h}\` });
`;

export const treeHeightBFS = `// 树高度（BFS 层序）
${rootLine}
function heightBFS(root) {
  if (!root) return 0;
  let queue = [root], h = 0;
  while (queue.length > 0) {
    const level = queue.map(n => n.value);
    trace('level', { data: { tree: root, array: level }, highlights: level, description: \`第 \${h + 1} 层: [\${level}]\` });
    const next = [];
    for (const n of queue) { if (n.left) next.push(n.left); if (n.right) next.push(n.right); }
    queue = next; h++;
  }
  trace('done', { data: { tree: root }, description: \`树高度: \${h}\` });
}
heightBFS(root);
`;

export const validateBSTNaive = `// 验证 BST（范围法）
${rootLine}
function isValidBST(node, min, max) {
  if (!node) return true;
  if ((min !== undefined && node.value <= min) || (max !== undefined && node.value >= max)) {
    trace('invalid', { data: { tree: root, current: node.value }, highlights: [node.value], description: \`节点 \${node.value} 不在 (\${min}, \${max}) 范围内\` });
    return false;
  }
  const ok = isValidBST(node.left, min, node.value) && isValidBST(node.right, node.value, max);
  trace('valid', { data: { tree: root, current: node.value }, highlights: [node.value], description: \`节点 \${node.value} 有效\` });
  return ok;
}
const ok = isValidBST(root, -Infinity, Infinity);
trace('done', { data: { tree: root }, description: ok ? '是 BST' : '不是 BST' });
`;

export const validateBSTInorder = `// 验证 BST（中序遍历）
${rootLine}
function isBSTInorder(root) {
  const vals = []; let prev = -Infinity;
  function inorder(n) {
    if (!n) return true;
    if (!inorder(n.left)) return false;
    if (n.value <= prev) {
      trace('invalid', { data: { tree: root, array: vals }, highlights: [n.value], description: \`中序不递增: \${prev} >= \${n.value}\` });
      return false;
    }
    prev = n.value; vals.push(n.value);
    trace('visit', { data: { tree: root, array: vals }, highlights: [n.value], description: \`中序访问: \${n.value}\` });
    return inorder(n.right);
  }
  const ok = inorder(root);
  trace('done', { data: { tree: root }, description: ok ? '是 BST' : '不是 BST' });
}
isBSTInorder(root);
`;

export const LCABrute = `// 最近公共祖先（路径收集）
${rootLine}
function LCA(root, p, q) {
  function findPath(node, target, path) {
    if (!node) return false; path.push(node.value);
    if (node.value === target) return true;
    if (findPath(node.left, target, path) || findPath(node.right, target, path)) return true;
    path.pop(); return false;
  }
  const pathP = [], pathQ = [];
  findPath(root, p, pathP); findPath(root, q, pathQ);
  trace('paths', { data: { tree: root, array: pathP }, highlights: pathP, description: \`p=\${p} 路径: [\${pathP}]\` });
  trace('paths', { data: { tree: root, array: pathQ }, highlights: pathQ, description: \`q=\${q} 路径: [\${pathQ}]\` });
  let lca = -1;
  for (let i = 0; i < Math.min(pathP.length, pathQ.length); i++) { if (pathP[i] === pathQ[i]) lca = pathP[i]; else break; }
  trace('done', { data: { tree: root, array: [lca] }, highlights: [lca], description: \`LCA: \${lca}\` });
}
LCA(root, 4, 5);
`;

export const LCARecursive = `// 最近公共祖先（递归）
${rootLine}
function LCA(node, p, q) {
  if (!node) return null;
  if (node.value === p || node.value === q) { trace('found', { data: { tree: root, current: node.value }, highlights: [node.value], description: \`找到 \${node.value}\` }); return node; }
  const left = LCA(node.left, p, q), right = LCA(node.right, p, q);
  if (left && right) { trace('lca', { data: { tree: root, current: node.value }, highlights: [node.value], description: \`LCA: \${node.value}\` }); return node; }
  const res = left || right;
  if (res) trace('propagate', { data: { tree: root, current: node.value }, highlights: [node.value, res.value], description: \`向上传递 \${res.value}\` });
  return res;
}
const lcaNode = LCA(root, 4, 5);
trace('done', { data: { tree: root }, highlights: lcaNode ? [lcaNode.value] : [], description: \`LCA: \${lcaNode ? lcaNode.value : 'null'}\` });
`;

export const traversalRecursive = `// 遍历（递归）
${rootLine}
function traversals(root) {
  const pre = [], ino = [], post = [];
  function dfs(n) { if (!n) return;
    pre.push(n.value);
    trace('pre', { data: { tree: root, array: pre }, highlights: [n.value], description: \`前序: \${n.value}\` });
    dfs(n.left);
    ino.push(n.value);
    trace('in', { data: { tree: root, array: ino }, highlights: [n.value], description: \`中序: \${n.value}\` });
    dfs(n.right);
    post.push(n.value);
    trace('post', { data: { tree: root, array: post }, highlights: [n.value], description: \`后序: \${n.value}\` });
  }
  dfs(root);
  trace('done', { data: { tree: root, array: pre }, highlights: pre, description: \`前序:[\${pre}] 中序:[\${ino}] 后序:[\${post}]\` });
}
traversals(root);
`;

export const traversalIterative = `// 遍历（迭代）
${rootLine}
function traversalsIter(root) {
  const pre = [], ino = [], post = []; const stack = [[root, 0]];
  while (stack.length > 0) {
    const [node, state] = stack.pop();
    if (!node) continue;
    if (state === 0) {
      pre.push(node.value);
      trace('pre', { data: { tree: root, array: pre }, highlights: [node.value], description: \`前序: \${node.value}\` });
      stack.push([node, 1]); stack.push([node.left, 0]);
    } else if (state === 1) {
      ino.push(node.value);
      trace('in', { data: { tree: root, array: ino }, highlights: [node.value], description: \`中序: \${node.value}\` });
      stack.push([node, 2]); stack.push([node.right, 0]);
    } else {
      post.push(node.value);
      trace('post', { data: { tree: root, array: post }, highlights: [node.value], description: \`后序: \${node.value}\` });
    }
  }
  trace('done', { data: { tree: root, array: pre }, highlights: pre, description: \`前序:[\${pre}] 中序:[\${ino}] 后序:[\${post}]\` });
}
traversalsIter(root);
`;

export const moreTreeTemplates: AlgorithmTemplate[] = [
  { id: 'tree-height', name: '树高度(递归) -> 树高度(BFS)', category: '树', language: 'js', naiveCode: treeHeightRec, optimizedCode: treeHeightBFS, defaultData: defaultTree },
  { id: 'validate-bst', name: '验证BST(范围) -> 验证BST(中序)', category: '树', language: 'js', naiveCode: validateBSTNaive, optimizedCode: validateBSTInorder, defaultData: defaultTree },
  { id: 'lca', name: 'LCA(路径收集) -> LCA(递归)', category: '树', language: 'js', naiveCode: LCABrute, optimizedCode: LCARecursive, defaultData: defaultTree },
  { id: 'traversals', name: '遍历(递归) -> 遍历(迭代)', category: '树', language: 'js', naiveCode: traversalRecursive, optimizedCode: traversalIterative, defaultData: defaultTree },
];
