# Phase 3: 双场景可视化 + C 执行器 — 设计文档

## 1. 概述

在现有架构基础上新增两大能力：
- **双场景可视化** — 每个算法版本同时展示**抽象算法演示**（柱状图/树/图）和**工程类比场景**（分拣线/地图导航/工厂流水线），上下并排
- **C 语言执行器** — 通过 TCC (Tiny C Compiler) WASM 在浏览器内编译执行 C 语言算法代码

布局从左右并排升级为 2×2 网格：

```
┌─────────────────────┬─────────────────────────┐
│ [Naive 算法可视化]   │ [Opt 算法可视化]         │
│  柱状图/树/图       │  柱状图/树/图            │
├─────────────────────┼─────────────────────────┤
│ [Naive 工程场景]     │ [Opt 工程场景]           │
│  分拣线/地图/流水线  │  分拣线/地图/流水线       │
├─────────────────────┴─────────────────────────┤
│  控制栏 + 统计面板                               │
└───────────────────────────────────────────────┘
```

## 2. 场景系统架构

### 2.1 核心概念

**场景 (Scene)** = 一个 React 组件，接收 `TraceSnapshot`，渲染 3D 内容。

两类场景：
- **AbstractScene** — 抽象数据可视化（已有的 `ArrayBarVisualizer` 等）
- **EngineeringScene** — 工程类比 3D 场景（新增）

### 2.2 场景注册表

```
src/scenes/
├── SceneRegistry.ts        ← 场景发现与匹配
├── AbstractScenes/         ← 抽象算法可视化器
│   ├── ArrayBarVisualizer.tsx  (已有, 迁移至此)
│   ├── GridVisualizer.tsx      (待建)
│   ├── TreeVisualizer.tsx      (待建)
│   └── GraphVisualizer.tsx     (待建)
├── EngineeringScenes/      ← 工程类比场景
│   ├── SortingFactory.tsx      ← 排序 → 分拣工厂
│   ├── PathMap.tsx             ← 路径 → 地图导航
│   ├── AssemblyLine.tsx        ← DP → 流水线
│   └── FileSystem.tsx          ← 树 → 文件系统
└── types.ts                ← 场景类型定义
```

#### 场景接口

```typescript
// src/scenes/types.ts
import type { TraceSnapshot } from '../core/types';

export type SceneKind = 'abstract' | 'engineering';

export interface SceneDefinition {
  id: string;
  kind: SceneKind;
  name: string;
  /** 判断此场景是否能处理该 trace */
  detect: (snapshot: TraceSnapshot) => boolean;
  /** 场景优先级 (多个匹配时取最高) */
  priority: number;
  /** 场景组件 */
  component: React.ComponentType<SceneProps>;
}

export interface SceneProps {
  snapshot: TraceSnapshot | null;
  /** 场景上下文 (可选配置参数) */
  context?: Record<string, unknown>;
}
```

#### 场景匹配机制

```typescript
// src/scenes/SceneRegistry.ts
class SceneRegistry {
  private scenes: SceneDefinition[] = [];

  register(def: SceneDefinition): void;
  
  /** 返回匹配度最高的 abstract 场景 */
  resolveAbstract(snapshot: TraceSnapshot): SceneDefinition | null;
  
  /** 返回匹配度最高的 engineering 场景 */
  resolveEngineering(snapshot: TraceSnapshot): SceneDefinition | null;
}
```

匹配逻辑：遍历所有已注册场景，调用 `detect(snapshot)`，按 `priority` 排序取最高分。

#### 场景 vs 数据类型映射

| trace.data 形状 | AbstractScene | EngineeringScene |
|---|---|---|
| `{ array: number[] }` | ArrayBarVisualizer | SortingFactory |
| `{ matrix: number[][] }` | GridVisualizer | AssemblyLine |
| `{ tree: TreeNode }` | TreeVisualizer | FileSystem |
| `{ graph: {nodes, edges} }` | GraphVisualizer | PathMap |

### 2.3 2×2 网格布局

