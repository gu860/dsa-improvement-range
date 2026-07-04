import type { TraceSnapshot } from '../../core/types';

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/';

let pyodide: any = null;

async function ensurePyodide() {
  if (pyodide) return pyodide;
  self.postMessage({ type: 'loading', message: '正在加载 Python 运行时 (~8MB)...' });
  const resp = await fetch(PYODIDE_CDN + 'pyodide.js');
  const code = await resp.text();
  eval(code);
  pyodide = await (self as any).loadPyodide({ indexURL: PYODIDE_CDN });
  self.postMessage({ type: 'loading', message: 'Python 运行时加载完成' });
  return pyodide;
}

self.onmessage = async (e: MessageEvent<{ id: string; code: string; data: unknown }>) => {
  const { id, code, data } = e.data;

  try {
    const py = await ensurePyodide();

    const dataJson = JSON.stringify(data);
    const escapedData = dataJson.replace(/'/g, "\\'");

    const pythonCode = `
import json, time

_traces = []
_t0 = None

def trace(label, snapshot):
    global _t0
    if _t0 is None:
        _t0 = time.perf_counter()
    _traces.append({
        'label': label,
        'data': snapshot.get('data', {}),
        'highlights': snapshot.get('highlights'),
        'pointers': snapshot.get('pointers', {}),
        'description': snapshot.get('description', ''),
        'timestamp': (time.perf_counter() - _t0) * 1000,
    })

data = json.loads('${escapedData}')

${code}

json.dumps({
    'traces': _traces,
    'success': True,
})
`;

    const startTime = performance.now();
    const resultJson = py.runPython(pythonCode);
    const totalTime = performance.now() - startTime;

    const result = JSON.parse(resultJson);

    const traces: TraceSnapshot[] = result.traces.map((t: any) => ({
      label: t.label,
      data: t.data,
      highlights: t.highlights ?? undefined,
      pointers: t.pointers ?? undefined,
      description: t.description ?? undefined,
      timestamp: t.timestamp ?? 0,
    }));

    const firstTs = traces[0]?.timestamp ?? 0;
    const normalized = traces.map((t: TraceSnapshot) => ({ ...t, timestamp: t.timestamp - firstTs }));

    self.postMessage({ type: 'result', id, success: true, traces: normalized });
  } catch (err: any) {
    self.postMessage({ type: 'result', id, success: false, traces: [], error: err.message ?? String(err) });
  }
};
