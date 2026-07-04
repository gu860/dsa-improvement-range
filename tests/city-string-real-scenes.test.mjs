import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const citySource = readFileSync('src/scenes/EngineeringScenes/CityScene.tsx', 'utf8');
const frameSource = readFileSync('src/components/SceneFrame.tsx', 'utf8');

test('string algorithms are routed into the city sign workshop district', () => {
  assert.match(citySource, /const STRING_IDS = new Set\(\['string-search', 'longest-palindrome', 'anagram', 'longest-substring'\]\)/);
  assert.match(citySource, /function SignShopWorkshop/);
  assert.match(citySource, /<SignShopWorkshop naiveSnapshot=\{naiveSnapshot\} optimizedSnapshot=\{optimizedSnapshot\} activeAlgorithmId=\{activeAlgorithmId\} \/>/);
  assert.match(citySource, /STRING_IDS\.has\(activeAlgorithmId\)/);
});

test('string sign workshop has real-world text production facilities', () => {
  assert.match(citySource, /SIGN SHOP/);
  assert.match(citySource, /SIGN MAKING WORKSHOP/);
  assert.match(citySource, /广告招牌制作工坊/);
  assert.match(citySource, /TOOL WALL/);
  assert.match(citySource, /Vinyl rolls rack/);
  assert.match(citySource, /MAIN WORKBENCH/);
});

test('string scene maps trace state to physical motion and labels', () => {
  assert.match(citySource, /getStringDisplayState/);
  assert.match(citySource, /template\?\.text/);
  assert.match(citySource, /template\?\.pattern/);
  assert.match(citySource, /scannerX/);
  assert.match(citySource, /patternOffset/);
  assert.match(citySource, /windowWidth/);
  assert.match(citySource, /countBins/);
  assert.match(citySource, /charX\(i, chars\.length\)/);
});

test('string sign workshop reserves a dedicated city lot', () => {
  assert.match(citySource, /<group position=\{\[58, 0, -30\]\}/);
  assert.match(citySource, /x: 58, z: -30, w: 20, d: 16/);
  assert.match(citySource, /cameraPos: \[58, 5\.5, -20\]/);
});

test('string algorithms have entrance cameras and fullscreen help content', () => {
  assert.match(citySource, /'string-search': \{\s*label: '广告招牌制作工坊'/);
  assert.match(citySource, /'longest-palindrome': \{\s*label: '广告招牌制作工坊'/);
  assert.match(citySource, /'anagram': \{\s*label: '广告招牌制作工坊'/);
  assert.match(citySource, /'longest-substring': \{\s*label: '广告招牌制作工坊'/);
  assert.match(frameSource, /'string-search': \{/);
  assert.match(frameSource, /'longest-palindrome': \{/);
  assert.match(frameSource, /'anagram': \{/);
  assert.match(frameSource, /'longest-substring': \{/);
});
