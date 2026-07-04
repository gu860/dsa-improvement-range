import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const citySource = readFileSync('src/scenes/EngineeringScenes/CityScene.tsx', 'utf8');
const frameSource = readFileSync('src/components/SceneFrame.tsx', 'utf8');
const headerSource = readFileSync('src/components/Header.tsx', 'utf8');
const templateSource = readdirSync('src/templates')
  .filter(name => name.endsWith('.ts'))
  .map(name => readFileSync(`src/templates/${name}`, 'utf8'))
  .join('\n');

test('python algorithm ids are routed into the same city scenes as javascript ids', () => {
  assert.match(frameSource, /function normalizeAlgorithmId\(id: string\)/);
  assert.match(frameSource, /normalizeAlgorithmId\(algorithmId\)/);
  assert.match(citySource, /function normalizeAlgorithmId\(id: string\)/);
  assert.match(citySource, /const SORT_IDS = new Set\(\['bubble-vs-quick', 'py-bubble-vs-quick'/);
  assert.match(citySource, /const GRAPH_SEARCH_IDS = new Set\(\['bfs-vs-dfs', 'py-bfs-vs-dfs'\]\)/);
  assert.match(citySource, /const DP_IDS = new Set\(\['knapsack-vs-opt', 'py-knapsack-vs-opt'/);
  assert.match(citySource, /const TREE_IDS = new Set\(\['tree-bfs-vs-dfs', 'py-tree-bfs-vs-dfs'/);
});

test('python city algorithms have matching district entrance cameras', () => {
  assert.match(citySource, /'py-bubble-vs-quick': \{\s*label: '[^']+',\s*cameraPos: \[-32, 12, -8\],\s*cameraTarget: \[-32, 0\.5, -18\]/);
  assert.match(citySource, /'py-bfs-vs-dfs': \{\s*label: '[^']+',\s*cameraPos: \[35, 15\.5, 58\],\s*cameraTarget: \[35, 0\.9, 42\]/);
  assert.match(citySource, /'py-knapsack-vs-opt': \{\s*label: '[^']+',\s*cameraPos: \[0, 6\.8, 39\],\s*cameraTarget: \[0, 0\.65, 26\]/);
  assert.match(citySource, /'py-tree-bfs-vs-dfs': \{\s*label: '[^']+',\s*cameraPos: \[-48, 9\.35, 49\],\s*cameraTarget: \[-48, 2\.45, 62\]/);
});

test('python scene labels reuse javascript real-world facility labels', () => {
  assert.match(citySource, /'py-bubble-vs-quick': \{ title: '交换传送带'/);
  assert.ok(citySource.includes("'py-knapsack-vs-opt': '物流装载月台'"));
  assert.ok(citySource.includes("'py-tree-bfs-vs-dfs': 'BFS 一层层扩大搜索；DFS 沿一条山路深入巡检'"));
});

test('python fullscreen help resolves to corresponding javascript help content', () => {
  assert.ok(frameSource.includes("const algo = helpAlgoId.replace(/^py-/, '');"));
  assert.match(frameSource, /helpContent\[algo\]/);
});

test('changing language also updates the active algorithm id for scene routing', () => {
  assert.match(headerSource, /setAlgorithmId\(first\.id\)/);
});

test('python has a template for every javascript city algorithm', () => {
  const records = [...templateSource.matchAll(/\{\s*id: '([^']+)'[\s\S]{0,260}?language: '(js|python)'/g)]
    .map(match => ({ id: match[1], language: match[2] }));
  const jsIds = records
    .filter(record => record.language === 'js')
    .map(record => record.id)
    .sort();
  const pyIds = records
    .filter(record => record.language === 'python')
    .map(record => record.id.replace(/^py-/, ''))
    .sort();
  assert.deepEqual(pyIds, jsIds);
});
