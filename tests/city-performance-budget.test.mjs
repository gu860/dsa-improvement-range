import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const frameSource = readFileSync('src/components/SceneFrame.tsx', 'utf8');
const citySource = readFileSync('src/scenes/EngineeringScenes/CityScene.tsx', 'utf8');

test('engineering canvas keeps a conservative render budget', () => {
  assert.match(frameSource, /dpr=\{\[0\.6, 0\.85\]\}/);
  assert.match(frameSource, /antialias: false/);
  assert.doesNotMatch(frameSource, /<Canvas\s+[^>]*shadows/);
});

test('city algorithm scene mounts only the active real-world district', () => {
  assert.match(citySource, /if \(activeAlgorithmId === 'dijkstra'\)/);
  assert.match(citySource, /if \(SORT_IDS\.has\(activeAlgorithmId\)\)/);
  assert.match(citySource, /if \(DP_IDS\.has\(activeAlgorithmId\)\)/);
  assert.doesNotMatch(citySource, /<DijkstraDispatchScene[\s\S]*<PrimUtilityScene[\s\S]*<SortingDistrict[\s\S]*<UnionFindCommunityScene/);
});

test('legacy indoor station is only a fallback, not a constant city payload', () => {
  assert.match(citySource, /!\s*DISTRICTS\[activeAlgorithmId\][\s\S]*<DeliveryStationDistrict/);
});

test('ambient traffic uses a reduced always-on animation density', () => {
  assert.match(citySource, /CAR_DEFS\.filter\(\(_, i\) => i % 2 === 0\)/);
  assert.match(citySource, /PERSON_DEFS\.filter\(\(_, i\) => i % 2 === 0\)/);
});
