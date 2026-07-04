import type { TraceSnapshot } from '../core/types';

export interface ExecutorConfig {
  id: 'js' | 'python' | 'c';
  name: string;
  fileExtension: string;
  monacoMode: string;
  traceExample: string;
}

export interface ExecutionResult {
  success: boolean;
  traces: TraceSnapshot[];
  error?: string;
}

export interface LanguageExecutor {
  config: ExecutorConfig;
  execute(code: string, data: unknown, timeoutMs?: number): Promise<ExecutionResult>;
  loadResources?(): Promise<void>;
  terminate(): void;
}
