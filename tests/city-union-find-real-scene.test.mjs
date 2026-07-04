import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const citySource = readFileSync('src/scenes/EngineeringScenes/CityScene.tsx', 'utf8');
const frameSource = readFileSync('src/components/SceneFrame.tsx', 'utf8');

test('union-find scene is a real municipal network district with entrance and help', () => {
  assert.match(citySource, /function UnionFindCommunityScene/);
  assert.match(citySource, /function UnionServiceCenter/);
  assert.match(citySource, /function UnionRootLegend/);
  assert.match(citySource, /function UnionFindTraceWorker/);
  assert.match(citySource, /function UnionCompressionBeam/);
  assert.match(citySource, /setShowHelp\(true, 'union-find'\)/);
  assert.match(frameSource, /'union-find': \{/);
  assert.match(frameSource, /parent i->p/);
});

test('union-find data is labeled as parent roots and community sets', () => {
  assert.match(citySource, /function getUnionRoot/);
  assert.match(citySource, /function unionRootColor/);
  assert.match(citySource, /rootId = getUnionRoot\(parents, i\)/);
  assert.match(citySource, /root \$\{rootId\}/);
  assert.match(citySource, /parent \$\{i\}->\$\{parent\}/);
  assert.match(citySource, /function UnionRootLegend/);
});

test('union-find current operation uses real routes instead of only lights', () => {
  assert.match(citySource, /const route = getUnionParentRoute\(parents, activeNode, localCoords\)/);
  assert.match(citySource, /function getUnionParentRoute/);
  assert.match(citySource, /route\.slice\(0, -1\)\.map/);
  assert.match(citySource, /function UnionFindTraceWorker/);
  assert.match(citySource, /function UnionCompressionBeam/);
  assert.match(citySource, /CommunityGate from=\{fromFront\} to=\{toFront\} active=\{isActive\}/);
});
