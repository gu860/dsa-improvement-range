import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { detectData } from '../DataDetector';
import { algorithmId } from '../algorithm-context';
import type { TraceSnapshot } from '../../core/types';
import type { SceneProps } from '../types';

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

/* ======= 🔍 DOCUMENT / KMP ======= */
function DocumentDesk({ text, pattern, highlights, label, xOffset }: { text: string; pattern: string; highlights: number[]; label: string; xOffset: number }) {
  const chars = text.split('');
  const isEmpty = chars.length === 0;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#fff5e0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#f59e0b" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#3c2c1a" roughness={0.8} />
      </mesh>
      {/* Desk */}
      <mesh position={[0, 0.3, -0.5]}>
        <boxGeometry args={[4, 0.08, 1.5]} />
        <meshStandardMaterial color="#8b6914" roughness={0.7} />
      </mesh>
      {/* Paper stack */}
      <mesh position={[-1.8, 0.38, -0.8]}>
        <boxGeometry args={[0.6, 0.04, 0.8]} />
        <meshStandardMaterial color="#f5f0e0" />
      </mesh>
      <Text position={[-1.8, 0.42, -0.8]} fontSize={0.05} color="#999">原文</Text>

      {/* Magnifying glass */}
      <mesh position={[1.8, 0.7, -0.3]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
      <mesh position={[1.8, 0.5, -0.3]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Characters */}
      {!isEmpty && chars.map((ch, i) => {
        const x = -1.5 + (i / Math.max(chars.length - 1, 1)) * 3;
        const hl = highlights.includes(i);
        return (
          <group key={i}>
            <PulsingLight pos={[x, 0.5, -0.5]} color="#ffd700" active={hl} />
            <mesh position={[x, 0.35, -0.5]}>
              <boxGeometry args={[0.25, 0.32, 0.02]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#f5f0e0'} />
            </mesh>
            <Text position={[x, 0.35, -0.48]} fontSize={0.09} color={hl ? '#000' : '#333'}>{ch}</Text>
            {hl && (
              <mesh position={[x, 0.35, -0.49]}>
                <planeGeometry args={[0.22, 0.3]} />
                <meshBasicMaterial color="#ffd700" transparent opacity={0.2} />
              </mesh>
            )}
          </group>
        );
      })}

      {isEmpty && (
        <Text position={[0, 0.35, -0.5]} fontSize={0.12} color="#aa8866">等待文本数据...</Text>
      )}

      {pattern && <Text position={[0, 1.3, -1.5]} fontSize={0.14} color="#f59e0b">🔍 文档搜索 — 模式: {pattern}</Text>}
      <Text position={[0, -0.3, -1.5]} fontSize={0.14} color="#f59e0b">{label}</Text>
    </group>
  );
}

/* ======= 🪞 MIRROR / PALINDROME ======= */
function Mirror({ text, highlights, label, xOffset }: { text: string; highlights: number[]; label: string; xOffset: number }) {
  const chars = text.split('');
  const isEmpty = chars.length === 0;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.4} color="#ffe8f0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.7} color="#ffd700" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#3c1a2c" roughness={0.8} />
      </mesh>

      {/* Mirror frame */}
      <mesh position={[0, 0.9, -0.8]}>
        <torusGeometry args={[0.7, 0.05, 8, 24]} />
        <meshStandardMaterial color="#ffd700" metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.9, -0.78]}>
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial color="#aaddff" transparent opacity={0.2} />
      </mesh>

      {/* Sparkles */}
      {[0.3, -0.3, 0.5, -0.5].map((off, i) => (
        <mesh key={i} position={[off, 0.9 + off * 0.5, -0.77]}>
          <planeGeometry args={[0.02, 0.02]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Characters on mirror */}
      {!isEmpty && chars.map((ch, i) => {
        const x = -0.8 + (i / Math.max(chars.length - 1, 1)) * 1.6;
        const hl = highlights.includes(i);
        return (
          <group key={i}>
            <mesh position={[x, 0.9, -0.7]}>
              <boxGeometry args={[0.28, 0.32, 0.02]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#2a2a3c'} />
            </mesh>
            <Text position={[x, 0.9, -0.69]} fontSize={0.09} color={hl ? '#000' : '#ccc'}>{ch}</Text>
            {hl && <PulsingLight pos={[x, 0.9, -0.7]} color="#ffd700" active={true} />}
          </group>
        );
      })}

      {isEmpty && (
        <Text position={[0, 0.9, -0.7]} fontSize={0.12} color="#aa8866">等待文本...</Text>
      )}

      {/* Vanity lights */}
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -0.7]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color="#ffe082" />
        </mesh>
      ))}

      <Text position={[0, 1.9, -1.5]} fontSize={0.22} color="#ffd700">🪞 回文镜 — {label}</Text>
    </group>
  );
}

