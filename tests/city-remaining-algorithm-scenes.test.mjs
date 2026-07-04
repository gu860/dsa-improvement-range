import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const citySource = readFileSync('src/scenes/EngineeringScenes/CityScene.tsx', 'utf8');
const frameSource = readFileSync('src/components/SceneFrame.tsx', 'utf8');

test('all remaining sorting algorithms have distinct real-world postal facilities', () => {
  for (const name of [
    'PostalSwapConveyor',
    'SelectionInspectionBay',
    'InsertionMailSlotWall',
    'MergeParcelConsolidationDock',
    'CountingPostalSiloLine',
  ]) {
    assert.match(citySource, new RegExp(`function ${name}`));
  }

  assert.match(citySource, /activeAlgorithmId === 'selection-sort'/);
  assert.match(citySource, /activeAlgorithmId === 'insertion-sort'/);
  assert.match(citySource, /activeAlgorithmId === 'merge-sort'/);
  assert.match(citySource, /activeAlgorithmId === 'non-compare-sort'/);
  assert.match(citySource, /SORTING_FACILITY_CONFIG/);
});

test('remaining sorting algorithm entrances use current ids instead of stale ids', () => {
  assert.match(frameSource, /selection-sort/);
  assert.match(frameSource, /insertion-sort/);
  assert.match(frameSource, /merge-sort/);
  assert.match(frameSource, /non-compare-sort/);
  assert.doesNotMatch(frameSource, /selection-vs-heap/);
  assert.doesNotMatch(frameSource, /insertion-vs-shell/);
  assert.doesNotMatch(frameSource, /merge-recursive-vs-iterative/);
  assert.doesNotMatch(frameSource, /counting-vs-radix/);
});

test('all remaining search algorithms have specialized real-world archive scenes', () => {
  for (const name of [
    'RangeSearchArchiveHall',
    'TwoSumEvidenceDesk',
    'RotatedCarouselArchive',
    'PeakTerrainProfileStation',
  ]) {
    assert.match(citySource, new RegExp(`function ${name}`));
  }

  assert.match(citySource, /activeAlgorithmId === 'two-sum'/);
  assert.match(citySource, /activeAlgorithmId === 'rotated-array'/);
  assert.match(citySource, /activeAlgorithmId === 'peak'/);
  assert.match(citySource, /SEARCH_FACILITY_CONFIG/);
});

test('remaining scenes keep readable data labels and fullscreen help hooks', () => {
  assert.match(citySource, /index \$\{index\}/);
  assert.match(citySource, /value \$\{value\}/);
  assert.match(citySource, /target \$\{target/);
  assert.match(citySource, /setShowHelp\(true, SORT_IDS\.has\(activeAlgorithmId\) \? activeAlgorithmId : 'bubble-vs-quick'\)/);
  assert.match(citySource, /setShowHelp\(true, SEARCH_IDS\.has\(activeAlgorithmId\) \? activeAlgorithmId : 'linear-binary'\)/);
});
