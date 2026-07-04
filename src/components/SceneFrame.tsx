import { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { lazy } from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import type { TraceSnapshot } from '../core/types';
import type { SceneKind } from '../scenes/types';
import { resolveScene } from '../scenes/SceneRegistry';
import { usePlaybackStore } from '../core/playback-store';

const CityScene = lazy(() => import('../scenes/EngineeringScenes/CityScene'));

interface SceneFrameProps {
  naiveSnapshot: TraceSnapshot | null;
  optimizedSnapshot: TraceSnapshot | null;
  kind: SceneKind;
  label: string;
  labelColor?: string;
  algorithmId: string;
  sceneRunId: number;
}

type EntrancePreset = {
  position: [number, number, number];
  target: [number, number, number];
};

const CITY_ALGORITHMS = new Set(['dijkstra', 'prim', 'union-find', 'bfs-vs-dfs', 'bubble-vs-quick', 'selection-sort', 'insertion-sort', 'merge-sort', 'non-compare-sort', 'linear-binary', 'two-sum', 'rotated-array', 'peak', 'knapsack-vs-opt', 'lcs', 'coin-change', 'edit-distance', 'unique-paths', 'house-robber', 'tree-bfs-vs-dfs', 'tree-height', 'validate-bst', 'lca', 'traversals', 'string-search', 'longest-palindrome', 'anagram', 'longest-substring']);
const SORT_ALGORITHMS = new Set(['bubble-vs-quick', 'selection-sort', 'insertion-sort', 'merge-sort', 'non-compare-sort']);
const GRAPH_ALGORITHMS = new Set(['bfs-vs-dfs']);
const DP_ALGORITHMS = new Set(['knapsack-vs-opt', 'lcs', 'coin-change', 'edit-distance', 'unique-paths', 'house-robber']);
const TREE_ALGORITHMS = new Set(['tree-bfs-vs-dfs', 'tree-height', 'validate-bst', 'lca', 'traversals']);
const STRING_ALGORITHMS = new Set(['string-search', 'longest-palindrome', 'anagram', 'longest-substring']);

function normalizeAlgorithmId(id: string) {
  return id.replace(/^py-/, '');
}

function getEntrancePreset(algorithmId: string, kind: SceneKind): EntrancePreset | null {
  if (kind !== 'engineering') return null;
  const normalizedId = normalizeAlgorithmId(algorithmId);

  if (normalizedId === 'dijkstra') {
    return { position: [30, 7, 12], target: [30, 0.5, 18] };
  }
  if (normalizedId === 'prim') {
    return { position: [0, 8, 34], target: [0, 0.5, 26] };
  }
  if (normalizedId === 'union-find') {
    return { position: [52, 7, 8], target: [52, 0.5, -6] };
  }

  if (SORT_ALGORITHMS.has(normalizedId)) return { position: [-32, 12, -8], target: [-32, 0.5, -18] };
  if (GRAPH_ALGORITHMS.has(normalizedId)) return { position: [35, 15.5, 58], target: [35, 0.9, 42] };
  if (DP_ALGORITHMS.has(normalizedId)) return { position: [0, 4.8, 9.5], target: [0, 1.0, 0] };
  if (TREE_ALGORITHMS.has(normalizedId)) return { position: [0, 5.4, 10.5], target: [0, 1.6, 0] };
  if (STRING_ALGORITHMS.has(normalizedId)) return { position: [58, 5.5, -20], target: [58, 0.8, -30] };

  return { position: [0, 4.5, 9.0], target: [0, 1.0, 0] };
}

function EntranceCamera({ algorithmId, kind, sceneRunId }: { algorithmId: string; kind: SceneKind; sceneRunId: number }) {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls);

  useEffect(() => {
    if (sceneRunId <= 0) return;
    if (CITY_ALGORITHMS.has(normalizeAlgorithmId(algorithmId))) return;
    const preset = getEntrancePreset(algorithmId, kind);
    if (!preset) return;

    const frame = requestAnimationFrame(() => {
      camera.position.set(...preset.position);
      camera.lookAt(...preset.target);
      if (controls) {
        (controls as any).target.set(...preset.target);
        (controls as any).update();
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [algorithmId, camera, controls, kind, sceneRunId]);

  return null;
}

function SceneContent({
  naiveSnapshot, optimizedSnapshot, kind, algorithmId
}: {
  naiveSnapshot: TraceSnapshot | null;
  optimizedSnapshot: TraceSnapshot | null;
  kind: SceneKind;
  algorithmId: string;
}) {
  const snap = naiveSnapshot ?? optimizedSnapshot;
  const SceneComponent = useMemo(() => {
    if (!snap) return null;
    const def = resolveScene(snap, kind);
    return def?.component ?? null;
  }, [snap, kind]);

  if (kind === 'engineering' && CITY_ALGORITHMS.has(normalizeAlgorithmId(algorithmId))) {
    return <CityScene naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} />;
  }

  if (kind === 'engineering' && !SceneComponent) {
    return <CityScene naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} />;
  }

  if (!SceneComponent) {
    return (
      <Text position={[0, 0, 0]} fontSize={0.5} color="#666">
        等待数据...
      </Text>
    );
  }
  return <SceneComponent naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} />;
}

function CameraToolbar() {
  const presets: { label: string; pos: [number, number, number]; target: [number, number, number] }[] = [
    { label: '总览', pos: [0, 55, 60], target: [0, 0, -4] },
    { label: '城市中心', pos: [0, 12, 18], target: [0, 1, 0] },
    { label: '排序区', pos: [-32, 12, -8], target: [-32, 0.5, -18] },
    { label: 'DP区', pos: [0, 6.8, 39], target: [0, 0.65, 26] },
    { label: 'Graph区', pos: [35, 15.5, 58], target: [35, 0.9, 42] },
    { label: '树区', pos: [-48, 9.35, 49], target: [-48, 2.45, 62] },
    { label: '字符串区', pos: [58, 5.5, -20], target: [58, 0.8, -30] },
    { label: '森林', pos: [60, 14, 60], target: [60, 0, 60] },
    { label: '山脉', pos: [-48, 18, -78], target: [-48, 4, -92] },
    { label: '湖泊', pos: [-9, 8, 77], target: [-9, 2, 77] },
  ];
  return (
    <div
      style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center',
        background: 'rgba(15,23,42,0.85)', padding: '4px 8px', borderRadius: 8,
        border: '1px solid rgba(100,116,139,0.4)', backdropFilter: 'blur(4px)',
      }}
    >
      {presets.map(p => (
        <button
          key={p.label}
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('camera-preset', { detail: { pos: p.pos, target: p.target } }))}
          className="text-[10px] px-2 py-1 rounded bg-surface-2 text-gray-200 hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export default function SceneFrame({ naiveSnapshot, optimizedSnapshot, kind, label, labelColor, algorithmId, sceneRunId }: SceneFrameProps) {
  const showHelp = usePlaybackStore(s => s.showHelp);
  const setShowHelp = usePlaybackStore(s => s.setShowHelp);
  const helpAlgoId = usePlaybackStore(s => s.helpAlgoId || algorithmId);
  return (
    <div className="relative h-full min-h-0">
      <div
        className={`absolute top-2 left-3 z-10 text-xs ${labelColor ?? 'text-gray-400'} bg-surface/80 px-2 py-1 rounded pointer-events-none`}
      >
        {label}
      </div>
      {kind === 'engineering' && (
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="absolute top-2 right-3 z-20 rounded bg-surface/90 border border-surface-2 px-2 py-1 text-xs text-gray-100 hover:border-primary hover:text-white"
        >
          说明
        </button>
      )}
      <Suspense fallback={<div className="text-gray-400 p-4">加载 3D 场景...</div>}>
        <Canvas
          dpr={[0.6, 0.85]}
          camera={{ position: [0, 5, 10], fov: 50, near: 0.1, far: 180 }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#2a2a28']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />
          <SceneContent naiveSnapshot={naiveSnapshot} optimizedSnapshot={optimizedSnapshot} kind={kind} algorithmId={algorithmId} />
          <EntranceCamera algorithmId={algorithmId} kind={kind} sceneRunId={sceneRunId} />
          <OrbitControls makeDefault enablePan={true} enableZoom={true} />
        </Canvas>
      </Suspense>
      {showHelp && kind === 'engineering' && (() => {
        const helpContent: Record<string, { title: string; body: string[]; color: string }> = {
          'dijkstra': {
            title: 'Dijkstra 最短路径 · 公园导览',
            body: ['亮色路径 = 正在松弛中的边', '绿色节点 = 已确定最短路径', '主入口为源点，逐步扩展最短路树'],
            color: '#22d3ee',
          },
          'prim': {
            title: 'Prim 最小生成树 · 变电站',
            body: [
              '现实任务：用最低铺设成本把城市配电设施接入微电网',
              '设施牌显示 node id、设施角色和接入状态',
              '线缆牌显示 from->to 与 cost，亮色表示当前候选铺设边',
              '施工车沿候选线路移动，电流波表示新接入设施恢复供电',
              '绿色/恢复=已进入 MST，灰色=仍是候选设施',
            ],
            color: '#fbbf24',
          },
          'union-find': {
            title: '并查集 · 市政管网合并',
            body: [
              '现实任务：把分散社区接入统一市政联网系统',
              '房屋 = 元素 node，屋顶颜色 = 所属集合根 root',
              '门牌 parent i->p 表示并查集父指针',
              '维修员 find 沿 parent 链回溯到集合根',
              '黄色路径压缩光束表示查询后将路径直接指向 root',
              '闸门打开和蓝色管线表示 union 后两个社区可通行',
            ],
            color: '#38bdf8',
          },
          'bfs-vs-dfs': {
            title: 'BFS / DFS · 城市警察追捕',
            body: ['路口 = 图节点，路牌显示 node id', '街道 = 图的边，警车只能沿街道网络搜索', 'BFS 出警队列会让多辆警车按层级向外封控', 'DFS 追踪栈让一辆警车沿一条线深入追捕', '小偷标记表示目标路口，已访问路口会拉起封控警戒'],
            color: '#38bdf8',
          },
          'bubble-vs-quick': {
            title: '排序算法 · 邮件分拣中心',
            body: ['包裹高度和标签 = 数值大小', '橙色包裹 = 当前比较/交换的元素', '四个分拣箱对应不同目的地'],
            color: '#f97316',
          },
          'selection-sort': {
            title: '选择排序 · 邮件分拣中心',
            body: ['包裹高度和标签 = 数值大小', '橙色包裹 = 当前选择的元素', '逐步选择最小元素放入正确位置'],
            color: '#f97316',
          },
          'insertion-sort': {
            title: '插入排序 · 邮件分拣中心',
            body: ['包裹高度和标签 = 数值大小', '橙色包裹 = 当前插入的元素', '逐个插入到已排序序列的正确位置'],
            color: '#f97316',
          },
          'merge-sort': {
            title: '归并排序 · 邮件分拣中心',
            body: ['包裹高度和标签 = 数值大小', '橙色包裹 = 当前归并的元素', '分治合并，逐步构建有序序列'],
            color: '#f97316',
          },
          'non-compare-sort': {
            title: '非比较排序 · 邮件分拣中心',
            body: ['包裹高度和标签 = 数值大小', '橙色包裹 = 当前处理的元素', '不基于比较，利用数据特性排序'],
            color: '#f97316',
          },
          'linear-binary': {
            title: '线性搜索 → 二分搜索 · 自动档案密集库',
            body: ['密集架抽屉 = 有序数组元素，抽屉标签显示 index/value', '蓝色边界 = 当前搜索范围 [left, right]', '区间外柜体关闭并标红 = 已排除的数据', '弹出的黄色抽屉 = 当前 mid/i 正在比较', '检索终端显示 target、指针和当前步骤'],
            color: '#f59e0b',
          },
          'two-sum': {
            title: '两数之和 · 暴力 vs 哈希 · 自动档案密集库',
            body: ['密集架抽屉 = 数组元素', '弹出/高亮抽屉 = 当前检查的元素或元素对', '检索终端显示 target 与查找描述', '哈希优化可理解为终端缓存已扫描档案', '命中时目标抽屉组合会被同时强调'],
            color: '#f59e0b',
          },
          'rotated-array': {
            title: '旋转数组搜索 · 自动档案密集库',
            body: ['密集架抽屉 = 旋转后的有序数组', '蓝色边界 = 当前搜索范围', '弹出的黄色抽屉 = mid 指针', '关闭柜体 = 被旋转二分排除的半区', '终端文字说明当前判断的是哪一侧有序'],
            color: '#f59e0b',
          },
          'peak': {
            title: '峰值元素 · 自动档案密集库',
            body: ['密集架抽屉高度/数值 = 山脉数组元素', '弹出抽屉 = 当前候选峰值', '蓝色边界 = 峰值可能存在的区间', '关闭柜体 = 被爬坡方向排除的区域', '最终高亮抽屉表示找到峰值'],
            color: '#f59e0b',
          },
          'knapsack-vs-opt': {
            title: '0-1 背包 · 物流装载月台',
            body: ['货车容量条 = 背包容量上限', '货箱标签 w/v = 重量和价值', '高亮货箱 = 当前考虑是否装车的物品', '状态缓存屏 = 不同容量下的最大收益', '当前 dp 状态对应真实装载决策'],
            color: '#f59e0b',
          },
          'lcs': {
            title: '最长公共子序列 · 档案相似度比对室',
            body: ['两份纸质档案 = 两个输入字符串', '扫描仪光带 = 当前处理的文本前缀', '状态缓存屏 = 前缀匹配矩阵', '高亮行/格 = 当前比对进度', '矩阵数值表示已确认的公共子序列长度'],
            color: '#f59e0b',
          },
          'coin-change': {
            title: '零钱兑换 · 地铁自助售票区',
            body: ['售票机屏幕金额 = 当前要凑出的金额', '硬币堆 = 可选币值', '状态缓存屏 = 每个金额的最少硬币数', '高亮金额 = 当前更新的 dp 位置', '算法过程对应售票机找零策略'],
            color: '#f59e0b',
          },
          'edit-distance': {
            title: '编辑距离 · 文本校正审阅室',
            body: ['两份文档 = 原文和目标文本', '扫描仪 = 当前前缀比较过程', '状态缓存屏 = 编辑代价矩阵', '高亮状态 = 当前插入/删除/替换后的最小代价', '数值表示文本校正成本'],
            color: '#f59e0b',
          },
          'unique-paths': {
            title: '不同路径 · 步行街区路径规划',
            body: ['街道路口 = 网格中的状态节点', '起点/终点建筑 = 路径规划目标', '高亮路口行 = 当前正在汇总的路径状态', '状态缓存屏 = 每个路口的路线数量', '数值来自上方和左方路口的累计'],
            color: '#f59e0b',
          },
          'house-robber': {
            title: '打家劫舍 · 街区安防巡逻规划',
            body: ['一排住宅 = 输入序列', '巡逻车位置 = 当前决策房屋', '状态缓存屏 = 截止每户的最优收益', '相邻住宅不能同时选择 = 安防冲突约束', '高亮房屋展示偷/不偷当前户的取舍'],
            color: '#f59e0b',
          },
          'string-search': {
            title: '字符串匹配 · 广告牌校稿线',
            body: ['城市灯箱字符 = 主文本 text', '移动模板牌 = pattern', '橙色扫描车 = 当前比较位置', 'KMP 失配时模板按前缀表跳转而不是回退全文', '高亮灯箱展示当前 trace 正在检查的字符'],
            color: '#38bdf8',
          },
          'longest-palindrome': {
            title: '最长回文 · 霓虹招牌对称检测',
            body: ['霓虹字牌 = 输入字符串', '左右检测臂 = 当前回文边界', '亮起区间 = 当前或最终最长对称片段', '中心扩展算法从每个中心向两侧验证', '暴力版本会枚举更多候选区间'],
            color: '#f472b6',
          },
          'anagram': {
            title: '异位词 · 活字分拣与字频库',
            body: ['两排活字块 = 两个输入单词', '字频库格架 = 哈希计数表', '格架高度/数字 = 字符出现次数', '排序法把活字重新排成同序再比较', '哈希法逐个扣减计数字格判断是否清空'],
            color: '#34d399',
          },
          'longest-substring': {
            title: '无重复子串 · 地铁字幕窗口控制室',
            body: ['电子字幕字符 = 输入字符串', '透明检票框 = 当前滑动窗口 [left,right]', '黄色探头 = right 指针', '遇到重复字符时左边界跳到重复字符之后', '窗口宽度展示当前无重复片段长度'],
            color: '#60a5fa',
          },
          'tree-bfs-vs-dfs': {
            title: 'BFS / DFS · 山地林业监测站',
            body: ['真实树木 = 树节点，编号牌显示节点值', '木栈道 = 父子连接边', '护林员位置 = 当前访问节点', 'BFS 按林冠层级展开，DFS 沿一条山路深入', '无人机和观测塔提供层级扫描参照'],
            color: '#22c55e',
          },
          'tree-height': {
            title: '树高度 · 林冠层级测量',
            body: ['无人机按层扫描林冠', '每一层树木对应高度计数的一层', '最深被扫描层就是树高', '编号树牌保留节点值，栈道保留父子关系', '说明牌同步当前 trace 描述'],
            color: '#22c55e',
          },
          'validate-bst': {
            title: '验证 BST · 山坡编号巡检',
            body: ['左坡树木编号必须小于父节点', '右坡树木编号必须大于父节点', '蓝色/黄色地面线区分左右约束', '护林员移动到当前校验树', '异常树会以警戒色强调'],
            color: '#22c55e',
          },
          lca: {
            title: '最近公共祖先 · 山路共同岔路',
            body: ['两处报警树为目标点', '路径向上回溯到共同岔路', '共同岔路就是最近公共祖先', '木栈道展示父子路径结构', '护林员和灯光显示当前算法位置'],
            color: '#22c55e',
          },
          traversals: {
            title: '树遍历 · 护林巡检路线',
            body: ['前序/中序/后序对应不同巡检顺序', '护林员沿栈道移动到当前树木', '高亮树牌表示最近访问节点', '已访问路线会在说明中同步 trace', '真实林区保留算法树结构'],
            color: '#22c55e',
          },
        };
        const algo = helpAlgoId.replace(/^py-/, '');
        const info = helpContent[algo] || {
          title: '算法可视化',
          body: ['暂无详细说明', '请选择具体算法查看'],
          color: '#22d3ee',
        };
        return (
          <div
            onClick={() => setShowHelp(false)}
            style={{
              position: 'absolute', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.82)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#0f172a', border: `2px solid ${info.color}`,
                borderRadius: 16, padding: '48px 56px',
                maxWidth: 720, textAlign: 'center',
                boxShadow: `0 0 40px ${info.color}44`,
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, color: '#e0f2fe', marginBottom: 20 }}>
                {info.title}
              </div>
              <div style={{ fontSize: 22, color: '#cbd5e1', lineHeight: 1.7 }}>
                {info.body.map((line, i) => <span key={i}>{line}<br /></span>)}
              </div>
              <div
                onClick={() => setShowHelp(false)}
                style={{
                  marginTop: 32, padding: '10px 32px',
                  background: info.color, color: '#0f172a',
                  borderRadius: 8, fontSize: 18, fontWeight: 600,
                  cursor: 'pointer', display: 'inline-block',
                }}
              >
                关闭
              </div>
            </div>
          </div>
        );
      })()}
      {kind === 'engineering' && <CameraToolbar />}
    </div>
  );
}









