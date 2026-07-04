import type { AlgorithmTemplate } from '../core/types';

export const dpNaive = `function knapsack(weights, values, cap) {
  const n = weights.length;
  const dp = Array.from({length: n+1}, () => Array(cap+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= cap; w++) {
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(values[i-1] + dp[i-1][w - weights[i-1]], dp[i-1][w]);
      } else {
        dp[i][w] = dp[i-1][w];
      }
      trace('compute', {
        data: { matrix: dp.map(r => [...r]) },
        highlights: [i, w],
        pointers: { i, j: w },
        description: 'dp[' + i + '][' + w + '] = ' + dp[i][w]
      });
    }
  }
}
const input = data && Array.isArray(data.weights) && Array.isArray(data.values)
  ? data
  : { weights: [2,3,4,5], values: [3,4,5,6], cap: 6 };
knapsack(input.weights, input.values, input.cap || 6);
`;

export const dpOptimized = `function knapsackOpt(weights, values, cap) {
  const dp = Array(cap+1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = cap; w >= weights[i]; w--) {
      dp[w] = Math.max(values[i] + dp[w - weights[i]], dp[w]);
      trace('compute', {
        data: { matrix: [dp.slice()] },
        highlights: [0, w],
        pointers: { i, w },
        description: 'dp[' + w + '] = ' + dp[w]
      });
    }
  }
}
const input = data && Array.isArray(data.weights) && Array.isArray(data.values)
  ? data
  : { weights: [2,3,4,5], values: [3,4,5,6], cap: 6 };
knapsackOpt(input.weights, input.values, input.cap || 6);
`;

export const dpTemplates: AlgorithmTemplate[] = [
  {
    id: 'knapsack-vs-opt',
    name: '0-1 背包 DP',
    category: 'dp',
    language: 'js',
    naiveCode: dpNaive,
    optimizedCode: dpOptimized,
    defaultData: { weights: [2, 3, 4, 5], values: [3, 4, 5, 6], cap: 6 },
  },
];