/* ======= 🔤 SCRABBLE / ANAGRAM ======= */
function Scrabble({ text, highlights, label, xOffset }: { text: string; highlights: number[]; label: string; xOffset: number }) {
  const chars = text.split('');
  const isEmpty = chars.length === 0;

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#e8ffe0" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#66bb6a" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#2c3c1a" roughness={0.8} />
      </mesh>

      {/* Board */}
      <mesh position={[0, 0.3, -0.5]}>
        <boxGeometry args={[3.5, 0.08, 1.3]} />
        <meshStandardMaterial color="#1a3c1a" roughness={0.9} />
      </mesh>
      {/* Grid lines */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} position={[x, 0.34, -0.5]}>
          <boxGeometry args={[0.005, 0.01, 1]} />
          <meshBasicMaterial color="#2d6b2d" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Tile rack */}
      <mesh position={[0, -0.05, -0.9]}>
        <boxGeometry args={[2.5, 0.05, 0.2]} />
        <meshStandardMaterial color="#8b6914" roughness={0.5} />
      </mesh>

      {/* Letter tiles */}
      {!isEmpty && chars.map((ch, i) => {
        const x = -1.5 + (i / Math.max(chars.length - 1, 1)) * 3;
        const hl = highlights.includes(i);
        return (
          <group key={i}>
            <PulsingLight pos={[x, 0.5, -0.5]} color="#ffd700" active={hl} />
            <mesh position={[x, 0.35, -0.5]}>
              <boxGeometry args={[0.22, 0.28, 0.02]} />
              <meshStandardMaterial color={hl ? '#ffd700' : '#f5f0e0'} />
            </mesh>
            <Text position={[x, 0.35, -0.48]} fontSize={0.1} color={hl ? '#000' : '#333'}>{ch}</Text>
            <Text position={[x, 0.25, -0.47]} fontSize={0.04} color="#999">{i + 1}</Text>
            {hl && (
              <mesh position={[x, 0.35, -0.49]}>
                <planeGeometry args={[0.2, 0.26]} />
                <meshBasicMaterial color="#ffd700" transparent opacity={0.2} />
              </mesh>
            )}
          </group>
        );
      })}

      {isEmpty && (
        <Text position={[0, 0.35, -0.5]} fontSize={0.12} color="#88aa66">等待字符数据...</Text>
      )}

      <Text position={[0, 1.5, -1.5]} fontSize={0.22} color="#66bb6a">🔤 拼字板 — {label}</Text>
    </group>
  );
}

