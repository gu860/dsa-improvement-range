import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

interface TreeNode {
  value: number;
  children?: TreeNode[];
}

function flattenTree(node: TreeNode): { value: number; idx: number; depth: number; parentIdx: number }[] {
  const result: { value: number; idx: number; depth: number; parentIdx: number }[] = [];
  let idx = 0;
  const queue: { node: TreeNode; depth: number; parentIdx: number }[] = [{ node, depth: 0, parentIdx: -1 }];
  while (queue.length > 0) {
    const item = queue.shift()!;
    const curIdx = idx++;
    result.push({ value: item.node.value, idx: curIdx, depth: item.depth, parentIdx: item.parentIdx });
    if (item.node.children) {
      for (const child of item.node.children) {
        if (child) queue.push({ node: child, depth: item.depth + 1, parentIdx: curIdx });
      }
    }
  }
  return result;
}

function Cabinet({ position, height, color, label, highlighted }: {
  position: [number, number, number];
  height: number;
  color: string;
  label?: string;
  highlighted?: boolean;
}) {
  const drawerCount = Math.max(2, Math.floor(height / 0.25));
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.5, height, 0.35]} />
        <meshStandardMaterial
          color={highlighted ? '#f59e0b' : color}
          emissive={highlighted ? '#f59e0b' : '#000'}
          emissiveIntensity={highlighted ? 0.4 : 0}
          roughness={0.6}
        />
      </mesh>
      {Array.from({ length: drawerCount }, (_, i) => {
        const y = (i + 0.5) * (height / drawerCount);
        return (
          <group key={i}>
            <mesh position={[0, y, 0.18]}><boxGeometry args={[0.38, 0.02, 0.02]} /><meshStandardMaterial color="#aaa" metalness={0.3} /></mesh>
            <mesh position={[0, y, 0.2]}><boxGeometry args={[0.06, 0.005, 0.01]} /><meshStandardMaterial color="#888" metalness={0.5} /></mesh>
            <mesh position={[0, y + 0.02, 0.18]}><boxGeometry args={[0.15, 0.015, 0.005]} /><meshStandardMaterial color="#eee" /></mesh>
          </group>
        );
      })}
      {label && <Text position={[0, height + 0.15, 0]} fontSize={0.08} color="#ccc">{label}</Text>}
    </group>
  );
}

