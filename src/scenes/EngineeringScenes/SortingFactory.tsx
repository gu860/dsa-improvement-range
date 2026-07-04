import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

function Worker({ position, armAngle = 0 }: { position: [number, number, number]; armAngle?: number }) {
  return (
    <group position={position}>
      <mesh position={[-0.08, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#334" />
      </mesh>
      <mesh position={[0.08, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 6]} />
        <meshStandardMaterial color="#334" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.14]} />
        <meshStandardMaterial color="#f97316" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[0.18, 0.25, 0.01]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#f5d6b8" />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.11, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ff8c00" roughness={0.6} />
      </mesh>
      <mesh position={[-0.16, 0.05, 0]} rotation={[0, 0, armAngle]}>
        <cylinderGeometry args={[0.025, 0.03, 0.25, 6]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <mesh position={[0.16, 0.05, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.025, 0.03, 0.25, 6]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
    </group>
  );
}

function ControlConsole({ position, color = '#0ff' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial color="#555" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.45, 0.01]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.22, 0.17, 0.02]} />
        <meshStandardMaterial color="#444" metalness={0.3} />
      </mesh>
      {[-0.08, 0, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.32, 0.12]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#f44" emissive="#f44" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function FactorySign() {
  return (
    <group position={[0, 3, -2.4]}>
      <mesh>
        <planeGeometry args={[6, 0.5]} />
        <meshStandardMaterial color="#222244" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[5.8, 0.4]} />
        <meshStandardMaterial color="#1a1a33" />
      </mesh>
      <Text position={[0, 0, 0.02]} fontSize={0.3} color="#4fc3f7" fontWeight="bold">
        分拣流水线 SORTING LINE A
      </Text>
    </group>
  );
}

