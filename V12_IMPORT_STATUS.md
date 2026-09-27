# Sunset Guard V12 Import — Batch 1 + 2 Complete

Source: `Sunset_Guard_Spectacle_UI_v12_5Lane_Run_Death_FINAL.html`

## Batch 1 — staged
- Spectacle UI stylesheet
- V12 asset-path manifest
- Lightweight item SVG assets: whip, scope, dynamite, guitar, staff
- Import/recovery structure prepared without breaking the playable branch

## Batch 2 — exact V12 atlas activated
The large raster artwork is already preserved inside the repository as the split V12 atlas:
- `assets/v12/atlas-chunks/part00.js`
- `assets/v12/atlas-chunks/part01.js`

`phase6-v12.js` now reads those chunks, reconstructs the image atlas in-browser, removes the source magenta key color, and uses the exact atlas regions for gameplay.

### Active image content
- Backgrounds: 3 V12 battlefield backgrounds (`bg0`, `bg1`, `bg2`)
- Heroes: Nancy / Luna / Elona / Jessie / Julie / Chelly / Tina
  - 6 columns × 4 motion rows per hero atlas region
  - current battle runtime uses idle and attack rows
- Enemies: boar / wolf / cat / caveman / zombie
  - 8-frame run strips
  - 8-frame death strips

### Combat integration
- Five invisible terrain lanes: `315 / 359 / 403 / 447 / 491`
- Enemies choose the least occupied lane; bosses use the center lane
- Hero attacks respect lane proximity
- Killed enemies leave gameplay logic immediately but their corpse remains temporarily for the death animation
- Monster run/death sprites use terrain-specific ground offsets
- Boss scale hierarchy retained: Elite > normal, Main Boss > Elite
- Long red boss HP bar appears below the wave panel
- Pause button is hidden
- Compact circular speed button displays x1 / x2 / x3

### Project wiring
- `index.html` loads `part00.js` + `part01.js` before `phase6-v12.js`
- `phase6-v12.css` and V12 visual overrides are active
- `build.py` produces the same atlas-powered standalone build
- `sw.js` uses a new V12 atlas cache version and caches the atlas/runtime files
- `test-syntax.cjs` validates the atlas chunk scripts and V12 runtime

## Legacy/fallback import helpers
`v12-assets-manifest.js` and `v12-project-runtime.js` remain in the repository as import/fallback helpers, but they are intentionally **not loaded by the active `index.html`** so combat logic is not wrapped twice.

## Validation status
The repository is now wired to the exact V12 image atlas rather than the old pixel-only presentation. Static integration checks are included. Full Chromium/mobile gameplay validation is still required before merging to `main`, so PR #2 remains Draft.
