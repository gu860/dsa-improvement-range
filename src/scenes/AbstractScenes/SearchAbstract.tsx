import { Text } from '@react-three/drei';
import { detectData } from '../DataDetector';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function renderSearchSide(snapshot: TraceSnapshot | null, yOffset: number, label: string, hue: number) {
  const detected = snapshot ? detectData(snapshot.data) : null;
  const array = detected?.kind === 'search' && detected.array ? detected.array : [];
  const target = detected?.target ?? 0;
  const highlights = snapshot?.highlights ?? [];
  const pointers = snapshot?.pointers ?? {};

  if (array.length === 0) return null;

  const maxVal = Math.max(...array, 1);
  const spacing = 1.3;
  const totalWidth = array.length * spacing;
  const offsetX = -totalWidth / 2 + spacing / 2;

  return (
    <group position={[0, yOffset, 0]}>
      {/* Target indicator */}
      <Text position={[0, 3, 0]} fontSize={0.3} color="#f59e0b">
        {`Target: ${target}`}
      </Text>
      {array.map((val, idx) => {
        const height = (val / maxVal) * 2.5 + 0.3;
        const isHighlighted = highlights.includes(idx);
        const isTarget = val === target;
        const x = offsetX + idx * spacing;
        const y = height / 2;
        const color = isTarget && isHighlighted
          ? `hsl(${hue}, 90%, 60%)`
          : isHighlighted
            ? `hsl(${hue}, 70%, 50%)`
            : `hsl(${hue}, 40%, 35%)`;
        return (
          <group key={idx}>
            <mesh position={[x, y, 0]}>
              <boxGeometry args={[0.9, height, 0.9]} />
              <meshStandardMaterial color={color} emissive={isHighlighted ? `hsl(${hue}, 80%, 50%)` : '#000'} emissiveIntensity={isHighlighted ? 0.4 : 0} />
            </mesh>
            <Text position={[x, y + height / 2 + 0.3, 0]} fontSize={0.2} color="#94a3b8">
              {String(val)}
            </Text>
            {isTarget && !isHighlighted && (
              <mesh position={[x, -0.2, 0]}>
                <planeGeometry args={[0.6, 0.03]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
              </mesh>
            )}
            {Object.entries(pointers).map(([name, v]) => {
              if (v === idx) {
                return (
                  <Text key={name} position={[x, height + 0.8, 0]} fontSize={0.2} color="#f472b6">
                    {name}
                  </Text>
                );
              }
              return null;
            })}
          </group>
        );
      })}
      <Text position={[-totalWidth / 2 - 0.5, 0, 0]} fontSize={0.22} color={`hsl(${hue}, 70%, 60%)`}>
        {label}
      </Text>
    </group>
  );
}

export default function SearchAbstract({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      {renderSearchSide(naiveSnapshot, -1.5, '线性搜索', 30)}
      {renderSearchSide(optimizedSnapshot, 1.5, '二分搜索', 200)}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[16, 0.02]} />
        <meshBasicMaterial color="#444" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export function detectSearch(snapshot: TraceSnapshot): boolean {
  const d = detectData(snapshot.data);
  return d?.kind === 'search';
}

export const searchAbstractDef = {
  id: 'search-abstract',
  kind: 'abstract' as const,
  name: '搜索视图',
  detect: detectSearch,
  priority: 10,
  component: SearchAbstract,
};