function renderBelt(
  snapshot: TraceSnapshot | null,
  label: string,
  yOffset: number,
  hue: number,
) {
  const data = snapshot?.data;
  const array: number[] = (data?.array as number[]) ?? [];
  const highlights = snapshot?.highlights ?? [];
  const pointers = snapshot?.pointers ?? {};
  const description = snapshot?.description;
  const count = array.length;
  if (count === 0) return null;

  const spacing = 1.5;
  const totalWidth = count * spacing;
  const offsetX = -totalWidth / 2 + spacing / 2;
  const boxSize = 0.55;

  const packages = array.map((val, idx) => {
    const x = offsetX + idx * spacing;
    const isHighlighted = highlights.includes(idx);
    const t = val / Math.max(...array, 1);
    const color = new THREE.Color().setHSL(hue / 360, 0.3 + t * 0.3, 0.4 + t * 0.2);
    return { idx, x, isHighlighted, color, val };
  });

  return (
    <group position={[0, yOffset, 0]}>
      {/* Belt surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[totalWidth + 1, 0.04, 1.4]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.9} />
      </mesh>
      {/* Belt rollers */}
      {Array.from({ length: Math.max(Math.floor(count * 1.2), 4) }, (_, i) => {
        const x = (i / Math.max(Math.floor(count * 1.2), 4) - 0.5) * (totalWidth + 0.5);
        return (
          <mesh key={i} position={[x, -0.04, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
            <meshStandardMaterial color="#666688" metalness={0.6} roughness={0.3} />
          </mesh>
        );
      })}
      {/* Belt rails */}
      {[-0.72, 0.72].map((z) => (
        <mesh key={z} position={[0, 0.08, z]}>
          <boxGeometry args={[totalWidth + 1.2, 0.12, 0.06]} />
          <meshStandardMaterial color="#55557a" metalness={0.3} />
        </mesh>
      ))}
      {/* Support legs */}
      {[-totalWidth / 2 - 0.3, totalWidth / 2 + 0.3].map((x) => (
        <group key={x}>
          {[-1, 1].map((dir) => (
            <mesh key={dir} position={[x, -0.35, dir * 0.4]}>
              <boxGeometry args={[0.05, 0.6, 0.05]} />
              <meshStandardMaterial color="#666699" metalness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Packages */}
      {packages.map((pkg) => (
        <group key={pkg.idx}>
          <mesh position={[pkg.x, boxSize / 2, 0]}>
            <boxGeometry args={[boxSize, boxSize, boxSize]} />
            <meshStandardMaterial
              color={pkg.isHighlighted ? '#f59e0b' : pkg.color}
              roughness={pkg.isHighlighted ? 0.3 : 0.85}
              emissive={pkg.isHighlighted ? '#f59e0b' : '#000'}
              emissiveIntensity={pkg.isHighlighted ? 0.5 : 0}
            />
          </mesh>
          <mesh position={[pkg.x, boxSize / 2, 0]}>
            <boxGeometry args={[boxSize, 0.015, boxSize]} />
            <meshStandardMaterial color="#c8b88a" transparent opacity={0.25} />
          </mesh>
          <mesh position={[pkg.x, boxSize / 2, 0]}>
            <boxGeometry args={[0.04, boxSize, boxSize]} />
            <meshStandardMaterial color="#c8b88a" transparent opacity={0.2} />
          </mesh>
          <mesh position={[pkg.x, boxSize / 2, boxSize / 2 + 0.005]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshStandardMaterial color="#fff" opacity={0.9} transparent />
          </mesh>
          <Text position={[pkg.x, boxSize / 2, boxSize / 2 + 0.015]} fontSize={0.15} color="#222">
            {String(pkg.val)}
          </Text>
        </group>
      ))}
      {/* Pointer indicators */}
      {Object.entries(pointers).map(([name, idx]) => {
        const x = offsetX + Number(idx) * spacing;
        return (
          <group key={name}>
            <mesh position={[x, 1.2, 0]}>
              <coneGeometry args={[0.1, 0.15, 6]} />
              <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.3} />
            </mesh>
            <Text position={[x, 1.5, 0]} fontSize={0.18} color="#f472b6">{name}</Text>
          </group>
        );
      })}
      {/* Scan frame */}
      {highlights.map((idx) => {
        const x = offsetX + idx * spacing;
        return (
          <mesh key={idx} position={[x, boxSize / 2, 0]}>
            <boxGeometry args={[boxSize + 0.3, boxSize + 0.3, boxSize + 0.3]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.1} wireframe />
          </mesh>
        );
      })}
      {/* Description */}
      {description && (
        <group position={[0, -0.5, 0]}>
          <mesh>
            <planeGeometry args={[totalWidth + 1, 0.25]} />
            <meshBasicMaterial color="#222244" transparent opacity={0.7} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.15} color="#b0c4de">
            {description}
          </Text>
        </group>
      )}
      {/* Label */}
      <Text position={[-totalWidth / 2 - 0.5, 0.8, 0]} fontSize={0.22} color={`hsl(${hue}, 70%, 60%)`}>
        {label}
      </Text>
    </group>
  );
}

export default function SortingFactoryScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      {/* Concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#8a8a7a" roughness={0.95} />
      </mesh>
      {/* Floor subtle grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#9a9a8a" wireframe transparent opacity={0.08} />
      </mesh>
      {/* Safety yellow walkway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, -1.2]}>
        <planeGeometry args={[18, 0.5]} />
        <meshStandardMaterial color="#e8c820" transparent opacity={0.3} />
      </mesh>
      {/* Safety yellow line edges */}
      {[-1.45, -0.95].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.47, z]}>
          <planeGeometry args={[18, 0.03]} />
          <meshStandardMaterial color="#e8c820" emissive="#e8c820" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* Back wall */}
      <mesh position={[0, 0.5, -2.8]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#c8c0b0" roughness={0.9} />
      </mesh>
      {/* Wall panel lines */}
      {[-8, -4, 0, 4, 8].map((x) => (
        <mesh key={x} position={[x, 0.5, -2.79]}>
          <planeGeometry args={[0.02, 4]} />
          <meshStandardMaterial color="#b0a898" />
        </mesh>
      ))}
      {/* Wall top rail */}
      <mesh position={[0, 2.5, -2.79]}>
        <boxGeometry args={[20, 0.08, 0.05]} />
        <meshStandardMaterial color="#99907d" metalness={0.3} />
      </mesh>
      {/* Wall baseboard */}
      <mesh position={[0, -1.2, -2.79]}>
        <boxGeometry args={[20, 0.2, 0.05]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Side walls (partial) */}
      {[-9.5, 9.5].map((x) => (
        <mesh key={x} position={[x, 0.5, 1]}>
          <boxGeometry args={[0.1, 4, 7.6]} />
          <meshStandardMaterial color="#b8b0a0" roughness={0.9} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[20, 0.04, 8]} />
        <meshStandardMaterial color="#707070" />
      </mesh>

      {/* Ceiling support beams */}
      {[-6, 0, 6].map((x) => (
        <mesh key={x} position={[x, 3.1, 0]}>
          <boxGeometry args={[0.08, 0.15, 7.5]} />
          <meshStandardMaterial color="#808080" metalness={0.4} />
        </mesh>
      ))}
      {/* Support columns */}
      {[-6, 6].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.5, -2]}>
            <boxGeometry args={[0.15, 4, 0.15]} />
            <meshStandardMaterial color="#999" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[x, 0.5, 2]}>
            <boxGeometry args={[0.15, 4, 0.15]} />
            <meshStandardMaterial color="#999" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Fluorescent light fixtures */}
      {[-4, 0, 4].map((x) => (
        <group key={x}>
          <mesh position={[x, 3, -1]}>
            <boxGeometry args={[1.2, 0.04, 0.15]} />
            <meshStandardMaterial color="#ddd" emissive="#ffffee" emissiveIntensity={0.3} />
          </mesh>
          <pointLight position={[x, 2.8, -1]} intensity={1.5} color="#fff8e0" distance={8} />
          <mesh position={[x, 2.98, -1]}>
            <boxGeometry args={[1.3, 0.08, 0.2]} />
            <meshStandardMaterial color="#aaa" metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Additional warm ambient from ceiling */}
      <hemisphereLight args={['#b0c4de', '#8a7a6a', 0.6]} />

      {/* Factory sign */}
      <FactorySign />

      {/* Conveyor belts */}
      {renderBelt(naiveSnapshot, 'Naive', -0.4, 240)}
      {renderBelt(optimizedSnapshot, 'Opt', 1.2, 140)}

      {/* Platform/divider between belts */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[16, 0.04, 2.5]} />
        <meshStandardMaterial color="#4a4a5a" />
      </mesh>

      {/* Workers */}
      <Worker position={[-7.5, -0.4, 0.8]} armAngle={0.3} />
      <Worker position={[-7.5, 1.2, 0.8]} armAngle={0.3} />

      {/* Control consoles */}
      <ControlConsole position={[-7.5, -0.2, -1]} color="#4fc3f7" />
      <ControlConsole position={[-7.5, 1.4, -1]} color="#81c784" />

      {/* Shelving units in background */}
      {[-5, 0, 5].map((x) => (
        <group key={x}>
          <mesh position={[x, 0, -2.5]}>
            <boxGeometry args={[1.2, 2.8, 0.3]} />
            <meshStandardMaterial color="#8a8070" roughness={0.8} />
          </mesh>
          {[-1, 0, 1].map((y) => (
            <mesh key={y} position={[x, y * 0.7, -2.5]}>
              <boxGeometry args={[1.1, 0.02, 0.25]} />
              <meshStandardMaterial color="#9a9080" metalness={0.2} />
            </mesh>
          ))}
          {/* Small items on shelves */}
          <mesh position={[x - 0.3, -0.3, -2.5]}>
            <boxGeometry args={[0.15, 0.1, 0.15]} />
            <meshStandardMaterial color="#e8c820" />
          </mesh>
          <mesh position={[x + 0.3, 0.4, -2.5]}>
            <boxGeometry args={[0.1, 0.2, 0.1]} />
            <meshStandardMaterial color="#4fc3f7" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function detectArray(snapshot: TraceSnapshot): boolean {
  const value = snapshot.data?.['array'];
  return Array.isArray(value) && value.length > 0 && value.every((v: unknown) => typeof v === 'number');
}

export const sortingFactoryDef = {
  id: 'sorting-factory',
  kind: 'engineering' as const,
  name: '分拣工厂',
  detect: detectArray,
  priority: 10,
  component: SortingFactoryScene,
};
