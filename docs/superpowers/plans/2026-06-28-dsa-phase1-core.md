# Phase 1 核心基建 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建"写代码→看动画"平台核心：双编辑器、Web Worker 沙箱执行、trace 追踪、柱状数组 3D 可视化、对比播放控制

**Architecture:** Vite + React 18 + TypeScript SPA。用户代码在 CodeMirror 6 中编辑，通过 Web Worker 沙箱执行，`trace()` API 捕获每一步快照。双 R3F 场景并排播放两个版本的执行轨迹。

**Tech Stack:** Vite · React 18 · TypeScript · React Three Fiber · Drei · CodeMirror 6 · Zustand · Tailwind CSS

---

## 文件结构

```
src/
├── main.tsx
├── App.tsx
├── index.css                    # Tailwind + 全局样式
├── core/
│   ├── types.ts                 # 所有核心类型
│   ├── executor.ts              # Web Worker 执行管理
│   └── playback-store.ts        # Zustand 播放状态
├── components/
│   ├── EditorPanel.tsx           # 左右双编辑器
│   ├── SceneCompare.tsx          # 双 3D 场景并排
│   ├── ControlBar.tsx            # 播放控制面板
│   ├── StatsPanel.tsx            # 统计对比面板
│   └── Header.tsx                # 顶栏（运行/重置/模板选择）
├── visualizers/
│   ├── DataDetector.ts           # 自动检测数据类型
│   └── ArrayBarVisualizer.tsx    # 柱状数组 3D 可视化
├── templates/
│   └── sorting.ts                # 排序预设模板
├── workers/
│   └── sandbox.worker.ts         # 代码执行沙箱
└── vite-env.d.ts
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/vite-env.d.ts`
- Create: `src/main.tsx`
- Create: `src/index.css`

- [ ] **Step 1: 初始化 package.json**

```json
{
  "name": "dsa-improvement-range",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@react-three/fiber": "^8.17.0",
    "@react-three/drei": "^9.114.0",
    "three": "^0.169.0",
    "@codemirror/view": "^6.34.0",
    "@codemirror/state": "^6.4.1",
    "@codemirror/lang-javascript": "^6.2.2",
    "@codemirror/theme-one-dark": "^6.1.2",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@types/three": "^0.169.0",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

- [ ] **Step 2: vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
});
```

- [ ] **Step 3: tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f1117',
        'surface-2': '#1a1d27',
        accent: '#6366f1',
        'accent-glow': '#818cf8',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 6: postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>算法改进靶场</title>
  </head>
  <body class="bg-surface text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 9: src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 3px;
}
```

- [ ] **Step 10: src/main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 11: 安装依赖**

Run: `npm install`
Expected: 依赖安装成功，无错误

- [ ] **Step 12: 验证构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误（此时 App.tsx 未创建，但 main.tsx 会导入它，需要先建一个空 App.tsx 或忽略）
实际上先：创建空的 `src/App.tsx` 内容为 `export default function App() { return null; }`，然后验证 tsc 通过

---

### Task 2: 核心类型定义

**Files:**
- Create: `src/core/types.ts`

- [ ] **Step 1: 编写核心类型**

```typescript
// src/core/types.ts

export interface TraceSnapshot {
  label: string;
  data: Record<string, unknown>;
  highlights?: number[];
  pointers?: Record<string, number>;
  description?: string;
  timestamp: number;
}

export interface WorkerRequest {
  id: string;
  code: string;
  data: unknown;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  traces: TraceSnapshot[];
  error?: string;
}

export interface ExecutionTrace {
  traces: TraceSnapshot[];
  totalTime: number;
  stepCount: number;
}

export interface CompareResult {
  naive: ExecutionTrace;
  optimized: ExecutionTrace;
  speedup: number;
}

export type DataStructureKind = 'array' | 'matrix' | 'tree' | 'graph' | 'linked-list';