```typescript
// src/components/SceneGrid.tsx (替代原有 SceneCompare)
interface SceneGridProps {
  naiveSnapshot: TraceSnapshot | null;
  optimizedSnapshot: TraceSnapshot | null;
}
```

布局结构：
```
SceneGrid
├── Column: Naive
│   ├── SceneFrame (kind=abstract)  ← 50% 高
│   └── SceneFrame (kind=engineering) ← 50% 高
├── Divider (竖线)
└── Column: Optimized
    ├── SceneFrame (kind=abstract)  ← 50% 高
    └── SceneFrame (kind=engineering) ← 50% 高
```

`SceneFrame` 组件：
- 用 `SceneRegistry` 解析合适的场景组件
- Suspense 包裹（3D 场景懒加载）
- 左上角显示场景名称标签
- 透明的 "无数据" 状态

### 2.4 EngineeringScene 设计原则

每个 EngineeringScene 必须：
1. **接收相同的 TraceSnapshot** — 与 AbstractScene 共享同一组 trace 数据
2. **映射数据到 3D 世界** — 数组元素 → 包裹高度/车辆数量/节点大小
3. **同步高亮** — `highlights` / `pointers` 映射到场景中的对应实体
4. **显示算法标签/描述** — 在场景中合适位置显示当前操作描述

**设计约束：**
- 场景以"示意性"为主，不追求高保真物理模拟
- 使用少量几何体 + 动画（缩放/位移/颜色变化）表达操作语义
- 每个场景控制在 ~200 行 R3F 组件内
- 支持 OrbitControls 自由视角

## 3. 工程场景详细设计

### 3.1 SortingFactory (排序 → 分拣工厂)

**映射：**
- 数组元素 → 传送带上的包裹（高度 = 值）
- 比较操作 → 两个包裹被机械臂抓起对比
- 交换操作 → 两个包裹在空中交换位置后落下
- highlights → 被操作的包裹发光/放大
- pointers(i, j) → 机械臂指向对应位置

**3D 场景构成：**
```
[包裹] [包裹] [包裹] [包裹] [包裹]  ← 传送带
   ↑                              ↑ 机械臂
   i                             j
```

- 地面 + 传送带平面
- 每个数组元素一个立方体包裹，颜色渐变（蓝→红=小→大）
- 高亮包裹闪烁 + 发光边缘
- 可选的顶棚/工厂背景装饰

### 3.2 PathMap (路径 → 地图/路网)

**映射：**
- graph.nodes → 城市/路口标记
- graph.edges → 道路/航线
- 距离权重 → 道路宽度/颜色（红=拥堵，绿=畅通）
- 路径搜索过程 → 车辆沿候选路线移动
- 最终路径 → 车辆沿最优路径行驶 + 轨迹线发光

**3D 场景构成：**
```
  城市A ──── 城市B
    │  \       │
    │    ┌────城市C
  城市D ──── 城市E
```
- 平面地图 + 海拔微起伏
- 节点 = 柱体建筑/圆点
- 边 = 道路线条
- 高亮节点/边 = 闪烁/发光

### 3.3 AssemblyLine (DP → 工厂流水线)

**映射：**
- DP 矩阵的行 → 并行工位
- DP 矩阵的列 → 时间节拍
- 每个单元的值 → 工位上的产品累计量（柱体高度）
- 当前计算的单元 → 机械臂正在组装的工位

**3D 场景构成：**
- 流水线网格平面
- 每个格子一个产品柱体
- 高亮行/列 = 机械臂轨道
- 箭头指示计算方向

### 3.4 FileSystem (树 → 文件系统)

**映射：**
- TreeNode → 文件夹/文件图标
- 树层次 → 3D 空间中的 Z 轴层叠
- 当前节点 → 高亮选中文件
- 搜索/插入/删除 → 文件飞入/飞出动画

**3D 场景构成：**
- 垂直树结构（Z 轴深度表示层级）
- 文件夹 = 黄色立方体，文件 = 蓝色薄片
- 连接线 = 路径线段

