import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/scenes/EngineeringScenes/CityScene.tsx', import.meta.url), 'utf8');

test('coin change scene uses a full metro station concourse around ticket kiosks', () => {
  assert.match(source, /function MetroStationConcourse/);
  assert.match(source, /<MetroStationConcourse/);
  assert.match(source, /function MetroEntrance/);
  assert.match(source, /<MetroEntrance/);
});

test('DP scenes are placed on a dedicated open campus lot instead of the road edge', () => {
  assert.match(source, /function DPCampusVacantLot/);
  assert.match(source, /DP 运营园区空地/);
  assert.match(source, /<DPCampusVacantLot \/>/);
  assert.match(source, /<group position=\{\[0, 0, 26\]\}>/);
  assert.doesNotMatch(source, /<group position=\{\[30, 0, -25\]\}>/);
});

test('LCS and edit distance are housed in a realistic document processing building', () => {
  assert.match(source, /function DocumentProcessingBuilding/);
  assert.match(source, /城市文档处理中心/);
  assert.match(source, /档案修复室/);
  assert.match(source, /校对排版室/);
  assert.match(source, /function ArchiveRestorationLine/);
  assert.match(source, /function TextCorrectionWorkshop/);
  assert.match(source, /ArchiveRestorationLine/);
  assert.match(source, /TextCorrectionWorkshop/);
});

test('text correction scene exposes delete, insert, and replace machines', () => {
  assert.match(source, /删除剪刀/);
  assert.match(source, /插入字模/);
  assert.match(source, /替换印章/);
});
