import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface Props {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  labelColor?: string;
  language?: 'javascript' | 'python';
  fontSize?: number;
}

const basicSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
  ]),
];

export default function EditorPanel({ value, onChange, label, labelColor = 'text-gray-400', language = 'javascript', fontSize = 13 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const langExtension = language === 'python' ? python() : javascript();

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange?.(update.state.doc.toString());
      }
    });

    const view = new EditorView({
      doc: value,
      extensions: [
        basicSetup,
        langExtension,
        oneDark,
        updateListener,
        EditorView.theme({
          '&': { height: '100%', fontSize: `${fontSize}px` },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, fontSize]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value, language]);

  return (
    <div className="flex flex-col h-full">
      <div className={`text-xs font-mono px-3 py-1.5 bg-surface border-b border-surface-2 ${labelColor} flex items-center justify-between`}>
        <span>{label}</span>
        {fontSize !== 13 && <span className="text-gray-600 text-[10px]">{fontSize}px</span>}
      </div>
      <div ref={editorRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