export interface AlgorithmTemplate {
  id: string;
  name: string;
  category: string;
  naiveCode: string;
  optimizedCode: string;
  defaultData: unknown;
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 3: Web Worker 沙箱

**Files:**
- Create: `src/workers/sandbox.worker.ts`
- Create: `src/core/executor.ts`

- [ ] **Step 1: 编写 Worker 代码**

```typescript
// src/workers/sandbox.worker.ts
import type { WorkerRequest, WorkerResponse, TraceSnapshot } from '../core/types';

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, code, data } = e.data;
  const traces: TraceSnapshot[] = [];

  const trace = (label: string, snapshot: Omit<TraceSnapshot, 'timestamp' | 'label'>) => {
    traces.push({
      label,
      data: snapshot.data,
      highlights: snapshot.highlights,
      pointers: snapshot.pointers,
      description: snapshot.description,
      timestamp: performance.now(),
    });
  };

  try {
    const wrapped = `
      const trace = ${trace.toString()};
      const data = ${JSON.stringify(data)};
      ${code}
    `;
    const fn = new Function(wrapped);
    const startTime = performance.now();
    const result = fn();
    const totalTime = performance.now() - startTime;

    const response: WorkerResponse = {
      id,
      success: true,
      traces: traces.map((t, i) => ({ ...t, timestamp: t.timestamp - (traces[0]?.timestamp ?? 0) })),
      error: undefined,
    };

    self.postMessage(response);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      success: false,
      traces: [],
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};
```

- [ ] **Step 2: 编写 Executor**

```typescript
// src/core/executor.ts
import type { WorkerRequest, WorkerResponse, TraceSnapshot } from './types';

let worker: Worker | null = null;
let requestIdCounter = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/sandbox.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return worker;
}

export function terminateWorker(): void {
  worker?.terminate();
  worker = null;
}

export function executeCode(
  code: string,
  data: unknown,
  onStep?: (traces: TraceSnapshot[]) => void
): Promise<{ success: boolean; traces: TraceSnapshot[]; error?: string }> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const requestId = `req_${++requestIdCounter}`;

    const handler = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.id !== requestId) return;
      w.removeEventListener('message', handler);
      if (e.data.success) {
        resolve({ success: true, traces: e.data.traces });
      } else {
        resolve({ success: false, traces: [], error: e.data.error });
      }
    };

    w.addEventListener('message', handler);

    const timeout = setTimeout(() => {
      w.removeEventListener('message', handler);
      reject(new Error('执行超时（5s）'));
    }, 5000);

    w.addEventListener('message', () => clearTimeout(timeout), { once: true });

    const request: WorkerRequest = {
      id: requestId,
      code,
      data,
    };
    w.postMessage(request);
  });
}
```

- [ ] **Step 3: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 4: 播放状态管理 (Zustand)

**Files:**
- Create: `src/core/playback-store.ts`

- [ ] **Step 1: 编写 store**

```typescript
// src/core/playback-store.ts
import { create } from 'zustand';
import type { TraceSnapshot } from './types';

interface PlaybackState {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
  naiveTraces: TraceSnapshot[];
  optimizedTraces: TraceSnapshot[];
  naiveTime: number;
  optimizedTime: number;

  setTraces: (naive: TraceSnapshot[], optimized: TraceSnapshot[], naiveTime: number, optimizedTime: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  isPlaying: false,
  speed: 1,
  currentStep: 0,
  totalSteps: 0,
  naiveTraces: [],
  optimizedTraces: [],
  naiveTime: 0,
  optimizedTime: 0,

  setTraces: (naive, optimized, naiveTime, optimizedTime) => {
    const totalSteps = Math.max(naive.length, optimized.length);
    set({
      naiveTraces: naive,
      optimizedTraces: optimized,
      naiveTime,
      optimizedTime,
      totalSteps,
      currentStep: 0,
      isPlaying: false,
    });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed }),
  setStep: (step) => set({ currentStep: step, isPlaying: false }),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ isPlaying: false });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1, isPlaying: false });
    }
  },

  reset: () => set({
    isPlaying: false,
    currentStep: 0,
    naiveTraces: [],
    optimizedTraces: [],
    naiveTime: 0,
    optimizedTime: 0,
    totalSteps: 0,
  }),
}));
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 5: 模板（排序算法示例）

**Files:**
- Create: `src/templates/sorting.ts`

- [ ] **Step 1: 编写排序模板代码**

```typescript
// src/templates/sorting.ts
import type { AlgorithmTemplate } from '../core/types';

export const bubbleSortNaive = `// 冒泡排序（朴素）
function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      trace('compare', {
        data: { array: [...a] },
        highlights: [j, j + 1],
        pointers: { i, j },
        description: \`比较 a[\${j}]=\${a[j]} 和 a[\${j+1}]=\${a[j+1]}\`
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        trace('swap', {
          data: { array: [...a] },
          highlights: [j, j + 1],
          pointers: { i, j },
          description: \`交换 a[\${j}] 和 a[\${j+1}]\`
        });
      }
    }
  }
  return a;
}
bubbleSort(data);
`;

export const quickSortOptimized = `// 快速排序（优化）
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low >= high) return arr;
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    trace('compare', {
      data: { array: [...arr] },
      highlights: [j, high],
      pointers: { low, high, pivotIdx: high },
      description: \`比较 a[\${j}]=\${arr[j]} 和 pivot=\${pivot}\`
    });
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      trace('swap', {
        data: { array: [...arr] },
        highlights: [i, j],
        pointers: { low, high, pivotIdx: high },
        description: \`交换 a[\${i}] 和 a[\${j}]\`
      });
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  trace('partition', {
    data: { array: [...arr] },
    highlights: [i + 1, high],
    pointers: { low, high },
    description: \`pivot 归位，索引=\${i + 1}\`
  });
  quickSort(arr, low, i);
  quickSort(arr, i + 2, high);
  return arr;
}
quickSort([...data]);
`;

export const sortingTemplates: AlgorithmTemplate[] = [
  {
    id: 'bubble-vs-quick',
    name: '冒泡排序 vs 快速排序',
    category: 'sorting',
    naiveCode: bubbleSortNaive,
    optimizedCode: quickSortOptimized,
    defaultData: [64, 34, 25, 12, 22, 11, 90, 8, 37, 45],
  },
];
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 6: 数据检测器

**Files:**
- Create: `src/visualizers/DataDetector.ts`

- [ ] **Step 1: 编写数据检测器**

```typescript
// src/visualizers/DataDetector.ts
import type { DataStructureKind } from '../core/types';

export interface DetectedData {
  kind: DataStructureKind;
  array?: number[];
  matrix?: number[][];
}

export function detectData(data: Record<string, unknown>): DetectedData | null {
  const array = data['array'];
  if (Array.isArray(array)) {
    if (array.length > 0 && Array.isArray(array[0])) {
      return { kind: 'matrix', matrix: array as number[][] };
    }
    if (array.every((v) => typeof v === 'number')) {
      return { kind: 'array', array: array as number[] };
    }
    return { kind: 'array', array: array as unknown as number[] };
  }
  return null;
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 7: 柱状数组 3D 可视化器

**Files:**
- Create: `src/visualizers/ArrayBarVisualizer.tsx`

- [ ] **Step 1: 编写 ArrayBarVisualizer**

```typescript
// src/visualizers/ArrayBarVisualizer.tsx
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TraceSnapshot } from '../core/types';
import { detectData } from './DataDetector';

