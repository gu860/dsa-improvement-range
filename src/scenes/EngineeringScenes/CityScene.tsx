/* eslint-disable prefer-const */
import { Text, useGLTF, Html, Billboard } from '@react-three/drei';
import { useRef, useMemo, useEffect, memo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { algorithmId } from '../algorithm-context';
import type { SceneProps } from '../types';
import type { TraceSnapshot } from '../../core/types';
import { usePlaybackStore } from '../../core/playback-store';
import { allTemplates } from '../../templates';
import {
  StationFloor, StationWalls, StationCeiling,
  StationShelf, StationShelfRight,
  LegendBoard, NoticeBoard, CenterTable,
  renderAlgoSide,
} from './GraphScene';

/* ======= DISTRICT DEFINITIONS ======= */

interface DistrictDef {
  label: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

const DISTRICTS: Record<string, DistrictDef> = {
  overview: {
    label: '鍩庡競鎬昏',
    cameraPos: [0, 55, 60],
    cameraTarget: [0, 0, -4],
  },
  dijkstra: {
    label: 'Dijkstra 调度现场入口',
    cameraPos: [30, 7, 12],
    cameraTarget: [30, 0.5, 18],
  },
  prim: {
    label: 'Prim 城市微电网',
    cameraPos: [0, 12, 42],
    cameraTarget: [0, 0.6, 26],
  },
  'union-find': {
    label: '并查集 社区合并',
    cameraPos: [52, 8, 10],
    cameraTarget: [52, 0.8, -6],
  },
  'bfs-vs-dfs': {
    label: '城市追捕指挥区',
    cameraPos: [35, 15.5, 58],
    cameraTarget: [35, 0.9, 42],
  },
  'py-bfs-vs-dfs': {
    label: '城市追捕指挥区',
    cameraPos: [35, 15.5, 58],
    cameraTarget: [35, 0.9, 42],
  },
  'bubble-vs-quick': {
    label: '邮件分拣中心',
    cameraPos: [-32, 12, -8],
    cameraTarget: [-32, 0.5, -18],
  },
  'py-bubble-vs-quick': {
    label: '邮件分拣中心',
    cameraPos: [-32, 12, -8],
    cameraTarget: [-32, 0.5, -18],
  },
  'selection-sort': {
    label: '邮件分拣中心',
    cameraPos: [-32, 12, -8],
    cameraTarget: [-32, 0.5, -18],
  },
  'insertion-sort': {
    label: '邮件分拣中心',
    cameraPos: [-32, 12, -8],
    cameraTarget: [-32, 0.5, -18],
  },
  'merge-sort': {
    label: '邮件分拣中心',
    cameraPos: [-32, 12, -8],
    cameraTarget: [-32, 0.5, -18],
  },
  'non-compare-sort': {
    label: '邮件分拣中心',
    cameraPos: [-32, 12, -8],
    cameraTarget: [-32, 0.5, -18],
  },
  'linear-binary': {
    label: '档案检索馆',
    cameraPos: [0, 6, -22],
    cameraTarget: [0, 1.8, -38],
  },
  'two-sum': {
    label: '档案检索馆',
    cameraPos: [0, 6, -22],
    cameraTarget: [0, 1.8, -38],
  },
  'rotated-array': {
    label: '档案检索馆',
    cameraPos: [0, 6, -22],
    cameraTarget: [0, 1.8, -38],
  },
  'peak': {
    label: '档案检索馆',
    cameraPos: [0, 6, -22],
    cameraTarget: [0, 1.8, -38],
  },
  'knapsack-vs-opt': {
    label: 'DP 城市运营决策区',
    cameraPos: [0, 6.8, 39],
    cameraTarget: [0, 0.65, 26],
  },
  'py-knapsack-vs-opt': {
    label: 'DP 城市运营决策区',
    cameraPos: [0, 6.8, 39],
    cameraTarget: [0, 0.65, 26],
  },
  'lcs': {
    label: 'DP 城市运营决策区',
    cameraPos: [0, 6.8, 39],
    cameraTarget: [0, 0.65, 26],
  },
  'coin-change': {
    label: 'DP 城市运营决策区',
    cameraPos: [0, 6.8, 39],
    cameraTarget: [0, 0.65, 26],
  },
  'edit-distance': {
    label: 'DP 城市运营决策区',
    cameraPos: [0, 6.8, 39],
    cameraTarget: [0, 0.65, 26],
  },
  'unique-paths': {
    label: 'DP 城市运营决策区',
    cameraPos: [0, 6.8, 39],
    cameraTarget: [0, 0.65, 26],
  },
  'house-robber': {
    label: 'DP 城市运营决策区',
    cameraPos: [0, 6.8, 39],
    cameraTarget: [0, 0.65, 26],
  },
  'string-search': {
    label: '广告招牌制作工坊',
    cameraPos: [58, 5.5, -20],
    cameraTarget: [58, 0.8, -30],
  },
  'longest-palindrome': {
    label: '广告招牌制作工坊',
    cameraPos: [58, 5.5, -20],
    cameraTarget: [58, 0.8, -30],
  },
  'anagram': {
    label: '广告招牌制作工坊',
    cameraPos: [58, 5.5, -20],
    cameraTarget: [58, 0.8, -30],
  },
  'longest-substring': {
    label: '广告招牌制作工坊',
    cameraPos: [58, 5.5, -20],
    cameraTarget: [58, 0.8, -30],
  },
  'tree-bfs-vs-dfs': {
    label: '树算法 山地林业监测站',
    cameraPos: [-48, 9.35, 49],
    cameraTarget: [-48, 2.45, 62],
  },
  'py-tree-bfs-vs-dfs': {
    label: '树算法 山地林业监测站',
    cameraPos: [-48, 9.35, 49],
    cameraTarget: [-48, 2.45, 62],
  },
  'tree-height': {
    label: '树算法 山地林业监测站',
    cameraPos: [-48, 9.35, 49],
    cameraTarget: [-48, 2.45, 62],
  },
  'validate-bst': {
    label: '树算法 山地林业监测站',
    cameraPos: [-48, 9.35, 49],
    cameraTarget: [-48, 2.45, 62],
  },
  lca: {
    label: '树算法 山地林业监测站',
    cameraPos: [-48, 9.35, 49],
    cameraTarget: [-48, 2.45, 62],
  },
  traversals: {
    label: '树算法 山地林业监测站',
    cameraPos: [-48, 9.35, 49],
    cameraTarget: [-48, 2.45, 62],
  },
};

function normalizeAlgorithmId(id: string) {
  return id.replace(/^py-/, '');
}

/* ======= CAMERA CONTROLLER ======= */

function CameraController({ activeAlgorithmId }: { activeAlgorithmId: string }) {
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls);
  const targetId = (activeAlgorithmId && DISTRICTS[activeAlgorithmId]) ? activeAlgorithmId : 'overview';
  const target = DISTRICTS[targetId];

  // Handle algorithm switch
  useEffect(() => {
    const pos = new THREE.Vector3(...target.cameraPos);
    const tgt = new THREE.Vector3(...target.cameraTarget);
    camera.position.copy(pos);
    if (controls) {
      (controls as any).target.copy(tgt);
      (controls as any).update();
    }
  }, [targetId, target.cameraPos, target.cameraTarget, camera, controls]);

  // Handle manual camera preset from toolbar
  useEffect(() => {
    const handler = (e: any) => {
      const { pos, target: tgt } = e.detail;
      if (!pos || !tgt) return;
      camera.position.set(pos[0], pos[1], pos[2]);
      if (controls) {
        (controls as any).target.set(tgt[0], tgt[1], tgt[2]);
        (controls as any).update();
      }
    };
    window.addEventListener('camera-preset', handler);
    return () => window.removeEventListener('camera-preset', handler);
  }, [camera, controls]);

  return null;
}

/* ======= CITY GROUND ======= */

const GroundTexture = memo(function GroundTexture() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 300; i++) {
      const v = 22 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgb(${v},${v},${v + 4})`;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(15, 15);
    t.anisotropy = 4;
    return t;
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[130, 130]} />
      <meshStandardMaterial map={tex} roughness={1} polygonOffset polygonOffsetFactor={1} />
    </mesh>
  );
});

/* ======= STREET GRID ======= */

const HW = 55;
const MAIN_Z = 0;
const MAIN_W = 8;
const SIDE_W = 4;
const sideRoads = [-35, -20, 20, 35];
const mainCenterLineIdx = Array.from({ length: Math.floor(HW * 2 / 4) + 1 }, (_, i) => i);
const sideCenterLineIdx = Array.from({ length: 22 }, (_, i) => i);
const DOWNTOWN_PURSUIT_ROADS = {
  vertical: [27, 35, 43],
  horizontal: [26, 34, 42, 50],
  xMin: 23,
  xMax: 47,
  zMin: 22,
  zMax: 54,
};

const CITY_MATERIALS = {
  asphalt: '#20252b',
  asphaltLight: '#2f353b',
  concrete: '#5d625f',
  curb: '#8a8f88',
  sidewalk: '#6a706c',
  lane: '#e8d98a',
  laneWhite: '#e5e7eb',
  grass: '#284b35',
  plaza: '#8b7f68',
  hospitalWhite: '#f8fafc',
  hospitalRed: '#dc2626',
  glass: '#1e3a52',
};

function Parcel({ x, z, w, d, color, border = '#4b5563' }: {
  x: number;
  z: number;
  w: number;
  d: number;
  color: string;
  border?: string;
}) {
  return (
    <group position={[x, 0.002, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={color} roughness={0.94} polygonOffset polygonOffsetFactor={1} />
      </mesh>
      <mesh position={[0, 0.035, -d / 2]}>
        <boxGeometry args={[w, 0.07, 0.08]} />
        <meshStandardMaterial color={border} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.035, d / 2]}>
        <boxGeometry args={[w, 0.07, 0.08]} />
        <meshStandardMaterial color={border} roughness={0.85} />
      </mesh>
      <mesh position={[-w / 2, 0.035, 0]}>
        <boxGeometry args={[0.08, 0.07, d]} />
        <meshStandardMaterial color={border} roughness={0.85} />
      </mesh>
      <mesh position={[w / 2, 0.035, 0]}>
        <boxGeometry args={[0.08, 0.07, d]} />
        <meshStandardMaterial color={border} roughness={0.85} />
      </mesh>
    </group>
  );
}

const CityParcels = memo(function CityParcels() {
  const parcels = [
    { x: -30, z: -30, w: 18, d: 16, color: '#4a4036', border: '#75624d' },
    { x: 30, z: 18, w: 34, d: 26, color: '#303942', border: '#64748b' },
    { x: 0, z: 26, w: 32, d: 24, color: '#3f4841', border: '#8a9388' },
    { x: 52, z: -5, w: 22, d: 14, color: '#766650', border: '#9c8a6d' },
    { x: 0, z: -28, w: 24, d: 18, color: '#635b4d', border: '#8a806d' },
    { x: 30, z: -28, w: 24, d: 18, color: '#34383b', border: '#5f6468' },
    { x: -47, z: 16, w: 10, d: 32, color: '#253d32', border: '#496a56' },
    { x: 58, z: -30, w: 20, d: 16, color: '#3d3630', border: '#5a5048' },
  ];
  return (
    <group>
      {parcels.map((p, i) => <Parcel key={`parcel-${i}`} {...p} />)}
      {[-48, -36, -24, -12, 12, 24, 36, 48].map(x => (
        <mesh key={`main-parking-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.016, -7.2]}>
          <planeGeometry args={[0.08, 1.35]} />
          <meshBasicMaterial color={CITY_MATERIALS.laneWhite} transparent opacity={0.45} />
        </mesh>
      ))}
      {[-44, -28, 28, 44].map(x => (
        <mesh key={`median-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.014, 0]}>
          <planeGeometry args={[4.8, 0.28]} />
          <meshStandardMaterial color="#395a3f" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
});

const StreetGrid = memo(function StreetGrid() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, MAIN_Z]}>
        <planeGeometry args={[HW * 2, MAIN_W]} />
        <meshStandardMaterial color={CITY_MATERIALS.asphalt} roughness={0.95} polygonOffset polygonOffsetFactor={1} />
      </mesh>
      {mainCenterLineIdx.map(i => (
        <mesh key={`mc-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-HW + 2 + i * 4, 0.008, MAIN_Z]}>
          <planeGeometry args={[2, 0.08]} />
          <meshBasicMaterial color={CITY_MATERIALS.lane} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, MAIN_Z - MAIN_W / 2 - 1.5]}>
        <planeGeometry args={[HW * 2, 3]} />
        <meshStandardMaterial color={CITY_MATERIALS.sidewalk} roughness={0.85} polygonOffset polygonOffsetFactor={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, MAIN_Z + MAIN_W / 2 + 1.5]}>
        <planeGeometry args={[HW * 2, 3]} />
        <meshStandardMaterial color={CITY_MATERIALS.sidewalk} roughness={0.85} polygonOffset polygonOffsetFactor={1} />
      </mesh>
      <mesh position={[0, 0.06, MAIN_Z - MAIN_W / 2]}><boxGeometry args={[HW * 2, 0.1, 0.1]} /><meshStandardMaterial color={CITY_MATERIALS.curb} /></mesh>
      <mesh position={[0, 0.06, MAIN_Z + MAIN_W / 2]}><boxGeometry args={[HW * 2, 0.1, 0.1]} /><meshStandardMaterial color={CITY_MATERIALS.curb} /></mesh>
      {sideRoads.map((sx, si) => (
        <group key={`st-${si}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0.003, 0]}>
            <planeGeometry args={[SIDE_W, 96]} />
            <meshStandardMaterial color={CITY_MATERIALS.asphalt} roughness={0.95} polygonOffset polygonOffsetFactor={1} />
          </mesh>
            {sideCenterLineIdx.map(i => (
            <mesh key={`sc-${si}-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[sx, 0.008, -41 + i * 4]}>
              <planeGeometry args={[0.08, 1.5]} />
              <meshBasicMaterial color={CITY_MATERIALS.lane} />
            </mesh>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sx - SIDE_W / 2 - 1, 0.008, 0]}>
            <planeGeometry args={[2, 96]} />
            <meshStandardMaterial color={CITY_MATERIALS.sidewalk} roughness={0.85} polygonOffset polygonOffsetFactor={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[sx + SIDE_W / 2 + 1, 0.008, 0]}>
            <planeGeometry args={[2, 96]} />
            <meshStandardMaterial color={CITY_MATERIALS.sidewalk} roughness={0.85} polygonOffset polygonOffsetFactor={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

const DowntownDenseRoadNetwork = memo(function DowntownDenseRoadNetwork() {
  const downtownBuildings = [
    [24.7, 29.8, 2.1, 5.2, 2.7, '#35424d'], [31.0, 29.2, 2.8, 7.6, 3.0, '#263241'],
    [39.4, 29.6, 2.6, 8.8, 2.8, '#40515b'], [45.3, 30.2, 2.0, 5.9, 2.4, '#2f3d46'],
    [24.8, 37.8, 2.3, 6.8, 2.8, '#3f4854'], [31.1, 38.0, 2.5, 9.1, 2.6, '#2c3644'],
    [39.3, 37.7, 2.4, 7.9, 2.8, '#46515a'], [45.2, 38.4, 2.1, 6.4, 2.5, '#303c47'],
    [24.6, 46.2, 2.1, 5.6, 2.4, '#4a4f58'], [31.2, 46.1, 2.7, 8.4, 2.8, '#283545'],
    [39.1, 46.0, 2.4, 9.5, 2.5, '#3b4c56'], [45.0, 46.3, 2.0, 6.2, 2.4, '#34424c'],
  ] as const;
  return (
    <group>
      {DOWNTOWN_PURSUIT_ROADS.vertical.map(x => (
        <group key={`downtown-road-v-${x}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, 38]}>
            <planeGeometry args={[2.75, DOWNTOWN_PURSUIT_ROADS.zMax - DOWNTOWN_PURSUIT_ROADS.zMin]} />
            <meshStandardMaterial color="#242a30" roughness={0.95} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={`downtown-v-lane-${x}-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.024, 23.8 + i * 3.8]}>
              <planeGeometry args={[0.08, 2.6]} />
              <meshBasicMaterial color="#e8d98a" transparent opacity={0.64} />
            </mesh>
          ))}
        </group>
      ))}
      {DOWNTOWN_PURSUIT_ROADS.horizontal.map(z => (
        <group key={`downtown-road-h-${z}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35, 0.013, z]}>
            <planeGeometry args={[DOWNTOWN_PURSUIT_ROADS.xMax - DOWNTOWN_PURSUIT_ROADS.xMin, 2.65]} />
            <meshStandardMaterial color="#242a30" roughness={0.95} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={`downtown-h-lane-${z}-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[24.8 + i * 3.5, 0.025, z]}>
              <planeGeometry args={[2.5, 0.08]} />
              <meshBasicMaterial color="#e8d98a" transparent opacity={0.64} />
            </mesh>
          ))}
        </group>
      ))}
      {downtownBuildings.map(([x, z, w, h, d, color], i) => (
        <group key={`downtown-pursuit-building-${i}`} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.78} />
          </mesh>
          <mesh position={[0, h + 0.07, 0]}>
            <boxGeometry args={[w + 0.18, 0.14, d + 0.18]} />
            <meshStandardMaterial color="#1f2937" roughness={0.86} />
          </mesh>
          {[0.34, 0.64, 0.94].map((ratio, wi) => (
            <mesh key={`downtown-window-${i}-${wi}`} position={[w / 2 + 0.012, h * ratio, -d * 0.18]}>
              <boxGeometry args={[0.04, 0.32, 0.42]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.72} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
});

/* ======= CITY ENVIRONMENT ======= */

function CloudCluster({ x, y, z, scale = 1, drift = 0 }: { x: number; y: number; z: number; scale?: number; drift?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.x = x + Math.sin(clock.elapsedTime * 0.035 + drift) * 4;
    ref.current.position.z = z + Math.cos(clock.elapsedTime * 0.028 + drift) * 2;
  });
  return (
    <group ref={ref} position={[x, y, z]} scale={scale}>
      {[
        [-1.4, 0, 0, 1.15], [-0.55, 0.18, 0.05, 1.45], [0.55, 0.08, 0.02, 1.25],
        [1.35, -0.02, 0, 0.95], [-0.15, -0.08, -0.45, 1.05],
      ].map(([cx, cy, cz, s], i) => (
        <mesh key={`cloud-${i}`} position={[cx, cy, cz]} castShadow={false}>
          <sphereGeometry args={[s, 10, 8]} />
          <meshStandardMaterial color="#d8dde2" roughness={0.95} transparent opacity={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function CityAtmosphere() {
  return (
    <group>
      <color attach="background" args={['#182331']} />
      <fog attach="fog" args={['#182331', 58, 132]} />
      <ambientLight intensity={0.44} color="#c7d2fe" />
      <hemisphereLight args={['#8fb6d8', '#27211d', 0.5]} />
      <directionalLight position={[44, 42, -48]} intensity={1.15} color="#ffd7a3" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.001} />
      <directionalLight position={[-38, 34, 46]} intensity={0.28} color="#a9c7ff" />
      <mesh position={[46, 42, -54]}>
        <sphereGeometry args={[3.2, 32, 18]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      <pointLight position={[46, 42, -54]} intensity={1.3} distance={95} color="#ffd166" />
      <CloudCluster x={-28} y={26} z={-48} scale={1.7} drift={0.4} />
      <CloudCluster x={18} y={31} z={-38} scale={1.2} drift={1.8} />
      <CloudCluster x={48} y={28} z={18} scale={1.5} drift={3.4} />
      <CloudCluster x={-54} y={24} z={34} scale={1.35} drift={5.2} />
    </group>
  );
}

function CityRiver() {
  const water = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (water.current) {
      water.current.emissiveIntensity = 0.035 + Math.sin(clock.elapsedTime * 0.8) * 0.012;
    }
  });
  const riverBands = [
    { p: [-61.8, -0.055, -28] as [number, number, number], s: [5.8, 42] as [number, number], r: -0.08 },
    { p: [-60.9, -0.055, 8] as [number, number, number], s: [5.8, 42] as [number, number], r: 0.04 },
    { p: [-61.6, -0.055, 39] as [number, number, number], s: [5.9, 32] as [number, number], r: 0.08 },
  ];
  return (
    <group>
      <mesh position={[-60.7, -0.09, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9.5, 92]} />
        <meshStandardMaterial color="#16222a" roughness={0.96} />
      </mesh>
      {riverBands.map((band, i) => (
        <mesh key={`river-${i}`} rotation={[-Math.PI / 2, 0, band.r]} position={band.p} receiveShadow>
          <planeGeometry args={band.s} />
          <meshStandardMaterial ref={i === 1 ? water : undefined} color="#0f4f63" emissive="#0b5d71" emissiveIntensity={0.03} roughness={0.48} metalness={0.02} />
        </mesh>
      ))}
      {[-65.1, -55.8].map((x, side) => (
        <group key={`river-wall-${side}`}>
          <mesh position={[x, 0.12, 6]}>
            <boxGeometry args={[0.42, 0.24, 90]} />
            <meshStandardMaterial color="#6b7280" roughness={0.82} />
          </mesh>
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={`rail-${side}-${i}`} position={[x, 0.72, -39 + i * 7.2]}>
              <boxGeometry args={[0.12, 0.95, 0.12]} />
              <meshStandardMaterial color="#374151" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[x, 1.1, 6]}>
            <boxGeometry args={[0.16, 0.12, 86]} />
            <meshStandardMaterial color="#475569" roughness={0.68} />
          </mesh>
        </group>
      ))}
      {[-30, 18].map((z, i) => (
        <group key={`river-bridge-${i}`} position={[-61.5, 0.22, z]}>
          <mesh>
            <boxGeometry args={[15, 0.42, 5.4]} />
            <meshStandardMaterial color="#555d66" roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.26, -1.8]}>
            <boxGeometry args={[14, 0.12, 0.16]} />
            <meshStandardMaterial color="#a8b0b8" roughness={0.62} />
          </mesh>
          <mesh position={[0, 0.26, 1.8]}>
            <boxGeometry args={[14, 0.12, 0.16]} />
            <meshStandardMaterial color="#a8b0b8" roughness={0.62} />
          </mesh>
          {[-6, 0, 6].map(x => (
            <mesh key={`bridge-line-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.235, 0]}>
              <planeGeometry args={[3.5, 0.12]} />
              <meshBasicMaterial color="#e5e7eb" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {[-48, -12, 24, 44].map((z, i) => (
        <group key={`river-walk-${i}`} position={[-53.2, 0, z]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[2.2, 0.36, 1.1]} />
            <meshStandardMaterial color="#7c6f5c" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[1.65, 0.18, 0.72]} />
            <meshStandardMaterial color={['#4b5563', '#64748b', '#52525b', '#57534e'][i]} roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ======= REAL-WORLD ALGORITHM PROJECTION ======= */

type CityGraphNode = { id: number | string; label?: string };
type CityGraphEdge = { from: number | string; to: number | string; weight?: number };
type CityGraphData = { nodes: CityGraphNode[]; edges: CityGraphEdge[] };
type CityNodeLayout = CityGraphNode & { x: number; z: number; index: number };

const CITY_GRAPH_COORDS: [number, number][] = [
  [0, 0], [-20, -14], [20, -14], [-20, 12], [20, 12], [0, 28], [-34, 0], [34, 0], [-34, -26], [34, -26],
];

const COMMUNITY_COORDS: [number, number][] = [
  [-34, -30], [-24, -30], [-14, -30], [-4, -30], [6, -30], [16, -30], [26, -30], [36, -30],
];

const LOCAL_COMMUNITY_COORDS: [number, number][] = [
  [-7.2, -3.8], [-4.2, -1.6], [-6.0, 3.6], [-0.8, -4.4], [1.9, -1.2], [0.9, 3.4], [5.7, -3.0], [6.8, 2.6],
];

function idKey(id: number | string | undefined): string {
  return id === undefined ? '' : String(id);
}

function getGraph(snapshot: TraceSnapshot | null): CityGraphData | null {
  if (!snapshot) return null;
  const data = snapshot.data as Record<string, unknown>;
  const candidate = (data.graph ?? data) as Partial<CityGraphData> | undefined;
  if (!candidate || !Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) return null;
  return { nodes: candidate.nodes, edges: candidate.edges };
}

function getParentArray(snapshot: TraceSnapshot | null): number[] | null {
  const raw = (snapshot?.data as Record<string, unknown> | undefined)?.array;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const arr = raw.map(Number);
  return arr.every(Number.isFinite) ? arr : null;
}

function getUnionRoot(parents: number[], index: number): number {
  let current = THREE.MathUtils.clamp(index, 0, Math.max(0, parents.length - 1));
  const seen = new Set<number>();
  while (parents[current] !== current && !seen.has(current)) {
    seen.add(current);
    current = THREE.MathUtils.clamp(parents[current] ?? current, 0, Math.max(0, parents.length - 1));
  }
  return current;
}

function unionRootColor(root: number): string {
  const colors = ['#38bdf8', '#f59e0b', '#22c55e', '#c084fc', '#f472b6', '#14b8a6', '#eab308', '#fb7185'];
  return colors[Math.abs(root) % colors.length];
}

function getUnionParentRoute(parents: number[], activeNode: number, localCoords: [number, number][]): [number, number][] {
  const route: [number, number][] = [];
  let current = THREE.MathUtils.clamp(activeNode, 0, Math.max(0, parents.length - 1));
  const seen = new Set<number>();
  while (!seen.has(current)) {
    seen.add(current);
    route.push(localCoords[current % localCoords.length]);
    const parent = THREE.MathUtils.clamp(parents[current] ?? current, 0, Math.max(0, parents.length - 1));
    if (parent === current) break;
    current = parent;
  }
  return route.length > 0 ? route : [localCoords[0]];
}

function buildCityLayout(graph: CityGraphData): CityNodeLayout[] {
  return graph.nodes.map((node, index) => {
    const coord = CITY_GRAPH_COORDS[index % CITY_GRAPH_COORDS.length];
    const row = Math.floor(index / CITY_GRAPH_COORDS.length);
    return { ...node, x: coord[0], z: coord[1] + row * 6, index };
  });
}

function activePair(snapshot: TraceSnapshot | null): [string, string] | null {
  if (!snapshot) return null;
  const pointers = snapshot.pointers ?? {};
  const from = pointers.u ?? pointers.from ?? pointers.current;
  const to = pointers.to ?? pointers.v ?? pointers.next;
  if (typeof from === 'number' && typeof to === 'number') return [String(from), String(to)];
  const highlights = snapshot.highlights ?? [];
  if (highlights.length >= 2) return [String(highlights[0]), String(highlights[1])];
  return null;
}

function isEdgeActive(edge: CityGraphEdge, snapshot: TraceSnapshot | null): boolean {
  const pair = activePair(snapshot);
  if (!pair) return false;
  const a = idKey(edge.from);
  const b = idKey(edge.to);
  return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
}

function edgeWeight(edge: CityGraphEdge): string {
  return typeof edge.weight === 'number' ? String(edge.weight) : '';
}

function useSyncedSceneTime(resetKey: unknown, runWhenPaused = false, resetOnStep = true) {
  const speed = usePlaybackStore(s => s.speed);
  const isPlaying = usePlaybackStore(s => s.isPlaying);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const time = useRef(0);
  useEffect(() => { time.current = 0; }, [resetKey, resetOnStep ? currentStep : -1]);
  useFrame((_, delta) => {
    if (runWhenPaused || isPlaying) time.current += delta * speed;
  });
  return time;
}

const STEP_TRAVEL_TIME = 0.5;

function oneWayStepProgress(time: number): number {
  const t = THREE.MathUtils.clamp(time / STEP_TRAVEL_TIME, 0, 1);
  return t * t * (3 - 2 * t);
}

function CityRoadSegment({ from, to, active, color, lift = 0 }: {
  from: CityNodeLayout;
  to: CityNodeLayout;
  active: boolean;
  color: string;
  lift?: number;
}) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
  const angle = Math.atan2(dx, dz);
  const midX = (from.x + to.x) / 2;
  const midZ = (from.z + to.z) / 2;
  return (
    <group position={[midX, 0.06 + lift, midZ]} rotation={[0, angle, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[active ? 0.55 : 0.28, 0.035, len]} />
        <meshStandardMaterial
          color={active ? color : '#24303a'}
          emissive={active ? color : '#000000'}
          emissiveIntensity={active ? 0.95 : 0.02}
          roughness={0.45}
          transparent
          opacity={active ? 0.92 : 0.28}
          depthWrite={false}
        />
      </mesh>
      {active && (
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.12, 0.02, len]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.72} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function CityHub({ node, active, color, sideLabel }: {
  node: CityNodeLayout;
  active: boolean;
  color: string;
  sideLabel: string;
}) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const s = active ? 1.05 + Math.sin(clock.elapsedTime * 4) * 0.12 : 1;
    ring.current.scale.setScalar(s);
  });
  return (
    <group position={[node.x, 0, node.z]}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <torusGeometry args={[0.62, 0.035, 8, 36]} />
        <meshStandardMaterial color={active ? color : '#55606b'} emissive={active ? color : '#111827'} emissiveIntensity={active ? 0.9 : 0.08} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.38, 0.78, 8]} />
        <meshStandardMaterial color={active ? color : '#32404a'} emissive={active ? color : '#000'} emissiveIntensity={active ? 0.35 : 0} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 10]} />
        <meshStandardMaterial color={active ? '#ffffff' : '#9ca3af'} emissive={active ? color : '#111827'} emissiveIntensity={active ? 0.8 : 0.05} />
      </mesh>
      <Text position={[0, 1.45, 0]} fontSize={0.34} color={active ? '#ffffff' : '#cbd5e1'} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#05070a">
        {node.label ?? String(node.id)}
      </Text>
      {active && (
        <>
          <pointLight position={[0, 1.3, 0]} intensity={0.9} distance={5} color={color} />
          <Text position={[0, 1.9, 0]} fontSize={0.18} color={color} anchorX="center" outlineWidth={0.008} outlineColor="#05070a">
            {sideLabel}
          </Text>
        </>
      )}
    </group>
  );
}

function AlgorithmTruck({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.92]} />
        <meshStandardMaterial color={color} metalness={0.25} roughness={0.45} emissive={color} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 0.52, 0.22]} castShadow>
        <boxGeometry args={[0.45, 0.28, 0.36]} />
        <meshStandardMaterial color="#dbeafe" metalness={0.1} roughness={0.35} />
      </mesh>
      {[[-0.3, 0.14, -0.28], [0.3, 0.14, -0.28], [-0.3, 0.14, 0.3], [0.3, 0.14, 0.3]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[-0.18, 0.32, 0.48]}><sphereGeometry args={[0.045, 8, 6]} /><meshBasicMaterial color="#fff7c2" /></mesh>
      <mesh position={[0.18, 0.32, 0.48]}><sphereGeometry args={[0.045, 8, 6]} /><meshBasicMaterial color="#fff7c2" /></mesh>
    </group>
  );
}

function RouteCourier({ snapshot, layout, color, lift = 0 }: {
  snapshot: TraceSnapshot | null;
  layout: CityNodeLayout[];
  color: string;
  lift?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const sceneTime = useSyncedSceneTime(`${snapshot?.timestamp ?? ''}-${snapshot?.label ?? ''}`);
  const route = useMemo(() => {
    const pair = activePair(snapshot);
    if (!pair) return null;
    const a = layout.find(n => idKey(n.id) === pair[0]);
    const b = layout.find(n => idKey(n.id) === pair[1]);
    return a && b ? { a, b } : null;
  }, [snapshot, layout]);
  useFrame(() => {
    if (!ref.current || !route) return;
    const p = oneWayStepProgress(sceneTime.current);
    const x = THREE.MathUtils.lerp(route.a.x, route.b.x, p);
    const z = THREE.MathUtils.lerp(route.a.z, route.b.z, p);
    ref.current.position.set(x, 0.12 + lift, z);
    ref.current.rotation.y = Math.atan2(route.b.x - route.a.x, route.b.z - route.a.z);
  });

  if (!route) return null;
  return (
    <group ref={ref} position={[route.a.x, 0.12 + lift, route.a.z]}>
      <AlgorithmTruck color={color} />
      <pointLight position={[0, 0.6, 0]} intensity={0.75} distance={3} color={color} />
    </group>
  );
}

function CityGraphProjection({ snapshot, color, sideLabel, lift }: {
  snapshot: TraceSnapshot | null;
  color: string;
  sideLabel: string;
  lift: number;
}) {
  const graph = useMemo(() => getGraph(snapshot), [snapshot]);
  const layout = useMemo(() => graph ? buildCityLayout(graph) : [], [graph]);
  const byId = useMemo(() => new Map(layout.map(n => [idKey(n.id), n])), [layout]);
  const highlights = snapshot?.highlights?.map(String) ?? [];
  if (!graph || layout.length === 0) return null;
  return (
    <group>
      {graph.edges.map((edge, i) => {
        const from = byId.get(idKey(edge.from));
        const to = byId.get(idKey(edge.to));
        if (!from || !to) return null;
        const active = isEdgeActive(edge, snapshot);
        return (
          <group key={`${sideLabel}-edge-${i}`}>
            <CityRoadSegment from={from} to={to} active={active} color={color} lift={lift} />
            {active && edgeWeight(edge) && (
              <Text position={[(from.x + to.x) / 2, 0.6 + lift, (from.z + to.z) / 2]} fontSize={0.22} color="#f8fafc" anchorX="center" outlineWidth={0.01} outlineColor="#020617">
                {edgeWeight(edge)}
              </Text>
            )}
          </group>
        );
      })}
      {layout.map(node => (
        <CityHub key={`${sideLabel}-node-${idKey(node.id)}`} node={node} active={highlights.includes(idKey(node.id))} color={color} sideLabel={sideLabel} />
      ))}
      <RouteCourier snapshot={snapshot} layout={layout} color={color} lift={lift} />
    </group>
  );
}

function SkyBridge({ from, to, active, color }: {
  from: [number, number];
  to: [number, number];
  active: boolean;
  color: string;
}) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
  const angle = Math.atan2(dx, dz);
  return (
    <group position={[(from[0] + to[0]) / 2, 2.15, (from[1] + to[1]) / 2]} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[active ? 0.18 : 0.1, 0.12, len]} />
        <meshStandardMaterial color={active ? color : '#475569'} emissive={active ? color : '#000'} emissiveIntensity={active ? 0.75 : 0.04} transparent opacity={active ? 0.86 : 0.36} />
      </mesh>
    </group>
  );
}

function CommunityUnionProjection({ snapshot, color, sideLabel }: {
  snapshot: TraceSnapshot | null;
  color: string;
  sideLabel: string;
}) {
  const parents = useMemo(() => getParentArray(snapshot), [snapshot]);
  if (!parents) return null;
  const highlights = snapshot?.highlights?.map(Number) ?? [];
  return (
    <group>
      {parents.map((parent, i) => {
        const from = COMMUNITY_COORDS[i % COMMUNITY_COORDS.length];
        const to = COMMUNITY_COORDS[parent % COMMUNITY_COORDS.length];
        if (i === parent || !to) return null;
        return <SkyBridge key={`${sideLabel}-bridge-${i}`} from={from} to={to} active={highlights.includes(i) || highlights.includes(parent)} color={color} />;
      })}
      {parents.map((parent, i) => {
        const coord = COMMUNITY_COORDS[i % COMMUNITY_COORDS.length];
        const active = highlights.includes(i);
        const isRoot = parent === i;
        return (
          <group key={`${sideLabel}-community-${i}`} position={[coord[0], 0, coord[1]]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[1.4, 1 + (isRoot ? 0.45 : 0), 1.4]} />
              <meshStandardMaterial color={active ? color : isRoot ? '#6b7280' : '#334155'} emissive={active ? color : '#000'} emissiveIntensity={active ? 0.45 : 0} roughness={0.5} />
            </mesh>
            <mesh position={[0, 1.18 + (isRoot ? 0.45 : 0), 0]}>
              <boxGeometry args={[1.55, 0.08, 1.55]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.65} />
            </mesh>
            <Text position={[0, 1.75 + (isRoot ? 0.45 : 0), 0]} fontSize={0.26} color={active ? '#ffffff' : '#cbd5e1'} anchorX="center" outlineWidth={0.01} outlineColor="#020617">
              {`${i}->${parent}`}
            </Text>
            {active && <pointLight position={[0, 1.6, 0]} color={color} intensity={0.8} distance={4} />}
          </group>
        );
      })}
    </group>
  );
}

function AlgorithmStatusBillboard({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId?: string }) {
  const current = optimizedSnapshot ?? naiveSnapshot;
  const highlights = current?.highlights?.join(', ') || '-';
  const label = current?.label || 'waiting';
  return (
    <group position={[-31, 5.4, -21]} rotation={[0, Math.PI / 5, 0]}>
      <mesh>
        <boxGeometry args={[7.2, 3.2, 0.12]} />
        <meshStandardMaterial color="#08111f" emissive="#0ea5e9" emissiveIntensity={0.08} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[6.8, 2.8]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.92} />
      </mesh>
      <Text position={[0, 0.95, 0.16]} fontSize={0.34} color="#67e8f9" anchorX="center" outlineWidth={0.01} outlineColor="#020617">
        城市算法调度
      </Text>
      <Text position={[-2.95, 0.25, 0.16]} fontSize={0.22} color="#e2e8f0" anchorX="left" maxWidth={6.1}>
        算法: {activeAlgorithmId || '未选择'}
      </Text>
      <Text position={[-2.95, -0.2, 0.16]} fontSize={0.22} color="#e2e8f0" anchorX="left" maxWidth={6.1}>
        步骤: {label}
      </Text>
      <Text position={[-2.95, -0.65, 0.16]} fontSize={0.22} color="#fbbf24" anchorX="left" maxWidth={6.1}>
        高亮节点: {highlights}
      </Text>
      <pointLight position={[0, 0, 1.2]} intensity={0.45} distance={7} color="#22d3ee" />
    </group>
  );
}

const DIJKSTRA_SCENE_COORDS: [number, number][] = [
  [-7.8, 4.2], [-5.7, -0.6], [-2.1, 2.7], [1.6, -3.4], [5.5, -1.2], [7.3, 3.7],
  [-7.4, -4.5], [3.5, 5.0],
];

const PRIM_UTILITY_COORDS: [number, number][] = [
  [-7.6, 5.2], [-5.6, 0.8], [-2.9, -3.1], [0.8, 2.9], [3.6, -1.5], [7.3, 0.9],
  [-0.8, 5.9], [5.8, 4.5],
];

function buildDijkstraLayout(graph: CityGraphData): CityNodeLayout[] {
  return graph.nodes.map((node, index) => {
    const coord = DIJKSTRA_SCENE_COORDS[index % DIJKSTRA_SCENE_COORDS.length];
    const row = Math.floor(index / DIJKSTRA_SCENE_COORDS.length);
    return { ...node, x: coord[0], z: coord[1] + row * 1.4, index };
  });
}

function buildPrimLayout(graph: CityGraphData): CityNodeLayout[] {
  return graph.nodes.map((node, index) => {
    const coord = PRIM_UTILITY_COORDS[index % PRIM_UTILITY_COORDS.length];
    const row = Math.floor(index / PRIM_UTILITY_COORDS.length);
    return { ...node, x: coord[0], z: coord[1] + row * 1.3, index };
  });
}

function snapshotStepText(snapshot: TraceSnapshot | null): string {
  if (!snapshot) return '等待运行';
  if (snapshot.description) return snapshot.description;
  return snapshot.label || '运行中';
}

function activeNodeSet(snapshot: TraceSnapshot | null): Set<string> {
  return new Set((snapshot?.highlights ?? []).map(String));
}

function primWorkingEdge(graph: CityGraphData, snapshot: TraceSnapshot | null): CityGraphEdge | null {
  const pair = activePair(snapshot);
  if (pair) {
    return graph.edges.find(edge => {
      const a = idKey(edge.from);
      const b = idKey(edge.to);
      return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
    }) ?? null;
  }
  const current = snapshot?.highlights?.[0];
  if (current === undefined) return graph.edges[0] ?? null;
  const key = idKey(current);
  return graph.edges
    .filter(edge => idKey(edge.from) === key || idKey(edge.to) === key)
    .sort((a, b) => (a.weight ?? 999) - (b.weight ?? 999))[0] ?? null;
}

function currentNodeId(snapshot: TraceSnapshot | null): string | null {
  const pair = activePair(snapshot);
  if (pair) return pair[0];
  const first = snapshot?.highlights?.[0];
  return first === undefined ? null : String(first);
}

function candidateRoutes(snapshot: TraceSnapshot | null, graph: CityGraphData): CityGraphEdge[] {
  const current = currentNodeId(snapshot);
  if (current === null) return graph.edges.slice(0, 4);
  return graph.edges
    .filter(edge => idKey(edge.from) === current || idKey(edge.to) === current)
    .sort((a, b) => (a.weight ?? 999) - (b.weight ?? 999))
    .slice(0, 4);
}

function dijkstraWorkingEdge(graph: CityGraphData, snapshot: TraceSnapshot | null): CityGraphEdge | null {
  const pair = activePair(snapshot);
  if (pair) {
    return graph.edges.find(edge => {
      const a = idKey(edge.from);
      const b = idKey(edge.to);
      return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
    }) ?? null;
  }
  return candidateRoutes(snapshot, graph)[0] ?? null;
}

function DijkstraSiteNode({ node, active, source, color, index }: {
  node: CityNodeLayout;
  active: boolean;
  source: boolean;
  color: string;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = active ? 1.0 + Math.sin(clock.elapsedTime * 5) * 0.12 : 1;
    ref.current.scale.setScalar(pulse);
  });
  const baseColor = active ? color : source ? '#9fb9a6' : '#8b949e';
  return (
    <group position={[node.x, 0, node.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <circleGeometry args={[0.85, 28]} />
        <meshBasicMaterial color={active ? color : source ? '#6f8f7a' : '#56616b'} transparent opacity={active ? 0.36 : 0.18} />
      </mesh>
      {source ? (
        <>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.72, 0.78, 0.24, 12]} />
            <meshStandardMaterial color="#8b6914" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.36, 0]} castShadow>
            <cylinderGeometry args={[0.62, 0.62, 0.24, 12]} />
            <meshStandardMaterial color="#a0844a" roughness={0.5} />
          </mesh>
          {[[-0.5, 0, -0.5], [0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, 0.5]].map(([cx, _, cz], i) => (
            <mesh key={`col-${i}`} position={[cx, 0.7, cz]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
              <meshStandardMaterial color="#e8d9a8" roughness={0.55} />
            </mesh>
          ))}
          <mesh position={[0, 1.12, 0]} castShadow>
            <coneGeometry args={[0.72, 0.32, 8]} />
            <meshStandardMaterial color={active ? color : '#8b5e3c'} emissive={active ? color : '#000'} emissiveIntensity={active ? 0.22 : 0.01} roughness={0.58} />
          </mesh>
          <mesh ref={ref} position={[0, 1.42, 0]} castShadow>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial color="#d6b36a" emissive="#d6b36a" emissiveIntensity={0.28} />
          </mesh>
        </>
      ) : index % 5 === 0 ? (
        <>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.6, 0.2, 12]} />
            <meshStandardMaterial color="#4a6075" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.5, 0.06, 12]} />
            <meshStandardMaterial color="#1e3a52" roughness={0.5} />
          </mesh>
          {[[-0.4, 0, 0], [0.4, 0, 0], [0, 0, -0.4], [0, 0, 0.4]].map(([cx, _, cz], i) => (
            <mesh key={`fj-${i}`} position={[cx, 0.05, cz]}>
              <sphereGeometry args={[0.07, 6, 5]} />
              <meshStandardMaterial color={active ? color : '#8aa3b8'} emissive={active ? color : '#1f3345'} emissiveIntensity={active ? 0.34 : 0.06} />
            </mesh>
          ))}
          <mesh ref={ref} position={[0, 0.45, 0]} castShadow>
            <coneGeometry args={[0.08, 0.32, 6]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.4} metalness={0.3} />
          </mesh>
        </>
      ) : index % 5 === 1 ? (
        <>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.7, 0.4, 0.7]} />
            <meshStandardMaterial color={baseColor} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.55, 0.2, 0.55]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          <mesh ref={ref} position={[0, 0.85, 0]} castShadow>
            <dodecahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color={active ? '#e6d99a' : '#b8c0c8'} emissive={active ? color : '#1e293b'} emissiveIntensity={active ? 0.28 : 0.03} roughness={0.52} metalness={0.25} />
          </mesh>
        </>
      ) : index % 5 === 2 ? (
        <>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.55, 0.16, 10]} />
            <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.24, 10]} />
            <meshStandardMaterial color="#4a3a2a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <sphereGeometry args={[0.32, 12, 8]} />
            <meshStandardMaterial color={active ? color : '#6f8f73'} emissive={active ? color : '#1f3327'} emissiveIntensity={active ? 0.24 : 0.03} roughness={0.88} />
          </mesh>
          <mesh ref={ref} position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#d6b36a" emissive="#d6b36a" emissiveIntensity={0.24} />
          </mesh>
        </>
      ) : index % 5 === 3 ? (
        <>
          <mesh position={[-0.3, 0.08, 0]} castShadow>
            <boxGeometry args={[0.12, 0.16, 0.5]} />
            <meshStandardMaterial color="#6b5b4b" roughness={0.7} />
          </mesh>
          <mesh position={[0.3, 0.08, 0]} castShadow>
            <boxGeometry args={[0.12, 0.16, 0.5]} />
            <meshStandardMaterial color="#6b5b4b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.0, 0.08, 0.5]} />
            <meshStandardMaterial color={active ? color : '#8b6914'} emissive={active ? color : '#000'} emissiveIntensity={active ? 0.35 : 0.05} roughness={0.6} />
          </mesh>
          <mesh position={[-0.2, 0.18, -0.2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.36, 6]} />
            <meshStandardMaterial color="#3f3a2e" />
          </mesh>
          <mesh position={[0.2, 0.18, -0.2]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.36, 6]} />
            <meshStandardMaterial color="#3f3a2e" />
          </mesh>
          <mesh ref={ref} position={[0, 0.25, 0.15]}>
            <sphereGeometry args={[0.08, 6, 5]} />
            <meshStandardMaterial color="#d6b36a" emissive="#d6b36a" emissiveIntensity={0.2} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.9, 0.1, 0.9]} />
            <meshStandardMaterial color="#d6c8a8" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.13, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.06, 8]} />
            <meshStandardMaterial color="#8b7355" roughness={0.6} />
          </mesh>
          <mesh ref={ref} position={[0, 0.55, 0]} castShadow>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial color={active ? color : '#cbd5e1'} emissive={active ? color : '#0f172a'} emissiveIntensity={active ? 0.35 : 0.04} roughness={0.5} metalness={0.25} />
          </mesh>
        </>
      )}
      <Text position={[0, 1.6, 0]} fontSize={0.32} color="#f8fafc" anchorX="center" outlineWidth={0.014} outlineColor="#020617">
        {node.label ?? String(node.id)}
      </Text>
    </group>
  );
}

function DijkstraScenarioEdge({ from, to, edge, active, settled }: {
  from: CityNodeLayout;
  to: CityNodeLayout;
  edge: CityGraphEdge;
  active: boolean;
  settled: boolean;
}) {
  const color = active ? '#22d3ee' : settled ? '#34d399' : '#87929c';
  const route = getDijkstraRoadRoute(edge, from, to);
  const label = pointAlongPolyline(route, 0.52);
  const fromLabel = dijkstraNodeLabel(from);
  const toLabel = dijkstraNodeLabel(to);
  return (
    <group>
      {route.slice(0, -1).map((point, i) => (
        <GroundConnector
          key={`dijkstra-route-seg-${idKey(from.id)}-${idKey(to.id)}-${i}`}
          from={point}
          to={route[i + 1]}
          width={active ? 0.5 : settled ? 0.42 : 0.34}
          y={0.105 + i * 0.003}
          color={active ? color : settled ? '#5fa878' : '#6f7982'}
          opacity={active ? 0.96 : settled ? 0.9 : 0.84}
        />
      ))}
      {active && [0.2, 0.42, 0.64, 0.84].map((progress, i) => {
        const [x, z] = pointAlongPolyline(route, progress);
        const angle = tangentAlongPolyline(route, progress);
        return (
          <group key={`route-chevron-${i}`} position={[x, 0.18, z]} rotation={[0, angle, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <coneGeometry args={[0.18, 0.46, 3]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.92} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
      {active && route.map((point, i) => (
        <mesh key={`route-pulse-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[point[0], 0.125, point[1]]}>
          <circleGeometry args={[0.22, 18]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
      {typeof edge.weight === 'number' && (
        <Billboard position={[label[0], active ? 0.74 : 0.48, label[1]]} follow>
          <mesh position={[0, 0, -0.012]}>
            <planeGeometry args={[active ? 2.25 : 1.25, active ? 0.52 : 0.34]} />
            <meshBasicMaterial color={active ? '#083344' : '#111827'} transparent opacity={active ? 0.9 : 0.72} depthWrite={false} />
          </mesh>
          <Text position={[0, active ? 0.08 : 0, 0]} fontSize={active ? 0.13 : 0.105} color={active ? '#e0f2fe' : '#cbd5e1'} anchorX="center" outlineWidth={0.005} outlineColor="#020617" maxWidth={active ? 2.05 : 1.1}>
            {active ? `relax ${fromLabel}->${toLabel}` : `${fromLabel}-${toLabel}`}
          </Text>
          <Text position={[0, active ? -0.12 : -0.11, 0]} fontSize={active ? 0.115 : 0.1} color={active ? '#67e8f9' : '#fbbf24'} anchorX="center" outlineWidth={0.005} outlineColor="#020617">
            cost {edge.weight}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function GroundConnector({ from, to, width = 0.32, y = 0.072, color = '#687078', opacity = 0.92 }: {
  from: [number, number];
  to: [number, number];
  width?: number;
  y?: number;
  color?: string;
  opacity?: number;
}) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
  const angle = Math.atan2(dx, dz);
  return (
    <group position={[(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2]} rotation={[0, angle, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[width, 0.035, len]} />
        <meshStandardMaterial color={color} roughness={0.88} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

const DIJKSTRA_FACILITY_ENTRANCES: [number, number][] = [
  [-7.55, 3.25],
  [-4.5, 1.95],
  [-2.15, 4.65],
  [1.6, -4.65],
  [4.6, 1.4],
  [6.7, 3.3],
  [-6.2, -0.2],
  [3.5, 4.65],
];

const DIJKSTRA_FACILITY_ROLES = [
  '急救中心',
  '急诊入口',
  '门诊楼',
  '停车场',
  '药房',
  '诊所街',
  '住院楼',
  '人行入口',
];

const DIJKSTRA_LABEL_OFFSETS: [number, number, number][] = [
  [-0.18, 0.08, -0.38],
  [-0.2, 0.26, 0.3],
  [0.08, 0.16, 0.46],
  [0.18, 0.08, -0.46],
  [0.2, 0.2, 0.36],
  [0.1, 0.1, 0.46],
  [-0.16, 0.18, -0.34],
  [0.12, 0.18, 0.38],
];

const DIJKSTRA_ROAD_ROUTES: Record<string, [number, number][]> = {
  '0->1': [[-7.55, 3.25], [-7.55, 2.45], [-6.0, 2.45], [-6.0, 1.95], [-4.5, 1.95]],
  '0->2': [[-7.55, 3.25], [-6.65, 3.25], [-6.65, 4.65], [-2.15, 4.65]],
  '1->3': [[-4.5, 1.95], [-4.5, 0.05], [0.8, 0.05], [0.8, -4.65], [1.6, -4.65]],
  '2->1': [[-2.15, 4.65], [-2.15, 3.35], [-4.5, 3.35], [-4.5, 1.95]],
  '2->3': [[-2.15, 4.65], [-0.8, 4.65], [-0.8, 0.05], [1.6, 0.05], [1.6, -4.65]],
  '2->4': [[-2.15, 4.65], [-2.15, 2.4], [4.6, 2.4], [4.6, 1.4]],
  '3->4': [[1.6, -4.65], [1.6, -1.55], [4.6, -1.55], [4.6, 1.4]],
  '3->5': [[1.6, -4.65], [6.7, -4.65], [6.7, 3.3]],
  '4->5': [[4.6, 1.4], [4.6, 3.3], [6.7, 3.3]],
};

function compactRoute(route: [number, number][]): [number, number][] {
  return route.filter((point, index, arr) => (
    index === 0 || Math.hypot(point[0] - arr[index - 1][0], point[1] - arr[index - 1][1]) > 0.25
  ));
}

function getDijkstraRoadRoute(edge: CityGraphEdge, from: CityNodeLayout, to: CityNodeLayout): [number, number][] {
  const key = `${idKey(edge.from)}->${idKey(edge.to)}`;
  const reverseKey = `${idKey(edge.to)}->${idKey(edge.from)}`;
  if (DIJKSTRA_ROAD_ROUTES[key]) return DIJKSTRA_ROAD_ROUTES[key];
  if (DIJKSTRA_ROAD_ROUTES[reverseKey]) return [...DIJKSTRA_ROAD_ROUTES[reverseKey]].reverse();
  const fromEntry = DIJKSTRA_FACILITY_ENTRANCES[from.index % DIJKSTRA_FACILITY_ENTRANCES.length];
  const toEntry = DIJKSTRA_FACILITY_ENTRANCES[to.index % DIJKSTRA_FACILITY_ENTRANCES.length];
  return compactRoute([fromEntry, [fromEntry[0], 0.05], [toEntry[0], 0.05], toEntry]);
}

function pointAlongPolyline(points: [number, number][], progress: number): [number, number] {
  if (points.length === 0) return [0, 0];
  if (points.length === 1) return points[0];
  const lengths = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    return Math.hypot(next[0] - point[0], next[1] - point[1]);
  });
  const total = Math.max(0.001, lengths.reduce((sum, len) => sum + len, 0));
  let remaining = THREE.MathUtils.clamp(progress, 0, 1) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) {
      const a = points[i];
      const b = points[i + 1];
      const t = lengths[i] <= 0 ? 0 : remaining / lengths[i];
      return [THREE.MathUtils.lerp(a[0], b[0], t), THREE.MathUtils.lerp(a[1], b[1], t)];
    }
    remaining -= lengths[i];
  }
  return points[points.length - 1];
}

function tangentAlongPolyline(points: [number, number][], progress: number): number {
  if (points.length < 2) return 0;
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const a = pointAlongPolyline(points, Math.max(0, p - 0.01));
  const b = pointAlongPolyline(points, Math.min(1, p + 0.01));
  return Math.atan2(b[0] - a[0], b[1] - a[1]);
}

function dijkstraNodeLabel(node: CityGraphNode): string {
  return node.label ?? String(node.id);
}

function DijkstraDataTag({ node, index, entrance, active, source, pairRole }: {
  node: CityNodeLayout;
  index: number;
  entrance: [number, number];
  active: boolean;
  source: boolean;
  pairRole: 'from' | 'to' | null;
}) {
  const offset = DIJKSTRA_LABEL_OFFSETS[index % DIJKSTRA_LABEL_OFFSETS.length];
  const label = dijkstraNodeLabel(node);
  const role = DIJKSTRA_FACILITY_ROLES[index % DIJKSTRA_FACILITY_ROLES.length];
  const state = pairRole === 'from' ? 'from / u 当前点'
    : pairRole === 'to' ? 'to / v 目标点'
      : source ? 'source dist=0'
        : active ? 'settled'
          : 'unvisited';
  const accent = pairRole ? '#22d3ee' : active ? '#34d399' : source ? '#fbbf24' : '#94a3b8';
  return (
    <Billboard position={[entrance[0] + offset[0], 1.6 + offset[1], entrance[1] + offset[2]]} follow>
      <mesh position={[0, 0, -0.018]}>
        <planeGeometry args={[2.55, 0.94]} />
        <meshBasicMaterial color="#0b1220" transparent opacity={pairRole ? 0.92 : 0.78} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.34, -0.012]}>
        <planeGeometry args={[2.55, 0.07]} />
        <meshBasicMaterial color={accent} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <Text position={[0, 0.18, 0]} fontSize={0.16} color="#f8fafc" anchorX="center" outlineWidth={0.007} outlineColor="#020617" maxWidth={2.3}>
        {`${label} / node ${idKey(node.id)}`}
      </Text>
      <Text position={[0, -0.06, 0]} fontSize={0.13} color="#cbd5e1" anchorX="center" outlineWidth={0.006} outlineColor="#020617" maxWidth={2.3}>
        {role}
      </Text>
      <Text position={[0, -0.28, 0]} fontSize={0.12} color={accent} anchorX="center" outlineWidth={0.006} outlineColor="#020617" maxWidth={2.3}>
        {state}
      </Text>
    </Billboard>
  );
}

function DijkstraFacilityConnectors({ layout, snapshot }: { layout: CityNodeLayout[]; snapshot: TraceSnapshot | null }) {
  const active = activeNodeSet(snapshot);
  const pair = activePair(snapshot);
  return (
    <group>
      {layout.map((node, index) => {
        const entrance = DIJKSTRA_FACILITY_ENTRANCES[index % DIJKSTRA_FACILITY_ENTRANCES.length];
        const key = idKey(node.id);
        const pairRole = pair?.[0] === key ? 'from' : pair?.[1] === key ? 'to' : null;
        return (
          <group key={`dijkstra-connector-${idKey(node.id)}`}>
            <GroundConnector from={[node.x, node.z]} to={entrance} width={index === 0 ? 0.46 : 0.32} y={0.074} color={index === 0 ? '#7d858b' : '#606870'} opacity={0.9} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[entrance[0], 0.088, entrance[1]]}>
              <planeGeometry args={[0.72, 0.42]} />
              <meshStandardMaterial color={pairRole ? '#0e7490' : active.has(key) ? '#4f7d62' : '#737b82'} emissive={pairRole ? '#22d3ee' : '#000'} emissiveIntensity={pairRole ? 0.14 : 0} roughness={0.86} />
            </mesh>
            <mesh position={[entrance[0], 0.76, entrance[1]]}>
              <cylinderGeometry args={[0.018, 0.018, 1.3, 6]} />
              <meshStandardMaterial color={pairRole ? '#67e8f9' : '#94a3b8'} emissive={pairRole ? '#22d3ee' : '#000'} emissiveIntensity={pairRole ? 0.22 : 0} roughness={0.6} />
            </mesh>
            <Text position={[entrance[0], 0.13, entrance[1]]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.24} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#020617">
              {`${dijkstraNodeLabel(node)}${idKey(node.id)}`}
            </Text>
            <DijkstraDataTag node={node} index={index} entrance={entrance} active={active.has(key)} source={index === 0} pairRole={pairRole} />
          </group>
        );
      })}
    </group>
  );
}

function DijkstraRouteNetwork({ snapshot, graph, color }: {
  snapshot: TraceSnapshot | null;
  graph: CityGraphData;
  color: string;
}) {
  const layout = useMemo(() => buildDijkstraLayout(graph), [graph]);
  const byId = useMemo(() => new Map(layout.map(n => [idKey(n.id), n])), [layout]);
  const active = activeNodeSet(snapshot);
  const workingEdge = dijkstraWorkingEdge(graph, snapshot);
  return (
    <group>
      <DijkstraFacilityConnectors layout={layout} snapshot={snapshot} />
      {graph.edges.map((edge, i) => {
        const from = byId.get(idKey(edge.from));
        const to = byId.get(idKey(edge.to));
        if (!from || !to) return null;
        const edgeActive = edge === workingEdge || isEdgeActive(edge, snapshot);
        const settled = active.has(idKey(edge.from)) && active.has(idKey(edge.to));
        return <DijkstraScenarioEdge key={`dijkstra-edge-${i}`} from={from} to={to} edge={edge} active={edgeActive} settled={settled} />;
      })}
      {layout.map((node, index) => (
        <DijkstraSiteNode key={`dijkstra-node-${idKey(node.id)}`} node={node} active={active.has(idKey(node.id))} source={index === 0} color={color} index={index} />
      ))}
      <EmergencyDispatchVehicle snapshot={snapshot} graph={graph} layout={layout} />
    </group>
  );
}

function EmergencyDispatchVehicle({ snapshot, graph, layout }: { snapshot: TraceSnapshot | null; graph: CityGraphData; layout: CityNodeLayout[] }) {
  const group = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.PointLight>(null);
  const sceneTime = useSyncedSceneTime(`${snapshot?.timestamp ?? ''}-${snapshot?.label ?? ''}`);
  const route = useMemo(() => {
    const edge = dijkstraWorkingEdge(graph, snapshot);
    if (!edge) return null;
    const pair = activePair(snapshot);
    const fromId = pair ? pair[0] : idKey(edge.from);
    const toId = pair ? pair[1] : idKey(edge.to);
    const a = layout.find(n => idKey(n.id) === fromId);
    const b = layout.find(n => idKey(n.id) === toId);
    return a && b ? { a, b, weight: edge.weight, points: getDijkstraRoadRoute(edge, a, b) } : null;
  }, [graph, snapshot, layout]);

  useFrame(() => {
    if (beacon.current) beacon.current.intensity = 0.6 + Math.sin(sceneTime.current * 14) * 0.45;
    if (!group.current || !route) return;
    const p = oneWayStepProgress(sceneTime.current);
    const [x, z] = pointAlongPolyline(route.points, p);
    group.current.position.set(x, 0.32, z);
    group.current.rotation.y = tangentAlongPolyline(route.points, p);
  });

  if (!route) return null;
  return (
    <group>
      <group ref={group} position={[route.points[0][0], 0.32, route.points[0][1]]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.62, 0.36, 1.05]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.42} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.42, 0.08]} castShadow>
          <boxGeometry args={[0.48, 0.28, 0.44]} />
          <meshStandardMaterial color="#dbeafe" roughness={0.34} />
        </mesh>
        <mesh position={[-0.17, 0.6, 0.02]}>
          <boxGeometry args={[0.14, 0.06, 0.18]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0.17, 0.6, 0.02]}>
          <boxGeometry args={[0.14, 0.06, 0.18]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
        <pointLight ref={beacon} position={[0, 0.82, 0]} distance={4.5} color="#38bdf8" />
        {[[-0.34, 0.06, -0.32], [0.34, 0.06, -0.32], [-0.34, 0.06, 0.32], [0.34, 0.06, 0.32]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.07, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.85} />
          </mesh>
        ))}
        <Text position={[0, 0.95, 0]} fontSize={0.13} color="#e0f2fe" anchorX="center" outlineWidth={0.006} outlineColor="#020617">应急车</Text>
      </group>
      <group position={[pointAlongPolyline(route.points, 0.5)[0], 0.22, pointAlongPolyline(route.points, 0.5)[1]]}>
        <mesh>
          <boxGeometry args={[2.25, 0.12, 0.42]} />
          <meshStandardMaterial color="#052e2f" emissive="#22d3ee" emissiveIntensity={0.12} roughness={0.45} />
        </mesh>
        <Text position={[0, 0.22, 0.04]} fontSize={0.14} color="#a5f3fc" anchorX="center" outlineWidth={0.005} outlineColor="#020617">
          绿波通道 cost {route.weight ?? '-'}
        </Text>
      </group>
    </group>
  );
}

function DijkstraQueueBoard({ snapshot, graph, title, color, x, z, rotationY }: {
  snapshot: TraceSnapshot | null;
  graph: CityGraphData;
  title: string;
  color: string;
  x: number;
  z: number;
  rotationY: number;
}) {
  const current = currentNodeId(snapshot);
  const routes = candidateRoutes(snapshot, graph);
  const nodes = graph.nodes;
  const nodeLabel = (id: number | string) => nodes.find(n => idKey(n.id) === idKey(id))?.label ?? String(id);
  return (
    <group position={[x, 1.65, z]} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[4.6, 2.25, 0.1]} />
        <meshStandardMaterial color="#12313a" emissive={color} emissiveIntensity={0.04} roughness={0.62} />
      </mesh>
      <Text position={[0, 0.82, 0.08]} fontSize={0.2} color={color} anchorX="center" outlineWidth={0.008} outlineColor="#020617">
        {title}
      </Text>
      <Text position={[-2, 0.42, 0.08]} fontSize={0.14} color="#e2e8f0" anchorX="left" maxWidth={4.5}>
        当前节点: {current === null ? '-' : nodeLabel(current)}
      </Text>
      <Text position={[-2, 0.1, 0.08]} fontSize={0.12} color="#cbd5e1" anchorX="left" maxWidth={4.5}>
        {snapshotStepText(snapshot)}
      </Text>
      <Text position={[-2, -0.34, 0.08]} fontSize={0.13} color="#f8fafc" anchorX="left">
        候选道路
      </Text>
      {routes.map((edge, i) => (
        <Text key={i} position={[-2, -0.6 - i * 0.26, 0.08]} fontSize={0.11} color={isEdgeActive(edge, snapshot) ? color : '#94a3b8'} anchorX="left" maxWidth={4.5}>
          {`${nodeLabel(edge.from)} -> ${nodeLabel(edge.to)}  cost ${edge.weight ?? '?'}`}
        </Text>
      ))}
    </group>
  );
}

function EmergencyDistrictSkin() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.031, 0]}>
        <planeGeometry args={[19.2, 11.2]} />
        <meshStandardMaterial color="#29333d" roughness={0.96} />
      </mesh>
      {[
        { p: [0, 0.041, 0] as [number, number, number], s: [18.4, 1.55] as [number, number], r: 0.04 },
        { p: [-3.6, 0.043, 2.05] as [number, number, number], s: [8.4, 1.08] as [number, number], r: -0.56 },
        { p: [3.9, 0.043, -1.98] as [number, number, number], s: [9.6, 1.08] as [number, number], r: 0.72 },
        { p: [-1.4, 0.044, -3.55] as [number, number, number], s: [6.4, 0.82] as [number, number], r: 0.32 },
      ].map((road, i) => (
        <mesh key={`emergency-road-${i}`} rotation={[-Math.PI / 2, 0, road.r]} position={road.p}>
          <planeGeometry args={road.s} />
          <meshStandardMaterial color="#51565b" roughness={0.88} />
        </mesh>
      ))}
      {[-6, -2, 2, 6].map((x, i) => (
        <mesh key={`emergency-lane-${i}`} rotation={[-Math.PI / 2, 0, 0.04]} position={[x, 0.052, 0]}>
          <planeGeometry args={[1.0, 0.08]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.72} />
        </mesh>
      ))}
      <group position={[-7.55, 0, 3.1]} rotation={[0, 0.18, 0]}>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[2.7, 2.3, 1.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.58} />
        </mesh>
        <mesh position={[0, 2.38, 0]}>
          <boxGeometry args={[2.9, 0.18, 1.95]} />
          <meshStandardMaterial color="#e11d48" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.38, 0.93]}>
          <boxGeometry args={[1.2, 0.26, 0.08]} />
          <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.08} roughness={0.45} />
        </mesh>
        <mesh position={[0, 1.38, 0.98]}>
          <boxGeometry args={[0.24, 1.1, 0.08]} />
          <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.08} roughness={0.45} />
        </mesh>
        <Text position={[0, 2.72, 0.3]} fontSize={0.18} color="#fee2e2" anchorX="center" outlineWidth={0.006} outlineColor="#7f1d1d">急救中心</Text>
      </group>
      <group position={[6.7, 0, 3.3]} rotation={[0, -0.25, 0]}>
        {[0, 1, 2].map(i => (
          <group key={`clinic-shop-${i}`} position={[-2.2 + i * 2.0, 0, i === 1 ? 0.15 : 0]}>
            <mesh position={[0, 0.72, 0]} castShadow>
              <boxGeometry args={[1.25, 1.44, 1.05]} />
              <meshStandardMaterial color={['#cfd7dc', '#d7d4ce', '#c7ced3'][i]} roughness={0.74} />
            </mesh>
            <mesh position={[0, 1.5, 0.63]}>
              <boxGeometry args={[1.08, 0.16, 0.08]} />
              <meshStandardMaterial color={['#3f6174', '#557064', '#59636c'][i]} roughness={0.58} />
            </mesh>
            <mesh position={[0, 0.58, 0.64]}>
              <planeGeometry args={[0.46, 0.54]} />
              <meshStandardMaterial color="#1f2933" emissive="#7dd3fc" emissiveIntensity={0.02} roughness={0.45} />
            </mesh>
          </group>
        ))}
      </group>
      <group position={[-6.2, 0, -0.2]} rotation={[0, 0.05, 0]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[2.3, 1.8, 1.35]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.62} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[2.48, 0.16, 1.48]} />
          <meshStandardMaterial color="#64748b" roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.92, 0.72]}>
          <boxGeometry args={[1.2, 0.34, 0.08]} />
          <meshStandardMaterial color={CITY_MATERIALS.hospitalRed} emissive={CITY_MATERIALS.hospitalRed} emissiveIntensity={0.06} />
        </mesh>
        <mesh position={[0, 0.92, 0.77]}>
          <boxGeometry args={[0.24, 1.12, 0.08]} />
          <meshStandardMaterial color={CITY_MATERIALS.hospitalRed} emissive={CITY_MATERIALS.hospitalRed} emissiveIntensity={0.06} />
        </mesh>
      </group>
      <group position={[-4.5, 0, 1.95]} rotation={[0, 0.18, 0]}>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[2.4, 0.14, 1.0]} />
          <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.08} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.52, 0.42]}>
          <boxGeometry args={[2.2, 0.12, 0.16]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.08} roughness={0.38} />
        </mesh>
        <Text position={[0, 0.72, 0.52]} fontSize={0.16} color="#e0f2fe" anchorX="center" outlineWidth={0.006} outlineColor="#020617">急诊入口</Text>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0.05]} position={[-0.4, 0.057, 0.05]}>
        <planeGeometry args={[13.8, 0.32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <Text position={[-1.4, 0.08, -0.72]} rotation={[-Math.PI / 2, 0, 0.05]} fontSize={0.44} color="#fee2e2" anchorX="center">
        120
      </Text>
      {[[-1.9, -4.65], [-0.8, -4.65], [0.3, -4.65], [1.4, -4.65], [2.5, -4.65], [3.6, -4.65]].map(([x, z], i) => (
        <mesh key={`ambulance-parking-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.056, z]}>
          <planeGeometry args={[0.08, 1.28]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.62} />
        </mesh>
      ))}
      {[[-3.7, 4.65], [-2.9, 4.65], [-2.1, 4.65], [-1.3, 4.65], [-0.5, 4.65]].map(([x, z], i) => (
        <mesh key={`hospital-crosswalk-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.058, z]}>
          <planeGeometry args={[0.42, 1.2]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.72} />
        </mesh>
      ))}
      {[[-5.2, -3.8], [-4.2, -3.8], [4.6, 1.4], [5.4, 1.4]].map(([x, z], i) => (
        <group key={`hospital-wayfinding-${i}`} position={[x, 0, z]} rotation={[0, i < 2 ? -0.15 : 0.22, 0]}>
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[0.08, 1.3, 0.08]} />
            <meshStandardMaterial color="#475569" roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.25, 0.04]}>
            <boxGeometry args={[0.7, 0.32, 0.08]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} />
          </mesh>
          <Text position={[0, 1.25, 0.09]} fontSize={0.1} color="#0f172a" anchorX="center">{i < 2 ? '急诊' : '门诊'}</Text>
        </group>
      ))}
      <group position={[0.3, 0.055, -5.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.66} />
        </mesh>
        <Text position={[0, 0.08, 0.03]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.54} color="#e0f2fe" anchorX="center">H</Text>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.02, 1.14, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.78} />
        </mesh>
      </group>
      {[[-8.8, -2.9], [-7.4, -2.9], [7.3, -4.2], [8.7, -4.2]].map(([x, z], i) => (
        <group key={`emergency-barrier-${i}`} position={[x, 0, z]} rotation={[0, i < 2 ? 0.12 : -0.28, 0]}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[1.0, 0.18, 0.12]} />
            <meshStandardMaterial color="#f97316" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.28, 0.01]}>
            <boxGeometry args={[0.78, 0.04, 0.13]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PrimSubstationSkin() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[21.8, 15.8]} />
        <meshStandardMaterial color="#2f3336" roughness={0.98} />
      </mesh>
      {[
        { x: -5.9, z: -5.5, w: 5.2, d: 2.1, c: '#3d4246' },
        { x: 2.4, z: -5.9, w: 6.0, d: 1.75, c: '#3a3f42' },
        { x: 6.4, z: 4.6, w: 3.8, d: 2.4, c: '#383d40' },
        { x: -6.8, z: 4.8, w: 3.4, d: 2.2, c: '#363b3e' },
      ].map((pad, i) => (
        <mesh key={`substation-pad-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[pad.x, 0.037, pad.z]}>
          <planeGeometry args={[pad.w, pad.d]} />
          <meshStandardMaterial color={pad.c} roughness={0.84} />
        </mesh>
      ))}
      {[-7.8, -6.6, -5.4].map((x, i) => (
        <group key={`transformer-${i}`} position={[x, 0, -5.55]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.72, 1.0, 1.25]} />
            <meshStandardMaterial color="#56616a" roughness={0.62} metalness={0.32} />
          </mesh>
          {[ -0.28, 0, 0.28 ].map((dx, j) => (
            <mesh key={`coil-${j}`} position={[dx, 1.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.18, 12]} />
              <meshStandardMaterial color="#b45309" roughness={0.42} metalness={0.25} />
            </mesh>
          ))}
          <mesh position={[0, 0.52, 0.66]}>
            <boxGeometry args={[0.55, 0.18, 0.06]} />
            <meshBasicMaterial color={i === 1 ? '#22c55e' : '#facc15'} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
      <group position={[2.4, 0, -5.75]}>
        {[-2.25, 2.25].map(x => (
          <mesh key={`gantry-leg-${x}`} position={[x, 1.15, 0]}>
            <boxGeometry args={[0.12, 2.3, 0.12]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.48} metalness={0.55} />
          </mesh>
        ))}
        <mesh position={[0, 2.35, 0]}>
          <boxGeometry args={[4.8, 0.16, 0.18]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.48} metalness={0.55} />
        </mesh>
        {[-1.4, 0, 1.4].map(x => (
          <mesh key={`insulator-${x}`} position={[x, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.42, 10]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.34} />
          </mesh>
        ))}
      </group>
      {[[-0.8, 4.4], [0.4, 4.4], [1.6, 4.4], [2.8, 4.4]].map(([x, z], i) => (
        <mesh key={`solar-${i}`} position={[x, 0.34, z]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[1.0, 0.06, 0.62]} />
          <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.05} roughness={0.35} metalness={0.25} />
        </mesh>
      ))}
      {[-8.8, -7.6, 7.6, 8.8].map((x, i) => (
        <mesh key={`hazard-stripe-${i}`} rotation={[-Math.PI / 2, 0, i < 2 ? -0.6 : 0.6]} position={[x, 0.05, 0]}>
          <planeGeometry args={[2.2, 0.16]} />
          <meshBasicMaterial color={i % 2 ? '#111827' : '#facc15'} transparent opacity={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function UnionNeighborhoodSkin() {
  return (
    <group>
      {[
        { p: [0, 0.12, 0] as [number, number, number], s: [18.5, 1.05] as [number, number], r: 0.18 },
        { p: [-3.2, 0.121, -1.6] as [number, number, number], s: [9.0, 0.75] as [number, number], r: -0.58 },
        { p: [3.2, 0.122, 1.8] as [number, number, number], s: [8.6, 0.75] as [number, number], r: -0.2 },
        { p: [0, 0.123, 5.55] as [number, number, number], s: [20.5, 1.25] as [number, number], r: 0 },
      ].map((walk, i) => (
        <mesh key={`neighborhood-walk-${i}`} rotation={[-Math.PI / 2, 0, walk.r]} position={walk.p}>
          <planeGeometry args={walk.s} />
          <meshStandardMaterial color={i === 3 ? '#5f6260' : '#c7a36f'} roughness={0.86} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      ))}
      {[-8.3, 8.3].map((x, side) => (
        <group key={`apartment-row-${side}`} position={[x, 0.20, -0.6]}>
          {[0, 1, 2].map(i => (
            <group key={`apartment-${i}`} position={[0, 0, -3.1 + i * 3.0]}>
              <mesh position={[0, 1.35, 0]} castShadow>
                <boxGeometry args={[1.65, 2.7, 1.35]} />
                <meshStandardMaterial color={side === 0 ? '#c9bba8' : '#b8c2c8'} roughness={0.76} />
              </mesh>
              <mesh position={[0, 2.78, 0]}>
                <boxGeometry args={[1.78, 0.18, 1.48]} />
                <meshStandardMaterial color={side === 0 ? '#796657' : '#52616d'} roughness={0.72} />
              </mesh>
              {[0.72, -0.72].map((z, j) => (
                <mesh key={`window-${j}`} position={[0, 1.35, z]} rotation={[0, j === 0 ? 0 : Math.PI, 0]}>
                  <planeGeometry args={[0.72, 1.08]} />
                  <meshStandardMaterial color="#1e293b" emissive="#fde68a" emissiveIntensity={0.04} roughness={0.45} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      <group position={[0, 0.10, -5.55]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.8, 2.1]} />
          <meshStandardMaterial color="#57735d" roughness={0.92} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[0.78, 0.92, 24]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.64} />
        </mesh>
        <mesh position={[0, 0.12, -0.95]}>
          <boxGeometry args={[2.1, 0.08, 0.08]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.55} />
        </mesh>
      </group>
      {[[-2.9, 5.3, '#8b735f'], [-1.25, 5.3, '#7c8474'], [1.25, 5.3, '#63727b'], [2.9, 5.3, '#766a5a']].map(([x, z, color], i) => (
        <group key={`market-${i}`} position={[x as number, 0, z as number]}>
          <mesh position={[0, 0.48, 0]}>
            <boxGeometry args={[0.92, 0.08, 0.64]} />
            <meshStandardMaterial color="#6b4c3b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.84, 0]}>
            <boxGeometry args={[1.04, 0.12, 0.72]} />
            <meshStandardMaterial color={color as string} roughness={0.62} />
          </mesh>
          <mesh position={[0, 0.64, -0.28]}>
            <boxGeometry args={[0.08, 0.38, 0.08]} />
            <meshStandardMaterial color="#4b5563" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.64, 0.28]}>
            <boxGeometry args={[0.08, 0.38, 0.08]} />
            <meshStandardMaterial color="#4b5563" roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DijkstraDispatchScene({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const graph = useMemo(() => getGraph(optimizedSnapshot) ?? getGraph(naiveSnapshot), [naiveSnapshot, optimizedSnapshot]);
  const activeSnapshot = optimizedSnapshot ?? naiveSnapshot;
  return (
    <group>
      <AlgorithmStatusBillboard naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />
      <group position={[30, 0.05, 18]} scale={0.84}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
          <planeGeometry args={[20, 12]} />
          <meshStandardMaterial color="#1f2933" roughness={0.95} metalness={0.01} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
          <planeGeometry args={[18, 10.5]} />
          <meshStandardMaterial color="#2d3742" roughness={0.92} />
        </mesh>
        <EmergencyDistrictSkin />
        {[
          { p: [0, 0.018, 0] as [number, number, number], s: [16, 1.6] as [number, number], r: 0.05 },
          { p: [-3.5, 0.019, 1.8] as [number, number, number], s: [8, 1.2] as [number, number], r: -0.55 },
          { p: [3.8, 0.018, -2.0] as [number, number, number], s: [9, 1.1] as [number, number], r: 0.7 },
          { p: [-1.5, 0.02, -3.5] as [number, number, number], s: [6, 0.9] as [number, number], r: 0.3 },
        ].map((path, i) => (
          <mesh key={`d-path-${i}`} rotation={[-Math.PI / 2, 0, path.r]} position={path.p}>
            <planeGeometry args={path.s} />
            <meshStandardMaterial color="#4b5563" roughness={0.88} />
          </mesh>
        ))}
        {[
          { p: [-7.0, 0.021, 3.5] as [number, number, number], s: [2.5, 2.5] as [number, number] },
          { p: [6.5, 0.021, 2.5] as [number, number, number], s: [2.2, 2.2] as [number, number] },
          { p: [-1.0, 0.021, 4.0] as [number, number, number], s: [1.8, 1.8] as [number, number] },
          { p: [3.0, 0.021, 4.5] as [number, number, number], s: [2.0, 2.0] as [number, number] },
        ].map((plaza, i) => (
          <mesh key={`d-plaza-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={plaza.p}>
            <circleGeometry args={[plaza.s[0] / 2, 24]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
        ))}
        {[[-3.5, 3.5], [3.5, 3.5], [-5.5, -2.0], [5.0, -3.5], [0, -4.5], [-7.0, 0], [7.0, -1.0]].map(([x, z], i) => (
          <group key={`flower-bed-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.75, 0.12, 0.48]} />
              <meshStandardMaterial color="#5b5146" roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[0.62, 0.18, 0.36]} />
              <meshStandardMaterial color={['#496a50', '#55705b', '#526756', '#5d6f58'][i % 4]} roughness={0.9} />
            </mesh>
          </group>
        ))}
        {[[-8.5, -4.5], [8.5, -4.5], [-8.5, 4.5], [8.5, 4.5]].map(([x, z], i) => (
          <group key={`park-bench-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.8, 0.04, 0.28]} /><meshStandardMaterial color="#6b4c3b" roughness={0.7} /></mesh>
            <mesh position={[0, 0.38, -0.12]}><boxGeometry args={[0.8, 0.3, 0.04]} /><meshStandardMaterial color="#6b4c3b" roughness={0.7} /></mesh>
            {[[-0.35, 0, 0], [0.35, 0, 0]].map((p, j) => (
              <mesh key={j} position={[p[0], 0.12, 0]}><boxGeometry args={[0.04, 0.24, 0.28]} /><meshStandardMaterial color="#444" roughness={0.6} /></mesh>
            ))}
          </group>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 7.8]}>
          <planeGeometry args={[4.8, 3.2]} />
          <meshStandardMaterial color="#b7afa2" roughness={0.88} />
        </mesh>
        {[-1.6, 0, 1.6].map(x => (
          <mesh key={`entry-lane-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.026, 7.8]}>
            <planeGeometry args={[0.08, 2.4]} />
            <meshBasicMaterial color="#6b5f4c" transparent opacity={0.55} />
          </mesh>
        ))}
        {[-7.1, 7.1].map(x => (
          <group key={`plaza-light-${x}`} position={[x, 0, 5.6]}>
            <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.035, 0.05, 2.8, 6]} /><meshStandardMaterial color="#374151" /></mesh>
            <mesh position={[0, 2.78, 0.22]}><sphereGeometry args={[0.075, 8, 6]} /><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.75} /></mesh>
          </group>
        ))}
        {[-6.4, 6.4].map(x => (
          <mesh key={`curb-${x}`} position={[x, 0.08, 0]}>
            <boxGeometry args={[0.16, 0.16, 11.8]} />
            <meshStandardMaterial color="#8b7d62" roughness={0.82} />
          </mesh>
        ))}        {[[-7.2, -4.5], [-5.8, 4.4], [-3.4, 5.1], [5.4, 4.7], [7.0, -3.8], [1.8, -5.2]].map(([x, z], i) => (
          <group key={`park-tree-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.055, 0.08, 0.7, 6]} /><meshStandardMaterial color="#5b4636" roughness={0.8} /></mesh>
            <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.38, 10, 8]} /><meshStandardMaterial color="#2f6b3d" roughness={0.9} /></mesh>
          </group>
        ))}
        {[[-3.7, -5.6], [3.7, -5.6], [-7.5, 0.8], [7.5, 0.8]].map(([x, z], i) => (
          <group key={`park-bollard-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.045, 0.06, 0.7, 8]} /><meshStandardMaterial color="#3f3a2e" roughness={0.7} /></mesh>
            <mesh position={[0, 0.75, 0]}><sphereGeometry args={[0.07, 8, 6]} /><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.55} /></mesh>
          </group>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, 0]}>
          <planeGeometry args={[20, 13]} />
          <meshStandardMaterial color="#26392f" roughness={0.96} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 8.9]}>
          <planeGeometry args={[24, 2.2]} />
          <meshStandardMaterial color="#5f6260" roughness={0.88} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-11.2, 0.006, 0]}>
          <planeGeometry args={[2.0, 17.5]} />
          <meshStandardMaterial color="#5f6260" roughness={0.88} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11.2, 0.006, 0]}>
          <planeGeometry args={[2.0, 17.5]} />
          <meshStandardMaterial color="#5f6260" roughness={0.88} />
        </mesh>
        {[[-10.1, -6.6], [-10.1, -3.2], [-10.1, 3.4], [10.1, -6.2], [10.1, -1.8], [10.1, 3.8], [-6.2, 8.2], [-2.4, 8.2], [2.4, 8.2], [6.2, 8.2]].map(([x, z], i) => (
          <group key={`outer-hedge-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 0.28, 0]}><sphereGeometry args={[0.36, 8, 6]} /><meshStandardMaterial color="#315f3d" roughness={0.92} /></mesh>
          </group>
        ))}
        {[[-11.0, 6.9], [11.0, 6.9], [-11.0, -7.0], [11.0, -7.0]].map(([x, z], i) => (
          <group key={`outer-lamp-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.035, 0.05, 2.1, 6]} /><meshStandardMaterial color="#30343a" roughness={0.7} /></mesh>
            <mesh position={[0, 2.08, 0]}><sphereGeometry args={[0.075, 8, 6]} /><meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.65} /></mesh>
          </group>
        ))}
        <group position={[0, 0.16, 6.1]}>
          <mesh>
            <boxGeometry args={[6.5, 0.14, 0.55]} />
            <meshStandardMaterial color="#0f172a" emissive="#22d3ee" emissiveIntensity={0.12} roughness={0.4} />
          </mesh>
          <Text position={[0, 0.3, -0.04]} rotation={[0, Math.PI, 0]} fontSize={0.38} color="#e0f2fe" anchorX="center" outlineWidth={0.012} outlineColor="#020617">
            Dijkstra 最短路径
          </Text>
        </group>
        {graph && (
          <>
            <DijkstraRouteNetwork snapshot={activeSnapshot} graph={graph} color="#22d3ee" />
            <DijkstraQueueBoard snapshot={naiveSnapshot} graph={graph} title="朴素扫描" color="#f59e0b" x={-8.2} z={-0.5} rotationY={Math.PI / 7} />
            <DijkstraQueueBoard snapshot={optimizedSnapshot} graph={graph} title="堆优化调度" color="#22d3ee" x={8.2} z={-0.5} rotationY={-Math.PI / 7} />
            <group position={[0, 0.1, 5.25]}>
              <mesh>
                <boxGeometry args={[10.5, 0.16, 0.8]} />
                <meshStandardMaterial color="#0f172a" emissive="#22d3ee" emissiveIntensity={0.05} />
              </mesh>
              <Text position={[0, 0.32, -0.09]} rotation={[0, Math.PI, 0]} fontSize={0.32} color="#e0f2fe" anchorX="center" outlineWidth={0.015} outlineColor="#020617" maxWidth={9.8}>
                建筑牌=node id · 道路牌=边权 cost · 箭头=当前松弛方向
              </Text>
              <Html position={[5.6, 0.35, 0]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}>
                <div
                  onClick={() => setShowHelp(true, 'dijkstra')}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(14,165,233,0.85)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 18, color: '#fff',
                    boxShadow: '0 0 12px rgba(14,165,233,0.6)',
                    userSelect: 'none',
                  }}
                >
                  🔍
                </div>
              </Html>
            </group>
          </>
        )}
      </group>
    </group>
  );
}

const SORT_IDS = new Set(['bubble-vs-quick', 'py-bubble-vs-quick', 'selection-sort', 'insertion-sort', 'merge-sort', 'non-compare-sort']);
const GRAPH_SEARCH_IDS = new Set(['bfs-vs-dfs', 'py-bfs-vs-dfs']);
const SEARCH_IDS = new Set(['linear-binary', 'two-sum', 'rotated-array', 'peak']);

const SORTING_FACILITY_CONFIG: Record<string, { title: string; accent: string; task: string }> = {
  'bubble-vs-quick': { title: '交换传送带', accent: '#f97316', task: 'compare / swap' },
  'py-bubble-vs-quick': { title: '交换传送带', accent: '#f97316', task: 'compare / swap' },
  'selection-sort': { title: '质检挑选月台', accent: '#22c55e', task: 'select minimum' },
  'insertion-sort': { title: '顺序投递格口', accent: '#38bdf8', task: 'insert into sorted lane' },
  'merge-sort': { title: '合流归并码头', accent: '#a78bfa', task: 'merge two sorted lanes' },
  'non-compare-sort': { title: '邮编计数筒仓', accent: '#facc15', task: 'counting / bucket' },
};

const SEARCH_FACILITY_CONFIG: Record<string, { title: string; accent: string; task: string }> = {
  'linear-binary': { title: '区间检索密集库', accent: '#f59e0b', task: 'range scan / binary split' },
  'two-sum': { title: '两单配对证据台', accent: '#22c55e', task: 'lookup complement' },
  'rotated-array': { title: '旋转货架索引库', accent: '#38bdf8', task: 'find sorted half' },
  peak: { title: '峰值剖面测绘站', accent: '#fb7185', task: 'climb to peak' },
};
const DP_IDS = new Set(['knapsack-vs-opt', 'py-knapsack-vs-opt', 'lcs', 'coin-change', 'edit-distance', 'unique-paths', 'house-robber']);
const TREE_IDS = new Set(['tree-bfs-vs-dfs', 'py-tree-bfs-vs-dfs', 'tree-height', 'validate-bst', 'lca', 'traversals']);
const STRING_IDS = new Set(['string-search', 'longest-palindrome', 'anagram', 'longest-substring']);
const TREE_FORESTRY_WORLD_Y = 1.18;
const POLICE_PURSUIT_ORIGIN: [number, number, number] = [35, 0, 38];
const POLICE_CAR_SPEED = 12.8;

type PursuitGraphNode = { id: number; label: string; x: number; z: number };
type PursuitGraphEdge = { from: number; to: number; weight?: number };
type PursuitRoadPoint = { x: number; z: number };
type PursuitGraphState = {
  nodes: PursuitGraphNode[];
  edges: PursuitGraphEdge[];
  visited: Set<number>;
  order: number[];
  current: number;
  queueLen: number;
  description: string;
};

const PURSUIT_NODE_COORDS: Record<number, [number, number]> = {
  0: [-8, -12],
  1: [0, -12],
  2: [-8, -4],
  3: [0, -4],
  4: [8, 4],
  5: [0, 12],
};

const FALLBACK_PURSUIT_GRAPH = {
  nodes: [
    { id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' },
    { id: 3, label: 'D' }, { id: 4, label: 'E' }, { id: 5, label: 'F' },
  ],
  edges: [
    { from: 0, to: 1, weight: 2 }, { from: 0, to: 2, weight: 4 },
    { from: 1, to: 3, weight: 3 }, { from: 2, to: 3, weight: 1 },
    { from: 2, to: 4, weight: 5 }, { from: 3, to: 5, weight: 2 },
    { from: 4, to: 5, weight: 1 },
  ],
};

function normalizePursuitGraph(snapshot: TraceSnapshot | null) {
  const data = snapshot?.data as Record<string, unknown> | undefined;
  const graph = (data?.graph && typeof data.graph === 'object' ? data.graph : data) as Record<string, unknown> | undefined;
  const rawNodes = Array.isArray(graph?.nodes) && graph.nodes.length > 0 ? graph.nodes : FALLBACK_PURSUIT_GRAPH.nodes;
  const rawEdges = Array.isArray(graph?.edges) && graph.edges.length > 0 ? graph.edges : FALLBACK_PURSUIT_GRAPH.edges;
  const nodes = rawNodes.map((node, i) => {
    const n = node as Record<string, unknown>;
    const id = Number(n.id ?? i);
    const [x, z] = PURSUIT_NODE_COORDS[id] ?? [((i % 3) - 1) * 4, Math.floor(i / 3) * 3 - 3];
    return { id, label: String(n.label ?? id), x, z };
  });
  const edges = rawEdges.map(edge => {
    const e = edge as Record<string, unknown>;
    return { from: Number(e.from), to: Number(e.to), weight: Number(e.weight ?? 1) };
  }).filter(edge => Number.isFinite(edge.from) && Number.isFinite(edge.to));
  return { nodes, edges };
}

function getPursuitGraphState(snapshot: TraceSnapshot | null, mode: 'bfs' | 'dfs'): PursuitGraphState {
  const graph = normalizePursuitGraph(snapshot);
  const order = (snapshot?.highlights ?? []).map(Number).filter(Number.isFinite);
  const visited = new Set(order);
  const pointers = (snapshot?.pointers ?? {}) as Record<string, unknown>;
  const current = Number(pointers.current ?? order[order.length - 1] ?? 0);
  const queueLen = Number(pointers.queueLen ?? (mode === 'bfs' ? Math.max(0, graph.nodes.length - visited.size) : order.length));
  return {
    ...graph,
    visited,
    order,
    current: Number.isFinite(current) ? current : 0,
    queueLen: Number.isFinite(queueLen) ? queueLen : 0,
    description: snapshot?.description ?? (mode === 'bfs' ? 'BFS 出警队列逐层封控' : 'DFS 追踪栈沿线深入'),
  };
}

function nodeById(nodes: PursuitGraphNode[], id: number): PursuitGraphNode | undefined {
  return nodes.find(node => node.id === id);
}

function getPursuitRoutePoints(from: PursuitRoadPoint, to: PursuitRoadPoint): PursuitRoadPoint[] {
  const bends = Math.abs(from.x - to.x) > 0.001 && Math.abs(from.z - to.z) > 0.001;
  if (!bends) return [from, to];
  const corner: PursuitRoadPoint = { x: to.x, z: from.z };
  return [from, corner, to];
}

function isPursuitEdgeBetween(edge: PursuitGraphEdge, a: number, b: number) {
  return (edge.from === a && edge.to === b) || (edge.from === b && edge.to === a);
}

function getCurrentPursuitEdge(state: PursuitGraphState, nodes: PursuitGraphNode[]) {
  const currentIndex = state.order.lastIndexOf(state.current);
  const previousId = currentIndex > 0 ? state.order[currentIndex - 1] : state.order[state.order.length - 2];
  const directEdge = state.edges.find(edge => isPursuitEdgeBetween(edge, previousId, state.current));
  const candidateIds = state.order.slice(0, Math.max(currentIndex, state.order.length - 1)).reverse();
  const fallbackEdge = state.edges.find(edge => candidateIds.some(id => isPursuitEdgeBetween(edge, id, state.current)));
  const edge = directEdge ?? fallbackEdge;
  const fromId = edge?.from === state.current ? edge.to : edge?.from;
  const from = nodeById(nodes, Number(fromId));
  const to = nodeById(nodes, state.current);
  return from && to && from.id !== to.id ? { from, to } : null;
}

function PursuitCrosswalk({ x, z, angle = 0 }: { x: number; z: number; angle?: number }) {
  return (
    <group position={[x, 0.12, z]} rotation={[0, angle, 0]}>
      {[-0.36, -0.18, 0, 0.18, 0.36].map((offset, i) => (
        <mesh key={`pursuit-crosswalk-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0, 0]}>
          <planeGeometry args={[0.08, 1.34]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.74} />
        </mesh>
      ))}
    </group>
  );
}

function RouteOverlaySegment({ from, to, active, label }: { from: PursuitGraphNode; to: PursuitGraphNode; active: boolean; label?: string }) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz);
  const angle = Math.atan2(dx, dz);
  return (
    <group position={[(from.x + to.x) / 2, 0.135, (from.z + to.z) / 2]} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[0.42, 0.035, len]} />
        <meshBasicMaterial color={active ? '#38bdf8' : '#94a3b8'} transparent opacity={active ? 0.82 : 0.24} />
      </mesh>
      {Array.from({ length: Math.max(1, Math.floor(len / 1.3)) }, (_, i) => (
        <mesh key={`existing-city-route-${label}-${i}`} position={[0, 0.045, -len / 2 + 0.7 + i * 1.3]}>
          <boxGeometry args={[0.08, 0.025, 0.38]} />
          <meshBasicMaterial color={active ? '#e0f2fe' : '#cbd5e1'} transparent opacity={active ? 0.95 : 0.36} />
        </mesh>
      ))}
      {label && (
        <Text position={[0.36, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.115} color={active ? '#e0f2fe' : '#cbd5e1'} anchorX="center" outlineWidth={0.004} outlineColor="#111827">
          城市原有道路 edge {label}
        </Text>
      )}
    </group>
  );
}

function ExistingCityRoadRoute({ from, to, active, label }: { from: PursuitGraphNode; to: PursuitGraphNode; active: boolean; label: string }) {
  const route = getPursuitRoutePoints(from, to);
  /* 街道 edge / 城市道路 edge */
  return (
    <group>
      {route.slice(0, -1).map((point, i) => (
        <RouteOverlaySegment
          key={`pursuit-city-route-${label}-${i}`}
          from={{ id: -2, label: 'route', ...point }}
          to={{ id: -3, label: 'route', ...route[i + 1] }}
          active={active}
          label={i === 0 ? label : undefined}
        />
      ))}
    </group>
  );
}

function CurrentPursuitRoute({ from, to, color, label }: { from: PursuitGraphNode; to: PursuitGraphNode; color: string; label: string }) {
  const route = getPursuitRoutePoints(from, to);
  return (
    <group>
      {route.slice(0, -1).map((point, i) => {
        const next = route[i + 1];
        const dx = next.x - point.x;
        const dz = next.z - point.z;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dx, dz);
        return (
          <group key={`current-pursuit-route-${label}-${i}`} position={[(point.x + next.x) / 2, 0.24, (point.z + next.z) / 2]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[0.68, 0.055, len]} />
              <meshBasicMaterial color={color} transparent opacity={0.82} />
            </mesh>
            {Array.from({ length: Math.max(1, Math.floor(len / 1.9)) }, (_, j) => (
              <group key={`route-arrow-${label}-${i}-${j}`} position={[0, 0.075, -len / 2 + 0.9 + j * 1.9]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[0.2, 0.42, 3]} />
                  <meshBasicMaterial color="#fff7ed" transparent opacity={0.95} />
                </mesh>
              </group>
            ))}
            {i === 0 && (
              <Text position={[0.58, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.14} color={color} anchorX="center" outlineWidth={0.006} outlineColor="#111827">
                当前追捕 {label}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}

function EmbeddedPursuitRoad({ from, to, active, label }: { from: PursuitGraphNode; to: PursuitGraphNode; active: boolean; label: string }) {
  return <ExistingCityRoadRoute from={from} to={to} active={active} label={label} />;
}

function PursuitRoad({ from, to, active, label }: { from: PursuitGraphNode; to: PursuitGraphNode; active: boolean; label: string }) {
  return <EmbeddedPursuitRoad from={from} to={to} active={active} label={label} />;
}

function PursuitIntersection({ node, bfsActive, dfsActive, current, thief }: { node: PursuitGraphNode; bfsActive: boolean; dfsActive: boolean; current: boolean; thief: boolean }) {
  const color = thief ? '#ef4444' : current ? '#facc15' : dfsActive ? '#a78bfa' : bfsActive ? '#38bdf8' : '#64748b';
  return (
    <group position={[node.x, 0, node.z]}>
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.86, 0.9, 0.16, 28]} />
        <meshStandardMaterial color="#30363b" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.21, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.56, 0.12, 24]} />
        <meshStandardMaterial color={color} emissive={current || thief ? color : '#000'} emissiveIntensity={current || thief ? 0.24 : 0} roughness={0.72} />
      </mesh>
      <PursuitCrosswalk x={0} z={0.9} angle={Math.PI / 2} />
      <PursuitCrosswalk x={0.9} z={0} />
      <Billboard position={[0, 1.18, 0]} follow>
        <mesh><boxGeometry args={[1.36, 0.5, 0.05]} /><meshStandardMaterial color="#102033" roughness={0.68} /></mesh>
        <Text position={[0, 0.06, 0.04]} fontSize={0.16} color="#f8fafc" anchorX="center" anchorY="middle">
          路口 node {node.id}
        </Text>
        <Text position={[0, -0.13, 0.04]} fontSize={0.105} color={color} anchorX="center" anchorY="middle">
          {thief ? '小偷藏匿' : current ? '当前搜索' : bfsActive || dfsActive ? '已封控' : '待搜索'}
        </Text>
      </Billboard>
    </group>
  );
}

function PoliceStationDriveway({ stationNode }: { stationNode: PursuitGraphNode }) {
  const gateX = -7.05;
  const gateZ = -12;
  const from = { id: -1, label: '警察局', x: gateX, z: gateZ };
  return (
    <group>
      <EmbeddedPursuitRoad from={from} to={stationNode} active label="警察局->0" />
      <Text position={[(gateX + stationNode.x) / 2, 0.34, (gateZ + stationNode.z) / 2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.13} color="#dbeafe" anchorX="center" outlineWidth={0.004} outlineColor="#111827">
        出警车道
      </Text>
    </group>
  );
}

function PoliceStation() {
  return (
    <group position={[-5.35, 0, -9.8]} rotation={[0, 0.02, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]} receiveShadow>
        <planeGeometry args={[4.8, 5.8]} />
        <meshStandardMaterial color="#4b5563" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.15, -0.25]} castShadow>
        <boxGeometry args={[4.1, 2.3, 3.15]} />
        <meshStandardMaterial color="#d8dde2" roughness={0.76} />
      </mesh>
      <mesh position={[0, 2.42, -0.25]} castShadow>
        <boxGeometry args={[4.35, 0.28, 3.42]} />
        <meshStandardMaterial color="#334155" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.05, 1.36]} castShadow>
        <boxGeometry args={[1.15, 1.5, 0.12]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.52} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.72, 1.55]} castShadow>
        <boxGeometry args={[3.6, 0.56, 0.16]} />
        <meshStandardMaterial color="#0f172a" emissive="#1d4ed8" emissiveIntensity={0.12} roughness={0.6} />
      </mesh>
      <Text position={[0, 2.72, 1.66]} fontSize={0.28} color="#e0f2fe" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#020617">
        警察局
      </Text>
      {[-1.35, 1.35].map(x => (
        <mesh key={`station-window-${x}`} position={[x, 1.35, 1.36]}>
          <boxGeometry args={[0.64, 0.58, 0.08]} />
          <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.18} roughness={0.4} />
        </mesh>
      ))}
      <group position={[-1.62, 0.2, 2.15]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow><boxGeometry args={[1.0, 0.28, 0.48]} /><meshStandardMaterial color="#f8fafc" roughness={0.45} /></mesh>
        <mesh position={[0, 0.29, 0]}><boxGeometry args={[0.48, 0.16, 0.34]} /><meshStandardMaterial color="#bfdbfe" roughness={0.38} /></mesh>
        <mesh position={[0, 0.41, 0]}><boxGeometry args={[0.32, 0.05, 0.18]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} /></mesh>
      </group>
      <group position={[1.45, 0.2, 2.12]} rotation={[0, Math.PI / 2, 0]}>
        <mesh castShadow><boxGeometry args={[0.92, 0.26, 0.44]} /><meshStandardMaterial color="#1d4ed8" roughness={0.48} /></mesh>
        <mesh position={[0, 0.28, 0]}><boxGeometry args={[0.44, 0.15, 0.3]} /><meshStandardMaterial color="#bfdbfe" roughness={0.38} /></mesh>
      </group>
    </group>
  );
}

function PolicePatrolCar({ node, color, label, offset = 0 }: { node: PursuitGraphNode; color: string; label: string; offset?: number }) {
  const group = useRef<THREE.Group>(null);
  const previousPosition = useRef(new THREE.Vector3(node.x + offset, 0.22, node.z - 0.36));
  const targetPosition = useMemo(() => new THREE.Vector3(node.x + offset, 0.22, node.z - 0.36), [node.x, node.z, offset]);
  const routePoints = useRef<THREE.Vector3[]>([]);
  const segmentIndex = useRef(0);
  const lastTargetKey = useRef('');
  const moveDirection = useMemo(() => new THREE.Vector3(), []);
  const initialized = useRef(false);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (!initialized.current) {
      group.current.position.copy(targetPosition);
      previousPosition.current.copy(targetPosition);
      initialized.current = true;
      return;
    }
    const targetKey = `${targetPosition.x.toFixed(3)}:${targetPosition.z.toFixed(3)}`;
    if (lastTargetKey.current !== targetKey) {
      const current = group.current.position;
      routePoints.current = getPursuitRoutePoints(
        { x: current.x, z: current.z },
        { x: targetPosition.x, z: targetPosition.z },
      ).map(point => new THREE.Vector3(point.x, targetPosition.y, point.z));
      segmentIndex.current = Math.min(1, routePoints.current.length - 1);
      lastTargetKey.current = targetKey;
    }
    previousPosition.current.copy(group.current.position);
    const segmentTarget = routePoints.current[segmentIndex.current] ?? targetPosition;
    moveDirection.subVectors(segmentTarget, group.current.position);
    const distance = moveDirection.length();
    if (distance > 0.001) {
      moveDirection.normalize();
      group.current.position.addScaledVector(moveDirection, Math.min(POLICE_CAR_SPEED * delta, distance));
    } else if (segmentIndex.current < routePoints.current.length - 1) {
      segmentIndex.current += 1;
    }
    const activeTarget = routePoints.current[segmentIndex.current] ?? targetPosition;
    const dx = activeTarget.x - group.current.position.x;
    const dz = activeTarget.z - group.current.position.z;
    if (Math.abs(dx) + Math.abs(dz) > 0.015) {
      group.current.rotation.y = Math.atan2(dx, dz);
    }
  });
  return (
    <group ref={group} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow><boxGeometry args={[0.78, 0.28, 0.45]} /><meshStandardMaterial color={color} roughness={0.5} metalness={0.1} /></mesh>
      <mesh position={[0.03, 0.22, 0]}><boxGeometry args={[0.42, 0.16, 0.32]} /><meshStandardMaterial color="#e0f2fe" roughness={0.38} /></mesh>
      <mesh position={[0.0, 0.34, 0.0]}><boxGeometry args={[0.28, 0.06, 0.16]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.45} /></mesh>
      <Text position={[0, 0.55, 0]} fontSize={0.12} color="#f8fafc" anchorX="center" outlineWidth={0.004} outlineColor="#111827">{label}</Text>
    </group>
  );
}

function ThiefMarker({ node }: { node: PursuitGraphNode }) {
  return (
    <group position={[node.x, 0.32, node.z + 0.45]}>
      <mesh castShadow><boxGeometry args={[0.32, 0.46, 0.22]} /><meshStandardMaterial color="#18181b" roughness={0.72} /></mesh>
      <mesh position={[0, 0.36, 0]}><sphereGeometry args={[0.16, 12, 8]} /><meshStandardMaterial color="#f59e0b" roughness={0.6} /></mesh>
      <Text position={[0, 0.78, 0]} fontSize={0.13} color="#fecaca" anchorX="center" outlineWidth={0.005} outlineColor="#111827">小偷</Text>
    </group>
  );
}

function PursuitCommandBoard({ bfs, dfs }: { bfs: PursuitGraphState; dfs: PursuitGraphState }) {
  return (
    <group position={[5.3, 1.35, -4.75]} rotation={[0, -0.35, 0]}>
      <mesh><boxGeometry args={[4.4, 2.35, 0.12]} /><meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.06} roughness={0.55} /></mesh>
      <Text position={[0, 0.82, 0.08]} fontSize={0.18} color="#bfdbfe" anchorX="center">城市追捕指挥板</Text>
      <Text position={[-1.9, 0.35, 0.08]} fontSize={0.13} color="#38bdf8" anchorX="left" maxWidth={3.8}>BFS 出警队列: {bfs.queueLen}</Text>
      <Text position={[-1.9, 0.02, 0.08]} fontSize={0.13} color="#a78bfa" anchorX="left" maxWidth={3.8}>DFS 追踪栈: [{dfs.order.join(' -> ')}]</Text>
      <Text position={[-1.9, -0.34, 0.08]} fontSize={0.12} color="#e5e7eb" anchorX="left" maxWidth={3.8}>BFS: {bfs.description}</Text>
      <Text position={[-1.9, -0.72, 0.08]} fontSize={0.12} color="#e5e7eb" anchorX="left" maxWidth={3.8}>DFS: {dfs.description}</Text>
    </group>
  );
}

function PolicePursuitDistrict({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const bfs = useMemo(() => getPursuitGraphState(naiveSnapshot, 'bfs'), [naiveSnapshot]);
  const dfs = useMemo(() => getPursuitGraphState(optimizedSnapshot, 'dfs'), [optimizedSnapshot]);
  if (!GRAPH_SEARCH_IDS.has(activeAlgorithmId)) return null;
  const nodes = bfs.nodes.length ? bfs.nodes : dfs.nodes;
  const edges = bfs.edges.length ? bfs.edges : dfs.edges;
  const thiefNode = nodeById(nodes, 5) ?? nodes[nodes.length - 1];
  const stationNode = nodeById(nodes, 0) ?? nodes[0];
  const bfsCars = bfs.order.slice(-4).map(id => nodeById(nodes, id)).filter(Boolean) as PursuitGraphNode[];
  const dfsCurrent = nodeById(nodes, dfs.current) ?? nodeById(nodes, bfs.current) ?? nodes[0];
  const bfsCurrentEdge = getCurrentPursuitEdge(bfs, nodes);
  const dfsCurrentEdge = getCurrentPursuitEdge(dfs, nodes);
  return (
    <group position={POLICE_PURSUIT_ORIGIN}>
      <mesh position={[-3.4, 0.24, -10.2]}><boxGeometry args={[6.5, 0.16, 0.32]} /><meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.08} /></mesh>
      <Text position={[-3.4, 0.5, -10.14]} fontSize={0.22} color="#dbeafe" anchorX="center" outlineWidth={0.008} outlineColor="#020617">城市追捕指挥区 · 复用原有道路</Text>
      <PoliceStation />
      {stationNode && <PoliceStationDriveway stationNode={stationNode} />}
      {edges.map((edge, i) => {
        const from = nodeById(nodes, edge.from);
        const to = nodeById(nodes, edge.to);
        if (!from || !to) return null;
        const active = bfs.visited.has(edge.from) && bfs.visited.has(edge.to) || dfs.visited.has(edge.from) && dfs.visited.has(edge.to);
        return <EmbeddedPursuitRoad key={`pursuit-road-${i}`} from={from} to={to} active={active} label={`${edge.from}->${edge.to}`} />;
      })}
      {bfsCurrentEdge && <CurrentPursuitRoute from={bfsCurrentEdge.from} to={bfsCurrentEdge.to} color="#facc15" label="BFS 当前追捕" />}
      {dfsCurrentEdge && <CurrentPursuitRoute from={dfsCurrentEdge.from} to={dfsCurrentEdge.to} color="#c084fc" label="DFS 当前追踪" />}
      {nodes.map(node => (
        <PursuitIntersection
          key={`pursuit-node-${node.id}`}
          node={node}
          bfsActive={bfs.visited.has(node.id)}
          dfsActive={dfs.visited.has(node.id)}
          current={bfs.current === node.id || dfs.current === node.id}
          thief={thiefNode?.id === node.id}
        />
      ))}
      {bfsCars.map((node, i) => <PolicePatrolCar key={`bfs-police-${i}`} node={node} color="#2563eb" label="BFS 警车" offset={(i % 2) * 0.22} />)}
      {dfsCurrent && <PolicePatrolCar node={dfsCurrent} color="#7c3aed" label="DFS 追踪车" offset={-0.25} />}
      {thiefNode && <ThiefMarker node={thiefNode} />}
      <PursuitCommandBoard bfs={bfs} dfs={dfs} />
      <group position={[2.55, 0.36, 7.4]} rotation={[0, -0.18, 0]}>
        <mesh><boxGeometry args={[1.9, 0.55, 0.1]} /><meshStandardMaterial color="#0f3f5f" roughness={0.62} /></mesh>
        <Text position={[0, 0, 0.08]} fontSize={0.15} color="#e0f2fe" anchorX="center" anchorY="middle">城市原路网</Text>
      </group>
      <group position={[2.65, 0.42, 9.1]}>
        <mesh onClick={() => setShowHelp(true, activeAlgorithmId)}>
          <boxGeometry args={[1.7, 0.22, 0.08]} />
          <meshStandardMaterial color="#1e293b" emissive="#38bdf8" emissiveIntensity={0.08} />
        </mesh>
        <Text position={[0, 0, 0.055]} fontSize={0.13} color="#e0f2fe" anchorX="center" anchorY="middle" onClick={() => setShowHelp(true, activeAlgorithmId)}>说明</Text>
      </group>
    </group>
  );
}

type SortingFacilityProps = {
  array: number[] | null;
  highlights: number[];
  activeAlgorithmId: string;
  description: string;
};

function PostalParcelLabel({ index, value, active }: { index: number; value: number; active: boolean }) {
  return (
    <Billboard position={[0, 0.86, 0]} follow>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.25, 0.42]} />
        <meshBasicMaterial color={active ? '#431407' : '#111827'} transparent opacity={active ? 0.9 : 0.72} depthWrite={false} />
      </mesh>
      <Text position={[0, 0.1, 0]} fontSize={0.105} color="#f8fafc" anchorX="center" outlineWidth={0.004} outlineColor="#020617">{`index ${index}`}</Text>
      <Text position={[0, -0.09, 0]} fontSize={0.12} color={active ? '#fed7aa' : '#cbd5e1'} anchorX="center" outlineWidth={0.004} outlineColor="#020617">{`value ${value}`}</Text>
    </Billboard>
  );
}

function PostalSwapConveyor({ array, highlights }: SortingFacilityProps) {
  const values = array?.slice(0, 8) ?? [42, 17, 63, 8, 31, 55, 24, 70];
  const scannerX = -5.25 + (Math.max(0, highlights[0] ?? 0) * 10.5) / Math.max(1, values.length - 1);
  return (
    <group position={[0, 0, 2]}>
      <mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[13.8, 0.16, 1.9]} /><meshStandardMaterial color="#3b3b3f" roughness={0.7} metalness={0.25} /></mesh>
      <mesh position={[0, 0.76, 0]}><boxGeometry args={[13.4, 0.07, 1.55]} /><meshStandardMaterial color="#242424" roughness={0.58} /></mesh>
      {values.map((val, i) => {
        const x = -5.25 + (i * 10.5) / Math.max(1, values.length - 1);
        const active = highlights.includes(i);
        return (
          <group key={`swap-parcel-${i}`} position={[x, 0.78 + (active ? 0.12 : 0), 0]}>
            <mesh castShadow><boxGeometry args={[0.68, 0.38 + Math.min(0.55, val / 120), 0.7]} /><meshStandardMaterial color={active ? '#f97316' : '#8b6914'} emissive={active ? '#f97316' : '#000'} emissiveIntensity={active ? 0.35 : 0} roughness={0.6} /></mesh>
            <PostalParcelLabel index={i} value={val} active={active} />
          </group>
        );
      })}
      <group position={[scannerX, 1.75, 0]}>
        <mesh><boxGeometry args={[1.0, 0.12, 2.25]} /><meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.28} /></mesh>
        <Text position={[0, 0.28, 0.95]} fontSize={0.14} color="#fed7aa" anchorX="center" outlineWidth={0.004} outlineColor="#111827">swap crane</Text>
      </group>
    </group>
  );
}

function SelectionInspectionBay({ array, highlights }: SortingFacilityProps) {
  const values = array?.slice(0, 8) ?? [42, 17, 63, 8, 31, 55, 24, 70];
  const minIndex = values.reduce((best, val, i) => val < values[best] ? i : best, 0);
  return (
    <group position={[0, 0, 2]}>
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[14, 0.12, 4.4]} /><meshStandardMaterial color="#26312b" roughness={0.86} /></mesh>
      {values.map((val, i) => {
        const x = -5.5 + (i * 11) / Math.max(1, values.length - 1);
        const active = highlights.includes(i) || i === minIndex;
        return (
          <group key={`selection-parcel-${i}`} position={[x, 0.35, 0]}>
            <mesh castShadow><boxGeometry args={[0.74, 0.42 + val / 160, 0.74]} /><meshStandardMaterial color={i === minIndex ? '#22c55e' : active ? '#facc15' : '#7c5f39'} emissive={active ? '#22c55e' : '#000'} emissiveIntensity={active ? 0.28 : 0} /></mesh>
            <PostalParcelLabel index={i} value={val} active={active} />
          </group>
        );
      })}
      <group position={[-5.5 + (minIndex * 11) / Math.max(1, values.length - 1), 2.4, -0.1]}>
        <mesh><cylinderGeometry args={[0.06, 0.08, 2.7, 8]} /><meshStandardMaterial color="#334155" /></mesh>
        <mesh position={[0, -1.25, 0]}><coneGeometry args={[0.32, 0.62, 12]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.18} /></mesh>
        <Text position={[0, 0.4, 0.55]} fontSize={0.14} color="#bbf7d0" anchorX="center" outlineWidth={0.004} outlineColor="#111827">min inspector</Text>
      </group>
    </group>
  );
}

function InsertionMailSlotWall({ array, highlights }: SortingFacilityProps) {
  const values = array?.slice(0, 8) ?? [42, 17, 63, 8, 31, 55, 24, 70];
  const activeIndex = Math.max(0, Math.min(values.length - 1, highlights[0] ?? 0));
  return (
    <group position={[0, 0, 2]}>
      <mesh position={[0, 1.8, -0.9]} castShadow><boxGeometry args={[13.5, 3.2, 0.35]} /><meshStandardMaterial color="#274156" roughness={0.7} /></mesh>
      {values.map((val, i) => {
        const x = -5.4 + (i * 10.8) / Math.max(1, values.length - 1);
        const active = i === activeIndex || highlights.includes(i);
        return (
          <group key={`slot-${i}`} position={[x, 0, -0.65]}>
            <mesh position={[0, 1.7, 0.22]}><boxGeometry args={[1.02, 0.48, 0.16]} /><meshStandardMaterial color={active ? '#38bdf8' : '#172554'} emissive={active ? '#38bdf8' : '#000'} emissiveIntensity={active ? 0.25 : 0.02} /></mesh>
            <mesh position={[0, 0.55 + (active ? 0.32 : 0), 1.0]} castShadow><boxGeometry args={[0.66, 0.36 + val / 180, 0.62]} /><meshStandardMaterial color={active ? '#38bdf8' : '#8b6914'} roughness={0.62} /></mesh>
            <PostalParcelLabel index={i} value={val} active={active} />
          </group>
        );
      })}
      <mesh position={[-5.4 + (activeIndex * 10.8) / Math.max(1, values.length - 1), 0.42, 1.65]}><boxGeometry args={[1.1, 0.06, 1.2]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.3} /></mesh>
      <Text position={[0, 3.65, -0.62]} fontSize={0.22} color="#bae6fd" anchorX="center" outlineWidth={0.006} outlineColor="#020617">sorted mail slots</Text>
    </group>
  );
}

function MergeParcelConsolidationDock({ array, highlights }: SortingFacilityProps) {
  const values = array?.slice(0, 8) ?? [8, 17, 31, 42, 24, 55, 63, 70];
  const laneSize = Math.ceil(values.length / 2);
  return (
    <group position={[0, 0, 2]}>
      {[-1.15, 1.15].map((z, lane) => <mesh key={`merge-lane-${lane}`} position={[-2.4, 0.62, z]}><boxGeometry args={[7.2, 0.12, 0.82]} /><meshStandardMaterial color="#34333f" roughness={0.68} metalness={0.22} /></mesh>)}
      <mesh position={[4.0, 0.64, 0]}><boxGeometry args={[6.2, 0.12, 1.15]} /><meshStandardMaterial color="#3f3652" roughness={0.68} metalness={0.22} /></mesh>
      {values.map((val, i) => {
        const lane = i < laneSize ? -1.15 : 1.15;
        const local = i % laneSize;
        const x = -5.3 + local * 1.65 + (i >= laneSize ? 0.6 : 0);
        const active = highlights.includes(i);
        return (
          <group key={`merge-parcel-${i}`} position={[active ? x + 2.2 : x, 0.8, active ? 0 : lane]}>
            <mesh castShadow><boxGeometry args={[0.58, 0.34 + val / 190, 0.58]} /><meshStandardMaterial color={active ? '#a78bfa' : '#8b6914'} emissive={active ? '#a78bfa' : '#000'} emissiveIntensity={active ? 0.25 : 0} /></mesh>
            <PostalParcelLabel index={i} value={val} active={active} />
          </group>
        );
      })}
      <group position={[1.2, 1.55, 0]} rotation={[0, 0.6, 0]}>
        <mesh><boxGeometry args={[2.2, 0.1, 0.12]} /><meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.24} /></mesh>
        <Text position={[0, 0.28, 0]} fontSize={0.13} color="#ede9fe" anchorX="center" outlineWidth={0.004} outlineColor="#111827">merge gate</Text>
      </group>
    </group>
  );
}

function CountingPostalSiloLine({ array, highlights }: SortingFacilityProps) {
  const values = array?.slice(0, 8) ?? [42, 17, 63, 8, 31, 55, 24, 70];
  const buckets = [0, 1, 2, 3].map(bucket => values.filter(v => Math.floor(v / 25) === bucket).length);
  return (
    <group position={[0, 0, 2]}>
      {buckets.map((count, bucket) => {
        const x = -5.4 + bucket * 3.6;
        const active = highlights.some(i => Math.floor((values[i] ?? 0) / 25) === bucket);
        return (
          <group key={`count-silo-${bucket}`} position={[x, 0, 0]}>
            <mesh position={[0, 0.95 + count * 0.22, 0]} castShadow><cylinderGeometry args={[0.72, 0.84, 1.9 + count * 0.44, 16]} /><meshStandardMaterial color={active ? '#facc15' : '#475569'} emissive={active ? '#facc15' : '#000'} emissiveIntensity={active ? 0.22 : 0} roughness={0.58} metalness={0.18} /></mesh>
            <Text position={[0, 2.45 + count * 0.44, 0.72]} fontSize={0.18} color="#fef3c7" anchorX="center" outlineWidth={0.005} outlineColor="#111827">{`bucket ${bucket}`}</Text>
            <Text position={[0, 2.18 + count * 0.44, 0.72]} fontSize={0.14} color="#fde68a" anchorX="center" outlineWidth={0.004} outlineColor="#111827">{`count ${count}`}</Text>
          </group>
        );
      })}
      {values.map((val, i) => {
        const bucket = Math.max(0, Math.min(3, Math.floor(val / 25)));
        const active = highlights.includes(i);
        return (
          <group key={`count-parcel-${i}`} position={[-5.4 + bucket * 3.6 + (i % 2) * 0.42 - 0.2, 0.45 + Math.floor(i / 4) * 0.38, 1.8]}>
            <mesh><boxGeometry args={[0.38, 0.28, 0.38]} /><meshStandardMaterial color={active ? '#facc15' : '#8b6914'} /></mesh>
            <PostalParcelLabel index={i} value={val} active={active} />
          </group>
        );
      })}
    </group>
  );
}

function SortingFacilityStage(props: SortingFacilityProps) {
  if (props.activeAlgorithmId === 'selection-sort') return <SelectionInspectionBay {...props} />;
  if (props.activeAlgorithmId === 'insertion-sort') return <InsertionMailSlotWall {...props} />;
  if (props.activeAlgorithmId === 'merge-sort') return <MergeParcelConsolidationDock {...props} />;
  if (props.activeAlgorithmId === 'non-compare-sort') return <CountingPostalSiloLine {...props} />;
  return <PostalSwapConveyor {...props} />;
}

function SortingDistrict({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const activeSnapshot = optimizedSnapshot ?? naiveSnapshot;
  const highlights = activeSnapshot?.highlights ?? [];
  const description = activeSnapshot?.description ?? allTemplates.find(t => t.id === activeAlgorithmId)?.name ?? '';
  const array = useMemo(() => {
    const raw = (activeSnapshot?.data as Record<string, unknown> | undefined)?.array;
    if (!Array.isArray(raw)) return null;
    const arr = raw.map(Number);
    return arr.every(Number.isFinite) ? arr : null;
  }, [activeSnapshot]);
  const facility = SORTING_FACILITY_CONFIG[activeAlgorithmId] ?? SORTING_FACILITY_CONFIG['bubble-vs-quick'];

  return (
    <group position={[-32, 0, -18]}>
      {/* Factory floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[22, 18]} />
        <meshStandardMaterial color="#2a2a2e" roughness={0.92} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      {/* Concrete border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[10.8, 11.2, 64]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.88} polygonOffset polygonOffsetFactor={-1} />
      </mesh>

      {/* Main warehouse building */}
      <group position={[0, 0, -4]}>
        <mesh position={[0, 2.2, 0]} castShadow>
          <boxGeometry args={[16, 4.4, 6]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.48, 0]}>
          <boxGeometry args={[16.2, 0.15, 6.2]} />
          <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
        </mesh>
        {/* Loading dock doors */}
        {[-5, -1.5, 2, 5.5].map((x, i) => (
          <group key={`door-${i}`} position={[x, 1.1, 3.01]}>
            <mesh>
              <boxGeometry args={[2.2, 2.2, 0.1]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.12, 0.06]}>
              <boxGeometry args={[2, 0.08, 0.08]} />
              <meshStandardMaterial color="#8a7a6a" />
            </mesh>
          </group>
        ))}
        {/* Roof sign */}
        <group position={[0, 4.8, 3.1]}>
          <mesh>
            <boxGeometry args={[8, 0.8, 0.15]} />
            <meshStandardMaterial color="#0f172a" emissive="#f97316" emissiveIntensity={0.15} roughness={0.4} />
          </mesh>
          <Text position={[0, 0, 0.1]} fontSize={0.45} color="#fed7aa" anchorX="center" outlineWidth={0.012} outlineColor="#1a0a00">
            {facility.title}
          </Text>
        </group>
      </group>

      <SortingFacilityStage array={array} highlights={highlights} activeAlgorithmId={activeAlgorithmId} description={description} />

      {/* Sorting bins */}
      {[
        { x: -5, z: 6, label: '东区', color: '#dc2626' },
        { x: -1.5, z: 6, label: '西区', color: '#2563eb' },
        { x: 2, z: 6, label: '南区', color: '#16a34a' },
        { x: 5.5, z: 6, label: '北区', color: '#ca8a04' },
      ].map((bin, i) => (
        <group key={`bin-${i}`} position={[bin.x, 0, bin.z]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[2.2, 1, 1.8]} />
            <meshStandardMaterial color={bin.color} roughness={0.65} metalness={0.15} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[2.3, 0.08, 1.9]} />
            <meshStandardMaterial color="#ddd" roughness={0.5} />
          </mesh>
          <Text position={[0, 1.2, 0.96]} fontSize={0.28} color="#fff" anchorX="center" outlineWidth={0.008} outlineColor="#111">
            {bin.label}
          </Text>
        </group>
      ))}

      {/* Status billboard */}
      <group position={[-8, 2.5, -2]} rotation={[0, Math.PI / 6, 0]}>
        <mesh>
          <boxGeometry args={[5.5, 2.4, 0.12]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#f97316" emissiveIntensity={0.06} roughness={0.4} />
        </mesh>
        <Text position={[0, 0.75, 0.08]} fontSize={0.28} color="#fed7aa" anchorX="center" outlineWidth={0.008} outlineColor="#111">
          {facility.title}
        </Text>
        <Text position={[-2.3, 0.2, 0.08]} fontSize={0.18} color="#e2e8f0" anchorX="left" maxWidth={4.8}>
          算法: {activeAlgorithmId || '-'}
        </Text>
        <Text position={[-2.3, -0.15, 0.08]} fontSize={0.16} color="#cbd5e1" anchorX="left" maxWidth={4.8}>
          {description || facility.task}
        </Text>
        <Text position={[-2.3, -0.5, 0.08]} fontSize={0.15} color="#fbbf24" anchorX="left" maxWidth={4.8}>
          高亮: {highlights.length > 0 ? highlights.join(', ') : '-'}
        </Text>
      </group>

      {/* Explanation panel + zoom icon */}
      <group position={[0, 0.1, 8.5]}>
        <mesh>
          <boxGeometry args={[10, 0.14, 0.6]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#f97316" emissiveIntensity={0.08} roughness={0.45} />
        </mesh>
        <Text position={[0, 0.28, 0.04]} fontSize={0.38} color="#fed7aa" anchorX="center" outlineWidth={0.012} outlineColor="#1a0a00">
          排序分拣 · 朴素 vs 优化
        </Text>
        <Text position={[0, 0.62, 0.04]} fontSize={0.32} color="#e0f2fe" anchorX="center" outlineWidth={0.012} outlineColor="#020617" maxWidth={9.2}>
          包裹按目的地分拣 = 排序过程
        </Text>
        <Html position={[5.3, 0.35, 0]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}>
          <div
            onClick={() => setShowHelp(true, SORT_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'bubble-vs-quick')}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(249,115,22,0.85)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, color: '#fff',
              boxShadow: '0 0 12px rgba(249,115,22,0.6)',
              userSelect: 'none',
            }}
          >
            🔍
          </div>
        </Html>
      </group>

      {/* Street lamps */}
      {[[-10, -8], [10, -8], [-10, 8], [10, 8]].map(([x, z], i) => (
        <group key={`lamp-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.04, 0.06, 3, 6]} /><meshStandardMaterial color="#444" /></mesh>
          <mesh position={[0, 3.05, 0]}><sphereGeometry args={[0.08, 8, 6]} /><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.7} /></mesh>
        </group>
      ))}

      {/* Fencing */}
      {[[-11, 0], [11, 0]].map(([x, z], i) => (
        <mesh key={`fence-${i}`} position={[x, 0.4, z]}>
          <boxGeometry args={[0.08, 0.8, 18]} />
          <meshStandardMaterial color="#6b5b4b" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ======= SEARCH LIBRARY DISTRICT ======= */

/* Glowing range bracket that slides to target index */
function AnimatedBracket({ x, label, color }: { x: number; label: string; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.position.x += (x - g.position.x) * 0.07;
  });
  return (
    <group ref={groupRef} position={[x, 1.83, 0.15]}>
      <mesh>
        <boxGeometry args={[0.04, 0.8, 0.7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.7} />
      </mesh>
      <Text position={[0, 0.52, 0.35]} fontSize={0.13} color={color === '#3b82f6' ? '#60a5fa' : '#fbbf24'} anchorX="center">{label}</Text>
    </group>
  );
}

/* Librarian character — always mounted, walks to target when active, idles otherwise */
const LibrarianMemo = memo(function Librarian({ targetX, bookH, active }: { targetX: number; bookH: number; active: boolean }) {
  const gRef = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const heldBookRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const speed = usePlaybackStore(s => s.speed);
  useEffect(() => {
    if (gRef.current) gRef.current.position.set(targetX, 0, 1.5);
  }, []);
  useFrame((_, dt) => {
    t.current += dt;
    const g = gRef.current;
    if (!g) return;
    if (!active) {
      g.position.y *= 0.9;
      if (armRef.current) {
        armRef.current.position.z = 0.15;
        armRef.current.rotation.x = 0;
      }
      return;
    }
    const dx = targetX - g.position.x;
    const lerpRate = Math.min(1, 5 * dt * speed);
    const step = dx * lerpRate;
    const moving = Math.abs(dx) > 0.04;
    if (moving) {
      g.position.x += step;
      g.position.y = 0.06 * Math.sin(t.current * 5 * speed);
    } else {
      g.position.y *= 0.9;
    }
    const arrived = !moving;
    if (armRef.current) {
      if (arrived) {
        const r = 0.08 + 0.06 * Math.sin(t.current * 2.5 * speed);
        armRef.current.position.z = 0.3 + Math.max(0, r);
        armRef.current.rotation.x = -0.4 - 0.2 * Math.max(0, r) / 0.14;
      } else {
        armRef.current.position.z = 0.15;
        armRef.current.rotation.x = 0.15 * Math.sin(t.current * 5 * speed);
      }
    }
    if (heldBookRef.current) {
      heldBookRef.current.position.z = 0.38 + (arrived ? 0.08 * Math.sin(t.current * 2.5 * speed) : 0);
    }
  });
  return (
    <group ref={gRef}>
      <mesh position={[-0.1, 0.25, 0]}><boxGeometry args={[0.07, 0.5, 0.07]} /><meshStandardMaterial color="#1e3a5f" /></mesh>
      <mesh position={[0.1, 0.25, 0]}><boxGeometry args={[0.07, 0.5, 0.07]} /><meshStandardMaterial color="#1e3a5f" /></mesh>
      <mesh position={[0, 0.72, 0]}><boxGeometry args={[0.3, 0.44, 0.18]} /><meshStandardMaterial color="#1e40af" roughness={0.6} /></mesh>
      <mesh position={[0, 1.0, 0]}><sphereGeometry args={[0.13, 8, 8]} /><meshStandardMaterial color="#fcd34d" roughness={0.7} /></mesh>
      <mesh position={[0.16, 0.72, 0]}>
        <planeGeometry args={[0.08, 0.04]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <group ref={armRef} position={[0, 0.72, 0.15]}>
        <mesh position={[0.18, -0.05, 0]}><boxGeometry args={[0.035, 0.28, 0.035]} /><meshStandardMaterial color="#fcd34d" /></mesh>
        <mesh position={[-0.18, -0.05, 0]}><boxGeometry args={[0.035, 0.28, 0.035]} /><meshStandardMaterial color="#fcd34d" /></mesh>
        <mesh ref={heldBookRef} position={[0, -0.18, 0.22]}>
          <boxGeometry args={[0.18, bookH * 1.2, 0.06]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
});

/* Animated book with smooth slide-in/slide-out */
function SearchBook({ x, val, hue, bookH, bookW, baseY, isActive, isEliminated, isHighlighted }: {
  x: number; val: number; hue: number; bookH: number; bookW: number;
  baseY: number; isActive: boolean; isEliminated: boolean; isHighlighted: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = meshRef.current;
    if (!m) return;
    const tz = isActive ? 0.9 : isEliminated ? 0.15 : 0.5;
    const ty = baseY + bookH / 2 + (isActive ? 0.25 : 0);
    m.position.z += (tz - m.position.z) * 0.07;
    m.position.y += (ty - m.position.y) * 0.07;
    const label = labelRef.current;
    if (label) {
      label.position.z = m.position.z;
      label.position.y = m.position.y + bookH / 2 + 0.06;
    }
  });
  return (
    <group>
      <mesh ref={meshRef} position={[x, baseY + bookH / 2, 0.5]} castShadow>
        <boxGeometry args={[Math.max(0.2, bookW), bookH, 0.55]} />
        <meshStandardMaterial
          color={`hsl(${hue}, 55%, ${isHighlighted ? 52 : 36}%)`}
          emissive={isHighlighted ? '#fbbf24' : '#000'}
          emissiveIntensity={isHighlighted ? 0.6 : 0}
          roughness={0.5}
        />
      </mesh>
      <Text ref={labelRef} position={[x, baseY + bookH + 0.06, 0.5]}
        fontSize={Math.min(0.16, 12 / 9 * 0.09)} color={isHighlighted ? '#fbbf24' : '#eee'} anchorX="center">
        {val}
      </Text>
    </group>
  );
}

function ArchiveDrawer({ x, val, index, drawerW, isActive, isEliminated, isHighlighted }: {
  x: number;
  val: number;
  index: number;
  drawerW: number;
  isActive: boolean;
  isEliminated: boolean;
  isHighlighted: boolean;
}) {
  const drawer = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!drawer.current) return;
    const targetZ = isActive ? 0.82 : isEliminated ? -0.16 : 0.16;
    const targetY = isActive ? 1.76 : 1.58;
    drawer.current.position.z += (targetZ - drawer.current.position.z) * 0.08;
    drawer.current.position.y += (targetY - drawer.current.position.y) * 0.08;
  });
  const face = isActive ? '#f59e0b' : isHighlighted ? '#fbbf24' : isEliminated ? '#28313b' : '#475569';
  const rail = isActive ? '#fde68a' : isEliminated ? '#334155' : '#94a3b8';
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.54, -0.06]} castShadow>
        <boxGeometry args={[Math.max(0.36, drawerW), 1.25, 0.88]} />
        <meshStandardMaterial color={isEliminated ? '#1f2933' : '#26323d'} roughness={0.78} metalness={0.18} />
      </mesh>
      {[1.1, 1.54, 1.98].map(y => (
        <mesh key={`archive-slot-${index}-${y}`} position={[0, y, 0.42]}>
          <boxGeometry args={[Math.max(0.28, drawerW * 0.82), 0.045, 0.08]} />
          <meshStandardMaterial color={rail} emissive={isActive ? '#f59e0b' : '#000'} emissiveIntensity={isActive ? 0.16 : 0} roughness={0.55} />
        </mesh>
      ))}
      <group ref={drawer} position={[0, 1.58, isActive ? 0.82 : 0.16]}>
        <mesh castShadow>
          <boxGeometry args={[Math.max(0.3, drawerW * 0.72), 0.34, 0.62]} />
          <meshStandardMaterial
            color={face}
            emissive={isActive ? '#f59e0b' : isHighlighted ? '#fbbf24' : '#000'}
            emissiveIntensity={isActive ? 0.38 : isHighlighted ? 0.22 : 0}
            roughness={0.56}
            metalness={0.16}
          />
        </mesh>
        <mesh position={[0, 0, 0.34]}>
          <boxGeometry args={[Math.max(0.22, drawerW * 0.48), 0.08, 0.05]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <Text position={[0, 0.2, 0.36]} fontSize={0.1} color="#f8fafc" anchorX="center" outlineWidth={0.004} outlineColor="#020617">
          {`idx ${index}`}
        </Text>
        <Text position={[0, -0.04, 0.36]} fontSize={0.15} color={isActive ? '#111827' : '#e5e7eb'} anchorX="center" outlineWidth={isActive ? 0 : 0.004} outlineColor="#020617">
          {val}
        </Text>
      </group>
      {isEliminated && (
        <mesh position={[0, 2.28, 0.38]}>
          <boxGeometry args={[Math.max(0.32, drawerW * 0.8), 0.06, 0.08]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.55} />
        </mesh>
      )}
    </group>
  );
}

type SearchFacilityProps = {
  array: number[] | null;
  highlights: number[];
  pointers: Record<string, unknown>;
  target?: number;
  activeAlgorithmId: string;
};

function SearchValueTag({ index, value, active }: { index: number; value: number; active: boolean }) {
  return (
    <Billboard position={[0, 0.72, 0]} follow>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.28, 0.42]} />
        <meshBasicMaterial color={active ? '#422006' : '#111827'} transparent opacity={active ? 0.9 : 0.72} depthWrite={false} />
      </mesh>
      <Text position={[0, 0.1, 0]} fontSize={0.105} color="#f8fafc" anchorX="center" outlineWidth={0.004} outlineColor="#020617">{`index ${index}`}</Text>
      <Text position={[0, -0.09, 0]} fontSize={0.12} color={active ? '#fde68a' : '#cbd5e1'} anchorX="center" outlineWidth={0.004} outlineColor="#020617">{`value ${value}`}</Text>
    </Billboard>
  );
}

function RangeSearchArchiveHall({ array, highlights, pointers, target }: SearchFacilityProps) {
  const values = array?.slice(0, 10) ?? [3, 9, 13, 17, 21, 25, 33, 41, 55, 67];
  const left = Number((pointers as any).left ?? 0);
  const right = Number((pointers as any).right ?? values.length - 1);
  const mid = Number((pointers as any).mid ?? highlights[0] ?? Math.floor(values.length / 2));
  return (
    <group position={[0, 0, 2.35]}>
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[13.5, 0.08, 1.1]} /><meshStandardMaterial color="#1f2937" roughness={0.82} /></mesh>
      {values.map((val, i) => {
        const x = -5.9 + (i * 11.8) / Math.max(1, values.length - 1);
        const active = i === mid || highlights.includes(i);
        const outside = i < left || i > right;
        return (
          <group key={`range-card-${i}`} position={[x, 0.45, 0]}>
            <mesh castShadow><boxGeometry args={[0.55, 0.6, 0.5]} /><meshStandardMaterial color={outside ? '#334155' : active ? '#f59e0b' : '#64748b'} emissive={active ? '#f59e0b' : '#000'} emissiveIntensity={active ? 0.25 : 0} /></mesh>
            <SearchValueTag index={i} value={val} active={active} />
          </group>
        );
      })}
      <Text position={[0, 1.7, 0]} fontSize={0.16} color="#fde68a" anchorX="center" outlineWidth={0.005} outlineColor="#111827">{`target ${target ?? '-'}`}</Text>
    </group>
  );
}

function TwoSumEvidenceDesk({ array, highlights, target }: SearchFacilityProps) {
  const values = array?.slice(0, 8) ?? [2, 7, 11, 15, 1, 8, 5, 4];
  const activeSet = new Set(highlights);
  return (
    <group position={[0, 0, 2.35]}>
      <mesh position={[0, 0.72, 0]} castShadow><boxGeometry args={[12.8, 0.16, 2.4]} /><meshStandardMaterial color="#283531" roughness={0.7} metalness={0.1} /></mesh>
      {values.map((val, i) => {
        const x = -5.5 + (i * 11) / Math.max(1, values.length - 1);
        const active = activeSet.has(i);
        return (
          <group key={`evidence-${i}`} position={[x, 0.9 + (active ? 0.18 : 0), 0]}>
            <mesh castShadow><boxGeometry args={[0.72, 0.44, 0.58]} /><meshStandardMaterial color={active ? '#22c55e' : '#475569'} emissive={active ? '#22c55e' : '#000'} emissiveIntensity={active ? 0.24 : 0} roughness={0.58} /></mesh>
            <SearchValueTag index={i} value={val} active={active} />
            <Text position={[0, -0.52, 0.36]} fontSize={0.11} color="#bbf7d0" anchorX="center" outlineWidth={0.004} outlineColor="#111827">{`need ${(target ?? 0) - val}`}</Text>
          </group>
        );
      })}
      {highlights.length >= 2 && (
        <mesh position={[0, 1.55, 0]}><boxGeometry args={[11, 0.05, 0.08]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.28} /></mesh>
      )}
      <Text position={[0, 2.1, 0]} fontSize={0.17} color="#bbf7d0" anchorX="center" outlineWidth={0.005} outlineColor="#111827">{`target ${target ?? '-'}`}</Text>
    </group>
  );
}

function RotatedCarouselArchive({ array, highlights, pointers, target }: SearchFacilityProps) {
  const values = array?.slice(0, 9) ?? [33, 41, 55, 67, 3, 9, 13, 17, 21];
  const mid = Number((pointers as any).mid ?? highlights[0] ?? 0);
  return (
    <group position={[0, 0, 2.35]}>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.6, 5.2, 32]} /><meshStandardMaterial color="#1f3b4a" roughness={0.78} /></mesh>
      {values.map((val, i) => {
        const angle = (i / values.length) * Math.PI * 2 + Math.PI * 0.18;
        const x = Math.cos(angle) * 4;
        const z = Math.sin(angle) * 2.1;
        const active = i === mid || highlights.includes(i);
        return (
          <group key={`rotated-shelf-${i}`} position={[x, 0.75 + (active ? 0.16 : 0), z]} rotation={[0, -angle, 0]}>
            <mesh castShadow><boxGeometry args={[0.72, 0.7, 0.45]} /><meshStandardMaterial color={active ? '#38bdf8' : '#475569'} emissive={active ? '#38bdf8' : '#000'} emissiveIntensity={active ? 0.25 : 0} /></mesh>
            <SearchValueTag index={i} value={val} active={active} />
          </group>
        );
      })}
      <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.18, 0.24, 2.0, 12]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.18} /></mesh>
      <Text position={[0, 2.32, 0]} fontSize={0.16} color="#bae6fd" anchorX="center" outlineWidth={0.005} outlineColor="#111827">{`target ${target ?? '-'} / pivot seam`}</Text>
    </group>
  );
}

function PeakTerrainProfileStation({ array, highlights, pointers, target }: SearchFacilityProps) {
  const values = array?.slice(0, 9) ?? [2, 5, 9, 14, 12, 8, 6, 3, 1];
  const mid = Number((pointers as any).mid ?? highlights[0] ?? values.indexOf(Math.max(...values)));
  return (
    <group position={[0, 0, 2.35]}>
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[13, 0.08, 1.4]} /><meshStandardMaterial color="#2f2933" roughness={0.82} /></mesh>
      {values.map((val, i) => {
        const x = -5.7 + (i * 11.4) / Math.max(1, values.length - 1);
        const h = 0.35 + val / Math.max(...values) * 2.2;
        const active = i === mid || highlights.includes(i);
        return (
          <group key={`peak-profile-${i}`} position={[x, 0, 0]}>
            <mesh position={[0, h / 2, 0]} castShadow><boxGeometry args={[0.72, h, 0.66]} /><meshStandardMaterial color={active ? '#fb7185' : '#6b7280'} emissive={active ? '#fb7185' : '#000'} emissiveIntensity={active ? 0.24 : 0} /></mesh>
            <SearchValueTag index={i} value={val} active={active} />
          </group>
        );
      })}
      <group position={[-5.7 + (mid * 11.4) / Math.max(1, values.length - 1), 3.1, 0]}>
        <mesh><boxGeometry args={[0.9, 0.12, 0.28]} /><meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.28} /></mesh>
        <Text position={[0, 0.32, 0]} fontSize={0.13} color="#fecdd3" anchorX="center" outlineWidth={0.004} outlineColor="#111827">peak probe</Text>
      </group>
      <Text position={[0, 3.55, 0]} fontSize={0.15} color="#fecdd3" anchorX="center" outlineWidth={0.005} outlineColor="#111827">{`target ${target ?? 'max slope'}`}</Text>
    </group>
  );
}

function SearchFacilityStage(props: SearchFacilityProps) {
  if (props.activeAlgorithmId === 'two-sum') return <TwoSumEvidenceDesk {...props} />;
  if (props.activeAlgorithmId === 'rotated-array') return <RotatedCarouselArchive {...props} />;
  if (props.activeAlgorithmId === 'peak') return <PeakTerrainProfileStation {...props} />;
  return <RangeSearchArchiveHall {...props} />;
}



function SearchLibraryDistrict({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const activeSnapshot = optimizedSnapshot ?? naiveSnapshot;
  const highlights = activeSnapshot?.highlights ?? [];
  const pointers = activeSnapshot?.pointers ?? {};
  const description = activeSnapshot?.description ?? allTemplates.find(t => t.id === activeAlgorithmId)?.name ?? '';

  const array = useMemo(() => {
    const raw = (activeSnapshot?.data as Record<string, unknown> | undefined)?.array;
    if (!Array.isArray(raw)) return null;
    const arr = raw.map(Number);
    if (!arr.every(Number.isFinite)) return null;
    return arr;
  }, [activeSnapshot]);
  const hasData = activeSnapshot !== null && activeSnapshot !== undefined;
  const displayArray = array || (!hasData ? [3, 9, 13, 17, 21, 25, 33, 41, 55, 67] : null);

  const target = (activeSnapshot?.data as Record<string, unknown> | undefined)?.target as number | undefined;
  const facility = SEARCH_FACILITY_CONFIG[activeAlgorithmId] ?? SEARCH_FACILITY_CONFIG['linear-binary'];
  const left = 'left' in pointers ? (pointers as any).left : undefined;
  const right = 'right' in pointers ? (pointers as any).right : undefined;
  const mid = 'mid' in pointers ? (pointers as any).mid : undefined;
  const idx = 'i' in pointers ? (pointers as any).i : undefined;

  const bookPositions = useMemo(() => {
    if (!displayArray) return [];
    const minV = Math.min(...displayArray);
    const maxV = Math.max(...displayArray);
    const step = 12 / Math.max(1, displayArray.length - 1);
    return displayArray.map((val, i) => {
      const normVal = (maxV > minV) ? (val - minV) / (maxV - minV) : 0.5;
      return {
        x: -6 + i * step, val,
        h: 200 - Math.max(0, Math.min(1, normVal)) * 120,
        bookH: Math.max(0.25, 0.2 + normVal * 0.3),
        bookW: Math.min(0.7, step * 0.7),
      };
    });
  }, [displayArray]);

  const i2x = (i: number) => (bookPositions[i]?.x ?? 0);
  const activeIdx = (mid ?? idx) as number | undefined;
  const hasBothLR = left !== undefined && right !== undefined && left <= right;
  const baseY = 1.66;
  const lastTX = useRef(bookPositions[0]?.x ?? 0);
  const lastBH = useRef(bookPositions[0]?.bookH ?? 0.3);
  if (activeIdx !== undefined && activeIdx >= 0 && activeIdx < bookPositions.length) {
    lastTX.current = bookPositions[activeIdx].x;
    lastBH.current = bookPositions[activeIdx].bookH;
  }

  return (
    <group position={[0, 0, -35]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#29343d" roughness={0.9} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 2.5, -6]} castShadow>
        <boxGeometry args={[18, 5, 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-9, 2.5, 0]} castShadow>
        <boxGeometry args={[0.2, 5, 12]} />
        <meshStandardMaterial color="#26323b" roughness={0.85} />
      </mesh>
      <mesh position={[9, 2.5, 0]} castShadow>
        <boxGeometry args={[0.2, 5, 12]} />
        <meshStandardMaterial color="#26323b" roughness={0.85} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 5.05, 0]}>
        <boxGeometry args={[18.2, 0.15, 12.2]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      {/* Entrance pillars */}
      <mesh position={[-2, 0, 6]}><boxGeometry args={[0.2, 4.5, 0.2]} /><meshStandardMaterial color="#475569" metalness={0.25} roughness={0.55} /></mesh>
      <mesh position={[2, 0, 6]}><boxGeometry args={[0.2, 4.5, 0.2]} /><meshStandardMaterial color="#475569" metalness={0.25} roughness={0.55} /></mesh>
      {/* Sign */}
      <mesh position={[0, 4.8, 5.9]}>
        <boxGeometry args={[7, 0.5, 0.08]} />
        <meshStandardMaterial color="#0f172a" emissive="#f59e0b" emissiveIntensity={0.1} roughness={0.4} />
      </mesh>
      <Text position={[0, 4.82, 5.95]} fontSize={0.3} color="#fde68a" anchorX="center" outlineWidth={0.01} outlineColor="#1a0a00">
        {facility.title}
      </Text>

      {/* Automated compact archive */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 2, -0.4]} castShadow>
          <boxGeometry args={[13.6, 4, 0.05]} />
          <meshStandardMaterial color="#17212b" roughness={0.85} metalness={0.12} />
        </mesh>
        <mesh position={[-6.8, 2, 0]}><boxGeometry args={[0.08, 4, 0.9]} /><meshStandardMaterial color="#64748b" roughness={0.62} metalness={0.3} /></mesh>
        <mesh position={[6.8, 2, 0]}><boxGeometry args={[0.08, 4, 0.9]} /><meshStandardMaterial color="#64748b" roughness={0.62} metalness={0.3} /></mesh>
        <mesh position={[0, 3.98, 0]}><boxGeometry args={[13.8, 0.06, 0.95]} /><meshStandardMaterial color="#64748b" roughness={0.62} metalness={0.3} /></mesh>
        <mesh position={[0, 0.02, 0]}><boxGeometry args={[13.8, 0.06, 0.95]} /><meshStandardMaterial color="#64748b" roughness={0.62} metalness={0.3} /></mesh>
        {[0.6, 1.6, 2.6, 3.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0.1]}>
            <boxGeometry args={[13.4, 0.06, 0.65]} />
            <meshStandardMaterial color="#526170" roughness={0.7} metalness={0.22} />
          </mesh>
        ))}
        {[-0.5, 0.5].map(z => (
          <mesh key={`archive-floor-rail-${z}`} position={[0, 0.07, z]}>
            <boxGeometry args={[13.8, 0.05, 0.08]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.45} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 3.55, 0.74]}>
          <boxGeometry args={[13.2, 0.08, 0.08]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.22} roughness={0.48} />
        </mesh>

        {/* Animated archive drawers */}
        {bookPositions.map((p, i) => {
          const isAct = activeIdx === i;
          const isElim = hasBothLR && (i < left || i > right);
          const isHL = highlights.includes(i);
          return (
            <ArchiveDrawer key={i} x={p.x} val={p.val} index={i} drawerW={p.bookW}
              isActive={isAct} isEliminated={isElim} isHighlighted={isHL} />
          );
        })}
        {activeIdx !== undefined && activeIdx >= 0 && activeIdx < bookPositions.length && (
          <mesh position={[i2x(activeIdx), 2.55, 0.72]}>
            <boxGeometry args={[0.08, 2.45, 0.06]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
          </mesh>
        )}

        {/* Range brackets — also animated smoothly */}
        {hasBothLR && (
          <AnimatedBracket x={i2x(left)} label="L" color="#3b82f6" />
        )}
        {hasBothLR && (
          <AnimatedBracket x={i2x(right)} label="R" color="#3b82f6" />
        )}
        {left !== undefined && right === undefined && left >= 0 && left < bookPositions.length && (
          <AnimatedBracket x={i2x(left)} label="L" color="#f59e0b" />
        )}

        {/* Librarian — always mounted */}
        <LibrarianMemo targetX={lastTX.current} bookH={lastBH.current} active={activeIdx !== undefined && activeIdx >= 0 && activeIdx < bookPositions.length} />
        <Text position={[0, 4.22, 0.38]} fontSize={0.16} color="#bae6fd" anchorX="center" outlineWidth={0.006} outlineColor="#020617">
          区间外柜体关闭 · 当前抽屉自动弹出
        </Text>
      </group>

      {/* Search terminal */}
      <group position={[0, 0, 0.5]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[3.5, 0.08, 1.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.62} metalness={0.16} />
        </mesh>
        <mesh position={[-1.5, 0.22, -0.6]}><boxGeometry args={[0.05, 0.44, 0.05]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[1.5, 0.22, -0.6]}><boxGeometry args={[0.05, 0.44, 0.05]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[-1.5, 0.22, 0.6]}><boxGeometry args={[0.05, 0.44, 0.05]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[1.5, 0.22, 0.6]}><boxGeometry args={[0.05, 0.44, 0.05]} /><meshStandardMaterial color="#64748b" /></mesh>
        <mesh position={[0, 0.53, -0.12]} rotation={[-0.32, 0, 0]}>
          <boxGeometry args={[2.1, 0.06, 0.75]} />
          <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.08} roughness={0.45} />
        </mesh>

        <Text position={[0, 0.85, 0.75]} fontSize={0.22} color="#f59e0b" anchorX="center" outlineWidth={0.008} outlineColor="#111">
          {target !== undefined ? `查找: ${target}` : '就绪'}
        </Text>
        <Text position={[0, 0.62, 0.75]} fontSize={0.14} color="#e2e8f0" anchorX="center" maxWidth={3}>
          {description || `算法: ${activeAlgorithmId}`}
        </Text>
        <Text position={[0, 0.42, 0.75]} fontSize={0.13} color="#94a3b8" anchorX="center">
          {displayArray ? `n=${displayArray.length}` : ''}
          {left !== undefined ? ` L:${left}` : ''}{right !== undefined ? ` R:${right}` : ''}{mid !== undefined ? ` M:${mid}` : ''}{idx !== undefined ? ` i:${idx}` : ''}
        </Text>
      </group>

      <SearchFacilityStage
        array={displayArray}
        highlights={highlights}
        pointers={pointers}
        target={target}
        activeAlgorithmId={activeAlgorithmId}
      />

      {/* Help panel */}
      <group position={[0, 0.2, 6.8]}>
        <mesh>
          <boxGeometry args={[8, 0.1, 0.4]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#f59e0b" emissiveIntensity={0.06} roughness={0.45} />
        </mesh>
        <Text position={[-3.2, 0.18, 0.04]} fontSize={0.22} color="#fde68a" anchorX="center" outlineWidth={0.008} outlineColor="#1a0a00">
          {facility.title}
        </Text>
        <Text position={[1.8, 0.18, 0.04]} fontSize={0.14} color="#e2e8f0" anchorX="center" outlineWidth={0.005} outlineColor="#020617">
          {facility.task}
        </Text>
      </group>

      {/* Help button */}
      <Html position={[2.25, 0.72, 0.08]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}>
        <div onClick={() => setShowHelp(true, SEARCH_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'linear-binary')} style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(251,191,36,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#111827', fontWeight: 700,
          boxShadow: '0 0 14px rgba(251,191,36,0.7)', userSelect: 'none',
        }}>?</div>
      </Html>

      {/* Lamps */}
      {[[-8, 6.5], [8, 6.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.04, 0.06, 2.8, 6]} /><meshStandardMaterial color="#444" /></mesh>
          <mesh position={[0, 2.85, 0]}><sphereGeometry args={[0.07, 6]} /><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.7} /></mesh>
        </group>
      ))}
    </group>
  );
}

function UtilityLine({ from, to, active, built, weight }: {
  from: CityNodeLayout;
  to: CityNodeLayout;
  active: boolean;
  built: boolean;
  weight?: number;
}) {
  const sleeve = useRef<THREE.Mesh>(null);
  const sceneTime = useSyncedSceneTime(`${idKey(from.id)}-${idKey(to.id)}-${active}`);
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
  const angle = Math.atan2(dx, dz);
  const color = active ? '#facc15' : built ? '#86efac' : '#6b7280';
  const fromLabel = dijkstraNodeLabel(from);
  const toLabel = dijkstraNodeLabel(to);
  useFrame(() => {
    if (!sleeve.current || !active) return;
    const p = oneWayStepProgress(sceneTime.current);
    sleeve.current.position.z = -len / 2 + p * len;
  });
  return (
    <group position={[(from.x + to.x) / 2, 1.55, (from.z + to.z) / 2]} rotation={[0, angle, 0]}>
      <mesh>
        <boxGeometry args={[active ? 0.12 : 0.07, 0.07, len]} />
        <meshStandardMaterial color={color} emissive={active ? '#facc15' : '#000'} emissiveIntensity={active ? 0.45 : 0.03} roughness={0.55} />
      </mesh>
      {(active || built) && (
        <mesh position={[0, -1.48, 0]}>
          <boxGeometry args={[active ? 0.44 : 0.24, 0.035, len]} />
          <meshStandardMaterial color={active ? '#7c2d12' : '#425246'} roughness={0.9} transparent opacity={active ? 0.9 : 0.5} />
        </mesh>
      )}
      {active && (
        <>
          <mesh ref={sleeve} position={[0, -1.38, 0]} castShadow>
            <boxGeometry args={[0.72, 0.16, 0.38]} />
            <meshStandardMaterial color="#f97316" roughness={0.48} metalness={0.15} />
          </mesh>
          {[-len / 2 + 0.7, len / 2 - 0.7].map((z, i) => (
            <group key={`cone-${i}`} position={[i === 0 ? -0.42 : 0.42, -1.26, z]}>
              <mesh position={[0, 0.18, 0]}>
                <coneGeometry args={[0.16, 0.36, 8]} />
                <meshStandardMaterial color="#f97316" roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.28, 0.05, 0.28]} />
                <meshStandardMaterial color="#111827" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </>
      )}
      {typeof weight === 'number' && (
        <Billboard position={[0, active ? 0.72 : 0.43, 0]} follow>
          <mesh position={[0, 0, -0.012]}>
            <planeGeometry args={[active ? 2.34 : 1.34, active ? 0.52 : 0.34]} />
            <meshBasicMaterial color={active ? '#422006' : '#111827'} transparent opacity={active ? 0.9 : 0.72} depthWrite={false} />
          </mesh>
          <Text position={[0, active ? 0.08 : 0.02, 0]} fontSize={active ? 0.13 : 0.105} color={active ? '#fef3c7' : '#cbd5e1'} anchorX="center" outlineWidth={0.005} outlineColor="#111827" maxWidth={active ? 2.12 : 1.2}>
            {active ? `build ${fromLabel}->${toLabel}` : `${fromLabel}-${toLabel}`}
          </Text>
          <Text position={[0, active ? -0.12 : -0.1, 0]} fontSize={active ? 0.115 : 0.096} color={active ? '#fde68a' : '#fbbf24'} anchorX="center" outlineWidth={0.005} outlineColor="#111827">
            cost {weight}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

const PRIM_FACILITY_ROLES = [
  '主变电站',
  '居民配电柜',
  '商业配电房',
  '医院备用电源',
  '充电站',
  '学校配电箱',
  '泵站控制柜',
  '路灯回路',
];

const PRIM_LABEL_OFFSETS: [number, number, number][] = [
  [0, 0.12, -0.82],
  [0.7, 0.18, 0.36],
  [-0.72, 0.18, 0.42],
  [0.62, 0.12, -0.42],
  [-0.65, 0.14, -0.36],
  [0.62, 0.12, 0.44],
  [-0.64, 0.16, 0.38],
  [0.56, 0.14, -0.46],
];

function PrimFacilityTag({ node, active, root, index, pairRole }: {
  node: CityNodeLayout;
  active: boolean;
  root: boolean;
  index: number;
  pairRole: 'from' | 'to' | null;
}) {
  const offset = PRIM_LABEL_OFFSETS[index % PRIM_LABEL_OFFSETS.length];
  const label = dijkstraNodeLabel(node);
  const role = PRIM_FACILITY_ROLES[index % PRIM_FACILITY_ROLES.length];
  const state = pairRole === 'from' ? 'from / 已接入'
    : pairRole === 'to' ? 'to / 候选接入'
      : root ? 'source key=0'
        : active ? 'in MST / 已供电'
          : 'candidate / 待接入';
  const accent = pairRole ? '#facc15' : root ? '#4ade80' : active ? '#86efac' : '#94a3b8';
  return (
    <Billboard position={[node.x + offset[0], 2.45 + offset[1], node.z + offset[2]]} follow>
      <mesh position={[0, 0, -0.014]}>
        <planeGeometry args={[2.55, 0.9]} />
        <meshBasicMaterial color="#111827" transparent opacity={pairRole ? 0.92 : 0.78} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.32, -0.01]}>
        <planeGeometry args={[2.55, 0.06]} />
        <meshBasicMaterial color={accent} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <Text position={[0, 0.15, 0]} fontSize={0.15} color="#f8fafc" anchorX="center" outlineWidth={0.006} outlineColor="#020617" maxWidth={2.25}>
        {`${label} / node ${idKey(node.id)}`}
      </Text>
      <Text position={[0, -0.07, 0]} fontSize={0.12} color="#d1d5db" anchorX="center" outlineWidth={0.005} outlineColor="#020617" maxWidth={2.25}>
        {role}
      </Text>
      <Text position={[0, -0.27, 0]} fontSize={0.11} color={accent} anchorX="center" outlineWidth={0.005} outlineColor="#020617" maxWidth={2.25}>
        {state}
      </Text>
    </Billboard>
  );
}

function UtilityPole({ node, active, root, index, pairRole }: {
  node: CityNodeLayout;
  active: boolean;
  root: boolean;
  index: number;
  pairRole: 'from' | 'to' | null;
}) {
  return (
    <group position={[node.x, 0, node.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial color={pairRole ? '#facc15' : active ? '#86efac' : root ? '#4ade80' : '#94a3b8'} transparent opacity={pairRole ? 0.46 : active ? 0.34 : 0.22} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 1.5, 8]} />
        <meshStandardMaterial color="#5b4636" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <boxGeometry args={[0.85, 0.08, 0.12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color={active ? '#fef3c7' : '#d1d5db'} emissive={active ? '#facc15' : '#000'} emissiveIntensity={active ? 0.5 : 0.03} />
      </mesh>
      <Text position={[0, 1.98, 0]} fontSize={0.25} color="#e5e7eb" anchorX="center" outlineWidth={0.008} outlineColor="#111827">
        {node.label ?? String(node.id)}
      </Text>
      <Text position={[0, 0.2, 0.62]} fontSize={0.12} color={root ? '#bbf7d0' : '#d1d5db'} anchorX="center" outlineWidth={0.005} outlineColor="#111827">
        {root ? '变电站' : PRIM_FACILITY_ROLES[index % PRIM_FACILITY_ROLES.length]}
      </Text>
      <Text position={[0, 0.09, -0.68]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.2} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#020617">
        {`${dijkstraNodeLabel(node)}${idKey(node.id)}`}
      </Text>
      <PrimFacilityTag node={node} active={active} root={root} index={index} pairRole={pairRole} />
      {(active || pairRole) && <pointLight position={[0, 1.8, 0]} intensity={pairRole ? 0.7 : 0.55} distance={3.5} color="#facc15" />}
    </group>
  );
}

function PrimConstructionCrew({ snapshot, layout, graph }: { snapshot: TraceSnapshot | null; layout: CityNodeLayout[]; graph: CityGraphData }) {
  const group = useRef<THREE.Group>(null);
  const spool = useRef<THREE.Mesh>(null);
  const sceneTime = useSyncedSceneTime(`${snapshot?.timestamp ?? ''}-${snapshot?.label ?? ''}`);
  const route = useMemo(() => {
    const edge = primWorkingEdge(graph, snapshot);
    if (!edge) return null;
    const pair = activePair(snapshot);
    const fromId = pair ? pair[0] : idKey(edge.from);
    const toId = pair ? pair[1] : idKey(edge.to);
    const a = layout.find(n => idKey(n.id) === fromId);
    const b = layout.find(n => idKey(n.id) === toId);
    return a && b ? { a, b } : null;
  }, [graph, snapshot, layout]);

  useFrame(() => {
    if (spool.current) spool.current.rotation.x = sceneTime.current * 3.5;
    if (!group.current || !route) return;
    const p = oneWayStepProgress(sceneTime.current);
    const x = THREE.MathUtils.lerp(route.a.x, route.b.x, p);
    const z = THREE.MathUtils.lerp(route.a.z, route.b.z, p);
    group.current.position.set(x, 0.12, z);
    group.current.rotation.y = Math.atan2(route.b.x - route.a.x, route.b.z - route.a.z);
  });

  const parked = route ? [route.a.x, 0.12, route.a.z] : [-7.2, 0.12, 6.2];
  return (
    <group ref={group} position={parked as [number, number, number]}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.9, 0.34, 1.15]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.52} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.55, 0.28]} castShadow>
        <boxGeometry args={[0.62, 0.36, 0.42]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh ref={spool} position={[0, 0.42, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.36, 18]} />
        <meshStandardMaterial color="#7c3f19" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.31, 0.025, 8, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.65} />
      </mesh>
      {[[-0.36, 0.08, -0.36], [0.36, 0.08, -0.36], [-0.36, 0.08, 0.36], [0.36, 0.08, 0.36]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.85} />
        </mesh>
      ))}
      {[[-0.85, 0, 0.32], [0.85, 0, -0.28]].map(([x, y, z], i) => (
        <group key={`crew-${i}`} position={[x, y, z]}>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.18, 0.36, 0.12]} />
            <meshStandardMaterial color="#2563eb" roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.11, 10, 8]} />
            <meshStandardMaterial color="#facc15" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {route && <Text position={[0, 0.92, 0]} fontSize={0.13} color="#fef3c7" anchorX="center" outlineWidth={0.006} outlineColor="#111827">铺缆中</Text>}
    </group>
  );
}

function PowerRecoveryBlock({ node, energized, root, index }: { node: CityNodeLayout; energized: boolean; root: boolean; index: number }) {
  const pulse = useRef<THREE.PointLight>(null);
  const sceneTime = useSyncedSceneTime(`${idKey(node.id)}-${energized}`, true);
  useFrame(() => {
    if (!pulse.current) return;
    pulse.current.intensity = energized ? 0.35 + Math.sin(sceneTime.current * 2.2 + index) * 0.08 : 0;
  });
  const side = index % 2 === 0 ? 1 : -1;
  const blockX = node.x + side * 1.25;
  const blockZ = node.z + (index % 3 - 1) * 0.42;
  const towerHeights = root ? [1.25, 1.0, 0.82] : [0.75, 1.05, 0.62];
  return (
    <group position={[blockX, 0, blockZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}>
        <planeGeometry args={[2.15, 1.62]} />
        <meshStandardMaterial color={energized ? '#263d35' : '#1b2228'} roughness={0.94} />
      </mesh>
      {towerHeights.map((h, i) => (
        <group key={`tower-${i}`} position={[-0.7 + i * 0.7, 0, i === 1 ? 0.18 : -0.18]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[0.46, h, 0.46]} />
            <meshStandardMaterial color={energized ? '#475569' : '#1f2933'} roughness={0.78} />
          </mesh>
          {Array.from({ length: Math.max(2, Math.floor(h * 4)) }).map((_, r) => (
            <group key={`row-${r}`} position={[0, 0.25 + r * 0.22, 0.236]}>
              {[-0.12, 0.12].map((x, w) => (
                <mesh key={w} position={[x, 0, 0]}>
                  <planeGeometry args={[0.075, 0.07]} />
                  <meshBasicMaterial color={energized ? '#fde68a' : '#111827'} transparent opacity={energized ? 0.95 : 0.38} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      <group position={[0.95, 0, -0.62]}>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.025, 0.04, 1.24, 6]} />
          <meshStandardMaterial color="#374151" roughness={0.65} />
        </mesh>
        <mesh position={[0.12, 1.2, 0]}>
          <sphereGeometry args={[0.055, 8, 6]} />
          <meshStandardMaterial color={energized ? '#fff7ad' : '#334155'} emissive={energized ? '#fde68a' : '#000'} emissiveIntensity={energized ? 0.75 : 0.02} />
        </mesh>
      </group>
      <group position={[-0.95, 0, 0.62]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.08, 0.84, 0.08]} />
          <meshStandardMaterial color="#263238" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.28, 0.22, 0.08]} />
          <meshStandardMaterial color="#0f172a" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.94, 0.05]}>
          <circleGeometry args={[0.045, 10]} />
          <meshBasicMaterial color={energized ? '#22c55e' : '#ef4444'} />
        </mesh>
      </group>
      {!energized && !root && (
        <Text position={[0, 1.45, 0]} fontSize={0.11} color="#94a3b8" anchorX="center" outlineWidth={0.005} outlineColor="#0f172a">停电</Text>
      )}
      {energized && (
        <>
          <pointLight ref={pulse} position={[0, 1.4, 0]} distance={3.8} color="#fde68a" />
          <Text position={[0, 1.55, 0]} fontSize={0.11} color="#bbf7d0" anchorX="center" outlineWidth={0.005} outlineColor="#052e16">
            {root ? '电源' : '恢复'}
          </Text>
        </>
      )}
    </group>
  );
}

function RollingRecoveryWave({ snapshot, graph, layout }: { snapshot: TraceSnapshot | null; graph: CityGraphData; layout: CityNodeLayout[] }) {
  const wave = useRef<THREE.Mesh>(null);
  const sceneTime = useSyncedSceneTime(`${snapshot?.timestamp ?? ''}-${snapshot?.label ?? ''}`);
  const route = useMemo(() => {
    const edge = primWorkingEdge(graph, snapshot);
    if (!edge) return null;
    const pair = activePair(snapshot);
    const fromId = pair ? pair[0] : idKey(edge.from);
    const toId = pair ? pair[1] : idKey(edge.to);
    const a = layout.find(n => idKey(n.id) === fromId);
    const b = layout.find(n => idKey(n.id) === toId);
    return a && b ? { a, b } : null;
  }, [graph, snapshot, layout]);
  useFrame(() => {
    if (!wave.current || !route) return;
    const p = oneWayStepProgress(sceneTime.current);
    wave.current.position.set(
      THREE.MathUtils.lerp(route.a.x, route.b.x, p),
      0.08,
      THREE.MathUtils.lerp(route.a.z, route.b.z, p),
    );
    const s = 0.85 + Math.sin(sceneTime.current * 5) * 0.12;
    wave.current.scale.setScalar(s);
  });
  if (!route) return null;
  return (
    <mesh ref={wave} rotation={[-Math.PI / 2, 0, 0]} position={[route.a.x, 0.08, route.a.z]}>
      <ringGeometry args={[0.28, 0.42, 28]} />
      <meshBasicMaterial color="#fde68a" transparent opacity={0.65} depthWrite={false} />
    </mesh>
  );
}

function PrimUtilityScene({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const graph = useMemo(() => getGraph(optimizedSnapshot) ?? getGraph(naiveSnapshot), [naiveSnapshot, optimizedSnapshot]);
  const snapshot = optimizedSnapshot ?? naiveSnapshot;
  const active = activeNodeSet(snapshot);
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const layout = graph ? buildPrimLayout(graph) : [];
  const byId = graph ? new Map(layout.map(n => [idKey(n.id), n])) : new Map();
  const workingEdge = graph ? primWorkingEdge(graph, snapshot) : null;
  const pair = activePair(snapshot);
  return (
    <group position={[0, 0.05, 26]} scale={0.9}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
        <planeGeometry args={[23, 17]} />
        <meshStandardMaterial color="#25282b" roughness={0.95} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <planeGeometry args={[21, 15]} />
        <meshStandardMaterial color="#31363a" roughness={0.92} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <PrimSubstationSkin />
      {[
        { x: -8, z: -5.5, w: 1.2, h: 0.08, d: 0.08 },
        { x: 8, z: -5.5, w: 1.2, h: 0.08, d: 0.08 },
        { x: -8, z: 5.5, w: 1.2, h: 0.08, d: 0.08 },
        { x: 8, z: 5.5, w: 1.2, h: 0.08, d: 0.08 },
        { x: -8, z: -3, w: 0.08, h: 0.08, d: 5 },
        { x: -8, z: 3, w: 0.08, h: 0.08, d: 5 },
        { x: 8, z: -3, w: 0.08, h: 0.08, d: 5 },
        { x: 8, z: 3, w: 0.08, h: 0.08, d: 5 },
      ].map((post, i) => (
        <group key={`fence-${i}`} position={[post.x, post.h / 2, post.z]}>
          <mesh><boxGeometry args={[post.w, post.h, post.d]} /><meshStandardMaterial color="#6b5b4b" roughness={0.8} /></mesh>
        </group>
      ))}
      {[
        { p: [0, 0.052, 0] as [number, number, number], s: [18.8, 0.65] as [number, number], r: 0.05 },
        { p: [-4.1, 0.053, 1.7] as [number, number, number], s: [7.8, 0.54] as [number, number], r: -0.7 },
        { p: [4.3, 0.053, -1.8] as [number, number, number], s: [8.2, 0.54] as [number, number], r: 0.62 },
        { p: [0, 0.054, 6.1] as [number, number, number], s: [19.0, 0.78] as [number, number], r: 0 },
      ].map((road, i) => (
        <mesh key={`prim-service-lane-${i}`} rotation={[-Math.PI / 2, 0, road.r]} position={road.p}>
          <planeGeometry args={road.s} />
          <meshStandardMaterial color={i === 3 ? '#4b5563' : '#252525'} roughness={0.9} />
        </mesh>
      ))}
      {[[-7, 4.5, 3.5], [7, 4.5, 3.5], [-7, -4.5, 3.5], [7, -4.5, 3.5]].map(([x, z], i) => (
        <group key={`warning-sign-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.5, 1.2, 0.08]} /></mesh>
          <mesh position={[0, 0.6, 0.05]}>
            <boxGeometry args={[0.5, 1.2, 0.08]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.2} />
          </mesh>
          <Text position={[0, 0.6, 0.1]} fontSize={0.15} color="#111" anchorX="center" outlineWidth={0.005} outlineColor="#fff">⚡高压</Text>
        </group>
      ))}
      {graph && (
        <>
          {graph.edges.map((edge, i) => {
            const from = byId.get(idKey(edge.from));
            const to = byId.get(idKey(edge.to));
            if (!from || !to) return null;
            const isActive = edge === workingEdge || isEdgeActive(edge, snapshot);
            const built = active.has(idKey(edge.from)) || active.has(idKey(edge.to));
            return <UtilityLine key={`prim-line-${i}`} from={from} to={to} active={isActive} built={built} weight={edge.weight} />;
          })}
          {layout.map((node, i) => <PowerRecoveryBlock key={`power-block-${idKey(node.id)}`} node={node} energized={i === 0 || active.has(idKey(node.id))} root={i === 0} index={i} />)}
          {layout.map((node, i) => {
            const key = idKey(node.id);
            const pairRole = pair?.[0] === key ? 'from' : pair?.[1] === key ? 'to' : null;
            return <UtilityPole key={`prim-pole-${key}`} node={node} active={active.has(key)} root={i === 0} index={i} pairRole={pairRole} />;
          })}
          <PrimConstructionCrew snapshot={snapshot} layout={layout} graph={graph} />
          <RollingRecoveryWave snapshot={snapshot} graph={graph} layout={layout} />
        </>
      )}
      {[[-8, -5.8], [8, -5.8], [-8, 5.5], [8, 5.5]].map(([x, z], i) => (
        <group key={`prim-lamp-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.035, 0.05, 2.2, 6]} /><meshStandardMaterial color="#374151" /></mesh>
          <mesh position={[0, 2.2, 0]}><sphereGeometry args={[0.075, 8, 6]} /><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.55} /></mesh>
        </group>
      ))}
      <group position={[0, 0.14, 7.95]}>
        <mesh><boxGeometry args={[6.6, 0.12, 0.48]} /><meshStandardMaterial color="#1c1917" emissive="#fbbf24" emissiveIntensity={0.08} roughness={0.7} /></mesh>
        <Text position={[0, 0.28, 0.03]} fontSize={0.22} color="#fef3c7" anchorX="center" outlineWidth={0.008} outlineColor="#1c1917">城市供电 · 最小生成树</Text>
        <Html position={[3.65, 0.38, 0.02]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}>
          <div
            onClick={() => setShowHelp(true, 'prim')}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(251,191,36,0.95)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#111827', fontSize: 17,
              fontWeight: 800, boxShadow: '0 0 14px rgba(251,191,36,0.7)',
              userSelect: 'none',
            }}
          >
            ?
          </div>
        </Html>
      </group>
      <group position={[8.8, 1.8, -0.8]} rotation={[0, -Math.PI / 5, 0]}>
        <mesh><boxGeometry args={[4.8, 2.2, 0.1]} /><meshStandardMaterial color="#1c1917" emissive="#fbbf24" emissiveIntensity={0.04} /></mesh>
        <Text position={[0, 0.72, 0.08]} fontSize={0.2} color="#fef3c7" anchorX="center">电网调度面板</Text>
        <Text position={[-2, 0.2, 0.08]} fontSize={0.13} color="#e5e7eb" anchorX="left" maxWidth={4}>{snapshotStepText(snapshot)}</Text>
        <Text position={[-2, -0.32, 0.08]} fontSize={0.12} color="#fde68a" anchorX="left" maxWidth={4}>设施牌=node id · 线缆牌=cost · from/to=当前候选边</Text>
        <Html position={[2.25, 0.72, 0.08]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}><div onClick={() => setShowHelp(true, 'prim')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(251,191,36,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111827', fontWeight: 700, boxShadow: '0 0 14px rgba(251,191,36,0.7)', userSelect: 'none' }}>?</div></Html>
      </group>
    </group>
  );
}

function CommunityGate({ from, to, active }: { from: [number, number]; to: [number, number]; active: boolean }) {
  const arm = useRef<THREE.Mesh>(null);
  const speed = usePlaybackStore(s => s.speed);
  const isPlaying = usePlaybackStore(s => s.isPlaying);
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
  const angle = Math.atan2(dx, dz);
  useFrame((_, delta) => {
    if (!arm.current) return;
    const target = active ? -1.05 : 0;
    if (!isPlaying) return;
    arm.current.rotation.z += (target - arm.current.rotation.z) * Math.min(1, delta * speed * 8);
  });
  return (
    <group position={[(from[0] + to[0]) / 2, 0.07, (from[1] + to[1]) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.035, len]} />
        <meshStandardMaterial color={active ? '#475569' : '#27313d'} roughness={0.85} />
      </mesh>
      <mesh position={[-0.54, 0.3, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.65} />
      </mesh>
      <mesh ref={arm} position={[-0.42, 0.58, 0]}>
        <boxGeometry args={[1.25, 0.055, 0.06]} />
        <meshStandardMaterial color={active ? '#22c55e' : '#facc15'} roughness={0.48} emissive={active ? '#14532d' : '#713f12'} emissiveIntensity={0.18} />
      </mesh>
      {active && (
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[0.24, 0.025, len]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#0284c7" emissiveIntensity={0.18} transparent opacity={0.72} />
        </mesh>
      )}
    </group>
  );
}

function CommunityShuttle({ snapshot, coords }: { snapshot: TraceSnapshot | null; coords: [number, number][] }) {
  const group = useRef<THREE.Group>(null);
  const wheels = useRef<(THREE.Mesh | null)[]>([]);
  const sceneTime = useSyncedSceneTime(`${snapshot?.timestamp ?? ''}-${snapshot?.label ?? ''}`);
  const route = useMemo(() => {
    const pair = activePair(snapshot);
    if (!pair) return null;
    const a = coords[Number(pair[0]) % coords.length];
    const b = coords[Number(pair[1]) % coords.length];
    return a && b ? { a, b } : null;
  }, [snapshot, coords]);

  useFrame(() => {
    wheels.current.forEach(w => { if (w) w.rotation.x = sceneTime.current * 5; });
    if (!group.current || !route) return;
    const p = oneWayStepProgress(sceneTime.current);
    group.current.position.set(
      THREE.MathUtils.lerp(route.a[0], route.b[0], p),
      0.18,
      THREE.MathUtils.lerp(route.a[1], route.b[1], p),
    );
    group.current.rotation.y = Math.atan2(route.b[0] - route.a[0], route.b[1] - route.a[1]);
  });

  if (!route) return null;
  return (
    <group ref={group} position={[route.a[0], 0.18, route.a[1]]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.62, 0.32, 0.88]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.45} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.44, 0.16]} castShadow>
        <boxGeometry args={[0.48, 0.24, 0.32]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.35} />
      </mesh>
      {[[-0.34, 0.08, -0.28], [0.34, 0.08, -0.28], [-0.34, 0.08, 0.28], [0.34, 0.08, 0.28]].map((p, i) => (
        <mesh key={i} ref={(el) => { wheels.current[i] = el; }} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.07, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
      ))}
      <group position={[-0.72, 0, 0.18]}>
        <mesh position={[0, 0.28, 0]}><boxGeometry args={[0.14, 0.32, 0.1]} /><meshStandardMaterial color="#16a34a" roughness={0.7} /></mesh>
        <mesh position={[0, 0.52, 0]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color="#f8fafc" roughness={0.55} /></mesh>
      </group>
      <Text position={[0, 0.86, 0]} fontSize={0.12} color="#bae6fd" anchorX="center" outlineWidth={0.005} outlineColor="#0f172a">通行恢复</Text>
    </group>
  );
}

function UnionServiceCenter({ setShowHelp }: { setShowHelp: (show: boolean, algorithmId?: string) => void }) {
  return (
    <group position={[-8.35, 0, 6.25]} rotation={[0, 0.12, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[3.6, 2.6]} />
        <meshStandardMaterial color="#4b5563" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.88, 0]} castShadow>
        <boxGeometry args={[3.0, 1.75, 1.85]} />
        <meshStandardMaterial color="#d8d4ca" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.84, 0]} castShadow>
        <boxGeometry args={[3.24, 0.24, 2.04]} />
        <meshStandardMaterial color="#334155" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.7, 0.94]}>
        <boxGeometry args={[0.68, 1.0, 0.08]} />
        <meshStandardMaterial color="#0f3b4c" emissive="#38bdf8" emissiveIntensity={0.1} roughness={0.45} />
      </mesh>
      {[-0.95, 0.95].map(x => (
        <mesh key={`uf-service-window-${x}`} position={[x, 1.04, 0.96]}>
          <boxGeometry args={[0.48, 0.38, 0.07]} />
          <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.16} roughness={0.35} />
        </mesh>
      ))}
      <Text position={[0, 2.18, 1.05]} fontSize={0.2} color="#e0f2fe" anchorX="center" outlineWidth={0.008} outlineColor="#0f172a">
        市政联网服务中心
      </Text>
      <Html position={[1.72, 1.9, 1.05]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}>
        <div onClick={() => setShowHelp(true, 'union-find')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(56,189,248,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0f172a', fontWeight: 800, boxShadow: '0 0 14px rgba(56,189,248,0.65)', userSelect: 'none' }}>?</div>
      </Html>
    </group>
  );
}

function UnionRootLegend({ parents }: { parents: number[] }) {
  const roots = Array.from(new Set(parents.map((_, i) => getUnionRoot(parents, i)))).slice(0, 5);
  return (
    <group position={[-8.95, 1.72, -0.85]} rotation={[0, 0.42, 0]}>
      <mesh>
        <boxGeometry args={[3.85, 2.2, 0.1]} />
        <meshStandardMaterial color="#102331" emissive="#38bdf8" emissiveIntensity={0.04} roughness={0.62} />
      </mesh>
      <Text position={[0, 0.76, 0.08]} fontSize={0.18} color="#bae6fd" anchorX="center" outlineWidth={0.006} outlineColor="#020617">集合根 / root</Text>
      {roots.map((root, i) => (
        <group key={`uf-root-legend-${root}`} position={[-1.45, 0.35 - i * 0.32, 0.08]}>
          <mesh>
            <boxGeometry args={[0.28, 0.16, 0.05]} />
            <meshStandardMaterial color={unionRootColor(root)} emissive={unionRootColor(root)} emissiveIntensity={0.18} />
          </mesh>
          <Text position={[0.3, 0, 0.02]} fontSize={0.12} color="#e5e7eb" anchorX="left" anchorY="middle" maxWidth={2.6}>
            root {root} 管辖社区
          </Text>
        </group>
      ))}
    </group>
  );
}

function UnionCompressionBeam({ parents, activeNode, localCoords }: { parents: number[]; activeNode: number; localCoords: [number, number][] }) {
  const route = getUnionParentRoute(parents, activeNode, localCoords);
  if (route.length < 2) return null;
  return (
    <group>
      {route.slice(0, -1).map((from, i) => {
        const to = route[i + 1];
        const dx = to[0] - from[0];
        const dz = to[1] - from[1];
        const len = Math.max(0.1, Math.hypot(dx, dz));
        const angle = Math.atan2(dx, dz);
        return (
          <group key={`uf-compression-beam-${i}`} position={[(from[0] + to[0]) / 2, 0.34 + i * 0.035, (from[1] + to[1]) / 2]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[0.32, 0.06, len]} />
              <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.22} roughness={0.42} />
            </mesh>
            {i === 0 && (
              <Text position={[0, 0.34, 0]} fontSize={0.13} color="#fef3c7" anchorX="center" outlineWidth={0.006} outlineColor="#111827">
                路径压缩
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}

function UnionFindTraceWorker({ parents, activeNode, localCoords }: { parents: number[]; activeNode: number; localCoords: [number, number][] }) {
  const group = useRef<THREE.Group>(null);
  const sceneTime = useSyncedSceneTime(`uf-find-${activeNode}-${parents.join('-')}`);
  const route = getUnionParentRoute(parents, activeNode, localCoords);
  useFrame(() => {
    if (!group.current || route.length < 1) return;
    const p = oneWayStepProgress(sceneTime.current);
    const [x, z] = pointAlongPolyline(route, p);
    group.current.position.set(x, 0.26, z);
    group.current.rotation.y = tangentAlongPolyline(route, p);
  });
  const [x, z] = route[0] ?? localCoords[0];
  return (
    <group ref={group} position={[x, 0.26, z]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.48, 0.26, 0.7]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.46, 0.08]} castShadow>
        <boxGeometry args={[0.34, 0.18, 0.32]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.36} />
      </mesh>
      <mesh position={[-0.42, 0.2, -0.18]}>
        <boxGeometry args={[0.12, 0.34, 0.1]} />
        <meshStandardMaterial color="#f97316" roughness={0.7} />
      </mesh>
      <mesh position={[-0.42, 0.45, -0.18]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.58} />
      </mesh>
      <Text position={[0, 0.82, 0]} fontSize={0.12} color="#e0f2fe" anchorX="center" outlineWidth={0.005} outlineColor="#0f172a">维修员 find</Text>
    </group>
  );
}

function UnionFindCommunityScene({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const snapshot = optimizedSnapshot ?? naiveSnapshot;
  const parentsFromTrace = getParentArray(snapshot);
  const parents = parentsFromTrace && parentsFromTrace.length > 0 ? parentsFromTrace : [0, 1, 2, 3, 4, 5, 6, 7];
  const highlights = snapshot?.highlights?.map(Number) ?? [];
  const active = new Set(highlights);
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const localCoords = LOCAL_COMMUNITY_COORDS;
  const pair = activePair(snapshot);
  const activeNode = Number(pair?.[0] ?? highlights[0] ?? 0);
  const route = getUnionParentRoute(parents, activeNode, localCoords);
  const roofColors = ['#6f5f52', '#596773', '#66705f', '#786e62', '#5b6657', '#746452', '#53656a', '#6b6468'];
  const wallColors = ['#c8c0b4', '#d0c8bb', '#c4c7c2', '#bdc6ca', '#c7c8bd', '#cfc3b4', '#c2c5c9', '#c6bfc2'];
  const houseFront = (i: number): [number, number] => {
    const [x, z] = localCoords[i % localCoords.length];
    const towardStreet = z > 0 ? -0.82 : 0.82;
    return [x, z + towardStreet];
  };
  return (
    <group position={[52, 0.05, -5]} scale={0.92}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
        <planeGeometry args={[23, 17]} />
        <meshStandardMaterial color="#6d604f" roughness={0.92} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <planeGeometry args={[21, 15]} />
        <meshStandardMaterial color="#7b6b55" roughness={0.9} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <UnionNeighborhoodSkin />
      {[
        { p: [0, 0.17, 0] as [number, number, number], s: [17.8, 0.44] as [number, number], r: 0.18 },
        { p: [-3.2, 0.171, -1.6] as [number, number, number], s: [8.2, 0.36] as [number, number], r: -0.58 },
        { p: [3.2, 0.172, 1.8] as [number, number, number], s: [7.8, 0.36] as [number, number], r: -0.2 },
      ].map((lane, i) => (
        <mesh key={`uf-neighborhood-lane-${i}`} rotation={[-Math.PI / 2, 0, lane.r]} position={lane.p}>
          <planeGeometry args={lane.s} />
          <meshStandardMaterial color="#475569" roughness={0.85} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      ))}
      <UnionServiceCenter setShowHelp={setShowHelp} />
      <UnionRootLegend parents={parents} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.165, 7.6]}>
        <planeGeometry args={[22, 1.8]} />
        <meshStandardMaterial color="#5f6260" roughness={0.88} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      {parents.map((parent, i) => {
        const from = localCoords[i % localCoords.length];
        const to = localCoords[parent % localCoords.length];
        if (!to || i === parent) return null;
        const isActive = active.has(i) || active.has(parent);
        const fromFront = houseFront(i);
        const toFront = houseFront(parent);
        return (
          <group key={`uf-link-${i}`}>
            <GroundConnector from={fromFront} to={from} width={0.24} y={0.075} color={isActive ? '#6f8790' : '#5e625f'} opacity={0.84} />
            <GroundConnector from={toFront} to={to} width={0.24} y={0.075} color={isActive ? '#6f8790' : '#5e625f'} opacity={0.84} />
            <SkyBridge from={fromFront} to={toFront} active={isActive} color="#38bdf8" />
            <CommunityGate from={fromFront} to={toFront} active={isActive} />
          </group>
        );
      })}
      <UnionCompressionBeam parents={parents} activeNode={activeNode} localCoords={localCoords} />
      <UnionFindTraceWorker parents={parents} activeNode={activeNode} localCoords={localCoords} />
      <CommunityShuttle snapshot={snapshot} coords={localCoords} />
      {parents.map((parent, i) => {
        const [x, z] = localCoords[i % localCoords.length];
        const isRoot = parent === i;
        const isActive = active.has(i);
        const rootId = getUnionRoot(parents, i);
        const rootColor = unionRootColor(rootId);
        const roofColor = roofColors[i % roofColors.length];
        const wallColor = wallColors[i % wallColors.length];
        const houseWidth = 1.2 + (i % 3) * 0.15;
        const houseHeight = isRoot ? 1.4 : 0.9 + (i % 2) * 0.2;
        return (
          <group key={`uf-house-${i}`} position={[x, 0, z]}>
            <mesh position={[0, houseHeight / 2, 0]} castShadow>
              <boxGeometry args={[houseWidth, houseHeight, houseWidth]} />
              <meshStandardMaterial color={wallColor} emissive={isActive ? rootColor : '#000'} emissiveIntensity={isActive ? 0.08 : 0} roughness={0.75} />
            </mesh>
            <mesh position={[0, houseHeight + 0.11, 0]} castShadow>
              <boxGeometry args={[houseWidth * 1.16, 0.22, houseWidth * 1.16]} />
              <meshStandardMaterial color={isRoot || isActive ? rootColor : roofColor} emissive={isRoot || isActive ? rootColor : '#000'} emissiveIntensity={isRoot ? 0.24 : isActive ? 0.18 : 0.01} roughness={0.74} />
            </mesh>
            <mesh position={[houseWidth * 0.22, houseHeight + 0.34, -houseWidth * 0.18]}>
              <boxGeometry args={[0.38, 0.26, 0.32]} />
              <meshStandardMaterial color="#7b8079" roughness={0.82} />
            </mesh>
            <mesh position={[0, houseHeight / 2 + 0.05, houseWidth / 2 + 0.005]}>
              <planeGeometry args={[0.25, 0.35]} />
              <meshStandardMaterial color={isActive ? '#d7c47f' : '#27323b'} emissive={isActive ? '#d7c47f' : '#000'} emissiveIntensity={isActive ? 0.18 : 0.01} />
            </mesh>
            <mesh position={[-houseWidth / 2 - 0.01, houseHeight / 2 + 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.25, 0.35]} />
              <meshStandardMaterial color={isActive ? '#d7c47f' : '#27323b'} emissive={isActive ? '#d7c47f' : '#000'} emissiveIntensity={isActive ? 0.18 : 0.01} />
            </mesh>
            <Text position={[0, houseHeight + 0.78, 0]} fontSize={0.17} color={isActive ? '#fef3c7' : '#e0f2fe'} anchorX="center" outlineWidth={0.008} outlineColor="#111827">{`node ${i}`}</Text>
            <Text position={[0, houseHeight + 0.53, 0]} fontSize={0.135} color={isRoot ? '#bbf7d0' : '#dbeafe'} anchorX="center" outlineWidth={0.006} outlineColor="#111827">{`parent ${i}->${parent}`}</Text>
            <Text position={[0, houseHeight + 0.32, 0]} fontSize={0.13} color={rootColor} anchorX="center" outlineWidth={0.006} outlineColor="#111827">{`root ${rootId}`}</Text>
            <mesh position={[0, 0.18, houseWidth / 2 + 0.5]}>
              <boxGeometry args={[houseWidth + 0.3, 0.06, 0.5]} />
              <meshStandardMaterial color={isActive ? '#c7ad69' : '#6b5b4b'} roughness={0.76} polygonOffset polygonOffsetFactor={-1} />
            </mesh>
            <GroundConnector
              from={[0, z > 0 ? -houseWidth / 2 : houseWidth / 2]}
              to={[0, z > 0 ? -1.28 : 1.28]}
              width={0.28}
              y={0.07}
              color={isActive ? '#8a806d' : '#756c5c'}
              opacity={0.92}
            />
          </group>
        );
      })}
      {[[-9.5, -5.8], [-3.2, -5.8], [3.2, -5.8], [9.5, -5.8], [-9.5, 4.8], [9.5, 4.8]].map(([x, z], i) => (
        <group key={`uf-tree-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.05, 0.08, 0.7, 6]} /><meshStandardMaterial color="#5b4636" /></mesh>
          <mesh position={[0, 0.95, 0]}><sphereGeometry args={[0.36, 8, 6]} /><meshStandardMaterial color="#315f3d" roughness={0.9} /></mesh>
        </group>
      ))}
      <group position={[0, 0.22, 7.95]}>
        <mesh><boxGeometry args={[7.2, 0.12, 0.48]} /><meshStandardMaterial color="#1c1917" emissive="#38bdf8" emissiveIntensity={0.08} roughness={0.72} polygonOffset polygonOffsetFactor={-1} /></mesh>
        <Text position={[0, 0.28, 0.03]} fontSize={0.2} color="#e0f2fe" anchorX="center" outlineWidth={0.008} outlineColor="#111827">并查集 · 市政管网合并</Text>
      </group>
      <group position={[8.8, 1.8, -0.8]} rotation={[0, -Math.PI / 5, 0]}>
        <mesh><boxGeometry args={[4.8, 2.2, 0.1]} /><meshStandardMaterial color="#102331" emissive="#38bdf8" emissiveIntensity={0.04} /></mesh>
        <Text position={[0, 0.72, 0.08]} fontSize={0.2} color="#bae6fd" anchorX="center">社区合并面板</Text>
        <Text position={[-2, 0.2, 0.08]} fontSize={0.13} color="#e5e7eb" anchorX="left" maxWidth={4}>{snapshotStepText(snapshot)}</Text>
        <Text position={[-2, -0.32, 0.08]} fontSize={0.12} color="#7dd3fc" anchorX="left" maxWidth={4}>当前 find 路径 {route.length} 段 · 颜色=集合根 · 闸门=union 接通</Text>
      </group>
    </group>
  );
}

/* ===== DP 动态规划 · 建筑工地 ===== */

type DPDisplayData =
  | { type: '2d'; rows: number[][] }
  | { type: '1d'; data: number[] };

function dpGridPosition(dpData: DPDisplayData, row: number, col: number) {
  if (dpData.type === '2d') {
    const colCount = Math.max(1, dpData.rows[0]?.length ?? 1);
    const rowCount = Math.max(1, dpData.rows.length);
    return {
      x: -Math.min(colCount - 1, 11) * 0.52 + col * 1.04,
      z: -Math.min(rowCount - 1, 11) * 0.39 + row * 0.78,
    };
  }
  const count = Math.max(1, dpData.data.length);
  return {
    x: -Math.min(count - 1, 19) * 0.45 + col * 0.9,
    z: 0,
  };
}

function getDPActivePosition(dpData: DPDisplayData | null, highlights: number[]) {
  if (!dpData) return null;
  if (dpData.type === '2d') {
    const row = highlights.length >= 2 ? highlights[0] : 0;
    const col = highlights.length >= 2 ? highlights[1] : 0;
    if (row < 0 || col < 0 || row >= dpData.rows.length || col >= (dpData.rows[row]?.length ?? 0)) return null;
    return { ...dpGridPosition(dpData, row, col), row, col };
  }
  const col = highlights.find(i => i >= 0 && i < dpData.data.length) ?? 0;
  return { ...dpGridPosition(dpData, 0, col), row: 0, col };
}

function DependencyBeam({ from, to, color = '#38bdf8' }: { from: { x: number; z: number }; to: { x: number; z: number }; color?: string }) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.max(0.1, Math.sqrt(dx * dx + dz * dz));
  const angle = -Math.atan2(dz, dx);
  return (
    <mesh position={[(from.x + to.x) / 2, 0.22, (from.z + to.z) / 2]} rotation={[0, angle, 0]}>
      <boxGeometry args={[length, 0.06, 0.09]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.86} roughness={0.45} />
    </mesh>
  );
}

function DPGroundCell({ x, z, label, value, active, dependency }: {
  x: number;
  z: number;
  label: string;
  value: number;
  active: boolean;
  dependency: boolean;
}) {
  const fill = active ? '#f59e0b' : dependency ? '#2f6f73' : '#767166';
  const displayValue = value === Infinity ? '∞' : value === -Infinity ? '-∞' : String(value);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.98, active ? 0.2 : 0.14, 0.66]} />
        <meshStandardMaterial
          color={fill}
          emissive={active ? '#fbbf24' : dependency ? '#22d3ee' : '#000'}
          emissiveIntensity={active ? 0.28 : dependency ? 0.16 : 0}
          roughness={0.82}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.86, 0.02, 0.54]} />
        <meshStandardMaterial color={active ? '#fed7aa' : '#a8a29e'} roughness={0.88} />
      </mesh>
      <Text position={[0, 0.238, -0.08]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color={active ? '#111827' : '#1f2937'} anchorX="center" anchorY="middle">
        {displayValue}
      </Text>
      <Text position={[0, 0.242, 0.21]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.1} color="#111827" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

function DPConstructionGrid({ dpData, highlights }: { dpData: DPDisplayData | null; highlights: number[] }) {
  if (!dpData) {
    return (
      <group position={[0, 0, 0.8]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[8.2, 0.12, 4]} />
          <meshStandardMaterial color="#6b6960" roughness={0.9} />
        </mesh>
        <Text position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.2} color="#1f2937" anchorX="center">
          等待 DP 数据
        </Text>
      </group>
    );
  }

  const active = getDPActivePosition(dpData, highlights);
  const dependencyKeys = new Set<string>();
  if (active) {
    if (dpData.type === '2d') {
      [[active.row - 1, active.col], [active.row, active.col - 1], [active.row - 1, active.col - 1]].forEach(([r, c]) => {
        if (r >= 0 && c >= 0 && r < dpData.rows.length && c < (dpData.rows[r]?.length ?? 0)) dependencyKeys.add(`${r}:${c}`);
      });
    } else if (active.col > 0) {
      dependencyKeys.add(`0:${active.col - 1}`);
    }
  }

  const dependencies = active
    ? [...dependencyKeys].map(key => {
      const [r, c] = key.split(':').map(Number);
      return { key, from: dpGridPosition(dpData, r, c), to: { x: active.x, z: active.z } };
    })
    : [];

  return (
    <group position={[0, 0, 2.1]}>
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[19.6, 0.06, 7.4]} />
        <meshStandardMaterial color="#514f49" roughness={0.96} />
      </mesh>
      <Text position={[-9.2, 0.26, -3.25]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.26} color="#f8fafc" anchorX="left" outlineWidth={0.004} outlineColor="#111827">
        DP 状态施工沙盘
      </Text>
      <Text position={[3.8, 0.26, -3.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.15} color="#d1d5db" anchorX="left" maxWidth={5.4}>
        橙色楼板=当前状态；蓝色箭头=依赖来源；数值=当前最优解
      </Text>
      {dependencies.map(dep => (
        <DependencyBeam key={dep.key} from={dep.from} to={dep.to} color={dep.key.includes(':') ? '#38bdf8' : '#fbbf24'} />
      ))}
      {dpData.type === '2d' ? dpData.rows.map((row, ri) => (
        row.map((value, ci) => {
          const pos = dpGridPosition(dpData, ri, ci);
          const activeCell = active?.row === ri && active?.col === ci;
          return (
            <DPGroundCell
              key={`ground-dp-${ri}-${ci}`}
              x={pos.x}
              z={pos.z}
              label={`[${ri},${ci}]`}
              value={value}
              active={activeCell}
              dependency={dependencyKeys.has(`${ri}:${ci}`)}
            />
          );
        })
      )) : dpData.data.map((value, ci) => {
        const pos = dpGridPosition(dpData, 0, ci);
        const activeCell = active?.col === ci;
        return (
          <DPGroundCell
            key={`ground-dp-1d-${ci}`}
            x={pos.x}
            z={pos.z}
            label={`dp[${ci}]`}
            value={value}
            active={activeCell}
            dependency={dependencyKeys.has(`0:${ci}`)}
          />
        );
      })}
    </group>
  );
}

function DPOperationStateBoard({ dpData, highlights, title, subtitle }: {
  dpData: DPDisplayData | null;
  highlights: number[];
  title: string;
  subtitle: string;
}) {
  const active = getDPActivePosition(dpData, highlights);
  return (
    <group position={[-7.7, 1.8, -5.5]} rotation={[0, Math.PI / 10, 0]}>
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[5.6, 2.9, 0.14]} />
        <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.05} roughness={0.52} />
      </mesh>
      <mesh position={[0, 1.45, 0.09]}>
        <boxGeometry args={[5.25, 2.48, 0.04]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <Text position={[0, 2.52, 0.14]} fontSize={0.19} color="#e0f2fe" anchorX="center" outlineWidth={0.005} outlineColor="#020617">
        {title}
      </Text>
      <Text position={[0, 2.25, 0.14]} fontSize={0.11} color="#94a3b8" anchorX="center" maxWidth={4.8}>
        {subtitle}
      </Text>
      {dpData?.type === '2d' && (
        <group position={[0, 1.32, 0.14]}>
          {dpData.rows.slice(0, 7).map((row, ri) => row.slice(0, 9).map((value, ci) => {
            const isActive = active?.row === ri && (active?.col === ci || highlights.length === 1);
            return (
              <group key={`ops-cache-${ri}-${ci}`} position={[-2.12 + ci * 0.52, 0.72 - ri * 0.28, 0]}>
                <mesh>
                  <boxGeometry args={[0.42, 0.2, 0.035]} />
                  <meshStandardMaterial color={isActive ? '#f59e0b' : '#334155'} emissive={isActive ? '#fbbf24' : '#000'} emissiveIntensity={isActive ? 0.32 : 0} roughness={0.6} />
                </mesh>
                <Text position={[0, 0, 0.035]} fontSize={0.075} color={isActive ? '#111827' : '#cbd5e1'} anchorX="center" anchorY="middle">
                  {value === Infinity ? '∞' : String(value)}
                </Text>
              </group>
            );
          }))}
        </group>
      )}
      {dpData?.type === '1d' && (
        <group position={[0, 1.26, 0.14]}>
          {dpData.data.slice(0, 12).map((value, i) => {
            const isActive = highlights.includes(i);
            return (
              <group key={`ops-cache-1d-${i}`} position={[-2.45 + i * 0.45, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.36, 0.42, 0.035]} />
                  <meshStandardMaterial color={isActive ? '#f59e0b' : '#334155'} emissive={isActive ? '#fbbf24' : '#000'} emissiveIntensity={isActive ? 0.32 : 0} roughness={0.6} />
                </mesh>
                <Text position={[0, 0.08, 0.035]} fontSize={0.075} color={isActive ? '#111827' : '#cbd5e1'} anchorX="center">
                  {String(value)}
                </Text>
                <Text position={[0, -0.12, 0.035]} fontSize={0.06} color="#94a3b8" anchorX="center">
                  {i}
                </Text>
              </group>
            );
          })}
        </group>
      )}
      {active && (
        <Text position={[0, 0.48, 0.14]} fontSize={0.12} color="#fbbf24" anchorX="center">
          当前状态 {dpData?.type === '2d' ? `dp[${active.row}][${active.col}]` : `dp[${active.col}]`}
        </Text>
      )}
    </group>
  );
}

function CargoPallet({ active, weight, value }: { active: boolean; weight: number; value: number }) {
  return (
    <group>
      {[0, 1, 2].map(i => (
        <mesh key={`pallet-slat-${i}`} position={[0, 0.08, -0.32 + i * 0.32]} castShadow>
          <boxGeometry args={[1.12, 0.08, 0.08]} />
          <meshStandardMaterial color="#6b4423" roughness={0.86} />
        </mesh>
      ))}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.92, 0.72, 0.78]} />
        <meshStandardMaterial color={active ? '#d97706' : '#9a5b20'} emissive={active ? '#f59e0b' : '#000'} emissiveIntensity={active ? 0.24 : 0} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow>
        <boxGeometry args={[0.96, 0.08, 0.82]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      {[-0.27, 0.27].map(x => (
        <mesh key={`cargo-strap-${x}`} position={[x, 0.52, 0.41]}>
          <boxGeometry args={[0.07, 0.78, 0.045]} />
          <meshStandardMaterial color="#111827" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0.43]}>
        <boxGeometry args={[0.58, 0.25, 0.035]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.65} />
      </mesh>
      <Text position={[0, 0.52, 0.47]} fontSize={0.1} color="#111827" anchorX="center" anchorY="middle">
        {`w${weight}/v${value}`}
      </Text>
    </group>
  );
}

function ForkliftLoader({ itemIndex, capacity, capMax, itemWeight }: { itemIndex: number; capacity: number; capMax: number; itemWeight: number }) {
  const ref = useRef<THREE.Group>(null);
  const anim = useRef(1);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const speed = usePlaybackStore(s => s.speed);
  const canLoad = capacity >= itemWeight;
  useEffect(() => {
    anim.current = 0;
  }, [currentStep, itemIndex, capacity, itemWeight]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    anim.current = Math.min(1, anim.current + delta * speed * 1.4);
    const t = 1 - Math.pow(1 - anim.current, 3);
    const cargoX = -4.8 + Math.max(0, Math.min(5, itemIndex)) * 1.25;
    const targetX = canLoad ? -0.4 + Math.min(1, capacity / Math.max(1, capMax)) * 2.7 : cargoX + 0.35;
    const targetZ = canLoad ? 3.05 : 4.95;
    ref.current.position.x = THREE.MathUtils.lerp(cargoX, targetX, t);
    ref.current.position.z = THREE.MathUtils.lerp(4.0, targetZ, t);
    ref.current.rotation.y = canLoad ? 0.06 : -0.2;
    ref.current.position.y = Math.sin(anim.current * Math.PI) * 0.035;
  });
  return (
    <group ref={ref} position={[-4.8, 0, 4.0]} scale={1.22}>
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[1.05, 0.52, 0.78]} />
        <meshStandardMaterial color="#facc15" roughness={0.58} />
      </mesh>
      <mesh position={[-0.25, 0.78, -0.06]} castShadow>
        <boxGeometry args={[0.42, 0.62, 0.52]} />
        <meshStandardMaterial color="#111827" roughness={0.46} />
      </mesh>
      <mesh position={[0.52, 0.72, 0]}><boxGeometry args={[0.08, 1.25, 0.08]} /><meshStandardMaterial color="#374151" /></mesh>
      <mesh position={[1.0, 0.25, -0.22]}><boxGeometry args={[1.02, 0.06, 0.08]} /><meshStandardMaterial color="#374151" /></mesh>
      <mesh position={[1.0, 0.25, 0.22]}><boxGeometry args={[1.02, 0.06, 0.08]} /><meshStandardMaterial color="#374151" /></mesh>
      {[-0.38, 0.38].map(x => <mesh key={`fork-wheel-${x}`} position={[x, 0.12, 0.44]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.1, 16]} /><meshStandardMaterial color="#111827" /></mesh>)}
      <mesh position={[1.14, 0.45, 0]} castShadow>
        <boxGeometry args={[0.44, 0.34, 0.44]} />
        <meshStandardMaterial color={canLoad ? '#d97706' : '#64748b'} emissive={canLoad ? '#f59e0b' : '#ef4444'} emissiveIntensity={0.18} roughness={0.7} />
      </mesh>
      <Text position={[0, 1.18, 0]} fontSize={0.12} color="#111827" anchorX="center" outlineWidth={0.004} outlineColor="#fde68a">
        {canLoad ? '装载' : '超重'}
      </Text>
    </group>
  );
}

function CoinDrop({ amount, coinValue }: { amount: number; coinValue: number }) {
  const ref = useRef<THREE.Group>(null);
  const anim = useRef(1);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const speed = usePlaybackStore(s => s.speed);
  useEffect(() => {
    anim.current = 0;
  }, [currentStep, amount, coinValue]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    anim.current = Math.min(1, anim.current + delta * speed * 1.75);
    const t = anim.current;
    ref.current.position.set(0.2 + t * 3.2, 2.1 - t * 1.55 - Math.sin(t * Math.PI) * 0.35, -2.35 + t * 4.4);
    ref.current.rotation.x = t * Math.PI * 8;
  });
  const coinColor = coinValue === 5 ? '#facc15' : coinValue === 2 ? '#cbd5e1' : '#b45309';
  return (
    <group ref={ref} position={[0, 2, -2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.045, 24]} />
        <meshStandardMaterial color={coinColor} metalness={0.5} roughness={0.28} emissive={coinColor} emissiveIntensity={0.12} />
      </mesh>
      <Text position={[0, 0.24, 0]} fontSize={0.1} color="#f8fafc" anchorX="center" outlineWidth={0.004} outlineColor="#111827">
        ¥{coinValue}
      </Text>
    </group>
  );
}

function TicketPrinter({ amount }: { amount: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const anim = useRef(1);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const speed = usePlaybackStore(s => s.speed);
  useEffect(() => {
    anim.current = 0;
  }, [currentStep, amount]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    anim.current = Math.min(1, anim.current + delta * speed * 2.2);
    ref.current.scale.z = 0.35 + Math.sin(anim.current * Math.PI) * 0.85;
  });
  return (
    <mesh ref={ref} position={[0, 0.9, 0.82]}>
      <boxGeometry args={[0.55, 0.035, 0.78]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.58} />
    </mesh>
  );
}

function MetroStationConcourse({ amount }: { amount: number }) {
  return (
    <group position={[0.5, 0, -1.05]}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[14.6, 0.08, 7.4]} />
        <meshStandardMaterial color="#2f3438" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.95, -3.46]} castShadow>
        <boxGeometry args={[14.8, 3.8, 0.28]} />
        <meshStandardMaterial color="#626b70" roughness={0.72} />
      </mesh>
      <mesh position={[-7.25, 1.32, 0]} castShadow>
        <boxGeometry args={[0.28, 2.55, 6.7]} />
        <meshStandardMaterial color="#555f64" roughness={0.76} />
      </mesh>
      <mesh position={[7.25, 1.32, 0]} castShadow>
        <boxGeometry args={[0.28, 2.55, 6.7]} />
        <meshStandardMaterial color="#555f64" roughness={0.76} />
      </mesh>
      <mesh position={[0, 3.88, -0.1]} castShadow>
        <boxGeometry args={[15.2, 0.32, 7.6]} />
        <meshStandardMaterial color="#3f464a" roughness={0.8} />
      </mesh>
      {[-5.8, -3.4, -1, 1.4, 3.8, 6.2].map(x => (
        <mesh key={`metro-beam-${x}`} position={[x, 2.1, 0.12]} castShadow>
          <boxGeometry args={[0.18, 3.45, 0.18]} />
          <meshStandardMaterial color="#283036" roughness={0.62} />
        </mesh>
      ))}
      {[-5.4, -2.6, 0.2, 3.0].map((x, i) => (
        <mesh key={`metro-window-${i}`} position={[x, 2.18, -3.29]}>
          <boxGeometry args={[1.75, 1.0, 0.05]} />
          <meshStandardMaterial color="#a7c8d8" transparent opacity={0.38} roughness={0.28} metalness={0.08} />
        </mesh>
      ))}
      <mesh position={[-2.6, 3.04, -3.16]}>
        <boxGeometry args={[6.2, 0.62, 0.08]} />
        <meshStandardMaterial color="#10243a" emissive="#0ea5e9" emissiveIntensity={0.07} roughness={0.48} />
      </mesh>
      <Text position={[-2.6, 3.06, -3.1]} fontSize={0.28} color="#e0f2fe" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#020617">
        城市地铁站 · 零钱兑换票务大厅
      </Text>
      <mesh position={[5.4, 2.92, -3.14]}>
        <boxGeometry args={[1.3, 0.82, 0.08]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#2563eb" emissiveIntensity={0.18} roughness={0.5} />
      </mesh>
      <Text position={[5.4, 2.91, -3.08]} fontSize={0.46} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#1e3a8a">
        M
      </Text>
      <mesh position={[0, 0.105, 2.92]}>
        <boxGeometry args={[12.6, 0.04, 0.12]} />
        <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.14} />
      </mesh>
      {[-4.7, -2.45, -0.2].map((x, i) => (
        <group key={`ticket-zone-marker-${i}`} position={[x, 0.16, -1.35]}>
          <mesh>
            <boxGeometry args={[1.36, 0.035, 0.24]} />
            <meshStandardMaterial color={i === amount % 3 ? '#22c55e' : '#93a3ad'} emissive={i === amount % 3 ? '#16a34a' : '#000'} emissiveIntensity={i === amount % 3 ? 0.22 : 0} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MetroEntrance({ amount }: { amount: number }) {
  return (
    <group position={[4.15, 0, -1.95]} rotation={[0, -0.08, 0]}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.2, 4.8]} />
        <meshStandardMaterial color="#3f474d" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.58, -0.78]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[4.9, 0.24, 3.45]} />
        <meshStandardMaterial color="#1f2933" roughness={0.74} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`metro-step-${i}`} position={[0, 0.21 + i * 0.105, 1.08 - i * 0.43]} castShadow>
          <boxGeometry args={[4.58, 0.09, 0.38]} />
          <meshStandardMaterial color={i % 2 ? '#667078' : '#7b858d'} roughness={0.84} />
        </mesh>
      ))}
      <mesh position={[0, 2.24, -1.65]} rotation={[0.13, 0, 0]} castShadow>
        <boxGeometry args={[5.55, 0.16, 1.5]} />
        <meshStandardMaterial color="#8fc6d6" transparent opacity={0.42} roughness={0.2} metalness={0.1} />
      </mesh>
      {[-2.65, 2.65].map(x => (
        <mesh key={`metro-canopy-post-${x}`} position={[x, 1.2, -1.32]} castShadow>
          <cylinderGeometry args={[0.06, 0.075, 2.05, 8]} />
          <meshStandardMaterial color="#26323a" roughness={0.58} />
        </mesh>
      ))}
      <group position={[-2.62, 2.05, 1.22]}>
        <mesh>
          <boxGeometry args={[1.12, 1.12, 0.12]} />
          <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.24} roughness={0.48} />
        </mesh>
        <Text position={[0, -0.02, 0.075]} fontSize={0.58} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.006} outlineColor="#1e3a8a">
          M
        </Text>
      </group>
      <Text position={[0.28, 2.12, 1.26]} fontSize={0.24} color="#e0f2fe" anchorX="center" outlineWidth={0.008} outlineColor="#111827">
        站厅入口 / 出票后进站
      </Text>
      {[-1.08, 0, 1.08].map((x, i) => (
        <group key={`metro-gate-${i}`} position={[x, 0.52, 1.76]}>
          <mesh castShadow>
            <boxGeometry args={[0.48, 0.98, 0.64]} />
            <meshStandardMaterial color="#111827" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.47, -0.36]}>
            <boxGeometry args={[0.34, 0.1, 0.06]} />
            <meshStandardMaterial color={i === amount % 3 ? '#22c55e' : '#38bdf8'} emissive={i === amount % 3 ? '#22c55e' : '#38bdf8'} emissiveIntensity={0.34} />
          </mesh>
        </group>
      ))}
      <Billboard position={[2.55, 1.34, 1.85]} follow>
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[1.95, 0.56]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.84} depthWrite={false} />
        </mesh>
        <Text fontSize={0.13} color="#f8fafc" anchorX="center" anchorY="middle">
          最少硬币数对应出票方案
        </Text>
      </Billboard>
    </group>
  );
}

function ScanLightBar({ row, col, colCount }: { row: number; col: number; colCount: number }) {
  const ref = useRef<THREE.Group>(null);
  const anim = useRef(1);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const speed = usePlaybackStore(s => s.speed);
  const safeCol = Math.max(0, Math.min(colCount - 1, col));
  useEffect(() => {
    anim.current = 0;
  }, [currentStep, row, safeCol, colCount]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    anim.current = Math.min(1, anim.current + delta * speed * 2.4);
    const t = 1 - Math.pow(1 - anim.current, 2);
    ref.current.position.x = THREE.MathUtils.lerp(-4.1, -4.1 + safeCol * (8.2 / Math.max(1, colCount - 1)), t);
    ref.current.position.z = -0.62 + Math.min(row, 8) * 0.1;
  });
  return (
    <group ref={ref} position={[-4, 0.98, -0.5]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.06, 2.15]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.7} transparent opacity={0.76} />
      </mesh>
      <pointLight position={[0, 0.4, 0]} intensity={0.45} distance={3.5} color="#38bdf8" />
    </group>
  );
}

function getTemplateTextPair(activeAlgorithmId: string) {
  const data = allTemplates.find(t => t.id === activeAlgorithmId)?.defaultData as { text1?: unknown; text2?: unknown } | undefined;
  if (typeof data?.text1 === 'string' && typeof data?.text2 === 'string') {
    return { a: data.text1, b: data.text2 };
  }
  return activeAlgorithmId === 'edit-distance'
    ? { a: 'kitten', b: 'sitting' }
    : { a: 'ABCBDAB', b: 'BDCABA' };
}

function TextComparisonMatrixWall({
  dpData,
  row,
  col,
  activeAlgorithmId,
}: {
  dpData: DPDisplayData | null;
  row: number;
  col: number;
  activeAlgorithmId: string;
}) {
  const pair = getTemplateTextPair(activeAlgorithmId);
  const rows = dpData?.type === '2d' ? Math.min(dpData.rows.length, pair.a.length + 1, 8) : Math.min(pair.a.length + 1, 8);
  const cols = dpData?.type === '2d' ? Math.min(dpData.rows[0]?.length ?? pair.b.length + 1, pair.b.length + 1, 9) : Math.min(pair.b.length + 1, 9);
  const activeRow = Math.max(0, Math.min(rows - 1, row));
  const activeCol = Math.max(0, Math.min(cols - 1, col));
  const cell = 0.46;
  const startX = -((cols - 1) * cell) / 2;
  const startY = ((rows - 1) * cell) / 2;
  const current = dpData?.type === '2d' ? dpData.rows[activeRow]?.[activeCol] : undefined;
  const currentA = activeRow > 0 ? pair.a[activeRow - 1] : '∅';
  const currentB = activeCol > 0 ? pair.b[activeCol - 1] : '∅';
  const isEdit = activeAlgorithmId === 'edit-distance';
  const relation = activeRow === 0 || activeCol === 0
    ? '初始化空前缀'
    : isEdit
      ? `${currentA} ↔ ${currentB}`
      : currentA === currentB ? `${currentA} = ${currentB}` : `${currentA} ≠ ${currentB}`;

  return (
    <group position={[0, 1.7, 0.24]}>
      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[6.7, 3.62, 0.08]} />
        <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.04} roughness={0.58} />
      </mesh>
      <Text position={[-3.08, 1.54, 0.04]} fontSize={0.135} color="#93c5fd" anchorX="left">
        行=text1，列=text2，光标=dp[i][j]
      </Text>
      {Array.from({ length: cols }).map((_, c) => {
        const label = c === 0 ? '∅' : pair.b[c - 1];
        return (
          <group key={`matrix-col-head-${c}`} position={[startX + c * cell, startY + cell * 0.82, 0.04]}>
            <mesh>
              <boxGeometry args={[0.38, 0.29, 0.025]} />
              <meshStandardMaterial color={c === activeCol ? '#f59e0b' : '#1e3a8a'} emissive={c === activeCol ? '#f59e0b' : '#000'} emissiveIntensity={c === activeCol ? 0.22 : 0} />
            </mesh>
            <Text position={[0, -0.035, 0.026]} fontSize={0.145} color="#f8fafc" anchorX="center" anchorY="middle">{label}</Text>
          </group>
        );
      })}
      {Array.from({ length: rows }).map((_, r) => {
        const label = r === 0 ? '∅' : pair.a[r - 1];
        return (
          <group key={`matrix-row-head-${r}`} position={[startX - cell * 0.82, startY - r * cell, 0.04]}>
            <mesh>
              <boxGeometry args={[0.31, 0.36, 0.025]} />
              <meshStandardMaterial color={r === activeRow ? '#f59e0b' : '#155e75'} emissive={r === activeRow ? '#f59e0b' : '#000'} emissiveIntensity={r === activeRow ? 0.22 : 0} />
            </mesh>
            <Text position={[0, -0.035, 0.026]} fontSize={0.145} color="#f8fafc" anchorX="center" anchorY="middle">{label}</Text>
          </group>
        );
      })}
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((__, c) => {
        const value = dpData?.type === '2d' ? dpData.rows[r]?.[c] : undefined;
        const active = r === activeRow && c === activeCol;
        const dependency = isEdit
          ? ((r === activeRow - 1 && c === activeCol) || (r === activeRow && c === activeCol - 1) || (r === activeRow - 1 && c === activeCol - 1))
          : ((r === activeRow - 1 && c === activeCol) || (r === activeRow && c === activeCol - 1) || (r === activeRow - 1 && c === activeCol - 1));
        return (
          <group key={`review-matrix-${r}-${c}`} position={[startX + c * cell, startY - r * cell, 0.05]}>
            <mesh>
              <boxGeometry args={[0.38, 0.33, 0.025]} />
              <meshStandardMaterial
                color={active ? '#f59e0b' : dependency ? '#2563eb' : '#334155'}
                emissive={active ? '#f59e0b' : dependency ? '#38bdf8' : '#000'}
                emissiveIntensity={active ? 0.22 : dependency ? 0.12 : 0}
                roughness={0.62}
              />
            </mesh>
            <Text position={[0, -0.035, 0.026]} fontSize={0.12} color={active ? '#111827' : '#e5e7eb'} anchorX="center" anchorY="middle">
              {value ?? ''}
            </Text>
          </group>
        );
      }))}
      <mesh position={[startX + activeCol * cell, 0, 0.08]}>
        <boxGeometry args={[0.055, rows * cell + 0.22, 0.028]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.3} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, startY - activeRow * cell, 0.085]}>
        <boxGeometry args={[cols * cell + 0.22, 0.055, 0.028]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.28} transparent opacity={0.72} />
      </mesh>
      <Text position={[0, -1.54, 0.05]} fontSize={0.16} color="#fde68a" anchorX="center" maxWidth={6.1}>
        {`当前 ${relation}，dp[${activeRow}][${activeCol}] = ${current ?? '-'}`}
      </Text>
    </group>
  );
}

function PathCourier({ row, col, cols }: { row: number; col: number; cols: number }) {
  const ref = useRef<THREE.Group>(null);
  const anim = useRef(1);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const speed = usePlaybackStore(s => s.speed);
  useEffect(() => {
    anim.current = 0;
  }, [currentStep, row, col]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    anim.current = Math.min(1, anim.current + delta * speed * 1.65);
    const t = 1 - Math.pow(1 - anim.current, 2);
    const targetX = -4.7 + Math.max(0, Math.min(cols - 1, col)) * 1.35;
    const targetZ = -3 + row * 1.2;
    const startX = col > 0 ? targetX - 1.35 : targetX;
    const startZ = col > 0 ? targetZ : Math.max(-3, targetZ - 1.2);
    ref.current.position.x = THREE.MathUtils.lerp(startX, targetX, t);
    ref.current.position.z = THREE.MathUtils.lerp(startZ, targetZ, t);
    ref.current.position.y = 0.28 + Math.sin(anim.current * Math.PI) * 0.08;
  });
  return (
    <group ref={ref} position={[-4.7, 0.28, -3]}>
      <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.28, 0.4, 0.22]} /><meshStandardMaterial color="#f59e0b" roughness={0.62} /></mesh>
      <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.13, 10, 8]} /><meshStandardMaterial color="#fcd34d" roughness={0.7} /></mesh>
      <mesh position={[0.22, 0.22, 0]}><boxGeometry args={[0.24, 0.24, 0.2]} /><meshStandardMaterial color="#38bdf8" roughness={0.55} /></mesh>
    </group>
  );
}

function PathTransferFlow({ row, col }: { row: number; col: number }) {
  const ref = useRef<THREE.Group>(null);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const speed = usePlaybackStore(s => s.speed);
  const anim = useRef(1);
  useEffect(() => {
    anim.current = 0;
  }, [currentStep, row, col]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    anim.current = Math.min(1, anim.current + delta * speed * 2.1);
    const pulse = Math.sin(anim.current * Math.PI);
    ref.current.scale.setScalar(0.8 + pulse * 0.45);
  });
  const x = -4.7 + col * 1.35;
  const z = -3 + row * 1.2;
  return (
    <group ref={ref} position={[0, 0, 0]}>
      {col > 0 && (
        <mesh position={[x - 0.64, 0.74, z]}>
          <boxGeometry args={[1.08, 0.1, 0.14]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.55} transparent opacity={0.82} />
        </mesh>
      )}
      {row > 0 && (
        <mesh position={[x, 0.78, z - 0.56]}>
          <boxGeometry args={[0.14, 0.1, 1.0]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} transparent opacity={0.82} />
        </mesh>
      )}
      <mesh position={[x, 0.82, z]}>
        <sphereGeometry args={[0.32, 16, 10]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} roughness={0.5} />
      </mesh>
      <Billboard position={[x, 1.22, z]} follow>
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[1.55, 0.38]} />
          <meshBasicMaterial color="#111827" transparent opacity={0.84} depthWrite={false} />
        </mesh>
        <Text position={[0, 0, 0]} fontSize={0.11} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor="#111827">
          上方 + 左方 → 当前路口
        </Text>
      </Billboard>
    </group>
  );
}

function PatrolCar({ active }: { active: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const targetX = -6.6 + Math.max(0, Math.min(7, active)) * 2.15;
    ref.current.position.x += (targetX - ref.current.position.x) * Math.min(1, delta * 3.5);
    ref.current.position.y = 0.02 + Math.sin(clock.elapsedTime * 8) * 0.01;
  });
  return (
    <group ref={ref} position={[-6.6, 0.02, 1.8]}>
      <mesh position={[0, 0.28, 0]} castShadow><boxGeometry args={[1.25, 0.4, 0.7]} /><meshStandardMaterial color="#1d4ed8" roughness={0.55} /></mesh>
      <mesh position={[0.58, 0.42, 0]} castShadow><boxGeometry args={[0.46, 0.35, 0.5]} /><meshStandardMaterial color="#0f172a" roughness={0.5} /></mesh>
      <mesh position={[-0.2, 0.52, 0]}><boxGeometry args={[0.28, 0.08, 0.18]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.75} /></mesh>
      <mesh position={[0.08, 0.52, 0]}><boxGeometry args={[0.28, 0.08, 0.18]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.75} /></mesh>
      {[-0.42, 0.42].map(x => <mesh key={`patrol-wheel-${x}`} position={[x, 0.08, 0.38]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.1, 14]} /><meshStandardMaterial color="#111827" /></mesh>)}
    </group>
  );
}

function LogisticsLoadingDock({ dpData, highlights, pointers }: {
  dpData: DPDisplayData | null;
  highlights: number[];
  pointers: Record<string, unknown>;
}) {
  const item = Number.isFinite(Number(pointers.i)) ? Number(pointers.i) : (highlights.length >= 2 ? highlights[0] : 0);
  const capacity = Number.isFinite(Number(pointers.w)) ? Number(pointers.w) : (highlights.length > 0 ? highlights[highlights.length - 1] : 0);
  const weights = [2, 3, 4, 5, 6, 2];
  const values = [3, 4, 5, 6, 8, 2];
  const capMax = dpData?.type === '2d' ? Math.max(1, (dpData.rows[0]?.length ?? 7) - 1) : Math.max(1, (dpData?.data.length ?? 7) - 1);
  const activeItem = Math.max(0, Math.min(5, Number.isFinite(item) ? item : 0));
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[22, 0.12, 16]} />
        <meshStandardMaterial color="#5b5f5a" roughness={0.95} />
      </mesh>
      <group position={[0, 0, -5.4]}>
        <mesh position={[0, 2.1, 0]} castShadow><boxGeometry args={[13.5, 4.2, 0.35]} /><meshStandardMaterial color="#374151" roughness={0.76} /></mesh>
        {[-4.4, 0, 4.4].map((x, i) => (
          <group key={`dock-door-${i}`} position={[x, 0, 0.23]}>
            <mesh position={[0, 1.15, 0]}><boxGeometry args={[2.8, 2.25, 0.08]} /><meshStandardMaterial color="#1f2937" roughness={0.62} /></mesh>
            <Text position={[0, 2.45, 0.08]} fontSize={0.16} color="#e5e7eb" anchorX="center">月台 {i + 1}</Text>
          </group>
        ))}
        <Text position={[0, 4.45, 0.24]} fontSize={0.28} color="#f8fafc" anchorX="center" outlineWidth={0.008} outlineColor="#111827">
          物流装载调度中心
        </Text>
      </group>
      <group position={[2.4, 0, 1.5]}>
        <mesh position={[0, 0.65, 0]} castShadow><boxGeometry args={[5.8, 1.3, 2.2]} /><meshStandardMaterial color="#1d4ed8" roughness={0.58} /></mesh>
        <mesh position={[-0.35, 1.34, 0]}><boxGeometry args={[4.7, 0.08, 1.82]} /><meshStandardMaterial color="#0f172a" roughness={0.62} /></mesh>
        {[0, 1, 2, 3].map(i => (
          <mesh key={`truck-loaded-${i}`} position={[-2.0 + i * 0.82, 1.0, -0.28 + (i % 2) * 0.58]}>
            <boxGeometry args={[0.62, 0.48, 0.5]} />
            <meshStandardMaterial color={i <= activeItem % 4 ? '#b45309' : '#334155'} roughness={0.72} />
          </mesh>
        ))}
        <mesh position={[3.35, 0.52, 0]}><boxGeometry args={[1.4, 1.05, 1.7]} /><meshStandardMaterial color="#0f172a" roughness={0.52} /></mesh>
        {[-2.2, 2.8].map(x => <mesh key={`truck-wheel-${x}`} position={[x, 0.18, 1.18]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.32, 0.32, 0.18, 16]} /><meshStandardMaterial color="#111827" /></mesh>)}
        <mesh position={[-0.6, 1.45, 1.15]}>
          <boxGeometry args={[4.6 * Math.min(1, capacity / capMax), 0.16, 0.08]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.12} />
        </mesh>
        <Text position={[0, 1.75, 1.25]} fontSize={0.15} color="#f8fafc" anchorX="center" outlineWidth={0.006} outlineColor="#111827">
          容量 {capacity}/{capMax}
        </Text>
      </group>
      <mesh position={[-1.2, 0.16, 2.92]}>
        <boxGeometry args={[8.6, 0.08, 0.46]} />
        <meshStandardMaterial color="#374151" roughness={0.58} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`dock-roller-${i}`} position={[-5.15 + i * 0.72, 0.26, 2.92]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.48, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.35} roughness={0.38} />
        </mesh>
      ))}
      <group position={[-4.8, 0, 2.4]}>
        {weights.slice(0, 6).map((w, i) => {
          const active = i === Math.max(0, item - 1) || i === item;
          return (
            <group key={`cargo-${i}`} position={[i * 1.25, 0, 0]}>
              <CargoPallet active={active} weight={w} value={values[i]} />
            </group>
          );
        })}
      </group>
      <ForkliftLoader itemIndex={activeItem} capacity={capacity} capMax={capMax} itemWeight={weights[activeItem] ?? 1} />
    </group>
  );
}

function TicketKioskScene({ dpData, highlights, pointers }: { dpData: DPDisplayData | null; highlights: number[]; pointers: Record<string, unknown> }) {
  const pointerAmount = Number(pointers.amount);
  const amount = Number.isFinite(pointerAmount)
    ? pointerAmount
    : (highlights.find(i => i >= 0) ?? (dpData?.type === '1d' ? Math.max(0, dpData.data.length - 1) : 0));
  const currentStep = usePlaybackStore(s => s.currentStep);
  const coins = [1, 2, 5];
  const pointerCoin = Number(pointers.coin);
  const activeCoin = Number.isFinite(pointerCoin) ? pointerCoin : coins[currentStep % coins.length];
  return (
    <group>
      <mesh position={[0, 0.08, 0]}><boxGeometry args={[22, 0.1, 16]} /><meshStandardMaterial color="#555e63" roughness={0.9} /></mesh>
      <MetroStationConcourse amount={amount} />
      <group position={[-4.8, 0, -2.8]}>
        {[0, 1, 2].map(i => (
          <group key={`kiosk-${i}`} position={[i * 2.25, 0, 0]}>
            <mesh position={[0, 1.4, 0]} castShadow><boxGeometry args={[1.4, 2.8, 0.72]} /><meshStandardMaterial color={i === 1 ? '#0f766e' : '#334155'} roughness={0.55} /></mesh>
            <mesh position={[0, 1.86, 0.39]}><boxGeometry args={[1.0, 0.58, 0.04]} /><meshStandardMaterial color="#020617" emissive="#22d3ee" emissiveIntensity={0.18} /></mesh>
            <Text position={[0, 1.88, 0.43]} fontSize={0.12} color="#bae6fd" anchorX="center">¥{amount}</Text>
            <mesh position={[0, 1.1, 0.4]}><boxGeometry args={[0.7, 0.09, 0.05]} /><meshStandardMaterial color="#fbbf24" /></mesh>
            {i === 1 && <TicketPrinter amount={amount} />}
          </group>
        ))}
        <Text position={[2.25, 3.15, 0.35]} fontSize={0.25} color="#e0f2fe" anchorX="center" outlineWidth={0.008} outlineColor="#111827">
          地铁自助售票区
        </Text>
      </group>
      <group position={[1.8, 0, 2.2]}>
        {coins.map((coin, i) => (
          <group key={`coin-stack-${coin}`} position={[i * 1.5, 0, 0]}>
            {[0, 1, 2, 3].map(j => (
              <mesh key={`coin-${coin}-${j}`} position={[0, 0.12 + j * 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.38, 0.38, 0.06, 24]} />
                <meshStandardMaterial
                  color={coin === 5 ? '#facc15' : coin === 2 ? '#cbd5e1' : '#b45309'}
                  metalness={0.35}
                  roughness={0.36}
                  emissive={coin === activeCoin ? '#f59e0b' : '#000'}
                  emissiveIntensity={coin === activeCoin ? 0.22 : 0}
                />
              </mesh>
            ))}
            <Text position={[0, 0.64, 0]} fontSize={0.14} color={coin === activeCoin ? '#fde68a' : '#f8fafc'} anchorX="center" outlineWidth={0.006} outlineColor="#111827">¥{coin}</Text>
            {coin === activeCoin && (
              <Text position={[0, 0.9, 0]} fontSize={0.1} color="#fde68a" anchorX="center" outlineWidth={0.004} outlineColor="#111827">
                本步尝试
              </Text>
            )}
          </group>
        ))}
      </group>
      <CoinDrop amount={amount} coinValue={activeCoin} />
      <MetroEntrance amount={amount} />
      <group position={[3.9, 0, 4.05]}>
        <mesh position={[0, 0.12, 0]}><boxGeometry args={[2.4, 0.16, 1.0]} /><meshStandardMaterial color="#334155" roughness={0.68} /></mesh>
        <Text position={[0, 0.32, 0.04]} fontSize={0.12} color="#f8fafc" anchorX="center">找零盘</Text>
      </group>
      {dpData && <DPOperationStateBoard dpData={dpData} highlights={highlights} title="找零状态缓存" subtitle="每个金额位置记录最少硬币数，售票机按金额逐步更新" />}
    </group>
  );
}

function CityPathPlanningScene({ dpData, highlights, pointers }: { dpData: DPDisplayData | null; highlights: number[]; pointers: Record<string, unknown> }) {
  const rows = dpData?.type === '2d' ? Math.min(6, dpData.rows.length) : 4;
  const cols = dpData?.type === '2d' ? Math.min(8, dpData.rows[0]?.length ?? 7) : 7;
  const pointerRow = Number(pointers.i);
  const pointerCol = Number(pointers.j);
  const activeRow = Number.isFinite(pointerRow) ? pointerRow : (highlights[0] ?? 0);
  const activeCol = Number.isFinite(pointerCol) ? pointerCol : (highlights.length > 1 ? highlights[1] : cols - 1);
  const safeRow = Math.max(0, Math.min(rows - 1, activeRow));
  const safeCol = Math.max(0, Math.min(cols - 1, activeCol));
  const matrix = dpData?.type === '2d' ? dpData.rows : [];
  const currentVal = matrix[safeRow]?.[safeCol] ?? 1;
  const upVal = safeRow > 0 ? matrix[safeRow - 1]?.[safeCol] : undefined;
  const leftVal = safeCol > 0 ? matrix[safeRow]?.[safeCol - 1] : undefined;
  const formula = safeRow === 0 || safeCol === 0
    ? `边界路口 dp[${safeRow}][${safeCol}] = 1`
    : `dp[${safeRow}][${safeCol}] = 上方 ${upVal ?? '-'} + 左方 ${leftVal ?? '-'} = ${currentVal}`;
  return (
    <group>
      <mesh position={[0, 0.04, 0]}><boxGeometry args={[22, 0.08, 16]} /><meshStandardMaterial color="#40524a" roughness={0.94} /></mesh>
      <Text position={[0, 0.2, -6.9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color="#e0f2fe" anchorX="center" outlineWidth={0.007} outlineColor="#111827">步行街区路径规划</Text>
      <Billboard position={[0, 1.72, -5.25]} follow>
        <mesh position={[0, 0, -0.015]}>
          <planeGeometry args={[8.3, 1.02]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.86} depthWrite={false} />
        </mesh>
        <Text position={[0, 0.25, 0]} fontSize={0.19} color="#bae6fd" anchorX="center" anchorY="middle">
          不同路径：从起点到终点，每次只能向右或向下
        </Text>
        <Text position={[0, -0.16, 0]} fontSize={0.21} color="#fde68a" anchorX="center" anchorY="middle">
          {formula}
        </Text>
      </Billboard>
      {Array.from({ length: rows }).map((_, r) => (
        <mesh key={`path-road-row-${r}`} position={[0, 0.09, -3 + r * 1.2]}>
          <boxGeometry args={[cols * 1.35, 0.06, 0.26]} />
          <meshStandardMaterial color={r === activeRow ? '#475569' : '#30363d'} roughness={0.82} />
        </mesh>
      ))}
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols - 1 }).map((__, c) => (
        <Text key={`right-arrow-${r}-${c}`} position={[-4.04 + c * 1.35, 0.22, -3 + r * 1.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.18} color="#cbd5e1" anchorX="center" anchorY="middle">
          →
        </Text>
      )))}
      {Array.from({ length: rows - 1 }).map((_, r) => Array.from({ length: cols }).map((__, c) => (
        <Text key={`down-arrow-${r}-${c}`} position={[-4.7 + c * 1.35, 0.23, -2.42 + r * 1.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#cbd5e1" anchorX="center" anchorY="middle">
          ↓
        </Text>
      )))}
      {Array.from({ length: rows - 1 }).map((_, r) => Array.from({ length: cols - 1 }).map((__, c) => (
        <group key={`city-block-${r}-${c}`} position={[-4.02 + c * 1.35, 0, -2.4 + r * 1.2]}>
          <mesh position={[0, 0.075, 0]}><boxGeometry args={[0.86, 0.06, 0.66]} /><meshStandardMaterial color={(r + c) % 2 ? '#6b7280' : '#7c8a80'} roughness={0.9} /></mesh>
          {((r + c) % 3 === 0) && (
            <mesh position={[0.28, 0.22, 0.18]}><cylinderGeometry args={[0.04, 0.06, 0.28, 8]} /><meshStandardMaterial color="#36543a" roughness={0.8} /></mesh>
          )}
        </group>
      )))}
      {Array.from({ length: cols }).map((_, c) => (
        <mesh key={`path-road-col-${c}`} position={[-4.7 + c * 1.35, 0.1, 0]}>
          <boxGeometry args={[0.26, 0.06, rows * 1.2]} />
          <meshStandardMaterial color={c === activeCol ? '#475569' : '#30363d'} roughness={0.82} />
        </mesh>
      ))}
      {Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((__, c) => {
        const val = dpData?.type === '2d' ? dpData.rows[r]?.[c] : undefined;
        const active = r === activeRow && c === activeCol;
        const dependency = (r === activeRow - 1 && c === activeCol) || (r === activeRow && c === activeCol - 1);
        return (
          <group key={`intersection-${r}-${c}`} position={[-4.7 + c * 1.35, 0, -3 + r * 1.2]}>
            <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.28, 0.28, 0.08, 24]} /><meshStandardMaterial color={active ? '#f59e0b' : dependency ? '#38bdf8' : '#64748b'} emissive={active ? '#fbbf24' : dependency ? '#22d3ee' : '#000'} emissiveIntensity={active ? 0.26 : dependency ? 0.18 : 0} roughness={0.65} /></mesh>
            {val !== undefined && <Text position={[0, 0.28, 0]} fontSize={0.12} color="#f8fafc" anchorX="center" outlineWidth={0.005} outlineColor="#111827">{val}</Text>}
          </group>
        );
      }))}
      <mesh position={[-4.7, 0.45, -3]}><boxGeometry args={[0.55, 0.7, 0.55]} /><meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.12} /></mesh>
      <mesh position={[-4.7 + (cols - 1) * 1.35, 0.45, -3 + (rows - 1) * 1.2]}><boxGeometry args={[0.55, 0.7, 0.55]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.12} /></mesh>
      <Billboard position={[-4.7, 1.15, -3]} follow>
        <Text fontSize={0.14} color="#bbf7d0" anchorX="center" outlineWidth={0.005} outlineColor="#111827">起点</Text>
      </Billboard>
      <Billboard position={[-4.7 + (cols - 1) * 1.35, 1.15, -3 + (rows - 1) * 1.2]} follow>
        <Text fontSize={0.14} color="#fecaca" anchorX="center" outlineWidth={0.005} outlineColor="#111827">终点</Text>
      </Billboard>
      <PathTransferFlow row={safeRow} col={safeCol} />
      <PathCourier row={safeRow} col={safeCol} cols={cols} />
      {dpData && <DPOperationStateBoard dpData={dpData} highlights={highlights} title="路口路径计数" subtitle="每个路口把上方和左方路径数汇总成当前路线数" />}
    </group>
  );
}

function DocumentProcessingBuilding({ roomTitle, accent }: { roomTitle: string; accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.055, 0]} receiveShadow>
        <boxGeometry args={[22, 0.1, 16]} />
        <meshStandardMaterial color="#4c5356" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.95, -5.8]} castShadow>
        <boxGeometry args={[18.4, 3.8, 0.26]} />
        <meshStandardMaterial color="#6b6f6b" roughness={0.78} />
      </mesh>
      <mesh position={[-9.05, 1.42, -0.35]} castShadow>
        <boxGeometry args={[0.28, 2.7, 10.9]} />
        <meshStandardMaterial color="#5f6662" roughness={0.8} />
      </mesh>
      <mesh position={[9.05, 1.42, -0.35]} castShadow>
        <boxGeometry args={[0.28, 2.7, 10.9]} />
        <meshStandardMaterial color="#5f6662" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.86, -0.35]} castShadow>
        <boxGeometry args={[18.8, 0.3, 11.2]} />
        <meshStandardMaterial color="#414846" roughness={0.84} />
      </mesh>
      {[-7.2, -4.8, -2.4, 0, 2.4, 4.8, 7.2].map(x => (
        <mesh key={`doc-room-post-${x}`} position={[x, 1.88, -5.48]} castShadow>
          <boxGeometry args={[0.18, 3.45, 0.18]} />
          <meshStandardMaterial color="#303735" roughness={0.65} />
        </mesh>
      ))}
      {[-6.25, -3.75, 3.75, 6.25].map((x, i) => (
        <mesh key={`doc-room-window-${i}`} position={[x, 2.25, -5.63]}>
          <boxGeometry args={[1.45, 0.92, 0.05]} />
          <meshStandardMaterial color="#a6c4ce" transparent opacity={0.34} roughness={0.25} metalness={0.08} />
        </mesh>
      ))}
      <mesh position={[0, 3.12, -5.55]}>
        <boxGeometry args={[5.8, 0.54, 0.07]} />
        <meshStandardMaterial color="#18212a" emissive={accent} emissiveIntensity={0.06} roughness={0.5} />
      </mesh>
      <Text position={[0, 3.13, -5.5]} fontSize={0.24} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.007} outlineColor="#111827">
        城市文档处理中心 · {roomTitle}
      </Text>
      <mesh position={[0, 0.12, 2.82]}>
        <boxGeometry args={[16.2, 0.035, 0.1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.12} roughness={0.5} />
      </mesh>
      <Text position={[-7.8, 0.2, 3.15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.18} color="#e5e7eb" anchorX="left" outlineWidth={0.006} outlineColor="#111827">
        {roomTitle}
      </Text>
    </group>
  );
}
function ArchiveRestorationLine({ dpData, highlights, row, col, pair }: {
  dpData: DPDisplayData | null;
  highlights: number[];
  row: number;
  col: number;
  pair: { a: string; b: string };
}) {
  const activeA = row > 0 ? Math.max(0, Math.min(pair.a.length - 1, row - 1)) : -1;
  const activeB = col > 0 ? Math.max(0, Math.min(pair.b.length - 1, col - 1)) : -1;
  const currentA = activeA >= 0 ? pair.a[activeA] : '∅';
  const currentB = activeB >= 0 ? pair.b[activeB] : '∅';
  const matched = currentA !== '∅' && currentA === currentB;
  const value = dpData?.type === '2d' ? dpData.rows[row]?.[col] : undefined;
  return (
    <group>
      <DocumentProcessingBuilding roomTitle="档案修复室" accent="#38bdf8" />
      <group position={[-4.7, 0.2, -1.4]}>
        <mesh position={[0, 0.08, 0]}><boxGeometry args={[8.4, 0.12, 0.7]} /><meshStandardMaterial color="#374151" roughness={0.7} /></mesh>
        <Text position={[-4.0, 0.36, -0.46]} fontSize={0.12} color="#bae6fd" anchorX="left">原始档案 text1</Text>
        {pair.a.split('').slice(0, 9).map((ch, i) => {
          const active = i === activeA;
          return (
            <group key={`archive-a-${i}`} position={[-3.55 + i * 0.82, 0.35, 0]}>
              <mesh castShadow><boxGeometry args={[0.58, 0.48, 0.06]} /><meshStandardMaterial color={active ? '#38bdf8' : '#e5e7eb'} emissive={active ? '#38bdf8' : '#000'} emissiveIntensity={active ? 0.2 : 0} roughness={0.62} /></mesh>
              <Text position={[0, 0, 0.04]} fontSize={0.22} color="#111827" anchorX="center" anchorY="middle">{ch}</Text>
            </group>
          );
        })}
      </group>
      <group position={[-4.7, 0.2, 1.18]}>
        <mesh position={[0, 0.08, 0]}><boxGeometry args={[8.4, 0.12, 0.7]} /><meshStandardMaterial color="#3f3f46" roughness={0.7} /></mesh>
        <Text position={[-4.0, 0.36, -0.46]} fontSize={0.12} color="#fed7aa" anchorX="left">参照档案 text2</Text>
        {pair.b.split('').slice(0, 9).map((ch, i) => {
          const active = i === activeB;
          return (
            <group key={`archive-b-${i}`} position={[-3.55 + i * 0.82, 0.35, 0]}>
              <mesh castShadow><boxGeometry args={[0.58, 0.48, 0.06]} /><meshStandardMaterial color={active ? '#f59e0b' : '#fef3c7'} emissive={active ? '#f59e0b' : '#000'} emissiveIntensity={active ? 0.2 : 0} roughness={0.62} /></mesh>
              <Text position={[0, 0, 0.04]} fontSize={0.22} color="#111827" anchorX="center" anchorY="middle">{ch}</Text>
            </group>
          );
        })}
      </group>
      <group position={[1.65, 0, -0.1]}>
        <mesh position={[0, 0.62, 0]} castShadow><boxGeometry args={[3.7, 0.28, 2.55]} /><meshStandardMaterial color="#8b7f68" roughness={0.76} /></mesh>
        <mesh position={[0, 0.85, 0]}><boxGeometry args={[2.5, 0.05, 1.6]} /><meshStandardMaterial color="#f8fafc" roughness={0.68} /></mesh>
        <Text position={[0, 1.15, -0.98]} fontSize={0.16} color="#e0f2fe" anchorX="center" outlineWidth={0.006} outlineColor="#111827">中央比对台</Text>
        {[{ ch: currentA, x: -0.62, color: '#38bdf8' }, { ch: currentB, x: 0.62, color: '#f59e0b' }].map((card, i) => (
          <group key={`compare-card-${i}`} position={[card.x, 1.02, 0]}>
            <mesh castShadow><boxGeometry args={[0.72, 0.58, 0.08]} /><meshStandardMaterial color={card.color} emissive={card.color} emissiveIntensity={0.16} roughness={0.58} /></mesh>
            <Text position={[0, 0, 0.06]} fontSize={0.28} color="#111827" anchorX="center" anchorY="middle">{card.ch}</Text>
          </group>
        ))}
        <mesh position={[0, 1.55, 0]}><boxGeometry args={[2.2, 0.16, 0.62]} /><meshStandardMaterial color={matched ? '#166534' : '#7f1d1d'} emissive={matched ? '#22c55e' : '#ef4444'} emissiveIntensity={0.18} roughness={0.62} /></mesh>
        <Text position={[0, 1.57, 0.34]} fontSize={0.16} color="#f8fafc" anchorX="center" anchorY="middle">{matched ? '盖章：保留公共片段' : '未匹配：继承历史状态'}</Text>
      </group>
      <group position={[5.8, 0.18, 1.05]}>
        <mesh position={[0, 0.18, 0]}><boxGeometry args={[3.4, 0.12, 0.74]} /><meshStandardMaterial color="#111827" roughness={0.62} /></mesh>
        {Array.from({ length: Math.min(6, Math.max(1, Number(value ?? 1))) }).map((_, i) => (
          <mesh key={`film-strip-${i}`} position={[-1.28 + i * 0.52, 0.34, 0]}><boxGeometry args={[0.42, 0.22, 0.04]} /><meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.15} roughness={0.5} /></mesh>
        ))}
        <Text position={[0, 0.72, 0]} fontSize={0.13} color="#fde68a" anchorX="center" outlineWidth={0.005} outlineColor="#111827">公共片段长度 {value ?? '-'}</Text>
      </group>
      <group position={[0, 2.12, -5.05]} scale={0.5}>
        <TextComparisonMatrixWall dpData={dpData} row={row} col={col} activeAlgorithmId="lcs" />
      </group>
      {dpData && <DPOperationStateBoard dpData={dpData} highlights={highlights} title="档案修复缓存" subtitle="后台屏幕保留 DP 表，前景按字符卡片比对和拼接" />}
    </group>
  );
}

function TextCorrectionWorkshop({ dpData, highlights, row, col, pair }: {
  dpData: DPDisplayData | null;
  highlights: number[];
  row: number;
  col: number;
  pair: { a: string; b: string };
}) {
  const activeA = row > 0 ? Math.max(0, Math.min(pair.a.length - 1, row - 1)) : -1;
  const activeB = col > 0 ? Math.max(0, Math.min(pair.b.length - 1, col - 1)) : -1;
  const currentA = activeA >= 0 ? pair.a[activeA] : '∅';
  const currentB = activeB >= 0 ? pair.b[activeB] : '∅';
  const same = currentA !== '∅' && currentA === currentB;
  const value = dpData?.type === '2d' ? dpData.rows[row]?.[col] : undefined;
  return (
    <group>
      <DocumentProcessingBuilding roomTitle="校对排版室" accent="#f59e0b" />
      <group position={[-4.9, 0.22, -1.65]}>
        <mesh position={[0, 0.08, 0]}><boxGeometry args={[8.2, 0.12, 0.58]} /><meshStandardMaterial color="#334155" roughness={0.7} /></mesh>
        <Text position={[-3.9, 0.38, -0.44]} fontSize={0.12} color="#bfdbfe" anchorX="left">原稿纸带</Text>
        {pair.a.split('').slice(0, 9).map((ch, i) => <Text key={`proof-a-${i}`} position={[-3.45 + i * 0.78, 0.42, 0]} fontSize={0.2} color={i === activeA ? '#38bdf8' : '#f8fafc'} anchorX="center" outlineWidth={0.005} outlineColor="#111827">{ch}</Text>)}
      </group>
      <group position={[-4.9, 0.22, 1.55]}>
        <mesh position={[0, 0.08, 0]}><boxGeometry args={[8.2, 0.12, 0.58]} /><meshStandardMaterial color="#3f3f46" roughness={0.7} /></mesh>
        <Text position={[-3.9, 0.38, -0.44]} fontSize={0.12} color="#fed7aa" anchorX="left">目标稿纸带</Text>
        {pair.b.split('').slice(0, 9).map((ch, i) => <Text key={`proof-b-${i}`} position={[-3.45 + i * 0.78, 0.42, 0]} fontSize={0.2} color={i === activeB ? '#f59e0b' : '#f8fafc'} anchorX="center" outlineWidth={0.005} outlineColor="#111827">{ch}</Text>)}
      </group>
      <group position={[0.2, 0, -0.05]}>
        <mesh position={[0, 0.68, 0]} castShadow><boxGeometry args={[3.4, 0.26, 2.3]} /><meshStandardMaterial color="#7c6f64" roughness={0.76} /></mesh>
        <mesh position={[0, 0.92, 0]}><boxGeometry args={[2.3, 0.05, 1.45]} /><meshStandardMaterial color="#f8fafc" roughness={0.66} /></mesh>
        <Text position={[0, 1.18, -0.92]} fontSize={0.15} color="#e0f2fe" anchorX="center" outlineWidth={0.006} outlineColor="#111827">中央校对台</Text>
        <Text position={[-0.45, 1.04, 0]} fontSize={0.34} color="#111827" anchorX="center">{currentA}</Text>
        <Text position={[0.45, 1.04, 0]} fontSize={0.34} color="#111827" anchorX="center">{currentB}</Text>
        <mesh position={[0, 1.48, 0]}><boxGeometry args={[1.72, 0.16, 0.52]} /><meshStandardMaterial color={same ? '#166534' : '#7f1d1d'} emissive={same ? '#22c55e' : '#ef4444'} emissiveIntensity={0.18} roughness={0.62} /></mesh>
        <Text position={[0, 1.5, 0.3]} fontSize={0.15} color="#f8fafc" anchorX="center" anchorY="middle">{same ? '通过：字符一致' : `当前代价 ${value ?? '-'}`}</Text>
      </group>
      {[{ label: '删除剪刀', x: 3.55, z: -1.35, color: '#ef4444', symbol: 'D' }, { label: '插入字模', x: 5.35, z: 0, color: '#38bdf8', symbol: '+' }, { label: '替换印章', x: 7.15, z: 1.35, color: '#f59e0b', symbol: 'R' }].map((tool, i) => (
        <group key={`edit-tool-${i}`} position={[tool.x, 0, tool.z]}>
          <mesh position={[0, 0.46, 0]} castShadow><boxGeometry args={[1.22, 0.88, 0.9]} /><meshStandardMaterial color="#1f2937" roughness={0.58} /></mesh>
          <mesh position={[0, 1.05, 0]}><boxGeometry args={[0.86, 0.12, 0.62]} /><meshStandardMaterial color={tool.color} emissive={tool.color} emissiveIntensity={!same ? 0.28 : 0.06} roughness={0.5} /></mesh>
          <Text position={[0, 1.08, 0.36]} fontSize={0.22} color="#111827" anchorX="center" anchorY="middle">{tool.symbol}</Text>
          <Text position={[0, 1.45, 0]} fontSize={0.13} color="#f8fafc" anchorX="center" outlineWidth={0.005} outlineColor="#111827">{tool.label}</Text>
        </group>
      ))}
      <group position={[0, 2.12, -5.05]} scale={0.5}>
        <TextComparisonMatrixWall dpData={dpData} row={row} col={col} activeAlgorithmId="edit-distance" />
      </group>
      {dpData && <DPOperationStateBoard dpData={dpData} highlights={highlights} title="校对代价缓存" subtitle="前景展示删除/插入/替换，后台屏幕同步 DP 代价表" />}
    </group>
  );
}
function DocumentReviewScene({ dpData, highlights, pointers, activeAlgorithmId }: { dpData: DPDisplayData | null; highlights: number[]; pointers: Record<string, unknown>; activeAlgorithmId: string }) {
  const pointerRow = Number(pointers.i);
  const pointerCol = Number(pointers.j);
  const row = Number.isFinite(pointerRow) ? pointerRow : (highlights[0] ?? 0);
  const colCount = dpData?.type === '2d' ? Math.min(9, dpData.rows[0]?.length ?? 7) : 7;
  const col = Number.isFinite(pointerCol) ? pointerCol : (highlights.length > 1 ? highlights[1] : colCount - 1);
  const title = activeAlgorithmId === 'edit-distance' ? '文本校正审阅室' : '档案相似度比对室';
  const pair = getTemplateTextPair(activeAlgorithmId);
  const activeA = row > 0 ? row - 1 : -1;
  const activeB = col > 0 ? col - 1 : -1;
  if (activeAlgorithmId === 'edit-distance') {
    return <TextCorrectionWorkshop dpData={dpData} highlights={highlights} row={row} col={col} pair={pair} />;
  }
  return <ArchiveRestorationLine dpData={dpData} highlights={highlights} row={row} col={col} pair={pair} />;
  return (
    <group>
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[22, 0.1, 16]} /><meshStandardMaterial color="#4b5563" roughness={0.9} /></mesh>
      <group position={[0, 0, -1.4]}>
        <mesh position={[-2.8, 0.62, 0]}><boxGeometry args={[3.8, 0.18, 2.5]} /><meshStandardMaterial color="#7c6f64" roughness={0.78} /></mesh>
        <mesh position={[2.8, 0.62, 0]}><boxGeometry args={[3.8, 0.18, 2.5]} /><meshStandardMaterial color="#7c6f64" roughness={0.78} /></mesh>
        {[{ label: 'text1 / 行', text: pair.a, active: activeA, x: -2.8, color: '#38bdf8' }, { label: 'text2 / 列', text: pair.b, active: activeB, x: 2.8, color: '#f59e0b' }].map((doc, i) => (
          <group key={`doc-${i}`} position={[i === 0 ? -2.8 : 2.8, 0.76, 0]}>
            <mesh><boxGeometry args={[2.7, 0.04, 1.8]} /><meshStandardMaterial color="#f8fafc" roughness={0.7} /></mesh>
            <Text position={[-1.16, 0.07, -0.62]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.105} color="#475569" anchorX="left">{doc.label}</Text>
            {doc.text.split('').slice(0, 9).map((ch, ci) => {
              const isActive = ci === doc.active;
              return (
                <group key={`doc-char-${i}-${ci}`} position={[-1.05 + ci * 0.28, 0.075, 0.08]}>
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.22, 0.25]} />
                    <meshStandardMaterial color={isActive ? doc.color : '#e5e7eb'} emissive={isActive ? doc.color : '#000'} emissiveIntensity={isActive ? 0.18 : 0} roughness={0.65} />
                  </mesh>
                  <Text position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.13} color={isActive ? '#111827' : '#111827'} anchorX="center" anchorY="middle">
                    {ch}
                  </Text>
                </group>
              );
            })}
            <mesh position={[0, 0.09, -0.58]}><boxGeometry args={[2.3, 0.035, 0.08]} /><meshStandardMaterial color={i === 0 ? '#38bdf8' : '#f59e0b'} emissive={i === 0 ? '#38bdf8' : '#f59e0b'} emissiveIntensity={0.16} /></mesh>
          </group>
        ))}
        <TextComparisonMatrixWall dpData={dpData} row={row} col={col} activeAlgorithmId={activeAlgorithmId} />
        {[0, 1, 2, 3].map(i => (
          <mesh key={`review-note-${i}`} position={[-4.0 + i * 1.1, 0.92, 1.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.42, 0.28]} />
            <meshStandardMaterial color={i % 2 ? '#f59e0b' : '#38bdf8'} emissive={i % 2 ? '#f59e0b' : '#38bdf8'} emissiveIntensity={0.12} roughness={0.7} />
          </mesh>
        ))}
        <Text position={[0, 2.5, 0]} fontSize={0.28} color="#f8fafc" anchorX="center" outlineWidth={0.008} outlineColor="#111827">{title}</Text>
        <Text position={[0, 2.15, 0]} fontSize={0.15} color="#cbd5e1" anchorX="center">当前扫描第 {row} 行前缀，矩阵值就是比对代价/匹配长度</Text>
      </group>
      {dpData && <DPOperationStateBoard dpData={dpData} highlights={highlights} title="文档比对矩阵" subtitle="行列代表两份文本前缀，当前行来自扫描仪实时写入" />}
    </group>
  );
}

function PatrolPlanningScene({ dpData, highlights }: { dpData: DPDisplayData | null; highlights: number[] }) {
  const active = highlights[0] ?? 0;
  const values = dpData?.type === '1d' ? dpData.data.slice(0, 8) : [2, 7, 9, 3, 1, 5, 6, 4];
  return (
    <group>
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[22, 0.1, 16]} /><meshStandardMaterial color="#3f4a43" roughness={0.92} /></mesh>
      <mesh position={[0, 0.1, 1.8]}><boxGeometry args={[18, 0.06, 1.0]} /><meshStandardMaterial color="#252a30" roughness={0.82} /></mesh>
      <Text position={[0, 0.18, -6.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color="#f8fafc" anchorX="center" outlineWidth={0.008} outlineColor="#111827">街区安防巡逻规划</Text>
      {values.map((value, i) => {
        const selected = i === active;
        return (
          <group key={`security-house-${i}`} position={[-7.5 + i * 2.15, 0, -1.2]}>
            <mesh position={[0, 0.68, 0]} castShadow><boxGeometry args={[1.25, 1.28, 1.15]} /><meshStandardMaterial color={selected ? '#f59e0b' : '#5b6470'} emissive={selected ? '#f59e0b' : '#000'} emissiveIntensity={selected ? 0.2 : 0} roughness={0.74} /></mesh>
            <mesh position={[0, 1.45, 0]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[1.05, 1.05, 1.22]} /><meshStandardMaterial color="#7f1d1d" roughness={0.8} /></mesh>
            <mesh position={[0, 0.62, 0.59]}><boxGeometry args={[0.32, 0.52, 0.05]} /><meshStandardMaterial color="#111827" /></mesh>
            {[-0.33, 0.33].map(x => (
              <mesh key={`house-window-${i}-${x}`} position={[x, 0.93, 0.6]}>
                <boxGeometry args={[0.24, 0.24, 0.045]} />
                <meshStandardMaterial color={selected ? '#fde68a' : '#93c5fd'} emissive={selected ? '#fde68a' : '#2563eb'} emissiveIntensity={selected ? 0.5 : 0.12} />
              </mesh>
            ))}
            <mesh position={[0.52, 1.22, 0.64]} rotation={[0.4, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.22, 10]} />
              <meshStandardMaterial color="#111827" roughness={0.42} />
            </mesh>
            <mesh position={[0, 0.08, 0.94]}><boxGeometry args={[1.5, 0.12, 0.08]} /><meshStandardMaterial color="#6b4423" roughness={0.8} /></mesh>
            <Text position={[0, 1.95, 0]} fontSize={0.14} color="#f8fafc" anchorX="center" outlineWidth={0.006} outlineColor="#111827">{`收益 ${value}`}</Text>
            {selected && <Text position={[0, 2.2, 0]} fontSize={0.12} color="#fde68a" anchorX="center">当前决策</Text>}
            {(Math.abs(i - active) === 1) && (
              <mesh position={[0, 0.08, -0.95]}>
                <boxGeometry args={[1.85, 0.08, 0.08]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.45} transparent opacity={0.72} />
              </mesh>
            )}
          </group>
        );
      })}
      <PatrolCar active={active} />
      {dpData && <DPOperationStateBoard dpData={dpData} highlights={highlights} title="巡逻收益状态" subtitle="每户只在偷/不偷之间取最优，相邻房屋不能同时选择" />}
    </group>
  );
}

function DPOperationDistrictScene({ activeAlgorithmId, dpData, highlights, pointers }: {
  activeAlgorithmId: string;
  dpData: DPDisplayData | null;
  highlights: number[];
  pointers: Record<string, unknown>;
}) {
  if (activeAlgorithmId === 'knapsack-vs-opt' || activeAlgorithmId === 'py-knapsack-vs-opt') {
    return (
      <group>
        <LogisticsLoadingDock dpData={dpData} highlights={highlights} pointers={pointers} />
        {dpData && <DPOperationStateBoard dpData={dpData} highlights={highlights} title="装载决策缓存" subtitle="行=货物批次，列=剩余车厢容量，值=当前最大收益" />}
      </group>
    );
  }
  if (activeAlgorithmId === 'coin-change') return <TicketKioskScene dpData={dpData} highlights={highlights} pointers={pointers} />;
  if (activeAlgorithmId === 'unique-paths') return <CityPathPlanningScene dpData={dpData} highlights={highlights} pointers={pointers} />;
  if (activeAlgorithmId === 'house-robber') return <PatrolPlanningScene dpData={dpData} highlights={highlights} />;
  return <DocumentReviewScene dpData={dpData} highlights={highlights} pointers={pointers} activeAlgorithmId={activeAlgorithmId} />;
}

function DPCampusVacantLot() {
  const treePositions = [
    [-14.2, -9.6], [-10.8, -10.4], [-6.8, -10.1], [6.8, -10.2], [10.8, -10.5], [14.2, -9.7],
    [-14.4, 8.7], [-10.6, 9.6], [10.6, 9.5], [14.4, 8.6],
  ];
  return (
    <group>
      <mesh position={[0, 0.018, 0]} receiveShadow>
        <boxGeometry args={[32, 0.045, 24]} />
        <meshStandardMaterial color="#3f4841" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[25.6, 0.05, 18.4]} />
        <meshStandardMaterial color="#6b7069" roughness={0.92} />
      </mesh>
      {[
        [0, -12, 32, 0.26], [0, 12, 32, 0.26], [-16, 0, 0.26, 24], [16, 0, 0.26, 24],
      ].map(([x, z, w, d], i) => (
        <mesh key={`dp-lot-curb-${i}`} position={[x, 0.1, z]}>
          <boxGeometry args={[w, 0.14, d]} />
          <meshStandardMaterial color="#a3a39a" roughness={0.82} />
        </mesh>
      ))}
      {[
        [-13.8, 0, 2.3, 17.2], [13.8, 0, 2.3, 17.2], [0, -10.5, 25.4, 1.9],
      ].map(([x, z, w, d], i) => (
        <mesh key={`dp-lot-grass-${i}`} position={[x, 0.08, z]}>
          <boxGeometry args={[w, 0.035, d]} />
          <meshStandardMaterial color={i === 2 ? '#38583a' : '#304f35'} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.105, 9.2]}>
        <boxGeometry args={[10.6, 0.04, 3.2]} />
        <meshStandardMaterial color="#77736a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.13, 11.25]}>
        <boxGeometry args={[5.4, 0.055, 1.18]} />
        <meshStandardMaterial color="#4f5554" roughness={0.88} />
      </mesh>
      <Text position={[0, 0.22, 10.82]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.24} color="#e5e7eb" anchorX="center" outlineWidth={0.006} outlineColor="#111827">
        DP 运营园区空地
      </Text>
      {[-5.6, -3.6, -1.6, 1.6, 3.6, 5.6].map(x => (
        <mesh key={`dp-campus-parking-${x}`} position={[x, 0.14, 9.9]}>
          <boxGeometry args={[0.08, 0.035, 1.15]} />
          <meshStandardMaterial color="#e5e7eb" transparent opacity={0.62} />
        </mesh>
      ))}
      {treePositions.map(([x, z], i) => (
        <group key={`dp-campus-tree-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.055, 0.08, 0.84, 7]} />
            <meshStandardMaterial color="#584638" roughness={0.88} />
          </mesh>
          <mesh position={[0, 1.02, 0]} scale={[0.78, 0.9, 0.78]}>
            <sphereGeometry args={[0.54, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? '#315f3c' : '#3f6d42'} roughness={0.96} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DPConstructionYard({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const optimizedTraces = usePlaybackStore(s => s.optimizedTraces);
  const currentStep = usePlaybackStore(s => s.currentStep);
  const lastOptimizedSnapshot = optimizedTraces.length > 0
    ? optimizedTraces[Math.min(currentStep, optimizedTraces.length - 1)]
    : null;
  const snapshot = optimizedSnapshot ?? lastOptimizedSnapshot ?? naiveSnapshot;
  const matrix = snapshot?.data?.matrix as number[][] | undefined;
  const arr = snapshot?.data?.array as number[] | undefined;
  const highlights = snapshot?.highlights?.map(Number) ?? [];
  const pointers = (snapshot?.pointers ?? {}) as Record<string, unknown>;

  const dpData = useMemo(() => {
    if (matrix && matrix.length > 0) {
      const validRows = matrix.filter(r => Array.isArray(r));
      if (validRows.length > 0) {
        const is2d = validRows[0].length > 1 || validRows.length > 2;
        if (is2d) { return { type: '2d' as const, rows: validRows.slice(0, 12).map(r => r.slice(0, 12).map(v => Math.round(v * 100) / 100)) }; }
        return { type: '1d' as const, data: validRows[0].slice(0, 20).map(v => Math.round(v * 100) / 100) };
      }
    }
    if (arr) return { type: '1d' as const, data: arr.slice(0, 20).map(v => Math.round(v * 100) / 100) };
    return null;
  }, [matrix, arr]);

  const labelMap: Record<string, string> = {
    'knapsack-vs-opt': '物流装载月台',
    'py-knapsack-vs-opt': '物流装载月台',
    'lcs': '档案相似度比对室',
    'coin-change': '地铁自助售票区',
    'edit-distance': '文本校正审阅室',
    'unique-paths': '步行街区路径规划',
    'house-robber': '街区安防巡逻规划',
  };

  return (
    <group position={[0, 0, 26]}>
      <DPCampusVacantLot />
      <DPOperationDistrictScene activeAlgorithmId={activeAlgorithmId} dpData={dpData} highlights={highlights} pointers={pointers} />
      <group position={[0, 0.18, 7.25]}>
        <mesh><boxGeometry args={[7.6, 0.14, 0.56]} /><meshStandardMaterial color="#111827" emissive="#38bdf8" emissiveIntensity={0.06} roughness={0.64} /></mesh>
        <Text position={[0, 0.23, 0.04]} fontSize={0.22} color="#e0f2fe" anchorX="center" outlineWidth={0.007} outlineColor="#020617">
          城市运营决策区 · {labelMap[activeAlgorithmId] || '动态规划'}
        </Text>
      </group>

      {/* Status description */}
      {snapshot?.description && (
        <group position={[0, 0.7, -3.5]}>
          <mesh><planeGeometry args={[7, 0.8]} /><meshStandardMaterial color="#0f172a" transparent opacity={0.85} /></mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.16} color="#e2e8f0" anchorX="center" anchorY="middle" maxWidth={6.5}>
            {snapshot.description}
          </Text>
        </group>
      )}

      {/* Help button */}
      <group position={[0, 0.3, 8]}>
        <mesh onClick={() => setShowHelp(true, DP_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'knapsack-vs-opt')}><boxGeometry args={[1.6, 0.2, 0.05]} /><meshStandardMaterial color="#1e293b" emissive="#38bdf8" emissiveIntensity={0.08} /></mesh>
        <Text position={[0, 0, 0.04]} fontSize={0.12} color="#e0f2fe" anchorX="center" anchorY="middle" onClick={() => setShowHelp(true, DP_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'knapsack-vs-opt')}>说明</Text>
      </group>
    </group>
  );
}

type StringDisplayState = {
  text: string;
  secondaryText: string;
  pattern: string;
  highlights: number[];
  secondaryHighlights: number[];
  left: number;
  right: number;
  scannerIndex: number;
  scannerX: number;
  patternOffset: number;
  windowWidth: number;
  countBins: [string, number][];
  description: string;
};

const STRING_CHAR_SPACING = 0.58;

function textFromUnknown(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(v => String(v)).join('');
  return '';
}

function charX(index: number, length: number, spacing = STRING_CHAR_SPACING): number {
  return -((Math.max(length, 1) - 1) * spacing) / 2 + index * spacing;
}

function getStringDisplayState(snapshot: TraceSnapshot | null, activeAlgorithmId: string): StringDisplayState {
  const templateData = allTemplates.find(t => t.id === activeAlgorithmId)?.defaultData;
  const rawData = snapshot?.data ?? templateData;
  const data = rawData && typeof rawData === 'object' && !Array.isArray(rawData) ? rawData as Record<string, unknown> : null;
  const template = templateData && typeof templateData === 'object' && !Array.isArray(templateData) ? templateData as Record<string, unknown> : null;
  const fallbackString = textFromUnknown(rawData) || textFromUnknown(templateData);
  const text = textFromUnknown(data?.text ?? data?.text1 ?? template?.text ?? template?.text1 ?? fallbackString);
  const secondaryText = textFromUnknown(data?.text2 ?? template?.text2 ?? '');
  const pattern = textFromUnknown(data?.pattern ?? template?.pattern ?? '');
  const rawHighlights = (snapshot?.highlights ?? []).map(Number).filter(Number.isFinite);
  const secondaryHighlights = activeAlgorithmId === 'anagram'
    ? rawHighlights.filter(i => i >= 20).map(i => i - 20)
    : [];
  const highlights = activeAlgorithmId === 'anagram'
    ? rawHighlights.filter(i => i >= 0 && i < 20)
    : rawHighlights;
  const length = Math.max(text.length, 1);
  const first = THREE.MathUtils.clamp(highlights[0] ?? 0, 0, length - 1);
  const last = THREE.MathUtils.clamp(highlights[highlights.length - 1] ?? first, 0, length - 1);
  const left = Math.min(first, last);
  const right = Math.max(first, last);
  const scannerIndex = activeAlgorithmId === 'longest-substring' ? right : first;
  const scannerX = charX(scannerIndex, length);
  const patternOffset = pattern ? charX(left, length) : scannerX;
  const windowWidth = Math.max(0.62, (right - left + 1) * STRING_CHAR_SPACING);
  const countMap = data?.counts && typeof data.counts === 'object' && !Array.isArray(data.counts)
    ? data.counts as Record<string, unknown>
    : null;
  const counts = new Map<string, number>();
  if (countMap) {
    Object.entries(countMap).forEach(([ch, value]) => {
      const n = Number(value);
      if (Number.isFinite(n)) counts.set(ch, n);
    });
  } else {
    const countSource = `${text}${secondaryText}`;
    countSource.split('').forEach(ch => counts.set(ch, (counts.get(ch) ?? 0) + 1));
  }
  const countBins = Array.from(counts.entries()).slice(0, 10);
  return {
    text,
    secondaryText,
    pattern,
    highlights,
    secondaryHighlights,
    left,
    right,
    scannerIndex,
    scannerX,
    patternOffset,
    windowWidth,
    countBins,
    description: snapshot?.description ?? allTemplates.find(t => t.id === activeAlgorithmId)?.name ?? '字符串处理',
  };
}

/* ======= SIGN SHOP — 广告招牌制作工坊 ======= */

function SignShopWorkshop({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const activeSnapshot = optimizedSnapshot ?? naiveSnapshot;
  const state = useMemo(() => getStringDisplayState(activeSnapshot, activeAlgorithmId), [activeSnapshot, activeAlgorithmId]);
  if (!STRING_IDS.has(activeAlgorithmId)) return null;

  const text = state.text.slice(0, 20);
  const pattern = state.pattern.slice(0, 6);
  const chars = text.split('');
  const patChars = pattern.split('');

  return (
    <group position={[58, 0, -30]} rotation={[0, -0.15, 0]}>
      {/* ==== FLOOR ==== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#7a7d80" roughness={0.95} />
      </mesh>
      {/* Floor stain patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.015, 1.8]}>
        <circleGeometry args={[1.2, 12]} />
        <meshStandardMaterial color="#6b6e71" roughness={0.98} transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, 0.015, -2.2]}>
        <circleGeometry args={[0.8, 12]} />
        <meshStandardMaterial color="#686b6e" roughness={0.98} transparent opacity={0.5} />
      </mesh>

      {/* ==== WALLS ==== */}
      {/* Back wall */}
      <mesh position={[0, 2.8, -7]} receiveShadow>
        <boxGeometry args={[18.5, 5.6, 0.35]} />
        <meshStandardMaterial color="#c4b5a3" roughness={0.92} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-9, 2.8, 0]} receiveShadow>
        <boxGeometry args={[0.35, 5.6, 14.5]} />
        <meshStandardMaterial color="#c4b5a3" roughness={0.92} />
      </mesh>
      {/* Right wall with window cutout - represented as wall segments */}
      <mesh position={[9, 2.8, -3.5]} receiveShadow>
        <boxGeometry args={[0.35, 5.6, 7]} />
        <meshStandardMaterial color="#c4b5a3" roughness={0.92} />
      </mesh>
      <mesh position={[9, 2.8, 4.5]} receiveShadow>
        <boxGeometry args={[0.35, 5.6, 5]} />
        <meshStandardMaterial color="#c4b5a3" roughness={0.92} />
      </mesh>
      {/* Window frame on right wall */}
      <mesh position={[9, 2.2, 1.2]}>
        <boxGeometry args={[0.12, 2.4, 3.6]} />
        <meshStandardMaterial color="#5c4a3a" roughness={0.78} />
      </mesh>
      {/* Window glass */}
      <mesh position={[9, 2.2, 1.2]}>
        <boxGeometry args={[0.06, 2.2, 3.4]} />
        <meshStandardMaterial color="#a5c4e0" roughness={0.15} transparent opacity={0.35} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5.6, 0]}>
        <planeGeometry args={[18.5, 14.5]} />
        <meshStandardMaterial color="#d4c5b3" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ==== CEILING BEAMS ==== */}
      {[-6, -2, 2, 6].map(x => (
        <mesh key={`beam-${x}`} position={[x, 5.4, 0]}>
          <boxGeometry args={[0.15, 0.25, 14]} />
          <meshStandardMaterial color="#8b7d6b" roughness={0.88} />
        </mesh>
      ))}

      {/* ==== FLUORESCENT LIGHTS ==== */}
      {[[-4.5, -3], [4.5, -3], [-4.5, 3], [4.5, 3]].map(([lx, lz], i) => (
        <group key={`fluoro-${i}`} position={[lx, 5.15, lz]}>
          <mesh>
            <boxGeometry args={[2.8, 0.08, 0.18]} />
            <meshStandardMaterial color="#e8e4dc" emissive="#f5f0e8" emissiveIntensity={0.45} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[2.9, 0.04, 0.22]} />
            <meshStandardMaterial color="#9e9a92" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* ==== TOOL WALL (on back wall) ==== */}
      <group position={[-5.5, 2.2, -6.72]}>
        <mesh>
          <boxGeometry args={[4.5, 3.2, 0.08]} />
          <meshStandardMaterial color="#5c4a3a" roughness={0.85} />
        </mesh>
        {/* Tools hanging */}
        {[
          [-1.6, 0.8], [-0.8, 0.6], [0, 0.9], [0.8, 0.5], [1.6, 0.7]
        ].map(([tx, ty], i) => (
          <mesh key={`tool-${i}`} position={[tx, ty, 0.08]} rotation={[0, 0, (i % 2 === 0 ? 0.15 : -0.1)]}>
            <boxGeometry args={[0.06 + (i % 3) * 0.02, 0.38 + (i % 2) * 0.12, 0.05]} />
            <meshStandardMaterial color={['#7a8a6a', '#8a7a6a', '#6a7a8a', '#8a8a7a', '#7a6a8a'][i]} roughness={0.65} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* ==== MATERIAL RACKS ==== */}
      {/* Vinyl rolls rack */}
      <group position={[7.2, 0, -5]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[2.2, 2.2, 0.6]} />
          <meshStandardMaterial color="#5a524a" roughness={0.88} />
        </mesh>
        {/* Horizontal bars */}
        {[0.4, 1.0, 1.6].map((y, i) => (
          <mesh key={`rack-bar-${i}`} position={[0, y, 0.12]}>
            <cylinderGeometry args={[0.025, 0.025, 2.0, 6]} />
            <meshStandardMaterial color="#8a827a" roughness={0.7} metalness={0.4} />
          </mesh>
        ))}
        {/* Rolls */}
        {[
          [-0.7, 0.55, '#e8e0d8'], [0, 0.55, '#d0c8c0'], [0.7, 0.55, '#e0d8d0'],
          [-0.5, 1.15, '#f0e8e0'], [0.4, 1.15, '#c8c0b8'],
          [-0.3, 1.75, '#d8d0c8'], [0.5, 1.75, '#e8e0d8']
        ].map((item, i) => {
          const [rx, ry, rc] = item as [number, number, string];
          return (
            <mesh key={`roll-${i}`} position={[rx, ry, 0.18]} rotation={[0, 0, 1.57]}>
              <cylinderGeometry args={[0.18, 0.18, 0.42, 10]} />
              <meshStandardMaterial color={rc} roughness={0.75} />
            </mesh>
          );
        })}
      </group>

      {/* ==== PAINT CANS ==== */}
      <group position={[-7.5, 0, 4]}>
        {[
          [0, 0, '#c0392b'], [0.5, 0, '#2980b9'], [1.0, 0, '#27ae60'],
          [0.25, 0, '#f39c12'], [0.75, 0, '#8e44ad']
        ].map((item: (string | number)[], i: number) => (
          <group key={`paint-${i}`} position={[item[0] as number, 0, i * 0.55 - 1.1]}>
            <mesh position={[0, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, 0.36, 10]} />
              <meshStandardMaterial color="#7a726a" roughness={0.8} metalness={0.4} />
            </mesh>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.04, 10]} />
              <meshStandardMaterial color={item[2] as string} roughness={0.65} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ==== MAIN WORKBENCH ==== */}
      <group position={[0, 0, -1.5]}>
        {/* Table top */}
        <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 0.12, 3.2]} />
          <meshStandardMaterial color="#a08060" roughness={0.82} />
        </mesh>
        {/* Edge trim */}
        <mesh position={[0, 0.72, 1.6]} castShadow>
          <boxGeometry args={[12, 0.08, 0.04]} />
          <meshStandardMaterial color="#806040" roughness={0.78} />
        </mesh>
        {/* Legs */}
        {[[-5.5, -1.4], [5.5, -1.4], [-5.5, 1.4], [5.5, 1.4]].map(([lx, lz], i) => (
          <mesh key={`leg-${i}`} position={[lx, 0.38, lz]} castShadow>
            <boxGeometry args={[0.12, 0.76, 0.12]} />
            <meshStandardMaterial color="#5a4838" roughness={0.88} />
          </mesh>
        ))}
        {/* Cross braces */}
        <mesh position={[-5.5, 0.25, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 2.6]} />
          <meshStandardMaterial color="#6a5848" roughness={0.85} />
        </mesh>
        <mesh position={[5.5, 0.25, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 2.6]} />
          <meshStandardMaterial color="#6a5848" roughness={0.85} />
        </mesh>
      </group>

      {/* ==== SIGN BOARD ON TABLE ==== */}
      <group position={[0, 0.88, -1.5]}>
        {/* Main board backing */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[10.5, 0.06, 2.4]} />
          <meshStandardMaterial color="#f0ece4" roughness={0.72} />
        </mesh>
        {/* Board frame */}
        <mesh position={[0, 0.12, -1.2]}>
          <boxGeometry args={[10.7, 0.08, 0.06]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.12, 1.2]}>
          <boxGeometry args={[10.7, 0.08, 0.06]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.82} />
        </mesh>
        <mesh position={[-5.3, 0.12, 0]}>
          <boxGeometry args={[0.06, 0.08, 2.5]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.82} />
        </mesh>
        <mesh position={[5.3, 0.12, 0]}>
          <boxGeometry args={[0.06, 0.08, 2.5]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.82} />
        </mesh>

        {/* Character tiles on the sign board */}
        {chars.map((ch, i) => {
          const isActive = activeAlgorithmId === 'longest-substring'
            ? (i >= state.left && i <= state.right)
            : activeAlgorithmId === 'longest-palindrome'
              ? (i >= state.left && i <= state.right)
              : state.highlights.includes(i);
          return (
            <group key={`tile-${i}`} position={[charX(i, chars.length), isActive ? 0.29 : 0.16, 0]}>
              {/* Tile shadow/indent */}
              <mesh position={[0, -0.01, 0]}>
                <boxGeometry args={[0.42, 0.02, 0.42]} />
                <meshStandardMaterial color="#d8d4cc" roughness={0.9} />
              </mesh>
              {/* Tile body */}
              <mesh position={[0, 0.04, 0]} castShadow>
                <boxGeometry args={[0.4, 0.08, 0.4]} />
                <meshStandardMaterial
                  color={isActive ? '#d97706' : '#e8e4dc'}
                  emissive={isActive ? '#f59e0b' : '#000'}
                  emissiveIntensity={isActive ? 0.25 : 0}
                  roughness={0.55}
                />
              </mesh>
              {/* Letter */}
              <Text position={[0, 0.09, 0.21]} fontSize={0.22} color="#2d2a26" anchorX="center" anchorY="middle">
                {ch}
              </Text>
            </group>
          );
        })}

        {/* Pattern template for KMP */}
        {patChars.length > 0 && activeAlgorithmId === 'string-search' && (
          <group position={[state.patternOffset, 0.22, 0.65]}>
            {/* Template backing */}
            <mesh>
              <boxGeometry args={[Math.max(1.2, patChars.length * STRING_CHAR_SPACING + 0.3), 0.04, 0.52]} />
              <meshStandardMaterial color="#2c3e50" emissive="#3498db" emissiveIntensity={0.08} roughness={0.7} />
            </mesh>
            {/* Template label */}
            <Text position={[0, 0.06, 0.28]} fontSize={0.1} color="#aed6f1" anchorX="center">模板: {pattern}</Text>
            {/* Template highlight border */}
            <mesh position={[0, 0.03, 0]}>
              <boxGeometry args={[Math.max(1.2, patChars.length * STRING_CHAR_SPACING + 0.3), 0.02, 0.54]} />
              <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.3} transparent opacity={0.4} />
            </mesh>
          </group>
        )}

        {/* Symmetry mirror for palindrome */}
        {activeAlgorithmId === 'longest-palindrome' && chars.length > 0 && (
          <group>
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.04, 0.42, 2.2]} />
              <meshStandardMaterial color="#c0c0c0" emissive="#e0e0e0" emissiveIntensity={0.15} roughness={0.15} metalness={0.8} />
            </mesh>
            {/* Mirror frame */}
            <mesh position={[0, 0.28, -1.1]}>
              <boxGeometry args={[0.06, 0.46, 0.04]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.28, 1.1]}>
              <boxGeometry args={[0.06, 0.46, 0.04]} />
              <meshStandardMaterial color="#5a4a3a" roughness={0.8} />
            </mesh>
            {/* Symmetry markers */}
            <mesh position={[charX(state.left, chars.length), 0.38, 0.55]}>
              <boxGeometry args={[0.06, 0.18, 0.06]} />
              <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[charX(state.right, chars.length), 0.38, 0.55]}>
              <boxGeometry args={[0.06, 0.18, 0.06]} />
              <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.35} />
            </mesh>
          </group>
        )}

        {/* Inspection window for longest-substring */}
        {activeAlgorithmId === 'longest-substring' && (
          <group position={[(charX(state.left, chars.length) + charX(state.right, chars.length)) / 2, 0.32, 0.55]}>
            <mesh>
              <boxGeometry args={[state.windowWidth + 0.28, 0.04, 0.48]} />
              <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.18} transparent opacity={0.35} />
            </mesh>
            <Text position={[0, 0.08, 0.26]} fontSize={0.09} color="#aed6f1" anchorX="center">质检窗口 [{state.left},{state.right}]</Text>
          </group>
        )}

        {/* Scanner bar */}
        {(activeAlgorithmId === 'string-search' || activeAlgorithmId === 'longest-substring' || activeAlgorithmId === 'longest-palindrome' || activeAlgorithmId === 'anagram') && (
          <group position={[state.scannerX, 0.42, 0]}>
            <mesh>
              <boxGeometry args={[0.08, 0.28, 2.5]} />
              <meshStandardMaterial color="#f39c12" emissive="#f39c12" emissiveIntensity={0.2} transparent opacity={0.25} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <boxGeometry args={[0.12, 0.04, 2.5]} />
              <meshStandardMaterial color="#e67e22" roughness={0.6} metalness={0.3} />
            </mesh>
          </group>
        )}
      </group>

      {/* ==== ANAGRAM: SECOND TABLE ==== */}
      {activeAlgorithmId === 'anagram' && (
        <group>
          {/* Second workbench */}
          <group position={[0, 0, 2.5]}>
            <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
              <boxGeometry args={[8, 0.12, 2.4]} />
              <meshStandardMaterial color="#a08060" roughness={0.82} />
            </mesh>
            {[[-3.5, -1], [3.5, -1], [-3.5, 1], [3.5, 1]].map(([lx, lz], i) => (
              <mesh key={`leg2-${i}`} position={[lx, 0.38, lz]} castShadow>
                <boxGeometry args={[0.12, 0.76, 0.12]} />
                <meshStandardMaterial color="#5a4838" roughness={0.88} />
              </mesh>
            ))}
          </group>
          {/* Comparison tiles on second table */}
          <group position={[0, 0.88, 2.5]}>
            <Text position={[0, 0.45, -1.1]} fontSize={0.14} color="#e8e4dc" anchorX="center">比对字粒</Text>
            {state.secondaryText.slice(0, 12).split('').map((ch, i) => {
              const isActive = state.secondaryHighlights.includes(i);
              return (
                <group key={`ana-tile-${i}`} position={[charX(i, 12, 0.55), isActive ? 0.2 : 0.08, 0.2]}>
                  <mesh position={[0, 0.04, 0]} castShadow>
                    <boxGeometry args={[0.4, 0.08, 0.4]} />
                    <meshStandardMaterial color={isActive ? '#27ae60' : '#e8e4dc'} emissive={isActive ? '#2ecc71' : '#000'} emissiveIntensity={isActive ? 0.2 : 0} roughness={0.55} />
                  </mesh>
                  <Text position={[0, 0.09, 0.21]} fontSize={0.2} color="#2d2a26" anchorX="center" anchorY="middle">{ch}</Text>
                </group>
              );
            })}
            {state.secondaryHighlights.length > 0 && (
              <group position={[charX(state.secondaryHighlights[0], Math.max(1, state.secondaryText.length), 0.55), 0.42, 0.2]}>
                <mesh>
                  <boxGeometry args={[0.1, 0.26, 1.05]} />
                  <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.28} transparent opacity={0.42} />
                </mesh>
              </group>
            )}
            {/* Count comparison board */}
            <group position={[0, 0.15, 0.8]}>
              <mesh>
                <boxGeometry args={[5.5, 0.04, 1.2]} />
                <meshStandardMaterial color="#5a4a3a" roughness={0.82} />
              </mesh>
              {state.countBins.slice(0, 8).map(([ch, count], i) => (
                <group key={`count-${ch}`} position={[-2.2 + i * 0.65, 0.08, 0]}>
                  <mesh position={[0, 0.12 + count * 0.03, 0]} castShadow>
                    <boxGeometry args={[0.48, 0.24 + count * 0.06, 0.48]} />
                    <meshStandardMaterial color={count % 2 === 0 ? '#1e6b5e' : '#1a5e52'} roughness={0.78} />
                  </mesh>
                  <Text position={[0, 0.32 + count * 0.06, 0.25]} fontSize={0.12} color="#e8f5e9" anchorX="center">{ch}:{count}</Text>
                </group>
              ))}
            </group>
          </group>
        </group>
      )}

      {/* ==== ALGORITHM NAMEPLATE ==== */}
      <group position={[0, 2.05, -6.65]}>
        <mesh>
          <boxGeometry args={[5.5, 0.55, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#7c3aed" emissiveIntensity={0.04} roughness={0.7} />
        </mesh>
        <Text position={[0, 0.04, 0.06]} fontSize={0.2} color="#e8e4dc" anchorX="center" anchorY="middle" outlineWidth={0.006} outlineColor="#0f0a1e">
          {state.description}
        </Text>
      </group>

      {/* ==== SHOP SIGN ==== */}
      <group position={[0, 3.6, -6.7]}>
        <mesh>
          <boxGeometry args={[6.5, 1.2, 0.15]} />
          <meshStandardMaterial color="#2c3e50" emissive="#7c3aed" emissiveIntensity={0.05} roughness={0.72} />
        </mesh>
        <Text position={[0, 0.15, 0.1]} fontSize={0.38} color="#d8c4fc" anchorX="center" outlineWidth={0.012} outlineColor="#1a0a2e">
          广告招牌制作工坊
        </Text>
        <Text position={[0, -0.28, 0.1]} fontSize={0.13} color="#b8a4dc" anchorX="center">
          SIGN MAKING WORKSHOP
        </Text>
      </group>

      {/* ==== RULER / MEASURING TOOLS ON TABLE ==== */}
      <group position={[4.5, 0.88, -2.2]}>
        <mesh rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.5, 0.02, 0.08]} />
          <meshStandardMaterial color="#c0b8a8" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Ruler markings */}
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={`mark-${i}`} position={[-1.1 + i * 0.22, 0.03, 0]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.01, 0.03, 0.01]} />
            <meshStandardMaterial color="#5a524a" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* ==== DESCRIPTION TEXT ==== */}
      <Text position={[0, 0.35, 4.5]} fontSize={0.14} color="#e8e4dc" anchorX="center" maxWidth={14}>
        {state.description}
      </Text>

      {/* ==== HELP BUTTON ==== */}
      <group position={[7.5, 1.2, 5.5]}>
        <mesh onClick={() => setShowHelp(true, STRING_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'string-search')} castShadow>
          <boxGeometry args={[1.6, 0.5, 0.12]} />
          <meshStandardMaterial color="#5a4a3a" roughness={0.82} />
        </mesh>
        <Text position={[0, 0.06, 0.07]} fontSize={0.16} color="#e8e4dc" anchorX="center" anchorY="middle">说明</Text>
      </group>
      <Html position={[7.8, 2.6, 5.2]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}>
        <div onClick={() => setShowHelp(true, STRING_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'string-search')} style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(251,191,36,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#111827', fontSize: 17,
          fontWeight: 800, boxShadow: '0 0 14px rgba(251,191,36,0.7)',
          userSelect: 'none',
        }}>?</div>
      </Html>
    </group>
  );
}


type RawTreeNode = {
  value?: unknown;
  id?: unknown;
  label?: unknown;
  left?: RawTreeNode | null;
  right?: RawTreeNode | null;
  children?: RawTreeNode[];
  tree?: RawTreeNode;
};

type ForestryNode = {
  value: string;
  x: number;
  y: number;
  z: number;
  depth: number;
  order: number;
  branch: 'root' | 'left' | 'right';
  parent?: ForestryNode;
};

function forestryTerrainHeight(x: number, z: number): number {
  const northSlope = THREE.MathUtils.clamp((z + 9.8) / 20.2, 0, 1) * 0.46;
  const westShoulder = 0.16 * Math.exp(-((x + 6.6) ** 2 / 48 + (z - 3.8) ** 2 / 42));
  const eastShoulder = 0.12 * Math.exp(-((x - 6.9) ** 2 / 54 + (z - 1.9) ** 2 / 54));
  const entranceCut = 0.12 * Math.exp(-((x) ** 2 / 24 + (z + 6.4) ** 2 / 7.5));
  const microRelief = Math.sin(x * 0.42 + z * 0.18) * 0.018 + Math.cos(z * 0.36) * 0.012;
  return 0.08 + northSlope + westShoulder + eastShoulder - entranceCut + microRelief;
}

function fallbackTree(): RawTreeNode {
  return {
    value: 8,
    left: {
      value: 4,
      left: { value: 2, left: null, right: null },
      right: { value: 6, left: null, right: null },
    },
    right: {
      value: 12,
      left: { value: 10, left: null, right: null },
      right: { value: 14, left: null, right: null },
    },
  };
}

function normalizeTreeRoot(input: unknown): RawTreeNode | null {
  if (!input || typeof input !== 'object') return null;
  const node = input as RawTreeNode;
  if (node.tree) return normalizeTreeRoot(node.tree);
  const hasValue = node.value !== undefined || node.id !== undefined || node.label !== undefined;
  const hasChildren = Boolean(node.left || node.right || (Array.isArray(node.children) && node.children.length > 0));
  return hasValue || hasChildren ? node : null;
}

function extractTreeRoot(snapshot: TraceSnapshot | null): RawTreeNode {
  const data = snapshot?.data as unknown;
  const root = normalizeTreeRoot(data);
  return root ?? fallbackTree();
}

function nodeValue(node: RawTreeNode, order: number): string {
  const raw = node.value ?? node.id ?? node.label ?? order + 1;
  return String(raw);
}

function treeChildren(node: RawTreeNode): { child: RawTreeNode; branch: 'left' | 'right' }[] {
  const out: { child: RawTreeNode; branch: 'left' | 'right' }[] = [];
  if (node.left) out.push({ child: node.left, branch: 'left' });
  if (node.right) out.push({ child: node.right, branch: 'right' });
  if (out.length === 0 && Array.isArray(node.children)) {
    node.children.filter(Boolean).slice(0, 2).forEach((child, i) => out.push({ child, branch: i === 0 ? 'left' : 'right' }));
  }
  return out;
}

function buildForestryLayout(root: RawTreeNode): ForestryNode[] {
  const out: ForestryNode[] = [];
  let order = 0;
  const walk = (node: RawTreeNode, depth: number, x: number, z: number, spread: number, branch: 'root' | 'left' | 'right', parent?: ForestryNode) => {
    const item: ForestryNode = { value: nodeValue(node, order), x, y: forestryTerrainHeight(x, z), z, depth, order, branch, parent };
    order += 1;
    out.push(item);
    const children = treeChildren(node);
    if (children[0]) walk(children[0].child, depth + 1, x - spread, z + 2.35, Math.max(1.15, spread * 0.58), 'left', item);
    if (children[1]) walk(children[1].child, depth + 1, x + spread, z + 2.35, Math.max(1.15, spread * 0.58), 'right', item);
  };
  walk(root, 0, 0, -2.9, 4.4, 'root');
  return out.slice(0, 15);
}

function getActiveTreeValues(snapshot: TraceSnapshot | null): Set<string> {
  const values = new Set<string>();
  snapshot?.highlights?.forEach(v => values.add(String(v)));
  const array = (snapshot?.data as Record<string, unknown> | undefined)?.array;
  if (Array.isArray(array) && array.length > 0) {
    values.add(String(array[array.length - 1]));
    array.slice(-5).forEach(v => values.add(String(v)));
  }
  const tree = normalizeTreeRoot((snapshot?.data as Record<string, unknown> | undefined)?.tree);
  if (values.size === 0 && tree?.value !== undefined) values.add(String(tree.value));
  return values;
}

function getTreeFocusValue(snapshot: TraceSnapshot | null): string | null {
  const data = snapshot?.data as Record<string, unknown> | undefined;
  const current = data?.current;
  if (current !== undefined && current !== null) return String(current);
  const array = data?.array;
  if (Array.isArray(array) && array.length > 0) return String(array[array.length - 1]);
  const highlights = snapshot?.highlights ?? [];
  if (highlights.length > 0) return String(highlights[highlights.length - 1]);
  const tree = normalizeTreeRoot(data?.tree);
  return tree?.value !== undefined ? String(tree.value) : null;
}

function ForestryPine({ x, z, y = forestryTerrainHeight(x, z), scale = 1, color = '#244f34' }: { x: number; z: number; y?: number; scale?: number; color?: string }) {
  return (
    <group position={[x, y, z]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.84, 7]} />
        <meshStandardMaterial color="#574331" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <coneGeometry args={[0.42, 0.92, 8]} />
        <meshStandardMaterial color={color} roughness={0.94} />
      </mesh>
      <mesh position={[0, 1.48, 0]} castShadow>
        <coneGeometry args={[0.32, 0.78, 8]} />
        <meshStandardMaterial color={color} roughness={0.94} />
      </mesh>
    </group>
  );
}

function ForestryRock({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, forestryTerrainHeight(x, z), z]} scale={[scale, scale * 0.72, scale]}>
      <mesh position={[0, 0.28, 0]} rotation={[0.1, 0.35, -0.08]} castShadow>
        <dodecahedronGeometry args={[0.46, 0]} />
        <meshStandardMaterial color="#6b7280" roughness={0.96} />
      </mesh>
    </group>
  );
}

function ForestryTerrainSurface() {
  const geometry = useMemo(() => {
    const width = 25.5;
    const depth = 20.5;
    const xSegments = 42;
    const zSegments = 34;
    const positions: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let zi = 0; zi <= zSegments; zi++) {
      const z = -depth / 2 + (zi / zSegments) * depth;
      for (let xi = 0; xi <= xSegments; xi++) {
        const x = -width / 2 + (xi / xSegments) * width;
        positions.push(x, forestryTerrainHeight(x, z), z);
        uvs.push(xi / xSegments, zi / zSegments);
      }
    }

    for (let zi = 0; zi < zSegments; zi++) {
      for (let xi = 0; xi < xSegments; xi++) {
        const a = zi * (xSegments + 1) + xi;
        const b = a + 1;
        const c = a + (xSegments + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const terrain = new THREE.BufferGeometry();
    terrain.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    terrain.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    terrain.setIndex(indices);
    terrain.computeVertexNormals();
    return terrain;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#34523b" roughness={0.98} />
    </mesh>
  );
}

function TreeForestryTerrain() {
  const forest = [
    [-11.2, -6.5, 0.95], [-10.6, -3.9, 0.74], [-11.4, -0.8, 0.82], [-10.7, 2.5, 0.9], [-11.3, 6.0, 0.76],
    [11.1, -6.2, 0.82], [10.4, -3.1, 0.72], [11.3, 0.2, 0.94], [10.8, 3.5, 0.78], [11.4, 6.6, 0.88],
    [-7.5, 7.6, 0.82], [-4.4, 8.2, 0.76], [-1.5, 7.7, 0.7], [1.8, 8.25, 0.86], [5.2, 7.7, 0.74], [8.4, 8.1, 0.92],
    [-7.2, -8.2, 0.7], [-3.5, -8.0, 0.82], [3.3, -8.1, 0.72], [7.7, -7.9, 0.8],
  ] as const;
  const rocks = [[-8.8, 1.1, 1.1], [-6.2, 5.8, 0.72], [5.9, 4.9, 0.84], [8.6, -0.8, 0.66], [-1.2, 7.1, 0.58]] as const;

  return (
    <group>
      <ForestryTerrainSurface />
      <mesh position={[0, 0.16, -8.2]} receiveShadow>
        <boxGeometry args={[8.6, 0.08, 1.5]} />
        <meshStandardMaterial color="#565a57" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.2, -6.75]} receiveShadow>
        <boxGeometry args={[5.8, 0.06, 1.25]} />
        <meshStandardMaterial color="#8a806c" roughness={0.86} />
      </mesh>
      {[-2.5, 0, 2.5].map(x => (
        <mesh key={`forestry-road-line-${x}`} position={[x, 0.25, -8.2]}>
          <boxGeometry args={[0.08, 0.02, 1.06]} />
          <meshStandardMaterial color="#d9d2bd" roughness={0.7} />
        </mesh>
      ))}
      <GroundConnector from={[-7.4, 5.9]} to={[-3.2, 6.8]} width={0.44} y={0.21} color="#2c7da0" opacity={0.75} />
      <GroundConnector from={[-3.2, 6.8]} to={[1.8, 6.45]} width={0.42} y={0.21} color="#2c7da0" opacity={0.75} />
      <GroundConnector from={[1.8, 6.45]} to={[7.3, 7.15]} width={0.38} y={0.21} color="#2c7da0" opacity={0.75} />
      {forest.map(([x, z, scale], i) => (
        <ForestryPine key={`forestry-border-pine-${i}`} x={x} z={z} scale={scale} color={i % 3 === 0 ? '#1f4b32' : '#28593a'} />
      ))}
      {rocks.map(([x, z, scale], i) => <ForestryRock key={`forestry-rock-${i}`} x={x} z={z} scale={scale} />)}
      {[[-5.3, -6.5], [-4.1, -6.3], [4.2, -6.45], [5.5, -6.2]].map(([x, z], i) => (
          <group key={`forestry-entry-bollard-${i}`} position={[x, forestryTerrainHeight(x, z), z]}>
          <mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.045, 0.06, 0.84, 8]} /><meshStandardMaterial color="#2f2a23" roughness={0.72} /></mesh>
          <mesh position={[0, 0.86, 0]}><sphereGeometry args={[0.075, 8, 6]} /><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.46} /></mesh>
        </group>
      ))}
    </group>
  );
}

function ForestryTreeNode({ node, active, target, algorithmId }: { node: ForestryNode; active: boolean; target: boolean; algorithmId: string }) {
  const isRange = algorithmId === 'validate-bst';
  const canopy = active ? '#f59e0b' : target ? '#ef4444' : isRange && node.branch === 'left' ? '#2f6b45' : isRange && node.branch === 'right' ? '#4f6c35' : '#315f3c';
  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.16, 1.1, 8]} />
        <meshStandardMaterial color="#5b4635" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.14, 0]} castShadow>
        <coneGeometry args={[0.86, 1.22, 10]} />
        <meshStandardMaterial color={canopy} emissive={active ? '#f59e0b' : target ? '#ef4444' : '#000'} emissiveIntensity={active || target ? 0.22 : 0} roughness={0.94} flatShading />
      </mesh>
      <mesh position={[0, 1.68, 0]} castShadow>
        <coneGeometry args={[0.62, 1.08, 10]} />
        <meshStandardMaterial color={canopy} emissive={active ? '#f59e0b' : target ? '#ef4444' : '#000'} emissiveIntensity={active || target ? 0.22 : 0} roughness={0.94} flatShading />
      </mesh>
      <Billboard position={[0, 0.74, -0.78]} follow>
        <mesh position={[0, 0, -0.02]} castShadow>
          <boxGeometry args={[0.92, 0.5, 0.06]} />
          <meshStandardMaterial color={active ? '#fde68a' : target ? '#fecaca' : '#e5d8b7'} roughness={0.76} />
        </mesh>
        <Text position={[0, 0, 0.035]} fontSize={0.26} color="#111827" anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor="#fef3c7">
          {node.value}
        </Text>
      </Billboard>
      {(active || target) && (
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.035, 8, 28]} />
          <meshBasicMaterial color={active ? '#f59e0b' : '#ef4444'} transparent opacity={0.78} />
        </mesh>
      )}
      {active && <pointLight position={[0, 1.45, 0.35]} intensity={0.34} distance={4.8} color="#fbbf24" />}
    </group>
  );
}

function ObservationTower() {
  return (
    <group position={[-8.8, forestryTerrainHeight(-8.8, -5.4) + 0.08, -5.4]}>
      {[-0.55, 0.55].map(x => [-0.45, 0.45].map(z => (
        <mesh key={`tower-leg-${x}-${z}`} position={[x, 1.45, z]}>
          <cylinderGeometry args={[0.045, 0.06, 2.9, 6]} />
          <meshStandardMaterial color="#4b5563" roughness={0.72} />
        </mesh>
      )))}
      <mesh position={[0, 2.85, 0]} castShadow>
        <boxGeometry args={[1.55, 0.18, 1.25]} />
        <meshStandardMaterial color="#6b5a46" roughness={0.82} />
      </mesh>
      <mesh position={[0, 3.32, 0]} castShadow>
        <boxGeometry args={[1.32, 0.72, 1.02]} />
        <meshStandardMaterial color="#374151" roughness={0.66} />
      </mesh>
      <mesh position={[0, 3.82, 0]}>
        <boxGeometry args={[1.62, 0.12, 1.24]} />
        <meshStandardMaterial color="#1f2937" roughness={0.82} />
      </mesh>
      <Text position={[0, 4.04, 0.64]} fontSize={0.16} color="#dff7f9" anchorX="center" outlineWidth={0.006} outlineColor="#111827">
        观测塔
      </Text>
    </group>
  );
}

function ForestryStationBuilding() {
  return (
    <group position={[7.3, forestryTerrainHeight(7.3, -5.25) + 0.08, -5.25]} rotation={[0, -0.16, 0]}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[4.8, 0.22, 3.05]} />
        <meshStandardMaterial color="#5d5448" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow>
        <boxGeometry args={[4.25, 1.84, 2.62]} />
        <meshStandardMaterial color="#71543d" roughness={0.84} />
      </mesh>
      <mesh position={[0, 2.15, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[3.25, 3.25, 2.82]} />
        <meshStandardMaterial color="#2f3b3f" roughness={0.9} />
      </mesh>
      {[-1.35, 0.05, 1.35].map((x, i) => (
        <mesh key={`forestry-window-${i}`} position={[x, 1.13, 1.34]}>
          <boxGeometry args={[0.56, 0.48, 0.05]} />
          <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.24} roughness={0.48} />
        </mesh>
      ))}
      <Text position={[0, 2.78, 1.34]} fontSize={0.24} color="#fde68a" anchorX="center" outlineWidth={0.008} outlineColor="#111827">
        山地林业监测站
      </Text>
    </group>
  );
}

function DroneRotor({ x, z, spinOffset = 0 }: { x: number; z: number; spinOffset?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 34 + spinOffset;
  });
  return (
    <group ref={ref} position={[x, 0.06, z]}>
      <mesh key="drone-rotor-blade-a">
        <boxGeometry args={[0.62, 0.018, 0.08]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#60a5fa" emissiveIntensity={0.18} transparent opacity={0.72} />
      </mesh>
      <mesh key="drone-rotor-blade-b" rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.62, 0.018, 0.08]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#60a5fa" emissiveIntensity={0.18} transparent opacity={0.72} />
      </mesh>
    </group>
  );
}

function TreeDroneScanner({ nodes, activeValues, focusValue }: { nodes: ForestryNode[]; activeValues: Set<string>; focusValue: string | null }) {
  const ref = useRef<THREE.Group>(null);
  const previousTarget = useRef(new THREE.Vector3(0, 3.45, -2.9));
  const flightProgress = useRef(1);
  const lastTargetKey = useRef('');
  const target = useMemo(() => {
    const focusNode = focusValue ? nodes.find(n => n.value === focusValue) : null;
    const activeNodes = focusNode ? [focusNode] : nodes.filter(n => activeValues.has(n.value));
    const chosen = activeNodes.length > 0 ? activeNodes : nodes.slice(0, 1);
    const count = Math.max(1, chosen.length);
    return {
      key: chosen.map(n => `${n.value}:${n.order}`).join('|') || 'empty',
      x: chosen.reduce((sum, n) => sum + n.x, 0) / count,
      z: chosen.reduce((sum, n) => sum + n.z, 0) / count,
      y: chosen.reduce((sum, n) => sum + n.y, 0) / count + 2.55 + Math.min(0.32, (chosen[0]?.depth ?? 0) * 0.08),
    };
  }, [activeValues, focusValue, nodes]);

  useEffect(() => {
    if (lastTargetKey.current === target.key) return;
    if (ref.current) previousTarget.current.copy(ref.current.position);
    else previousTarget.current.set(target.x, target.y, target.z - 1.4);
    flightProgress.current = 0;
    lastTargetKey.current = target.key;
  }, [target]);

  useFrame(({ clock }, delta) => {
    if (!ref.current || nodes.length === 0) return;
    flightProgress.current = Math.min(1, flightProgress.current + delta * 2.4);
    const eased = 1 - Math.pow(1 - flightProgress.current, 3);
    const baseX = THREE.MathUtils.lerp(previousTarget.current.x, target.x, eased);
    const baseY = THREE.MathUtils.lerp(previousTarget.current.y, target.y, eased);
    const baseZ = THREE.MathUtils.lerp(previousTarget.current.z, target.z, eased);
    const orbit = clock.elapsedTime * 1.55;
    const orbitRadius = THREE.MathUtils.lerp(0.18, 0.04, flightProgress.current);
    ref.current.position.x = baseX + Math.cos(orbit) * orbitRadius;
    ref.current.position.z = baseZ + Math.sin(orbit) * orbitRadius;
    ref.current.position.y = baseY + Math.sin(clock.elapsedTime * 3.4) * 0.18;
    const dx = target.x - previousTarget.current.x;
    const dz = target.z - previousTarget.current.z;
    if (Math.abs(dx) + Math.abs(dz) > 0.001) {
      ref.current.rotation.y = Math.atan2(dx, dz);
    }
    ref.current.rotation.z = -Math.sin(orbit) * 0.12;
  });

  return (
    <group ref={ref} position={[target.x, target.y, target.z - 1.4]}>
      <mesh castShadow>
        <boxGeometry args={[0.54, 0.18, 0.48]} />
        <meshStandardMaterial color="#111827" emissive="#38bdf8" emissiveIntensity={0.18} roughness={0.48} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <coneGeometry args={[0.12, 0.22, 4]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.32} />
      </mesh>
      <DroneRotor x={0.55} z={0.42} spinOffset={0} />
      <DroneRotor x={-0.55} z={0.42} spinOffset={0.7} />
      <DroneRotor x={0.55} z={-0.42} spinOffset={1.4} />
      <DroneRotor x={-0.55} z={-0.42} spinOffset={2.1} />
      <pointLight position={[0, -0.2, 0]} intensity={0.32} distance={5.2} color="#38bdf8" />
      <mesh key="drone-scan-beam" position={[0, -1.14, 0]}>
        <cylinderGeometry args={[0.035, 0.08, 2.18, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.42, 28]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function RangerPatrol({ nodes, activeValues, focusValue }: { nodes: ForestryNode[]; activeValues: Set<string>; focusValue: string | null }) {
  const ref = useRef<THREE.Group>(null);
  const target = (focusValue ? nodes.find(n => n.value === focusValue) : null) ?? nodes.find(n => activeValues.has(n.value)) ?? nodes[0];
  useFrame(() => {
    if (!ref.current || !target) return;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, target.x + 0.55, 0.07);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, target.y + 0.01, 0.07);
    ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, target.z - 0.92, 0.07);
  });
  return (
    <group ref={ref} position={[(target?.x ?? 0) + 0.55, (target?.y ?? 0) + 0.01, (target?.z ?? 0) - 0.92]}>
      <mesh position={[0, 0.42, 0]}><boxGeometry args={[0.28, 0.58, 0.2]} /><meshStandardMaterial color="#f97316" roughness={0.68} /></mesh>
      <mesh position={[0, 0.83, 0]}><sphereGeometry args={[0.15, 10, 8]} /><meshStandardMaterial color="#f8d3aa" roughness={0.6} /></mesh>
      <mesh position={[0.26, 0.38, 0]}><boxGeometry args={[0.26, 0.1, 0.12]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.16} /></mesh>
    </group>
  );
}

function TreeAlgorithmSign({ activeAlgorithmId, snapshot }: { activeAlgorithmId: string; snapshot: TraceSnapshot | null }) {
  const textMap: Record<string, string> = {
    'tree-bfs-vs-dfs': 'BFS 一层层扩大搜索；DFS 沿一条山路深入巡检',
    'py-tree-bfs-vs-dfs': 'BFS 一层层扩大搜索；DFS 沿一条山路深入巡检',
    'tree-height': '树高度：无人机按林冠层级扫描，最深层就是高度',
    'validate-bst': '验证 BST：左坡编号必须更小，右坡编号必须更大',
    lca: 'LCA：两处报警点回溯到最近共同岔路口',
    traversals: '遍历：护林员按前序/中序/后序/层序路线巡检',
  };
  const description = snapshot?.description || textMap[activeAlgorithmId] || '树算法林区巡检';
  return (
    <Billboard position={[0, 3.9, 7.35]} follow>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[7.2, 0.82]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.86} depthWrite={false} />
      </mesh>
      <Text position={[0, 0.18, 0]} fontSize={0.16} color="#bbf7d0" anchorX="center" anchorY="middle">
        树算法 · 山地林业监测站
      </Text>
      <Text position={[0, -0.15, 0]} fontSize={0.135} color="#f8fafc" anchorX="center" anchorY="middle" maxWidth={7.0}>
        {description}
      </Text>
    </Billboard>
  );
}

function TreeForestryDistrict({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const activeSnapshot = optimizedSnapshot ?? naiveSnapshot;
  const root = useMemo(() => extractTreeRoot(activeSnapshot), [activeSnapshot]);
  const nodes = useMemo(() => buildForestryLayout(root), [root]);
  const activeValues = useMemo(() => getActiveTreeValues(activeSnapshot), [activeSnapshot]);
  const focusValue = useMemo(() => getTreeFocusValue(activeSnapshot), [activeSnapshot]);
  const lcaTargets = activeAlgorithmId === 'lca' ? new Set(['4', '5']) : new Set<string>();

  return (
    <group position={[-48, TREE_FORESTRY_WORLD_Y, 63]} rotation={[0, -0.12, 0]}>
      <hemisphereLight args={['#d9f99d', '#1f2937', 0.75]} />
      <directionalLight position={[-5, 9, -6]} intensity={0.75} color="#fff7d6" castShadow />
      <pointLight position={[0, 4.2, -2.2]} intensity={0.45} distance={18} color="#bbf7d0" />
      <TreeForestryTerrain />
      <ObservationTower />
      <ForestryStationBuilding />
      <group position={[0, forestryTerrainHeight(0, -5.82) + 0.36, -5.82]}>
        <mesh>
          <boxGeometry args={[5.2, 0.16, 0.48]} />
          <meshStandardMaterial color="#1f2937" emissive="#22c55e" emissiveIntensity={0.07} roughness={0.64} />
        </mesh>
        <Text position={[0, 0.28, -0.03]} rotation={[0, Math.PI, 0]} fontSize={0.24} color="#dcfce7" anchorX="center" outlineWidth={0.008} outlineColor="#020617">
          林区入口 · 树结构巡检
        </Text>
      </group>
      {nodes.map(node => node.parent && (
        <GroundConnector
          key={`forestry-trail-${node.value}-${node.order}`}
          from={[node.parent.x, node.parent.z]}
          to={[node.x, node.z]}
          width={activeValues.has(node.value) ? 0.42 : 0.28}
          y={Math.max(node.parent.y, node.y) + 0.045}
          color={activeValues.has(node.value) ? '#f59e0b' : '#6b5a46'}
          opacity={0.92}
        />
      ))}
      {activeAlgorithmId === 'validate-bst' && (
        <>
          <mesh position={[-4.4, forestryTerrainHeight(-4.4, 1.5) + 0.08, 1.5]}><boxGeometry args={[6.8, 0.05, 0.18]} /><meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.12} /></mesh>
          <mesh position={[4.4, forestryTerrainHeight(4.4, 1.5) + 0.08, 1.5]}><boxGeometry args={[6.8, 0.05, 0.18]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.12} /></mesh>
          <Text position={[-4.4, forestryTerrainHeight(-4.4, 1.15) + 0.26, 1.15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.2} color="#bae6fd" anchorX="center">左坡较小</Text>
          <Text position={[4.4, forestryTerrainHeight(4.4, 1.15) + 0.26, 1.15]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.2} color="#fde68a" anchorX="center">右坡较大</Text>
        </>
      )}
      {nodes.map(node => (
        <ForestryTreeNode
          key={`forestry-node-${node.value}-${node.order}`}
          node={node}
          active={activeValues.has(node.value)}
          target={lcaTargets.has(node.value)}
          algorithmId={activeAlgorithmId}
        />
      ))}
      {nodes.map((node, i) => (
        <ForestryPine
          key={`forestry-companion-pine-${node.value}-${i}`}
          x={node.x + (i % 2 === 0 ? -0.9 : 0.9)}
          z={node.z + 0.62}
          y={forestryTerrainHeight(node.x + (i % 2 === 0 ? -0.9 : 0.9), node.z + 0.62)}
          scale={0.42 + (i % 3) * 0.08}
          color={i % 2 === 0 ? '#1f4d34' : '#2b5c3d'}
        />
      ))}
      <RangerPatrol nodes={nodes} activeValues={activeValues} focusValue={focusValue} />
      <TreeDroneScanner nodes={nodes} activeValues={activeValues} focusValue={focusValue} />
      <TreeAlgorithmSign activeAlgorithmId={activeAlgorithmId} snapshot={activeSnapshot} />
      <group position={[8.8, forestryTerrainHeight(8.8, 5.95) + 0.35, 5.95]}>
        <mesh onClick={() => setShowHelp(true, TREE_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'tree-height')}>
          <boxGeometry args={[1.7, 0.22, 0.08]} />
          <meshStandardMaterial color="#1e293b" emissive="#22c55e" emissiveIntensity={0.08} />
        </mesh>
        <Text position={[0, 0, 0.055]} fontSize={0.13} color="#dcfce7" anchorX="center" anchorY="middle" onClick={() => setShowHelp(true, TREE_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'tree-height')}>说明</Text>
      </group>
      <Html position={[4.2, 2.2, 0.2]} transform distanceFactor={8} style={{ pointerEvents: 'auto' }}>
        <div onClick={() => setShowHelp(true, TREE_IDS.has(activeAlgorithmId) ? activeAlgorithmId : 'tree-height')} style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(251,191,36,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#111827', fontWeight: 700,
          boxShadow: '0 0 14px rgba(251,191,36,0.7)', userSelect: 'none',
        }}>?</div>
      </Html>
    </group>
  );
}

function CityAlgorithmProjection({ naiveSnapshot, optimizedSnapshot, activeAlgorithmId }: SceneProps & { activeAlgorithmId: string }) {
  if (activeAlgorithmId === 'dijkstra') {
    return <DijkstraDispatchScene naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (activeAlgorithmId === 'prim') {
    return <PrimUtilityScene naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (activeAlgorithmId === 'union-find') {
    return <UnionFindCommunityScene naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (SORT_IDS.has(activeAlgorithmId)) {
    return <SortingDistrict naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (GRAPH_SEARCH_IDS.has(activeAlgorithmId)) {
    return <PolicePursuitDistrict naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (SEARCH_IDS.has(activeAlgorithmId)) {
    return <SearchLibraryDistrict naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (DP_IDS.has(activeAlgorithmId)) {
    return <DPConstructionYard naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (TREE_IDS.has(activeAlgorithmId)) {
    return <TreeForestryDistrict naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  if (STRING_IDS.has(activeAlgorithmId)) {
    return <SignShopWorkshop naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />;
  }
  return (
    <group>
      <CityGraphProjection snapshot={naiveSnapshot} color="#f59e0b" sideLabel="朴素" lift={0.01} />
      <CityGraphProjection snapshot={optimizedSnapshot} color="#22d3ee" sideLabel="优化" lift={0.08} />
      <CommunityUnionProjection snapshot={naiveSnapshot} color="#f59e0b" sideLabel="朴素" />
      <CommunityUnionProjection snapshot={optimizedSnapshot} color="#22d3ee" sideLabel="优化" />
      <AlgorithmStatusBillboard naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />
    </group>
  );
}

function TrafficLight({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  const red = useRef<THREE.MeshStandardMaterial>(null);
  const yellow = useRef<THREE.MeshStandardMaterial>(null);
  const green = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const phase = Math.floor(clock.elapsedTime % 9);
    const active = phase < 4 ? 'green' : phase < 6 ? 'yellow' : 'red';
    if (red.current) red.current.emissiveIntensity = active === 'red' ? 1.3 : 0.1;
    if (yellow.current) yellow.current.emissiveIntensity = active === 'yellow' ? 1.3 : 0.1;
    if (green.current) green.current.emissiveIntensity = active === 'green' ? 1.3 : 0.1;
  });
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.045, 0.06, 2.8, 6]} /><meshStandardMaterial color="#263238" /></mesh>
      <mesh position={[0, 3.19, 0.18]}><boxGeometry args={[0.42, 0.78, 0.16]} /><meshStandardMaterial color="#111827" roughness={0.35} /></mesh>
      <mesh position={[0, 3.42, 0.27]}><sphereGeometry args={[0.08, 10, 8]} /><meshStandardMaterial ref={red} color="#7f1d1d" emissive="#ef4444" emissiveIntensity={0.3} /></mesh>
      <mesh position={[0, 3.19, 0.27]}><sphereGeometry args={[0.08, 10, 8]} /><meshStandardMaterial ref={yellow} color="#713f12" emissive="#facc15" emissiveIntensity={0.3} /></mesh>
      <mesh position={[0, 2.96, 0.27]}><sphereGeometry args={[0.08, 10, 8]} /><meshStandardMaterial ref={green} color="#14532d" emissive="#22c55e" emissiveIntensity={0.3} /></mesh>
    </group>
  );
}

function Crosswalk({ x, z, alongX }: { x: number; z: number; alongX?: boolean }) {
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x + (alongX ? -1.8 + i * 0.6 : 0), 0.018, z + (alongX ? 0 : -1.8 + i * 0.6)]}>
          <planeGeometry args={alongX ? [0.34, 8.8] : [8.8, 0.34]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.76} />
        </mesh>
      ))}
    </group>
  );
}

function BusStop({ x, z, label }: { x: number; z: number; label: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.90, 0]}><boxGeometry args={[1.6, 0.08, 0.08]} /><meshStandardMaterial color="#334155" /></mesh>
      <mesh position={[-0.72, 0.48, 0]}><boxGeometry args={[0.08, 0.95, 0.08]} /><meshStandardMaterial color="#334155" /></mesh>
      <mesh position={[0.72, 0.48, 0]}><boxGeometry args={[0.08, 0.95, 0.08]} /><meshStandardMaterial color="#334155" /></mesh>
      <mesh position={[0, 0.98, 0]}><boxGeometry args={[1.8, 0.08, 0.55]} /><meshStandardMaterial color="#0f172a" emissive="#0284c7" emissiveIntensity={0.12} /></mesh>
      <Text position={[0, 1.13, 0.02]} fontSize={0.18} color="#e0f2fe" anchorX="center" outlineWidth={0.006} outlineColor="#020617">
        {label}
      </Text>
    </group>
  );
}

function Bench({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.8, 0.04, 0.28]} /><meshStandardMaterial color="#6b4c3b" roughness={0.7} /></mesh>
      <mesh position={[0, 0.38, -0.12]}><boxGeometry args={[0.8, 0.3, 0.04]} /><meshStandardMaterial color="#6b4c3b" roughness={0.7} /></mesh>
      {[[-0.35, 0, 0], [0.35, 0, 0]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.12, 0]}><boxGeometry args={[0.04, 0.24, 0.28]} /><meshStandardMaterial color="#444" roughness={0.6} /></mesh>
      ))}
    </group>
  );
}

function Planter({ x, z, color = '#2d5a27' }: { x: number; z: number; color?: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.6, 0.36, 0.6]} /><meshStandardMaterial color="#5a4a3a" roughness={0.8} /></mesh>
      <mesh position={[0, 0.32, 0]}><sphereGeometry args={[0.32, 8, 6]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>
    </group>
  );
}

function CityStreetDetails() {
  return (
    <group>
      {[-35, -20, 20, 35].map(x => (
        <group key={x}>
          <Crosswalk x={x} z={-4.4} alongX />
          <Crosswalk x={x} z={4.4} alongX />
          <Crosswalk x={x - 2.9} z={0} />
          <Crosswalk x={x + 2.9} z={0} />
          <TrafficLight x={x - 4.2} z={-5.2} rotation={Math.PI / 3} />
          <TrafficLight x={x + 4.2} z={5.2} rotation={-Math.PI * 2 / 3} />
        </group>
      ))}
      <BusStop x={-9} z={5.7} label="A线" />
      <BusStop x={12} z={-5.7} label="B线" />
      <BusStop x={-30} z={5.7} label="C线" />
      <BusStop x={30} z={-5.7} label="D线" />
      <BusStop x={-38} z={5.7} label="E线" />
      <BusStop x={38} z={-5.7} label="F线" />
      {[-46, -38, -28, -18, 22, 32, 42].map(x => (
        <group key={`bench-main-${x}`}>
          <Bench x={x} z={-5.8} ry={0} />
          <Bench x={x + 4} z={5.8} ry={Math.PI} />
        </group>
      ))}
      {[-42, -34, -24, -14, 14, 24, 34, 42].map(z => (
        <group key={`bench-side-${z}`}>
          <Bench x={-36.8} z={z} ry={-Math.PI / 2} />
          <Bench x={-21.8} z={z} ry={-Math.PI / 2} />
          <Bench x={21.8} z={z} ry={Math.PI / 2} />
          <Bench x={36.8} z={z} ry={Math.PI / 2} />
        </group>
      ))}
      {[-46, -36, -26, -16, 16, 26, 36, 46].map(x => (
        <group key={`planter-main-${x}`}>
          <Planter x={x} z={-6.5} />
          <Planter x={x + 2} z={6.5} color="#3a6b3a" />
        </group>
      ))}
      {[-42, -32, -22, -12, 12, 22, 32, 42].map(z => (
        <group key={`planter-side-${z}`}>
          <Planter x={-36.5} z={z} color="#4a7a4a" />
          <Planter x={-22.5} z={z} color="#4a7a4a" />
          <Planter x={22.5} z={z} />
          <Planter x={36.5} z={z} />
        </group>
      ))}
      {[-48, 48].map((z, i) => (
        <group key={`zone-sign-${i}`} position={[i === 0 ? -35 : 35, 0, z]}>
          <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.04, 0.06, 2.4, 6]} /><meshStandardMaterial color="#444" /></mesh>
          <mesh position={[0, 2.3, 0]}><boxGeometry args={[1.2, 0.5, 0.08]} /><meshStandardMaterial color="#1a2a3a" emissive="#4fc3f7" emissiveIntensity={0.08} roughness={0.5} /></mesh>
          <Text position={[0, 2.3, 0.06]} fontSize={0.14} color="#e0f2fe" anchorX="center" outlineWidth={0.004} outlineColor="#020617">
            {i === 0 ? '西区' : '东区'}
          </Text>
        </group>
      ))}
      <CentralFountain />
      <Pond />
      <ParkingLot />
      <Billboards />
    </group>
  );
}

/* ======= CITY DIVERSITY FEATURES ======= */

const PLAZA_COLORS = ['#ec4899', '#f59e0b', '#a855f7', '#ef4444', '#3b82f6', '#10b981', '#f97316', '#06b6d4'];

function CentralFountain() {
  const water = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (water.current) water.current.position.y = 0.18 + Math.sin(clock.elapsedTime * 2.5) * 0.04;
  });
  return (
    <group position={[0, 0, -24]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#4a4d52" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <circleGeometry args={[5.2, 32]} />
        <meshStandardMaterial color="#d6c8a8" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[5.2, 5.5, 32]} />
        <meshStandardMaterial color="#3a3a3e" roughness={0.85} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={`plaza-lamp-${i}`} position={[Math.cos(a) * 4.8, 0, Math.sin(a) * 4.8]}>
            <mesh position={[0, 1.0, 0]}><cylinderGeometry args={[0.04, 0.06, 2, 6]} /><meshStandardMaterial color="#374151" /></mesh>
            <pointLight position={[0, 2.1, 0]} intensity={0.3} distance={6} color="#fde68a" />
            <mesh position={[0, 2.05, 0]}><sphereGeometry args={[0.07, 8, 6]} /><meshStandardMaterial color="#fde68a" emissive="#fde68a" emissiveIntensity={0.7} /></mesh>
          </group>
        );
      })}
      <mesh ref={water} position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.6, 0.35, 24]} />
        <meshStandardMaterial color="#0284c7" roughness={0.12} metalness={0.35} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.25, 8]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[-0.8, 0.65, 0.8]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.7, 0.72, -0.6]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.25} />
      </mesh>
      <Text position={[0, 0.18, 5.8]} fontSize={0.28} color="#e2e8f0" anchorX="center" outlineWidth={0.01} outlineColor="#020617">市民广场</Text>
      {[[-4.5, 4.5], [4.5, 4.5], [-4.5, -4.5], [4.5, -4.5], [-6, 0], [6, 0], [0, -6], [0, 6]].map(([x, z], i) => (
        <mesh key={`edge-lamp-${i}`} position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshBasicMaterial color={PLAZA_COLORS[i % PLAZA_COLORS.length]} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Pond() {
  return (
    <group position={[-22, 0, -37]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3.8, 28]} />
        <meshStandardMaterial color="#1a3a2a" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[3.4, 28]} />
        <meshStandardMaterial color="#0a3a4a" roughness={0.3} metalness={0.4} transparent opacity={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[3.4, 3.7, 28]} />
        <meshStandardMaterial color="#6b7b5a" roughness={0.92} />
      </mesh>
      {[[-3.2, -2.0], [-2.8, 2.5], [3.0, 1.5], [2.5, -2.8], [-1.0, -3.2], [1.5, -3.0], [-3.8, 0], [3.8, 0.5]].map(([x, z], i) => (
        <group key={`pond-plant-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.40, 0]}><cylinderGeometry args={[0.025, 0.04, 0.8, 6]} /><meshStandardMaterial color="#4a6a3a" /></mesh>
          <mesh position={[0, 0.68, 0]}><sphereGeometry args={[0.18, 6, 5]} /><meshStandardMaterial color="#2d5a27" roughness={0.9} /></mesh>
        </group>
      ))}
      <mesh position={[1.2, 0.06, 1.2]} rotation={[0, 0.3, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.04, 0.5]} />
        <meshStandardMaterial color="#5b4636" roughness={0.85} />
      </mesh>
    </group>
  );
}

function ParkingLot() {
  const parkedCars = useMemo(() => {
    const data: { x: number; z: number; color: string }[] = [];
    const colors = ['#cc3333', '#3366cc', '#33aa44', '#ddcc33', '#aa44aa', '#cc6633', '#44aaaa', '#888'];
    for (let i = 0; i < 8; i++) {
      data.push({
        x: -1.2 + (i % 4) * 0.85,
        z: -0.9 + Math.floor(i / 4) * 1.8,
        color: colors[i % colors.length],
      });
    }
    return data;
  }, []);
  return (
    <group position={[-35, 0, 38]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[2.8, 3.0, 32]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.5} />
      </mesh>
      {parkedCars.map((car, i) => (
        <group key={`parked-car-${i}`} position={[car.x, 0.1, car.z]} rotation={[0, i < 4 ? 0 : Math.PI, 0]}>
          <mesh position={[0, 0.14, 0]} castShadow>
            <boxGeometry args={[0.45, 0.18, 0.75]} />
            <meshStandardMaterial color={car.color} roughness={0.55} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.28, 0.08]} castShadow>
            <boxGeometry args={[0.35, 0.14, 0.28]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.45} />
          </mesh>
          {[[-0.22, 0.05, -0.22], [0.22, 0.05, -0.22], [-0.22, 0.05, 0.22], [0.22, 0.05, 0.22]].map((p, j) => (
            <mesh key={j} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 8]} />
              <meshStandardMaterial color="#111827" roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[-2.6, 0.35, -1.5]}>
        <boxGeometry args={[0.06, 0.7, 0.06]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <Text position={[-2.4, 0.5, -1.5]} rotation={[0, 0, 0]} fontSize={0.12} color="#fbbf24" anchorX="left" outlineWidth={0.004} outlineColor="#111">P</Text>
    </group>
  );
}

function Billboards() {
  const signs = [
    { x: -10, z: -6.2, ry: 0, text: '城市算法调度中心', sub: '智慧城市' },
    { x: 10, z: 6.2, ry: Math.PI, text: '今夜星光灿烂', sub: '数据结构靶场' },
    { x: -35.8, z: 22, ry: -Math.PI / 2, text: '西区商业街', sub: '即将开幕' },
    { x: 35.8, z: 22, ry: Math.PI / 2, text: '东区科技园', sub: '招租中' },
  ];
  return (
    <group>
      {signs.map((s, i) => (
        <group key={`billboard-${i}`} position={[s.x, 0, s.z]} rotation={[0, s.ry, 0]}>
          <mesh position={[0, 0.95, 0]}><cylinderGeometry args={[0.04, 0.06, 1.9, 6]} /><meshStandardMaterial color="#333" /></mesh>
          <mesh position={[0, 2.35, -0.08]}>
            <boxGeometry args={[3.2, 0.85, 0.06]} />
            <meshStandardMaterial color="#08111f" emissive="#0ea5e9" emissiveIntensity={0.06} roughness={0.35} />
          </mesh>
          <mesh position={[0, 2.35, 0]}>
            <boxGeometry args={[3.1, 0.75, 0.04]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <Text position={[0, 2.53, 0.05]} fontSize={0.2} color="#67e8f9" anchorX="center" outlineWidth={0.006} outlineColor="#020617">
            {s.text}
          </Text>
          <Text position={[0, 2.25, 0.05]} fontSize={0.14} color="#94a3b8" anchorX="center" outlineWidth={0.004} outlineColor="#020617">
            {s.sub}
          </Text>
          <pointLight position={[0, 2.45, -0.5]} intensity={0.2} distance={4} color="#22d3ee" />
        </group>
      ))}
    </group>
  );
}

/* ======= CITY BUILDINGS (InstancedMesh windows) ======= */

interface BlockDef { x: number; z: number; w: number; h: number; d: number; color: string; lit: number; }

function generateBlocks(): BlockDef[] {
  const r = () => Math.random();
  const glassColor = () => `hsl(${195 + r() * 25}, ${18 + r() * 12}%, ${28 + r() * 14}%)`;
  return [
    /* existing zones - buildings along main road */
    ...[4, 12].map(z => [10, 18].map(x => ({ x, z, w: 6 + r() * 4, h: 5 + r() * 8, d: 5 + r() * 3, color: `hsl(${220 + r() * 30}, ${15 + r() * 10}%, ${25 + r() * 15}%)`, lit: 0.3 + r() * 0.5 }))).flat(),
    ...[4, 12].map(z => [-18, -10].map(x => ({ x, z, w: 6 + r() * 4, h: 4 + r() * 10, d: 5 + r() * 3, color: `hsl(${30 + r() * 40}, ${10 + r() * 15}%, ${28 + r() * 15}%)`, lit: 0.3 + r() * 0.4 }))).flat(),
    ...[-8, -16, -24].map(z => [-18, -10, 10, 18].map(x => ({ x, z, w: 6 + r() * 4, h: 4 + r() * 7, d: 5 + r() * 3, color: `hsl(${160 + r() * 60}, ${10 + r() * 15}%, ${22 + r() * 18}%)`, lit: 0.3 + r() * 0.5 }))).flat(),
    ...[20, 28].map(z => [-18, -10, 10, 18].map(x => ({ x, z, w: 7 + r() * 4, h: 6 + r() * 10, d: 5 + r() * 3, color: `hsl(${200 + r() * 40}, ${8 + r() * 10}%, ${18 + r() * 12}%)`, lit: 0.2 + r() * 0.4 }))).flat(),
    ...[-32].map(z => [-18, -10, 10, 18].map(x => ({ x, z, w: 7 + r() * 4, h: 5 + r() * 8, d: 5 + r() * 3, color: `hsl(${240 + r() * 20}, ${8 + r() * 10}%, ${16 + r() * 10}%)`, lit: 0.2 + r() * 0.3 }))).flat(),
    ...[-36].map(z => [-18, -10, 10, 18].map(x => ({ x, z, w: 7 + r() * 5, h: 5 + r() * 9, d: 5 + r() * 3, color: `hsl(${190 + r() * 30}, ${12 + r() * 10}%, ${20 + r() * 14}%)`, lit: 0.2 + r() * 0.3 }))).flat(),
    ...[36].map(z => [-18, -10, 10, 18].map(x => ({ x, z, w: 7 + r() * 5, h: 5 + r() * 9, d: 5 + r() * 3, color: `hsl(${210 + r() * 30}, ${10 + r() * 12}%, ${22 + r() * 12}%)`, lit: 0.2 + r() * 0.3 }))).flat(),
    ...[-36, -28, -20, -8, 4, 12, 20, 28, 36].map(z => [30].map(x => ({ x, z, w: 5 + r() * 4, h: 4 + r() * 8, d: 5 + r() * 3, color: `hsl(${170 + r() * 50}, ${10 + r() * 15}%, ${20 + r() * 15}%)`, lit: 0.25 + r() * 0.4 }))).flat(),
    ...[-36, -28, -20, -8, 4, 12, 20, 28, 36].map(z => [-30].map(x => ({ x, z, w: 5 + r() * 4, h: 4 + r() * 8, d: 5 + r() * 3, color: `hsl(${200 + r() * 40}, ${8 + r() * 12}%, ${18 + r() * 14}%)`, lit: 0.25 + r() * 0.4 }))).flat(),
    /* expanded areas - new buildings beyond x=-20/x=20 */
    ...[-36, -28, -20, -8, 4, 12, 20, 28, 36].map(z => [33].map(x => ({ x, z, w: 5 + r() * 4, h: glassColor().endsWith('5%') ? 10 + r() * 15 : 4 + r() * 8, d: 5 + r() * 3, color: r() > 0.6 ? glassColor() : `hsl(${170 + r() * 50}, ${10 + r() * 15}%, ${20 + r() * 15}%)`, lit: 0.25 + r() * 0.4 }))).flat(),
    ...[-36, -28, -20, -8, 4, 12, 20, 28, 36].map(z => [-33].map(x => ({ x, z, w: 5 + r() * 4, h: r() > 0.6 ? 10 + r() * 15 : 4 + r() * 8, d: 5 + r() * 3, color: r() > 0.6 ? glassColor() : `hsl(${200 + r() * 40}, ${8 + r() * 12}%, ${18 + r() * 14}%)`, lit: 0.25 + r() * 0.4 }))).flat(),
    /* far east/west buildings */
    ...[-40, -30, -20, -8, 4, 12, 20, 30, 40].map(z => [42, -42].map(x => ({ x, z, w: 5 + r() * 4, h: 4 + r() * 8, d: 5 + r() * 3, color: `hsl(${180 + r() * 40}, ${10 + r() * 12}%, ${22 + r() * 12}%)`, lit: 0.2 + r() * 0.35 }))).flat(),
    /* corner skycrapers */
    ...[[-48, -40], [48, -40], [-48, 40], [48, 40], [-40, -44], [40, -44], [-40, 44], [40, 44]].map(([x, z]) => ({ x, z, w: 6 + r() * 3, h: 12 + r() * 18, d: 5 + r() * 3, color: glassColor(), lit: 0.15 + r() * 0.25 })),
    /* brick-style low-rise blocks near side roads */
    ...[-38, -46].map(z => [-35, 35].map(x => ({ x, z, w: 7 + r() * 3, h: 3 + r() * 3, d: 6 + r() * 2, color: `hsl(${10 + r() * 20}, ${40 + r() * 25}%, ${35 + r() * 15}%)`, lit: 0.4 + r() * 0.3 }))).flat(),
    ...[-30].map(z => [-35].map(x => ({ x, z, w: 5 + r() * 2, h: 3 + r() * 4, d: 5 + r() * 2, color: `hsl(${10 + r() * 20}, ${40 + r() * 25}%, ${35 + r() * 15}%)`, lit: 0.4 + r() * 0.3 }))).flat(),
  ].flat().filter((b, i) => {
    if ((Math.abs(b.x) > 24 || Math.abs(b.z) > 26) && i % 4 === 1) return false;
    if (Math.abs(b.x) < 24 && Math.abs(b.z) < 18 && i % 5 === 2) return false;
    /* central intersection square */
    if (Math.abs(b.x) < 8 && b.z > -18 && b.z < -4) return false;
    /* central DP operations campus */
    if (Math.abs(b.x) < 18 && b.z > 12 && b.z < 40) return false;
    /* dijkstra park */
    if (b.x > 4 && b.x < 52 && b.z > 4 && b.z < 36) return false;
    /* union-find community */
    if (b.x > 41 && b.x < 63 && b.z > -12 && b.z < 2) return false;
    /* police pursuit district */
    if (b.x > 18 && b.x < 45 && b.z > 30 && b.z < 50) return false;
    /* sorting center */
    if (b.x > -52 && b.x < -20 && b.z > -36 && b.z < -8) return false;
    /* string workshop */
    if (b.x >= 46 && b.x <= 70 && b.z >= -42 && b.z <= -18) return false;
    /* search library + sightline */
    if (b.x > -10 && b.x < 10 && b.z > -42 && b.z < -28) return false;
    /* dp construction yard + sightline */
    if (b.x > 18 && b.x < 42 && b.z > -38 && b.z < -14) return false;
    /* central plaza area */
    if (Math.abs(b.x) < 12 && b.z > -38 && b.z < -18) return false;
    /* pond area */
    if (b.x > -28 && b.x < -16 && b.z > -42 && b.z < -32) return false;
    return true;
  });
}

function Building({ b }: { b: BlockDef }) {
  const { x, z, w, h, d, color, lit } = b;
  const winRows = Math.max(1, Math.floor(h * 1.2));
  const winCols = Math.max(1, Math.floor(w * 1.5));
  const instRef = useRef<THREE.InstancedMesh>(null);
  const sideWinRef = useRef<THREE.InstancedMesh>(null);
  const isLowRise = h < 7;
  const hasPodium = h > 8;

  const winData = useMemo(() => {
    const data: { pos: [number, number, number]; lit: boolean }[] = [];
    for (let r = 0; r < winRows; r++)
      for (let c = 0; c < winCols; c++)
        data.push({
          pos: [-w / 2 + 0.25 + c * (w - 0.5) / Math.max(1, winCols - 1), 0.4 + r * (h - 0.8) / Math.max(1, winRows - 1), d / 2 + 0.005],
          lit: Math.random() < lit,
        });
    return data;
  }, [winRows, winCols, w, h, d, lit]);

  const sideWinData = useMemo(() => {
    const rows = Math.max(1, Math.floor(h));
    const cols = Math.max(1, Math.floor(d));
    const data: { pos: [number, number, number]; lit: boolean }[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        data.push({
          pos: [w / 2 + 0.006, 0.48 + r * (h - 0.9) / Math.max(1, rows - 1), -d / 2 + 0.32 + c * (d - 0.64) / Math.max(1, cols - 1)],
          lit: Math.random() < lit * 0.75,
        });
    return data;
  }, [d, h, lit, w]);

  useEffect(() => {
    if (!instRef.current || winData.length === 0) return;
    const dummy = new THREE.Object3D();
    winData.forEach((wd, i) => {
      dummy.position.set(wd.pos[0], wd.pos[1], wd.pos[2]);
      if (!wd.lit) dummy.scale.set(0.01, 0.01, 0.01);
      dummy.updateMatrix();
      instRef.current!.setMatrixAt(i, dummy.matrix);
      if (!wd.lit) dummy.scale.set(1, 1, 1);
    });
    instRef.current.instanceMatrix.needsUpdate = true;
  }, [winData]);

  useEffect(() => {
    if (!sideWinRef.current || sideWinData.length === 0) return;
    const dummy = new THREE.Object3D();
    dummy.rotation.y = Math.PI / 2;
    sideWinData.forEach((wd, i) => {
      dummy.position.set(wd.pos[0], wd.pos[1], wd.pos[2]);
      if (!wd.lit) dummy.scale.set(0.01, 0.01, 0.01);
      dummy.updateMatrix();
      sideWinRef.current!.setMatrixAt(i, dummy.matrix);
      if (!wd.lit) dummy.scale.set(1, 1, 1);
    });
    sideWinRef.current.instanceMatrix.needsUpdate = true;
  }, [sideWinData]);

  return (
    <group position={[x, 0, z]}>
      {hasPodium && (
        <mesh position={[0, 0.55, d * 0.08]} castShadow>
          <boxGeometry args={[w + 0.9, 1.1, d + 0.8]} />
          <meshStandardMaterial color="#4b5156" roughness={0.84} />
        </mesh>
      )}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {winData.length > 0 && (
        <instancedMesh ref={instRef} args={[undefined, undefined, winData.length]}>
          <planeGeometry args={[Math.min(0.35, w / winCols * 0.6), Math.min(0.3, h / winRows * 0.5)]} />
          <meshBasicMaterial color="#ffe87c" />
        </instancedMesh>
      )}
      {sideWinData.length > 0 && (
        <instancedMesh ref={sideWinRef} args={[undefined, undefined, sideWinData.length]}>
          <planeGeometry args={[Math.min(0.3, d / Math.max(1, Math.floor(d)) * 0.55), Math.min(0.28, h / Math.max(1, Math.floor(h)) * 0.5)]} />
          <meshBasicMaterial color="#dbeafe" transparent opacity={0.85} />
        </instancedMesh>
      )}
      <mesh position={[0, h + 0.08, 0]}>
        <boxGeometry args={[w + 0.1, 0.06, d + 0.1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-w * 0.22, h + 0.32, -d * 0.22]}>
        <boxGeometry args={[Math.min(1.8, w * 0.24), 0.45, Math.min(1.4, d * 0.24)]} />
        <meshStandardMaterial color="#343a40" roughness={0.88} />
      </mesh>
      <mesh position={[w * 0.25, h + 0.24, d * 0.18]}>
        <boxGeometry args={[Math.min(1.4, w * 0.18), 0.28, Math.min(1.0, d * 0.18)]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} metalness={0.15} />
      </mesh>
      {isLowRise && (
        <group position={[0, 1.2, d / 2 + 0.07]}>
          <mesh>
            <boxGeometry args={[Math.min(3.0, w * 0.55), 0.38, 0.08]} />
            <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.04} roughness={0.45} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <boxGeometry args={[Math.min(2.1, w * 0.42), 0.45, 0.06]} />
            <meshStandardMaterial color="#111827" emissive="#fde68a" emissiveIntensity={0.035} roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

const CityBuildings = memo(function CityBuildings() {
  const blocks = useMemo(() => generateBlocks(), []);
  return <group>{blocks.map((b, i) => <Building key={i} b={b} />)}</group>;
});

/* ======= STREET LAMPS (no point lights, only emissive) ======= */

function getLampPositions(): [number, number][] {
  const out: [number, number][] = [];
  for (let x = -HW + 4; x <= HW - 4; x += 8) {
    out.push([x, MAIN_Z - MAIN_W / 2 - 0.8]);
    out.push([x, MAIN_Z + MAIN_W / 2 + 0.8]);
  }
  for (let z = -44; z <= 44; z += 8) {
    [-35, -20, 20, 35].forEach(sx => {
      out.push([sx - SIDE_W / 2 - 0.8, z]);
      out.push([sx + SIDE_W / 2 + 0.8, z]);
    });
  }
  return out;
}

const StreetLamp = memo(function StreetLamp({ pos }: { pos: [number, number] }) {
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.03, 0.045, 3, 6]} /><meshStandardMaterial color="#333" /></mesh>
      {/* Bracket arm connecting pole to lamp */}
      <group position={[0, 2.96, 0]}>
        <mesh position={[0.08, 0.02, 0]}><boxGeometry args={[0.2, 0.04, 0.04]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0.18, 0.02, 0]}><boxGeometry args={[0.04, 0.06, 0.06]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0.18, -0.07, 0]}><sphereGeometry args={[0.07, 8]} /><meshStandardMaterial color="#ffe082" emissive="#ffe082" emissiveIntensity={1.2} /></mesh>
      </group>
    </group>
  );
});

const CityLamps = memo(function CityLamps() {
  const lamps = useMemo(() => getLampPositions(), []);
  return <group>{lamps.map((p, i) => <StreetLamp key={i} pos={p} />)}</group>;
});

/* ======= TREES ======= */

function getTreeData(): { x: number; z: number; s: number }[] {
  const out: { x: number; z: number; s: number }[] = [];
  const place = (x: number, z: number) => out.push({ x, z, s: 0.6 + Math.random() * 0.4 });
  for (let x = -HW + 6; x <= HW - 6; x += 12) { place(x, MAIN_Z - MAIN_W / 2 - 2.8); place(x, MAIN_Z + MAIN_W / 2 + 2.8); }
  for (let z = -40; z <= 40; z += 12) {
    [-35, -20, 20, 35].forEach(sx => {
      place(sx - SIDE_W / 2 - 2.8, z);
      place(sx + SIDE_W / 2 + 2.8, z);
      place(sx - SIDE_W / 2 + 2.8, z);
      place(sx + SIDE_W / 2 - 2.8, z);
    });
  }
  return out;
}

const Tree = memo(function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh><cylinderGeometry args={[0.03, 0.055, 1.4, 6]} /><meshStandardMaterial color="#4a3a2a" /></mesh>
      <mesh position={[0, 1.4, 0]}><sphereGeometry args={[0.4, 6, 6]} /><meshStandardMaterial color="#2d5a27" roughness={0.9} /></mesh>
    </group>
  );
});

const CityTrees = memo(function CityTrees() {
  const trees = useMemo(() => getTreeData(), []);
  return <group>{trees.map((t, i) => <Tree key={i} x={t.x} z={t.z} s={t.s} />)}</group>;
});

/* ======= OUTER TERRAIN BASIN ======= */

function softNoise(x: number, z: number): number {
  return Math.sin(x * 0.085 + z * 0.027) * 0.55 + Math.cos(z * 0.071 - x * 0.019) * 0.42;
}

const BasinGround = memo(function BasinGround() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(210, 210, 72, 72);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distance = Math.sqrt(x * x + z * z);
      const edgeRise = Math.max(0, distance - 55) / 50;
      const borderLift = Math.pow(Math.min(1, edgeRise), 1.7) * 4.2;
      const naturalRipple = edgeRise > 0 ? softNoise(x, z) * Math.min(1, edgeRise) : 0;
      pos.setY(i, -0.32 + borderLift + naturalRipple);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial color="#34433b" roughness={0.97} metalness={0.02} />
    </mesh>
  );
});

function MountainPeak({ x, z, radius, height, color, rotation = 0 }: {
  x: number;
  z: number;
  radius: number;
  height: number;
  color: string;
  rotation?: number;
}) {
  return (
    <group position={[x, -0.15, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, height / 2 - 0.1, 0]} castShadow receiveShadow>
        <coneGeometry args={[radius, height, 7]} />
        <meshStandardMaterial color={color} roughness={0.92} flatShading />
      </mesh>
      <mesh position={[radius * 0.18, height * 0.78, -radius * 0.12]} castShadow>
        <coneGeometry args={[radius * 0.36, height * 0.28, 7]} />
        <meshStandardMaterial color="#8b8f83" roughness={0.96} flatShading />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[radius * 1.05, radius * 1.2, 0.18, 10]} />
        <meshStandardMaterial color="#27382f" roughness={0.98} />
      </mesh>
    </group>
  );
}

function MountainRange() {
  const peaks = useMemo(() => MOUNTAIN_PEAKS.map(m => ({
    ...m,
    color: ['#4b554b', '#596252', '#475447', '#5c6357', '#485648', '#566052', '#4b5549', '#59604f', '#4c584a', '#565f50', '#465244'][MOUNTAIN_PEAKS.indexOf(m)],
    rotation: [0.2, -0.4, 0.7, -0.2, 0.5, -0.7, 0.4, -0.1, 0.9, -0.6, 0.3][MOUNTAIN_PEAKS.indexOf(m)],
  })), []);

  return <group>{peaks.map((p, i) => <MountainPeak key={`mountain-${i}`} {...p} />)}</group>;
}

/* ======= MOUNTAIN ANIMALS ======= */

function MountainDeer({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  const adj = useMemo(() => getMountainAdjustment(x, z), [x, z]);
  const bodyBob = useRef(Math.random() * Math.PI * 2);
  const baseY = (adj?.dy ?? 0) + (adj ? 0.15 : 0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    bodyBob.current += delta * 0.8;
    ref.current.position.y = baseY + Math.sin(bodyBob.current) * 0.008;
  });

  return (
    <group ref={ref} position={[x, baseY, z]} scale={scale} rotation={[adj?.rx ?? 0, Math.random() * Math.PI * 2, 0]}>
      {/* Body */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.12]} />
        <meshStandardMaterial color="#8b7355" roughness={0.85} />
      </mesh>
      {/* Neck */}
      <mesh position={[0.18, 0.44, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.06, 0.18, 0.08]} />
        <meshStandardMaterial color="#8b7355" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0.32, 0.52, 0]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.07]} />
        <meshStandardMaterial color="#8b7355" roughness={0.85} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.34, 0.58, 0.06]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.04, 0.03, 0.04]} />
        <meshStandardMaterial color="#a0876a" roughness={0.85} />
      </mesh>
      <mesh position={[0.34, 0.58, -0.06]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.04, 0.03, 0.04]} />
        <meshStandardMaterial color="#a0876a" roughness={0.85} />
      </mesh>
      {/* Antlers */}
      <mesh position={[0.28, 0.58, 0.04]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.008, 0.012, 0.1, 4]} />
        <meshStandardMaterial color="#5c4a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0.28, 0.58, -0.04]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.008, 0.012, 0.1, 4]} />
        <meshStandardMaterial color="#5c4a3a" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.08, 0.12, 0.05]}>
        <cylinderGeometry args={[0.015, 0.02, 0.24, 5]} />
        <meshStandardMaterial color="#6b5a42" roughness={0.85} />
      </mesh>
      <mesh position={[-0.08, 0.12, -0.05]}>
        <cylinderGeometry args={[0.015, 0.02, 0.24, 5]} />
        <meshStandardMaterial color="#6b5a42" roughness={0.85} />
      </mesh>
      <mesh position={[0.08, 0.12, 0.05]}>
        <cylinderGeometry args={[0.015, 0.02, 0.24, 5]} />
        <meshStandardMaterial color="#6b5a42" roughness={0.85} />
      </mesh>
      <mesh position={[0.08, 0.12, -0.05]}>
        <cylinderGeometry args={[0.015, 0.02, 0.24, 5]} />
        <meshStandardMaterial color="#6b5a42" roughness={0.85} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.16, 0.32, 0]}>
        <sphereGeometry args={[0.025, 5]} />
        <meshStandardMaterial color="#c4a882" roughness={0.85} />
      </mesh>
    </group>
  );
}

function MountainBird({ peakIdx, radius = 4 }: { peakIdx: number; radius?: number }) {
  const ref = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);
  const peak = MOUNTAIN_PEAKS[peakIdx % MOUNTAIN_PEAKS.length];
  const wingAngle = useRef(0);

  useFrame((_, delta) => {
    phase.current += delta * 0.35;
    wingAngle.current = Math.sin(phase.current * 4) * 0.5;
    if (!ref.current) return;
    const baseY = peak.height + 4 + Math.sin(phase.current * 0.7) * 2;
    ref.current.position.x = peak.x + Math.cos(phase.current) * radius;
    ref.current.position.z = peak.z + Math.sin(phase.current * 1.1) * radius * 0.7;
    ref.current.position.y = baseY;
    ref.current.rotation.y = -phase.current + Math.PI / 2;
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.06, 5]} />
        <meshStandardMaterial color="#334" roughness={0.7} />
      </mesh>
      {/* Left wing */}
      <mesh position={[0, 0, 0.06]} rotation={[wingAngle.current, 0, 0]}>
        <coneGeometry args={[0.04, 0.15, 4]} />
        <meshStandardMaterial color="#223" roughness={0.7} />
      </mesh>
      {/* Right wing */}
      <mesh position={[0, 0, -0.06]} rotation={[-wingAngle.current, 0, 0]}>
        <coneGeometry args={[0.04, 0.15, 4]} />
        <meshStandardMaterial color="#223" roughness={0.7} />
      </mesh>
    </group>
  );
}

function MountainAnimals() {
  const deerPositions = useMemo(() => {
    const out: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const peak = MOUNTAIN_PEAKS[i % MOUNTAIN_PEAKS.length];
      const angle = i * 1.7 + 0.3;
      const dist = (peak.radius * 0.45 + (i * 0.07) % 0.3) * (1 - 0.08 * (i % 3));
      out.push({
        x: peak.x + Math.cos(angle) * dist,
        z: peak.z + Math.sin(angle) * dist,
        s: 0.55 + ((i * 7) % 13) / 30,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {deerPositions.map((d, i) => (
        <MountainDeer key={`deer-${i}`} x={d.x} z={d.z} scale={d.s} />
      ))}
      {[0, 2, 4, 6, 8].map(i => (
        <MountainBird key={`bird-${i}`} peakIdx={i} radius={3 + (i % 3) * 2} />
      ))}
    </group>
  );
}

/* ======= MOUNTAIN SLOPE HELPER ======= */

const MOUNTAIN_PEAKS = [
  { x: -76, z: -88, radius: 15, height: 15 },
  { x: -48, z: -92, radius: 19, height: 19 },
  { x: -16, z: -95, radius: 17, height: 17 },
  { x: 18, z: -91, radius: 21, height: 21 },
  { x: 52, z: -88, radius: 16, height: 16 },
  { x: 82, z: -79, radius: 13, height: 13 },
  { x: 78, z: 78, radius: 16, height: 15 },
  { x: 44, z: 88, radius: 18, height: 17 },
  { x: 8, z: 93, radius: 15, height: 14 },
  { x: -32, z: 91, radius: 20, height: 18 },
  { x: -68, z: 82, radius: 15, height: 13 },
];

function getMountainAdjustment(tx: number, tz: number): { dy: number; ry: number; rx: number } | null {
  for (const m of MOUNTAIN_PEAKS) {
    const dx = tx - m.x;
    const dz = tz - m.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < m.radius * 0.92) {
      const slopeAngle = Math.atan2(m.radius, m.height);
      const normDist = dist / m.radius;
      const dy = m.height * (1 - normDist) - 0.15;
      const rotAngle = Math.PI / 2 - Math.atan2(m.height * (1 - normDist), dist);
      const rx = -(dz / dist) * rotAngle;
      const rz = (dx / dist) * rotAngle;
      return { dy, ry: 0, rx };
    }
  }
  return null;
}

function ForestTree({ x, z, s, tone }: { x: number; z: number; s: number; tone: string }) {
  const adj = useMemo(() => getMountainAdjustment(x, z), [x, z]);
  return (
    <group position={[x, adj ? adj.dy : 0, z]} scale={s} rotation={[adj?.rx ?? 0, adj?.ry ?? 0, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.07, 0.85, 7]} />
        <meshStandardMaterial color="#4b3625" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[0.42, 0.9, 8]} />
        <meshStandardMaterial color={tone} roughness={0.94} flatShading />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <coneGeometry args={[0.32, 0.74, 8]} />
        <meshStandardMaterial color={tone} roughness={0.94} flatShading />
      </mesh>
    </group>
  );
}

function ForestAnimal({ x, z, type }: { x: number; z: number; type: 'rabbit' | 'squirrel' }) {
  const ref = useRef<THREE.Group>(null);
  const hopPhase = useRef(Math.random() * Math.PI * 2);
  const adj = useMemo(() => getMountainAdjustment(x, z), [x, z]);
  // Compensate the -0.15 offset in getMountainAdjustment so animal stands on surface
  const baseY = (adj?.dy ?? 0) + (adj ? 0.15 : 0);
  useFrame((_, delta) => {
    if (!ref.current) return;
    hopPhase.current += delta * (type === 'rabbit' ? 2.5 : 1.2);
    ref.current.position.y = baseY + Math.max(0, Math.sin(hopPhase.current) * 0.08);
    if (type === 'rabbit') {
      ref.current.rotation.y = Math.sin(hopPhase.current * 0.3) * 0.4;
    }
  });
  const scale = type === 'rabbit' ? 0.35 : 0.28;
  const color = type === 'rabbit' ? '#c4a882' : '#a07850';

  return (
    <group ref={ref} position={[x, baseY, z]} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.28, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0.32, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.18, 6, 5]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Ears */}
      {type === 'rabbit' && (
        <>
          <mesh position={[0.32, 0.55, 0.08]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.06, 0.22, 0.04]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          <mesh position={[0.32, 0.55, -0.08]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[0.06, 0.22, 0.04]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        </>
      )}
      {/* Tail */}
      <mesh position={[-0.28, 0.2, 0]}>
        <sphereGeometry args={[0.08, 5]} />
        <meshStandardMaterial color={type === 'rabbit' ? '#fff' : color} roughness={0.85} />
      </mesh>
    </group>
  );
}

function LakeFisherman({ x, z, angle }: { x: number; z: number; angle: number }) {
  return (
    <group position={[x, 2.25, z]} rotation={[0, angle, 0]}>
      {/* Seat/stool */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.35, 6]} />
        <meshStandardMaterial color="#5c4a3a" roughness={0.88} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.38, 0.52, 0.28]} />
        <meshStandardMaterial color="#3b5248" roughness={0.82} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color="#e8c4a0" roughness={0.75} />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 8]} />
        <meshStandardMaterial color="#4a5a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 8]} />
        <meshStandardMaterial color="#4a5a4a" roughness={0.8} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, 0.2, 0.12]}>
        <boxGeometry args={[0.1, 0.38, 0.1]} />
        <meshStandardMaterial color="#4a5860" roughness={0.82} />
      </mesh>
      <mesh position={[0.1, 0.2, 0.12]}>
        <boxGeometry args={[0.1, 0.38, 0.1]} />
        <meshStandardMaterial color="#4a5860" roughness={0.82} />
      </mesh>
      {/* Arms holding rod */}
      <mesh position={[0.15, 0.62, 0.28]} rotation={[0.4, 0, -0.3]}>
        <boxGeometry args={[0.08, 0.32, 0.08]} />
        <meshStandardMaterial color="#3b5248" roughness={0.82} />
      </mesh>
      {/* Fishing rod */}
      <mesh position={[0.35, 0.88, 0.55]} rotation={[0.3, 0, -0.6]}>
        <cylinderGeometry args={[0.012, 0.018, 1.8, 5]} />
        <meshStandardMaterial color="#6b5a42" roughness={0.75} />
      </mesh>
      {/* Fishing line */}
      <mesh position={[0.55, 0.42, 1.1]}>
        <cylinderGeometry args={[0.003, 0.003, 0.85, 4]} />
        <meshStandardMaterial color="#c0c0c0" transparent opacity={0.6} />
      </mesh>
      {/* Float */}
      <mesh position={[0.55, 0.02, 1.1]}>
        <sphereGeometry args={[0.04, 6]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.15} roughness={0.6} />
      </mesh>
    </group>
  );
}

function PerimeterForest() {
  const { trees, animals } = useMemo(() => {
    const tones = ['#1f3a2a', '#263f2e', '#2f4d35', '#334833'];
    const out: { x: number; z: number; s: number; tone: string }[] = [];

    // Helper: check if a position is on a mountain slope (excluding peak)
    function getMountainInfo(x: number, z: number) {
      for (const m of MOUNTAIN_PEAKS) {
        const dx = x - m.x;
        const dz = z - m.z;
        const distSq = dx * dx + dz * dz;
        const rSq = m.radius * m.radius;
        if (distSq < rSq * 0.28) return 'peak'; // top of mountain
        if (distSq < rSq * 0.95) return 'slope'; // lower/mid slope
      }
      return 'flat';
    }
    function isCityCore(x: number, z: number) {
      return Math.abs(x) < 48 && Math.abs(z) < 48;
    }

    // 1. Outer ring forest (flat ground around city)
    for (let i = 0; i < 300; i++) {
      const angle = i * 2.399963 + Math.sin(i * 1.7) * 0.12;
      const ring = 52 + ((i * 17) % 26);
      const x = Math.cos(angle) * ring + Math.sin(i * 0.31) * 3.5;
      const z = Math.sin(angle) * ring + Math.cos(i * 0.27) * 3.5;
      const info = getMountainInfo(x, z);
      if (info === 'peak') continue;
      if (isCityCore(x, z)) continue;
      // Skip some river bank positions
      const nearRiver = x < -54 && z > -48 && z < 52;
      if (nearRiver && i % 3 === 0) continue;
      out.push({ x, z, s: 0.78 + ((i * 13) % 23) / 42, tone: tones[i % tones.length] });
    }

    // 2. Trees on mountain lower slopes
    for (let i = 0; i < 160; i++) {
      const m = MOUNTAIN_PEAKS[i % MOUNTAIN_PEAKS.length];
      const angle = i * 2.618 + m.x * 0.1;
      const distRatio = 0.42 + ((i * 7) % 35) / 100; // 0.42 ~ 0.76 of radius
      const dist = m.radius * distRatio;
      const x = m.x + Math.cos(angle) * dist + Math.sin(i * 1.3) * 1.5;
      const z = m.z + Math.sin(angle) * dist + Math.cos(i * 1.1) * 1.5;
      if (isCityCore(x, z)) continue;
      out.push({ x, z, s: 0.55 + ((i * 11) % 19) / 45, tone: tones[(i + 2) % tones.length] });
    }

    // 3. North-south corridor trees
    for (let i = 0; i < 70; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (50 + ((i * 7) % 14)) + Math.sin(i) * 4.2;
      const z = -46 + ((i * 11) % 92) + Math.cos(i * 0.7) * 3.8;
      const info = getMountainInfo(x, z);
      if (info === 'peak') continue;
      if (isCityCore(x, z)) continue;
      out.push({ x, z, s: 0.64 + ((i * 5) % 17) / 36, tone: tones[(i + 1) % tones.length] });
    }

    // Small animals among trees (flat and slopes)
    const anims: { x: number; z: number; type: 'rabbit' | 'squirrel' }[] = [];
    for (let i = 0; i < 24; i++) {
      const useSlope = i % 3 === 0;
      let x: number, z: number;
      if (useSlope) {
        const m = MOUNTAIN_PEAKS[i % MOUNTAIN_PEAKS.length];
        const angle = i * 3.7 + 0.5;
        const dist = m.radius * (0.5 + ((i * 13) % 30) / 100);
        x = m.x + Math.cos(angle) * dist + Math.sin(i * 2.1) * 2;
        z = m.z + Math.sin(angle) * dist + Math.cos(i * 1.3) * 2;
      } else {
        const angle = i * 2.9 + 1.2;
        const dist = 54 + (i % 16);
        x = Math.cos(angle) * dist + Math.sin(i * 2.1) * 4;
        z = Math.sin(angle) * dist + Math.cos(i * 1.3) * 4;
      }
      const info = getMountainInfo(x, z);
      if (info === 'peak') continue;
      if (isCityCore(x, z)) continue;
      anims.push({ x, z, type: i % 3 === 0 ? 'squirrel' : 'rabbit' });
    }
    return { trees: out, animals: anims };
  }, []);

  return (
    <group>
      {trees.map((tree, i) => <ForestTree key={`outer-forest-${i}`} {...tree} />)}
      {animals.map((a, i) => <ForestAnimal key={`forest-animal-${i}`} {...a} />)}
    </group>
  );
}

function RiverWetlands() {
  const reedData = useMemo(() => Array.from({ length: 42 }, (_, i) => ({
    x: -55.1 + Math.sin(i * 1.8) * 2.1,
    z: -45 + i * 2.15,
    h: 0.38 + ((i * 11) % 17) / 35,
  })), []);
  const stoneData = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    x: -53.8 + Math.sin(i * 2.3) * 3.0,
    z: -42 + i * 4.3,
    s: 0.28 + ((i * 7) % 11) / 50,
  })), []);

  return (
    <group>
      {[-43, -27, -10, 7, 24, 41].map((z, i) => (
        <mesh key={`wetland-patch-${i}`} rotation={[-Math.PI / 2, 0, i % 2 ? 0.22 : -0.14]} position={[-53.8 + (i % 2) * 1.4, 0.012, z]}>
          <planeGeometry args={[6.2, 3.1]} />
          <meshStandardMaterial color={i % 2 ? '#3e5a3d' : '#526548'} roughness={0.96} transparent opacity={0.88} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      ))}
      {reedData.map((reed, i) => (
        <mesh key={`river-reed-${i}`} position={[reed.x, reed.h / 2, reed.z]} rotation={[0, 0, Math.sin(i) * 0.18]}>
          <cylinderGeometry args={[0.018, 0.026, reed.h, 5]} />
          <meshStandardMaterial color={i % 2 ? '#647a3b' : '#718044'} roughness={0.9} />
        </mesh>
      ))}
      {stoneData.map((stone, i) => (
        <mesh key={`river-stone-${i}`} position={[stone.x, 0.08, stone.z]} scale={[stone.s * 1.45, stone.s * 0.38, stone.s]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={i % 2 ? '#74756e' : '#5f665f'} roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

const FLOWING_WATER_VERT = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;

const FLOWING_WATER_FRAG = `
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
void main(){
  vec2 uv=vUv;
  float flow=0.0;
  for(float i=0.0;i<5.0;i++){
    float spd=0.25+i*0.12;
    float sc=2.0+i*1.5;
    float y=uv.y*sc+uTime*spd;
    float n=noise(vec2(floor(uv.x*sc*2.0),floor(y)));
    flow+=n*0.22;
    float streak=smoothstep(0.42,0.58,noise(vec2(uv.x*sc*3.0,y*0.6)));
    flow+=streak*0.15;
  }
  float highlight=smoothstep(0.35,0.55,noise(vec2(uv.x*8.0,uv.y*3.0-uTime*0.5)));
  vec3 col=uColor+vec3(flow*0.35+highlight*0.12);
  float alpha=0.55+flow*0.2;
  gl_FragColor=vec4(col,alpha);
}`;

function MountainWaterfall({ x, z, y, width = 2.0, length = 8.0, tilt = -0.72 }: {
  x: number;
  z: number;
  y: number;
  width?: number;
  length?: number;
  tilt?: number;
}) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const foam = useRef<THREE.MeshStandardMaterial>(null);
  const sheetRefs = useRef<THREE.Mesh[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = t;
    if (foam.current) foam.current.opacity = 0.46 + Math.sin(t * 3.1 + z * 0.02) * 0.1;
    sheetRefs.current.forEach((m, i) => {
      if (!m) return;
      m.position.z = ((t * 0.6 + i * 0.48 + (i % 3) * 0.32) % (length * 1.12)) - length * 0.12;
    });
  });

  const shaderMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: FLOWING_WATER_VERT,
    fragmentShader: FLOWING_WATER_FRAG,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#7dc7d6') },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  return (
    <group position={[x, 0, z]}>
      <group position={[0, y, 0]} rotation={[tilt, 0, 0]}>
        <mesh position={[0, -0.075, 0]} castShadow receiveShadow>
          <boxGeometry args={[width * 1.72, 0.22, length + 0.95]} />
          <meshStandardMaterial color="#4b554c" roughness={0.96} />
        </mesh>
        <mesh position={[0, 0.035, 0.1]}>
          <boxGeometry args={[width, 0.045, length]} />
          <primitive object={shaderMat} attach="material" ref={shaderRef} />
        </mesh>
        <mesh position={[0, 0.09, length * 0.43]}>
          <boxGeometry args={[width * 1.25, 0.035, 0.62]} />
          <meshStandardMaterial ref={foam} color="#dff7f9" roughness={0.55} transparent opacity={0.52} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => {
          const ox = (i % 2 === 0 ? -0.28 : 0.32) + (i > 5 ? -0.08 : 0.06);
          const sw = 0.04 + (i % 4) * 0.025;
          const sl = length * (0.06 + (i % 3) * 0.04);
          return (
            <mesh key={`ws-${i}`} ref={el => { sheetRefs.current[i] = el!; }}
              position={[ox * width, 0.068, 0]} rotation={[0, 0, (i % 3) * 0.03 - 0.03]}>
              <planeGeometry args={[sw, sl]} />
              <meshBasicMaterial color="#e6faff" transparent opacity={0.13 + (i % 3) * 0.05} />
            </mesh>
          );
        })}
      </group>
      <mesh position={[0, 2.26, -length * 0.37]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.05, 0.66, 1]}>
        <circleGeometry args={[width * 1.35, 24]} />
        <meshStandardMaterial color="#2f8da2" emissive="#0f8ca1" emissiveIntensity={0.08} roughness={0.34} transparent opacity={0.82} />
      </mesh>
      {[-0.82, 0.0, 0.72].map((ox, i) => (
        <mesh key={`wbr-${i}`} position={[ox * width, 2.24, -length * 0.32 + i * 0.38]} scale={[0.72 + i * 0.14, 0.28, 0.52]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={i % 2 ? '#60685d' : '#72786f'} roughness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

function LakeFish({ seed, color }: { seed: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * (0.22 + seed * 0.025) + seed;
    const rx = 2.0 + (seed % 4) * 0.72;
    const rz = 0.92 + (seed % 3) * 0.34;
    ref.current.position.x = Math.cos(t) * rx + Math.sin(seed * 1.7) * 1.6;
    ref.current.position.z = Math.sin(t * 1.18) * rz + Math.cos(seed * 0.9) * 0.85;
    ref.current.rotation.y = -t + Math.PI / 2;
    ref.current.position.y = 0.08 + Math.sin(t * 2.3) * 0.015;
  });

  const darkColor = (() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.6);
    return '#' + c.getHexString();
  })();

  return (
    <group ref={ref} position={[0, 0.08, 0]} scale={0.7 + (seed % 3) * 0.12}>
      {/* Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.06} roughness={0.5} />
      </mesh>
      {/* Head (front) */}
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.06} roughness={0.5} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.13, 0.2, 6]} />
        <meshStandardMaterial color={darkColor} roughness={0.6} />
      </mesh>
      <mesh position={[-0.32, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.13, 0.2, 6]} />
        <meshStandardMaterial color={darkColor} roughness={0.6} />
      </mesh>
      {/* Dorsal fin (top) */}
      <mesh position={[0, 0.26, 0]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.05, 0.12, 5]} />
        <meshStandardMaterial color={darkColor} transparent opacity={0.8} roughness={0.6} />
      </mesh>
      {/* Pectoral fins */}
      <mesh position={[0.05, 0, 0.16]} rotation={[0.3, 0, -0.2]}>
        <coneGeometry args={[0.03, 0.1, 5]} />
        <meshStandardMaterial color={darkColor} transparent opacity={0.7} roughness={0.6} />
      </mesh>
      <mesh position={[0.05, 0, -0.16]} rotation={[-0.3, 0, 0.2]}>
        <coneGeometry args={[0.03, 0.1, 5]} />
        <meshStandardMaterial color={darkColor} transparent opacity={0.7} roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.38, 0.08, 0.1]}>
        <sphereGeometry args={[0.025, 6]} />
        <meshStandardMaterial color="#fff" emissive="#111" emissiveIntensity={0.1} roughness={0.2} />
      </mesh>
      <mesh position={[0.38, 0.08, -0.1]}>
        <sphereGeometry args={[0.025, 6]} />
        <meshStandardMaterial color="#fff" emissive="#111" emissiveIntensity={0.1} roughness={0.2} />
      </mesh>
      <mesh position={[0.4, 0.09, 0.1]}>
        <sphereGeometry args={[0.012, 6]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={[0.4, 0.09, -0.1]}>
        <sphereGeometry args={[0.012, 6]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
    </group>
  );
}

function AlpineLakeSystem() {
  const lake = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (lake.current) {
      lake.current.emissiveIntensity = 0.05 + Math.sin(clock.elapsedTime * 0.85) * 0.015;
    }
  });

  return (
    <group>
      <group position={[-9, 2.18, 77.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.55, 1, 0.86]}>
          <circleGeometry args={[8.1, 52]} />
          <meshStandardMaterial ref={lake} color="#2a94aa" emissive="#0f8ca1" emissiveIntensity={0.12} roughness={0.24} metalness={0.05} transparent opacity={0.94} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} scale={[1.62, 1, 0.92]}>
          <torusGeometry args={[8.15, 0.22, 8, 64]} />
          <meshStandardMaterial color="#6f7466" roughness={0.94} />
        </mesh>
        <Text position={[0, 0.18, -6.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.85} color="#d9f5f6" anchorX="center" outlineWidth={0.035} outlineColor="#0f172a">
          高山湖
        </Text>
        <group position={[0, 0.04, 0]}>
          {[
            { seed: 1, color: '#fbbf24' },
            { seed: 3, color: '#f97316' },
            { seed: 5, color: '#fde68a' },
            { seed: 7, color: '#fb7185' },
            { seed: 9, color: '#facc15' },
          ].map(fish => <LakeFish key={`lake-fish-${fish.seed}`} {...fish} />)}
        </group>
      </group>
      <MountainWaterfall x={-18.2} z={84.4} y={4.65} width={2.0} length={9.5} tilt={-0.56} />
      <MountainWaterfall x={6.8} z={84.8} y={4.05} width={1.35} length={7.6} tilt={-0.5} />
      {/* Fishermen on lake shore */}
      <LakeFisherman x={-15.5} z={75.2} angle={0.8} />
      <LakeFisherman x={-1.8} z={72.5} angle={-0.6} />
      <LakeFisherman x={5.2} z={78.8} angle={-1.2} />
      <group position={[-9, 2.28, 68.8]}>
        {[-5.4, -2.8, 0, 2.8, 5.4].map((x, i) => (
          <mesh key={`lake-ripple-${i}`} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, i * 0.22]}>
            <torusGeometry args={[0.62 + i * 0.1, 0.018, 6, 28]} />
            <meshStandardMaterial color="#a7f3ff" emissive="#67e8f9" emissiveIntensity={0.06} roughness={0.55} transparent opacity={0.34} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function MountainCabin({ x, z, y, rotation = 0, scale = 1, lit = true }: {
  x: number;
  z: number;
  y: number;
  rotation?: number;
  scale?: number;
  lit?: boolean;
}) {
  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[2.25, 0.18, 1.65]} />
        <meshStandardMaterial color="#5b5346" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[1.86, 1.28, 1.32]} />
        <meshStandardMaterial color="#6b4f38" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.62, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.62, 1.62, 1.48]} />
        <meshStandardMaterial color="#32383b" roughness={0.9} />
      </mesh>
      <mesh position={[-0.48, 0.92, 0.68]}>
        <boxGeometry args={[0.34, 0.36, 0.05]} />
        <meshStandardMaterial color={lit ? '#facc15' : '#1f2937'} emissive={lit ? '#f59e0b' : '#000'} emissiveIntensity={lit ? 0.36 : 0} roughness={0.48} />
      </mesh>
      <mesh position={[0.45, 0.62, 0.69]}>
        <boxGeometry args={[0.34, 0.64, 0.06]} />
        <meshStandardMaterial color="#22272b" roughness={0.78} />
      </mesh>
      <mesh position={[0.66, 1.92, -0.26]} castShadow>
        <boxGeometry args={[0.22, 0.74, 0.22]} />
        <meshStandardMaterial color="#2b2f31" roughness={0.82} />
      </mesh>
    </group>
  );
}

function MountainCabinHamlet() {
  const cabins = useMemo(() => [
    { x: 28, z: 80, y: 2.45, rotation: -0.38, scale: 1.08, lit: true },
    { x: 40, z: 75, y: 2.35, rotation: -0.45, scale: 1.0, lit: true },
    { x: 49, z: 67, y: 2.05, rotation: -0.2, scale: 0.84, lit: true },
    { x: -33, z: 80, y: 2.35, rotation: 0.28, scale: 0.95, lit: true },
    { x: -43, z: 75, y: 2.2, rotation: 0.42, scale: 0.9, lit: true },
    { x: -58, z: 68, y: 1.7, rotation: 0.7, scale: 0.76, lit: false },
    { x: 61, z: -72, y: 2.1, rotation: -0.68, scale: 0.82, lit: true },
  ], []);
  const path = useMemo(() => [
    [-45, 0.22, 70], [-36, 0.28, 73], [-22, 0.36, 76], [-9, 2.35, 77],
    [5, 2.3, 76], [24, 0.4, 74], [42, 0.28, 71], [50, 0.22, 67],
  ] as [number, number, number][], []);

  return (
    <group>
      {cabins.map((c, i) => <MountainCabin key={`mountain-cabin-${i}`} {...c} />)}
      {path.slice(0, -1).map((p, i) => {
        const n = path[i + 1];
        const dx = n[0] - p[0];
        const dz = n[2] - p[2];
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        return (
          <mesh key={`mountain-boardwalk-${i}`} position={[(p[0] + n[0]) / 2, Math.max(p[1], n[1]) + 0.035, (p[2] + n[2]) / 2]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.55, 0.08, len]} />
            <meshStandardMaterial color="#6b5a46" roughness={0.92} />
          </mesh>
        );
      })}
      <Text position={[38, 1.32, 67]} rotation={[-Math.PI / 2, 0, -0.34]} fontSize={1.0} color="#fde68a" anchorX="center" outlineWidth={0.04} outlineColor="#111827">
        山中木屋
      </Text>
      {cabins.filter(c => c.lit).map((c, i) => (
        <pointLight key={`cabin-light-${i}`} position={[c.x, c.y + 1.25, c.z + 0.7]} intensity={0.18} distance={8} color="#fbbf24" />
      ))}
    </group>
  );
}

function CityTerrainBasin() {
  return (
    <group>
      <BasinGround />
      <MountainRange />
      <MountainAnimals />
      <AlpineLakeSystem />
      <MountainCabinHamlet />
      <RiverWetlands />
      <PerimeterForest />
    </group>
  );
}

/* ======= ANIMATED OBJECTS (combined useFrame) ======= */

interface CarDef { axis: 'x' | 'z'; lane: number; start: number; speed: number; dir: 1 | -1; model: string; scale?: number; }
interface PersonDef { startX: number; startZ: number; dir: 'x' | 'z'; speed: number; body: string; hat: string; }

const CAR_DEFS: CarDef[] = [
  { axis: 'x', lane: -1.5, start: 5, speed: 2.8, dir: 1, model: '/models/car_hatchback.glb' },
  { axis: 'x', lane: 1.5, start: 15, speed: 2.2, dir: -1, model: '/models/car_sedan.glb' },
  { axis: 'x', lane: -1.5, start: -12, speed: 3.0, dir: 1, model: '/models/car_suv.glb' },
  { axis: 'x', lane: 1.5, start: -5, speed: 2.5, dir: -1, model: '/models/car_taxi.glb' },
  { axis: 'x', lane: 1.5, start: 30, speed: 1.8, dir: -1, model: '/models/car_sedan.glb' },
  { axis: 'x', lane: -1.5, start: -30, speed: 2.4, dir: 1, model: '/models/car_van.glb', scale: 0.42 },
  { axis: 'x', lane: -1.5, start: 46, speed: 3.2, dir: 1, model: '/models/car_police.glb' },
  { axis: 'x', lane: 1.5, start: -44, speed: 1.9, dir: -1, model: '/models/car_taxi.glb' },
  { axis: 'z', lane: -35.7, start: -42, speed: 1.9, dir: 1, model: '/models/car_sedan.glb' },
  { axis: 'z', lane: -34.3, start: 35, speed: 2.1, dir: -1, model: '/models/car_suv.glb' },
  { axis: 'z', lane: -20.7, start: 16, speed: 1.6, dir: 1, model: '/models/car_van.glb', scale: 0.42 },
  { axis: 'z', lane: 19.3, start: -25, speed: 2.4, dir: 1, model: '/models/car_hatchback.glb' },
  { axis: 'z', lane: 20.7, start: 18, speed: 1.8, dir: -1, model: '/models/car_taxi.glb' },
  { axis: 'z', lane: 35.7, start: -8, speed: 2.0, dir: 1, model: '/models/car_police.glb' },
];

const PERSON_DEFS: PersonDef[] = [
  { startX: -23, startZ: -18, dir: 'z', speed: 0.35, body: '#cc4444', hat: '#222' },
  { startX: -23, startZ: 4, dir: 'z', speed: 0.46, body: '#4488cc', hat: '#fff' },
  { startX: 17, startZ: -10, dir: 'z', speed: 0.38, body: '#66aa44', hat: '#333' },
  { startX: 17, startZ: 12, dir: 'z', speed: 0.42, body: '#cc8844', hat: '#fff' },
  { startX: -37, startZ: -20, dir: 'z', speed: 0.33, body: '#aa66cc', hat: '#222' },
  { startX: -37, startZ: 10, dir: 'z', speed: 0.44, body: '#44aa88', hat: '#fff' },
  { startX: 37, startZ: -15, dir: 'z', speed: 0.37, body: '#cc88aa', hat: '#333' },
  { startX: 37, startZ: 8, dir: 'z', speed: 0.40, body: '#88aa44', hat: '#fff' },
  { startX: -48, startZ: -7, dir: 'x', speed: 0.30, body: '#94a3b8', hat: '#111827' },
  { startX: -18, startZ: 7, dir: 'x', speed: 0.36, body: '#0ea5e9', hat: '#f8fafc' },
  { startX: 8, startZ: -7, dir: 'x', speed: 0.41, body: '#f97316', hat: '#111827' },
  { startX: 33, startZ: 7, dir: 'x', speed: 0.34, body: '#22c55e', hat: '#f8fafc' },
  { startX: 49, startZ: -30, dir: 'z', speed: 0.28, body: '#e879f9', hat: '#111827' },
  { startX: -50, startZ: 26, dir: 'z', speed: 0.32, body: '#facc15', hat: '#111827' },
];

const SCALE_CAR = 0.35;
const CAR_BODY_COLORS: Record<string, string> = {
  '/models/car_hatchback.glb': '#cc3333',
  '/models/car_sedan.glb': '#3366cc',
  '/models/car_suv.glb': '#33aa44',
  '/models/car_taxi.glb': '#ddcc33',
  '/models/car_van.glb': '#9ca3af',
  '/models/car_police.glb': '#e5e7eb',
};

function LoadedCar({ model, dir, axis, scale = SCALE_CAR }: { model: string; dir: 1 | -1; axis: 'x' | 'z'; scale?: number }) {
  const { scene } = useGLTF(model);
  const clone = useMemo(() => {
    const c = scene.clone(true);
    const bodyCol = CAR_BODY_COLORS[model] || '#aa5555';
    c.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        const isBody = child.name === 'body';
        mat.color.set(isBody ? bodyCol : '#222');
        mat.metalness = isBody ? 0.4 : 0.15;
        mat.roughness = isBody ? 0.5 : 0.8;
      }
    });
    return c;
  }, [scene]);
  const rotationY = axis === 'x' ? dir * Math.PI / 2 : dir > 0 ? 0 : Math.PI;
  return <primitive object={clone} scale={scale} rotation={[0, rotationY, 0]} />;
}

function CarModel({ model, dir, axis, scale }: { model: string; dir: 1 | -1; axis: 'x' | 'z'; scale?: number }) {
  return (
    <Suspense fallback={<mesh><boxGeometry args={[0.6, 0.25, 1.0]} /><meshStandardMaterial color="#555" /></mesh>}>
      <LoadedCar model={model} dir={dir} axis={axis} scale={scale} />
    </Suspense>
  );
}

function PersonModel({ body, hat }: { body: string; hat: string }) {
  return (
    <group>
      <mesh position={[-0.06, 0.035, 0]}><boxGeometry args={[0.09, 0.03, 0.14]} /><meshStandardMaterial color="#222" roughness={0.9} /></mesh>
      <mesh position={[0.06, 0.035, 0]}><boxGeometry args={[0.09, 0.03, 0.14]} /><meshStandardMaterial color="#222" roughness={0.9} /></mesh>
      <mesh position={[-0.055, 0.16, 0]}><boxGeometry args={[0.07, 0.22, 0.09]} /><meshStandardMaterial color="#3a3a5a" roughness={0.8} /></mesh>
      <mesh position={[0.055, 0.16, 0]}><boxGeometry args={[0.07, 0.22, 0.09]} /><meshStandardMaterial color="#3a3a5a" roughness={0.8} /></mesh>
      <mesh position={[0, 0.44, 0]}><boxGeometry args={[0.26, 0.32, 0.16]} /><meshStandardMaterial color={body} roughness={0.7} /></mesh>
      {[-0.24, 0.24].map((ox, ai) => (
        <mesh key={ai} position={[ox, 0.48, 0]}><boxGeometry args={[0.04, 0.28, 0.05]} /><meshStandardMaterial color={body} roughness={0.7} /></mesh>
      ))}
      <mesh position={[0, 0.44, -0.14]}><boxGeometry args={[0.18, 0.22, 0.08]} /><meshStandardMaterial color="#4a4a3a" roughness={0.8} /></mesh>
      <mesh position={[0, 0.63, 0]}><cylinderGeometry args={[0.045, 0.06, 0.05, 8]} /><meshStandardMaterial color="#e8c4a0" roughness={0.6} /></mesh>
      <mesh position={[0, 0.695, 0]}><sphereGeometry args={[0.095, 10, 8]} /><meshStandardMaterial color="#e8c4a0" roughness={0.6} /></mesh>
      <mesh position={[0, 0.79, 0]}><cylinderGeometry args={[0.12, 0.15, 0.04, 8]} /><meshStandardMaterial color={hat} roughness={0.6} /></mesh>
    </group>
  );
}

function AnimatedTraffic() {
  const cars = useMemo(() => CAR_DEFS.filter((_, i) => i % 2 === 0).map(c => ({ ...c })), []);
  const ppl = useMemo(() => PERSON_DEFS.filter((_, i) => i % 2 === 0).map((p, i) => ({ ...p, phase: (i * 1.73) % (Math.PI * 2) })), []);
  const carsRef = useRef<(THREE.Group | null)[]>([]);
  const pplRef = useRef<(THREE.Group | null)[]>([]);
  const sceneTime = useSyncedSceneTime('ambient-traffic', false, false);

  useFrame(() => {
    const t = sceneTime.current;
    for (let i = 0; i < cars.length; i++) {
      const g = carsRef.current[i];
      if (!g) continue;
      const c = cars[i];
      const travel = ((t * c.speed * c.dir + c.start + 60) % 120) - 60;
      if (c.axis === 'x') {
        g.position.x = travel;
        g.position.z = c.lane;
      } else {
        g.position.x = c.lane;
        g.position.z = travel;
      }
    }
    for (let i = 0; i < ppl.length; i++) {
      const g = pplRef.current[i];
      if (!g) continue;
      const p = ppl[i];
      const s = Math.sin(t * p.speed + p.phase);
      if (p.dir === 'z') {
        g.position.z = p.startZ + s * 8;
        g.rotation.y = Math.sin(t * p.speed + p.phase) > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        g.position.x = p.startX + s * 8;
        g.rotation.y = Math.sin(t * p.speed + p.phase) > 0 ? -Math.PI / 2 : Math.PI / 2;
      }
      g.position.y = Math.abs(Math.sin(t * p.speed * 2 + p.phase)) * 0.02;
    }
  });

  return (
    <group>
      {cars.map((c, i) => (
        <group key={`car-${i}`} ref={(el) => { carsRef.current[i] = el; }} position={c.axis === 'x' ? [c.start, 0, c.lane] : [c.lane, 0, c.start]}>
          <CarModel model={c.model} dir={c.dir} axis={c.axis} scale={c.scale} />
        </group>
      ))}
      {ppl.map((p, i) => (
        <group key={`ppl-${i}`} ref={(el) => { pplRef.current[i] = el; }} position={[p.startX, 0, p.startZ]}>
          <PersonModel body={p.body} hat={p.hat} />
        </group>
      ))}
    </group>
  );
}

/* ======= DELIVERY STATION DISTRICT ======= */

const DeliveryStationDistrict = memo(function DeliveryStationDistrict({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  return (
    <group position={[3, 0.05, -3]} rotation={[0, Math.PI / 2, 0]}>
      <StationFloor />
      <StationWalls />
      <StationCeiling />
      <StationShelf />
      <StationShelfRight />
      <LegendBoard />
      <NoticeBoard />
      <CenterTable />
      {renderAlgoSide(naiveSnapshot, -0.55, '朴素', 30)}
      {renderAlgoSide(optimizedSnapshot, 0.55, '优化', 200)}
    </group>
  );
});

/* ======= SKY WHALE (swimming in the night sky) ======= */


/* ======= Profile data for whale body shape ======= */
const W_PROFILE: { t: number; v: number }[] = [
  { t: 0.00, v: 0.01 }, { t: 0.02, v: 0.10 }, { t: 0.05, v: 0.22 },
  { t: 0.10, v: 0.34 }, { t: 0.18, v: 0.41 }, { t: 0.30, v: 0.39 },
  { t: 0.45, v: 0.35 }, { t: 0.58, v: 0.30 }, { t: 0.70, v: 0.23 },
  { t: 0.80, v: 0.16 }, { t: 0.88, v: 0.10 }, { t: 0.94, v: 0.05 },
  { t: 1.00, v: 0.01 },
];
const H_PROFILE: { t: number; v: number }[] = [
  { t: 0.00, v: 0.01 }, { t: 0.02, v: 0.09 }, { t: 0.05, v: 0.20 },
  { t: 0.10, v: 0.31 }, { t: 0.18, v: 0.38 }, { t: 0.30, v: 0.36 },
  { t: 0.45, v: 0.32 }, { t: 0.58, v: 0.28 }, { t: 0.70, v: 0.21 },
  { t: 0.80, v: 0.15 }, { t: 0.88, v: 0.09 }, { t: 0.94, v: 0.04 },
  { t: 1.00, v: 0.01 },
];

function profileValue(pts: { t: number; v: number }[], t: number): number {
  if (t <= pts[0].t) return pts[0].v;
  if (t >= pts[pts.length - 1].t) return pts[pts.length - 1].v;
  for (let i = 0; i < pts.length - 1; i++) {
    if (t >= pts[i].t && t <= pts[i + 1].t) {
      const d = (t - pts[i].t) / (pts[i + 1].t - pts[i].t);
      return pts[i].v + (pts[i + 1].v - pts[i].v) * d;
    }
  }
  return pts[pts.length - 1].v;
}

const BODY_LENGTH = 4.4;

function buildWhaleBody() {
  const L = BODY_LENGTH;
  const rings = 44;
  const segs = 20;
  const wProfile = W_PROFILE;
  const hProfile = H_PROFILE;

  const spinePts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(L * 0.08, -0.04, 0),
    new THREE.Vector3(L * 0.22, 0.02, 0),
    new THREE.Vector3(L * 0.50, 0.06, 0),
    new THREE.Vector3(L * 0.78, 0.03, 0),
    new THREE.Vector3(L, 0, 0),
  ];
  const spine = new THREE.CatmullRomCurve3(spinePts);

  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];

  const dark = new THREE.Color(0x1a3a6b);
  const mid = new THREE.Color(0x3b6bc4);
  const light = new THREE.Color(0x8fbbf0);

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const sp = spine.getPoint(t);
    const w = profileValue(wProfile, t);
    const h = profileValue(hProfile, t);

    for (let j = 0; j <= segs; j++) {
      const theta = (j / segs) * Math.PI * 2;
      const x = sp.x;
      const y = sp.y + Math.cos(theta) * h;
      const z = sp.z + Math.sin(theta) * w;
      positions.push(x, y, z);

      const blend = (1 + Math.cos(theta)) / 2;
      const col = blend < 0.5
        ? dark.clone().lerp(mid, blend * 2)
        : mid.clone().lerp(light, (blend - 0.5) * 2);
      colors.push(col.r, col.g, col.b);
      uvs.push(t, j / segs);
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * (segs + 1) + j;
      const b = a + 1;
      const c = a + (segs + 1);
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function buildTailFlukes() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(-0.25, -0.65, -0.08, -0.90);
  s.lineTo(0, -0.12);
  s.lineTo(0.08, -0.90);
  s.quadraticCurveTo(0.25, -0.65, 0, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.006, bevelSegments: 3 });
  geo.center();
  return geo;
}

function buildDorsalFin() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.02, 0.22, -0.02, 0.30);
  s.quadraticCurveTo(-0.04, 0.22, -0.06, 0);
  s.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.004, bevelSegments: 2 });
  geo.center();
  return geo;
}

function buildPectoralFin() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.30, -0.03, 0.65, 0.02);
  s.quadraticCurveTo(0.30, 0.04, 0, 0.02);
  s.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.003, bevelSegments: 2 });
  geo.center();
  return geo;
}

function buildEye() {
  return new THREE.SphereGeometry(0.035, 8, 6);
}


function SkyWhale() {
  const outerRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  const bodyGeo = useMemo(() => buildWhaleBody(), []);
  const tailGeo = useMemo(() => buildTailFlukes(), []);
  const dorsalGeo = useMemo(() => buildDorsalFin(), []);
  const finGeo = useMemo(() => buildPectoralFin(), []);
  const eyeGeo = useMemo(() => buildEye(), []);

  const glowGeo = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < 40; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.6 + Math.random() * 2.5;
      const yOff = (Math.random() - 0.5) * 2;
      p.push(Math.cos(theta) * r, yOff, Math.sin(theta) * r);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(p), 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!outerRef.current || !bobRef.current || !tailRef.current) return;
    const t = clock.elapsedTime * 0.045;
    const radius = 54;
    const height = 36;

    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    outerRef.current.position.set(x, height + Math.sin(t * 1.7) * 6, z);
    outerRef.current.rotation.y = t + Math.PI / 2;

    bobRef.current.position.y = Math.sin(t * 2.3) * 0.3;
    bobRef.current.rotation.z = Math.sin(t * 1.5) * 0.06;
    bobRef.current.rotation.x = Math.sin(t * 2.0) * 0.03;
    tailRef.current.rotation.y = Math.sin(t * 4.0) * 0.12;
  });

  const L = BODY_LENGTH;
  const dorsalT = 0.68;
  const dorsalH = profileValue(H_PROFILE, dorsalT);
  const dorsalX = L * dorsalT;
  const peduncleX = L;
  const finT = 0.22;
  const finW = profileValue(W_PROFILE, finT);
  const finH = profileValue(H_PROFILE, finT);
  const finX = L * finT;
  const eyeX = L * 0.15;
  const eyeH = profileValue(H_PROFILE, 0.15);

  const WHALE_BLUE = '#3b6bc4';

  return (
    <group ref={outerRef} scale={[1.5, 1.5, 1.5]}>
      <group ref={bobRef}>
        {/* Main body – lofted from cross-section rings with vertex colors */}
        <mesh geometry={bodyGeo} castShadow>
          <meshStandardMaterial
            vertexColors
            roughness={0.35}
            metalness={0.10}
          />
        </mesh>

        {/* Dorsal fin – top of mid-back */}
        <mesh geometry={dorsalGeo} position={[dorsalX, dorsalH + 0.01, 0]}>
          <meshStandardMaterial color={WHALE_BLUE} roughness={0.35} />
        </mesh>

        {/* Tail flukes */}
        <mesh
          ref={tailRef}
          geometry={tailGeo}
          position={[peduncleX + 0.02, 0, 0]}
          rotation={[0, 0, 0]}
        >
          <meshStandardMaterial color={WHALE_BLUE} roughness={0.30} />
        </mesh>

        {/* Pectoral fins */}
        <mesh geometry={finGeo} position={[finX, -finH * 0.4, finW]} rotation={[0.4, 0, 0.3]}>
          <meshStandardMaterial color={WHALE_BLUE} roughness={0.35} />
        </mesh>
        <mesh geometry={finGeo} position={[finX, -finH * 0.4, -finW]} rotation={[-0.4, 0, -0.3]}>
          <meshStandardMaterial color={WHALE_BLUE} roughness={0.35} />
        </mesh>

        {/* Eye */}
        <mesh position={[eyeX, eyeH * 0.5, 0.34]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshBasicMaterial color="#0c1424" />
        </mesh>

        {/* Glow particles */}
        <points
          geometry={glowGeo}
          material={
            new THREE.PointsMaterial({
              color: '#7d9bfe',
              size: 0.08,
              transparent: true,
              opacity: 0.18,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            })
          }
        />
      </group>
      <pointLight intensity={0.6} distance={28} color="#4D6BFE" />
    </group>
  );
}

/* ======= NIGHT SKY (Points for stars) ======= */

function NightSky() {
  const stars = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < 200; i++) {
      pos.push((Math.random() - 0.5) * 220);
      pos.push(40 + Math.random() * 40);
      pos.push((Math.random() - 0.5) * 220);
    }
    return new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  }, []);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: '#fff', size: 0.18, transparent: true, opacity: 0.5, sizeAttenuation: true }), []);
  return (
    <group>
      <color attach="background" args={['#0d0d18']} />
      <fog attach="fog" args={['#0d0d18', 50, 100]} />
      <ambientLight intensity={0.3} color="#88aadd" />
      <hemisphereLight args={['#6688cc', '#1a0a00', 0.15]} />
      <directionalLight position={[20, 30, 10]} intensity={0.15} color="#aabbff" />
      <points geometry={stars} material={mat} />
      <SkyWhale />
    </group>
  );
}

/* ======= MAIN CITY SCENE ======= */

export default function CityScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const storeAlgorithmId = usePlaybackStore(s => s.algorithmId);
  const activeAlgorithmId = normalizeAlgorithmId(storeAlgorithmId);
  return (
    <group>
      <CityAtmosphere />
      <CameraController activeAlgorithmId={activeAlgorithmId} />
      <CityTerrainBasin />
      <GroundTexture />
      <CityRiver />
      <StreetGrid />
      <DowntownDenseRoadNetwork />
      <CityParcels />
      <CityStreetDetails />
      <CityBuildings />
      <CityLamps />
      <CityTrees />
      <AnimatedTraffic />
      <CityAlgorithmProjection naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} activeAlgorithmId={activeAlgorithmId} />
      {!DISTRICTS[activeAlgorithmId] && (
        <DeliveryStationDistrict naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} />
      )}
      {(activeAlgorithmId && DISTRICTS[activeAlgorithmId]) && (
        <Text position={[0, 14, 0]} fontSize={0.45} color="#557" anchorX="center">
          {DISTRICTS[activeAlgorithmId].label}
        </Text>
      )}
    </group>
  );
}

export function detectCity(): true { return true; }




























