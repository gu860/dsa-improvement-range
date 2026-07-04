import type { AlgorithmTemplate } from '../core/types';

const graphData = { nodes: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }, { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' }], edges: [{ from: 0, to: 1, weight: 4 }, { from: 0, to: 2, weight: 2 }, { from: 1, to: 3, weight: 5 }, { from: 2, to: 1, weight: 1 }, { from: 2, to: 3, weight: 8 }, { from: 2, to: 4, weight: 10 }, { from: 3, to: 4, weight: 2 }, { from: 3, to: 5, weight: 6 }, { from: 4, to: 5, weight: 3 }] };

const treeData = {
  tree: {
    value: 1,
    left: { value: 2, left: { value: 4, left: null, right: null }, right: { value: 5, left: null, right: null } },
    right: { value: 3, left: { value: 6, left: null, right: null }, right: { value: 7, left: null, right: null } },
  },
};

export const pySelectionSort = `def selection_sort(arr):
    a = list(arr)
    for i in range(len(a) - 1):
        min_idx = i
        for j in range(i + 1, len(a)):
            trace('compare', {'data': {'array': list(a)}, 'highlights': [min_idx, j], 'pointers': {'i': i, 'minIdx': min_idx}, 'description': 'compare minimum candidate'})
            if a[j] < a[min_idx]:
                min_idx = j
        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]
            trace('swap', {'data': {'array': list(a)}, 'highlights': [i, min_idx], 'pointers': {'i': i, 'minIdx': min_idx}, 'description': 'place selected minimum'})
    trace('done', {'data': {'array': list(a)}, 'description': 'selection sort done'})
    return a

selection_sort(data)
`;

export const pyHeapSort = `def heap_sort(arr):
    a = list(arr)
    n = len(a)
    def heapify(size, i):
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        if left < size and a[left] > a[largest]:
            largest = left
        if right < size and a[right] > a[largest]:
            largest = right
        trace('heapify', {'data': {'array': list(a)}, 'highlights': [i, largest], 'description': 'adjust heap'})
        if largest != i:
            a[i], a[largest] = a[largest], a[i]
            heapify(size, largest)
    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)
    for i in range(n - 1, 0, -1):
        a[0], a[i] = a[i], a[0]
        trace('extract', {'data': {'array': list(a)}, 'highlights': [0, i], 'description': 'move max to tail'})
        heapify(i, 0)
    trace('done', {'data': {'array': list(a)}, 'description': 'heap sort done'})
    return a

heap_sort(data)
`;

export const pyInsertionSort = `def insertion_sort(arr):
    a = list(arr)
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        trace('pick', {'data': {'array': list(a)}, 'highlights': [i], 'pointers': {'i': i, 'j': j}, 'description': 'pick value for insertion'})
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            trace('shift', {'data': {'array': list(a)}, 'highlights': [j, j + 1], 'pointers': {'i': i, 'j': j}, 'description': 'shift larger value'})
            j -= 1
        a[j + 1] = key
        trace('insert', {'data': {'array': list(a)}, 'highlights': [j + 1], 'description': 'insert key'})
    trace('done', {'data': {'array': list(a)}, 'description': 'insertion sort done'})
    return a

insertion_sort(data)
`;

export const pyShellSort = `def shell_sort(arr):
    a = list(arr)
    gap = len(a) // 2
    while gap > 0:
        trace('gap', {'data': {'array': list(a)}, 'description': 'gap=' + str(gap)})
        for i in range(gap, len(a)):
            temp = a[i]
            j = i
            while j >= gap and a[j - gap] > temp:
                a[j] = a[j - gap]
                trace('shift', {'data': {'array': list(a)}, 'highlights': [j, j - gap], 'description': 'gap shift'})
                j -= gap
            a[j] = temp
            trace('place', {'data': {'array': list(a)}, 'highlights': [j], 'description': 'place temp'})
        gap //= 2
    trace('done', {'data': {'array': list(a)}, 'description': 'shell sort done'})
    return a

shell_sort(data)
`;

export const pyMergeSortRecursive = `def merge_sort(arr):
    def sort_part(part):
        if len(part) <= 1:
            return part
        mid = len(part) // 2
        left = sort_part(part[:mid])
        right = sort_part(part[mid:])
        merged = []
        i = j = 0
        while i < len(left) and j < len(right):
            trace('compare', {'data': {'array': merged + left[i:] + right[j:]}, 'highlights': [len(merged)], 'description': 'compare merge fronts'})
            if left[i] < right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
        result = merged + left[i:] + right[j:]
        trace('merge', {'data': {'array': list(result)}, 'description': 'merge segment'})
        return result
    result = sort_part(list(arr))
    trace('done', {'data': {'array': list(result)}, 'description': 'merge sort done'})
    return result

merge_sort(data)
`;

export const pyMergeSortIterative = `def merge_sort_iter(arr):
    a = list(arr)
    size = 1
    n = len(a)
    while size < n:
        for left in range(0, n - size, 2 * size):
            mid = left + size
            right = min(left + 2 * size, n)
            left_arr = a[left:mid]
            right_arr = a[mid:right]
            i = j = 0
            k = left
            while i < len(left_arr) and j < len(right_arr):
                trace('compare', {'data': {'array': list(a)}, 'highlights': [left + i, mid + j], 'description': 'compare merge lanes'})
                if left_arr[i] < right_arr[j]:
                    a[k] = left_arr[i]; i += 1
                else:
                    a[k] = right_arr[j]; j += 1
                k += 1
            while i < len(left_arr):
                a[k] = left_arr[i]; i += 1; k += 1
            while j < len(right_arr):
                a[k] = right_arr[j]; j += 1; k += 1
            trace('merge', {'data': {'array': list(a)}, 'highlights': [left, right - 1], 'description': 'merge fixed width lanes'})
        size *= 2
    trace('done', {'data': {'array': list(a)}, 'description': 'iterative merge sort done'})
    return a

merge_sort_iter(data)
`;

export const pyCountingSort = `def counting_sort(arr):
    a = list(arr)
    if not a:
        return a
    lo, hi = min(a), max(a)
    count = [0] * (hi - lo + 1)
    for value in a:
        count[value - lo] += 1
        trace('count', {'data': {'array': list(a)}, 'highlights': [a.index(value)], 'description': 'count value ' + str(value)})
    idx = 0
    for offset, amount in enumerate(count):
        while amount > 0:
            a[idx] = offset + lo
            trace('place', {'data': {'array': list(a)}, 'highlights': [idx], 'description': 'write counted value'})
            idx += 1
            amount -= 1
    trace('done', {'data': {'array': list(a)}, 'description': 'counting sort done'})
    return a

counting_sort(data)
`;

export const pyRadixSort = `def radix_sort(arr):
    a = list(arr)
    if not a:
        return a
    max_value = max(abs(v) for v in a)
    exp = 1
    while max_value // exp > 0:
        buckets = [[] for _ in range(10)]
        for value in a:
            buckets[(abs(value) // exp) % 10].append(value)
        flat = [v for bucket in buckets for v in bucket]
        trace('bucket', {'data': {'array': list(flat)}, 'description': 'bucket by digit ' + str(exp)})
        a = flat
        trace('collect', {'data': {'array': list(a)}, 'description': 'collect buckets'})
        exp *= 10
    trace('done', {'data': {'array': list(a)}, 'description': 'radix sort done'})
    return a

radix_sort(data)
`;

const pyDefaultGraph = `default_graph = {
    'nodes': [{'id': 0, 'label': 'A'}, {'id': 1, 'label': 'B'}, {'id': 2, 'label': 'C'}, {'id': 3, 'label': 'D'}, {'id': 4, 'label': 'E'}, {'id': 5, 'label': 'F'}],
    'edges': [{'from': 0, 'to': 1, 'weight': 4}, {'from': 0, 'to': 2, 'weight': 2}, {'from': 1, 'to': 3, 'weight': 5}, {'from': 2, 'to': 1, 'weight': 1}, {'from': 2, 'to': 3, 'weight': 8}, {'from': 2, 'to': 4, 'weight': 10}, {'from': 3, 'to': 4, 'weight': 2}, {'from': 3, 'to': 5, 'weight': 6}, {'from': 4, 'to': 5, 'weight': 3}]
}
graph = data if isinstance(data, dict) and data.get('nodes') else default_graph
`;

export const pyDijkstraNaive = `${pyDefaultGraph}
def dijkstra_naive(graph, start):
    n = len(graph['nodes'])
    dist = [float('inf')] * n
    dist[start] = 0
    visited = [False] * n
    adj = [[] for _ in range(n)]
    for edge in graph['edges']:
        adj[edge['from']].append((edge['to'], edge.get('weight', 1)))
    for _ in range(n):
        u = -1
        for i in range(n):
            if not visited[i] and (u == -1 or dist[i] < dist[u]):
                u = i
        if u == -1 or dist[u] == float('inf'):
            break
        visited[u] = True
        trace('visit', {'data': dict(graph), 'highlights': [u], 'description': 'visit node ' + str(u)})
        for to, weight in adj[u]:
            if not visited[to] and dist[u] + weight < dist[to]:
                dist[to] = dist[u] + weight
                trace('relax', {'data': dict(graph), 'highlights': [u, to], 'pointers': {'u': u, 'to': to}, 'description': 'relax distance to ' + str(to)})
    trace('done', {'data': {'graph': graph, 'nodes': graph['nodes'], 'edges': graph['edges']}, 'highlights': list(range(n)), 'description': 'shortest distances ready'})
    return dist

dijkstra_naive(graph, 0)
`;

export const pyDijkstraPQ = `${pyDefaultGraph}
def dijkstra_pq(graph, start):
    n = len(graph['nodes'])
    dist = [float('inf')] * n
    dist[start] = 0
    adj = [[] for _ in range(n)]
    for edge in graph['edges']:
        adj[edge['from']].append((edge['to'], edge.get('weight', 1)))
    pq = [(0, start)]
    while pq:
        pq.sort()
        current, u = pq.pop(0)
        if current > dist[u]:
            continue
        trace('visit', {'data': dict(graph), 'highlights': [u], 'description': 'pop node ' + str(u)})
        for to, weight in adj[u]:
            if dist[u] + weight < dist[to]:
                dist[to] = dist[u] + weight
                pq.append((dist[to], to))
                trace('relax', {'data': dict(graph), 'highlights': [u, to], 'description': 'push better distance'})
    trace('done', {'data': {'graph': graph, 'nodes': graph['nodes'], 'edges': graph['edges']}, 'highlights': list(range(n)), 'description': 'priority queue finished'})
    return dist

dijkstra_pq(graph, 0)
`;

export const pyPrimNaive = `${pyDefaultGraph}
def prim_naive(graph):
    n = len(graph['nodes'])
    adj = [[] for _ in range(n)]
    for edge in graph['edges']:
        adj[edge['from']].append((edge['to'], edge.get('weight', 1)))
        adj[edge['to']].append((edge['from'], edge.get('weight', 1)))
    key = [float('inf')] * n
    parent = [-1] * n
    used = [False] * n
    key[0] = 0
    for _ in range(n):
        u = -1
        for i in range(n):
            if not used[i] and (u == -1 or key[i] < key[u]):
                u = i
        if u == -1:
            break
        used[u] = True
        trace('add', {'data': dict(graph), 'highlights': [u, parent[u]], 'description': 'add grid node ' + str(u)})
        for to, weight in adj[u]:
            if not used[to] and weight < key[to]:
                key[to] = weight
                parent[to] = u
    trace('done', {'data': {'graph': graph}, 'description': 'mst ready'})

prim_naive(graph)
`;

export const pyPrimHeap = `${pyDefaultGraph}
def prim_heap(graph):
    n = len(graph['nodes'])
    adj = [[] for _ in range(n)]
    for edge in graph['edges']:
        adj[edge['from']].append((edge['to'], edge.get('weight', 1)))
        adj[edge['to']].append((edge['from'], edge.get('weight', 1)))
    used = [False] * n
    pq = [(0, 0, -1)]
    while pq:
        pq.sort()
        weight, u, parent = pq.pop(0)
        if used[u]:
            continue
        used[u] = True
        trace('add', {'data': dict(graph), 'highlights': [u, parent], 'description': 'select cheapest frontier'})
        for to, edge_weight in adj[u]:
            if not used[to]:
                pq.append((edge_weight, to, u))
    trace('done', {'data': {'graph': graph}, 'description': 'heap prim done'})

prim_heap(graph)
`;

export const pyUnionFindQuick = `def quick_find(ops):
    parent = list(range(8))
    def find(x):
        return parent[x]
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return
        for i, value in enumerate(parent):
            if value == rb:
                parent[i] = ra
        trace('union', {'data': {'array': list(parent)}, 'highlights': [a, b], 'description': 'quick-find union'})
    for a, b in ops:
        union(a, b)
    trace('done', {'data': {'array': list(parent)}, 'description': 'quick-find done'})

ops = data if isinstance(data, list) and data else [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [4, 6], [0, 4]]
quick_find(ops)
`;

export const pyUnionFindPC = `def union_find_pc(ops):
    parent = list(range(8))
    rank = [0] * 8
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
            trace('compress', {'data': {'array': list(parent)}, 'highlights': [x], 'description': 'path compression'})
        return parent[x]
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return
        if rank[ra] < rank[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        if rank[ra] == rank[rb]:
            rank[ra] += 1
        trace('union', {'data': {'array': list(parent)}, 'highlights': [a, b], 'description': 'rank union'})
    for a, b in ops:
        union(a, b)
    trace('done', {'data': {'array': list(parent)}, 'description': 'compressed union-find done'})

ops = data if isinstance(data, list) and data else [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [4, 6], [0, 4]]
union_find_pc(ops)
`;

export const pyLcsRecursive = `def lcs_rec(a, b):
    def solve(i, j):
        if i < 0 or j < 0:
            return 0
        if a[i] == b[j]:
            trace('match', {'data': {'array': [i, j]}, 'highlights': [i, j], 'pointers': {'i': i, 'j': j}, 'description': 'letters match'})
            return solve(i - 1, j - 1) + 1
        return max(solve(i - 1, j), solve(i, j - 1))
    result = solve(len(a) - 1, len(b) - 1)
    trace('done', {'data': {'array': []}, 'description': 'lcs length ' + str(result)})
    return result

lcs_rec(list(data['text1']), list(data['text2']))
`;

export const pyLcsDP = `def lcs_dp(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
            trace('cell', {'data': {'matrix': [row[:] for row in dp]}, 'highlights': [i, j], 'pointers': {'i': i, 'j': j}, 'description': 'fill lcs cell'})
    trace('done', {'data': {'matrix': dp}, 'description': 'lcs length ' + str(dp[m][n])})
    return dp[m][n]

lcs_dp(list(data['text1']), list(data['text2']))
`;

export const pyCoinChangeRec = `def coin_change_rec(coins, amount):
    def solve(rem):
        if rem == 0:
            return 0
        if rem < 0:
            return 10**9
        best = 10**9
        for coin in coins:
            trace('try', {'data': {'array': [rem, rem - coin]}, 'pointers': {'amount': rem, 'coin': coin}, 'description': 'try coin'})
            best = min(best, solve(rem - coin) + 1)
        return best
    result = solve(amount)
    trace('done', {'data': {'array': []}, 'description': 'min coins ' + str(result)})

coin_change_rec(data, 11)
`;

export const pyCoinChangeDP = `def coin_change_dp(coins, amount):
    dp = [10**9] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if i >= coin:
                dp[i] = min(dp[i], dp[i - coin] + 1)
            view = [-1 if v >= 10**9 else v for v in dp]
            trace('try-coin', {'data': {'array': view}, 'highlights': [i], 'pointers': {'amount': i, 'coin': coin}, 'description': 'update coin dp'})
    trace('done', {'data': {'array': [-1 if v >= 10**9 else v for v in dp]}, 'description': 'coin change done'})

coin_change_dp(data, 11)
`;

export const pyEditDistanceRec = `def edit_distance_rec(a, b):
    def solve(i, j):
        if i == 0:
            return j
        if j == 0:
            return i
        cost = 0 if a[i - 1] == b[j - 1] else 1
        result = min(solve(i - 1, j) + 1, solve(i, j - 1) + 1, solve(i - 1, j - 1) + cost)
        trace('calc', {'data': {'array': [i, j]}, 'highlights': [i, j], 'pointers': {'i': i, 'j': j}, 'description': 'edit subproblem'})
        return result
    result = solve(len(a), len(b))
    trace('done', {'data': {'array': []}, 'description': 'edit distance ' + str(result)})

edit_distance_rec(list(data['text1']), list(data['text2']))
`;

export const pyEditDistanceDP = `def edit_distance_dp(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
            trace('cell', {'data': {'matrix': [row[:] for row in dp]}, 'highlights': [i, j], 'pointers': {'i': i, 'j': j}, 'description': 'fill edit cell'})
    trace('done', {'data': {'matrix': dp}, 'description': 'edit distance ' + str(dp[m][n])})

edit_distance_dp(list(data['text1']), list(data['text2']))
`;

export const pyUniquePathsRec = `def unique_paths_rec(m, n):
    def solve(i, j):
        if i == 0 or j == 0:
            return 1
        result = solve(i - 1, j) + solve(i, j - 1)
        trace('calc', {'data': {'array': [i, j]}, 'highlights': [i, j], 'pointers': {'i': i, 'j': j}, 'description': 'grid subproblem'})
        return result
    result = solve(m - 1, n - 1)
    trace('done', {'data': {'array': []}, 'description': 'paths ' + str(result)})

unique_paths_rec(data[0], data[1])
`;

export const pyUniquePathsDP = `def unique_paths_dp(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
            trace('cell', {'data': {'matrix': [row[:] for row in dp]}, 'highlights': [i, j], 'pointers': {'i': i, 'j': j}, 'description': 'path cell'})
    trace('done', {'data': {'matrix': dp}, 'description': 'paths ' + str(dp[m - 1][n - 1])})

unique_paths_dp(data[0], data[1])
`;

export const pyHouseRobberRec = `def robber_rec(nums):
    def solve(i):
        if i < 0:
            return 0
        result = max(solve(i - 1), solve(i - 2) + nums[i])
        trace('calc', {'data': {'array': list(nums)}, 'highlights': [i], 'description': 'choose house recursively'})
        return result
    result = solve(len(nums) - 1)
    trace('done', {'data': {'array': list(nums)}, 'description': 'max value ' + str(result)})

robber_rec(data)
`;

export const pyHouseRobberDP = `def robber_dp(nums):
    if not nums:
        return 0
    dp = [0] * len(nums)
    dp[0] = nums[0]
    for i in range(1, len(nums)):
        dp[i] = max(dp[i - 1], (dp[i - 2] if i > 1 else 0) + nums[i])
        trace('calc', {'data': {'array': list(dp)}, 'highlights': [i], 'description': 'patrol decision dp'})
    trace('done', {'data': {'array': list(dp)}, 'description': 'max value ' + str(dp[-1])})

robber_dp(data)
`;

const pyTreeRoot = `root = data.get('tree', data) if isinstance(data, dict) else data
`;

export const pyTreeHeightRec = `${pyTreeRoot}
def height(node):
    if not node:
        return 0
    result = 1 + max(height(node.get('left')), height(node.get('right')))
    trace('height', {'data': {'tree': root, 'current': node.get('value')}, 'highlights': [node.get('value')], 'description': 'compute tree height'})
    return result

result = height(root)
trace('done', {'data': {'tree': root}, 'description': 'height ' + str(result)})
`;

export const pyTreeHeightBFS = `${pyTreeRoot}
def height_bfs(root):
    if not root:
        return 0
    queue = [root]
    level = 0
    while queue:
        values = [node.get('value') for node in queue]
        trace('level', {'data': {'tree': root, 'array': values}, 'highlights': values, 'description': 'scan forest layer'})
        nxt = []
        for node in queue:
            if node.get('left'):
                nxt.append(node.get('left'))
            if node.get('right'):
                nxt.append(node.get('right'))
        queue = nxt
        level += 1
    trace('done', {'data': {'tree': root}, 'description': 'height ' + str(level)})

height_bfs(root)
`;

export const pyValidateBSTRange = `${pyTreeRoot}
def valid(node, lo, hi):
    if not node:
        return True
    value = node.get('value')
    if not (lo < value < hi):
        trace('invalid', {'data': {'tree': root, 'current': value}, 'highlights': [value], 'description': 'range violation'})
        return False
    trace('valid', {'data': {'tree': root, 'current': value}, 'highlights': [value], 'description': 'node inside range'})
    return valid(node.get('left'), lo, value) and valid(node.get('right'), value, hi)

ok = valid(root, float('-inf'), float('inf'))
trace('done', {'data': {'tree': root}, 'description': 'is bst ' + str(ok)})
`;

export const pyValidateBSTInorder = `${pyTreeRoot}
values = []
def inorder(node):
    if not node:
        return
    inorder(node.get('left'))
    values.append(node.get('value'))
    trace('visit', {'data': {'tree': root, 'array': list(values)}, 'highlights': [node.get('value')], 'description': 'inorder visit'})
    inorder(node.get('right'))

inorder(root)
ok = all(values[i - 1] < values[i] for i in range(1, len(values)))
trace('done', {'data': {'tree': root, 'array': values}, 'description': 'is bst ' + str(ok)})
`;

export const pyLcaPath = `${pyTreeRoot}
def path_to(node, target, path):
    if not node:
        return False
    path.append(node.get('value'))
    if node.get('value') == target:
        return True
    if path_to(node.get('left'), target, path) or path_to(node.get('right'), target, path):
        return True
    path.pop()
    return False

p1, p2 = [], []
path_to(root, 4, p1)
path_to(root, 5, p2)
trace('paths', {'data': {'tree': root, 'array': p1}, 'highlights': p1, 'description': 'first patrol path'})
trace('paths', {'data': {'tree': root, 'array': p2}, 'highlights': p2, 'description': 'second patrol path'})
lca = -1
for a, b in zip(p1, p2):
    if a == b:
        lca = a
    else:
        break
trace('done', {'data': {'tree': root, 'array': [lca]}, 'highlights': [lca], 'description': 'lca ' + str(lca)})
`;

export const pyLcaRecursive = `${pyTreeRoot}
def lca(node, p, q):
    if not node:
        return None
    value = node.get('value')
    if value == p or value == q:
        trace('found', {'data': {'tree': root, 'current': value}, 'highlights': [value], 'description': 'found target'})
        return node
    left = lca(node.get('left'), p, q)
    right = lca(node.get('right'), p, q)
    if left and right:
        trace('lca', {'data': {'tree': root, 'current': value}, 'highlights': [value], 'description': 'lowest shared station'})
        return node
    return left or right

node = lca(root, 4, 5)
trace('done', {'data': {'tree': root}, 'highlights': [node.get('value')] if node else [], 'description': 'lca done'})
`;

export const pyTraversalRecursive = `${pyTreeRoot}
pre, ino, post = [], [], []
def dfs(node):
    if not node:
        return
    pre.append(node.get('value'))
    trace('pre', {'data': {'tree': root, 'array': list(pre)}, 'highlights': [node.get('value')], 'description': 'preorder'})
    dfs(node.get('left'))
    ino.append(node.get('value'))
    trace('in', {'data': {'tree': root, 'array': list(ino)}, 'highlights': [node.get('value')], 'description': 'inorder'})
    dfs(node.get('right'))
    post.append(node.get('value'))
    trace('post', {'data': {'tree': root, 'array': list(post)}, 'highlights': [node.get('value')], 'description': 'postorder'})

dfs(root)
trace('done', {'data': {'tree': root, 'array': pre}, 'highlights': pre, 'description': 'recursive traversal done'})
`;

export const pyTraversalIterative = `${pyTreeRoot}
pre, ino, post = [], [], []
stack = [(root, 0)]
while stack:
    node, state = stack.pop()
    if not node:
        continue
    value = node.get('value')
    if state == 0:
        pre.append(value)
        trace('pre', {'data': {'tree': root, 'array': list(pre)}, 'highlights': [value], 'description': 'preorder iterative'})
        stack.append((node, 1))
        stack.append((node.get('left'), 0))
    elif state == 1:
        ino.append(value)
        trace('in', {'data': {'tree': root, 'array': list(ino)}, 'highlights': [value], 'description': 'inorder iterative'})
        stack.append((node, 2))
        stack.append((node.get('right'), 0))
    else:
        post.append(value)
        trace('post', {'data': {'tree': root, 'array': list(post)}, 'highlights': [value], 'description': 'postorder iterative'})
trace('done', {'data': {'tree': root, 'array': pre}, 'highlights': pre, 'description': 'iterative traversal done'})
`;

export const pyLinearSearch = `def linear_search(input_data):
    arr = input_data.get('array', input_data) if isinstance(input_data, dict) else input_data
    target = input_data.get('target', arr[-1]) if isinstance(input_data, dict) else arr[-1]
    for i, value in enumerate(arr):
        trace('compare', {'data': {'array': list(arr), 'target': target}, 'highlights': [i], 'pointers': {'i': i}, 'description': 'linear compare'})
        if value == target:
            trace('found', {'data': {'array': list(arr), 'target': target}, 'highlights': [i], 'description': 'target found'})
            return i
    trace('not-found', {'data': {'array': list(arr), 'target': target}, 'description': 'not found'})
    return -1

linear_search(data)
`;

export const pyBinarySearch = `def binary_search(input_data):
    arr = input_data.get('array', input_data) if isinstance(input_data, dict) else input_data
    target = input_data.get('target', arr[-1]) if isinstance(input_data, dict) else arr[-1]
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        trace('compare', {'data': {'array': list(arr), 'target': target}, 'highlights': [mid], 'pointers': {'left': left, 'right': right, 'mid': mid}, 'description': 'binary compare'})
        if arr[mid] == target:
            trace('found', {'data': {'array': list(arr), 'target': target}, 'highlights': [mid], 'description': 'target found'})
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
        trace('range', {'data': {'array': list(arr), 'target': target}, 'highlights': [max(0, left), max(0, right)], 'pointers': {'left': left, 'right': right}, 'description': 'narrow search range'})
    trace('not-found', {'data': {'array': list(arr), 'target': target}, 'description': 'not found'})
    return -1

binary_search(data)
`;

export const pyTwoSumBrute = `def two_sum_brute(input_data):
    arr = input_data.get('array', input_data)
    target = input_data.get('target', 9)
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            trace('check', {'data': {'array': list(arr), 'target': target}, 'highlights': [i, j], 'description': 'check pair'})
            if arr[i] + arr[j] == target:
                trace('found', {'data': {'array': list(arr), 'target': target}, 'highlights': [i, j], 'description': 'pair found'})
                return [i, j]
    return []

two_sum_brute(data)
`;

export const pyTwoSumHash = `def two_sum_hash(input_data):
    arr = input_data.get('array', input_data)
    target = input_data.get('target', 9)
    seen = {}
    for i, value in enumerate(arr):
        need = target - value
        trace('check', {'data': {'array': list(arr), 'target': target}, 'highlights': [i], 'description': 'lookup complement'})
        if need in seen:
            trace('found', {'data': {'array': list(arr), 'target': target}, 'highlights': [seen[need], i], 'description': 'pair found'})
            return [seen[need], i]
        seen[value] = i
        trace('hash', {'data': {'array': list(arr), 'target': target}, 'highlights': [i], 'description': 'store value'})
    return []

two_sum_hash(data)
`;

export const pyRotatedLinear = `def rotated_linear(input_data):
    arr = input_data.get('array', input_data)
    target = input_data.get('target', 0)
    for i, value in enumerate(arr):
        trace('check', {'data': {'array': list(arr), 'target': target}, 'highlights': [i], 'description': 'scan rotated array'})
        if value == target:
            trace('found', {'data': {'array': list(arr), 'target': target}, 'highlights': [i], 'description': 'target found'})
            return i
    return -1

rotated_linear(data)
`;

export const pyRotatedBinary = `def rotated_binary(input_data):
    arr = input_data.get('array', input_data)
    target = input_data.get('target', 0)
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        trace('check', {'data': {'array': list(arr), 'target': target}, 'highlights': [mid], 'pointers': {'left': left, 'right': right, 'mid': mid}, 'description': 'rotated binary check'})
        if arr[mid] == target:
            trace('found', {'data': {'array': list(arr), 'target': target}, 'highlights': [mid], 'description': 'target found'})
            return mid
        if arr[left] <= arr[mid]:
            if arr[left] <= target < arr[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if arr[mid] < target <= arr[right]:
                left = mid + 1
            else:
                right = mid - 1
    return -1

rotated_binary(data)
`;

export const pyPeakLinear = `def peak_linear(arr):
    for i, value in enumerate(arr):
        left_ok = i == 0 or value > arr[i - 1]
        right_ok = i == len(arr) - 1 or value > arr[i + 1]
        trace('check', {'data': {'array': list(arr)}, 'highlights': [i], 'description': 'check peak'})
        if left_ok and right_ok:
            trace('found', {'data': {'array': list(arr)}, 'highlights': [i], 'description': 'peak found'})
            return i
    return -1

peak_linear(data)
`;

export const pyPeakBinary = `def peak_binary(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        mid = (left + right) // 2
        trace('check', {'data': {'array': list(arr)}, 'highlights': [mid], 'description': 'check slope'})
        if arr[mid] > arr[mid + 1]:
            right = mid
        else:
            left = mid + 1
    trace('found', {'data': {'array': list(arr)}, 'highlights': [left], 'description': 'peak found'})
    return left

peak_binary(data)
`;

export const pyNaiveStringSearch = `def naive_search(input_data):
    text = input_data.get('text', input_data) if isinstance(input_data, dict) else input_data
    pattern = input_data.get('pattern', '') if isinstance(input_data, dict) else ''
    for i in range(0, len(text) - len(pattern) + 1):
        trace('check', {'data': {'text': text, 'pattern': pattern}, 'highlights': [i], 'description': 'try text position'})
        ok = True
        for j in range(len(pattern)):
            trace('compare', {'data': {'text': text, 'pattern': pattern}, 'highlights': [i + j], 'description': 'compare character'})
            if text[i + j] != pattern[j]:
                ok = False
                break
        if ok:
            trace('found', {'data': {'text': text, 'pattern': pattern}, 'highlights': [i], 'description': 'match found'})
    trace('done', {'data': {'text': text, 'pattern': pattern}, 'description': 'search done'})

naive_search(data)
`;

export const pyKmpSearch = `def kmp_search(input_data):
    text = input_data.get('text', input_data) if isinstance(input_data, dict) else input_data
    pattern = input_data.get('pattern', '') if isinstance(input_data, dict) else ''
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length:
            length = lps[length - 1]
        else:
            i += 1
    trace('lps', {'data': {'array': list(lps)}, 'description': 'build lps'})
    i = j = 0
    while i < len(text):
        if j < len(pattern) and text[i] == pattern[j]:
            i += 1; j += 1
        if j == len(pattern) and pattern:
            trace('found', {'data': {'text': text, 'pattern': pattern}, 'highlights': [i - j], 'description': 'kmp match'})
            j = lps[j - 1]
        elif i < len(text) and (not pattern or text[i] != pattern[j]):
            if j:
                j = lps[j - 1]
                trace('skip', {'data': {'text': text, 'pattern': pattern}, 'highlights': [i], 'description': 'skip by lps'})
            else:
                i += 1
    trace('done', {'data': {'text': text, 'pattern': pattern}, 'description': 'kmp done'})

kmp_search(data)
`;

export const pyPalindromeBrute = `def palindrome_brute(s):
    best = (0, 0)
    def is_pal(l, r):
        while l < r:
            if s[l] != s[r]:
                return False
            l += 1; r -= 1
        return True
    for i in range(len(s)):
        for j in range(i, len(s)):
            trace('check', {'data': {'text': s}, 'highlights': [i, j], 'description': 'check palindrome'})
            if is_pal(i, j) and j - i > best[1] - best[0]:
                best = (i, j)
    trace('done', {'data': {'text': s}, 'highlights': [best[0], best[1]], 'description': 'longest palindrome'})

palindrome_brute(data)
`;

export const pyPalindromeCenter = `def palindrome_center(s):
    best = (0, 0)
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1; r += 1
        return (l + 1, r - 1)
    for i in range(len(s)):
        for pair in (expand(i, i), expand(i, i + 1)):
            trace('center', {'data': {'text': s}, 'highlights': [i, i], 'pointers': {'left': i, 'right': i}, 'description': 'check center'})
            trace('expand', {'data': {'text': s}, 'highlights': [pair[0], pair[1]], 'description': 'expand center'})
            if pair[1] - pair[0] > best[1] - best[0]:
                best = pair
    trace('done', {'data': {'text': s}, 'highlights': [best[0], best[1]], 'description': 'longest palindrome'})

palindrome_center(data)
`;

export const pyAnagramSort = `def anagram_sort(input_data):
    a = input_data.get('text1', '')
    b = input_data.get('text2', '')
    sa = ''.join(sorted(a))
    sb = ''.join(sorted(b))
    for i, ch in enumerate(sa):
        trace('sort-left', {'data': {'text': sa, 'text1': sa, 'text2': sb, 'activeChar': ch}, 'highlights': [i], 'pointers': {'i': i, 'side': 'left'}, 'description': 'sort first word char'})
    for i, ch in enumerate(sb):
        trace('sort-right', {'data': {'text': sa, 'text1': sa, 'text2': sb, 'activeChar': ch}, 'highlights': [20 + i], 'pointers': {'i': i, 'side': 'right'}, 'description': 'sort second word char'})
    trace('sort', {'data': {'text': sa}, 'description': 'sort first word'})
    trace('sort', {'data': {'text': sb}, 'description': 'sort second word'})
    trace('done', {'data': {'text': sa + '|' + sb}, 'description': 'anagram ' + str(sa == sb)})

anagram_sort(data)
`;

export const pyAnagramHash = `def anagram_hash(input_data):
    a = input_data.get('text1', '')
    b = input_data.get('text2', '')
    count = {}
    for i, ch in enumerate(a):
        count[ch] = count.get(ch, 0) + 1
        trace('count-left', {'data': {'text': a, 'text1': a, 'text2': b, 'counts': dict(count), 'activeChar': ch}, 'highlights': [i], 'pointers': {'i': i, 'side': 'left'}, 'description': 'count first word char'})
    trace('count', {'data': {'array': list(count.values())}, 'description': 'count first word'})
    for i, ch in enumerate(b):
        count[ch] = count.get(ch, 0) - 1
        trace('count-right', {'data': {'text': a, 'text1': a, 'text2': b, 'counts': dict(count), 'activeChar': ch}, 'highlights': [20 + i], 'pointers': {'i': i, 'side': 'right'}, 'description': 'consume second word char'})
    ok = all(v == 0 for v in count.values())
    trace('done', {'data': {'array': list(count.values())}, 'description': 'anagram ' + str(ok)})

anagram_hash(data)
`;

export const pyLongestSubstringBrute = `def longest_substring_brute(s):
    best = 0
    for i in range(len(s)):
        seen = set()
        for j in range(i, len(s)):
            if s[j] in seen:
                trace('dup', {'data': {'text': s}, 'highlights': [i, j], 'description': 'duplicate stops window'})
                break
            seen.add(s[j])
            best = max(best, j - i + 1)
            trace('extend', {'data': {'text': s}, 'highlights': [i, j], 'description': 'extend window'})
    trace('done', {'data': {'text': s}, 'description': 'best length ' + str(best)})

longest_substring_brute(data)
`;

export const pyLongestSubstringSliding = `def longest_substring_sliding(s):
    seen = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
            trace('slide', {'data': {'text': s}, 'highlights': [left, right], 'description': 'move left boundary'})
        seen[ch] = right
        best = max(best, right - left + 1)
        trace('window', {'data': {'text': s}, 'highlights': [left, right], 'description': 'sliding window'})
    trace('done', {'data': {'text': s}, 'description': 'best length ' + str(best)})

longest_substring_sliding(data)
`;

export const pythonMoreTemplates: AlgorithmTemplate[] = [
  { id: 'py-selection-sort', name: 'Selection Sort -> Heap Sort', category: 'sorting', language: 'python', naiveCode: pySelectionSort, optimizedCode: pyHeapSort, defaultData: [29, 10, 14, 37, 13, 33, 48, 22] },
  { id: 'py-insertion-sort', name: 'Insertion Sort -> Shell Sort', category: 'sorting', language: 'python', naiveCode: pyInsertionSort, optimizedCode: pyShellSort, defaultData: [12, 34, 54, 2, 3, 8, 19, 27] },
  { id: 'py-merge-sort', name: 'Merge Sort Recursive -> Iterative', category: 'sorting', language: 'python', naiveCode: pyMergeSortRecursive, optimizedCode: pyMergeSortIterative, defaultData: [38, 27, 43, 3, 9, 82, 10, 53] },
  { id: 'py-non-compare-sort', name: 'Counting Sort -> Radix Sort', category: 'sorting', language: 'python', naiveCode: pyCountingSort, optimizedCode: pyRadixSort, defaultData: [170, 45, 75, 90, 2, 802, 2, 66] },
  { id: 'py-dijkstra', name: 'Dijkstra Naive -> Priority Queue', category: 'graph', language: 'python', naiveCode: pyDijkstraNaive, optimizedCode: pyDijkstraPQ, defaultData: graphData },
  { id: 'py-prim', name: 'Prim Naive -> Heap Frontier', category: 'graph', language: 'python', naiveCode: pyPrimNaive, optimizedCode: pyPrimHeap, defaultData: graphData },
  { id: 'py-union-find', name: 'QuickFind -> Path Compression', category: 'graph', language: 'python', naiveCode: pyUnionFindQuick, optimizedCode: pyUnionFindPC, defaultData: [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [4, 6], [0, 4]] },
  { id: 'py-lcs', name: 'LCS Recursive -> DP', category: 'dp', language: 'python', naiveCode: pyLcsRecursive, optimizedCode: pyLcsDP, defaultData: { text1: 'ABCBDAB', text2: 'BDCABA' } },
  { id: 'py-coin-change', name: 'Coin Change Recursive -> DP', category: 'dp', language: 'python', naiveCode: pyCoinChangeRec, optimizedCode: pyCoinChangeDP, defaultData: [1, 2, 5] },
  { id: 'py-edit-distance', name: 'Edit Distance Recursive -> DP', category: 'dp', language: 'python', naiveCode: pyEditDistanceRec, optimizedCode: pyEditDistanceDP, defaultData: { text1: 'kitten', text2: 'sitting' } },
  { id: 'py-unique-paths', name: 'Unique Paths Recursive -> DP', category: 'dp', language: 'python', naiveCode: pyUniquePathsRec, optimizedCode: pyUniquePathsDP, defaultData: [3, 7] },
  { id: 'py-house-robber', name: 'House Robber Recursive -> DP', category: 'dp', language: 'python', naiveCode: pyHouseRobberRec, optimizedCode: pyHouseRobberDP, defaultData: [2, 7, 9, 3, 1, 5, 6, 4] },
  { id: 'py-tree-height', name: 'Tree Height Recursive -> BFS', category: 'tree', language: 'python', naiveCode: pyTreeHeightRec, optimizedCode: pyTreeHeightBFS, defaultData: treeData },
  { id: 'py-validate-bst', name: 'Validate BST Range -> Inorder', category: 'tree', language: 'python', naiveCode: pyValidateBSTRange, optimizedCode: pyValidateBSTInorder, defaultData: treeData },
  { id: 'py-lca', name: 'LCA Paths -> Recursive', category: 'tree', language: 'python', naiveCode: pyLcaPath, optimizedCode: pyLcaRecursive, defaultData: treeData },
  { id: 'py-traversals', name: 'Traversals Recursive -> Iterative', category: 'tree', language: 'python', naiveCode: pyTraversalRecursive, optimizedCode: pyTraversalIterative, defaultData: treeData },
  { id: 'py-linear-binary', name: 'Linear Search -> Binary Search', category: 'search', language: 'python', naiveCode: pyLinearSearch, optimizedCode: pyBinarySearch, defaultData: { array: [3, 9, 13, 17, 21, 25, 33, 41, 55, 67], target: 33 } },
  { id: 'py-two-sum', name: 'Two Sum Brute -> Hash', category: 'search', language: 'python', naiveCode: pyTwoSumBrute, optimizedCode: pyTwoSumHash, defaultData: { array: [2, 7, 11, 15, 3, 6, 9], target: 9 } },
  { id: 'py-rotated-array', name: 'Rotated Array Linear -> Binary', category: 'search', language: 'python', naiveCode: pyRotatedLinear, optimizedCode: pyRotatedBinary, defaultData: { array: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
  { id: 'py-peak', name: 'Peak Linear -> Binary', category: 'search', language: 'python', naiveCode: pyPeakLinear, optimizedCode: pyPeakBinary, defaultData: [1, 2, 3, 5, 6, 4, 3, 2] },
  { id: 'py-string-search', name: 'Naive String Search -> KMP', category: 'string', language: 'python', naiveCode: pyNaiveStringSearch, optimizedCode: pyKmpSearch, defaultData: { text: 'ABABDABACDABABCABAB', pattern: 'ABABCABAB' } },
  { id: 'py-longest-palindrome', name: 'Longest Palindrome Brute -> Center', category: 'string', language: 'python', naiveCode: pyPalindromeBrute, optimizedCode: pyPalindromeCenter, defaultData: 'babadabad' },
  { id: 'py-anagram', name: 'Anagram Sort -> Hash', category: 'string', language: 'python', naiveCode: pyAnagramSort, optimizedCode: pyAnagramHash, defaultData: { text1: 'anagram', text2: 'nagaram' } },
  { id: 'py-longest-substring', name: 'Longest Substring Brute -> Sliding Window', category: 'string', language: 'python', naiveCode: pyLongestSubstringBrute, optimizedCode: pyLongestSubstringSliding, defaultData: 'abcabcbb' },
];
