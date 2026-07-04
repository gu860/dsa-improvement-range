# String Media District Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a realistic city media and printing district for `string-search`, `longest-palindrome`, `anagram`, and `longest-substring`.

**Architecture:** Extend `CityScene.tsx` with a `STRING_IDS` group, entrance camera presets, a `StringMediaDistrict` component, and focused subcomponents for each string algorithm. Reuse the existing fullscreen help overlay in `SceneFrame.tsx` and add source-level regression tests for routing and required visual hooks.

**Tech Stack:** React, TypeScript, React Three Fiber, Drei `Text`/`Billboard`, Node test runner, Vite.

---

### Task 1: Add Regression Tests

**Files:**
- Create: `tests/city-string-real-scenes.test.mjs`

- [ ] **Step 1: Write source-level tests**

```js
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const citySource = readFileSync('src/scenes/EngineeringScenes/CityScene.tsx', 'utf8');
const frameSource = readFileSync('src/components/SceneFrame.tsx', 'utf8');

test('string algorithms are routed into the city media district', () => {
  assert.match(citySource, /const STRING_IDS = new Set\(\['string-search', 'longest-palindrome', 'anagram', 'longest-substring'\]\)/);
  assert.match(citySource, /function StringMediaDistrict/);
  assert.match(citySource, /<StringMediaDistrict naiveSnapshot=\{naiveSnapshot\} optimizedSnapshot=\{optimizedSnapshot\} activeAlgorithmId=\{activeAlgorithmId\} \/>/);
  assert.match(citySource, /STRING_IDS\.has\(activeAlgorithmId\)/);
});

test('string media district has real-world text processing facilities', () => {
  assert.match(citySource, /BillboardProofingLine/);
  assert.match(citySource, /NeonSymmetryWorkshop/);
  assert.match(citySource, /MovableTypeSortingRoom/);
  assert.match(citySource, /TransitSubtitleWindow/);
  assert.match(citySource, /传媒印刷中心/);
});

test('string scene maps trace state to physical motion and labels', () => {
  assert.match(citySource, /getStringDisplayState/);
  assert.match(citySource, /scannerX/);
  assert.match(citySource, /patternOffset/);
  assert.match(citySource, /windowWidth/);
  assert.match(citySource, /countBins/);
  assert.match(citySource, /index \{i\}/);
});

test('string algorithms have entrance cameras and fullscreen help content', () => {
  assert.match(citySource, /'string-search': \{\s*label: '传媒印刷中心'/);
  assert.match(citySource, /'longest-palindrome': \{\s*label: '传媒印刷中心'/);
  assert.match(citySource, /'anagram': \{\s*label: '传媒印刷中心'/);
  assert.match(citySource, /'longest-substring': \{\s*label: '传媒印刷中心'/);
  assert.match(frameSource, /'string-search': \{/);
  assert.match(frameSource, /'longest-palindrome': \{/);
  assert.match(frameSource, /'anagram': \{/);
  assert.match(frameSource, /'longest-substring': \{/);
});
```

- [ ] **Step 2: Verify tests fail before implementation**

Run: `node --test tests\city-string-real-scenes.test.mjs`

Expected: FAIL because `STRING_IDS` and `StringMediaDistrict` do not exist yet.

### Task 2: Implement City String District

**Files:**
- Modify: `src/scenes/EngineeringScenes/CityScene.tsx`

- [ ] **Step 1: Add routing constants and camera presets**

Add `STRING_IDS` near existing algorithm ID sets, add four district presets for the string algorithms, and include `STRING_IDS.has(activeAlgorithmId)` in city projection fallback suppression.

- [ ] **Step 2: Add text state helpers**

Add `getStringDisplayState(snapshot, activeAlgorithmId)` to normalize `text`, `pattern`, `text1`, `text2`, `highlights`, scanner position, window boundaries, pattern offset, and count bins.

- [ ] **Step 3: Add subscene components**

Add `BillboardProofingLine`, `NeonSymmetryWorkshop`, `MovableTypeSortingRoom`, and `TransitSubtitleWindow`. Each component must draw real facilities, label characters with index and value, and use trace state to move a scanner/window/arm/bin indicator.

- [ ] **Step 4: Add `StringMediaDistrict`**

Place the district in an open city lot, add entrance signage, route the active algorithm to the matching subscene, and add a `说明` button wired to `setShowHelp(true, activeAlgorithmId)`.

### Task 3: Add Help Overlay Copy

**Files:**
- Modify: `src/components/SceneFrame.tsx`

- [ ] **Step 1: Add four help entries**

Add fullscreen help entries for `string-search`, `longest-palindrome`, `anagram`, and `longest-substring`, describing the real task, data mapping, and animation meaning.

### Task 4: Verify

**Files:**
- Test: `tests/city-string-real-scenes.test.mjs`
- Test: existing relevant tests

- [ ] **Step 1: Run focused tests**

Run:

```powershell
node --test tests\city-string-real-scenes.test.mjs
node --test tests\city-tree-real-scenes.test.mjs
node --test tests\city-terrain.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS with only existing eval/chunk warnings.

- [ ] **Step 3: Capture screenshot**

Use Playwright to select `string-search`, click run, wait for the scene, and save a screenshot to `%TEMP%\string-media-district.png`.
