import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function renderGraphSide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  if (!snapshot) return null;
  const data = snapshot.data;
  const graphData = (data?.graph ?? data) as { nodes?: { id: number; label?: string }[]; edges?: { from: number; to: number; weight?: number }[] } | undefined;
  const highlights = snapshot.highlights ?? [];
  const pointers = snapshot.pointers ?? {};

  const nodes = graphData?.nodes ?? [];
  const edges = graphData?.edges ?? [];

  if (nodes.length === 0) return null;

  const count = nodes.length;
  const radius = Math.min(count * 0.55, 2.5);
  const layout = nodes.map((n, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
  });

  return (
    <group position={[xOffset, 0, 0]}>
      <Text position={[0, 2.2, 0]} fontSize={0.22} color={`hsl(${hue}, 70%, 60%)`}>
        {label}
      </Text>
      {/* Edges */}
      {edges.map((e, i) => {
        const from = layout.find((n) => n.id === e.from);
        const to = layout.find((n) => n.id === e.to);
        if (!from || !to) return null;
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        const hl = highlights.includes(e.from) || highlights.includes(e.to);
        return (
          <mesh key={i} position={[(from.x + to.x) / 2, 0, (from.z + to.z) / 2]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.03, 0.03, len]} />
            <meshStandardMaterial color={hl ? '#4fc3f7' : '#555'} emissive={hl ? '#4fc3f7' : '#000'} emissiveIntensity={hl ? 0.5 : 0} />
          </mesh>
        );
      })}
      {/* Nodes */}
      {layout.map((n, i) => (
        <group key={n.id}>
          <mesh position={[n.x, 0, n.z]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color={highlights.includes(n.id) ? '#f59e0b' : `hsl(${hue}, 50%, 45%)`}
              emissive={highlights.includes(n.id) ? '#f59e0b' : '#000'}
              emissiveIntensity={highlights.includes(n.id) ? 0.5 : 0}
            />
          </mesh>
          <Text position={[n.x, 0.3, n.z]} fontSize={0.13} color="#ccc">
            {n.label ?? String(n.id)}
          </Text>
        </group>
      ))}
      {/* Pointer indicators */}
      {Object.entries(pointers).map(([name, idx]) => {
        const n = layout.find((nd) => nd.id === Number(idx));
        if (!n) return null;
        return (
          <Text key={name} position={[n.x, 0.7, n.z]} fontSize={0.15} color="#f472b6">
            {name}
          </Text>
        );
      })}
    </group>
  );
}

export default function GraphAbstract({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      {renderGraphSide(naiveSnapshot, -3.5, 'Naive (BFS)', 240)}
      {renderGraphSide(optimizedSnapshot, 3.5, 'Opt (DFS)', 140)}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[0.02, 5]} />
        <meshBasicMaterial color="#444" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function detectGraph(snapshot: TraceSnapshot): boolean {
  const nodes = snapshot.data?.['nodes'];
  const edges = snapshot.data?.['edges'];
  if (Array.isArray(nodes) && Array.isArray(edges)) return true;
  const v = snapshot.data?.['graph'];
  return !!(v && typeof v === 'object' && 'nodes' in (v as any));
}

export const graphAbstractDef = {
  id: 'graph-abstract',
  kind: 'abstract' as const,
  name: '图视图',
  detect: detectGraph,
  priority: 10,
  component: GraphAbstract,
};
