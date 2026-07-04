# Phase 2a: 多语言支持 — 抽象重构 + Python 执行器

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 执行器抽象层重构 + 新增 Python (Pyodide) 执行支持

**Architecture:** 定义 `LanguageExecutor` 接口，每种语言独立实现。JS 执行器重构迁移至新架构。Python 执行器通过 Pyodide WASM 在 Web Worker 中运行 Python 代码。Header 新增语言选择器。

**Tech Stack:** Pyodide (WASM CPython), @codemirror/lang-python

---

## 文件变更

```
src/
├── core/types.ts                          ← 修改: AlgorithmTemplate + language
├── executors/                             ← 新建目录
│   ├── types.ts                           ← 新建: ExecutorConfig, LanguageExecutor
│   ├── registry.ts                        ← 新建: 执行器注册表
│   ├── js/
│   │   ├── js-executor.ts                 ← 新建: JS 执行器 (新接口)
│   │   └── js.worker.ts                   ← 迁移: 从 src/workers/sandbox.worker.ts
│   └── python/
│       ├── python-executor.ts             ← 新建: Python 执行器
│       └── python.worker.ts               ← 新建: Pyodide Worker
├── components/
│   ├── Header.tsx                         ← 修改: 加语言选择器
│   └── EditorPanel.tsx                    ← 修改: 支持语言切换语法高亮
└── templates/
    ├── index.ts                           ← 新建: 统一导出所有模板
    ├── sorting.ts                         ← 修改: 加 language 字段
    └── sorting.py                         ← 新建: Python 排序模板
```

---

### Task 1: 执行器类型定义

**Files:**
- Create: `src/executors/types.ts`
- Modify: `src/core/types.ts`

- [ ] **Step 1: 创建 `src/executors/types.ts`**

```typescript
import type { TraceSnapshot } from '../core/types';

export interface ExecutorConfig {
  id: 'js' | 'python' | 'c';
  name: string;
  fileExtension: string;
  monacoMode: string;
  traceExample: string;
}

export interface ExecutionResult {
  success: boolean;
  traces: TraceSnapshot[];
  error?: string;
}

export interface LanguageExecutor {
  config: ExecutorConfig;
  execute(code: string, data: unknown, timeoutMs?: number): Promise<ExecutionResult>;
  loadResources?(): Promise<void>;
  terminate(): void;
}
```

- [ ] **Step 2: 更新 `src/core/types.ts` — AlgorithmTemplate 增加 language 字段**

```typescript
// 在 AlgorithmTemplate 接口中增加:
export interface AlgorithmTemplate {
  id: string;
  name: string;
  category: string;
  language: 'js' | 'python' | 'c';
  naiveCode: string;
  optimizedCode: string;
  defaultData: unknown;
}
```

- [ ] **Step 3: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 2: 执行器注册表

**Files:**
- Create: `src/executors/registry.ts`

- [ ] **Step 1: 创建 registry**

```typescript
import type { LanguageExecutor, ExecutorConfig } from './types';

const _executors = new Map<string, LanguageExecutor>();
let _currentId: string = 'js';

export function register(executor: LanguageExecutor): void {
  _executors.set(executor.config.id, executor);
}

export function get(id: string): LanguageExecutor {
  const exe = _executors.get(id);
  if (!exe) throw new Error(`Executor not found: ${id}`);
  return exe;
}

export function getCurrent(): LanguageExecutor {
  return get(_currentId);
}

export function setCurrent(id: string): void {
  if (!_executors.has(id)) throw new Error(`Executor not found: ${id}`);
  _currentId = id;
}

export function getCurrentId(): string {
  return _currentId;
}

export function getAllConfigs(): ExecutorConfig[] {
  return Array.from(_executors.values()).map((e) => e.config);
}

export function terminateAll(): void {
  _executors.forEach((e) => e.terminate());
  _executors.clear();
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 3: 重构 JS 执行器

**Files:**
- Move: `src/workers/sandbox.worker.ts` → `src/executors/js/js.worker.ts`
- Create: `src/executors/js/js-executor.ts`
- Remove: `src/workers/sandbox.worker.ts`

- [ ] **Step 1: 移动并调整 worker 文件**

将 `src/workers/sandbox.worker.ts` 移动到 `src/executors/js/js.worker.ts`，保持内容不变。Worker 中 import 路径改为 `../../core/types`。

- [ ] **Step 2: 创建 `src/executors/js/js-executor.ts`**

```typescript
import type { LanguageExecutor, ExecutionResult, ExecutorConfig } from '../types';
import type { WorkerRequest, WorkerResponse } from '../../core/types';

