import type { AlgorithmTemplate } from '../core/types';

export const pyBfs = `def bfs(graph, start):
    visited = {start}
    order = []
    queue = [start]
    while queue:
        node = queue.pop(0)
        order.append(node)
        trace('visit', {
            'data': {'graph': graph},
            'highlights': list(order),
            'pointers': {'current': node, 'queueLen': len(queue)},
            'description': f'BFS explore node {node}'
        })
        for e in graph['edges']:
            if e['from'] == node and e['to'] not in visited:
                visited.add(e['to'])
                queue.append(e['to'])
    return order

graph = {
    'nodes': [{'id': 0, 'label': 'A'}, {'id': 1, 'label': 'B'}, {'id': 2, 'label': 'C'},
              {'id': 3, 'label': 'D'}, {'id': 4, 'label': 'E'}, {'id': 5, 'label': 'F'}],
    'edges': [{'from': 0, 'to': 1, 'weight': 2}, {'from': 0, 'to': 2, 'weight': 4},
              {'from': 1, 'to': 3, 'weight': 3}, {'from': 2, 'to': 3, 'weight': 1},
              {'from': 2, 'to': 4, 'weight': 5}, {'from': 3, 'to': 5, 'weight': 2},
              {'from': 4, 'to': 5, 'weight': 1}]
}
graph = data if isinstance(data, dict) and data.get('nodes') else graph
bfs(graph, 0)
`;

export const pyDfs = `def dfs(graph, start):
    visited = set()
    order = []

    def explore(node):
        visited.add(node)
        order.append(node)
        trace('visit', {
            'data': {'graph': graph},
            'highlights': list(order),
            'pointers': {'current': node},
            'description': f'DFS explore node {node}'
        })
        for e in graph['edges']:
            if e['from'] == node and e['to'] not in visited:
                explore(e['to'])

    explore(start)
    return order

graph = {
    'nodes': [{'id': 0, 'label': 'A'}, {'id': 1, 'label': 'B'}, {'id': 2, 'label': 'C'},
              {'id': 3, 'label': 'D'}, {'id': 4, 'label': 'E'}, {'id': 5, 'label': 'F'}],
    'edges': [{'from': 0, 'to': 1, 'weight': 2}, {'from': 0, 'to': 2, 'weight': 4},
              {'from': 1, 'to': 3, 'weight': 3}, {'from': 2, 'to': 3, 'weight': 1},
              {'from': 2, 'to': 4, 'weight': 5}, {'from': 3, 'to': 5, 'weight': 2},
              {'from': 4, 'to': 5, 'weight': 1}]
}
graph = data if isinstance(data, dict) and data.get('nodes') else graph
dfs(graph, 0)
`;

export const pythonGraphTemplates: AlgorithmTemplate[] = [
  {
    id: 'py-bfs-vs-dfs',
    name: 'BFS vs DFS 图遍历',
    category: 'graph',
    language: 'python',
    naiveCode: pyBfs,
    optimizedCode: pyDfs,
    defaultData: {
      nodes: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }, { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' }],
      edges: [{ from: 0, to: 1, weight: 2 }, { from: 0, to: 2, weight: 4 }, { from: 1, to: 3, weight: 3 }, { from: 2, to: 3, weight: 1 }, { from: 2, to: 4, weight: 5 }, { from: 3, to: 5, weight: 2 }, { from: 4, to: 5, weight: 1 }],
    },
  },
];
