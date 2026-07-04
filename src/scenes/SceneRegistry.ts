import type { TraceSnapshot } from '../core/types';
import type { SceneDefinition, SceneKind } from './types';

const _scenes: SceneDefinition[] = [];

export function registerScene(def: SceneDefinition): void {
  _scenes.push(def);
}

export function resolveScene(snapshot: TraceSnapshot, kind: SceneKind): SceneDefinition | null {
  const candidates = _scenes
    .filter(s => s.kind === kind && s.detect(snapshot))
    .sort((a, b) => b.priority - a.priority);
  return candidates[0] ?? null;
}
