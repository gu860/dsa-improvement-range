import { Text } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectData } from '../DataDetector';
import { algorithmId } from '../algorithm-context';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

interface TreeNodeData {
  value: number;
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
}

function buildLayout(node: TreeNodeData | null, x: number, y: number, spread: number, depth: number, out: { x: number; y: number; val: number; depth: number }[]) {
  if (!node) return;
  out.push({ x, y, val: node.value, depth });
  if (node.left) buildLayout(node.left, x - spread, y - 0.8, spread * 0.6, depth + 1, out);
  if (node.right) buildLayout(node.right, x + spread, y - 0.8, spread * 0.6, depth + 1, out);
}

function PulsingLight({ pos, color, active }: { pos: [number, number, number]; color: string; active?: boolean }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (ref.current && active) {
      ref.current.intensity = 0.5 + Math.sin(clock.elapsedTime * 4) * 0.3;
    } else if (ref.current) {
      ref.current.intensity = 0;
    }
  });
  return <pointLight ref={ref} position={pos} color={color} distance={2} />;
}

/* ======= 🌲 FOREST / TREE HEIGHT ======= */
function Forest({ tree, highlights, label, xOffset }: { tree: TreeNodeData | null; highlights: number[]; label: string; xOffset: number }) {
  if (!tree) return null;
  const nodes: { x: number; y: number; val: number; depth: number }[] = [];
  buildLayout(tree, 0, 2, 1.5, 0, nodes);

  return (
    <group position={[xOffset, 0.5, 0]}>
      <ambientLight intensity={0.5} color="#e8ffe8" />
      <directionalLight position={[2, 5, 3]} intensity={1} color="#ffffff" />
      <pointLight position={[0, 3, 1]} intensity={0.6} color="#66bb6a" distance={6} />

      {/* Sky */}
      <mesh position={[0, 1.5, -2]}>
        <boxGeometry args={[6, 4, 0.1]} />
        <meshStandardMaterial color="#87ceeb" roughness={0.8} />
      </mesh>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.95} />
      </mesh>
      {/* Grass patches */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={i} position={[x + 0.3 * i, -0.28, 0.5 + 0.3 * i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#3a7a3a" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Trees */}
      {nodes.map((n, i) => {
        const hl = highlights.includes(n.val);
        const h = 0.3 + (n.depth + 1) * 0.1;
        return (
          <group key={i}>
            <PulsingLight pos={[n.x, 0.5, 0.5]} color="#ffd700" active={hl} />
            {/* Trunk */}
            <mesh position={[n.x, -0.15, 0.5]}>
              <cylinderGeometry args={[0.04, 0.06, h, 6]} />
              <meshStandardMaterial color="#5c3a1e" />
            </mesh>
            {/* Foliage */}
            <mesh position={[n.x, -0.05 + h / 2, 0.5]}>
              <coneGeometry args={[0.22 + n.depth * 0.03, h * 0.6, 6]} />
              <meshStandardMaterial color={hl ? '#66bb6a' : '#2d8a27'} emissive={hl ? '#66bb6a' : '#000'} emissiveIntensity={hl ? 0.3 : 0} />
            </mesh>
            <Text position={[n.x, -0.25, 0.7]} fontSize={0.06} color={hl ? '#ffd700' : '#aaa'}>{String(n.val)}</Text>
            {hl && <mesh position={[n.x, 0.2, 0.5]}><sphereGeometry args={[0.03, 6, 6]} /><meshBasicMaterial color="#ffd700" /></mesh>}
          </group>
        );
      })}

      {/* Ruler */}
      <mesh position={[2.5, 0.5, 0.5]}>
        <boxGeometry args={[0.01, 1.5, 0.01]} />
        <meshStandardMaterial color="#8b6914" />
      </mesh>
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[2.5, i * 0.37, 0.5]}>
          <boxGeometry args={[0.04, 0.005, 0.01]} />
          <meshBasicMaterial color="#8b6914" />
        </mesh>
      ))}

      <Text position={[0, 2.2, -1.5]} fontSize={0.22} color="#2d8a27">🌲 森林测量 — {label}</Text>
    </group>
  );
}

