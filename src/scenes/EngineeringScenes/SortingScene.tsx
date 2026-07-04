import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectData } from '../DataDetector';
import { algorithmId } from '../algorithm-context';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

/* ======= Reusable animated components ======= */
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

/* ======= 🃏 CASINO / CARD TABLE ======= */
function CardTable({ arr, highlights, pointers, label, xOffset }: {
  arr: number[]; highlights: number[]; pointers: Record<string, number>;
  label: string; xOffset: number;
}) {
  const beltRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (beltRef.current) beltRef.current.position.x = Math.sin(clock.elapsedTime * 0.5) * 0.02;
  });

  const spacing = 0.7;
  const totalW = arr.length * spacing;
  const offX = -totalW / 2 + spacing / 2;

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Bright ambient fill */}
      <ambientLight intensity={0.4} color="#ffeebb" />
      <pointLight position={[0, 3, 2]} intensity={1.2} color="#ffd700" distance={8} />
      <pointLight position={[-2, 1, 1]} intensity={0.4} color="#ff8c00" distance={5} />

      {/* Table surface */}
      <mesh ref={beltRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, -0.3]}>
        <planeGeometry args={[5.5, 3]} />
        <meshStandardMaterial color="#0a5c2e" roughness={0.95} />
      </mesh>
      {/* Table border */}
      <mesh position={[0, -0.34, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.6, 2.75, 64]} />
        <meshStandardMaterial color="#d4a853" side={THREE.DoubleSide} />
      </mesh>
      {/* Table edge */}
      <mesh position={[0, -0.15, 0.8]}>
        <boxGeometry args={[4, 0.4, 0.08]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>

      {/* Card fan decoration */}
      {[-0.15, -0.05, 0.05, 0.15].map((off, i) => (
        <mesh key={i} position={[-2.2 + off, -0.1, 0.6]} rotation={[0, 0, (i - 1.5) * 0.2]}>
          <planeGeometry args={[0.35, 0.5]} />
          <meshStandardMaterial color="#f5f0e0" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Chip stack */}
      {['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'].map((c, i) => (
        <mesh key={i} position={[2.2, -0.28 + i * 0.025, 0.6]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}

      {/* Cards = data */}
      {arr.map((v, i) => {
        const x = offX + i * spacing;
        const sel = highlights.includes(i);
        return (
          <group key={i}>
            <PulsingLight pos={[x, 0.2, -0.3]} color="#ffd700" active={sel} />
            <mesh position={[x, -0.12, -0.3]} rotation={[sel ? 0.15 : 0, 0, 0]}>
              <boxGeometry args={[0.45, 0.65, 0.025]} />
              <meshStandardMaterial color={sel ? '#ff4444' : '#f5f0e0'} roughness={0.3} />
            </mesh>
            {/* Card suit symbol */}
            <Text position={[x, 0.05, -0.28]} fontSize={0.1} color={sel ? '#fff' : '#c00'}>♠</Text>
            <Text position={[x, -0.12, -0.28]} fontSize={sel ? 0.16 : 0.12} color={sel ? '#fff' : '#222'}>{String(v)}</Text>
            {sel && (
              <mesh position={[x, -0.12, -0.29]}>
                <planeGeometry args={[0.5, 0.7]} />
                <meshBasicMaterial color="#ffd700" transparent opacity={0.2} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Pointer labels */}
      {Object.entries(pointers).map(([name, idx]) => {
        const x = offX + idx * spacing;
        return <Text key={name} position={[x, 0.35, -0.3]} fontSize={0.1} color="#ff69b4">{name}</Text>;
      })}

      {/* Title */}
      <Text position={[0, 1.4, 0.5]} fontSize={0.22} color="#ffd700">🃏 赌桌选牌 — {label}</Text>
    </group>
  );
}

/* ======= 🐚 BEACH / SHELL SORT ======= */
function BeachScene({ arr, highlights, pointers, label, xOffset }: {
  arr: number[]; highlights: number[]; pointers: Record<string, number>;
  label: string; xOffset: number;
}) {
  const waveRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (waveRef.current) waveRef.current.position.z = -1.8 + Math.sin(clock.elapsedTime * 0.8) * 0.1;
  });

  const spacing = 0.7;
  const totalW = arr.length * spacing;
  const offX = -totalW / 2 + spacing / 2;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.5} color="#fff8e7" />
      <directionalLight position={[2, 5, 3]} intensity={1} color="#fff5d6" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#87ceeb" distance={6} />

      {/* Sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color="#e8d5b7" roughness={1} />
      </mesh>
      {/* Wet sand near water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.29, -1.2]}>
        <planeGeometry args={[6, 1.5]} />
        <meshStandardMaterial color="#c4b5a0" roughness={0.6} />
      </mesh>

      {/* Ocean */}
      <mesh ref={waveRef} position={[0, 0.1, -1.8]}>
        <boxGeometry args={[6, 1.5, 0.1]} />
        <meshStandardMaterial color="#4a9bc4" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.5, -2]}>
        <boxGeometry args={[6, 2, 0.1]} />
        <meshStandardMaterial color="#2a6b8a" />
      </mesh>

      {/* Decorative shells */}
      {[-2.2, -1.8, 2, 2.4].map((x, i) => (
        <group key={i} position={[x, -0.25, 0.8 + i * 0.2]}>
          <mesh rotation={[0.3, 0, 0.2]}>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial color={['#f5cba7', '#e8b89a', '#f0ccbb', '#ddaa88'][i]} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Starfish */}
      <mesh position={[1.8, -0.28, 0.5]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <circleGeometry args={[0.12, 5]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      {/* Data shells */}
      {arr.map((v, i) => {
        const x = offX + i * spacing;
        const sel = highlights.includes(i);
        return (
          <group key={i}>
            <PulsingLight pos={[x, 0.2, -0.3]} color="#ffd700" active={sel} />
            <mesh position={[x, -0.22, -0.3]} rotation={[0.2, i * 0.1, 0.3]}>
              <sphereGeometry args={[0.22, 12, 10]} />
              <meshStandardMaterial color={sel ? '#ffd700' : '#f0dcc0'} roughness={0.85} />
            </mesh>
            <mesh position={[x, -0.15, -0.28]} rotation={[0.4, 0, 0.3 + i * 0.05]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color={sel ? '#ffe082' : '#d4b896'} roughness={0.9} />
            </mesh>
            <Text position={[x, 0.05, -0.25]} fontSize={0.1} color={sel ? '#ffd700' : '#665544'}>{String(v)}</Text>
          </group>
        );
      })}

      {Object.entries(pointers).map(([name, idx]) => {
        const x = offX + idx * spacing;
        return <Text key={name} position={[x, 0.3, -0.3]} fontSize={0.08} color="#ff69b4">{name}</Text>;
      })}

      <Text position={[0, 1.5, 0.5]} fontSize={0.22} color="#fff">🐚 海滩拾贝 — {label}</Text>
    </group>
  );
}

/* ======= ⚙ GEAR FACTORY / MERGE ======= */
function FactoryScene({ arr, highlights, pointers, label, xOffset }: {
  arr: number[]; highlights: number[]; pointers: Record<string, number>;
  label: string; xOffset: number;
}) {
  const conveyorRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (conveyorRef.current) {
      conveyorRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x = clock.elapsedTime * 2 + i * 0.5;
        }
      });
    }
  });

  const spacing = 0.7;
  const totalW = arr.length * spacing;
  const offX = -totalW / 2 + spacing / 2;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.4} color="#e8e8f0" />
      <directionalLight position={[3, 5, 2]} intensity={1} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.8} color="#ff8c00" distance={6} />

      {/* Concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#555" roughness={0.9} />
      </mesh>
      {/* Floor markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.34, 0]}>
        <planeGeometry args={[0.05, 3.5]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.3} />
      </mesh>

      {/* Factory wall */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[6, 3, 0.1]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>
      {/* Warning stripes */}
      {[-2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -1.95]}>
          <boxGeometry args={[0.15, 0.6, 0.02]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#ffcc00' : '#333'} />
        </mesh>
      ))}

      {/* Conveyor belt */}
      <mesh position={[0, -0.25, -0.3]}>
        <boxGeometry args={[4, 0.06, 0.6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Conveyor rollers - animated */}
      <group ref={conveyorRef}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[-1.8 + i * 0.5, -0.28, -0.3]}>
            <cylinderGeometry args={[0.03, 0.03, 0.55, 8]} />
            <meshStandardMaterial color="#888" metalness={0.7} />
          </mesh>
        ))}
      </group>
      {/* Belt side rails */}
      <mesh position={[-2.1, -0.2, -0.3]}>
        <boxGeometry args={[0.04, 0.1, 0.65]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>
      <mesh position={[2.1, -0.2, -0.3]}>
        <boxGeometry args={[0.04, 0.1, 0.65]} />
        <meshStandardMaterial color="#666" metalness={0.5} />
      </mesh>

      {/* Data gears */}
      {arr.map((v, i) => {
        const x = offX + i * spacing;
        const sel = highlights.includes(i);
        return (
          <group key={i} position={[x, 0, -0.3]}>
            <PulsingLight pos={[0, 0.3, 0]} color="#ff8c00" active={sel} />
            <mesh>
              <torusGeometry args={[0.22, 0.05, 8, 16]} />
              <meshStandardMaterial color={sel ? '#ff8c00' : '#777'} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Gear teeth */}
            {Array.from({ length: 8 }, (_, j) => {
              const angle = (j / 8) * Math.PI * 2;
              return (
                <mesh key={j} position={[Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0]}>
                  <boxGeometry args={[0.04, 0.04, 0.06]} />
                  <meshStandardMaterial color={sel ? '#ff8c00' : '#777'} metalness={0.6} />
                </mesh>
              );
            })}
            <Text position={[0, 0, 0.08]} fontSize={0.1} color={sel ? '#ff8c00' : '#aaa'}>{String(v)}</Text>
          </group>
        );
      })}

      {Object.entries(pointers).map(([name, idx]) => {
        const x = offX + idx * spacing;
        return <Text key={name} position={[x, 0.4, -0.3]} fontSize={0.08} color="#ff69b4">{name}</Text>;
      })}

      <Text position={[0, 1.4, 0.5]} fontSize={0.22} color="#ff8c00">⚙ 齿轮车间 — {label}</Text>
    </group>
  );
}

