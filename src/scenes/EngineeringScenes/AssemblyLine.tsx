import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function RobotArm({ position, active }: { position: [number, number, number]; active?: boolean }) {
  const armRef = useRef<THREE.Group>(null);
  const tipRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (armRef.current && active) armRef.current.rotation.z = Math.sin(Date.now() / 400) * 0.4;
    if (tipRef.current && active) { const s = 0.8 + Math.sin(Date.now() / 150) * 0.2; tipRef.current.scale.setScalar(s); }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.1, 0.15, 0.08, 12]} /><meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.08, 0.1, 0.04, 12]} /><meshStandardMaterial color="#666" metalness={0.7} roughness={0.2} /></mesh>
      <mesh position={[0, 0.16, 0]}><torusGeometry args={[0.07, 0.015, 6, 12]} /><meshStandardMaterial color="#ff8c00" metalness={0.5} /></mesh>
      <group ref={armRef}>
        <mesh position={[0, 0.35, 0]} rotation={[active ? 0.2 : 0, 0, 0]}><boxGeometry args={[0.05, 0.3, 0.05]} /><meshStandardMaterial color="#ff8c00" metalness={0.5} roughness={0.4} /></mesh>
        <mesh position={[active ? 0.18 : 0.12, 0.5, 0]} rotation={[0, 0, active ? -0.6 : -0.3]}><boxGeometry args={[0.04, 0.22, 0.04]} /><meshStandardMaterial color="#ffa726" metalness={0.5} roughness={0.4} /></mesh>
      </group>
      {active && <mesh ref={tipRef} position={[0.28, 0.35, 0]}><sphereGeometry args={[0.015, 6, 6]} /><meshBasicMaterial color="#ff0" /></mesh>}
      {active && <pointLight position={[0.28, 0.35, 0]} intensity={0.4} color="#ff0" distance={0.4} />}
    </group>
  );
}

