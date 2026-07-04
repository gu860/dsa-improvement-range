import { usePlaybackStore } from '../core/playback-store';

export default function StatsPanel() {
  const { naiveTraces, optimizedTraces, naiveTime, optimizedTime } = usePlaybackStore();

  if (naiveTraces.length === 0) return null;

  const speedup = optimizedTime > 0 ? (naiveTime / optimizedTime).toFixed(2) : 'N/A';

  return (
    <div className="flex gap-6 px-4 py-2 text-xs font-mono bg-surface border-t border-surface-2">
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
