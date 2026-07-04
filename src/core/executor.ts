import type { WorkerRequest, WorkerResponse, TraceSnapshot } from './types';

let worker: Worker | null = null;
let requestIdCounter = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/sandbox.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return worker;
}

export function terminateWorker(): void {
  worker?.terminate();
  worker = null;
}

export function executeCode(
  code: string,
  data: unknown,
  timeoutMs: number = 5000
): Promise<{ success: boolean; traces: TraceSnapshot[]; error?: string }> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const requestId = `req_${++requestIdCounter}`;

    const handler = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.id !== requestId) return;
      w.removeEventListener('message', handler);
      clearTimeout(timeout);
      if (e.data.success) {
        resolve({ success: true, traces: e.data.traces });
      } else {
        resolve({ success: false, traces: [], error: e.data.error });
      }
    };

    w.addEventListener('message', handler);

    const timeout = setTimeout(() => {
      w.removeEventListener('message', handler);
      reject(new Error(`Execution timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    const request: WorkerRequest = {
      id: requestId,
      code,
      data,
    };
    w.postMessage(request);
  });
}
