import { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import EditorPanel from './components/EditorPanel';
import SceneGrid from './components/SceneGrid';
import ControlBar from './components/ControlBar';
import StatsPanel from './components/StatsPanel';

function useCtrlWheel(ref: React.RefObject<HTMLDivElement | null>, onZoom: (dir: number) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        onZoom(-Math.sign(e.deltaY));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [ref, onZoom]);
}

export default function App() {
  const [naiveCode, setNaiveCode] = useState('');
  const [optimizedCode, setOptimizedCode] = useState('');
  const [editorLang, setEditorLang] = useState<'javascript' | 'python'>('javascript');
  const [fontSize, setFontSize] = useState(13);
  const [leftW, setLeftW] = useState(50);
  const [leftTopH, setLeftTopH] = useState(35);
  const [rightTopH, setRightTopH] = useState(35);
  const [dragging, setDragging] = useState<'v' | 'leftH' | 'rightH' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftEditorRef = useRef<HTMLDivElement>(null);
  const rightEditorRef = useRef<HTMLDivElement>(null);

  useCtrlWheel(leftEditorRef, (dir) => setFontSize(prev => Math.max(8, Math.min(32, prev + dir))));
  useCtrlWheel(rightEditorRef, (dir) => setFontSize(prev => Math.max(8, Math.min(32, prev + dir))));

  const handleCodeChange = useCallback((naive: string, optimized: string) => {
    setNaiveCode(naive);
    setOptimizedCode(optimized);
  }, []);

  const handleLanguageChange = useCallback((language: 'javascript' | 'python') => {
    setEditorLang(language);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (dragging === 'v') {
        setLeftW(Math.max(15, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100)));
      } else if (dragging === 'leftH') {
        setLeftTopH(Math.max(10, Math.min(80, ((e.clientY - rect.top) / rect.height) * 100)));
      } else {
        setRightTopH(Math.max(10, Math.min(80, ((e.clientY - rect.top) / rect.height) * 100)));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  return (
    <div className="h-screen w-screen flex flex-col bg-surface text-white select-none">
      <Header naiveCode={naiveCode} optimizedCode={optimizedCode} onCodeChange={handleCodeChange} onLanguageChange={handleLanguageChange} />

      <div ref={containerRef} className="flex-1 flex min-h-0">
        {/* Left column */}
        <div className="flex flex-col min-w-0 border-r border-surface-2" style={{ width: `${leftW}%` }}>
          <div ref={leftEditorRef} className="flex flex-col min-h-0" style={{ height: `${leftTopH}%` }}>
            <EditorPanel
              value={naiveCode}
              onChange={setNaiveCode}
              label="优化前 (Naive)"
              labelColor="text-gray-400"
              language={editorLang}
              fontSize={fontSize}
            />
          </div>
          <div
            className="h-1 bg-surface-2 cursor-row-resize shrink-0 relative hover:bg-accent transition-colors"
            onMouseDown={() => setDragging('leftH')}
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1" />
          </div>
          <div className="flex-1 min-h-0">
            <SceneGrid side="left" />
          </div>
        </div>

        {/* Vertical divider */}
        <div
          className="w-1 bg-surface-2 cursor-col-resize shrink-0 relative hover:bg-accent transition-colors"
          onMouseDown={() => setDragging('v')}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* Right column */}
        <div className="flex flex-col min-w-0 flex-1">
          <div ref={rightEditorRef} className="flex flex-col min-h-0" style={{ height: `${rightTopH}%` }}>
            <EditorPanel
              value={optimizedCode}
              onChange={setOptimizedCode}
              label="优化后 (Optimized)"
              labelColor="text-emerald-400"
              language={editorLang}
              fontSize={fontSize}
            />
          </div>
          <div
            className="h-1 bg-surface-2 cursor-row-resize shrink-0 relative hover:bg-accent transition-colors"
            onMouseDown={() => setDragging('rightH')}
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1" />
          </div>
          <div className="flex-1 min-h-0">
            <SceneGrid side="right" />
          </div>
        </div>
      </div>

      <ControlBar />
      <StatsPanel />
    </div>
  );
}