## 4. C 执行器

### 4.1 技术选型

| 方案 | 说明 |
|---|---|
| TCC WASM | TinyCC 编译为 WASM，在浏览器中编译 C → WASM → 执行 |
| Emscripten | 用于构建 tcc.wasm 的工具链 |

### 4.2 架构

```
用户 C 代码
  │
  ▼
C 执行器 Worker (src/executors/c/c.worker.ts)
  │
  ├─ 1. 加载 tcc.wasm (TCC 编译器)
  ├─ 2. 注入 trace 辅助函数 + 用户代码
  ├─ 3. TCC 编译源码 → WASM bytes
  ├─ 4. WebAssembly.instantiate(wasm)
  ├─ 5. 调用 main()
  ├─ 6. 从 WASM 内存读取 __trace_buffer
  └─ 7. 序列化 traces → 返回主线程
```

### 4.3 TCC WASM 获取

TCC 已被 Emscripten 编译为 WASM，可从以下方式获取：
- **推荐**: 使用社区维护的 `tcc-wasm` 包 (https://github.com/cyberphone/tcc-wasm)
- 或自行编译 TCC 源码 (https://repo.or.cz/tinycc.git) 使用 Emscripten SDK
- 预构建的 tcc.wasm (~500KB) 托管在项目 `public/wasm/` 目录

首次访问时从 CDN 加载 tcc.wasm，之后浏览器缓存。

### 4.4 C 语言 trace ABI

C 语言没有动态对象，trace 通过共享内存完成：

```c
// 用户代码中 trace 的声明 (由模板自动包含)
extern void trace(
    const char* label,   // 操作标签
    int* data,           // 数组数据指针
    int data_len,        // 数组长度
    int* highlights,     // 高亮索引数组
    int hl_count,        // 高亮数量
    int* pointers,       // 指针键值对 [key1, val1, key2, val2, ...]
    int ptr_count        // 指针数量
);
```

### 4.5 Worker 内部实现

```c
// 注入到用户代码前的 trace 基础设施 (C 源码)
#define MAX_DATA 64
#define MAX_HIGHLIGHTS 16
#define MAX_POINTERS 16
#define MAX_TRACES 2048
#define MAX_LABEL 32

typedef struct {
    int data[MAX_DATA];
    int data_len;
    int highlights[MAX_HIGHLIGHTS];
    int hl_count;
    int pointers[MAX_POINTERS];
    int ptr_count;
    char label[MAX_LABEL];
    double timestamp;
} TraceEntry;

TraceEntry __trace_buffer[MAX_TRACES];
int __trace_count = 0;

void trace(const char* label, int* data, int data_len,
           int* highlights, int hl_count,
           int* pointers, int ptr_count) {
    if (__trace_count >= MAX_TRACES) return;
    TraceEntry* t = &__trace_buffer[__trace_count++];
    
    int i;
    for (i = 0; i < data_len && i < MAX_DATA; i++)
        t->data[i] = data[i];
    t->data_len = i;
    
    for (i = 0; i < hl_count && i < MAX_HIGHLIGHTS; i++)
        t->highlights[i] = highlights[i];
    t->hl_count = i;
    
    for (i = 0; i < ptr_count && i < MAX_POINTERS; i++)
        t->pointers[i] = pointers[i];
    t->ptr_count = i;
    
    // 复制 label
    for (i = 0; label[i] && i < MAX_LABEL - 1; i++)
        t->label[i] = label[i];
    t->label[i] = '\0';
}
```

### 4.6 C 模板示例

```c
#include <stdio.h>

extern void trace(const char* label, int* data, int data_len,
                  int* highlights, int hl_count,
                  int* pointers, int ptr_count);

void bubble_sort(int* a, int n) {
    int data[64];
    int hl[2];
    int ptrs[4];
    
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            // 准备数据快照
            for (int k = 0; k < n; k++) data[k] = a[k];
            hl[0] = j; hl[1] = j + 1;
            ptrs[0] = i; ptrs[1] = j;
            trace("compare", data, n, hl, 2, ptrs, 2);
            
            if (a[j] > a[j + 1]) {
                int tmp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = tmp;
                
                for (int k = 0; k < n; k++) data[k] = a[k];
                trace("swap", data, n, hl, 2, ptrs, 2);
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90, 8, 37, 45};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubble_sort(arr, n);
    return 0;
}
```

### 4.7 C 执行器实现

```typescript
// src/executors/c/c-executor.ts
import type { LanguageExecutor, ExecutionResult } from '../types';

// c.worker.ts 加载 tcc.wasm，编译执行用户 C 代码
// 执行完毕后从 WASM 内存中读取 trace buffer
// 序列化为 TraceSnapshot[] 返回

export const cExecutor: LanguageExecutor = {
  config: {
    id: 'c',
    name: 'C',
    fileExtension: '.c',
    monacoMode: 'clike',
    traceExample: `trace("compare", data, n, hl, 2, ptrs, 2);`,
  },
  // ...
};
```

## 5. Playback Store 扩展

当前 Zustand store 只存储一次完整的 trace 序列。双场景不需要改动 store——两个场景共享同一组 `TraceSnapshot`，只是渲染方式不同。

```typescript
// playback-store.ts - 无需改动
interface PlaybackState {
  naiveTraces: TraceSnapshot[];
  optimizedTraces: TraceSnapshot[];
  currentStep: number;
  // ... 其余不变
}
```

## 6. 目录变更总览

```
src/
├── scenes/                              ← 新建
│   ├── types.ts                        ← 场景类型定义
│   ├── SceneRegistry.ts                ← 场景注册表
│   ├── AbstractScenes/
│   │   ├── ArrayBarVisualizer.tsx      ← 迁移 (from visualizers/)
│   │   ├── GridVisualizer.tsx          ← 新建
│   │   ├── TreeVisualizer.tsx          ← 新建
│   │   └── GraphVisualizer.tsx         ← 新建
│   └── EngineeringScenes/
│       ├── SortingFactory.tsx           ← 新建: 排序分拣线
│       ├── PathMap.tsx                  ← 新建: 路径地图
│       ├── AssemblyLine.tsx            ← 新建: DP 流水线
│       └── FileSystem.tsx              ← 新建: 文件系统树
├── components/
│   ├── SceneGrid.tsx                   ← 新建: 2×2 网格 (替代 SceneCompare)
│   ├── SceneFrame.tsx                  ← 新建: 场景容器
│   └── SceneCompare.tsx                ← 删除
├── executors/
│   ├── c/                              ← 新建
│   │   ├── c-executor.ts              ← C 执行器
│   │   └── c.worker.ts                ← TCC WASM Worker
├── templates/
│   ├── c-sorting.ts                    ← 新建: C 排序模板
│   └── index.ts                        ← 修改: 加 C 模板
├── visualizers/                        ← 迁移至 scenes/AbstractScenes/
│   └── DataDetector.ts                 ← 迁移至 scenes/DataDetector.ts
└── public/
    └── wasm/
        └── tcc.wasm                    ← TCC 编译器 WASM (约 500KB)
```

## 7. 阶段规划

### Phase 3a: 双场景框架
- SceneRegistry + types + SceneGrid + SceneFrame
- SortingFactory 工程场景
- 迁移 ArrayBarVisualizer 至新架构

### Phase 3b: 更多工程场景
- PathMap (路径/图)
- AssemblyLine (DP/矩阵)
- FileSystem (树)

### Phase 3c: C 执行器
- TCC WASM 获取/打包
- C 执行器 Worker
- C 排序模板
- 编辑器 C 语法高亮 (clike)

## 8. 非功能需求
- 所有场景组件懒加载 (React.lazy + Suspense)
- EngineeringScene 性能: 每个场景 <= 200 个几何体
- TCC WASM 首次加载约 500KB, 缓存后可重复使用
- C 执行超时默认 10s (编译时间可能较长)
