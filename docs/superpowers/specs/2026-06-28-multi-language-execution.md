# 多语言执行支持 — 设计文档

## 1. 概述

在当前 JS-only 执行器基础上，扩展支持 Python、C 语言的算法代码执行与可视化追踪。每种语言通过统一的 `ExecutorInterface` 接入，共享同一套 3D 可视化管线。

## 2. 架构

```
Header (语言选择器)
  │
  └─ executor/registry.ts
       │
       ├─ JS Executor      → sandbox.worker.ts (已有，重构)
       ├─ Python Executor  → python.worker.ts + Pyodide
       └─ C Executor       → c.worker.ts + TCC WASM
            │
            └─ 统一输出: ExecutionResult { traces: TraceSnapshot[], success, error }
                 │
                 └─ playback-store + 3D 场景 (不变)
```

## 3. 执行器接口

```typescript
// src/executors/types.ts
interface ExecutorConfig {
  id: 'js' | 'python' | 'c';
  name: string;
  fileExtension: string;
  traceExample: string;       // 语言对应的 trace() 调用示例
}

interface LanguageExecutor {
  config: ExecutorConfig;
  execute(code: string, data: unknown): Promise<{
    success: boolean;
    traces: TraceSnapshot[];
    error?: string;
  }>;
  loadResources?(): Promise<void>;
  terminate(): void;
}
```

## 4. 注册表

```typescript
// src/executors/registry.ts
const executors = new Map<string, LanguageExecutor>();

function register(executor: LanguageExecutor): void;
function get(id: string): LanguageExecutor;
function getCurrent(): LanguageExecutor;  // 按当前语言返回
```

## 5. Python 执行器 (Pyodide)

### 原理
- 独立 Web Worker (`src/executors/python.worker.ts`)
- 加载 Pyodide WASM (~8MB，首次加载后浏览器缓存)
- 在 Worker 内执行 Python 代码，捕获 trace 快照

### trace 注入

```python
# Worker 自动注入的代码
import json
import time

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
```

### 用户代码模板

```python
def bubble_sort(arr):
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
```

## 6. C 执行器 (TCC WASM)

### 原理
- 独立 Web Worker (`src/executors/c.worker.ts`)
- 加载 TinyCC 编译为 WASM 的版本 (`tcc.wasm`)
- Worker 内：编译 C 代码 → 生成 WASM → 实例化执行 → 收集 traces

### 架构

```
用户 C 代码 + trace 函数定义
        │
        ▼
   TCC.compile(source) → WASM bytes
        │
        ▼
   WebAssembly.instantiate(wasm)
        │
        ▼
   instance.exports.main()
        │
        ▼
   执行过程中 trace() 将数据写入共享内存
        │
        ▼
   执行完毕后读取 traces → 标准化为 TraceSnapshot[]
```

### trace 注入

C 语言的 trace 调用需要传入数据指针和长度：

```c
// Worker 注入的 trace 函数（编译时链接）
extern void trace(const char* label, int* arr, int len, int* highlights,
                  int highlight_count, int* pointers, int pointer_count);
```

### 用户代码模板

```c
#include <stdio.h>

extern void trace(const char* label, int* arr, int len,
                  int* highlights, int hl_count,
                  int* ptrs, int ptr_count);

void bubble_sort(int* a, int n) {
    int data[10];  // 固定最大长度
    int hl[2];
    int pt[4];

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            // 复制数据快照
            for (int k = 0; k < n; k++) data[k] = a[k];
            hl[0] = j; hl[1] = j + 1;
            pt[0] = i; pt[1] = j;
            trace("compare", data, n, hl, 2, pt, 2);

            if (a[j] > a[j + 1]) {
                int tmp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = tmp;
                for (int k = 0; k < n; k++) data[k] = a[k];
                trace("swap", data, n, hl, 2, pt, 2);
            }
        }
    }
}

int main() {
    bubble_sort(data, len);
    return 0;
}
```

## 7. 模板系统扩展

当前 `templates/sorting.ts` 只有 JS 代码。改为按语言分文件：

```
templates/
├── index.ts          ← 统一导出，按语言筛选
├── sorting.ts        ← JS 模板（已有）
├── sorting.py        ← Python 模板（新增）
└── sorting.c         ← C 模板（新增）
```

Template 类型增加 `language` 字段：

```typescript
interface AlgorithmTemplate {
  id: string;
  name: string;
  category: string;
  language: 'js' | 'python' | 'c';
  naiveCode: string;
  optimizedCode: string;
  defaultData: unknown;
}
```

## 8. UI 变更

Header 新增语言选择器：

```
[语言: JS ▼] [模板: 冒泡vs快排 ▼] [数据: [...]] [▶ 运行]
```

- 切换语言时，自动加载该语言的模板列表
- 切换模板时，编辑器中代码类型对应变化
- 运行时代码发送到对应语言的 executor

## 9. 编辑器增强

- CodeMirror 语言模式随语言切换：
  - JS → `javascript()` (已有)
  - Python → `python()`
  - C/C++ → `clike()`

## 10. 阶段规划

### Phase 2a: 抽象重构 + Python
- 创建 `executor/` 目录和接口定义
- 重构现有 JS executor 到新接口
- 实现 Python executor (Pyodide Worker)
- Python 排序模板

### Phase 2b: C 执行器
- 编译/获取 TCC WASM
- 实现 C executor Worker
- C 排序模板
- trace 函数的 C ABI 设计

### Phase 2c: 完善
- 测试数据格式兼容（Python list ↔ JSON ↔ C array）
- 编辑器语法高亮切换
- 语言特有模板扩展
