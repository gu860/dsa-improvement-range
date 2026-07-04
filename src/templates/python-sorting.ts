import type { AlgorithmTemplate } from '../core/types';

export const pyBubbleSort = `def bubble_sort(arr):
    a = list(arr)
    n = len(a)
    for i in range(n - 1):
        for j in range(n - i - 1):
            trace('compare', {
                'data': {'array': list(a)},
                'highlights': [j, j + 1],
                'pointers': {'i': i, 'j': j},
                'description': f'compare a[{j}] and a[{j+1}]'
            })
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                trace('swap', {
                    'data': {'array': list(a)},
                    'highlights': [j, j + 1],
                    'pointers': {'i': i, 'j': j},
                })
    return a

bubble_sort(data)
`;

export const pyQuickSort = `def quick_sort(arr, low, high):
    if low >= high:
        return arr
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        trace('compare', {
            'data': {'array': list(arr)},
            'highlights': [j, high],
            'pointers': {'low': low, 'high': high},
            'description': f'compare a[{j}]={arr[j]} pivot={pivot}'
        })
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
            trace('swap', {
                'data': {'array': list(arr)},
                'highlights': [i, j],
                'pointers': {'low': low, 'high': high},
            })
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    trace('partition', {
        'data': {'array': list(arr)},
        'highlights': [i + 1],
        'pointers': {'low': low, 'high': high},
    })
    quick_sort(arr, low, i)
    quick_sort(arr, i + 2, high)
    return arr

quick_sort(data, 0, len(data) - 1)
`;

export const pythonSortingTemplates: AlgorithmTemplate[] = [
  {
    id: 'py-bubble-vs-quick',
    name: '冒泡排序 vs 快速排序',
    category: 'sorting',
    language: 'python',
    naiveCode: pyBubbleSort,
    optimizedCode: pyQuickSort,
    defaultData: [64, 34, 25, 12, 22, 11, 90, 8, 37, 45],
  },
];
