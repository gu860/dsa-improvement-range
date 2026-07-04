import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function renderMatrixSide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  if (!snapshot) return null;
  const data = snapshot.data;
  const matrix: number[][] = (data?.matrix as number[][]) ?? [];
  const highlights = snapshot.highlights ?? [];

  if (matrix.length === 0 || matrix[0].length === 0) return null;

  const rows = matrix.length;
  const cols = Math.max(...matrix.map((r) => r.length), 1);
  const cellSize = 0.3;
  const gap = 0.04;
  const offsetX = -(cols * (cellSize + gap) - gap) / 2 + cellSize / 2;
  const offsetZ = -(rows * (cellSize + gap) - gap) / 2 + cellSize / 2;
  const maxVal = Math.max(...matrix.flat(), 1);

  return (
    <group position={[xOffset, 0, 0]}>
      <Text position={[0, 2.0, 0]} fontSize={0.22} color={`hsl(${hue}, 70%, 60%)`}>
        {label}
      </Text>
      {matrix.map((row, i) =>
        row.map((val, j) => {
          const x = offsetX + j * (cellSize + gap);
          const z = offsetZ + i * (cellSize + gap);
          const isHL = highlights.includes(i) || highlights.includes(j);
          const norm = val / maxVal;
          const h = 0.02 + norm * 0.35;
          return (
            <group key={`${i}-${j}`}>
              <mesh position={[x, h / 2, z]}>
                <boxGeometry args={[cellSize, h, cellSize]} />
                <meshStandardMaterial
                  color={isHL ? '#f59e0b' : new THREE.Color().setHSL(hue / 360, 0.4 + norm * 0.3, 0.3 + norm * 0.3)}
                  emissive={isHL ? '#f59e0b' : '#000'}
                  emissiveIntensity={isHL ? 0.5 : 0}
                />
              </mesh>
              <Text position={[x, h + 0.1, z]} fontSize={0.07} color="#aaa">
                {String(val)}
              </Text>
            </group>
          );
        })
      )}
    </group>
  );
}

export default function MatrixAbstract({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const left = renderMatrixSide(naiveSnapshot, -5, 'Naive (2D)', 240);
  const right = renderMatrixSide(optimizedSnapshot, 5, 'Opt (1D)', 140);

  if (!left && !right) {
    return <Text position={[0, 0, 0]} fontSize={0.4} color="#666">等待数据...</Text>;
  }

  return (
    <group>
      {left}
      {right}
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[0.02, 5]} />
        <meshBasicMaterial color="#444" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function detectMatrix(snapshot: TraceSnapshot): boolean {
  const matrix = snapshot.data?.['matrix'];
  return Array.isArray(matrix) && matrix.length > 0 && Array.isArray(matrix[0]);
}

export const matrixAbstractDef = {
  id: 'matrix-abstract',
  kind: 'abstract' as const,
  name: '矩阵视图',
  detect: detectMatrix,
  priority: 10,
  component: MatrixAbstract,
};
