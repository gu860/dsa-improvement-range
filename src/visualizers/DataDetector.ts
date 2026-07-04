import type { DataStructureKind } from '../core/types';

export interface DetectedData {
  kind: DataStructureKind;
  array?: number[];
  matrix?: number[][];
}

export function detectData(data: Record<string, unknown>): DetectedData | null {
  const value = data['array'];
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return { kind: 'matrix', matrix: value as number[][] };
    }
    if (value.every((v) => typeof v === 'number')) {
      return { kind: 'array', array: value as number[] };
    }
    return { kind: 'array', array: value as unknown as number[] };
  }
  return null;
}
