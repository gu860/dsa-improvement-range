import type { AlgorithmTemplate } from '../core/types';

export const pyDpNaive = `def knapsack(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(1, cap + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]
            trace('compute', {
                'data': {'matrix': dp},
                'highlights': [i, w],
                'pointers': {'i': i, 'j': w},
                'description': f'dp[{i}][{w}] = {dp[i][w]}'
            })
    return dp[n][cap]

input_data = data if isinstance(data, dict) and data.get('weights') and data.get('values') else {'weights': [2, 3, 4, 5], 'values': [3, 4, 5, 6], 'cap': 6}
knapsack(input_data['weights'], input_data['values'], input_data.get('cap', 6))
`;

export const pyDpOptimized = `def knapsack_opt(weights, values, cap):
    dp = [0] * (cap + 1)
    for i in range(len(weights)):
        for w in range(cap, weights[i] - 1, -1):
            dp[w] = max(values[i] + dp[w - weights[i]], dp[w])
            trace('compute', {
                'data': {'matrix': [list(dp)]},
                'highlights': [0, w],
                'pointers': {'i': i, 'w': w},
                'description': f'dp[{w}] = {dp[w]}'
            })
    return dp[cap]

input_data = data if isinstance(data, dict) and data.get('weights') and data.get('values') else {'weights': [2, 3, 4, 5], 'values': [3, 4, 5, 6], 'cap': 6}
knapsack_opt(input_data['weights'], input_data['values'], input_data.get('cap', 6))
`;

export const pythonDpTemplates: AlgorithmTemplate[] = [
  {
    id: 'py-knapsack-vs-opt',
    name: '0-1 背包 DP',
    category: 'dp',
    language: 'python',
    naiveCode: pyDpNaive,
    optimizedCode: pyDpOptimized,
    defaultData: { weights: [2, 3, 4, 5], values: [3, 4, 5, 6], cap: 6 },
  },
];