/* ======= 📦 WAREHOUSE / COUNTING ======= */
function WarehouseScene({ arr, highlights, pointers, label, xOffset }: {
  arr: number[]; highlights: number[]; pointers: Record<string, number>;
  label: string; xOffset: number;
}) {
  const beltRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (beltRef.current) {
      beltRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x = clock.elapsedTime * 3 + i * 0.8;
        }
      });
    }
  });

  const spacing = 0.65;
  const totalW = arr.length * spacing;
  const offX = -totalW / 2 + spacing / 2;
  const maxVal = Math.max(...arr, 1);

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.5} color="#fff5e6" />
      <directionalLight position={[3, 5, 2]} intensity={1} color="#ffffff" />
      <pointLight position={[0, 3, 1]} intensity={0.8} color="#ffaa44" distance={7} />

      {/* Warehouse floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#6b5b4f" roughness={0.95} />
      </mesh>
      {/* Floor lines */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.34, 0]}>
          <planeGeometry args={[0.03, 3.5]} />
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[6, 3, 0.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
      {/* Shelf against wall */}
      <mesh position={[0, 0.5, -1.8]}>
        <boxGeometry args={[4, 0.05, 0.4]} />
        <meshStandardMaterial color="#a0522d" metalness={0.3} />
      </mesh>
      {/* Boxes on shelf */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.6, 0.65, -1.8]}>
          <boxGeometry args={[0.3, 0.25, 0.3]} />
          <meshStandardMaterial color={['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#7f8c8d'][i]} />
        </mesh>
      ))}

      {/* Conveyor belt */}
      <mesh position={[0, -0.2, -0.3]}>
        <boxGeometry args={[4.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Rollers */}
      <group ref={beltRef}>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i} position={[-2 + i * 0.45, -0.23, -0.3]}>
            <cylinderGeometry args={[0.025, 0.025, 0.48, 8]} />
            <meshStandardMaterial color="#666" metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Data packages */}
      {arr.map((v, i) => {
        const x = offX + i * spacing;
        const sel = highlights.includes(i);
        const h = (v / maxVal) * 0.6 + 0.15;
        const boxColors = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#7f8c8d'];
        return (
          <group key={i}>
            <PulsingLight pos={[x, 0.5, -0.3]} color="#ffd700" active={sel} />
            <mesh position={[x, h / 2 - 0.15, -0.3]}>
              <boxGeometry args={[0.35, h, 0.35]} />
              <meshStandardMaterial color={sel ? '#ffd700' : boxColors[i % boxColors.length]} roughness={0.7} />
            </mesh>
            {/* Package tape */}
            <mesh position={[x, h - 0.1, -0.3]}>
              <boxGeometry args={[0.25, 0.02, 0.36]} />
              <meshBasicMaterial color="#eee" />
            </mesh>
            {/* Label */}
            <mesh position={[x, h / 2, -0.12]}>
              <planeGeometry args={[0.2, 0.15]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
            <Text position={[x, h / 2, -0.11]} fontSize={0.07} color="#333">{String(v)}</Text>
          </group>
        );
      })}

      {Object.entries(pointers).map(([name, idx]) => {
        const x = offX + idx * spacing;
        return <Text key={name} position={[x, -0.5, -0.3]} fontSize={0.08} color="#ff69b4">{name}</Text>;
      })}

      <Text position={[0, 1.4, 0.5]} fontSize={0.22} color="#f59e0b">📦 包裹分拣 — {label}</Text>
    </group>
  );
}

