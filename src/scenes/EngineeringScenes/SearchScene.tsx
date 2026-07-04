import { Text } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectData } from '../DataDetector';
import { algorithmId } from '../algorithm-context';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function PulsingLight({ pos, color, active }: { pos: [number, number, number]; color: string; active?: boolean }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (ref.current && active) {
      ref.current.intensity = 0.5 + Math.sin(clock.elapsedTime * 4) * 0.3;
    } else if (ref.current) {
      ref.current.intensity = 0;
    }
  });
  return <pointLight ref={ref} position={pos} color={color} distance={2} />;
}

/* ======= 📖 LIBRARY / LINEAR-BINARY ======= */
function Library({ array, highlights, pointers, target, label, xOffset }: {
  array: number[]; highlights: number[]; pointers: Record<string, number>;
  target: number | undefined; label: string; xOffset: number;
}) {
  const isEmpty = array.length === 0;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#fff5e0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.7} color="#f59e0b" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="#4a2c1a" roughness={0.95} />
      </mesh>

      {/* Bookshelf */}
      <mesh position={[0, 0.6, -0.5]}>
        <boxGeometry args={[4.2, 1.6, 0.35]} />
        <meshStandardMaterial color="#6b4423" roughness={0.8} />
      </mesh>
      {/* Shelves */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[0, i * 0.4, -0.33]}>
          <boxGeometry args={[3.8, 0.02, 0.28]} />
          <meshStandardMaterial color="#8b6914" />
        </mesh>
      ))}

      {/* Books */}
      {!isEmpty && array.map((v, i) => {
        const shelf = i % 3;
        const posOnShelf = Math.floor(i / 3);
        const maxPerShelf = Math.max(Math.ceil(array.length / 3), 1);
        const x = -1.6 + (posOnShelf / maxPerShelf) * 3.2;
        const y = 0.1 + shelf * 0.4;
        const hl = highlights.includes(i);
        const colors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400'];
        return (
          <group key={i}>
            <PulsingLight pos={[x, y + 0.2, -0.3]} color="#ffd700" active={hl} />
            <mesh position={[x, y, -0.33]}>
              <boxGeometry args={[0.18, 0.3, 0.15]} />
              <meshStandardMaterial color={hl ? '#ffd700' : colors[i % colors.length]} roughness={0.7} />
            </mesh>
            <Text position={[x, y, -0.25]} fontSize={0.05} color={hl ? '#000' : '#fff'}>{String(v)}</Text>
            {hl && <mesh position={[x, y + 0.2, -0.33]}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color="#ffd700" /></mesh>}
          </group>
        );
      })}

      {/* Empty state */}
      {isEmpty && (
        <Text position={[0, 0.6, -0.3]} fontSize={0.14} color="#aa8866">书架为空</Text>
      )}

      {/* Reading lamp */}
      <mesh position={[2.2, 1.1, -0.5]}>
        <coneGeometry args={[0.18, 0.12, 8]} />
        <meshStandardMaterial color="#f5f0e0" emissive="#ffe082" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[2.2, 0.7, -0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {target !== undefined && (
        <Text position={[0, 1.8, -1.5]} fontSize={0.18} color="#f59e0b">📖 图书馆 — 搜索: {target}</Text>
      )}
      {!isEmpty && Object.entries(pointers).map(([name, idx]) => {
        const shelf = idx % 3;
        const posOnShelf = Math.floor(idx / 3);
        const maxPerShelf = Math.max(Math.ceil(array.length / 3), 1);
        const x = -1.6 + (posOnShelf / maxPerShelf) * 3.2;
        const y = 0.1 + shelf * 0.4;
        return <Text key={name} position={[x, y + 0.22, -0.33]} fontSize={0.06} color="#ff69b4">{name}</Text>;
      })}
      <Text position={[0, -0.5, -1.5]} fontSize={0.14} color="#f59e0b">{label}</Text>
    </group>
  );
}

