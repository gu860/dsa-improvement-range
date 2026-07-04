import type { AlgorithmTemplate } from '../core/types';

export const linearSearch = `// 线性搜索
function linearSearch(input) {
  const arr = Array.isArray(input) ? input : input.array;
  const target = Array.isArray(input) ? input[input.length - 1] : input.target;
  for (let i = 0; i < arr.length; i++) {
    trace('compare', { data: { array: [...arr], target }, highlights: [i], pointers: { i }, description: \`比较 arr[\${i}]=\${arr[i]} 和 target=\${target}\` });
    if (arr[i] === target) {
      trace('found', { data: { array: [...arr], target }, highlights: [i], description: '找到目标！' });
      return i;
    }
  }
  trace('not-found', { data: { array: [...arr], target }, description: '未找到' });
  return -1;
}
linearSearch(data);
`;

export const binarySearch = `// 二分搜索
function binarySearch(input) {
  const arr = Array.isArray(input) ? input : input.array;
  const target = Array.isArray(input) ? input[input.length - 1] : input.target;
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    trace('compare', { data: { array: [...arr], target }, highlights: [mid], pointers: { left, right, mid }, description: \`比较 arr[\${mid}]=\${arr[mid]} 和 target=\${target}\` });
    if (arr[mid] === target) {
      trace('found', { data: { array: [...arr], target }, highlights: [mid], description: '找到目标！' });
      return mid;
    }
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
    trace('range', { data: { array: [...arr], target }, highlights: [left > right ? right : left, right < left ? left : right], pointers: { left, right }, description: \`缩小范围: [\${left}, \${right}]\` });
  }
  trace('not-found', { data: { array: [...arr], target }, description: '未找到' });
  return -1;
}
binarySearch(data);
`;

export const twoSumBrute = `// 两数之和（暴力）
function twoSumBrute(input) {
  const arr = input.array || input;
  const target = input.target || 9;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      trace('check', { data: { array: [...arr], target }, highlights: [i, j], description: \`检查 arr[\${i}]=\${arr[i]} + arr[\${j}]=\${arr[j]} = \${arr[i] + arr[j]}\` });
      if (arr[i] + arr[j] === target) {
        trace('found', { data: { array: [...arr], target }, highlights: [i, j], description: \`找到: ([\${i}, \${j}])\` });
        return [i, j];
      }
    }
  }
  trace('not-found', { data: { array: [...arr], target }, description: '未找到' });
  return [];
}
twoSumBrute(data);
`;

export const twoSumHash = `// 两数之和（哈希）
function twoSumHash(input) {
  const arr = input.array || input;
  const target = input.target || 9;
  const map = {};
  for (let i = 0; i < arr.length; i++) {
    const complement = target - arr[i];
    trace('check', { data: { array: [...arr], target }, highlights: [i], description: \`检查 \${arr[i]}, 需要 \${complement}\` });
    if (complement in map) {
      trace('found', { data: { array: [...arr], target }, highlights: [map[complement], i], description: \`找到: ([\${map[complement]}, \${i}])\` });
      return [map[complement], i];
    }
    map[arr[i]] = i;
    trace('hash', { data: { array: [...arr], target }, highlights: [i], description: \`存入哈希: \${arr[i]} -> \${i}\` });
  }
  trace('not-found', { data: { array: [...arr], target }, description: '未找到' });
  return [];
}
twoSumHash(data);
`;

export const rotatedArrayLinear = `// 搜索旋转数组（线性）
function searchRotatedLinear(input) {
  const arr = input.array || input;
  const target = input.target || 0;
  for (let i = 0; i < arr.length; i++) {
    trace('check', { data: { array: [...arr], target }, highlights: [i], description: \`检查 arr[\${i}]=\${arr[i]}\` });
    if (arr[i] === target) { trace('found', { data: { array: [...arr], target }, highlights: [i], description: '找到！' }); return i; }
  }
  trace('not-found', { data: { array: [...arr], target }, description: '未找到' });
  return -1;
}
searchRotatedLinear(data);
`;

export const rotatedArrayBinary = `// 搜索旋转数组（二分）
function searchRotatedBinary(input) {
  const arr = input.array || input;
  const target = input.target || 0;
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    trace('check', { data: { array: [...arr], target }, highlights: [mid], pointers: { left, right, mid }, description: \`mid=\${mid}: arr[\${mid}]=\${arr[mid]}\` });
    if (arr[mid] === target) { trace('found', { data: { array: [...arr], target }, highlights: [mid], description: '找到！' }); return mid; }
    if (arr[left] <= arr[mid]) {
      if (arr[left] <= target && target < arr[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (arr[mid] < target && target <= arr[right]) left = mid + 1;
      else right = mid - 1;
    }
    trace('narrow', { data: { array: [...arr], target }, highlights: [left, right], description: \`范围: [\${left}, \${right}]\` });
  }
  trace('not-found', { description: '未找到' });
  return -1;
}
searchRotatedBinary(data);
`;

export const peakLinear = `// 峰值元素（线性）
function peakLinear(arr) {
  for (let i = 0; i < arr.length; i++) {
    const left = i === 0 || arr[i] > arr[i - 1];
    const right = i === arr.length - 1 || arr[i] > arr[i + 1];
    trace('check', { data: { array: [...arr] }, highlights: [i], description: \`检查 arr[\${i}]=\${arr[i]}, left=\${left}, right=\${right}\` });
    if (left && right) { trace('found', { data: { array: [...arr] }, highlights: [i], description: \`峰值: \${arr[i]}\` }); return i; }
  }
  return -1;
}
peakLinear(data);
`;

export const peakBinary = `// 峰值元素（二分）
function peakBinary(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    trace('check', { data: { array: [...arr] }, highlights: [mid], description: \`检查 mid=\${mid}: arr[\${mid}]=\${arr[mid]}, arr[\${mid+1}]=\${arr[mid+1]}\` });
    if (arr[mid] > arr[mid + 1]) right = mid;
    else left = mid + 1;
    trace('narrow', { data: { array: [...arr] }, highlights: [left], description: '移动 left/right' });
  }
  trace('found', { data: { array: [...arr] }, highlights: [left], description: \`峰值: \${arr[left]}\` });
  return left;
}
peakBinary(data);
`;

export const searchTemplates: AlgorithmTemplate[] = [
  { id: 'linear-binary', name: '线性搜索 → 二分搜索', category: '搜索', language: 'js', naiveCode: linearSearch, optimizedCode: binarySearch, defaultData: { array: [3, 9, 13, 17, 21, 25, 33, 41, 55, 67], target: 33 } },
  { id: 'two-sum', name: '两数之和(暴力) → 两数之和(哈希)', category: '搜索', language: 'js', naiveCode: twoSumBrute, optimizedCode: twoSumHash, defaultData: { array: [2, 7, 11, 15, 3, 6, 9], target: 9 } },
  { id: 'rotated-array', name: '旋转数组(线性) → 旋转数组(二分)', category: '搜索', language: 'js', naiveCode: rotatedArrayLinear, optimizedCode: rotatedArrayBinary, defaultData: { array: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
  { id: 'peak', name: '峰值元素(线性) → 峰值元素(二分)', category: '搜索', language: 'js', naiveCode: peakLinear, optimizedCode: peakBinary, defaultData: [1, 2, 3, 5, 6, 4, 3, 2] },
];