let worker: Worker | null = null;
let requestIdCounter = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' });
  }
  return worker;
}

export const jsExecutor: LanguageExecutor = {
  config: {
    id: 'js',
    name: 'JavaScript',
    fileExtension: '.js',
    monacoMode: 'javascript',
    traceExample: `trace('compare', {\n  data: { array: [...arr] },\n  highlights: [i, j],\n  pointers: { i, j },\n  description: '比较 a[i] 和 a[j]'\n});`,
  },

  async execute(code: string, data: unknown, timeoutMs = 5000): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const w = getWorker();
      const requestId = `req_${++requestIdCounter}`;

      const handler = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.id !== requestId) return;
        w.removeEventListener('message', handler);
        clearTimeout(timer);
        resolve(e.data.success
          ? { success: true, traces: e.data.traces }
          : { success: false, traces: [], error: e.data.error });
      };

      w.addEventListener('message', handler);

      const timer = setTimeout(() => {
        w.removeEventListener('message', handler);
        reject(new Error(`Execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const request: WorkerRequest = { id: requestId, code, data };
      w.postMessage(request);
    });
  },

  terminate() {
    worker?.terminate();
    worker = null;
  },
};
```

- [ ] **Step 3: 删除旧文件**

删除 `src/workers/sandbox.worker.ts` 和 `src/workers/` 目录（如果空了的话）

- [ ] **Step 4: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 4: 安装 Python 语法高亮依赖

- [ ] **Step 1: 安装 @codemirror/lang-python**

Run: `npm install @codemirror/lang-python`
Expected: 安装成功

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 5: Python 执行器 Worker

**Files:**
- Create: `src/executors/python/python.worker.ts`

- [ ] **Step 1: 创建 Pyodide Worker**

```typescript
import type { TraceSnapshot } from '../../core/types';

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/';

let pyodide: any = null;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  self.postMessage({ type: 'loading', message: '正在加载 Python 运行时 (~8MB)...' });
  importScripts(PYODIDE_CDN + 'pyodide.js');
  pyodide = await (self as any).loadPyodide({ indexURL: PYODIDE_CDN });
  self.postMessage({ type: 'loading', message: 'Python 运行时加载完成' });
  return pyodide;
}

self.onmessage = async (e: MessageEvent<{ id: string; code: string; data: unknown }>) => {
  const { id, code, data } = e.data;

  try {
    const py = await ensurePyodide();

    // 将 data 序列化为 Python 对象
    const dataJson = JSON.stringify(data);

    const pythonCode = `
import json, time

_traces = []
_t0 = None

def trace(label, snapshot):
    global _t0
    if _t0 is None:
        _t0 = time.perf_counter()
    _traces.append({
        'label': label,
        'data': snapshot.get('data', {}),
        'highlights': snapshot.get('highlights'),
        'pointers': snapshot.get('pointers', {}),
        'description': snapshot.get('description', ''),
        'timestamp': (time.perf_counter() - _t0) * 1000,
    })

data = json.loads('''${dataJson.replace(/'/g, "\\'")}''')

${code}

json.dumps({
    'traces': _traces,
    'success': True,
})
`;

    const startTime = performance.now();
    const resultJson = py.runPython(pythonCode);
    const totalTime = performance.now() - startTime;

    const result = JSON.parse(resultJson);

    const traces: TraceSnapshot[] = result.traces.map((t: any) => ({
      label: t.label,
      data: t.data,
      highlights: t.highlights ?? undefined,
      pointers: t.pointers ?? undefined,
      description: t.description ?? undefined,
      timestamp: t.timestamp ?? 0,
    }));

    const firstTs = traces[0]?.timestamp ?? 0;
    const normalized = traces.map((t: TraceSnapshot) => ({ ...t, timestamp: t.timestamp - firstTs }));

    self.postMessage({ type: 'result', id, success: true, traces: normalized });
  } catch (err: any) {
    self.postMessage({ type: 'result', id, success: false, traces: [], error: err.message ?? String(err) });
  }
};
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 6: Python 执行器封装

**Files:**
- Create: `src/executors/python/python-executor.ts`

- [ ] **Step 1: 创建 Python 执行器**

```typescript
import type { LanguageExecutor, ExecutionResult, ExecutorConfig } from '../types';

interface WorkerMessage {
  type: 'loading' | 'result';
  id?: string;
  success?: boolean;
  traces?: any[];
  error?: string;
  message?: string;
}

let worker: Worker | null = null;
let requestIdCounter = 0;
let onLoadProgress: ((msg: string) => void) | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'loading') {
        onLoadProgress?.(e.data.message ?? '');
      }
    };
  }
  return worker;
}