function renderOfficeSide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  if (!snapshot) return null;
  const data = snapshot.data;
  const treeRoot = data?.tree as TreeNode | undefined;
  const highlights = snapshot.highlights ?? [];
  if (!treeRoot) return null;

  const flat = flattenTree(treeRoot);
  const depthCounts: number[] = [];
  flat.forEach((item) => { depthCounts[item.depth] = (depthCounts[item.depth] || 0) + 1; });

  const positions: { x: number; y: number; z: number; val: number; idx: number; parentIdx: number; depth: number }[] = [];
  const offsets: number[] = [];
  flat.forEach((item) => {
    const count = depthCounts[item.depth] || 1;
    const off = offsets[item.depth] || 0;
    offsets[item.depth] = off + 1;
    positions.push({
      x: (off - (count - 1) / 2) * 0.9,
      y: -item.depth * 0.9,
      z: 0,
      val: item.value,
      idx: item.idx,
      parentIdx: item.parentIdx,
      depth: item.depth,
    });
  });

  const rootY = positions.length > 0 ? -positions[0].y : 0;
  const colors = ['#5c6bc0', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#26a69a'];

  // Connection lines
  const connections: { from: [number, number, number]; to: [number, number, number]; hl: boolean }[] = [];
  for (const p of positions) {
    if (p.parentIdx < 0) continue;
    const parent = positions.find((q) => q.idx === p.parentIdx);
    if (parent) {
      connections.push({
        from: [parent.x, rootY + parent.y, parent.z],
        to: [p.x, rootY + p.y, p.z],
        hl: highlights.includes(p.idx) || highlights.includes(p.parentIdx),
      });
    }
  }

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Office floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, rootY - 1.5, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#d4cfc4" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, rootY - 1.48, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#c8c0b0" wireframe transparent opacity={0.1} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, rootY + 0.5, -2.2]}>
        <planeGeometry args={[6, 2.5]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.9} />
      </mesh>
      {/* Wall baseboard */}
      <mesh position={[0, rootY - 1.3, -2.19]}><boxGeometry args={[6, 0.06, 0.02]} /><meshStandardMaterial color="#c8c0b0" /></mesh>
      {/* Ceiling */}
      <mesh position={[0, rootY + 1.8, 0]}><boxGeometry args={[6, 0.02, 4]} /><meshStandardMaterial color="#eee" roughness={0.9} /></mesh>
      {/* Ceiling light */}
      <pointLight position={[0, rootY + 1.6, 0]} intensity={0.4} color="#fff8e0" distance={3} />

      {/* Connection lines */}
      {connections.map((c, i) => {
        const mid = { x: (c.from[0] + c.to[0]) / 2, y: (c.from[1] + c.to[1]) / 2, z: (c.from[2] + c.to[2]) / 2 };
        const midA: [number, number, number] = [mid.x, mid.y, mid.z];
        const dx = c.to[0] - c.from[0], dy = c.to[1] - c.from[1], dz = c.to[2] - c.from[2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const ax = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
        const ay = Math.atan2(dx, dz);
        return (
          <mesh key={i} position={midA} rotation={[ax, ay, 0]}>
            <boxGeometry args={[0.012, 0.012, len]} />
            <meshStandardMaterial color={c.hl ? '#4fc3f7' : '#666'} emissive={c.hl ? '#4fc3f7' : '#000'} emissiveIntensity={c.hl ? 0.5 : 0} />
          </mesh>
        );
      })}

      {/* Cabinets */}
      {positions.map((p, i) => {
        const h = Math.max(0.3, 0.7 - p.depth * 0.08);
        return (
          <Cabinet
            key={i}
            position={[p.x, rootY + p.y, p.z]}
            height={h}
            color={colors[Math.min(p.depth, colors.length - 1)]}
            label={String(p.val)}
            highlighted={highlights.includes(p.idx)}
          />
        );
      })}

      {/* Label */}
      <Text position={[0, rootY + 1.7, 0]} fontSize={0.2} color={`hsl(${hue}, 70%, 60%)`}>{label}</Text>
    </group>
  );
}

export default function FileSystemScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const left = renderOfficeSide(naiveSnapshot, -4, 'Naive (BFS)', 240);
  const right = renderOfficeSide(optimizedSnapshot, 4, 'Opt (DFS)', 140);

  if (!left && !right) {
    return <Text position={[0, 0, 0]} fontSize={0.5} color="#666">等待数据...</Text>;
  }

  return (
    <group>
      <hemisphereLight args={['#c8d6e5', '#d4cfc4', 0.5]} />
      <directionalLight position={[4, 6, 3]} intensity={0.5} />
      {/* Shared desk + chair + plant in middle */}
      <Desk />
      <OfficeChair />
      <PottedPlant />
      {/* Shared whiteboard */}
      <Whiteboard />
      {left}
      {right}
      <mesh position={[0, -1.2, 0]}><boxGeometry args={[0.02, 0.5, 3]} /><meshBasicMaterial color="#444" transparent opacity={0.3} /></mesh>
    </group>
  );
}

