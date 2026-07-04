import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const citySource = readFileSync('src/scenes/EngineeringScenes/CityScene.tsx', 'utf8');
const frameSource = readFileSync('src/components/SceneFrame.tsx', 'utf8');

test('BFS DFS graph algorithms route into the police pursuit city district', () => {
  assert.match(citySource, /const GRAPH_SEARCH_IDS = new Set\(\['bfs-vs-dfs', 'py-bfs-vs-dfs'\]\)/);
  assert.match(citySource, /function PolicePursuitDistrict/);
  assert.match(citySource, /<PolicePursuitDistrict naiveSnapshot=\{naiveSnapshot\} optimizedSnapshot=\{optimizedSnapshot\} activeAlgorithmId=\{activeAlgorithmId\} \/>/);
  assert.match(citySource, /GRAPH_SEARCH_IDS\.has\(activeAlgorithmId\)/);
  assert.match(frameSource, /'bfs-vs-dfs'/);
  assert.match(frameSource, /normalizeAlgorithmId\(algorithmId\)/);
  assert.ok(frameSource.includes("id.replace(/^py-/, '')"));
});

test('police pursuit scene maps graph structure to real intersections and streets', () => {
  assert.match(citySource, /function getPursuitGraphState/);
  assert.match(citySource, /function PursuitIntersection/);
  assert.match(citySource, /function PursuitRoad/);
  assert.match(citySource, /路口 node \{node\.id\}/);
  assert.match(citySource, /街道 edge/);
});

test('police pursuit scene has BFS and DFS specific motion objects', () => {
  assert.match(citySource, /function PolicePatrolCar/);
  assert.match(citySource, /function ThiefMarker/);
  assert.match(citySource, /function PursuitCommandBoard/);
  assert.match(citySource, /queueLen/);
  assert.match(citySource, /DFS 追踪栈/);
  assert.match(citySource, /BFS 出警队列/);
});

test('police pursuit district has entrance camera, open lot, and fullscreen help', () => {
  assert.match(citySource, /'bfs-vs-dfs': \{\s*label: '城市追捕指挥区'/);
  assert.match(citySource, /'py-bfs-vs-dfs': \{\s*label: '城市追捕指挥区'/);
  assert.match(citySource, /\/\* police pursuit district \*\//);
  assert.match(citySource, /b\.x > 18 && b\.x < 45 && b\.z > 30 && b\.z < 50/);
  assert.match(frameSource, /title: 'BFS \/ DFS · 城市警察追捕'/);
});

test('police pursuit graph is embedded into city roads from a police station', () => {
  assert.match(citySource, /function PoliceStation/);
  assert.match(citySource, /function PoliceStationDriveway/);
  assert.match(citySource, /function EmbeddedPursuitRoad/);
  assert.match(citySource, /警察局/);
  assert.match(citySource, /出警车道/);
  assert.match(citySource, /城市道路 edge/);
  assert.match(citySource, /PursuitCrosswalk/);
  assert.match(citySource, /stationNode/);
});

test('police pursuit route reuses existing city roads instead of drawing a separate road pad', () => {
  assert.match(citySource, /const POLICE_PURSUIT_ORIGIN: \[number, number, number\] = \[35, 0, 38\]/);
  assert.match(citySource, /function ExistingCityRoadRoute/);
  assert.match(citySource, /城市原有道路 edge/);
  assert.doesNotMatch(citySource, /planeGeometry args=\{\[19\.5, 16\.5\]\}/);
  assert.doesNotMatch(citySource, /\{ x: 31, z: 40, w: 22, d: 18, color: '#273138'/);
});

test('city camera uses the selected algorithm entrance instead of debug coordinates', () => {
  assert.match(citySource, /const pos = new THREE\.Vector3\(\.\.\.target\.cameraPos\)/);
  assert.match(citySource, /const tgt = new THREE\.Vector3\(\.\.\.target\.cameraTarget\)/);
  assert.match(citySource, /cameraPos: \[35, 15\.5, 58\]/);
  assert.match(citySource, /cameraTarget: \[35, 0\.9, 42\]/);
  assert.match(frameSource, /position: \[35, 15\.5, 58\], target: \[35, 0\.9, 42\]/);
  assert.doesNotMatch(citySource, /TEMP: fly to forest area for debugging/);
  assert.doesNotMatch(citySource, /TEMP: top-down debug view/);
  assert.doesNotMatch(citySource, /TEMP debug: fly to top-down view/);
  assert.doesNotMatch(citySource, /new THREE\.Vector3\(55, 2\.5, 55\)/);
  assert.doesNotMatch(citySource, /new THREE\.Vector3\(0, 85, 0\)/);
});

test('police pursuit moves through dense downtown streets without teleporting cars', () => {
  assert.match(citySource, /function DowntownDenseRoadNetwork/);
  assert.match(citySource, /DOWNTOWN_PURSUIT_ROADS/);
  assert.match(citySource, /downtown-pursuit-building/);
  assert.match(citySource, /const POLICE_CAR_SPEED = 12\.8/);
  assert.match(citySource, /group\.current\.position\.addScaledVector/);
  assert.doesNotMatch(citySource, /group\.current\.position\.lerp/);
  assert.match(citySource, /previousPosition/);
  assert.match(citySource, /Math\.atan2\(dx, dz\)/);
});

test('police cars follow the same L-shaped city road route as the drawn edge', () => {
  assert.match(citySource, /type PursuitRoadPoint = \{ x: number; z: number \}/);
  assert.match(citySource, /function getPursuitRoutePoints/);
  assert.match(citySource, /const corner: PursuitRoadPoint = \{ x: to\.x, z: from\.z \}/);
  assert.match(citySource, /getPursuitRoutePoints\(from, to\)/);
  assert.match(citySource, /routePoints\.current = getPursuitRoutePoints/);
  assert.match(citySource, /segmentIndex\.current/);
});

test('current pursuit step has a dedicated visible L-shaped route overlay', () => {
  assert.match(citySource, /function getCurrentPursuitEdge/);
  assert.match(citySource, /state\.edges\.find\(edge => isPursuitEdgeBetween\(edge, previousId, state\.current\)\)/);
  assert.match(citySource, /const candidateIds = state\.order\.slice\(0, Math\.max\(currentIndex, state\.order\.length - 1\)\)\.reverse\(\)/);
  assert.match(citySource, /function CurrentPursuitRoute/);
  assert.match(citySource, /const route = getPursuitRoutePoints\(from, to\)/);
  assert.match(citySource, /当前追捕/);
  assert.match(citySource, /route-arrow/);
  assert.match(citySource, /<CurrentPursuitRoute from=\{bfsCurrentEdge\.from\} to=\{bfsCurrentEdge\.to\} color="#facc15" label="BFS 当前追捕" \/>/);
  assert.match(citySource, /<CurrentPursuitRoute from=\{dfsCurrentEdge\.from\} to=\{dfsCurrentEdge\.to\} color="#c084fc" label="DFS 当前追踪" \/>/);
});
