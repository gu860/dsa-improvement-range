import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectData } from '../DataDetector';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function Bookshelf({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  const height = 2.2;
  const shelfColors = ['#8b2500', '#1a5276', '#7d6608', '#1e5631', '#6c3483', '#a0522d', '#2c3e50', '#922b21'];
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, height / 2, -0.15]}><boxGeometry args={[2.2, height, 0.3]} /><meshStandardMaterial color="#5c3a1e" roughness={0.8} /></mesh>
      {Array.from({ length: 4 }, (_, i) => {
        const y = 0.15 + i * 0.55;
        return (
          <group key={i}>
            <mesh position={[0, y, 0.1]}><boxGeometry args={[2.0, 0.04, 0.5]} /><meshStandardMaterial color="#6b4423" roughness={0.7} /></mesh>
            {Array.from({ length: 5 }, (_, j) => {
              const cx = -0.8 + j * 0.4;
              const h = 0.25 + ((i * 7 + j * 13) % 5) * 0.05;
              return (
                <mesh key={j} position={[cx, y + h / 2 + 0.02, 0.1]}>
                  <boxGeometry args={[0.35, h, 0.4]} />
                  <meshStandardMaterial color={shelfColors[(i * 5 + j) % shelfColors.length]} roughness={0.5} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

function DeskLamp({ position, on }: { position: [number, number, number]; on?: boolean }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  useFrame(() => {
    if (lightRef.current && on) lightRef.current.intensity = 0.8 + Math.sin(Date.now() / 1000) * 0.2;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.04, 0.06, 0.3, 8]} /><meshStandardMaterial color="#444" metalness={0.6} /></mesh>
      <mesh position={[0.15, 0.5, 0]} rotation={[0.3, 0, 0]}><boxGeometry args={[0.3, 0.04, 0.2]} /><meshStandardMaterial color="#555" metalness={0.5} /></mesh>
      <mesh position={[0.15, 0.45, 0]}>
        <coneGeometry args={[0.1, 0.12, 12]} />
        <meshStandardMaterial color="#ffd700" emissive={on ? '#ffd700' : '#000'} emissiveIntensity={on ? 0.3 : 0} />
      </mesh>
      {on && <spotLight ref={lightRef} position={[0.15, 0.4, 0]} angle={0.5} penumbra={0.5} decay={1} distance={4} intensity={0.8} color="#ffd700" />}
    </group>
  );
}

function SearchLight({ active, pos }: { active?: boolean; pos: [number, number, number] }) {
  const beamRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (beamRef.current && active) beamRef.current.scale.x = 0.8 + Math.sin(Date.now() / 600) * 0.2;
  });
  if (!active) return null;
  return (
    <group position={pos}>
      <mesh ref={beamRef} position={[0, -0.5, 0]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.1, 0.8, 16, 1, true]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <pointLight intensity={0.3} color="#ffd700" distance={2} />
    </group>
  );
}

function renderLibrarySide(snapshot: TraceSnapshot | null, xOffset: number, label: string, hue: number) {
  const detected = snapshot ? detectData(snapshot.data) : null;
  const array = (detected?.kind === 'search' && detected.array) || (detected?.kind === 'array' && detected.array) || [];
  const target = detected?.kind === 'search' ? detected.target : undefined;
  const highlights = snapshot?.highlights ?? [];

  const arrayLen = array.length;

  return (
    <group position={[xOffset, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 1.5, -4.5]}>
        <boxGeometry args={[7, 3, 0.1]} />
        <meshStandardMaterial color="#d4c5a9" roughness={0.8} />
      </mesh>
      {/* Bookshelves */}
      <Bookshelf position={[-2.5, 0, -3.8]} rotationY={0} />
      <Bookshelf position={[2.5, 0, -3.8]} rotationY={0} />
      {/* Desk */}
      <mesh position={[0, 0.5, -1.5]}><boxGeometry args={[2.5, 0.08, 1.2]} /><meshStandardMaterial color="#6b4423" roughness={0.7} /></mesh>
      {[[-1.1, -2], [1.1, -2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]}><boxGeometry args={[0.06, 0.5, 0.06]} /><meshStandardMaterial color="#5c3a1e" /></mesh>
      ))}
      <DeskLamp position={[0.8, 0.5, -1.2]} on />
      {/* Search cards on desk */}
      <group position={[0, 0.2, -1]}>
        <mesh position={[0, -0.02, 0]}><planeGeometry args={[2, 0.3]} /><meshStandardMaterial color="#f5f0e0" roughness={0.3} /></mesh>
        {array.map((v, i) => {
          const x = -1 + (arrayLen > 1 ? (i / (arrayLen - 1)) * 2 : 0);
          const hl = highlights.includes(i);
          return (
            <group key={i}>
              <mesh position={[x, 0.05, 0]}><boxGeometry args={[0.2, 0.02, 0.2]} /><meshStandardMaterial color={hl ? '#ffd700' : '#555'} emissive={hl ? '#ffd700' : '#000'} emissiveIntensity={hl ? 0.1 : 0} /></mesh>
              <Text position={[x, 0.12, 0]} fontSize={0.08} color={hl ? '#ffd700' : '#aaa'}>{String(v)}</Text>
              {hl && <SearchLight active pos={[x, 0.3, 0.1]} />}
            </group>
          );
        })}
      </group>
      {/* Target on chalkboard */}
      {target !== undefined && (
        <Text position={[0, 2.5, -4.4]} fontSize={0.25} color="#f59e0b">
          {`Searching: ${target}`}
        </Text>
      )}
      <Text position={[0, -0.5, -4.4]} fontSize={0.18} color={`hsl(${hue}, 70%, 60%)`}>{label}</Text>
    </group>
  );
}

export default function LibrarySearchScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      <hemisphereLight args={['#ffe6c0', '#8b7355', 0.4]} />
      <directionalLight position={[3, 6, 2]} intensity={0.3} />
      <ambientLight intensity={0.2} color="#d4c5a9" />
      {renderLibrarySide(naiveSnapshot, -3.8, '朴素搜索', 30)}
      {renderLibrarySide(optimizedSnapshot, 3.8, '优化搜索', 200)}
      <mesh position={[0, 0, -2]}><planeGeometry args={[0.02, 6]} /><meshBasicMaterial color="#333" transparent opacity={0.5} /></mesh>
    </group>
  );
}

export function detectSearchData(snapshot: TraceSnapshot): boolean {
  const d = detectData(snapshot.data);
  return d?.kind === 'search' || (d?.kind === 'array' && snapshot.data['target'] !== undefined);
}

export const librarySearchDef = {
  id: 'library-search',
  kind: 'engineering' as const,
  name: '图书馆',
  detect: detectSearchData,
  priority: 10,
  component: LibrarySearchScene,
};
