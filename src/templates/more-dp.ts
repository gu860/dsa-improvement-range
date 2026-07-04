import type { AlgorithmTemplate } from '../core/types';

export const lcsRecursive = `// 最长公共子序列（递归）
function lcsRec(a, b) {
  function L(i, j) {
    if (i < 0 || j < 0) return 0;
    if (a[i] === b[j]) {
      trace('match', { data: { array: [i, j] }, highlights: [i], description: \`匹配 a[\${i}]=\${a[i]}\` });
      return L(i - 1, j - 1) + 1;
    }
    return Math.max(L(i - 1, j), L(i, j - 1));
  }
  const res = L(a.length - 1, b.length - 1);
  trace('done', { data: { array: [] }, description: \`LCS长度: \${res}\` });
}
lcsRec(data.text1.split(''), data.text2.split(''));
`;

export const lcsDP = `// 最长公共子序列（DP）
function lcsDP(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      trace('cell', { data: { matrix: dp.map(row => [...row]) }, highlights: [i, j], pointers: { i, j }, description: \`dp[\${i}][\${j}]=\${dp[i][j]}\` });
    }
    trace('row', { data: { matrix: dp }, highlights: [i], description: \'填充DP表第 \${i} 行\' });
  }
  trace('done', { data: { matrix: dp }, description: \`LCS长度: \${dp[m][n]}\` });
}
lcsDP(data.text1.split(''), data.text2.split(''));
`;

export const coinChangeRecursive = `// 零钱兑换（递归）
function coinChangeRec(coins, amount) {
  function cc(rem) {
    if (rem < 0) return Infinity;
    if (rem === 0) return 0;
    let min = Infinity;
    for (const c of coins) {
      const sub = cc(rem - c) + 1;
      if (sub < min) min = sub;
      trace('try', { data: { array: [rem, rem - c] }, description: \`余额\${rem} 尝试硬币\${c}, 返回\${sub}\` });
    }
    return min;
  }
  const res = cc(amount);
  trace('done', { data: { array: [] }, description: \`最少硬币数: \${res}\` });
}
coinChangeRec(data, 11);
`;

export const coinChangeDP = `// 零钱兑换（DP）
function coinChangeDP(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0;
  const view = () => dp.map(v => v === Infinity ? -1 : v);
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (i >= c) dp[i] = Math.min(dp[i], dp[i - c] + 1);
      trace('try-coin', { data: { array: view() }, highlights: [i], pointers: { amount: i, coin: c, from: i - c }, description: \`amount=\${i}, coin=\${c}, dp[\${i}]=\${dp[i]}\` });
    }
    trace('calc', { data: { array: view() }, highlights: [i], description: \`dp[\${i}]=\${dp[i]}\` });
  }
  trace('done', { data: { array: view() }, description: \`最少硬币数: \${dp[amount]}\` });
}
coinChangeDP(data, 11);
`;

export const editDistanceRec = `// 编辑距离（递归）
function editDistRec(a, b) {
  function ed(i, j) {
    if (i === 0) return j; if (j === 0) return i;
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    const res = Math.min(ed(i - 1, j) + 1, ed(i, j - 1) + 1, ed(i - 1, j - 1) + cost);
    trace('calc', { data: { array: [i, j] }, description: \`ed(\${i},\${j})=\${res}\` });
    return res;
  }
  const res = ed(a.length, b.length);
  trace('done', { data: { array: [] }, description: \`编辑距离: \${res}\` });
}
editDistRec(data.text1.split(''), data.text2.split(''));
`;

export const editDistanceDP = `// 编辑距离（DP）
function editDistDP(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      trace('cell', { data: { matrix: dp.map(row => [...row]) }, highlights: [i, j], pointers: { i, j }, description: \`dp[\${i}][\${j}]=\${dp[i][j]}\` });
    }
    trace('row', { data: { matrix: dp }, highlights: [i], description: \'填充第 \${i} 行\' });
  }
  trace('done', { data: { matrix: dp }, description: \`编辑距离: \${dp[m][n]}\` });
}
editDistDP(data.text1.split(''), data.text2.split(''));
`;

