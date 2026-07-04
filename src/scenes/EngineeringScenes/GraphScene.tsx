/* eslint-disable prefer-const */
import { Text } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { detectData } from '../DataDetector';
import { algorithmId } from '../algorithm-context';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

/* ======= CAMERA & ATMOSPHERE ======= */

function CameraSetup() {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);
  useEffect(() => {
    // Across the road, looking diagonally into the station entrance
    camera.position.set(-0.5, 2.8, 2.5);
    camera.lookAt(2.75, 0.6, -1.5);
    if (controls) {
      (controls as any).target.set(2.75, 0.6, -1.5);
      (controls as any).update();
    }
  }, [camera, controls]);
  return null;
}

function Atmosphere() {
  return (
    <group>
      <color attach="background" args={['#14142a']} />
      <fog attach="fog" args={['#14142a', 25, 60]} />
      <ambientLight intensity={0.45} color="#cfd5e8" />
      <hemisphereLight args={['#88aaff', '#3a2a1a', 0.3]} />
      <directionalLight position={[6, 10, 2]} intensity={0.5} color="#fff4e6" castShadow />
    </group>
  );
}

/* ======= INDOOR: DELIVERY STATION (a storefront on the right sidewalk) ======= */

function StationFloor() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 300; i++) {
      const g = 55 + Math.floor(Math.random() * 35);
      ctx.fillStyle = `rgb(${g + 5}, ${g}, ${g - 3})`;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 3, 3);
    }
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.moveTo(i * 20, 0); ctx.lineTo(i * 20, 128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * 20); ctx.lineTo(128, i * 20); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.75, 0, -1.25]} receiveShadow>
        <planeGeometry args={[3.5, 3.5]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <mesh position={[2.75, 0.04, 0.5]}><boxGeometry args={[3.5, 0.08, 0.12]} /><meshStandardMaterial color="#555" roughness={0.8} /></mesh>
      {/* Baseboard */}
      <mesh position={[1, 0.1, -0.75]}><boxGeometry args={[0.04, 0.2, 3.5]} /><meshStandardMaterial color="#6a5a4a" roughness={0.7} /></mesh>
      <mesh position={[4.5, 0.1, -0.75]}><boxGeometry args={[0.04, 0.2, 3.5]} /><meshStandardMaterial color="#6a5a4a" roughness={0.7} /></mesh>
    </group>
  );
}

