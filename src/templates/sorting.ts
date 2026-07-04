import type { AlgorithmTemplate } from '../core/types';

export const bubbleSortNaive = `// 冒泡排序（朴素）
function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      trace('compare', {
        data: { array: [...a] },
        highlights: [j, j + 1],
        pointers: { i, j },
        description: \`比较 a[\${j}]=\${a[j]} 和 a[\${j+1}]=\${a[j+1]}\`
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        trace('swap', {
          data: { array: [...a] },
          highlights: [j, j + 1],
          pointers: { i, j },
          description: \`交换 a[\${j}] 和 a[\${j+1}]\`
        });
      }
    }
  }
  return a;
}
bubbleSort(data);
`;

export const quickSortOptimized = `// 快速排序（优化 - 三数取中 + 尾递归优化）
function quickSort(arr, low, high) {
  if (low >= high) return arr;
  // 三数取中选 pivot
  const mid = low + ((high - low) >> 1);
  if (arr[mid] < arr[low]) [arr[low], arr[mid]] = [arr[mid], arr[low]];
  if (arr[high] < arr[low]) [arr[low], arr[high]] = [arr[high], arr[low]];
  if (arr[high] < arr[mid]) [arr[mid], arr[high]] = [arr[high], arr[mid]];
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    trace('compare', {
      data: { array: [...arr] },
      highlights: [j, high],
      pointers: { low, high, pivotIdx: high },
      description: \`比较 a[\${j}]=\${arr[j]} 和 pivot=\${pivot}\`
    });
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      trace('swap', {
        data: { array: [...arr] },
        highlights: [i, j],
        pointers: { low, high, pivotIdx: high },
        description: \`交换 a[\${i}] 和 a[\${j}]\`
      });
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  trace('partition', {
    data: { array: [...arr] },
    highlights: [i + 1],
    pointers: { low, high },
    description: \`pivot 归位，索引=\${i + 1}\`
  });
  quickSort(arr, low, i);
  quickSort(arr, i + 2, high);
  return arr;
}
quickSort([...data], 0, data.length - 1);
`;

export const sortingTemplates: AlgorithmTemplate[] = [
  {
    id: 'bubble-vs-quick',
    name: '冒泡排序 vs 快速排序',
    category: 'sorting',
    language: 'js',
    naiveCode: bubbleSortNaive,
    optimizedCode: quickSortOptimized,
    defaultData: [64, 34, 25, 12, 22, 11, 90, 8, 37, 45],
  },
];
