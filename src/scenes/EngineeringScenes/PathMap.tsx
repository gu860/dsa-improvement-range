import { useMemo, useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function Building({ position, height, baseSize, color, label, highlighted }: {
  position: [number, number, number];
  height: number;
  baseSize?: number;
  color: string;
  label?: string;
  highlighted?: boolean;
}) {
  const bs = baseSize ?? 0.6;
  const lit = highlighted ?? false;
  const windowRows = Math.max(1, Math.floor(height / 0.2));
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[bs, height, bs]} />
        <meshStandardMaterial
          color={lit ? '#f59e0b' : color}
          emissive={lit ? '#f59e0b' : color}
          emissiveIntensity={lit ? 0.4 : 0.04}
          roughness={lit ? 0.3 : 0.7}
        />
      </mesh>
      {Array.from({ length: windowRows }, (_, r) =>
        [-1, 0, 1].map((c) => (
          <mesh key={`${r}-${c}`} position={[c * 0.15, (r + 0.5) * (height / windowRows), bs / 2 + 0.005]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshStandardMaterial
              color={(lit || Math.random() > 0.4) ? '#ffe082' : '#555'}
              emissive={(lit || Math.random() > 0.4) ? '#ffe082' : '#000'}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))
      ).flat()}
      {label && (
        <Text position={[0, height + 0.2, 0]} fontSize={0.12} color="#e0e0e0">{label}</Text>
      )}
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15 * scale, 0]}>
        <cylinderGeometry args={[0.02 * scale, 0.035 * scale, 0.3 * scale, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.4 * scale, 0]}>
        <sphereGeometry args={[0.12 * scale, 6, 6]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      <mesh position={[0.06 * scale, 0.35 * scale, 0.04 * scale]}>
        <sphereGeometry args={[0.08 * scale, 6, 6]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>
      <mesh position={[-0.05 * scale, 0.38 * scale, -0.03 * scale]}>
        <sphereGeometry args={[0.09 * scale, 6, 6]} />
        <meshStandardMaterial color="#43a047" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Cloud({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.position.x += delta * 0.05;
    if (ref.current && ref.current.position.x > 8) ref.current.position.x = -8;
  });
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0, 0]}><sphereGeometry args={[0.3, 6, 6]} /><meshStandardMaterial color="#f0f0f0" transparent opacity={0.7} roughness={0.4} /></mesh>
      <mesh position={[0.25, 0.05, 0.05]}><sphereGeometry args={[0.25, 6, 6]} /><meshStandardMaterial color="#f5f5f5" transparent opacity={0.7} roughness={0.4} /></mesh>
      <mesh position={[-0.2, 0.03, -0.05]}><sphereGeometry args={[0.2, 6, 6]} /><meshStandardMaterial color="#eee" transparent opacity={0.7} roughness={0.4} /></mesh>
    </group>
  );
}

function Road({ from, to, highlighted }: {
  from: [number, number, number];
  to: [number, number, number];
  highlighted?: boolean;
}) {
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, 0.02, (from[2] + to[2]) / 2];
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);
  return (
    <group>
      <mesh position={mid} rotation={[0, angle, 0]}>
        <boxGeometry args={[0.15, 0.02, length]} />
        <meshStandardMaterial color={highlighted ? '#4fc3f7' : '#555'} emissive={highlighted ? '#4fc3f7' : '#000'} emissiveIntensity={highlighted ? 0.5 : 0} />
      </mesh>
      <mesh position={[mid[0], 0.04, mid[2]]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[0.01, 0.01, length - 0.1]} />
        <meshStandardMaterial color="#ffd54f" />
      </mesh>
    </group>
  );
}

function Streetlight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.008, 0.015, 0.8, 6]} /><meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0.12, 0.75, 0]}><boxGeometry args={[0.12, 0.02, 0.05]} /><meshStandardMaterial color="#444" metalness={0.5} /></mesh>
      <pointLight position={[0.12, 0.7, 0]} intensity={0.3} color="#ffffee" distance={1.5} />
    </group>
  );
}

function Car({ position }: { position: [number, number, number] }) {
  return (
    <group position={[position[0], 0.08, position[2]]}>
      <mesh><boxGeometry args={[0.15, 0.05, 0.28]} /><meshStandardMaterial color="#ff5722" roughness={0.3} /></mesh>
      <mesh position={[0, 0.04, -0.01]}><boxGeometry args={[0.1, 0.03, 0.15]} /><meshStandardMaterial color="#ff8a65" roughness={0.3} /></mesh>
      <mesh position={[0, 0.02, -0.1]}><boxGeometry args={[0.02, 0.015, 0.02]} /><meshStandardMaterial color="#ff0" emissive="#ff0" emissiveIntensity={0.5} /></mesh>
      <mesh position={[0.04, 0.03, 0.14]}><sphereGeometry args={[0.01, 6, 6]} /><meshStandardMaterial color="#ffffee" emissive="#ffffee" emissiveIntensity={0.3} /></mesh>
      <mesh position={[-0.04, 0.03, 0.14]}><sphereGeometry args={[0.01, 6, 6]} /><meshStandardMaterial color="#ffffee" emissive="#ffffee" emissiveIntensity={0.3} /></mesh>
    </group>
  );
}

