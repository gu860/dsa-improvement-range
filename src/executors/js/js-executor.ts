import type { LanguageExecutor, ExecutionResult } from '../types';
import type { WorkerRequest, WorkerResponse } from '../../core/types';

let worker: Worker | null = null;
let requestIdCounter = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' });
  }
  return worker;
}

export const jsExecutor: LanguageExecutor = {
  config: {
    id: 'js',
    name: 'JavaScript',
    fileExtension: '.js',
    monacoMode: 'javascript',
    traceExample: `trace('compare', {\n  data: { array: [...arr] },\n  highlights: [i, j],\n  pointers: { i, j },\n  description: '比较 a[i] 和 a[j]'\n});`,
  },

  async execute(code: string, data: unknown, timeoutMs = 5000): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const w = getWorker();
      const requestId = `req_${++requestIdCounter}`;

      const handler = (e: MessageEvent<WorkerResponse>) => {
        if (e.data.id !== requestId) return;
        w.removeEventListener('message', handler);
        clearTimeout(timer);
        resolve(e.data.success
          ? { success: true, traces: e.data.traces }
          : { success: false, traces: [], error: e.data.error });
      };

      w.addEventListener('message', handler);

      const timer = setTimeout(() => {
        w.removeEventListener('message', handler);
        reject(new Error(`Execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const request: WorkerRequest = { id: requestId, code, data };
      w.postMessage(request);
    });
  },

  terminate() {
    worker?.terminate();
    worker = null;
  },
};
