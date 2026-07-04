import type { DataStructureKind } from '../core/types';

export interface DetectedData {
  kind: DataStructureKind;
  array?: number[];
  matrix?: number[][];
  graph?: { nodes: unknown[]; edges: unknown[] };
  tree?: Record<string, unknown>;
  target?: number;
  text?: string;
  pattern?: string;
}

export function detectData(data: Record<string, unknown> | undefined | null): DetectedData | null {
  if (!data || typeof data !== 'object') return null;

  // Direct nodes/edges (e.g. Dijkstra/Prim trace with { ...graph })
  const nodes = data['nodes'];
  const edges = data['edges'];
  if (Array.isArray(nodes) && Array.isArray(edges)) {
    return { kind: 'graph', graph: { nodes, edges } };
  }

  const arr = data['array'];
  if (Array.isArray(arr)) {
    if (data['target'] !== undefined) {
      return { kind: 'search', array: arr as number[], target: data['target'] as number };
    }
    if (arr.length > 0 && Array.isArray(arr[0])) {
      return { kind: 'matrix', matrix: arr as number[][] };
    }
    if (arr.every((v) => typeof v === 'number')) {
      return { kind: 'array', array: arr as number[] };
    }
    return { kind: 'array', array: arr as unknown as number[] };
  }

  const text = data['text'];
  if (typeof text === 'string') {
    return { kind: 'text', text, pattern: data['pattern'] as string | undefined };
  }

  const graph = data['graph'];
  if (graph && typeof graph === 'object' && 'nodes' in graph && 'edges' in (graph as any)) {
    return { kind: 'graph', graph: graph as { nodes: unknown[]; edges: unknown[] } };
  }

  const tree = data['tree'];
  if (tree && typeof tree === 'object' && 'value' in (tree as any)) {
    return { kind: 'tree', tree: tree as Record<string, unknown> };
  }

  return null;
}