/* ======= 🗄 FILING CABINET / BST ======= */
function FilingCabinet({ tree, highlights, label, xOffset }: { tree: TreeNodeData | null; highlights: number[]; label: string; xOffset: number }) {
  if (!tree) return null;
  const nodes: { x: number; y: number; val: number; depth: number }[] = [];
  buildLayout(tree, 0, 2, 1.5, 0, nodes);

  return (
    <group position={[xOffset, 0.5, 0]}>
      <ambientLight intensity={0.45} color="#fff5e0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#f59e0b" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[6, 4, 0.1]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
      </mesh>

      {/* Filing cabinet */}
      <mesh position={[-2, 0.3, -0.5]}>
        <boxGeometry args={[0.9, 1.4, 0.5]} />
        <meshStandardMaterial color="#6b4423" roughness={0.7} />
      </mesh>
      {/* Drawers */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i}>
          <mesh position={[-2, 0.1 + i * 0.3, -0.25]}>
            <boxGeometry args={[0.7, 0.02, 0.35]} />
            <meshStandardMaterial color="#8b6914" />
          </mesh>
          <mesh position={[-2, 0.1 + i * 0.3, -0.22]}>
            <boxGeometry args={[0.03, 0.04, 0.02]} />
            <meshStandardMaterial color="#d4a853" metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Tree as file labels */}
      {nodes.map((n, i) => {
        const hl = highlights.includes(n.val);
        const parent = nodes.find(p => p.depth === n.depth - 1 && Math.abs(p.x - n.x) < 0.8);
        return (
          <group key={i}>
            {parent && (
              <mesh position={[(parent.x + n.x) / 2, (parent.y + n.y) / 2, -0.5]} rotation={[0, 0, Math.atan2(n.y - parent.y, n.x - parent.x)]}>
                <planeGeometry args={[0.02, Math.sqrt((n.x - parent.x) ** 2 + (n.y - parent.y) ** 2)]} />
                <meshBasicMaterial color={hl || highlights.includes(parent.val) ? '#ffd700' : '#666'} />
              </mesh>
            )}
            <mesh position={[n.x, n.y, -0.5]}>
              <boxGeometry args={[0.4, 0.15, 0.02]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#d4c5a9'} />
            </mesh>
            <mesh position={[n.x - 0.14, n.y, -0.49]}>
              <boxGeometry args={[0.01, 0.06, 0.01]} />
              <meshStandardMaterial color="#888" />
            </mesh>
            <Text position={[n.x, n.y, -0.48]} fontSize={0.06} color={hl ? '#000' : '#555'}>#{String(n.val)}</Text>
            {hl && <PulsingLight pos={[n.x, n.y, -0.5]} color="#ffd700" active={true} />}
          </group>
        );
      })}

      <Text position={[0, 2.2, -1.5]} fontSize={0.22} color="#f59e0b">🗄 文件校验 — {label}</Text>
    </group>
  );
}

