import type { AlgorithmTemplate } from '../core/types';

export const pyTreeBfs = `def build_tree(arr):
    if not arr:
        return None
    mid = len(arr) // 2
    return {
        'value': arr[mid],
        'children': [build_tree(arr[:mid]), build_tree(arr[mid+1:])]
    }

def bfs(root):
    if not root:
        return
    queue = [root]
    order = []
    while queue:
        node = queue.pop(0)
        order.append(node['value'])
        trace('visit', {
            'data': {'tree': root},
            'highlights': list(order),
            'description': f'BFS visit node {node["value"]}'
        })
        for c in (node.get('children') or []):
            if c:
                queue.append(c)

values = data if isinstance(data, list) and data else [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
bfs(build_tree(values))
`;

export const pyTreeDfs = `def build_tree(arr):
    if not arr:
        return None
    mid = len(arr) // 2
    return {
        'value': arr[mid],
        'children': [build_tree(arr[:mid]), build_tree(arr[mid+1:])]
    }

def dfs(node, order):
    if not node:
        return
    order.append(node['value'])
    trace('visit', {
        'data': {'tree': root},
        'highlights': list(order),
        'description': f'DFS visit node {node["value"]}'
    })
    for c in (node.get('children') or []):
        if c:
            dfs(c, order)

values = data if isinstance(data, list) and data else [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
root = build_tree(values)
dfs(root, [])
`;

export const pythonTreeTemplates: AlgorithmTemplate[] = [
  {
    id: 'py-tree-bfs-vs-dfs',
    name: '二叉树 BFS vs DFS',
    category: 'tree',
    language: 'python',
    naiveCode: pyTreeBfs,
    optimizedCode: pyTreeDfs,
    defaultData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
];
