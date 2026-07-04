import type { LanguageExecutor, ExecutionResult } from '../types';

interface WorkerMessage {
  type: 'loading' | 'result';
  id?: string;
  success?: boolean;
  traces?: any[];
  error?: string;
  message?: string;
}

let worker: Worker | null = null;
let requestIdCounter = 0;
let onLoadCallback: (() => void) | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (e.data.type === 'loading' && e.data.message?.includes('加载完成')) {
        onLoadCallback?.();
        onLoadCallback = null;
      }
    };
  }
  return worker;
}

export const pythonExecutor: LanguageExecutor = {
  config: {
    id: 'python',
    name: 'Python',
    fileExtension: '.py',
    monacoMode: 'python',
    traceExample: `trace('compare', {\n    'data': {'array': list(a)},\n    'highlights': [i, j],\n    'pointers': {'i': i, 'j': j},\n    'description': '比较 a[i] 和 a[j]'\n})`,
  },

  async execute(code: string, data: unknown, timeoutMs = 15000): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const w = getWorker();
      const requestId = `py_req_${++requestIdCounter}`;

      const handler = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.type !== 'result' || e.data.id !== requestId) return;
        w.removeEventListener('message', handler);
        clearTimeout(timer);
        resolve(e.data.success
          ? { success: true, traces: e.data.traces! }
          : { success: false, traces: [], error: e.data.error });
      };

      w.addEventListener('message', handler);

      const timer = setTimeout(() => {
        w.removeEventListener('message', handler);
        reject(new Error(`Python execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      w.postMessage({ id: requestId, code, data });
    });
  },

  loadResources: async () => {
    return new Promise((resolve) => {
      const w = getWorker();
      onLoadCallback = resolve;
      if (!worker) getWorker();
    });
  },

  terminate() {
    worker?.terminate();
    worker = null;
  },
};
