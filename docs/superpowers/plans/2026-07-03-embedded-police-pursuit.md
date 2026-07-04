# Embedded Police Pursuit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the BFS/DFS police pursuit graph into the real city road network with a police station and natural streets.

**Architecture:** Extend `CityScene.tsx` in place, following the existing district component style. Add focused components for the police station, embedded roads, and city intersection details, then replace the standalone pursuit floor with a road-connected city block.

**Tech Stack:** React, TypeScript, React Three Fiber, Drei `Text`/`Billboard`, Node source tests.

---

### Task 1: Regression Test

**Files:**
- Modify: `tests/city-police-graph-scenes.test.mjs`

- [ ] Add assertions for `PoliceStation`, `EmbeddedPursuitRoad`, `PoliceStationDriveway`, road signs, and station-to-road connection.
- [ ] Run `node --test tests\city-police-graph-scenes.test.mjs` and verify the new test fails before implementation.

### Task 2: Scene Implementation

**Files:**
- Modify: `src/scenes/EngineeringScenes/CityScene.tsx`

- [ ] Add `PoliceStation`, `PoliceStationDriveway`, and `EmbeddedPursuitRoad` components.
- [ ] Change `PolicePursuitDistrict` from a flat private lot to a city block with asphalt streets, sidewalks, crosswalks, lane markings, and building frontage.
- [ ] Keep node and edge labels visible while making them look like city street signs.
- [ ] Keep BFS and DFS vehicles tied to trace state.

### Task 3: Verification

**Commands:**
- `node --test tests\city-police-graph-scenes.test.mjs`
- `npm run build`
- Playwright BFS/DFS run screenshot at `http://127.0.0.1:5173`

- [ ] Confirm source tests pass.
- [ ] Confirm production build exits 0.
- [ ] Inspect screenshot for police station, connected road network, readable labels, and no framework overlay.
