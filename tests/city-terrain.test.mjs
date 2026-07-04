import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/scenes/EngineeringScenes/CityScene.tsx', import.meta.url), 'utf8');

test('city scene mounts a terrain basin around the algorithm districts', () => {
  assert.match(source, /function CityTerrainBasin/);
  assert.match(source, /<CityTerrainBasin \/>/);
});

test('terrain basin includes distant mountains, perimeter forest, and river wetlands', () => {
  assert.match(source, /function MountainRange/);
  assert.match(source, /function PerimeterForest/);
  assert.match(source, /function RiverWetlands/);
});

test('terrain basin adds living mountain details with lakes, waterfalls, and cabins', () => {
  assert.match(source, /function AlpineLakeSystem/);
  assert.match(source, /function MountainWaterfall/);
  assert.match(source, /function LakeFish/);
  assert.match(source, /function MountainCabinHamlet/);
  assert.match(source, /高山湖/);
  assert.match(source, /山中木屋/);
  assert.match(source, /waterfall-base-rock/);
  assert.match(source, /lake-fish/);
  assert.match(source, /<AlpineLakeSystem \/>/);
  assert.match(source, /<MountainCabinHamlet \/>/);
});

test('perimeter forest uses denser tree generation around the basin', () => {
  assert.match(source, /for \(let i = 0; i < 220; i\+\+\)/);
  assert.match(source, /for \(let i = 0; i < 58; i\+\+\)/);
});