/* ======= 👨‍👩‍👧 FAMILY TREE / LCA ======= */
function FamilyTree({ tree, highlights, label, xOffset }: { tree: TreeNodeData | null; highlights: number[]; label: string; xOffset: number }) {
  if (!tree) return null;
  const nodes: { x: number; y: number; val: number; depth: number }[] = [];
  buildLayout(tree, 0, 2, 1.5, 0, nodes);

  return (
    <group position={[xOffset, 0.5, 0]}>
      <ambientLight intensity={0.4} color="#f0e8ff" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#ffd700" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[6, 4, 0.1]} />
        <meshStandardMaterial color="#2a2a3c" roughness={0.8} />
      </mesh>

      {/* Connections + photo frames */}
      {nodes.map((n, i) => {
        const hl = highlights.includes(n.val);
        const parent = nodes.find(p => p.depth === n.depth - 1 && Math.abs(p.x - n.x) < 0.8);
        return (
          <group key={i}>
            {parent && (
              <mesh position={[(parent.x + n.x) / 2, (parent.y + n.y) / 2, -0.5]} rotation={[0, 0, Math.atan2(n.y - parent.y, n.x - parent.x)]}>
                <planeGeometry args={[0.025, Math.sqrt((n.x - parent.x) ** 2 + (n.y - parent.y) ** 2)]} />
                <meshBasicMaterial color={hl || highlights.includes(parent.val) ? '#ffd700' : '#555'} />
              </mesh>
            )}
            <mesh position={[n.x, n.y, -0.5]}>
              <boxGeometry args={[0.3, 0.35, 0.02]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#8b6914'} metalness={hl ? 0.5 : 0.2} />
            </mesh>
            <mesh position={[n.x, n.y, -0.49]}>
              <planeGeometry args={[0.25, 0.25]} />
              <meshBasicMaterial color={hl ? '#ffe082' : '#ddd'} />
            </mesh>
            <Text position={[n.x, n.y - 0.22, -0.48]} fontSize={0.05} color={hl ? '#ffd700' : '#999'}>#{String(n.val)}</Text>
            {hl && <PulsingLight pos={[n.x, n.y, -0.5]} color="#ffd700" active={true} />}
          </group>
        );
      })}

      <Text position={[0, 2.2, -1.5]} fontSize={0.22} color="#ffd700">👨‍👩‍👧 家谱 — {label}</Text>
    </group>
  );
}

/* ======= 📂 DIRECTORY / TRAVERSALS ======= */
function DirectoryTree({ tree, highlights, label, xOffset }: { tree: TreeNodeData | null; highlights: number[]; label: string; xOffset: number }) {
  if (!tree) return null;
  const nodes: { x: number; y: number; val: number; depth: number }[] = [];
  buildLayout(tree, 0, 2, 1.5, 0, nodes);

  return (
    <group position={[xOffset, 0.5, 0]}>
      <ambientLight intensity={0.45} color="#e8f0ff" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#f59e0b" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1, -2]}>
        <boxGeometry args={[6, 4, 0.1]} />
        <meshStandardMaterial color="#3c3c2a" roughness={0.8} />
      </mesh>

      {/* Connections + folders */}
      {nodes.map((n, i) => {
        const hl = highlights.includes(n.val);
        const parent = nodes.find(p => p.depth === n.depth - 1 && Math.abs(p.x - n.x) < 0.8);
        return (
          <group key={i}>
            {parent && (
              <mesh position={[(parent.x + n.x) / 2, (parent.y + n.y) / 2, -0.5]} rotation={[0, 0, Math.atan2(n.y - parent.y, n.x - parent.x)]}>
                <planeGeometry args={[0.015, Math.sqrt((n.x - parent.x) ** 2 + (n.y - parent.y) ** 2)]} />
                <meshBasicMaterial color="#777" />
              </mesh>
            )}
            <mesh position={[n.x, n.y, -0.5]}>
              <boxGeometry args={[0.35, 0.25, 0.02]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#d4a853'} roughness={0.5} />
            </mesh>
            <mesh position={[n.x, n.y + 0.1, -0.49]}>
              <planeGeometry args={[0.15, 0.04]} />
              <meshBasicMaterial color={hl ? '#fff' : '#a08030'} />
            </mesh>
            <Text position={[n.x, n.y - 0.18, -0.48]} fontSize={0.04} color={hl ? '#ffd700' : '#888'}>dir/{n.val}</Text>
            {hl && <PulsingLight pos={[n.x, n.y, -0.5]} color="#ffd700" active={true} />}
          </group>
        );
      })}

      <Text position={[0, 2.2, -1.5]} fontSize={0.22} color="#f59e0b">📂 目录遍历 — {label}</Text>
    </group>
  );
}

export default function TreeScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const d1 = naiveSnapshot ? detectData(naiveSnapshot.data) : null;
  const d2 = optimizedSnapshot ? detectData(optimizedSnapshot.data) : null;
  const tree1 = d1?.kind === 'tree' ? (d1.tree as unknown as TreeNodeData) : null;
  const tree2 = d2?.kind === 'tree' ? (d2.tree as unknown as TreeNodeData) : null;
  const h1 = naiveSnapshot?.highlights ?? [];
  const h2 = optimizedSnapshot?.highlights ?? [];

  const isHeight = algorithmId === 'tree-height';
  const isBST = algorithmId === 'validate-bst';
  const isLCA = algorithmId === 'lca';
  const isTraversal = algorithmId === 'traversals';

  if (!isHeight && !isBST && !isLCA && !isTraversal) return null;

  return (
    <group>
      {isHeight && (
        <>
          <Forest tree={tree1} highlights={h1} label="朴素" xOffset={-4} />
          <Forest tree={tree2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      {isBST && (
        <>
          <FilingCabinet tree={tree1} highlights={h1} label="朴素" xOffset={-4} />
          <FilingCabinet tree={tree2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      {isLCA && (
        <>
          <FamilyTree tree={tree1} highlights={h1} label="朴素" xOffset={-4} />
          <FamilyTree tree={tree2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      {isTraversal && (
        <>
          <DirectoryTree tree={tree1} highlights={h1} label="朴素" xOffset={-4} />
          <DirectoryTree tree={tree2} highlights={h2} label="优化" xOffset={4} />
        </>
      )}
      <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
    </group>
  );
}

export function detectMoreTree(s: TraceSnapshot): boolean {
  if (algorithmId !== 'tree-height' && algorithmId !== 'validate-bst' && algorithmId !== 'lca' && algorithmId !== 'traversals') return false;
  // Some tree traces only contain array data (BFS levels, inorder values, etc.)
  // Accept by algorithmId alone since tree structure comes from defaultData
  return true;
}

export const treeSceneDef = {
  id: 'tree-engineering',
  kind: 'engineering' as const,
  name: '树场景',
  detect: detectMoreTree,
  priority: 100,
  component: TreeScene,
};
