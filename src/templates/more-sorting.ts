import type { AlgorithmTemplate } from '../core/types';

export const selectionSort = `// 选择排序 - 每次选最小
function selectionSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      trace('compare', { data: { array: [...a] }, highlights: [minIdx, j], pointers: { i, minIdx }, description: \`比较 a[\${minIdx}]=\${a[minIdx]} 和 a[\${j}]=\${a[j]}\` });
      if (a[j] < a[minIdx]) { minIdx = j; }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      trace('swap', { data: { array: [...a] }, highlights: [i, minIdx], pointers: { i, minIdx }, description: \`交换 a[\${i}]=\${a[i]} 和 a[\${minIdx}]=\${a[minIdx]}\` });
    }
  }
  trace('done', { data: { array: [...a] }, description: '排序完成' });
}
selectionSort(data);
`;

export const heapSort = `// 堆排序 - 建堆+下沉
function heapSort(arr) {
  const a = [...arr]; const n = a.length;
  function heapify(nn, i) {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < nn && a[l] > a[largest]) largest = l;
    if (r < nn && a[r] > a[largest]) largest = r;
    trace('heapify', { data: { array: [...a] }, highlights: [i, largest], description: \`调整堆: i=\${i} largest=\${largest}\` });
    if (largest !== i) { [a[i], a[largest]] = [a[largest], a[i]]; heapify(nn, largest); }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    trace('extract', { data: { array: [...a] }, highlights: [0, i], description: \`取出最大值到位置 \${i}\` });
    heapify(i, 0);
  }
  trace('done', { data: { array: [...a] }, description: '排序完成' });
}
heapSort(data);
`;

export const insertionSort = `// 插入排序 - 逐个插入已排序部分
function insertionSort(arr) {
  const a = [...arr]; const n = a.length;
  for (let i = 1; i < n; i++) {
    let key = a[i], j = i - 1;
    trace('pick', { data: { array: [...a] }, highlights: [i], pointers: { i, j }, description: \`选取 a[\${i}]=\${key} 插入\` });
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]; j--;
      trace('shift', { data: { array: [...a] }, highlights: [j + 1], pointers: { i, j }, description: \`后移元素\` });
    }
    a[j + 1] = key;
    trace('insert', { data: { array: [...a] }, highlights: [j + 1], description: \`插入 key=\${key} 到位置 \${j+1}\` });
  }
  trace('done', { data: { array: [...a] }, description: '排序完成' });
}
insertionSort(data);
`;

export const shellSort = `// 希尔排序 - 希尔增量序列
function shellSort(arr) {
  const a = [...arr]; const n = a.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    trace('gap', { data: { array: [...a] }, highlights: [], description: \`增量 gap=\${gap}\` });
    for (let i = gap; i < n; i++) {
      const temp = a[i]; let j = i;
      while (j >= gap && a[j - gap] > temp) {
        a[j] = a[j - gap]; j -= gap;
        trace('shift', { data: { array: [...a] }, highlights: [j, j - gap], description: \`步长\${gap}: 移动元素\` });
      }
      a[j] = temp;
      trace('place', { data: { array: [...a] }, highlights: [j], description: \`放置 temp=\${temp}\` });
    }
  }
  trace('done', { data: { array: [...a] }, description: '排序完成' });
}
shellSort(data);
`;

export const mergeSortRecursive = `// 归并排序（递归）
function mergeSort(arr) {
  function ms(a) {
    if (a.length <= 1) return a;
    const mid = Math.floor(a.length / 2);
    const left = ms(a.slice(0, mid)), right = ms(a.slice(mid));
    const merged = []; let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      trace('compare', { data: { array: [...merged, ...left.slice(i), ...right.slice(j)] }, highlights: [merged.length + i, merged.length + left.length + j], description: \`比较 \${left[i]} 和 \${right[j]}\` });
      if (left[i] < right[j]) { merged.push(left[i++]); }
      else { merged.push(right[j++]); }
    }
    const result = [...merged, ...left.slice(i), ...right.slice(j)];
    trace('merge', { data: { array: result }, description: \`合并: [\${result}]\` });
    return result;
  }
  const result = ms([...arr]);
  trace('done', { data: { array: result }, description: '排序完成' });
}
mergeSort(data);
`;

