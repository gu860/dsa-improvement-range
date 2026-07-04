import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectData } from '../DataDetector';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function Typewriter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.8, 0.1, 0.5]} /><meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.3} /></mesh>
      {/* Platen */}
      <mesh position={[0, 0.25, -0.15]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.7, 12]} /><meshStandardMaterial color="#444" metalness={0.5} /></mesh>
      {/* Keys row */}
      {Array.from({ length: 5 }, (_, i) => (
        Array.from({ length: 8 }, (_, j) => (
          <mesh key={`${i}-${j}`} position={[-0.3 + j * 0.09, 0.18, -0.15 + i * 0.07]}>
            <boxGeometry args={[0.07, 0.02, 0.05]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        ))
      ))}
    </group>
  );
}

function Magnifier({ position, active }: { position: [number, number, number]; active?: boolean }) {
  const glassRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (glassRef.current && active) {
      glassRef.current.scale.setScalar(1 + Math.sin(Date.now() / 800) * 0.05);
    }
  });
  return (
    <group position={position}>
      {/* Handle */}
      <mesh position={[0.08, -0.2, 0]} rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.02, 0.025, 0.25, 8]} /><meshStandardMaterial color="#5c3a1e" roughness={0.6} /></mesh>
      {/* Frame */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, 0.3]}><torusGeometry args={[0.12, 0.015, 8, 16]} /><meshStandardMaterial color="#888" metalness={0.4} /></mesh>
      {/* Glass */}
      {active && (
        <mesh ref={glassRef} position={[0, 0.08, 0.01]} rotation={[0, 0, 0.3]}>
          <circleGeometry args={[0.1, 16]} />
          <meshBasicMaterial color="#aaddff" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

function InkWell({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.06, 0.08, 0.06, 12]} /><meshStandardMaterial color="#1a1a2e" roughness={0.3} /></mesh>
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.04, 0.04, 0.02, 12]} /><meshStandardMaterial color="#16213e" /></mesh>
    </group>
  );
}

function renderDocumentSide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  const detected = snapshot ? detectData(snapshot.data) : null;
  const text = detected?.text ?? '';
  const pattern = detected?.pattern ?? '';
  const highlights = snapshot?.highlights ?? [];

  const chars = text.split('');
  const firstHL = highlights.length > 0 ? highlights[0] : -1;

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial color="#c4b89a" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1.8, -4.5]}>
        <boxGeometry args={[7, 3.6, 0.1]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.8} />
      </mesh>
      {/* Wooden desk */}
      <mesh position={[0, 0.5, -1.2]}><boxGeometry args={[3, 0.08, 2]} /><meshStandardMaterial color="#8b6914" roughness={0.7} /></mesh>
      {[[-1.3, -1.8], [1.3, -1.8]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]}><boxGeometry args={[0.06, 0.5, 0.06]} /><meshStandardMaterial color="#6b4423" /></mesh>
      ))}
      <Typewriter position={[-0.8, 0.5, -0.8]} />
      <InkWell position={[1.0, 0.5, -1.5]} />
      {/* Paper/document */}
      <group position={[0, 0.55, -0.8]}>
        <mesh position={[0, -0.02, 0]}><planeGeometry args={[2, 1.2]} /><meshStandardMaterial color="#faf8f0" roughness={0.4} /></mesh>
        <mesh position={[0, -0.015, 0]}><planeGeometry args={[2, 1.2]} /><meshStandardMaterial color="#f5f0e0" roughness={0.3} transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
        {/* Text lines on paper */}
        {chars.map((ch, i) => {
          const row = Math.floor(i / 15);
          const col = i % 15;
          const x = -0.85 + col * 0.12;
          const y = 0.45 - row * 0.15;
          const hl = highlights.includes(i);
          return (
            <group key={i}>
              {hl && (
                <mesh position={[x, y - 0.01, 0.005]}>
                  <planeGeometry args={[0.1, 0.1]} />
                  <meshBasicMaterial color={`hsl(${hue}, 80%, 70%)`} transparent opacity={0.4} />
                </mesh>
              )}
              <Text position={[x, y, 0.01]} fontSize={0.08} color={hl ? '#000' : '#444'}>
                {ch === ' ' ? '_' : ch}
              </Text>
            </group>
          );
        })}
      </group>
      {/* Pattern / magnifier */}
      {pattern && firstHL >= 0 && (
        <Magnifier position={[
          -0.85 + (firstHL % 15) * 0.12,
          0.55 + 0.45 - Math.floor(firstHL / 15) * 0.15,
          -0.6
        ]} active />
      )}
      {pattern && (
        <Text position={[0, 2.8, -4.4]} fontSize={0.18} color="#f59e0b">
          {`Pattern: ${pattern}`}
        </Text>
      )}
      <Text position={[0, -0.3, -4.4]} fontSize={0.16} color={`hsl(${hue}, 70%, 60%)`}>{label}</Text>
    </group>
  );
}

export default function DocumentMatchScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      <hemisphereLight args={['#fff8e7', '#c4b89a', 0.4]} />
      <directionalLight position={[4, 5, 3]} intensity={0.35} />
      <ambientLight intensity={0.2} color="#e8dcc8" />
      {renderDocumentSide(naiveSnapshot, -4.0, '朴素字符串', 300)}
      {renderDocumentSide(optimizedSnapshot, 4.0, '优化(KMP)', 180)}
      <mesh position={[0, 0, -2]}><planeGeometry args={[0.02, 6]} /><meshBasicMaterial color="#333" transparent opacity={0.5} /></mesh>
    </group>
  );
}

export function detectTextData(snapshot: TraceSnapshot): boolean {
  const d = detectData(snapshot.data);
  return d?.kind === 'text';
}

export const documentMatchDef = {
  id: 'document-match',
  kind: 'engineering' as const,
  name: '文档室',
  detect: detectTextData,
  priority: 10,
  component: DocumentMatchScene,
};
