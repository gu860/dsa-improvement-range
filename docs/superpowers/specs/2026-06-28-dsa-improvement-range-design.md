# 数据结构与算法改进靶场 — 设计文档

## 1. 项目概述

一个"写代码→看动画"的算法可视化平台。用户**自己编写**朴素版和优化版算法代码，系统自动追踪执行过程，并排展示两个版本的 3D 动画对比，直观呈现优化效果。支持排序、搜索、图论、DP 等任意算法。

## 2. 核心理念

**不预设算法内容**——用户写什么，平台就追踪什么、可视化什么。平台只提供：追踪 API、通用数据可视化器、对比播放引擎。

## 3. 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Vite + React 18 + TypeScript |
| 3D 渲染 | React Three Fiber + Drei + Three.js |
| 代码编辑器 | CodeMirror 6（浏览器内编辑） |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 沙箱执行 | Web Worker + Function 沙箱 |

## 4. 页面布局

```
┌────────────────────────────────────────────────────────┐
│  [标题]  [预设模板 v]  [测试数据 v]  [▶ 运行] [⏹ 重置]  │
├───────────────────────┬────────────────────────────────┤
│  优化前 (naive.ts)     │  优化后 (optimized.ts)         │
│  ┌──────────────────┐  │  ┌──────────────────┐        │
│  │  Code Editor     │  │  │  Code Editor     │        │
│  │  (CodeMirror 6)  │  │  │  (CodeMirror 6)  │        │
│  └──────────────────┘  │  └──────────────────┘        │
├───────────────────────┴────────────────────────────────┤
│  3D 可视化对比区域                                      │
│  ┌────────────────────┬──────────────────────────────┐ │
│  │  Naive 运行过程    │  Optimized 运行过程           │ │
│  │  [R3F Canvas]     │   [R3F Canvas]               │ │
│  │  同步步骤高亮      │   同步步骤高亮                 │ │
│  └────────────────────┴──────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│  控制: ▶ ⏸ ⏭ ⏮ ↺ 速度 0.5x/1x/2x/4x  步骤 12/45     │
│  统计: Naive 耗时 2.3ms · Opt 耗时 0.8ms · 加速比 2.9x │
└────────────────────────────────────────────────────────┘
```

### 4.1 布局模式

- **编辑模式**：上下分屏，上为左右代码编辑器，下为 3D 预览区
- **全屏 3D 模式**：运行后 3D 场景最大化显示，代码以浮动面板展示

## 5. 核心流程

```
用户写入代码 ──→ 点击运行
   │
   ├─ 优化前代码 ──→ Web Worker 执行 ──→ 追踪步骤序列 A
   ├─ 优化后代码 ──→ Web Worker 执行 ──→ 追踪步骤序列 B
   │
   └─ 两序列打齐 ──→ 并排播放 ──→ 3D 场景驱动
                                     └─ 代码高亮联动
```

### 5.1 追踪 API

用户在算法代码中嵌入追踪调用：

```typescript
// trace.ts — 全局暴露的追踪函数
function trace<T>(
  label: string,
  snapshot: {
    data: Record<string, any>;   // 要可视化的数据快照
    highlights?: number[];       // 高亮索引/节点
    pointers?: Record<string, any>; // 指针/迭代器位置
    description?: string;        // 当前步骤描述
  }
): void;
```

示例用户代码：

```typescript
// 用户写的算法代码
function bubbleSort(arr: number[]) {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      trace('比较', {
        data: { array: [...a] },
        highlights: [j, j + 1],
        pointers: { i, j },
        description: `比较 a[${j}]=${a[j]} 和 a[${j+1}]=${a[j+1]}`
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        trace('交换', {
          data: { array: [...a] },
          highlights: [j, j + 1],
          pointers: { i, j },
          description: `交换 a[${j}] 和 a[${j+1}]`
        });
      }
    }
  }
  return a;
}
```

## 6. 通用数据可视化器

平台根据 `trace()` 传入的 `snapshot.data` 形状，自动选择合适的 3D 可视化方式：

| 数据类型 | 3D 表现形式 | 适用算法 |
|---|---|---|
| `{ array: number[] }` | 柱状条（高度 = 数值） | 排序、搜索 |
| `{ array: number[][] }` | 3D 网格 / 热力图 | DP 表格、矩阵运算 |
| `{ tree: TreeNode }` | 树状层次布局 | 二叉树、堆、BST |
| `{ graph: {nodes, edges} }` | 力导向图 | 图算法、路径搜索 |
| `{ linkedList: ListNode }` | 节点-箭头链 | 链表操作 |
| `{ hashTable: Bucket[] }` | 桶+链散列 | 哈希 |
| `{ grid: Cell[][] }` | 2.5D 网格地形 | 迷宫、网格 DP |