export const pythonExecutor: LanguageExecutor = {
  config: {
    id: 'python',
    name: 'Python',
    fileExtension: '.py',
    monacoMode: 'python',
    traceExample: `trace('compare', {\n    'data': {'array': list(a)},\n    'highlights': [i, j],\n    'pointers': {'i': i, 'j': j},\n    'description': '比较 a[i] 和 a[j]'\n})`,
  },

  async execute(code: string, data: unknown, timeoutMs = 15000): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const w = getWorker();
      const requestId = `py_req_${++requestIdCounter}`;

      const handler = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.type !== 'result' || e.data.id !== requestId) return;
        w.removeEventListener('message', handler);
        clearTimeout(timer);
        resolve(e.data.success
          ? { success: true, traces: e.data.traces! }
          : { success: false, traces: [], error: e.data.error });
      };

      w.addEventListener('message', handler);

      const timer = setTimeout(() => {
        w.removeEventListener('message', handler);
        reject(new Error(`Python execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      w.postMessage({ id: requestId, code, data });
    });
  },

  loadResources: async () => {
    return new Promise((resolve) => {
      const w = getWorker();
      const handler = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.type === 'loading' && e.data.message?.includes('加载完成')) {
          w.removeEventListener('message', handler);
          resolve();
        }
      };
      w.addEventListener('message', handler);
    });
  },

  terminate() {
    worker?.terminate();
    worker = null;
  },
};
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 7: Python 排序模板

**Files:**
- Create: `src/templates/sorting.py`
- Create: `src/templates/index.ts`
- Modify: `src/templates/sorting.ts` — 加 language 字段

- [ ] **Step 1: 创建 `src/templates/sorting.py`**

```python
# Python 模板将作为字符串嵌入 TS 文件

// src/templates/python-sorting.ts
import type { AlgorithmTemplate } from '../core/types';

export const pyBubbleSort = `def bubble_sort(arr):
    a = list(arr)
    n = len(a)
    for i in range(n - 1):
        for j in range(n - i - 1):
            trace('compare', {
                'data': {'array': list(a)},
                'highlights': [j, j + 1],
                'pointers': {'i': i, 'j': j},
                'description': f'compare a[{j}] and a[{j+1}]'
            })
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                trace('swap', {
                    'data': {'array': list(a)},
                    'highlights': [j, j + 1],
                    'pointers': {'i': i, 'j': j},
                })
    return a

bubble_sort(data)
`;

export const pyQuickSort = `def quick_sort(arr, low, high):
    if low >= high:
        return
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        trace('compare', {
            'data': {'array': list(arr)},
            'highlights': [j, high],
            'pointers': {'low': low, 'high': high},
            'description': f'compare a[{j}]={arr[j]} pivot={pivot}'
        })
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
            trace('swap', {
                'data': {'array': list(arr)},
                'highlights': [i, j],
                'pointers': {'low': low, 'high': high},
            })
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    trace('partition', {
        'data': {'array': list(arr)},
        'highlights': [i + 1],
        'pointers': {'low': low, 'high': high},
    })
    quick_sort(arr, low, i)
    quick_sort(arr, i + 2, high)

quick_sort(data, 0, len(data) - 1)
`;

export const pythonSortingTemplates: AlgorithmTemplate[] = [
  {
    id: 'py-bubble-vs-quick',
    name: '冒泡排序 vs 快速排序',
    category: 'sorting',
    language: 'python',
    naiveCode: pyBubbleSort,
    optimizedCode: pyQuickSort,
    defaultData: [64, 34, 25, 12, 22, 11, 90, 8, 37, 45],
  },
];
```

- [ ] **Step 2: 更新 `src/templates/sorting.ts` — 为 JS 模板加 language 字段**

每个模板对象中增加 `language: 'js'`。

- [ ] **Step 3: 创建 `src/templates/index.ts` — 统一导出**

```typescript
import type { AlgorithmTemplate } from '../core/types';
import { sortingTemplates as jsSorting } from './sorting';
import { pythonSortingTemplates } from './python-sorting';

export const allTemplates: AlgorithmTemplate[] = [
  ...jsSorting,
  ...pythonSortingTemplates,
];

export function getTemplatesByLanguage(language: 'js' | 'python' | 'c'): AlgorithmTemplate[] {
  return allTemplates.filter((t) => t.language === language);
}
```

- [ ] **Step 4: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 8: 编辑器 Python 语法高亮

**Files:**
- Modify: `src/components/EditorPanel.tsx`

- [ ] **Step 1: 扩展 EditorPanel 支持语言模式**

```typescript
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

// 修改 Props 增加 language 参数
interface Props {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  labelColor?: string;
  language?: 'javascript' | 'python';  // 新增
}

// 在 useEffect 中根据 language 选择 extension
const langExtension = props.language === 'python' ? python() : javascript();

// 应用到 EditorView 的 extensions 数组中
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 9: 更新 Header — 语言选择器

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Step 1: 重写 Header 支持语言切换**

```typescript
import { useState, useCallback } from 'react';
import { allTemplates, getTemplatesByLanguage } from '../templates';
import { jsExecutor } from '../executors/js/js-executor';
import { pythonExecutor } from '../executors/python/python-executor';
import { register, getCurrent, setCurrent, getAllConfigs, getCurrentId } from '../executors/registry';
import { usePlaybackStore } from '../core/playback-store';
import type { AlgorithmTemplate } from '../core/types';

// 初始化注册
register(jsExecutor);
register(pythonExecutor);
setCurrent('js');

interface Props {
  onCodeChange: (naive: string, optimized: string) => void;
  onLanguageChange: (language: 'javascript' | 'python') => void;
}

export default function Header({ onCodeChange, onLanguageChange }: Props) {
  const [currentLang, setCurrentLang] = useState(getCurrentId());
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naiveCode, setNaiveCode] = useState('');
  const [optimizedCode, setOptimizedCode] = useState('');
  const [testData, setTestData] = useState('[]');

  const { setTraces, reset } = usePlaybackStore();

  const templates = getTemplatesByLanguage(currentLang as any);
  const executorConfigs = getAllConfigs();

  // 初始化默认模板
  useState(() => {
    const first = templates[0];
    if (first) {
      setSelectedTemplate(first.id);
      setNaiveCode(first.naiveCode);
      setOptimizedCode(first.optimizedCode);
      setTestData(JSON.stringify(first.defaultData));
      onCodeChange(first.naiveCode, first.optimizedCode);
    }
  });

  const handleLanguageChange = (langId: string) => {
    setCurrent(langId);
    setCurrentLang(langId);
    const langTemplates = getTemplatesByLanguage(langId as any);
    const first = langTemplates[0];
    if (first) {
      setSelectedTemplate(first.id);
      setNaiveCode(first.naiveCode);
      setOptimizedCode(first.optimizedCode);
      setTestData(JSON.stringify(first.defaultData));
      setError(null);
      reset();
      onCodeChange(first.naiveCode, first.optimizedCode);
      onLanguageChange(langId === 'python' ? 'python' : 'javascript');
    }
  };

  const handleTemplateChange = (id: string) => {
    const tmpl = templates.find((t) => t.id === id);
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

    const executor = getCurrent();

    try {
      const [naiveResult, optimizedResult] = await Promise.all([
        executor.execute(naiveCode, parsedData),
        executor.execute(optimizedCode, parsedData),
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

      const naiveTime = naiveResult.traces.length > 0
        ? naiveResult.traces[naiveResult.traces.length - 1].timestamp : 0;
      const optimizedTime = optimizedResult.traces.length > 0
        ? optimizedResult.traces[optimizedResult.traces.length - 1].timestamp : 0;

      setTraces(naiveResult.traces, optimizedResult.traces, naiveTime, optimizedTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setIsRunning(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface border-b border-gray-800 shrink-0">
      <h1 className="text-sm font-bold text-white mr-2 whitespace-nowrap">算法改进靶场</h1>

      {/* 语言选择 */}
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-surface-2 text-white text-xs px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-accent"
      >
        {executorConfigs.map((cfg) => (
          <option key={cfg.id} value={cfg.id}>{cfg.name}</option>
        ))}
      </select>

      {/* 模板选择 */}
      <select
        value={selectedTemplate}
        onChange={(e) => handleTemplateChange(e.target.value)}
        className="bg-surface-2 text-white text-xs px-2 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-accent"
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* 数据 */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-500">数据:</span>
        <input
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
          className="bg-surface-2 text-gray-300 px-2 py-1 rounded border border-gray-700 w-64 font-mono text-xs focus:outline-none focus:border-accent"
        />
      </div>

      {/* 运行 */}
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="ml-auto bg-accent hover:bg-accent-glow disabled:bg-gray-700 text-white text-xs px-4 py-1.5 rounded transition-colors"
      >
        {isRunning ? '运行中...' : '▶ 运行'}
      </button>

      {error && <span className="text-red-400 text-xs ml-2">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

---

### Task 10: 更新 App 主布局

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 传递 language 给 EditorPanel**

```typescript
import { useState, useCallback } from 'react';
import Header from './components/Header';
import EditorPanel from './components/EditorPanel';
import SceneCompare from './components/SceneCompare';
import ControlBar from './components/ControlBar';
import StatsPanel from './components/StatsPanel';

export default function App() {
  const [naiveCode, setNaiveCode] = useState('');
  const [optimizedCode, setOptimizedCode] = useState('');
  const [editorLang, setEditorLang] = useState<'javascript' | 'python'>('javascript');

  const handleCodeChange = useCallback((naive: string, optimized: string) => {
    setNaiveCode(naive);
    setOptimizedCode(optimized);
  }, []);

  const handleLanguageChange = useCallback((lang: 'javascript' | 'python') => {
    setEditorLang(lang);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-surface text-white">
      <Header onCodeChange={handleCodeChange} onLanguageChange={handleLanguageChange} />

      <div className="flex h-[35%] min-h-[200px] border-b border-gray-800">
        <div className="flex-1 border-r border-gray-800">
          <EditorPanel
            value={naiveCode}
            onChange={setNaiveCode}
            label="优化前 (Naive)"
            labelColor="text-gray-400"
            language={editorLang}
          />
        </div>
        <div className="flex-1">
          <EditorPanel
            value={optimizedCode}
            onChange={setOptimizedCode}
            label="优化后 (Optimized)"
            labelColor="text-emerald-400"
            language={editorLang}
          />
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <SceneCompare />
      </div>

      <StatsPanel />
      <ControlBar />
    </div>
  );
}
```

- [ ] **Step 2: 验证**

Run: `npx tsc --noEmit`
Expected: 无类型错误

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 构建成功

---

### Task 11: 集成测试

- [ ] **Step 1: 启动 dev server**

Run: `npm run dev`
Expected: 启动成功

- [ ] **Step 2: 测试语言切换**

浏览器打开后：
1. 默认 JS 语言，模板 "冒泡排序 vs 快速排序" 已加载
2. 切换到 "Python"，模板变为 Python 版排序代码
3. 编辑器语法高亮为 Python 风格

- [ ] **Step 3: 测试 JS 执行**

1. 切换到 JS 语言
2. 点击 "▶ 运行"
3. 预期：执行成功，3D 柱状图显示，Stats 面板出现

- [ ] **Step 4: 测试 Python 执行**

1. 切换到 Python 语言
2. 等待 Pyodide 加载（首次 ~2-5s）
3. 点击 "▶ 运行"
4. 预期：Python 代码执行，3D 柱状图显示，Stats 面板出现