function StationWalls() {
  const wallTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#e8ddd0';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 180; i++) {
      const g = 200 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${g + 20}, ${g}, ${g - 5})`;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 4, 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 });
  }, []);
  return (
    <group>
      {/* Back wall (z=-3) */}
      <mesh position={[2.75, 1.75, -3]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 3.5, 0.15]} />
        <primitive object={wallTex} attach="material" />
      </mesh>
      {/* Front wall (z=0.5) — was open, now closed so entrance faces road */}
      <mesh position={[2.75, 1.75, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 3.5, 0.15]} />
        <primitive object={wallTex} attach="material" />
      </mesh>
      {/* Right wall (x=4.5) */}
      <mesh position={[4.5, 1.75, -1.25]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 3.5, 3.5]} />
        <primitive object={wallTex} attach="material" />
      </mesh>
      {/* Storefront pillars framing the entrance (x=1, facing road) */}
      <mesh position={[1, 1.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.0, 0.2]} />
        <primitive object={wallTex} attach="material" />
      </mesh>
      <mesh position={[1, 1.5, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 3.0, 0.2]} />
        <primitive object={wallTex} attach="material" />
      </mesh>
      {/* Lintel above the storefront entrance */}
      <mesh position={[1, 3.3, -1.25]} castShadow>
        <boxGeometry args={[0.3, 0.4, 3.5]} />
        <meshStandardMaterial color="#7a6b5a" roughness={0.6} />
      </mesh>
      {/* Station sign facing the road */}
      <mesh position={[0.98, 3.0, -1.25]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 0.5]} />
        <meshBasicMaterial color="#0f0f20" transparent opacity={0.92} />
      </mesh>
      <Text position={[0.96, 3.0, -1.25]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.32} color="#ffd700" anchorX="center" outlineWidth={0.015} outlineColor="#000" letterSpacing={0.08}>速达物流</Text>
      <pointLight position={[0.7, 3.0, -1.25]} intensity={0.4} color="#ffd700" distance={2.5} />
    </group>
  );
}

function StationCeiling() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[2.75, 3.5, -1.25]}>
        <planeGeometry args={[3.5, 3.5]} />
        <meshStandardMaterial color="#f0ece6" roughness={0.7} />
      </mesh>
      {[1.8, 3.7].map(x => (
        <group key={x}>
          <mesh position={[x, 3.45, -1.2]}>
            <boxGeometry args={[0.7, 0.05, 0.2]} />
            <meshStandardMaterial color="#444" roughness={0.5} />
          </mesh>
          <mesh position={[x, 3.44, -1.2]}>
            <planeGeometry args={[0.55, 0.12]} />
            <meshBasicMaterial color="#fff9e6" />
          </mesh>
          <pointLight position={[x, 3.2, -1.2]} intensity={0.6} color="#fff5d8" distance={5} />
        </group>
      ))}
    </group>
  );
}

function StationShelf() {
  return (
    <group position={[1.5, 0, -2.9]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.04, 2.4, 0.8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.7} />
      </mesh>
      {[0.3, 1.0, 1.8].map(y => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.3, 0.03, 0.8]} />
          <meshStandardMaterial color="#a0896a" roughness={0.6} />
        </mesh>
      ))}
      {[0.3, 1.0, 1.8].map(sy =>
        ([[-0.08, '#d4a574', 0.06], [0.08, '#b5c4b1', 0.1]] as const).map(([ox, col, w], pi) => (
          <mesh key={`${sy}-${pi}`} position={[ox, sy + 0.16, 0]} castShadow>
            <boxGeometry args={[w, 0.05 + pi * 0.02, 0.08 + pi * 0.02]} />
            <meshStandardMaterial color={col} roughness={0.6} />
          </mesh>
        ))
      )}
    </group>
  );
}

function StationShelfRight() {
  return (
    <group position={[4.45, 0, -2.2]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.04, 2.4, 0.8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.7} />
      </mesh>
      {[0.3, 1.0, 1.8].map(y => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.3, 0.03, 0.8]} />
          <meshStandardMaterial color="#a0896a" roughness={0.6} />
        </mesh>
      ))}
      {[0.3, 1.0, 1.8].map(sy =>
        ([[-0.08, '#b5c4b1', 0.08], [0.08, '#d4a574', 0.06]] as const).map(([ox, col, w], pi) => (
          <mesh key={`${sy}-${pi}`} position={[ox, sy + 0.16, 0]} castShadow>
            <boxGeometry args={[w, 0.05 + pi * 0.02, 0.08 + pi * 0.02]} />
            <meshStandardMaterial color={col} roughness={0.6} />
          </mesh>
        ))
      )}
    </group>
  );
}

function LegendBoard() {
  return (
    <group position={[1.5, 1.5, -2.85]}>
      <mesh>
        <boxGeometry args={[0.04, 1.2, 0.8]} />
        <meshStandardMaterial color="#c4a882" roughness={0.8} />
      </mesh>
      <Text position={[0.003, 0.4, 0]} fontSize={0.08} color="#333" fontWeight="bold" anchorX="left">图例</Text>
      <mesh position={[0.03, 0.22, 0]}><circleGeometry args={[0.035, 8]} /><meshBasicMaterial color="#4fc3f7" /></mesh>
      <Text position={[0.08, 0.22, 0]} fontSize={0.05} color="#555" anchorX="left">配送站点</Text>
      <Text position={[0.03, 0.06, 0]} fontSize={0.06} color="#556" anchorX="left">━━ 配送路径</Text>
      <Text position={[0.03, -0.1, 0]} fontSize={0.06} color="#ffd700" anchorX="left">★ 当前访问</Text>
      <Text position={[0.03, -0.26, 0]} fontSize={0.06} color="#f472b6" anchorX="left">↓ 松弛操作</Text>
      {[[-0.15, 0.45], [0.15, 0.45]].map(([px, py]) => (
        <mesh key={`${px}${py}`} position={[px, py, 0.003]}>
          <sphereGeometry args={[0.015, 6]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
      ))}
    </group>
  );
}

function NoticeBoard() {
  return (
    <group position={[4.45, 1.5, -0.5]}>
      <mesh>
        <boxGeometry args={[0.04, 1.2, 0.8]} />
        <meshStandardMaterial color="#c9b99a" roughness={0.7} />
      </mesh>
      {[[0, 0.25, 0.18, 0.2], [0, -0.1, 0.2, 0.18]].map(([ny, nx, w, h], i) => (
        <mesh key={i} position={[0.003, ny, nx]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.85} />
        </mesh>
      ))}
      <Text position={[0.004, 0.25, 0.26]} fontSize={0.045} color="#333" anchorX="center">配送单 #2048</Text>
      <Text position={[0.004, -0.1, 0.3]} fontSize={0.035} color="#666" anchorX="center">24h 派送</Text>
    </group>
  );
}

function CenterTable() {
  return (
    <group>
      {[[-1.0, -2.3], [1.0, -2.3], [-1.0, -0.7], [1.0, -0.7]].map(([tx, tz], i) => (
        <mesh key={i} position={[2.75 + tx, 0.3, tz]}>
          <cylinderGeometry args={[0.035, 0.045, 0.6, 6]} />
          <meshStandardMaterial color="#6b4c3b" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[2.75, 0.6, -1.5]} receiveShadow>
        <boxGeometry args={[2.5, 0.05, 2.0]} />
        <meshStandardMaterial color="#8b6c4b" roughness={0.5} />
      </mesh>
      <mesh position={[2.75, 0.62, -1.5]}>
        <planeGeometry args={[2.2, 1.6]} />
        <meshBasicMaterial color="#f5f0e0" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/* ======= OUTDOOR: STREET (to the left of the delivery station) ======= */

function Street() {
  const roadLen = 50;
  const roadZ = 15;
  return (
    <group>
      {/* Road surface — extends far in both z directions */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0.005, roadZ]} receiveShadow>
        <planeGeometry args={[4, roadLen]} />
        <meshStandardMaterial color="#16161c" roughness={0.95} />
      </mesh>
      {/* Yellow dashed center line — full length */}
      {Array.from({ length: Math.floor(roadLen / 3) + 2 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0.012, roadZ - roadLen / 2 + 2 + i * 3]}>
          <planeGeometry args={[0.1, 1]} />
          <meshBasicMaterial color="#ffd700" />
        </mesh>
      ))}
      {/* Right-side curb */}
      <mesh position={[1, 0.12, roadZ]}><boxGeometry args={[0.1, 0.2, roadLen]} /><meshStandardMaterial color="#888" roughness={0.7} /></mesh>
      {/* Right sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, 0.05, roadZ]} receiveShadow>
        <planeGeometry args={[1, roadLen]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.85} />
      </mesh>
      {/* Left curb */}
      <mesh position={[-3, 0.12, roadZ]}><boxGeometry args={[0.1, 0.2, roadLen]} /><meshStandardMaterial color="#888" roughness={0.7} /></mesh>
      {/* Left sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.5, 0.05, roadZ]} receiveShadow>
        <planeGeometry args={[1, roadLen]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.85} />
      </mesh>
      {/* Distant ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0, roadZ + 8]}>
        <planeGeometry args={[80, roadLen]} />
        <meshStandardMaterial color="#0f0f1a" roughness={1} />
      </mesh>
    </group>
  );
}

/* ======= OUTDOOR: BUILDINGS ACROSS THE STREET (left side) ======= */

function Building({ position, height, width, depth, color, signText, signColor, windowsLit = 0.5 }: {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  signText?: string;
  signColor?: string;
  windowsLit?: number;
}) {
  const winRows = Math.floor(height * 1.4);
  const winCols = Math.floor(width * 1.6);
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {Array.from({ length: winRows }, (_, r) =>
        Array.from({ length: winCols }, (_, c) => (
          <mesh
            key={`fw-${r}-${c}`}
            position={[
              -width / 2 + 0.3 + c * (width - 0.6) / Math.max(1, winCols - 1),
              0.5 + r * (height - 1) / Math.max(1, winRows - 1),
              depth / 2 + 0.005,
            ]}
          >
            <planeGeometry args={[Math.max(0.01, (width - 0.6) / Math.max(1, winCols - 1) * 0.6), Math.max(0.01, (height - 1) / Math.max(1, winRows - 1) * 0.5)]} />
            <meshBasicMaterial color={Math.random() < windowsLit ? '#ffe87c' : '#1a1a28'} />
          </mesh>
        ))
      )}
      {signText && signColor && (
        <>
          <mesh position={[0, height - 0.4, depth / 2 + 0.02]}>
            <planeGeometry args={[width * 0.7, 0.5]} />
            <meshBasicMaterial color={signColor} />
          </mesh>
          <Text
            position={[0, height - 0.4, depth / 2 + 0.04]}
            fontSize={0.22}
            color="#fff"
            anchorX="center"
            anchorY="middle"
            maxWidth={width * 0.6}
          >
            {signText}
          </Text>
          <pointLight position={[0, height - 0.4, depth / 2 + 0.5]} intensity={0.4} color={signColor} distance={3} />
        </>
      )}
      <mesh position={[width * 0.25, height + 0.1, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.25]} />
        <meshStandardMaterial color="#666" roughness={0.6} />
      </mesh>
    </group>
  );
}

function AcrossStreetBuildings() {
  return (
    <group>
      {/* Buildings across the street (left side) — full block */}
      <Building position={[-5, 0, -3]} height={5} width={3} depth={2.5} color="#4a4a5a" />
      <Building position={[-5, 0, 5]} height={6} width={3} depth={2.5} color="#5a4a3a" signText="老王面馆" signColor="#ff6b35" />
      <Building position={[-5, 0, 13]} height={8} width={3} depth={2.5} color="#4a4a5a" signText="星空咖啡" signColor="#4a9eff" windowsLit={0.7} />
      <Building position={[-5, 0, 21]} height={5.5} width={3} depth={2.5} color="#6a5a4a" signText="便利店" signColor="#3aff7a" />
      <Building position={[-5, 0, 29]} height={7} width={3} depth={2.5} color="#5a5a4a" signText="网鱼网咖" signColor="#ff4499" windowsLit={0.8} />
      <Building position={[-5, 0, 37]} height={6} width={3} depth={2.5} color="#4a4a3a" />
      {/* Distant silhouette buildings across the street */}
      {[[-9, 12, 35], [-10, 10, 30], [-8, 14, 40], [-9, 11, 25],
        [12, 15, 35], [14, 12, 30], [13, 16, 40], [11, 13, 25],
        [-9, 9, 20], [13, 11, 20]].map(([x, h, z], i) => (
        <mesh key={`bg-${i}`} position={[x, h / 2, z]}>
          <boxGeometry args={[3, h, 2.5]} />
          <meshStandardMaterial color={`hsl(230, 15%, ${18 + (i % 4) * 5}%)`} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* ======= OUTDOOR: STREET LAMPS ======= */

function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.04, 0.06, 3, 6]} /><meshStandardMaterial color="#444" /></mesh>
      <mesh position={[0, 3.0, 0]}><boxGeometry args={[0.4, 0.04, 0.04]} /><meshStandardMaterial color="#444" /></mesh>
      <mesh position={[0.2, 2.95, 0]}><sphereGeometry args={[0.08, 8]} /><meshStandardMaterial color="#ffe082" emissive="#ffe082" emissiveIntensity={0.7} /></mesh>
      <pointLight position={[0.2, 2.95, 0]} intensity={0.6} color="#ffe082" distance={4.5} />
    </group>
  );
}

function StreetLamps() {
  const positions: [number, number, number][] = [];
  for (let z = -5; z <= 38; z += 6) { positions.push([-1.8, 0, z]); positions.push([0.3, 0, z]); }
  return <group>{positions.map((p, i) => <StreetLamp key={i} position={p} />)}</group>;
}

/* ======= OUTDOOR: PEDESTRIANS ======= */

function Person({ startX, startZ, dir, speed, bodyColor, hatColor }: {
  startX: number; startZ: number; dir: 'x' | 'z'; speed: number; bodyColor: string; hatColor: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    if (dir === 'x') {
      ref.current.position.x = startX + Math.sin(t * speed + phase) * 5;
      ref.current.position.z = startZ;
      ref.current.rotation.y = Math.cos(t * speed + phase) > 0 ? 0 : Math.PI;
    } else {
      ref.current.position.z = startZ + Math.sin(t * speed + phase) * 5;
      ref.current.position.x = startX;
      ref.current.rotation.y = Math.sin(t * speed + phase) > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    ref.current.position.y = Math.abs(Math.sin(t * speed * 2 + phase)) * 0.03;
  });
  return (
    <group ref={ref} position={[startX, 0, startZ]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.25, 0.5, 0.18]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 8]} />
        <meshStandardMaterial color={hatColor} roughness={0.6} />
      </mesh>
      <mesh position={[-0.06, 0.16, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.08]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      <mesh position={[0.06, 0.16, 0]}>
        <boxGeometry args={[0.06, 0.3, 0.08]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
    </group>
  );
}

function People() {
  const configs = useMemo(() => [
    { startX: -3.5, startZ: 6, dir: 'z' as const, speed: 0.4, bodyColor: '#d44', hatColor: '#222' },
    { startX: -3.5, startZ: 16, dir: 'z' as const, speed: 0.35, bodyColor: '#48c', hatColor: '#fff' },
    { startX: -3.5, startZ: 28, dir: 'z' as const, speed: 0.42, bodyColor: '#688', hatColor: '#222' },
    { startX: 1.5, startZ: 10, dir: 'z' as const, speed: 0.45, bodyColor: '#c84', hatColor: '#333' },
    { startX: 1.5, startZ: 20, dir: 'z' as const, speed: 0.38, bodyColor: '#84c', hatColor: '#fff' },
    { startX: 1.5, startZ: 34, dir: 'z' as const, speed: 0.4, bodyColor: '#a68', hatColor: '#333' },
  ], []);
  return <group>{configs.map((c, i) => <Person key={i} {...c} />)}</group>;
}

/* ======= OUTDOOR: CARS ======= */

function Car({ lane, startZ, speed, color, dir }: { lane: number; startZ: number; speed: number; color: string; dir: 1 | -1 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const z = ((t * speed * dir + startZ) % 50) - 5;
    ref.current.position.z = z;
    ref.current.position.x = lane;
    ref.current.rotation.y = dir > 0 ? 0 : Math.PI;
  });
  return (
    <group ref={ref} position={[lane, 0, startZ]}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.7, 0.45, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.63, -0.05]} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.63, 0.32]}>
        <planeGeometry args={[0.55, 0.25]} />
        <meshBasicMaterial color="#aaccee" transparent opacity={0.7} />
      </mesh>
      {[[-0.35, 0.12, 0.45], [0.35, 0.12, 0.45], [-0.35, 0.12, -0.45], [0.35, 0.12, -0.45]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 10]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      <mesh position={[-0.2, 0.32, dir > 0 ? 0.7 : -0.7]}>
        <sphereGeometry args={[0.05, 6]} />
        <meshBasicMaterial color="#fffacc" />
      </mesh>
      <mesh position={[0.2, 0.32, dir > 0 ? 0.7 : -0.7]}>
        <sphereGeometry args={[0.05, 6]} />
        <meshBasicMaterial color={dir > 0 ? '#fffacc' : '#ff3333'} />
      </mesh>
    </group>
  );
}

function Cars() {
  const R = 45;
  return (
    <group>
      <Car lane={0} startZ={-5} speed={2.5} color="#e63946" dir={1} />
      <Car lane={0} startZ={10} speed={2.0} color="#457b9d" dir={1} />
      <Car lane={0} startZ={25} speed={3.0} color="#f4a261" dir={1} />
      <Car lane={-2} startZ={5} speed={2.3} color="#264653" dir={-1} />
      <Car lane={-2} startZ={20} speed={2.7} color="#2a9d8f" dir={-1} />
      <Car lane={-2} startZ={35} speed={2.1} color="#e76f51" dir={-1} />
    </group>
  );
}

/* ======= ALGORITHM VISUALIZATION (on the table) ======= */

function RoadEdge({ from, to, active }: { from: [number, number]; to: [number, number]; active?: boolean }) {
  const mid: [number, number, number] = [(from[0] + to[0]) / 2, 0.63, (from[1] + to[1]) / 2];
  const dx = to[0] - from[0]; const dz = to[1] - from[1];
  const len = Math.max(0.01, Math.sqrt(dx * dx + dz * dz));
  const angle = Math.atan2(dx, dz);
  return (
    <group position={mid} rotation={[0, -angle, 0]}>
      <mesh>
        <planeGeometry args={[0.08, len]} />
        <meshBasicMaterial color={active ? '#4fc3f7' : '#445'} transparent opacity={active ? 0.9 : 0.4} />
      </mesh>
      {active && <mesh position={[0, 0.001, 0]}>
        <planeGeometry args={[0.03, len]} />
        <meshBasicMaterial color="#fff" transparent opacity={0.5} />
      </mesh>}
    </group>
  );
}

function AlgoNode({ pos, label, active, hue }: { pos: [number, number]; label: string; active?: boolean; hue?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current && active) {
      const s = 1 + Math.sin(clock.elapsedTime * 4) * 0.15;
      meshRef.current.scale.setScalar(s);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });
  return (
    <group position={[pos[0], 0.7, pos[1]]}>
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial color={active ? `hsl(${hue || 200}, 80%, 60%)` : '#223'} transparent opacity={active ? 0.3 : 0.1} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial
          color={active ? `hsl(${hue || 200}, 80%, 55%)` : '#556'}
          emissive={active ? `hsl(${hue || 200}, 80%, 50%)` : '#112'}
          emissiveIntensity={active ? 0.9 : 0.05}
          roughness={0.3}
          metalness={active ? 0.6 : 0.2}
        />
      </mesh>
      <Text position={[0, 0.2, 0]} fontSize={0.07} color={active ? '#fff' : '#889'} outlineWidth={0.004} outlineColor="#000">{label}</Text>
      {active && <pointLight intensity={0.6} color={`hsl(${hue || 200}, 80%, 50%)`} distance={1.5} />}
    </group>
  );
}

function renderAlgoSide(snapshot: TraceSnapshot | null, xOff: number, label: string, hue: number) {
  if (!snapshot) return null;
  const d = snapshot.data;
  const g = (d?.graph ?? d) as { nodes?: { id: number; label?: string }[]; edges?: { from: number; to: number; weight?: number }[] } | undefined;
  const highlights = snapshot.highlights ?? [];
  const nodes = g?.nodes ?? [];
  const edges = g?.edges ?? [];
  if (nodes.length === 0) return null;

  const layout = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: Math.cos(angle) * 0.5 + 2.75 + xOff, z: Math.sin(angle) * 0.5 - 1.5 };
  });
  const isPrim = algorithmId === 'prim';

  return (
    <group>
      <pointLight position={[2.75 + xOff, 1.5, -1.5]} intensity={0.3} color={`hsl(${hue}, 70%, 50%)`} distance={2.5} />
      {edges.map((e, i) => {
        const from = layout.find(n => n.id === e.from);
        const to = layout.find(n => n.id === e.to);
        if (!from || !to) return null;
        const act = highlights.includes(e.from) || highlights.includes(e.to);
        return <RoadEdge key={i} from={[from.x, from.z]} to={[to.x, to.z]} active={act} />;
      })}
      {layout.map(n => (
        <AlgoNode key={n.id} pos={[n.x, n.z]} label={n.label || String(n.id)} active={highlights.includes(n.id)} hue={hue} />
      ))}
      <Text position={[2.75 + xOff, 0.25, -0.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.12} color={isPrim ? '#66bb6a' : '#4fc3f7'}>
        {isPrim ? '📡 通信网络' : '📦 配送路线'} · {label}
      </Text>
    </group>
  );
}

/* ======= MAIN SCENE ======= */

export default function GraphScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group>
      <CameraSetup />
      <Atmosphere />
      {/* Delivery station (storefront on the right) */}
      <StationFloor />
      <StationWalls />
      <StationCeiling />
      <StationShelf />
      <StationShelfRight />
      <LegendBoard />
      <NoticeBoard />
      <CenterTable />
      {/* Street (to the left of the station) */}
      <Street />
      <AcrossStreetBuildings />
      <StreetLamps />
      <People />
      <Cars />
      {/* Algorithm on the table */}
      {renderAlgoSide(naiveSnapshot, -0.55, '朴素', 30)}
      {renderAlgoSide(optimizedSnapshot, 0.55, '优化', 200)}
    </group>
  );
}

export function detectMoreGraph(s: TraceSnapshot): boolean {
  if (algorithmId !== 'dijkstra' && algorithmId !== 'prim' && algorithmId !== 'union-find') return false;
  if (algorithmId === 'union-find') return true;
  const d = detectData(s.data);
  return d?.kind === 'graph';
}

export const graphSceneDef = {
  id: 'graph-engineering',
  kind: 'engineering' as const,
  name: '街边配送站',
  detect: detectMoreGraph,
  priority: 100,
  component: GraphScene,
};

// Exports for CityScene integration
export { StationFloor, StationWalls, StationCeiling, StationShelf, StationShelfRight, LegendBoard, NoticeBoard, CenterTable, renderAlgoSide, CameraSetup as GraphCamera };
