# String Media District Design

## Goal

Build a realistic city media and printing district for string algorithms in the main `CityScene`, replacing the isolated legacy string engineering stage.

## Selected Approach

Use a city media printing center:

- `string-search`: billboard proofing line. Text characters are outdoor poster lightboxes, the pattern is a mobile proofing template, and the scanner moves across the text.
- `longest-palindrome`: neon sign symmetry workshop. Letter panels expand around the current center and mark the longest symmetric phrase.
- `anagram`: movable-type sorting room. Two word trays feed letter blocks into counting bins so sort/hash behavior maps to real storage.
- `longest-substring`: transit subtitle control wall. A sliding inspection frame shows the current non-repeating window, and duplicate characters move the left boundary.

## Scene Requirements

- Add all string algorithms to the city routing and entrance camera configuration.
- The scene must live inside the city world as a believable district, not a floating display table.
- Algorithm traces must drive visible motion or geometry: scanner position, proofing template alignment, symmetry arms, counting bins, and sliding window frame.
- Labels must stay near the physical letter/object they describe and include index, character, and current role.
- The district must include a visible `说明` control wired to the existing fullscreen help overlay.
- Rendering should use lightweight meshes and memoized derived data; no heavy assets are needed.

## Verification

- Add focused tests that assert routing, camera setup, help content, physical mappings, and trace-driven animation hooks.
- Run the string district tests, existing tree/terrain tests, and `npm run build`.
- Capture a Playwright screenshot of `string-search` after running the algorithm and inspect the result.