function renderCitySide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  if (!snapshot) return null;
  const data = snapshot.data;
  const graphData = data?.graph as { nodes?: { id: number; label?: string }[]; edges?: { from: number; to: number; weight?: number }[] } | undefined;
  const highlights = snapshot.highlights ?? [];
  const pointers = snapshot.pointers ?? {};
  const nodes = graphData?.nodes ?? [];
  const edges = graphData?.edges ?? [];
  if (nodes.length === 0) return null;

  const count = nodes.length;
  const radius = Math.min(count * 0.45, 2.5);
  const layout = nodes.map((n, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, height: 0.6 + (n.label?.charCodeAt(0) ?? i) * 0.06 };
  });

  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#2d5a2d" roughness={0.9} />
      </mesh>
      {/* Grass patches */}
      {[0, 2, -2].flatMap((x) => [0, 2, -2].map((z) => (
        <mesh key={`g${x}-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x + Math.random() * 0.3, -0.04, z + Math.random() * 0.3]}>
          <circleGeometry args={[0.2 + Math.random() * 0.15, 6]} />
          <meshStandardMaterial color="#3a7a3a" roughness={1} />
        </mesh>
      ))).flat()}

      {/* Roads */}
      {edges.map((e, i) => {
        const from = layout.find((n) => n.id === e.from);
        const to = layout.find((n) => n.id === e.to);
        if (!from || !to) return null;
        const hl = highlights.includes(e.from) || highlights.includes(e.to);
        return <Road key={i} from={[from.x, 0, from.z]} to={[to.x, 0, to.z]} highlighted={hl} />;
      })}

      {/* Buildings */}
      {layout.map((n, i) => (
        <Building
          key={n.id}
          position={[n.x, 0, n.z]}
          height={n.height}
          baseSize={0.45 + (n.id % 3) * 0.08}
          color={colors[i % colors.length]}
          label={n.label}
          highlighted={highlights.includes(n.id)}
        />
      ))}

      {/* Car */}
      {Object.entries(pointers).map(([name, idx]) => {
        const node = layout.find((n) => n.id === Number(idx));
        if (!node) return null;
        return <Car key={name} position={[node.x, 0, node.z]} />;
      })}

      {/* Label */}
      <Text position={[0, 2.2, 0]} fontSize={0.22} color={`hsl(${hue}, 70%, 60%)`}>{label}</Text>
    </group>
  );
}

export default function PathMapScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (waterRef.current) waterRef.current.position.y = -0.04 + Math.sin(Date.now() / 2000) * 0.005;
  });

  return (
    <group>
      <hemisphereLight args={['#87ceeb', '#3a6b35', 0.5]} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      {/* Shared water */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 2.5]}>
        <planeGeometry args={[3, 1.5]} />
        <meshStandardMaterial color="#1a5276" transparent opacity={0.5} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Trees */}
      <Tree position={[-3.5, 0, 2.2]} scale={0.8} />
      <Tree position={[3.5, 0, 2.2]} scale={0.8} />
      <Tree position={[-3, 0, -2]} scale={0.7} />
      <Tree position={[3, 0, -2]} scale={0.7} />
      {/* Clouds */}
      <Cloud position={[-2, 2.5, -1]} />
      <Cloud position={[2, 2.5, -1]} />
      {/* Two city maps */}
      {renderCitySide(naiveSnapshot, -3.8, 'Naive (BFS)', 240)}
      {renderCitySide(optimizedSnapshot, 3.8, 'Opt (DFS)', 140)}
      {/* Divider */}
      <mesh position={[0, 0, -2.5]}><planeGeometry args={[0.02, 6]} /><meshBasicMaterial color="#444" transparent opacity={0.3} /></mesh>
    </group>
  );
}

export function detectGraph(snapshot: TraceSnapshot): boolean {
  const v = snapshot.data?.['graph'];
  return !!(v && typeof v === 'object' && 'nodes' in (v as any));
}

export const pathMapDef = {
  id: 'path-map',
  kind: 'engineering' as const,
  name: '城市导航',
  detect: detectGraph,
  priority: 10,
  component: PathMapScene,
};