export default function SortingScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const d1 = naiveSnapshot ? detectData(naiveSnapshot.data) : null;
  const d2 = optimizedSnapshot ? detectData(optimizedSnapshot.data) : null;
  const arr1 = d1?.kind === 'array' ? (d1.array ?? []) : [];
  const arr2 = d2?.kind === 'array' ? (d2.array ?? []) : [];
  const h1 = naiveSnapshot?.highlights ?? [];
  const h2 = optimizedSnapshot?.highlights ?? [];
  const p1 = naiveSnapshot?.pointers ?? {};
  const p2 = optimizedSnapshot?.pointers ?? {};

  const isSelection = algorithmId === 'selection-sort';
  const isInsertion = algorithmId === 'insertion-sort';
  const isMerge = algorithmId === 'merge-sort';
  const isCounting = algorithmId === 'non-compare-sort';

  if (!isSelection && !isInsertion && !isMerge && !isCounting) return null;

  return (
    <group>
      {isSelection && (
        <>
          <CardTable arr={arr1} highlights={h1} pointers={p1} label="朴素" xOffset={-4} />
          <CardTable arr={arr2} highlights={h2} pointers={p2} label="优化" xOffset={4} />
        </>
      )}
      {isInsertion && (
        <>
          <BeachScene arr={arr1} highlights={h1} pointers={p1} label="朴素" xOffset={-4} />
          <BeachScene arr={arr2} highlights={h2} pointers={p2} label="优化" xOffset={4} />
        </>
      )}
      {isMerge && (
        <>
          <FactoryScene arr={arr1} highlights={h1} pointers={p1} label="朴素" xOffset={-4} />
          <FactoryScene arr={arr2} highlights={h2} pointers={p2} label="优化" xOffset={4} />
        </>
      )}
      {isCounting && (
        <>
          <WarehouseScene arr={arr1} highlights={h1} pointers={p1} label="朴素" xOffset={-4} />
          <WarehouseScene arr={arr2} highlights={h2} pointers={p2} label="优化" xOffset={4} />
        </>
      )}
      <mesh position={[0, 0, -1]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
    </group>
  );
}

export function detectMoreSorting(s: TraceSnapshot): boolean {
  if (algorithmId !== 'selection-sort' && algorithmId !== 'insertion-sort' && algorithmId !== 'merge-sort' && algorithmId !== 'non-compare-sort') return false;
  const d = detectData(s.data);
  return d?.kind === 'array';
}

export const sortingSceneDef = {
  id: 'sorting-engineering',
  kind: 'engineering' as const,
  name: '排序工厂',
  detect: detectMoreSorting,
  priority: 100,
  component: SortingScene,
};
