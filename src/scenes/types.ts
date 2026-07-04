import type { TraceSnapshot } from '../core/types';

export type SceneKind = 'abstract' | 'engineering';

export interface SceneDefinition {
  id: string;
  kind: SceneKind;
  name: string;
  detect: (snapshot: TraceSnapshot) => boolean;
  priority: number;
  component: React.ComponentType<SceneProps>;
}

export interface SceneProps {
  naiveSnapshot: TraceSnapshot | null;
  optimizedSnapshot: TraceSnapshot | null;
  context?: Record<string, unknown>;
}
