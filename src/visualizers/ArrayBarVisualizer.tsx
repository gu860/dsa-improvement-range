import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TraceSnapshot } from '../core/types';
import { detectData } from './DataDetector';

function BarGroup({ snapshot }: { snapshot: TraceSnapshot | null }) {
  const detected = snapshot ? detectData(snapshot.data) : null;
  const array = detected?.kind === 'array' ? detected.array : [];
  const highlights = snapshot?.highlights ?? [];
  const pointers = snapshot?.pointers ?? {};

  const bars = useMemo(() => {
    if (!array || array.length === 0) return [];
    const maxVal = Math.max(...array, 1);
    const count = array.length;
    const spacing = 1.2;
    const totalWidth = count * spacing;
    const offsetX = -totalWidth / 2 + spacing / 2;

    return array.map((val, idx) => {
      const height = (val / maxVal) * 8 + 0.5;
      const isHighlighted = highlights.includes(idx);
      const color = isHighlighted ? '#f59e0b' : '#6366f1';
      const emissiveColor = isHighlighted ? '#f59e0b' : '#000000';
      const emissiveIntensity = isHighlighted ? 0.4 : 0;
      const x = offsetX + idx * spacing;
      const y = height / 2;
      return { idx, x, y, height, color, emissiveColor, emissiveIntensity, val };
    });
  }, [array, highlights]);

  if (!array || array.length === 0) {
    return (
      <Text position={[0, 0, 0]} fontSize={0.5} color="#666">
        无数据
      </Text>
    );
  }

  return (
    <group>
      {bars.map((bar) => (
        <group key={bar.idx}>
          <mesh position={[bar.x, bar.y, 0]}>
            <boxGeometry args={[0.8, bar.height, 0.8]} />
            <meshStandardMaterial
              color={bar.color}
              emissive={bar.emissiveColor}
              emissiveIntensity={bar.emissiveIntensity}
            />
          </mesh>
          {/* value label on top of each bar */}
          <Text
            position={[bar.x, bar.y + bar.height / 2 + 0.3, 0]}
            fontSize={0.3}
            color="#94a3b8"
          >
            {String(bar.val)}
          </Text>
          {/* pointer markers */}
          {Object.entries(pointers).map(([name, val]) => {
            if (val === bar.idx) {
              return (
                <Text
                  key={name}
                  position={[bar.x, bar.height + 1.2, 0]}
                  fontSize={0.35}
                  color="#f472b6"
                >
                  {name}
                </Text>
              );
            }
            return null;
          })}
        </group>
      ))}
    </group>
  );
}

interface Props {
  snapshot: TraceSnapshot | null;
}

export default function ArrayBarVisualizer({ snapshot }: Props) {
  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <BarGroup snapshot={snapshot} />
      <OrbitControls enablePan={true} enableZoom={true} />
    </Canvas>
  );
}