function renderFactorySide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  if (!snapshot) return null;
  const data = snapshot.data;
  const matrix: number[][] = (data?.matrix as number[][]) ?? [];
  const highlights = snapshot.highlights ?? [];
  if (matrix.length === 0 || matrix[0].length === 0) return null;

  const maxVal = Math.max(...matrix.flat(), 1);
  const rows = matrix.length;
  const cols = Math.max(...matrix.map((r) => r.length), 1);
  const spacing = 0.5;

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[cols * spacing + 1.5, rows * spacing + 1.5]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <planeGeometry args={[cols * spacing + 1.5, rows * spacing + 1.5]} />
        <meshStandardMaterial color="#555" wireframe transparent opacity={0.08} />
      </mesh>
      {/* Safety walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.085, -(rows * spacing) / 2 - 0.4]}>
        <planeGeometry args={[cols * spacing + 1, 0.3]} />
        <meshStandardMaterial color="#e8c820" transparent opacity={0.2} />
      </mesh>

      {/* Stations */}
      {matrix.map((row, i) =>
        row.map((val, j) => {
          const x = (j - (cols - 1) / 2) * spacing;
          const z = (i - (rows - 1) / 2) * spacing;
          const h = maxVal > 0 ? (val / maxVal) * 0.8 + 0.05 : 0.05;
          const isHL = highlights.includes(i) || highlights.includes(j) ||
            (highlights.length >= 2 && highlights[0] === i && highlights[1] === j);
          return (
            <group key={`${i}-${j}`} position={[x, 0, z]}>
              <mesh position={[0, -0.02, 0]}><boxGeometry args={[0.28, 0.02, 0.28]} /><meshStandardMaterial color="#555" metalness={0.4} /></mesh>
              <mesh position={[0, -0.01, 0]}><boxGeometry args={[0.29, 0.005, 0.29]} /><meshStandardMaterial color="#ffd54f" transparent opacity={0.3} /></mesh>
              <mesh position={[0, h / 2, 0]}>
                <boxGeometry args={[0.16, h, 0.16]} />
                <meshStandardMaterial
                  color={isHL ? '#f59e0b' : `hsl(${hue}, 50%, 45%)`}
                  emissive={isHL ? '#f59e0b' : '#000'}
                  emissiveIntensity={isHL ? 0.5 : 0}
                  transparent opacity={0.85}
                />
              </mesh>
              <Text position={[0, h + 0.08, 0]} fontSize={0.06} color="#ccc">{String(val)}</Text>
              <mesh position={[0.15, 0.04, 0]}><sphereGeometry args={[0.012, 6, 6]} /><meshStandardMaterial color={isHL ? '#4caf50' : '#888'} emissive={isHL ? '#4caf50' : '#000'} emissiveIntensity={isHL ? 0.8 : 0} /></mesh>
            </group>
          );
        })
      )}

      {/* Conveyor tracks */}
      {matrix.map((row, i) => {
        const z = (i - (rows - 1) / 2) * spacing;
        return (
          <group key={i} position={[0, -0.03, z]}>
            <mesh position={[0, 0, 0]}><boxGeometry args={[(cols - 1) * spacing + 0.2, 0.015, 0.1]} /><meshStandardMaterial color="#444" roughness={0.9} /></mesh>
            {Array.from({ length: Math.max(Math.floor(cols), 2) }, (_, ri) => (
              <mesh key={ri} position={[(ri / Math.max(Math.floor(cols), 2) - 0.5) * (cols - 1) * spacing, -0.03, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.12, 6]} />
                <meshStandardMaterial color="#666" metalness={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Robot arms */}
      {highlights.length >= 2 && (
        <RobotArm
          position={[(highlights[1] - (cols - 1) / 2) * spacing, 0, (highlights[0] - (rows - 1) / 2) * spacing - spacing / 2]}
          active
        />
      )}

      {/* Labels */}
      {matrix.map((_, i) => (
        <Text key={i} position={[-(cols - 1) / 2 * spacing - 0.5, 0, (i - (rows - 1) / 2) * spacing]} fontSize={0.08} color="#888">{`R${i}`}</Text>
      ))}
      {Array.from({ length: cols }, (_, j) => (
        <Text key={j} position={[(j - (cols - 1) / 2) * spacing, 0, -(rows - 1) / 2 * spacing - 0.5]} fontSize={0.08} color="#888">{`C${j}`}</Text>
      ))}

      {/* Overhead monitor */}
      <group position={[0, 0.6, -(rows * spacing + 1) / 2 + 0.1]}>
        <mesh><planeGeometry args={[1.2, 0.25]} /><meshBasicMaterial color="#0a0a1a" /></mesh>
        <Text position={[0, 0, 0.01]} fontSize={0.07} color="#4fc3f7">{`DP ${rows}×${cols}`}</Text>
      </group>

      {/* Title */}
      <Text position={[-(cols * spacing) / 2, 0.6, (rows * spacing) / 2 + 0.3]} fontSize={0.18} color={`hsl(${hue}, 70%, 60%)`}>{label}</Text>
    </group>
  );
}

export default function AssemblyLineScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      <hemisphereLight args={['#b0c4de', '#5a5a5a', 0.4]} />
      <directionalLight position={[3, 5, 4]} intensity={0.6} />
      {/* Back wall */}
      <mesh position={[0, 0.5, -2.2]}><planeGeometry args={[12, 2]} /><meshStandardMaterial color="#555" roughness={0.8} /></mesh>
      {/* Ceiling lights */}
      {[-2, 0, 2].map((x) => (
        <group key={x}>
          <pointLight position={[x, 1.2, 0]} intensity={0.5} color="#fff8e0" distance={4} />
          <mesh position={[x, 1.0, 0]}><boxGeometry args={[0.3, 0.02, 0.04]} /><meshStandardMaterial color="#ddd" emissive="#ffffee" emissiveIntensity={0.2} /></mesh>
        </group>
      ))}
      {/* Safety barriers */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[0, 0.1, side * 2]}>
            <boxGeometry args={[10, 0.015, 0.015]} />
            <meshStandardMaterial color="#f44336" />
          </mesh>
        </group>
      ))}
      {renderFactorySide(naiveSnapshot, -5, 'Naive (2D DP)', 240)}
      {renderFactorySide(optimizedSnapshot, 5, 'Opt (1D DP)', 140)}
      <mesh position={[0, 0, -2]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.3} /></mesh>
    </group>
  );
}

export function detectMatrix(snapshot: TraceSnapshot): boolean {
  const matrix = snapshot.data?.['matrix'];
  return Array.isArray(matrix) && matrix.length > 0 && Array.isArray(matrix[0]);
}

export const assemblyLineDef = {
  id: 'assembly-line',
  kind: 'engineering' as const,
  name: '流水线',
  detect: detectMatrix,
  priority: 10,
  component: AssemblyLineScene,
};
