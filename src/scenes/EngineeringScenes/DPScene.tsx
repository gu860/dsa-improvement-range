import { useRef } from 'react';
import { Text } from '@react-three/drei';
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

/* ======= 🧬 LAB BENCH / LCS & EDIT-DISTANCE ======= */
function LabBench({ arr, mat, highlights, label, xOffset }: { arr: number[]; mat: number[][]; highlights: number[]; label: string; xOffset: number }) {
  const hasArray = arr.length > 0;
  const hasMatrix = mat.length > 0 && mat[0]?.length > 0;

  const maxArrVal = Math.max(...arr, 1);
  const maxMatVal = hasMatrix ? Math.max(...mat.flat(), 1) : 1;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.4} color="#e0f0ff" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.7} color="#4fc3f7" distance={6} />

      {/* Lab bench */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, -0.3]}>
        <planeGeometry args={[5, 3.5]} />
        <meshStandardMaterial color="#1a2a3c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 0.5]}>
        <boxGeometry args={[4, 0.08, 0.6]} />
        <meshStandardMaterial color="#555" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Test tubes - shown when array data present */}
      {hasArray && (
        <group position={[0, 0, 0]}>
          {arr.map((v, i) => {
            const spacing = Math.min(0.25, 3.5 / Math.max(arr.length, 1));
            const x = -((arr.length - 1) * spacing) / 2 + i * spacing;
            const tubeHeight = 0.1 + (v / maxArrVal) * 0.4;
            const hl = highlights.includes(i);
            const colors = ['#4fc3f7', '#81c784', '#ffb74d', '#e57373', '#ba68c8', '#ffd54f'];
            const color = colors[i % colors.length];
            return (
              <group key={`tube-${i}`} position={[x, 0.25, 0.5]}>
                {/* Tube body */}
                <mesh position={[0, tubeHeight / 2, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, tubeHeight, 12]} />
                  <meshStandardMaterial color={color} transparent opacity={0.6} />
                </mesh>
                {/* Liquid */}
                <mesh position={[0, tubeHeight * 0.3, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, tubeHeight * 0.6, 12]} />
                  <meshStandardMaterial color={color} transparent opacity={0.85} emissive={hl ? color : '#000'} emissiveIntensity={hl ? 0.4 : 0} />
                </mesh>
                {/* Cap */}
                <mesh position={[0, tubeHeight + 0.02, 0]}>
                  <sphereGeometry args={[0.065, 12, 12]} />
                  <meshStandardMaterial color="#888" metalness={0.5} />
                </mesh>
                <Text position={[0, -0.08, 0]} fontSize={0.06} color={hl ? '#4fc3f7' : '#aaa'}>{String(v)}</Text>
                {hl && <PulsingLight pos={[x, tubeHeight + 0.3, 0.5]} color="#4fc3f7" active={true} />}
              </group>
            );
          })}
          {/* Tube rack */}
          <mesh position={[0, 0.18, 0.5]}>
            <boxGeometry args={[Math.min(3.8, arr.length * 0.3 + 0.4), 0.04, 0.2]} />
            <meshStandardMaterial color="#888" metalness={0.4} />
          </mesh>
        </group>
      )}

      {/* Petri dish grid - shown when matrix data present */}
      {hasMatrix && (
        <group position={[0, 0, -0.5]}>
          {mat.map((row, i) =>
            row.map((v, j) => {
              const rows = mat.length;
              const cols = row.length;
              const spacing = Math.min(0.35, 2.8 / Math.max(cols, rows));
              const x = -((cols - 1) * spacing) / 2 + j * spacing;
              const z = -((rows - 1) * spacing) / 2 + i * spacing;
              const idx = i * cols + j;
              const hl = highlights.includes(idx);
              const intensity = v / maxMatVal;
              const r = Math.floor(79 + intensity * 80);
              const g = Math.floor(195 + intensity * 60);
              const b = Math.floor(247 - intensity * 40);
              const color = `rgb(${r},${g},${b})`;
              return (
                <group key={`dish-${i}-${j}`}>
                  {/* Dish */}
                  <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[spacing * 0.35, 16]} />
                    <meshStandardMaterial color={color} emissive={hl ? color : '#000'} emissiveIntensity={hl ? 0.5 : 0} />
                  </mesh>
                  {/* Dish rim */}
                  <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[spacing * 0.32, spacing * 0.38, 16]} />
                    <meshStandardMaterial color="#aaa" />
                  </mesh>
                  <Text position={[x, 0.03, z]} fontSize={Math.min(0.06, spacing * 0.15)} color={hl ? '#fff' : '#225'}>{String(v)}</Text>
                  {hl && <PulsingLight pos={[x, 0.3, z]} color="#4fc3f7" active={true} />}
                </group>
              );
            })
          )}
        </group>
      )}

      <Text position={[0, 1.4, 0.5]} fontSize={0.22} color="#4fc3f7">🧬 序列实验室 — {label}</Text>
    </group>
  );
}

