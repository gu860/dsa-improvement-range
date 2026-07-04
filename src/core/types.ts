export interface TraceSnapshot {
  label: string;
  data: Record<string, unknown>;
  highlights?: number[];
  pointers?: Record<string, number>;
  description?: string;
  timestamp: number;
}

export interface WorkerRequest {
  id: string;
  code: string;
  data: unknown;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  traces: TraceSnapshot[];
  error?: string;
}

export interface ExecutionTrace {
  traces: TraceSnapshot[];
  totalTime: number;
  stepCount: number;
}

export interface CompareResult {
  naive: ExecutionTrace;
  optimized: ExecutionTrace;
  speedup: number;
}

export type DataStructureKind = 'array' | 'matrix' | 'tree' | 'graph' | 'linked-list' | 'search' | 'text';

export interface AlgorithmTemplate {
  id: string;
  name: string;
  category: string;
  language: 'js' | 'python' | 'c';
  naiveCode: string;
  optimizedCode: string;
  defaultData: unknown;
}
