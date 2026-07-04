import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/templates/more-tree.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const module = { exports: {} };
vm.runInNewContext(outputText, {
  exports: module.exports,
  module,
  require: () => ({}),
});

const templates = module.exports.moreTreeTemplates;

function template(id) {
  const found = templates.find(item => item.id === id);
  assert.ok(found, `missing template ${id}`);
  return found;
}

function run(code, data) {
  const traces = [];
  const trace = (label, snapshot) => {
    traces.push({
      label,
      data: snapshot.data,
      highlights: snapshot.highlights,
      pointers: snapshot.pointers,
      description: snapshot.description,
    });
  };
  new Function('data', 'trace', code)(structuredClone(data), trace);
  return traces;
}

test('tree height BFS unwraps defaultData.tree and scans all three levels', () => {
  const item = template('tree-height');
  const traces = run(item.optimizedCode, item.defaultData);
  const levels = traces.filter(t => t.label === 'level').map(t => t.data.array);

  assert.deepEqual(levels, [[1], [2, 3], [4, 5, 6, 7]]);
  assert.equal(traces.at(-1)?.data.tree.value, 1);
});

test('LCA recursive unwraps defaultData.tree and finds the shared ancestor', () => {
  const item = template('lca');
  const traces = run(item.optimizedCode, item.defaultData);
  const lcaTrace = traces.find(t => t.label === 'lca');

  assert.equal(lcaTrace?.data.current, 2);
  assert.deepEqual(traces.at(-1)?.highlights, [2]);
  assert.equal(traces.at(-1)?.data.tree.value, 1);
});

test('iterative traversal unwraps defaultData.tree and preserves full preorder', () => {
  const item = template('traversals');
  const traces = run(item.optimizedCode, item.defaultData);

  assert.deepEqual(traces.at(-1)?.data.array, [1, 2, 4, 5, 3, 6, 7]);
});