interface BarGroupProps {
  snapshot: TraceSnapshot | null;
}

function BarGroup({ snapshot }: BarGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
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
      const color = isHighlighted ? new THREE.Color('#f59e0b') : new THREE.Color('#6366f1');
      const x = offsetX + idx * spacing;
      const y = height / 2;
      return { idx, x, y, height, color, val, isHighlighted };
    });
  }, [array, highlights]);

  if (!array || array.length === 0) return null;

  return (
    <group ref={groupRef}>
      {bars.map((bar) => (
        <group key={bar.idx}>
          <mesh position={[bar.x, bar.y, 0]}>
            <boxGeometry args={[0.8, bar.height, 0.8]} />
            <meshStandardMaterial
              color={bar.color}
              emissive={bar.isHighlighted ? '#f59e0b' : '#000000'}
              emissiveIntensity={bar.isHighlighted ? 0.4 : 0}
            />
          </mesh>
          {/* pointer 标记 */}
          {Object.entries(pointers).map(([name, val]) => {
            if (val === bar.idx) {
              return (
                <Text
                  key={name}
                  position={[bar.x, bar.y + bar.height / 2 + 0.6, 0]}
                  fontSize={0.4}
                  color="#94a3b8"
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
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 8: 双场景并排对比

**Files:**
- Create: `src/components/SceneCompare.tsx`

- [ ] **Step 1: 编写 SceneCompare**

```typescript
// src/components/SceneCompare.tsx
import { Suspense } from 'react';
import ArrayBarVisualizer from '../visualizers/ArrayBarVisualizer';
import { usePlaybackStore } from '../core/playback-store';

export default function SceneCompare() {
  const { naiveTraces, optimizedTraces, currentStep } = usePlaybackStore();

  const naiveSnapshot = currentStep < naiveTraces.length ? naiveTraces[currentStep] : null;
  const optimizedSnapshot = currentStep < optimizedTraces.length ? optimizedTraces[currentStep] : null;

  return (
    <div className="flex gap-2 h-full bg-surface-2 rounded-lg overflow-hidden">
      <div className="flex-1 relative">
        <div className="absolute top-2 left-3 z-10 text-xs text-gray-400 bg-surface/80 px-2 py-1 rounded">
          优化前 (Naive)
        </div>
        <Suspense fallback={<div className="text-gray-400 p-4">加载 3D 场景...</div>}>
          <ArrayBarVisualizer snapshot={naiveSnapshot} />
        </Suspense>
      </div>
      <div className="w-px bg-gray-700" />
      <div className="flex-1 relative">
        <div className="absolute top-2 left-3 z-10 text-xs text-emerald-400 bg-surface/80 px-2 py-1 rounded">
          优化后 (Optimized)
        </div>
        <Suspense fallback={<div className="text-gray-400 p-4">加载 3D 场景...</div>}>
          <ArrayBarVisualizer snapshot={optimizedSnapshot} />
        </Suspense>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 9: 代码编辑器

**Files:**
- Create: `src/components/EditorPanel.tsx`

- [ ] **Step 1: 编写 EditorPanel**

```typescript
// src/components/EditorPanel.tsx
import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  labelColor?: string;
}

export default function EditorPanel({ value, onChange, label, labelColor = 'text-gray-400' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange?.(update.state.doc.toString());
      }
    });

    const view = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        javascript(),
        oneDark,
        updateListener,
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // 更新外部值变化（如切换模板）
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div className="flex flex-col h-full">
      <div className={`text-xs font-mono px-3 py-1.5 bg-surface border-b border-gray-800 ${labelColor}`}>
        {label}
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 10: 控制面板

**Files:**
- Create: `src/components/ControlBar.tsx`

- [ ] **Step 1: 编写 ControlBar**

```typescript
// src/components/ControlBar.tsx
import { useEffect, useRef } from 'react';
import { usePlaybackStore } from '../core/playback-store';

export default function ControlBar() {
  const {
    isPlaying, speed, currentStep, totalSteps,
    setPlaying, setSpeed, setStep, nextStep, prevStep, reset,
  } = usePlaybackStore();

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(50, 500 / speed);
      intervalRef.current = window.setInterval(() => {
        nextStep();
      }, delay);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, nextStep]);

  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface border-t border-gray-800">
      {/* 播放控制 */}
      <button
        onClick={() => setPlaying(!isPlaying)}
        className="text-white hover:text-accent-glow transition-colors text-lg w-8 h-8 flex items-center justify-center"
        title={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button
        onClick={prevStep}
        className="text-gray-400 hover:text-white transition-colors text-lg"
        title="上一步"
      >
        ⏮
      </button>
      <button
        onClick={nextStep}
        className="text-gray-400 hover:text-white transition-colors text-lg"
        title="下一步"
      >
        ⏭
      </button>
      <button
        onClick={reset}
        className="text-gray-400 hover:text-white transition-colors text-sm"
        title="重置"
      >
        ⏹
      </button>

      {/* 进度条 */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 1)}
          value={currentStep}
          onChange={(e) => setStep(Number(e.target.value))}
          className="flex-1 h-1 accent-accent cursor-pointer"
        />
        <span className="text-xs text-gray-500 w-20 text-right font-mono">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* 速度 */}
      <div className="flex items-center gap-1">
        {[0.5, 1, 2, 4].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              speed === s ? 'bg-accent text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 11: 统计面板

**Files:**
- Create: `src/components/StatsPanel.tsx`

- [ ] **Step 1: 编写 StatsPanel**

```typescript
// src/components/StatsPanel.tsx
import { usePlaybackStore } from '../core/playback-store';

export default function StatsPanel() {
  const { naiveTraces, optimizedTraces, naiveTime, optimizedTime } = usePlaybackStore();

  if (naiveTraces.length === 0) return null;

  const speedup = optimizedTime > 0 ? (naiveTime / optimizedTime).toFixed(2) : 'N/A';

  return (
    <div className="flex gap-6 px-4 py-2 text-xs font-mono bg-surface border-t border-gray-800">
      <StatItem label="Naive 步数" value={String(naiveTraces.length)} color="text-gray-400" />
      <StatItem label="Optimized 步数" value={String(optimizedTraces.length)} color="text-gray-400" />
      <StatItem label="Naive 耗时" value={`${naiveTime.toFixed(2)}ms`} color="text-gray-400" />
      <StatItem label="Optimized 耗时" value={`${optimizedTime.toFixed(2)}ms`} color="text-emerald-400" />
      <StatItem label="加速比" value={`${speedup}x`} color="text-accent-glow" />
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-600">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 12: 顶栏（模板选择 + 运行按钮）

**Files:**
- Create: `src/components/Header.tsx`

- [ ] **Step 1: 编写 Header**

```typescript
// src/components/Header.tsx
import { useState } from 'react';
import { sortingTemplates } from '../templates/sorting';
import { executeCode } from '../core/executor';
import { usePlaybackStore } from '../core/playback-store';
import type { AlgorithmTemplate } from '../core/types';

interface Props {
  onCodeChange: (naive: string, optimized: string) => void;
}

export default function Header({ onCodeChange }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(sortingTemplates[0]?.id ?? '');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naiveCode, setNaiveCode] = useState(sortingTemplates[0]?.naiveCode ?? '');
  const [optimizedCode, setOptimizedCode] = useState(sortingTemplates[0]?.optimizedCode ?? '');
  const [testData, setTestData] = useState(() => JSON.stringify(sortingTemplates[0]?.defaultData ?? []));

  const { setTraces, reset } = usePlaybackStore();

  const handleTemplateChange = (id: string) => {
    const tmpl = [...sortingTemplates].find((t) => t.id === id);
    if (!tmpl) return;
    setSelectedTemplate(id);
    setNaiveCode(tmpl.naiveCode);
    setOptimizedCode(tmpl.optimizedCode);
    setTestData(JSON.stringify(tmpl.defaultData));
    setError(null);
    reset();
    onCodeChange(tmpl.naiveCode, tmpl.optimizedCode);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    reset();

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(testData);
    } catch {
      setError('测试数据 JSON 格式错误');
      setIsRunning(false);
      return;
    }

    try {
      const [naiveResult, optimizedResult] = await Promise.all([
        executeCode(naiveCode, parsedData),
        executeCode(optimizedCode, parsedData),
      ]);

      if (!naiveResult.success) {
        setError(`优化前代码错误: ${naiveResult.error}`);
        setIsRunning(false);
        return;
      }
      if (!optimizedResult.success) {
        setError(`优化后代码错误: ${optimizedResult.error}`);
        setIsRunning(false);
        return;
      }

      setTraces(
        naiveResult.traces,
        optimizedResult.traces,
        naiveResult.traces.length > 0 ? naiveResult.traces[naiveResult.traces.length - 1].timestamp : 0,
        optimizedResult.traces.length > 0 ? optimizedResult.traces[optimizedResult.traces.length - 1].timestamp : 0,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setIsRunning(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface border-b border-gray-800">
      <h1 className="text-sm font-bold text-white mr-2 whitespace-nowrap">算法改进靶场</h1>

      <select
        value={selectedTemplate}
        onChange={(e) => handleTemplateChange(e.target.value)}
        className="bg-surface-2 text-white text-xs px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-accent"
      >
        {sortingTemplates.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-500">数据:</span>
        <input
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
          className="bg-surface-2 text-gray-300 px-2 py-1 rounded border border-gray-700 w-64 font-mono text-xs focus:outline-none focus:border-accent"
        />
      </div>

      <button
        onClick={handleRun}
        disabled={isRunning}
        className="ml-auto bg-accent hover:bg-accent-glow disabled:bg-gray-700 text-white text-xs px-4 py-1.5 rounded transition-colors"
      >
        {isRunning ? '运行中...' : '▶ 运行'}
      </button>

      {error && (
        <span className="text-red-400 text-xs ml-2">{error}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 13: App 主布局

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 编写 App.tsx**

```typescript
// src/App.tsx
import { useState, useCallback } from 'react';
import Header from './components/Header';
import EditorPanel from './components/EditorPanel';
import SceneCompare from './components/SceneCompare';
import ControlBar from './components/ControlBar';
import StatsPanel from './components/StatsPanel';
import { sortingTemplates } from './templates/sorting';

export default function App() {
  const [naiveCode, setNaiveCode] = useState(sortingTemplates[0]?.naiveCode ?? '');
  const [optimizedCode, setOptimizedCode] = useState(sortingTemplates[0]?.optimizedCode ?? '');

  const handleCodeChange = useCallback((naive: string, optimized: string) => {
    setNaiveCode(naive);
    setOptimizedCode(optimized);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-surface text-white">
      <Header onCodeChange={handleCodeChange} />

      {/* 编辑器区域 */}
      <div className="flex h-[35%] min-h-[200px] border-b border-gray-800">
        <div className="flex-1 border-r border-gray-800">
          <EditorPanel
            value={naiveCode}
            onChange={setNaiveCode}
            label="优化前 (Naive)"
            labelColor="text-gray-400"
          />
        </div>
        <div className="flex-1">
          <EditorPanel
            value={optimizedCode}
            onChange={setOptimizedCode}
            label="优化后 (Optimized)"
            labelColor="text-emerald-400"
          />
        </div>
      </div>

      {/* 3D 场景 */}
      <div className="flex-1 min-h-[200px]">
        <SceneCompare />
      </div>

      {/* 统计 + 控制 */}
      <StatsPanel />
      <ControlBar />
    </div>
  );
}
```

- [ ] **Step 2: 验证构建**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 验证 dev 启动**

Run: `npm run dev`
Expected: Vite 开发服务器启动，浏览器打开后可见完整布局

---

### Task 14: 修复与完善

- [ ] **Step 1: 确认 CodeMirror 导入路径正确**

验证 `@codemirror/view`、`@codemirror/state`、`@codemirror/lang-javascript`、`@codemirror/theme-one-dark`、`codemirror` 都已安装且可用

如果 `basicSetup` 从 `codemirror` 导入失败，改为：

```typescript
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const basicSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
  ]),
];
```

- [ ] **Step 2: 测试模板加载与执行**

在浏览器中：选择模板、修改数据、点击运行，观察 3D 柱子动画是否正确展示
Expected: 柱状图正常渲染，点击播放后步骤推进

- [ ] **Step 3: 边缘情况**

测试空数组 `[]`、单个元素 `[42]`、重复值 `[5,5,5,5]` 等边界数据
Expected: 3D 场景正确处理极端情况
