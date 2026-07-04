import { useState, useCallback, useEffect } from 'react';
import { getTemplatesByLanguage } from '../templates';
import { jsExecutor } from '../executors/js/js-executor';
import { pythonExecutor } from '../executors/python/python-executor';
import { register, getCurrent, setCurrent, getAllConfigs, getCurrentId } from '../executors/registry';
import { usePlaybackStore } from '../core/playback-store';

// Initialize executors once
register(jsExecutor);
register(pythonExecutor);

interface Props {
  naiveCode: string;
  optimizedCode: string;
  onCodeChange: (naive: string, optimized: string) => void;
  onLanguageChange: (language: 'javascript' | 'python') => void;
}

export default function Header({ naiveCode, optimizedCode, onCodeChange, onLanguageChange }: Props) {
  const [currentLang, setCurrentLang] = useState(getCurrentId());
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState('[]');

  const { setTraces, reset, setAlgorithmId } = usePlaybackStore();

  const templates = getTemplatesByLanguage(currentLang as 'js' | 'python');
  const executorConfigs = getAllConfigs();

  // Initialize with first template
  useEffect(() => {
    const first = templates[0];
    if (first) {
      setSelectedTemplate(first.id);
      setTestData(JSON.stringify(first.defaultData));
      onCodeChange(first.naiveCode, first.optimizedCode);
    }
  }, []);

  const handleLanguageChange = (langId: string) => {
    setCurrent(langId);
    setCurrentLang(langId);
    const langTemplates = getTemplatesByLanguage(langId as 'js' | 'python');
    const first = langTemplates[0];
    if (first) {
      setSelectedTemplate(first.id);
      setTestData(JSON.stringify(first.defaultData));
      setError(null);
      reset();
      setAlgorithmId(first.id);
      onCodeChange(first.naiveCode, first.optimizedCode);
      onLanguageChange(langId === 'python' ? 'python' : 'javascript');
    }
  };

  const handleTemplateChange = (id: string) => {
    const tmpl = templates.find((t) => t.id === id);
    if (!tmpl) return;
    setSelectedTemplate(id);
    setTestData(JSON.stringify(tmpl.defaultData));
    setError(null);
    reset();
    setAlgorithmId(id);
    onCodeChange(tmpl.naiveCode, tmpl.optimizedCode);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    reset();

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(testData);
    } catch {
      setError('测试数据 JSON 格式错误');
      setIsRunning(false);
      return;
    }

    setAlgorithmId(selectedTemplate);

    const executor = getCurrent();

    try {
      const [naiveResult, optimizedResult] = await Promise.all([
        executor.execute(naiveCode, parsedData),
        executor.execute(optimizedCode, parsedData),
      ]);

      if (!naiveResult.success) {
        setError(`优化前代码错误: ${naiveResult.error}`);
        setIsRunning(false);
        return;
      }
      if (!optimizedResult.success) {
        setError(`优化后代码错误: ${optimizedResult.error}`);
        setIsRunning(false);
        return;
      }

      const naiveTime = naiveResult.traces.length > 0
        ? naiveResult.traces[naiveResult.traces.length - 1].timestamp : 0;
      const optimizedTime = optimizedResult.traces.length > 0
        ? optimizedResult.traces[optimizedResult.traces.length - 1].timestamp : 0;

      setTraces(naiveResult.traces, optimizedResult.traces, naiveTime, optimizedTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setIsRunning(false);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface border-b border-surface-2 shrink-0">
      <h1 className="text-sm font-bold text-white mr-2 whitespace-nowrap">算法改进靶场</h1>

      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
         className="bg-surface-2 text-white text-xs px-2 py-1.5 rounded border border-surface-2 focus:outline-none focus:border-accent"
      >
        {executorConfigs.map((cfg) => (
          <option key={cfg.id} value={cfg.id}>{cfg.name}</option>
        ))}
      </select>

      <select
        value={selectedTemplate}
        onChange={(e) => handleTemplateChange(e.target.value)}
        className="bg-surface-2 text-white text-xs px-2 py-1.5 rounded border border-surface-2 focus:outline-none focus:border-accent"
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <div className="flex items-center gap-1 text-xs">
        <span className="text-gray-500">数据:</span>
        <input
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
          className="bg-surface-2 text-gray-300 px-2 py-1 rounded border border-surface-2 w-64 font-mono text-xs focus:outline-none focus:border-accent"
        />
      </div>

      <button
        onClick={handleRun}
        disabled={isRunning}
        className="ml-auto bg-accent hover:bg-accent-glow disabled:bg-surface-2 text-white text-xs px-4 py-1.5 rounded transition-colors"
      >
        {isRunning ? '运行中...' : '▶ 运行'}
      </button>

      {error && <span className="text-red-400 text-xs ml-2">{error}</span>}
    </div>
  );
}
