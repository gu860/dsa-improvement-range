# Police Graph Pursuit Design

## Goal

Add a realistic city police pursuit district for the remaining `bfs-vs-dfs` and `py-bfs-vs-dfs` graph traversal algorithms.

## Selected Scene

Use a city chase command area:

- Graph nodes are street intersections.
- Graph edges are real roads connecting intersections.
- BFS is shown as police units spreading outward by dispatch queue levels.
- DFS is shown as a focused pursuit route that dives down one street path before backtracking.
- A thief marker sits at the target intersection so the traversal has a concrete real-world purpose.

## Required Mapping

- `node id` -> intersection sign and road-junction label.
- `edge` -> street segment, painted lane, and route arrow.
- `highlights` -> already-searched/locked-down intersections.
- `pointers.current` -> current police search location.
- `pointers.queueLen` -> BFS dispatch queue length shown on a command board.
- DFS active trail -> one highlighted pursuit corridor using the visited order.

## Visual Requirements

- The scene must live inside `CityScene`, not the old standalone graph room.
- Running either JS or Python BFS/DFS must jump to the police pursuit front entrance.
- Police vehicles and officers must move or be positioned on actual roads/intersections, not arbitrary straight-line overlays.
- Labels must be close to intersections and roads.
- Fullscreen help must explain the police scene, node/edge mapping, BFS queue, and DFS stack.

## Verification

- Add source-level tests proving city routing, scene components, motion hooks, open lot reservation, and help content.
- Run focused tests, existing city scene tests, and `npm run build`.
- Capture a Playwright screenshot after selecting `bfs-vs-dfs` and running it.