/* ======= 🃏 CARD MATCHING / TWO-SUM ======= */
function CardMatching({ array, highlights, pointers, target, label, xOffset }: {
  array: number[]; highlights: number[]; pointers: Record<string, number>;
  target: number | undefined; label: string; xOffset: number;
}) {
  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.4} color="#e0e0ff" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.7} color="#ffd700" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#1a1a3c" roughness={0.8} />
      </mesh>
      {/* Table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -0.5]}>
        <planeGeometry args={[5, 3.5]} />
        <meshStandardMaterial color="#0d6b3c" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.2, 1.2]}>
        <boxGeometry args={[3, 0.5, 0.04]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>

      {/* Cards */}
      {array.map((v, i) => {
        const x = -1.5 + (i / Math.max(array.length - 1, 1)) * 3;
        const matched = highlights.includes(i);
        return (
          <group key={i}>
            <PulsingLight pos={[x, 0.2, -0.5]} color="#ffd700" active={matched} />
            <mesh position={[x, 0.05, -0.5]} rotation={[matched ? 0.1 : 0, 0, 0]}>
              <boxGeometry args={[0.35, 0.48, 0.02]} />
              <meshStandardMaterial color={matched ? '#ffd700' : '#f5f0e0'} />
            </mesh>
            <Text position={[x, 0.05, -0.48]} fontSize={0.08} color={matched ? '#000' : '#333'}>{String(v)}</Text>
            {matched && (
              <mesh position={[x, 0.05, -0.49]}>
                <planeGeometry args={[0.2, 0.2]} />
                <meshBasicMaterial color="#ffd700" transparent opacity={0.3} />
              </mesh>
            )}
          </group>
        );
      })}

      {Object.entries(pointers).map(([name, idx]) => {
        const x = -1.5 + (idx / Math.max(array.length - 1, 1)) * 3;
        return <Text key={name} position={[x, 0.4, -0.5]} fontSize={0.07} color="#ff69b4">{name}</Text>;
      })}

      {target !== undefined && (
        <Text position={[0, 1.8, -1.5]} fontSize={0.18} color="#ffd700">🃏 配对桌 — 和为 {target}</Text>
      )}
      <Text position={[0, -0.5, -1.5]} fontSize={0.14} color="#ffd700">{label}</Text>
    </group>
  );
}