### 6.1 高亮系统

- `highlights` 数组：对应元素以**发光/放大/脉冲**效果显示
- `pointers` 对象：显示为**游标/箭头/标记**附加在数据上
- 颜色分片：蓝色=读取，红色=写入，绿色=比较，黄色=交换

## 7. 预设模板

为了方便入门，提供**预设模板**下拉菜单，加载后将对应代码填入左右编辑器：

- 排序：冒泡排序、快速排序、归并排序
- 搜索：线性搜索、二分搜索
- 图论：Dijkstra、Floyd
- DP：背包、LCS
- 工程：LRU Cache

**但用户可以任意修改这些代码**——模板只是起点。

## 8. 执行引擎

### 8.1 Web Worker 沙箱

- 每个版本的代码在独立 Web Worker 中执行
- 注入 `trace()` 函数，收集步骤序列
- 执行完成后将完整步骤序列传回主线程
- 支持超时保护（防止死循环）

### 8.2 对比播放

- 如果两个版本步骤数不同（通常如此），自动对齐到**等价关键步骤**
- 统计面板显示：步骤数、总耗时、操作计数、加速比

## 9. 组件架构

```
src/
├── App.tsx                       # 主入口，布局管理
├── core/
│   ├── tracer.ts                 # trace() 函数定义
│   ├── executor.ts               # Web Worker 执行管理
│   ├── playback-engine.ts        # 对比播放引擎
│   └── types.ts                  # 核心类型
├── components/
│   ├── EditorPanel.tsx           # 左右代码编辑器
│   ├── SceneCompare.tsx          # 双 3D 场景并排对比
│   ├── ControlBar.tsx            # 控制面板
│   ├── StatsPanel.tsx            # 统计信息
│   ├── TemplateSelector.tsx      # 预设模板选择
│   ├── DataSelector.tsx          # 测试数据选择/编辑
│   └── StepTimeline.tsx          # 步骤时间线
├── visualizers/                  # 通用可视化器
│   ├── ArrayBarVisualizer.tsx    # 柱状数组
│   ├── GridVisualizer.tsx        # 网格/矩阵
│   ├── TreeVisualizer.tsx        # 树结构
│   ├── GraphVisualizer.tsx       # 图结构
│   └── DataDetector.ts           # 自动检测数据类型
├── templates/                    # 预设模板
│   ├── sorting.ts
│   ├── searching.ts
│   └── graph.ts
└── workers/                      # Web Workers
    └── sandbox.worker.ts
```

## 10. 核心类型

```typescript
interface TraceSnapshot {
  label: string;
  data: Record<string, any>;
  highlights?: number[];
  pointers?: Record<string, any>;
  description?: string;
}

interface ExecutionTrace {
  steps: TraceSnapshot[];
  totalTime: number;       // ms
  stepCount: number;
}

interface CompareResult {
  naive: ExecutionTrace;
  optimized: ExecutionTrace;
  speedup: number;         // naiveTime / optimizedTime
}
```

## 11. 测试数据

- 预设数据集：随机数组、有序数组、重复数组、图邻接表
- 用户可编辑测试数据
- 支持按数据规模逐步对比（如 n=10, 50, 100, 1000）

## 12. 非功能需求

- 代码变化后**热重放**：修改代码无需手动重置
- 大数据量（1000+）自动降级为简化几何
- Web Worker 超时保护（默认 5s）
- 步骤序列支持反向播放
- 代码编辑器支持 TypeScript + 语法高亮

## 13. 阶段规划

### Phase 1（核心基建）
- 双编辑器 + Web Worker 沙箱执行 + trace 追踪
- 柱状数组可视化器 + 对比播放引擎
- 排序模板（冒泡、快速）
- 基础控制面板

### Phase 2（扩充可视化类型）
- 树/图/网格可视化器
- 自动数据类型检测
- 图算法模板 + 更多排序模板
- 统计面板

### Phase 3（进阶功能）
- 测试数据编辑 + 规模对比
- DP 表格可视化
- 反放/跳转
- 代码自动高亮联动