export const uniquePathsRec = `// 不同路径（递归）
function uniquePathsRec(m, n) {
  function up(i, j) {
    if (i === 0 || j === 0) return 1;
    const res = up(i - 1, j) + up(i, j - 1);
    trace('calc', { data: { array: [i, j] }, description: \`up(\${i},\${j})=\${res}\` });
    return res;
  }
  const res = up(m - 1, n - 1);
  trace('done', { data: { array: [] }, description: \`路径数: \${res}\` });
}
uniquePathsRec(data[0], data[1]);
`;

export const uniquePathsDP = `// 不同路径（DP）
function uniquePathsDP(m, n) {
  const dp = Array.from({ length: m }, () => new Array(n).fill(1));
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
      trace('cell', { data: { matrix: dp.map(row => [...row]) }, highlights: [i, j], pointers: { i, j }, description: \`dp[\${i}][\${j}]=up \${dp[i - 1][j]} + left \${dp[i][j - 1]} = \${dp[i][j]}\` });
    }
    trace('row', { data: { matrix: dp }, highlights: [i], description: \'填充第 \${i} 行\' });
  }
  trace('done', { data: { matrix: dp }, description: \`路径数: \${dp[m-1][n-1]}\` });
}
uniquePathsDP(data[0], data[1]);
`;

export const houseRobberRec = `// 打家劫舍（递归）
function robRec(nums) {
  function rb(i) {
    if (i < 0) return 0;
    const res = Math.max(rb(i - 1), rb(i - 2) + nums[i]);
    trace('calc', { data: { array: nums }, highlights: [i], description: \`rb(\${i})=\${res}\` });
    return res;
  }
  const res = rb(nums.length - 1);
  trace('done', { data: { array: nums }, description: \`最大金额: \${res}\` });
}
robRec(data);
`;

export const houseRobberDP = `// 打家劫舍（DP）
function robDP(nums) {
  const n = nums.length;
  if (n === 0) return 0;
  const dp = new Array(n).fill(0); dp[0] = nums[0];
  for (let i = 1; i < n; i++) {
    dp[i] = Math.max(dp[i - 1], (i > 1 ? dp[i - 2] : 0) + nums[i]);
    trace('calc', { data: { array: dp }, highlights: [i], description: \`dp[\${i}]=\${dp[i]}\` });
  }
  trace('done', { data: { array: dp }, description: \`最大金额: \${dp[n-1]}\` });
}
robDP(data);
`;

export const moreDpTemplates: AlgorithmTemplate[] = [
  { id: 'lcs', name: 'LCS(递归) → LCS(DP)', category: '动态规划', language: 'js', naiveCode: lcsRecursive, optimizedCode: lcsDP, defaultData: { text1: 'ABCBDAB', text2: 'BDCABA' } },
  { id: 'coin-change', name: '零钱兑换(递归) → 零钱兑换(DP)', category: '动态规划', language: 'js', naiveCode: coinChangeRecursive, optimizedCode: coinChangeDP, defaultData: [1, 2, 5] },
  { id: 'edit-distance', name: '编辑距离(递归) → 编辑距离(DP)', category: '动态规划', language: 'js', naiveCode: editDistanceRec, optimizedCode: editDistanceDP, defaultData: { text1: 'kitten', text2: 'sitting' } },
  { id: 'unique-paths', name: '不同路径(递归) → 不同路径(DP)', category: '动态规划', language: 'js', naiveCode: uniquePathsRec, optimizedCode: uniquePathsDP, defaultData: [3, 7] },
  { id: 'house-robber', name: '打家劫舍(递归) → 打家劫舍(DP)', category: '动态规划', language: 'js', naiveCode: houseRobberRec, optimizedCode: houseRobberDP, defaultData: [2, 7, 9, 3, 1, 5, 6, 4] },
];
