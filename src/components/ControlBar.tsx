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
    <div className="flex items-center gap-3 px-4 py-2 bg-surface border-t border-surface-2">
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
