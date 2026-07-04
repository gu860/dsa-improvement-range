import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const citySource = readFileSync(new URL('../src/scenes/EngineeringScenes/CityScene.tsx', import.meta.url), 'utf8');
const frameSource = readFileSync(new URL('../src/components/SceneFrame.tsx', import.meta.url), 'utf8');

test('tree algorithms are routed into the city scene', () => {
  for (const id of ['tree-bfs-vs-dfs', 'tree-height', 'validate-bst', 'lca', 'traversals']) {
    assert.match(frameSource, new RegExp(`'${id}'`));
    assert.match(citySource, new RegExp(`${id}`));
  }
  assert.match(citySource, /const TREE_IDS/);
});

test('tree algorithms use a realistic mountain forestry station scene', () => {
  assert.match(citySource, /function TreeForestryDistrict/);
  assert.match(citySource, /山地林业监测站/);
  assert.match(citySource, /function ForestryTreeNode/);
  assert.match(citySource, /function ObservationTower/);
  assert.match(citySource, /function ForestryStationBuilding/);
});

test('tree scene shows algorithm movement through real-world trails and patrol tools', () => {
  assert.match(citySource, /function TreeDroneScanner/);
  assert.match(citySource, /function RangerPatrol/);
  assert.match(citySource, /forestry-trail/);
  assert.match(citySource, /左坡较小/);
  assert.match(citySource, /右坡较大/);
});

test('tree drone flight is synchronized to active algorithm nodes with visible rotors', () => {
  assert.match(citySource, /function DroneRotor/);
  assert.match(citySource, /activeValues/);
  assert.match(citySource, /previousTarget/);
  assert.match(citySource, /flightProgress/);
  assert.match(citySource, /drone-rotor-blade/);
  assert.match(citySource, /TreeDroneScanner nodes=\{nodes\} activeValues=\{activeValues\}/);
});

test('tree nodes and drone targets share the forestry terrain height', () => {
  assert.match(citySource, /function forestryTerrainHeight/);
  assert.match(citySource, /y: forestryTerrainHeight\(x, z\)/);
  assert.match(citySource, /<group position=\{\[node\.x, node\.y, node\.z\]\}>/);
  assert.match(citySource, /function getTreeFocusValue/);
  assert.match(citySource, /focusValue \? nodes\.find\(n => n\.value === focusValue\)/);
  assert.match(citySource, /drone-scan-beam/);
  assert.match(citySource, /target\.y \+ 0\.01/);
  assert.doesNotMatch(citySource, /if \(tree\?\.value !== undefined\) values\.add/);
});

test('rear forestry buildings and trails are raised above terrain layers', () => {
  assert.match(citySource, /position=\{\[-8\.8, forestryTerrainHeight\(-8\.8, -5\.4\) \+ 0\.08, -5\.4\]\}/);
  assert.match(citySource, /position=\{\[7\.3, forestryTerrainHeight\(7\.3, -5\.25\) \+ 0\.08, -5\.25\]\}/);
  assert.match(citySource, /y=\{Math\.max\(node\.parent\.y, node\.y\) \+ 0\.045\}/);
});

test('forestry ground uses continuous terrain instead of flat stacked plates', () => {
  assert.match(citySource, /function ForestryTerrainSurface/);
  assert.match(citySource, /new THREE\.BufferGeometry\(\)/);
  assert.match(citySource, /computeVertexNormals\(\)/);
  assert.match(citySource, /<ForestryTerrainSurface \/>/);
  assert.doesNotMatch(citySource, /<planeGeometry args=\{\[25\.5, 20\.5\]\}/);
  assert.doesNotMatch(citySource, /<planeGeometry args=\{\[21\.5, 15\.8\]\}/);
  assert.doesNotMatch(citySource, /<planeGeometry args=\{\[16\.8, 10\.8\]\}/);
});

test('tree forestry district is lifted onto the mountain world terrain', () => {
  assert.match(citySource, /const TREE_FORESTRY_WORLD_Y = 1\.18/);
  assert.match(citySource, /<group position=\{\[-48, TREE_FORESTRY_WORLD_Y, 63\]\}/);
  assert.match(citySource, /cameraPos: \[-48, 9\.35, 49\]/);
  assert.match(citySource, /cameraTarget: \[-48, 2\.45, 62\]/);
});

test('tree help modal documents every tree algorithm scene', () => {
  assert.match(frameSource, /BFS \/ DFS · 山地林业监测站/);
  assert.match(frameSource, /树高度 · 林冠层级测量/);
  assert.match(frameSource, /验证 BST · 山坡编号巡检/);
  assert.match(frameSource, /最近公共祖先 · 山路共同岔路/);
  assert.match(frameSource, /树遍历 · 护林巡检路线/);
});