export const mergeSortIterative = `// 归并排序（迭代）
function mergeSortIter(arr) {
  const a = [...arr]; const n = a.length;
  for (let size = 1; size < n; size *= 2) {
    for (let left = 0; left < n - size; left += 2 * size) {
      const mid = left + size;
      const right = Math.min(left + 2 * size, n);
      const leftArr = a.slice(left, mid);
      const rightArr = a.slice(mid, right);
      let i = 0, j = 0, k = left;
      while (i < leftArr.length && j < rightArr.length) {
        trace('compare', { data: { array: [...a] }, highlights: [left + i, mid + j], description: \`比较 \${leftArr[i]} 和 \${rightArr[j]}\` });
        a[k++] = leftArr[i] < rightArr[j] ? leftArr[i++] : rightArr[j++];
      }
      while (i < leftArr.length) a[k++] = leftArr[i++];
      while (j < rightArr.length) a[k++] = rightArr[j++];
      trace('merge', { data: { array: [...a] }, highlights: [left, right - 1], description: \`合并 [\${left}..\${right-1}]\` });
    }
  }
  trace('done', { data: { array: [...a] }, description: '排序完成' });
}
mergeSortIter(data);
`;

export const moreSortingTemplates: AlgorithmTemplate[] = [
  { id: 'selection-sort', name: '选择排序 → 堆排序', category: '排序', language: 'js', naiveCode: selectionSort, optimizedCode: heapSort, defaultData: [29, 10, 14, 37, 13, 33, 48, 22] },
  { id: 'insertion-sort', name: '插入排序 → 希尔排序', category: '排序', language: 'js', naiveCode: insertionSort, optimizedCode: shellSort, defaultData: [12, 34, 54, 2, 3, 8, 19, 27] },
  { id: 'merge-sort', name: '归并排序(递归) → 归并排序(迭代)', category: '排序', language: 'js', naiveCode: mergeSortRecursive, optimizedCode: mergeSortIterative, defaultData: [38, 27, 43, 3, 9, 82, 10, 53] },
  { id: 'non-compare-sort', name: '计数排序 → 基数排序', category: '排序', language: 'js', naiveCode: `// 计数排序
function countingSort(arr) {
  const a = [...arr]; if (a.length === 0) return a;
  const max = Math.max(...a); const min = Math.min(...a);
  const range = max - min + 1; const count = new Array(range).fill(0);
  for (const v of a) { count[v - min]++; trace('count', { data: { array: [...a] }, description: \`计数: \${v} 出现 \${count[v-min]} 次\` }); }
  let idx = 0;
  for (let i = 0; i < range; i++) { while (count[i]-- > 0) { a[idx++] = i + min; trace('place', { data: { array: [...a] }, highlights: [idx - 1], description: \'放置元素\' }); } }
  trace('done', { data: { array: [...a] }, description: '排序完成' });
}
countingSort(data);`, optimizedCode: `// 基数排序（LSD）
function radixSort(arr) {
  const a = [...arr]; if (a.length === 0) return a;
  const max = Math.max(...a.map(Math.abs));
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (const v of a) {
      const digit = Math.floor(Math.abs(v) / exp) % 10;
      buckets[digit].push(v);
    }
    trace('bucket', { data: { array: buckets.flat() }, description: \`exp=\${exp}号排入桶\` });
    let idx = 0;
    for (const b of buckets) { for (const v of b) { a[idx++] = v; } }
    trace('collect', { data: { array: [...a] }, description: \`exp=\${exp}号收集\` });
    exp *= 10;
  }
  trace('done', { data: { array: [...a] }, description: '排序完成' });
}
radixSort(data);`, defaultData: [170, 45, 75, 90, 2, 802, 2, 66] },
];
