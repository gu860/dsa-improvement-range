import SceneFrame from './SceneFrame';
import { usePlaybackStore } from '../core/playback-store';
import { initScenes } from '../scenes';
import { setAlgorithmId } from '../scenes/algorithm-context';

let inited = false;
if (!inited) {
  initScenes();
  inited = true;
}

interface SceneGridProps {
  side: 'left' | 'right';
}

export default function SceneGrid({ side }: SceneGridProps) {
  const { naiveTraces, optimizedTraces, currentStep, algorithmId, sceneRunId } = usePlaybackStore();

  setAlgorithmId(algorithmId);

  const naiveSnapshot = currentStep < naiveTraces.length ? naiveTraces[currentStep] : null;
  const optimizedSnapshot = currentStep < optimizedTraces.length ? optimizedTraces[currentStep] : null;

  return (
    <div className="h-full">
      <SceneFrame
        naiveSnapshot={naiveSnapshot}
        optimizedSnapshot={optimizedSnapshot}
        kind={side === 'left' ? 'abstract' : 'engineering'}
        label={side === 'left' ? '算法对比' : '工程场景'}
        labelColor={side === 'left' ? 'text-gray-400' : 'text-emerald-400'}
        algorithmId={algorithmId}
        sceneRunId={sceneRunId}
      />
    </div>
  );
}


