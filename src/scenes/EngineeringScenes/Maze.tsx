import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

interface TreeNode {
  value: number;
  children?: TreeNode[];
}

interface LayoutNode {
  x: number;
  z: number;
  val: number;
  idx: number;
  parentIdx: number;
}

function layoutTree(node: TreeNode, x: number, z: number, spread: number, angle: number, parentIdx: number, out: LayoutNode[]): void {
  const idx = out.length;
  out.push({ x, z, val: node.value, idx, parentIdx });

  const children = (node.children ?? []).filter(Boolean) as TreeNode[];
  const n = children.length;
  if (n === 0) return;

  const arc = Math.min(Math.PI * 0.6, (n + 1) * 0.25);
  const startAngle = angle - arc / 2;
  for (let i = 0; i < n; i++) {
    const ca = startAngle + (i / (n - 1 || 1)) * arc;
    const cx = x + Math.cos(ca) * spread;
    const cz = z + Math.sin(ca) * spread;
    layoutTree(children[i], cx, cz, spread * 0.72, ca, idx, out);
  }
}

function MazeWall({ from, to, side, height = 0.45, thick = 0.035 }: {
  from: [number, number, number];
  to: [number, number, number];
  side: number;
  height?: number;
  thick?: number;
}) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.01) return null;
  const perpX = -dz / len;
  const perpZ = dx / len;
  const gap = 0.15;
  const ox = perpX * gap * side;
  const oz = perpZ * gap * side;
  const mid: [number, number, number] = [(from[0] + to[0]) / 2 + ox, height / 2, (from[2] + to[2]) / 2 + oz];
  const a = Math.atan2(dx, dz);
  return (
    <mesh position={mid} rotation={[0, a, 0]}>
      <boxGeometry args={[thick, height, len]} />
      <meshStandardMaterial color="#5d5a52" roughness={0.9} />
    </mesh>
  );
}

function CorridorFloor({ from, to, w = 0.3 }: {
  from: [number, number, number];
  to: [number, number, number];
  w?: number;
}) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.01) return null;
  const a = Math.atan2(dx, dz);
  return (
    <mesh position={[(from[0] + to[0]) / 2, -0.005, (from[2] + to[2]) / 2]} rotation={[-Math.PI / 2, 0, a]}>
      <planeGeometry args={[w, len]} />
      <meshStandardMaterial color="#5a574d" roughness={0.9} />
    </mesh>
  );
}

function RoomFloor({ x, z, size = 0.4, lit = false }: { x: number; z: number; size?: number; lit?: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0, z]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={lit ? '#8a7a5a' : '#6b685e'} roughness={0.8} />
    </mesh>
  );
}

function Torch({ position, lit }: { position: [number, number, number]; lit: boolean }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (ref.current && lit) ref.current.intensity = 0.25 + Math.sin(Date.now() / 300) * 0.08;
  });
  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.006, 0.01, 0.25, 6]} /><meshStandardMaterial color="#4a3520" /></mesh>
      {lit && (
        <group>
          <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color="#ff8a00" /></mesh>
          <pointLight ref={ref} position={[0, 0.35, 0]} intensity={0.25} color="#ffaa44" distance={1} />
        </group>
      )}
    </group>
  );
}

function Explorer({ x, z, color }: { x: number; z: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.y = 0.06 + Math.sin(Date.now() / 500) * 0.025;
  });
  return (
    <group ref={ref} position={[x, 0.04, z]}>
      <mesh><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} /></mesh>
      <pointLight intensity={0.15} color={color} distance={0.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.06, 0.1, 12]} /><meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}

function renderMazeSide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  if (!snapshot) return null;
  const data = snapshot.data;
  const tree: TreeNode | undefined = data?.tree as TreeNode | undefined;
  const highlights = snapshot.highlights ?? [];
  if (!tree) return null;

  const nodes: LayoutNode[] = [];
  layoutTree(tree, 0, 2.0, 1.3, -Math.PI / 2, -1, nodes);

  const currentVal = highlights.length > 0 ? highlights[highlights.length - 1] : -1;
  const visited = new Set(highlights);

  return (
    <group position={[xOffset, -0.5, 0]}>
      {/* Base floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#4a4842" roughness={0.9} />
      </mesh>

      {/* Corridors */}
      {nodes.map((n) => {
        if (n.parentIdx < 0) return null;
        const p = nodes[n.parentIdx];
        return <CorridorFloor key={`c${n.idx}`} from={[p.x, 0, p.z]} to={[n.x, 0, n.z]} />;
      })}

      {/* Walls */}
      {nodes.map((n) => {
        if (n.parentIdx < 0) return null;
        const p = nodes[n.parentIdx];
        return (
          <group key={`w${n.idx}`}>
            <MazeWall from={[p.x, 0, p.z]} to={[n.x, 0, n.z]} side={1} />
            <MazeWall from={[p.x, 0, p.z]} to={[n.x, 0, n.z]} side={-1} />
          </group>
        );
      })}

      {/* Room floors */}
      {nodes.map((n) => (
        <RoomFloor key={`f${n.idx}`} x={n.x} z={n.z} lit={visited.has(n.val)} />
      ))}

      {/* Visited glow */}
      {nodes.map((n) =>
        visited.has(n.val) ? (
          <mesh key={`g${n.idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[n.x, 0.005, n.z]}>
            <circleGeometry args={[0.12, 12]} />
            <meshBasicMaterial color={`hsl(${hue}, 80%, 60%)`} transparent opacity={0.15} />
          </mesh>
        ) : null
      )}

      {/* Torches */}
      {nodes.map((n) => (
        <Torch key={`t${n.idx}`} position={[n.x, 0, n.z]} lit={visited.has(n.val)} />
      ))}

      {/* Explorer */}
      {currentVal >= 0 && (() => {
        const n = nodes.find(nd => nd.val === currentVal);
        return n ? <Explorer key="e" x={n.x} z={n.z} color={`hsl(${hue}, 80%, 60%)`} /> : null;
      })()}

      {/* Labels */}
      {nodes.map((n) => (
        <Text key={`l${n.idx}`} position={[n.x, 0.3, n.z]} fontSize={0.07} color="#aaa">
          {String(n.val)}
        </Text>
      ))}

      {/* Entrance marker */}
      <Text position={[0, -0.1, 2.4]} fontSize={0.12} color="#666">入口</Text>

      {/* Label */}
      <Text position={[0, 2.0, 0]} fontSize={0.2} color={`hsl(${hue}, 70%, 60%)`}>{label}</Text>
    </group>
  );
}

export default function MazeScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      <hemisphereLight args={['#2a1a0a', '#1a1008', 0.3]} />
      <directionalLight position={[3, 5, 2]} intensity={0.2} />
      <ambientLight intensity={0.15} color="#443322" />
      {renderMazeSide(naiveSnapshot, -4.5, 'Naive (BFS)', 30)}
      {renderMazeSide(optimizedSnapshot, 4.5, 'Opt (DFS)', 240)}
      <mesh position={[0, 0, -2.5]}><planeGeometry args={[0.02, 6]} /><meshBasicMaterial color="#333" transparent opacity={0.5} /></mesh>
    </group>
  );
}

export function detectTree(snapshot: TraceSnapshot): boolean {
  const tree = snapshot.data?.['tree'];
  return !!(tree && typeof tree === 'object' && 'value' in (tree as any));
}

export const mazeDef = {
  id: 'maze',
  kind: 'engineering' as const,
  name: '迷宫',
  detect: detectTree,
  priority: 10,
  component: MazeScene,
};
