import { Text } from '@react-three/drei';
import { detectData } from '../DataDetector';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function renderStringSide(snapshot: TraceSnapshot | null, yOffset: number, label: string, hue: number) {
  const detected = snapshot ? detectData(snapshot.data) : null;
  const text = detected?.text ?? '';
  const pattern = detected?.pattern ?? '';
  const highlights = snapshot?.highlights ?? [];

  if (!text) return null;

  const chars = text.split('');
  const spacing = 0.9;
  const totalWidth = chars.length * spacing;
  const offsetX = -totalWidth / 2 + spacing / 2;

  return (
    <group position={[0, yOffset, 0]}>
      {/* Pattern display */}
      {pattern && (
        <Text position={[0, 2.2, 0]} fontSize={0.22} color="#f59e0b">
          {`Pattern: ${pattern}`}
        </Text>
      )}
      {/* Character boxes */}
      {chars.map((ch, idx) => {
        const isHighlighted = highlights.includes(idx);
        const x = offsetX + idx * spacing;
        return (
          <group key={idx}>
            <mesh position={[x, 0, 0]}>
              <boxGeometry args={[0.7, 0.7, 0.2]} />
              <meshStandardMaterial
                color={isHighlighted ? `hsl(${hue}, 80%, 55%)` : `hsl(${hue}, 30%, 30%)`}
                emissive={isHighlighted ? `hsl(${hue}, 80%, 50%)` : '#000'}
                emissiveIntensity={isHighlighted ? 0.4 : 0}
              />
            </mesh>
            <Text position={[x, 0, 0.2]} fontSize={0.35} color="#fff">
              {ch}
            </Text>
          </group>
        );
      })}
      {/* Index labels */}
      {chars.map((_, idx) => {
        const x = offsetX + idx * spacing;
        return (
          <Text key={`idx-${idx}`} position={[x, -0.6, 0]} fontSize={0.15} color="#64748b">
            {String(idx)}
          </Text>
        );
      })}
      <Text position={[-totalWidth / 2 - 1, 0, 0]} fontSize={0.22} color={`hsl(${hue}, 70%, 60%)`}>
        {label}
      </Text>
    </group>
  );
}

export default function StringAbstract({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      {renderStringSide(naiveSnapshot, -1.8, '朴素', 300)}
      {renderStringSide(optimizedSnapshot, 1.8, '优化', 180)}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[16, 0.02]} />
        <meshBasicMaterial color="#444" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export function detectText(snapshot: TraceSnapshot): boolean {
  const d = detectData(snapshot.data);
  return d?.kind === 'text';
}

export const stringAbstractDef = {
  id: 'string-abstract',
  kind: 'abstract' as const,
  name: '字符串视图',
  detect: detectText,
  priority: 10,
  component: StringAbstract,
};