/* ======= 🪟 WINDOW / LONGEST SUBSTRING ======= */
function SlidingWindow({ text, highlights, label, xOffset }: { text: string; highlights: number[]; label: string; xOffset: number }) {
  const chars = text.split('');
  const isEmpty = chars.length === 0;
  const [left, right] = highlights.length >= 2 ? [highlights[0], highlights[highlights.length - 1]] : [0, 0];

  return (
    <group position={[xOffset, 0, 0]}>
      <ambientLight intensity={0.45} color="#e0f0ff" />
      <directionalLight position={[2, 5, 3]} intensity={0.9} color="#ffffff" />
      <pointLight position={[0, 2, 1]} intensity={0.6} color="#4fc3f7" distance={6} />

      {/* Wall */}
      <mesh position={[0, 1.5, -2.5]}>
        <boxGeometry args={[6, 3.5, 0.1]} />
        <meshStandardMaterial color="#1a2c3c" roughness={0.8} />
      </mesh>
      {/* Wallpaper */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#2a4a5c" roughness={0.9} />
      </mesh>

      {/* Window frame */}
      <mesh position={[0, 0.5, -0.5]}>
        <boxGeometry args={[3.5, 0.9, 0.06]} />
        <meshStandardMaterial color="#5c4a3a" roughness={0.7} />
      </mesh>

      {/* Characters */}
      {!isEmpty && chars.map((ch, i) => {
        const x = -1.5 + (i / Math.max(chars.length - 1, 1)) * 3;
        const hl = highlights.includes(i);
        const inWindow = i >= left && i <= right;
        return (
          <group key={i}>
            <mesh position={[x, 0.5, -0.46]}>
              <boxGeometry args={[0.22, 0.32, 0.02]} />
              <meshStandardMaterial color={inWindow ? '#4fc3f7' : hl ? '#ffd700' : '#445'} emissive={inWindow ? '#4fc3f7' : '#000'} emissiveIntensity={inWindow ? 0.3 : 0} />
            </mesh>
            <Text position={[x, 0.5, -0.45]} fontSize={0.09} color={inWindow ? '#000' : '#ccc'}>{ch}</Text>
            {inWindow && <Text position={[x, 0.3, -0.46]} fontSize={0.05} color="#4fc3f7">▼</Text>}
            {hl && <PulsingLight pos={[x, 0.5, -0.46]} color="#ffd700" active={true} />}
          </group>
        );
      })}

      {isEmpty && (
        <Text position={[0, 0.5, -0.46]} fontSize={0.12} color="#6688aa">等待文本数据...</Text>
      )}

      {/* Window highlight */}
      {!isEmpty && highlights.length >= 2 && (
        <mesh position={[(-1.5 + (left / Math.max(chars.length - 1, 1)) * 3 + -1.5 + (right / Math.max(chars.length - 1, 1)) * 3) / 2, 0.5, -0.44]}>
          <boxGeometry args={[Math.max(0.25, (right - left) / Math.max(chars.length - 1, 1) * 3 + 0.25), 0.38, 0.02]} />
          <meshBasicMaterial color="#4fc3f7" transparent opacity={0.2} />
        </mesh>
      )}

      {/* Curtains */}
      <mesh position={[-1.8, 0.5, -0.48]}>
        <boxGeometry args={[0.06, 0.7, 0.02]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[1.8, 0.5, -0.48]}>
        <boxGeometry args={[0.06, 0.7, 0.02]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <Text position={[0, 1.3, -1.5]} fontSize={0.22} color="#4fc3f7">🪟 滑动窗口 — {label}</Text>
    </group>
  );
}

export default function StringScene({ naiveSnapshot, optimizedSnapshot }: SceneProps) {
  const d1 = naiveSnapshot ? detectData(naiveSnapshot.data) : null;
  const d2 = optimizedSnapshot ? detectData(optimizedSnapshot.data) : null;
  const text1 = d1?.text ?? '';
  const text2 = d2?.text ?? '';
  const pattern1 = d1?.pattern ?? '';
  const pattern2 = d2?.pattern ?? '';
  const h1 = naiveSnapshot?.highlights ?? [];
  const h2 = optimizedSnapshot?.highlights ?? [];

  const isPal = algorithmId === 'longest-palindrome';
  const isAnagram = algorithmId === 'anagram';
  const isSubstr = algorithmId === 'longest-substring';
  const isDefault = !isPal && !isAnagram && !isSubstr;

  if (isDefault) {
    return (
      <group>
        <DocumentDesk text={text1} pattern={pattern1} highlights={h1} label="朴素" xOffset={-4} />
        <DocumentDesk text={text2} pattern={pattern2} highlights={h2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  if (isPal) {
    return (
      <group>
        <Mirror text={text1} highlights={h1} label="朴素" xOffset={-4} />
        <Mirror text={text2} highlights={h2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  if (isAnagram) {
    return (
      <group>
        <Scrabble text={text1} highlights={h1} label="朴素" xOffset={-4} />
        <Scrabble text={text2} highlights={h2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  if (isSubstr) {
    return (
      <group>
        <SlidingWindow text={text1} highlights={h1} label="朴素" xOffset={-4} />
        <SlidingWindow text={text2} highlights={h2} label="优化" xOffset={4} />
        <mesh position={[0, 0, -1.5]}><planeGeometry args={[0.02, 5]} /><meshBasicMaterial color="#444" transparent opacity={0.5} /></mesh>
      </group>
    );
  }
  return null;
}

export function detectMoreString(s: TraceSnapshot): boolean {
  if (algorithmId !== 'string-search' && algorithmId !== 'longest-palindrome' && algorithmId !== 'anagram' && algorithmId !== 'longest-substring') return false;
  // String traces have inconsistent data formats (text, array, or missing)
  // Accept by algorithmId alone; components handle empty data gracefully
  return true;
}

export const stringSceneDef = {
  id: 'string-engineering',
  kind: 'engineering' as const,
  name: '字符串场景',
  detect: detectMoreString,
  priority: 100,
  component: StringScene,
};
