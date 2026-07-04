import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';
import { algorithmId } from '../algorithm-context';

interface TreeNode {
  value: number;
  children?: TreeNode[];
  left?: TreeNode | null;
  right?: TreeNode | null;
}

function flattenTree(node: TreeNode): { value: number; idx: number; depth: number; parentIdx: number }[] {
  const result: { value: number; idx: number; depth: number; parentIdx: number }[] = [];
  let idx = 0;
  const queue: { node: TreeNode; depth: number; parentIdx: number }[] = [{ node, depth: 0, parentIdx: -1 }];
  while (queue.length > 0) {
    const item = queue.shift()!;
    const curIdx = idx++;
    result.push({ value: item.node.value, idx: curIdx, depth: item.depth, parentIdx: item.parentIdx });
    const children = (item.node.children ?? [item.node.left, item.node.right].filter(Boolean)) as TreeNode[];
    if (children) {
      for (const child of children) {
        if (child) queue.push({ node: child, depth: item.depth + 1, parentIdx: curIdx });
      }
    }
  }
  return result;
}

function renderTreeSide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  if (!snapshot) return null;
  const data = snapshot.data;
  const tree = data?.tree as TreeNode | undefined;
  const highlights = snapshot.highlights ?? [];

  if (!tree) return null;

  const flat = flattenTree(tree);

  const depthCounts: number[] = [];
  flat.forEach((item) => { depthCounts[item.depth] = (depthCounts[item.depth] || 0) + 1; });

  const positions: { x: number; y: number; idx: number; parentIdx: number; val: number }[] = [];
  const offsets: number[] = [];
  flat.forEach((item) => {
    const count = depthCounts[item.depth] || 1;
    const off = offsets[item.depth] || 0;
    offsets[item.depth] = off + 1;
    positions.push({
      x: (off - (count - 1) / 2) * 1.08,
      y: -item.depth * 0.92,
      idx: item.idx,
      parentIdx: item.parentIdx,
      val: item.value,
    });
  });

  const rootY = positions.length > 0 ? -positions[0].y : 0;

  return (
    <group position={[xOffset, 0, 0]}>
      <Text position={[0, 2.0, 0]} fontSize={0.22} color={`hsl(${hue}, 70%, 60%)`}>
        {label}
      </Text>
      {/* Connection lines */}
      {positions.map((p) => {
        if (p.parentIdx < 0) return null;
        const parent = positions.find((q) => q.idx === p.parentIdx);
        if (!parent) return null;
        const dx = p.x - parent.x;
        const dy = p.y - parent.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dx, dy);
        const hl = highlights.includes(p.val) || (parent ? highlights.includes(parent.val) : false);
        return (
          <mesh key={p.idx} position={[(p.x + parent.x) / 2, rootY + (p.y + parent.y) / 2, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.032, 0.032, len]} />
            <meshStandardMaterial color={hl ? '#4fc3f7' : '#555'} emissive={hl ? '#4fc3f7' : '#000'} emissiveIntensity={hl ? 0.5 : 0} />
          </mesh>
        );
      })}
      {/* Nodes */}
      {positions.map((p) => (
        <group key={p.idx}>
          <mesh position={[p.x, rootY + p.y, 0]}>
            <sphereGeometry args={[0.2, 14, 12]} />
            <meshStandardMaterial
              color={highlights.includes(p.val) ? '#f59e0b' : `hsl(${hue}, 50%, 45%)`}
              emissive={highlights.includes(p.val) ? '#f59e0b' : '#000'}
              emissiveIntensity={highlights.includes(p.val) ? 0.5 : 0}
            />
          </mesh>
          <Text position={[p.x, rootY + p.y - 0.34, 0]} fontSize={0.13} color="#d1d5db" outlineWidth={0.004} outlineColor="#111827">
            {String(p.val)}
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function TreeAbstract({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const labelMap: Record<string, [string, string]> = {
    'tree-height': ['递归高度', 'BFS 层序高度'],
    'validate-bst': ['范围校验', '中序校验'],
    lca: ['路径收集', '递归回溯'],
    traversals: ['递归遍历', '迭代遍历'],
  };
  const [leftLabel, rightLabel] = labelMap[algorithmId] ?? ['朴素树', '优化树'];
  const left = renderTreeSide(naiveSnapshot, -4.2, leftLabel, 240);
  const right = renderTreeSide(optimizedSnapshot, 4.2, rightLabel, 140);

  if (!left && !right) {
    return <Text position={[0, 0, 0]} fontSize={0.4} color="#666">等待数据...</Text>;
  }

  return (
    <group>
      {left}
      {right}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[0.02, 5]} />
        <meshBasicMaterial color="#444" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function detectTree(snapshot: TraceSnapshot): boolean {
  const tree = snapshot.data?.['tree'];
  return !!(tree && typeof tree === 'object' && 'value' in (tree as any));
}

export const treeAbstractDef = {
  id: 'tree-abstract',
  kind: 'abstract' as const,
  name: '树视图',
  detect: detectTree,
  priority: 10,
  component: TreeAbstract,
};