/* ======= 🥤 VENDING MACHINE / COIN ======= */
function VendingMachine({ arr, highlights, label, xOffset }: { arr: number[]; highlights: number[]; label: string; xOffset: number }) {
  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#fff0e0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.7} color="#ffaa44" distance={6} />

      {/* Machine body */}
      <mesh position={[0, 0.8, -0.3]}>
        <boxGeometry args={[2.8, 2.2, 0.7]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      {/* Glass window */}
      <mesh position={[0, 1, -0.05]}>
        <boxGeometry args={[2.4, 1.6, 0.02]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.25} />
      </mesh>
      {/* Shelf lines */}
      {[-0.3, 0.3].map((y, i) => (
        <mesh key={i} position={[0, 1 + y, -0.05]}>
          <boxGeometry args={[2.3, 0.015, 0.02]} />
          <meshStandardMaterial color="#888" metalness={0.5} />
        </mesh>
      ))}

      {/* Products */}
      {arr.map((v, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = -0.8 + col * 0.8;
        const y = 0.7 + row * 0.6;
        const hl = highlights.includes(i);
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
        return (
          <group key={i}>
            <PulsingLight pos={[x, y + 0.2, 0]} color="#ffd700" active={hl} />
            <mesh position={[x, y, -0.15]}>
              <boxGeometry args={[0.3, 0.35, 0.2]} />
              <meshStandardMaterial color={hl ? '#ffd700' : colors[col % colors.length]} />
            </mesh>
            <Text position={[x, y, 0.02]} fontSize={0.07} color={hl ? '#000' : '#fff'}>¥{v}</Text>
          </group>
        );
      })}

      {/* Coin slot panel */}
      <mesh position={[1, 0.2, 0.05]}>
        <boxGeometry args={[0.5, 0.8, 0.05]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>
      <mesh position={[1, 0.3, 0.08]}>
        <boxGeometry args={[0.15, 0.02, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Text position={[1, 0.1, 0.08]} fontSize={0.05} color="#888">投币</Text>

      {/* Dispenser */}
      <mesh position={[0, -0.2, 0.1]}>
        <boxGeometry args={[0.8, 0.15, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <Text position={[0, 1.8, 0.5]} fontSize={0.22} color="#ffd700">🥤 自动售货机 — {label}</Text>
    </group>
  );
}

/* ======= 🏗 CITY GRID / PATHS ======= */
function CityGrid({ mat, arr, highlights, label, xOffset }: { mat: number[][]; arr: number[]; highlights: number[]; label: string; xOffset: number }) {
  const rows = mat.length;
  const cols = mat[0]?.length ?? 0;
  const hasMat = rows > 0 && cols > 0;
  const hasArr = arr.length > 0;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#e0ffe0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#66bb6a" distance={6} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, -0.3]}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#1a3c1a" roughness={0.9} />
      </mesh>

      {/* Grid blocks from matrix */}
      {hasMat &&
        Array.from({ length: rows }, (_, i) =>
          Array.from({ length: cols }, (_, j) => {
            const x = -1.5 + j * 0.6;
            const z = -1.5 + i * 0.6;
            const idx = i * cols + j;
            const hl = highlights.includes(idx);
            return (
              <group key={`${i}-${j}`}>
                <mesh position={[x, 0.02, z]}>
                  <boxGeometry args={[0.3, 0.04, 0.3]} />
                  <meshStandardMaterial color={hl ? '#66bb6a' : '#2a4a2a'} roughness={0.7} />
                </mesh>
                <Text position={[x, 0.08, z]} fontSize={0.06} color={hl ? '#fff' : '#88aa88'}>{String(mat[i][j])}</Text>
                {hl && (
                  <>
                    <mesh position={[x, 0.06, z]}>
                      <boxGeometry args={[0.35, 0.02, 0.35]} />
                      <meshBasicMaterial color="#66bb6a" transparent opacity={0.3} />
                    </mesh>
                    <PulsingLight pos={[x, 0.3, z]} color="#66bb6a" active={true} />
                  </>
                )}
              </group>
            );
          })
        )}

      {/* Fallback numbered blocks from array */}
      {!hasMat && hasArr &&
        arr.map((v, i) => {
          const spacing = Math.min(0.6, 3.5 / Math.max(arr.length, 1));
          const x = -((arr.length - 1) * spacing) / 2 + i * spacing;
          const z = 0;
          const hl = highlights.includes(i);
          return (
            <group key={`block-${i}`}>
              <mesh position={[x, 0.12, z]}>
                <boxGeometry args={[spacing * 0.7, 0.24, spacing * 0.7]} />
                <meshStandardMaterial color={hl ? '#66bb6a' : '#3a5a3a'} roughness={0.7} />
              </mesh>
              <Text position={[x, 0.26, z]} fontSize={0.07} color={hl ? '#fff' : '#aaccaa'}>{String(v)}</Text>
              {hl && (
                <>
                  <mesh position={[x, 0.14, z]}>
                    <boxGeometry args={[spacing * 0.8, 0.02, spacing * 0.8]} />
                    <meshBasicMaterial color="#66bb6a" transparent opacity={0.3} />
                  </mesh>
                  <PulsingLight pos={[x, 0.4, z]} color="#66bb6a" active={true} />
                </>
              )}
            </group>
          );
        })}

      {/* Empty state message */}
      {!hasMat && !hasArr && (
        <Text position={[0, 0.5, 0]} fontSize={0.14} color="#88aa88">暂无路径数据</Text>
      )}

      {/* Crosswalk */}
      {[-1.8, -1.5, -1.2].map((x, i) => (
        <mesh key={i} position={[x, 0, -1.8]}><planeGeometry args={[0.06, 0.2]} /><meshBasicMaterial color="#fff" transparent opacity={0.3} /></mesh>
      ))}

      {/* Traffic light */}
      <mesh position={[-1.8, 0.4, -1.8]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-1.8, 0.5, -1.75]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.5} />
      </mesh>

      <Text position={[0, 1.5, 0.5]} fontSize={0.22} color="#66bb6a">🏗 城市路径 — {label}</Text>
    </group>
  );
}

/* ======= 🏠 NEIGHBORHOOD / ROBBER ======= */
function Neighborhood({ arr, highlights, label, xOffset }: { arr: number[]; highlights: number[]; label: string; xOffset: number }) {
  const maxVal = Math.max(...arr, 1);
  const spacing = Math.min(0.9, 3.5 / Math.max(arr.length, 1));

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#fff8e7" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#ffaa44" distance={6} />

      {/* Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, -0.3]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.95} />
      </mesh>

      {/* Houses */}
      {arr.map((v, i) => {
        const x = -((arr.length - 1) * spacing) / 2 + i * spacing;
        const h = (v / maxVal) * 0.8 + 0.3;
        const hl = highlights.includes(i);
        return (
          <group key={i}>
            <PulsingLight pos={[x, h + 0.3, -0.3]} color="#ffd700" active={hl} />
            {/* House body */}
            <mesh position={[x, h / 2 - 0.15, -0.3]}>
              <boxGeometry args={[spacing * 0.5, h, spacing * 0.45]} />
              <meshStandardMaterial color={hl ? '#e74c3c' : '#d4a853'} roughness={0.7} />
            </mesh>
            {/* Roof */}
            <mesh position={[x, h + 0.05, -0.3]} rotation={[0, 0, 0]}>
              <coneGeometry args={[spacing * 0.45, 0.18, 4]} />
              <meshStandardMaterial color={hl ? '#ff6b6b' : '#c0392b'} roughness={0.8} />
            </mesh>
            {/* Door */}
            <mesh position={[x, -0.05, -0.1]}>
              <boxGeometry args={[0.1, 0.15, 0.02]} />
              <meshStandardMaterial color="#5c3a1e" />
            </mesh>
            {/* Window */}
            <mesh position={[x, h * 0.5, -0.1]}>
              <boxGeometry args={[0.08, 0.08, 0.02]} />
              <meshStandardMaterial color="#87ceeb" emissive={hl ? '#ffd700' : '#000'} emissiveIntensity={hl ? 0.5 : 0} />
            </mesh>
            {/* Value */}
            <Text position={[x, h + 0.25, -0.3]} fontSize={0.08} color={hl ? '#ffd700' : '#aaa'}>{String(v)}</Text>
            {hl && <mesh position={[x, h + 0.35, -0.3]}><sphereGeometry args={[0.04, 6, 6]} /><meshBasicMaterial color="#ffd700" /></mesh>}
          </group>
        );
      })}

      {/* Fence */}
      {Array.from({ length: Math.max(6, arr.length + 1) }, (_, i) => {
        const totalWidth = Math.max(arr.length * spacing, 3);
        const x = -totalWidth / 2 + (i / Math.max(arr.length, 1)) * totalWidth;
        return (
          <mesh key={i} position={[x, 0.05, 0.5]}>
            <boxGeometry args={[0.02, 0.2, 0.02]} />
            <meshStandardMaterial color="#8b6914" />
          </mesh>
        );
      })}

      {/* Tree */}
      <mesh position={[2.2, 0.2, -0.5]}>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 6]} />
        <meshStandardMaterial color="#5c3a1e" />
      </mesh>
      <mesh position={[2.2, 0.45, -0.5]}>
        <coneGeometry args={[0.2, 0.3, 6]} />
        <meshStandardMaterial color="#2d8a27" />
      </mesh>

      <Text position={[0, 1.5, 0.5]} fontSize={0.22} color="#e74c3c">🏠 住宅区 — {label}</Text>
    </group>
  );
}