/* ======= 🧭 COMPASS / ROTATED ARRAY ======= */
function Compass({ array, highlights, pointers, target, label, xOffset }: {
  array: number[]; highlights: number[]; pointers: Record<string, number>;
  target: number | undefined; label: string; xOffset: number;
}) {
  const needleRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (needleRef.current) {
      needleRef.current.rotation.z = clock.elapsedTime * 0.5;
    }
  });

  const isEmpty = array.length === 0;
  const dataRadius = 0.55;
  const labelRadius = 1.2;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#fff8e0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.7} color="#f59e0b" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#3c2c1a" roughness={0.8} />
      </mesh>

      {/* Compass body */}
      <mesh position={[0, 0.2, -0.5]}>
        <cylinderGeometry args={[1.1, 1.1, 0.08, 32]} />
        <meshStandardMaterial color="#d4c5a9" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Ring */}
      <mesh position={[0, 0.24, -0.5]}>
        <torusGeometry args={[0.9, 0.04, 8, 24]} />
        <meshStandardMaterial color="#8b6914" metalness={0.5} />
      </mesh>
      {/* Directions */}
      {['N', 'E', 'S', 'W'].map((dir, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <Text key={dir} position={[Math.cos(angle) * 0.8, 0.26, Math.sin(angle) * 0.8]} fontSize={0.08} color="#8b6914">{dir}</Text>
        );
      })}

      {/* Data marks */}
      {!isEmpty && array.map((v, i) => {
        const angle = (i / array.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * dataRadius;
        const z = Math.sin(angle) * dataRadius;
        const hl = highlights.includes(i);
        return (
          <group key={i}>
            <mesh position={[x, 0.26, z]}>
              <boxGeometry args={[0.08, 0.25, 0.08]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#888'} emissive={hl ? '#ffd700' : '#000'} emissiveIntensity={hl ? 0.4 : 0} />
            </mesh>
            <Text position={[x * (labelRadius / dataRadius), 0.26, z * (labelRadius / dataRadius)]} fontSize={0.06} color={hl ? '#ffd700' : '#aaa'}>{String(v)}</Text>
            {hl && <PulsingLight pos={[x, 0.5, z]} color="#ffd700" active={true} />}
          </group>
        );
      })}

      {/* Center pivot + needle */}
      <mesh position={[0, 0.26, -0.5]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffd700" />
      </mesh>
      <mesh ref={needleRef} position={[0, 0.28, -0.5]}>
        <boxGeometry args={[0.04, 0.5, 0.02]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>

      {!isEmpty && Object.entries(pointers).map(([name, idx]) => {
        const angle = (idx / array.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * dataRadius;
        const z = Math.sin(angle) * dataRadius;
        return <Text key={name} position={[x * (labelRadius / dataRadius), 0.5, z * (labelRadius / dataRadius)]} fontSize={0.06} color="#ff69b4">{name}</Text>;
      })}

      {target !== undefined && (
        <Text position={[0, 1.5, -1.5]} fontSize={0.18} color="#f59e0b">🧭 罗盘 — 找 {target}</Text>
      )}
      <Text position={[0, -0.7, -1.5]} fontSize={0.14} color="#f59e0b">{label}</Text>
    </group>
  );
}

/* ======= ⛰ MOUNTAIN / PEAK ======= */
function Mountain({ array, highlights, pointers, label, xOffset }: {
  array: number[]; highlights: number[]; pointers: Record<string, number>;
  label: string; xOffset: number;
}) {
  const maxVal = Math.max(...array, 1);
  const maxH = 1.0;
  const spacing = Math.min(0.6, 3 / Math.max(array.length, 1));

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#e0ffe8" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#66bb6a" distance={6} />

      {/* Sky */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#1a3c2c" roughness={0.8} />
      </mesh>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#1a4a2a" roughness={0.95} />
      </mesh>

      {/* Mountains */}
      {array.map((v, i) => {
        const x = -1.5 + (i / Math.max(array.length - 1, 1)) * 3;
        const h = (v / maxVal) * maxH;
        const hl = highlights.includes(i);
        const isPeak = v === maxVal;
        const baseRadius = 0.2 + h * 0.05;
        return (
          <group key={i}>
            <PulsingLight pos={[x, h + 0.3, -0.5]} color="#ffd700" active={hl} />
            <mesh position={[x, h / 2 - 0.05, -0.5]}>
              <coneGeometry args={[baseRadius, h, 6]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#4a7c59'} roughness={0.85} />
            </mesh>
            {h > 0.5 && (
              <mesh position={[x, h - 0.05, -0.5]}>
                <coneGeometry args={[baseRadius * 0.4, 0.15, 6]} />
                <meshStandardMaterial color={hl ? '#fff' : '#e8e8f0'} roughness={0.6} />
              </mesh>
            )}
            {hl && (
              <>
                <mesh position={[x, h + 0.1, -0.5]}>
                  <boxGeometry args={[0.005, 0.15, 0.005]} />
                  <meshBasicMaterial color="#888" />
                </mesh>
                <mesh position={[x + 0.04, h + 0.18, -0.5]}>
                  <planeGeometry args={[0.08, 0.05]} />
                  <meshBasicMaterial color="#ff4444" />
                </mesh>
              </>
            )}
            <Text position={[x, -0.1, -0.3]} fontSize={0.06} color={hl ? '#ffd700' : '#888'}>{String(v)}</Text>
          </group>
        );
      })}

      {Object.entries(pointers).map(([name, idx]) => {
        const x = -1.5 + (idx / Math.max(array.length - 1, 1)) * 3;
        return <Text key={name} position={[x, 1.5, -0.5]} fontSize={0.07} color="#ff69b4">{name}</Text>;
      })}

      <Text position={[0, 1.8, -1.5]} fontSize={0.22} color="#66bb6a">⛰ 山脉寻峰 — {label}</Text>
    </group>
  );
}

export default function SearchScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const d1 = naiveSnapshot ? detectData(naiveSnapshot.data) : null;
  const d2 = optimizedSnapshot ? detectData(optimizedSnapshot.data) : null;
  const arr1 = (d1?.kind === 'search' && d1.array) ? d1.array : [];
  const arr2 = (d2?.kind === 'search' && d2.array) ? d2.array : [];
  const t1 = d1?.kind === 'search' ? d1.target : undefined;
  const t2 = d2?.kind === 'search' ? d2.target : undefined;
  const h1 = naiveSnapshot?.highlights ?? [];
  const h2 = optimizedSnapshot?.highlights ?? [];
  const p1 = naiveSnapshot?.pointers ?? {};
  const p2 = optimizedSnapshot?.pointers ?? {};

  const isTwoSum = algorithmId === 'two-sum';
  const isRotated = algorithmId === 'rotated-array';
  const isPeak = algorithmId === 'peak';
  const isDefault = !isTwoSum && !isRotated && !isPeak;

  if (isDefault) {
    return (
      <group>
        <Library array={arr1} highlights={h1} pointers={p1} target={t1} label="朴素" xOffset={-4} />
        <Library array={arr2} highlights={h2} pointers={p2} target={t2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  if (isTwoSum) {
    return (
      <group>
        <CardMatching array={arr1} highlights={h1} pointers={p1} target={t1} label="朴素" xOffset={-4} />
        <CardMatching array={arr2} highlights={h2} pointers={p2} target={t2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  if (isRotated) {
    return (
      <group>
        <Compass array={arr1} highlights={h1} pointers={p1} target={t1} label="朴素" xOffset={-4} />
        <Compass array={arr2} highlights={h2} pointers={p2} target={t2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  if (isPeak) {
    return (
      <group>
        <Mountain array={arr1} highlights={h1} pointers={p1} label="朴素" xOffset={-4} />
        <Mountain array={arr2} highlights={h2} pointers={p2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  return null;
}

export function detectMoreSearch(s: TraceSnapshot): boolean {
  if (algorithmId !== 'linear-binary' && algorithmId !== 'two-sum' && algorithmId !== 'rotated-array' && algorithmId !== 'peak') return false;
  const d = detectData(s.data);
  return d?.kind === 'search' || d?.kind === 'array';
}

export const searchSceneDef = {
  id: 'search-engineering',
  kind: 'engineering' as const,
  name: '搜索场景',
  detect: detectMoreSearch,
  priority: 100,
  component: SearchScene,
};
