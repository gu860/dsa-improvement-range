# Police Graph Pursuit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a city police pursuit scene for JS and Python BFS/DFS graph traversal.

**Architecture:** Extend `CityScene.tsx` with graph pursuit routing, graph-state normalization, and a `PolicePursuitDistrict` made of intersections, roads, police cars, thief marker, and queue/stack command board. Extend `SceneFrame.tsx` city routing and fullscreen help content. Add source-level tests before production code.

**Tech Stack:** React, TypeScript, React Three Fiber, Drei `Text`/`Billboard`, Node test runner, Vite.

---

### Task 1: Add Failing Regression Tests

**Files:**
- Create: `tests/city-police-graph-scenes.test.mjs`

- [ ] **Step 1: Write tests**

Write tests that assert `bfs-vs-dfs` and `py-bfs-vs-dfs` are routed into `CityScene`, `PolicePursuitDistrict` exists, graph nodes map to intersections, edges map to roads, police/thief objects exist, queue/stack state is visible, an open city lot is reserved, and help overlay content exists.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests\city-police-graph-scenes.test.mjs`

Expected: FAIL because the police pursuit scene does not exist.

### Task 2: Implement City Police Pursuit Scene

**Files:**
- Modify: `src/scenes/EngineeringScenes/CityScene.tsx`

- [ ] **Step 1: Add routing constants and camera presets**

Add `GRAPH_SEARCH_IDS = new Set(['bfs-vs-dfs', 'py-bfs-vs-dfs'])`, add district camera entries, render `PolicePursuitDistrict`, and exclude it from fallback graph projection.

- [ ] **Step 2: Add graph pursuit state helpers**

Add helpers to normalize trace graph data, fallback graph coordinates, current node, visited order, BFS queue length, and DFS trail.

- [ ] **Step 3: Add scene components**

Add `PursuitIntersection`, `PursuitRoad`, `PolicePatrolCar`, `ThiefMarker`, `PursuitCommandBoard`, and `PolicePursuitDistrict`. Roads must use node coordinates; police cars must sit on current/visited intersections; labels must include node id and role.

- [ ] **Step 4: Reserve an open lot**

Update city building filtering so the police pursuit district is not covered by skyscrapers.

### Task 3: Add SceneFrame Routing and Help

**Files:**
- Modify: `src/components/SceneFrame.tsx`

- [ ] **Step 1: Add city routing**

Add `bfs-vs-dfs` and `py-bfs-vs-dfs` to `CITY_ALGORITHMS`, entrance fallback sets, and camera fallback.

- [ ] **Step 2: Add fullscreen help**

Add a `bfs-vs-dfs` help entry explaining the police pursuit mapping for both JS and Python IDs.

### Task 4: Verify

**Files:**
- Test: `tests/city-police-graph-scenes.test.mjs`
- Test: existing relevant city tests

- [ ] **Step 1: Run focused and regression tests**

Run:

```powershell
node --test tests\city-police-graph-scenes.test.mjs
node --test tests\city-string-real-scenes.test.mjs
node --test tests\city-tree-real-scenes.test.mjs
node --test tests\city-dp-real-scenes.test.mjs
node --test tests\city-terrain.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS with only existing eval/chunk warnings.

- [ ] **Step 3: Screenshot verify**

Use Playwright to select `bfs-vs-dfs`, click run, wait, and save `%TEMP%\police-graph-pursuit.png`.
