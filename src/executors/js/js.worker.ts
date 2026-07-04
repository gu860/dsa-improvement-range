import type { WorkerRequest, WorkerResponse, TraceSnapshot } from '../../core/types';

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, code, data } = e.data;

  try {
    const wrapped = `
      const traces = [];
      const trace = (label, snapshot) => {
        traces.push({
          label: label,
          data: snapshot.data,
          highlights: snapshot.highlights,
          pointers: snapshot.pointers,
          description: snapshot.description,
          timestamp: performance.now(),
        });
      };
      const data = ${JSON.stringify(data)};
      ${code}
      return traces;
    `;
    const fn = new Function(wrapped);
    const startTime = performance.now();
    const traces: TraceSnapshot[] = fn();
    const totalTime = performance.now() - startTime;

    const firstTimestamp = traces[0]?.timestamp ?? 0;
    const normalizedTraces = traces.map((t) => ({
      ...t,
      timestamp: t.timestamp - firstTimestamp,
    }));

    const response: WorkerResponse = {
      id,
      success: true,
      traces: normalizedTraces,
      error: undefined,
    };

    self.postMessage(response);
  } catch (err) {
    const response: WorkerResponse = {
      id,
      success: false,
      traces: [],
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};