export default function DPScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const d1 = naiveSnapshot ? detectData(naiveSnapshot.data) : null;
  const d2 = optimizedSnapshot ? detectData(optimizedSnapshot.data) : null;
  const arr1 = d1?.kind === 'array' ? (d1.array ?? []) : [];
  const arr2 = d2?.kind === 'array' ? (d2.array ?? []) : [];
  const mat1 = d1?.kind === 'matrix' ? (d1.matrix ?? []) : [];
  const mat2 = d2?.kind === 'matrix' ? (d2.matrix ?? []) : [];
  const h1 = naiveSnapshot?.highlights ?? [];
  const h2 = optimizedSnapshot?.highlights ?? [];

  const isLCS = algorithmId === 'lcs' || algorithmId === 'edit-distance';
  const isCoin = algorithmId === 'coin-change';
  const isPaths = algorithmId === 'unique-paths';
  const isRobber = algorithmId === 'house-robber';

  if (!isLCS && !isCoin && !isPaths && !isRobber) return null;

  return (
    <group>
      {isLCS && (
        <>
          <LabBench arr={arr1} mat={mat1} highlights={h1} label="朴素" xOffset={-4} />
          <LabBench arr={arr2} mat={mat2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      {isCoin && (
        <>
          <VendingMachine arr={arr1} highlights={h1} label="朴素" xOffset={-4} />
          <VendingMachine arr={arr2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      {isPaths && (
        <>
          <CityGrid mat={mat1} arr={arr1} highlights={h1} label="朴素" xOffset={-4} />
          <CityGrid mat={mat2} arr={arr2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      {isRobber && (
        <>
          <Neighborhood arr={arr1} highlights={h1} label="朴素" xOffset={-4} />
          <Neighborhood arr={arr2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
    </group>
  );
}

export function detectDP(s: TraceSnapshot): boolean {
  if (algorithmId !== 'lcs' && algorithmId !== 'coin-change' && algorithmId !== 'edit-distance' && algorithmId !== 'unique-paths' && algorithmId !== 'house-robber') return false;
  const d = detectData(s.data);
  return !!(d?.kind === 'array' || d?.kind === 'matrix');
}

export const dpSceneDef = {
  id: 'dp-engineering',
  kind: 'engineering' as const,
  name: 'DP实验室',
  detect: detectDP,
  priority: 100,
  component: DPScene,
};
