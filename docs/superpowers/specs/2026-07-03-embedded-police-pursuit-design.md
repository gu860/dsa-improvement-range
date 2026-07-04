# Embedded Police Pursuit Design

## Goal

Upgrade the BFS/DFS graph traversal scene from a standalone pursuit lot into a city-integrated police pursuit district.

## Design

Use the existing city as the environment. Place a realistic police station at the west side of the pursuit district, connect its front driveway to the local road network, and map graph nodes to actual intersections. Graph edges become asphalt streets with lane markings, crosswalks, sidewalks, road signs, and active pursuit highlights.

The scene should keep the algorithm meaning explicit:
- `node` labels appear as street intersection signs.
- `edge` labels appear as small road plaques.
- BFS uses multiple patrol cars spreading from the police station through the road network.
- DFS uses one pursuit car moving down the currently selected route.
- The thief target sits at a real street corner, not on an abstract platform.

## Scope

Only the BFS/DFS graph traversal city scene changes. Other algorithm districts, template logic, and executor behavior remain unchanged.

## Verification

Add source tests that require the police station, embedded pursuit roads, station driveway, road markings, and route labels. Then verify with the existing police scene test, production build, and a Playwright screenshot of the BFS/DFS scene.
