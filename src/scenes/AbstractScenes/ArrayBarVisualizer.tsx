import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';
import { detectData } from '../DataDetector';

function renderBars(snapshot: TraceSnapshot | null, yOffset: number, colorHue: number) {
  const detected = snapshot ? detectData(snapshot.data) : null;
  const array = detected?.kind === 'array' ? detected.array : [];
  const highlights = snapshot?.highlights ?? [];
  const pointers = snapshot?.pointers ?? {};

  if (!array || array.length === 0) return null;

  const maxVal = Math.max(...array, 1);
  const count = array.length;
  const spacing = 1.2;
  const totalWidth = count * spacing;
  const offsetX = -totalWidth / 2 + spacing / 2;

  return (
    <group position={[0, yOffset, 0]}>
      {array.map((val, idx) => {
        const height = (val / maxVal) * 3.5 + 0.3;
        const isHighlighted = highlights.includes(idx);
        const x = offsetX + idx * spacing;
        const y = height / 2;
        const color = `hsl(${colorHue}, ${isHighlighted ? 80 : 60}%, ${isHighlighted ? 55 : 40}%)`;
        const emissiveColor = isHighlighted ? `hsl(${colorHue}, 80%, 50%)` : '#000';
        return (
          <group key={idx}>
            <mesh position={[x, y, 0]}>
              <boxGeometry args={[0.8, height, 0.8]} />
              <meshStandardMaterial
                color={color}
                emissive={emissiveColor}
                emissiveIntensity={isHighlighted ? 0.4 : 0}
              />
            </mesh>
            <Text position={[x, y + height / 2 + 0.3, 0]} fontSize={0.2} color="#94a3b8">
              {String(val)}
            </Text>
            {Object.entries(pointers).map(([name, v]) => {
              if (v === idx) {
                return (
                  <Text key={name} position={[x, height + 0.8, 0]} fontSize={0.25} color="#f472b6">
                    {name}
                  </Text>
                );
              }
              return null;
            })}
          </group>
        );
      })}
    </group>
  );
}

export default function ArrayBarVisualizer({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      {renderBars(naiveSnapshot, -1.8, 240)}
      {renderBars(optimizedSnapshot, 1.8, 160)}
      {/* Labels */}
      <Text position={[-6, -1.8, 0]} fontSize={0.25} color="#6366f1">Naive</Text>
      <Text position={[-6, 1.8, 0]} fontSize={0.25} color="#22c55e">Optimized</Text>
      {/* Horizontal divider */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[16, 0.02]} />
        <meshBasicMaterial color="#444" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export function detectArray(snapshot: TraceSnapshot): boolean {
  const detected = detectData(snapshot.data);
  return detected?.kind === 'array';
}

export const arrayBarDef = {
  id: 'array-bar',
  kind: 'abstract' as const,
  name: '柱状数组',
  detect: detectArray,
  priority: 10,
  component: ArrayBarVisualizer,
};