function Desk() {
  return (
    <group position={[0, 0, 1.8]}>
      <mesh position={[0, 0.25, 0]}><boxGeometry args={[0.7, 0.03, 0.45]} /><meshStandardMaterial color="#8d6e4a" roughness={0.5} /></mesh>
      {([[-0.3, 0.12, 0.18] as const, [0.3, 0.12, 0.18] as const, [-0.3, 0.12, -0.18] as const, [0.3, 0.12, -0.18] as const]).map((p, i) => (
        <mesh key={i} position={p}><boxGeometry args={[0.03, 0.25, 0.03]} /><meshStandardMaterial color="#8d6e4a" roughness={0.5} /></mesh>
      ))}
      <mesh position={[0, 0.38, 0.1]}><boxGeometry args={[0.26, 0.18, 0.02]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0, 0.38, 0.11]}><planeGeometry args={[0.22, 0.15]} /><meshBasicMaterial color="#1a5276" /></mesh>
      <mesh position={[0, 0.3, 0.09]}><boxGeometry args={[0.08, 0.18, 0.02]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[0, 0.29, 0.12]}><boxGeometry args={[0.12, 0.015, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
      <mesh position={[0, 0.27, -0.04]}><boxGeometry args={[0.18, 0.01, 0.07]} /><meshStandardMaterial color="#444" /></mesh>
      <pointLight position={[0, 0.38, 0.2]} intensity={0.12} color="#4fc3f7" distance={0.5} />
    </group>
  );
}

function OfficeChair() {
  return (
    <group position={[0, 0, 2.4]}>
      <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.12, 0.18, 0.02, 8]} /><meshStandardMaterial color="#333" metalness={0.4} /></mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.12, 0.01, Math.sin((i / 5) * Math.PI * 2) * 0.12]}>
          <sphereGeometry args={[0.012, 6, 6]} /><meshStandardMaterial color="#222" />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.008, 0.012, 0.15, 6]} /><meshStandardMaterial color="#555" metalness={0.5} /></mesh>
      <mesh position={[0, 0.18, 0.02]}><boxGeometry args={[0.16, 0.03, 0.16]} /><meshStandardMaterial color="#2c3e50" roughness={0.7} /></mesh>
      <mesh position={[0, 0.2, 0.02]}><boxGeometry args={[0.14, 0.015, 0.14]} /><meshStandardMaterial color="#34495e" roughness={0.9} /></mesh>
      <mesh position={[0, 0.28, -0.08]}><boxGeometry args={[0.14, 0.16, 0.015]} /><meshStandardMaterial color="#2c3e50" roughness={0.7} /></mesh>
    </group>
  );
}

function PottedPlant() {
  return (
    <group position={[2.5, 0, 1.8]}>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.1, 0.12, 0.16, 8]} /><meshStandardMaterial color="#a0522d" roughness={0.8} /></mesh>
      <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.08, 0.1, 0.02, 8]} /><meshStandardMaterial color="#8b4513" roughness={0.8} /></mesh>
      {[0, 0.7, 1.4, 2.1, 2.8].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.06, 0.22 + Math.sin(a + 1) * 0.04, Math.sin(a) * 0.06]}>
          <sphereGeometry args={[0.05 + Math.sin(a) * 0.015, 5, 5]} /><meshStandardMaterial color="#4caf50" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.26, 0]}><sphereGeometry args={[0.06, 6, 6]} /><meshStandardMaterial color="#66bb6a" roughness={0.8} /></mesh>
    </group>
  );
}

function Whiteboard() {
  return (
    <group position={[0, 0.4, -2.1]}>
      <mesh><planeGeometry args={[1.5, 0.7]} /><meshStandardMaterial color="#f5f5f0" roughness={0.4} /></mesh>
      <mesh position={[0, 0, 0.005]}><planeGeometry args={[1.4, 0.6]} /><meshStandardMaterial color="#fff" /></mesh>
      <Text position={[-0.4, 0.15, 0.01]} fontSize={0.06} color="#333">结构图</Text>
      <mesh position={[-0.3, -0.05, 0.01]}><boxGeometry args={[0.15, 0.06, 0.005]} /><meshBasicMaterial color="#e74c3c" /></mesh>
      <mesh position={[0, 0.05, 0.01]}><boxGeometry args={[0.12, 0.06, 0.005]} /><meshBasicMaterial color="#3498db" /></mesh>
      <mesh position={[0.3, -0.03, 0.01]}><boxGeometry args={[0.14, 0.06, 0.005]} /><meshBasicMaterial color="#2ecc71" /></mesh>
      {[-0.65, -0.58, -0.51].map((x, i) => (
        <mesh key={i} position={[x, -0.3, 0.01]}><boxGeometry args={[0.02, 0.06, 0.01]} /><meshStandardMaterial color={['#e74c3c', '#3498db', '#2ecc71'][i]} /></mesh>
      ))}
    </group>
  );
}

export function detectTree(snapshot: TraceSnapshot): boolean {
  const tree = snapshot.data?.['tree'];
  return !!(tree && typeof tree === 'object' && 'value' in (tree as any));
}

export const fileSystemDef = {
  id: 'file-system',
  kind: 'engineering' as const,
  name: '文件系统',
  detect: detectTree,
  priority: 10,
  component: FileSystemScene,
};
