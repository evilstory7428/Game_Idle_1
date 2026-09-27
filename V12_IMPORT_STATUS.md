# Sunset Guard V12 Import — Batch 1 + 2

Source: `Sunset_Guard_Spectacle_UI_v12_5Lane_Run_Death_FINAL.html`

## Batch 1 — staged
- Spectacle UI stylesheet
- 5 invisible enemy lane coordinates: 350 / 390 / 430 / 470 / 510
- Enemy death hold duration: 0.85s
- V12 asset-path manifest
- Lightweight item SVG assets: whip, scope, dynamite, guitar, staff

## Batch 2 — activated
- `index.html` switched from PIXEL PROTOTYPE branding to V12 IMAGE BATTLE
- Existing repository image assets are now connected to the active renderer
  - backgrounds: `assets/bg0.webp`, `bg1.webp`, `bg2.webp`
  - heroes: `assets/su.webp`, `ash.webp`, `buck.webp`, `june.webp`, `chel.webp`, `rose.webp`
  - enemies: `assets/boar.webp`, `wolf.webp`, `cat.webp`, `caveman.webp`, `zombie.webp`
- `v12-project-runtime.js`
  - image-first background/hero/enemy rendering
  - 5 invisible terrain lanes
  - 0.85s enemy death hold before removal
  - renderer automatically prefers V12 run/death sheets when their staged paths become available
  - long red boss HP bar below the wave panel
- `v12-live-fixes.css`
  - pause button hidden
  - compact circular x1/x2/x3 speed control
  - boss HP bar styling
- `v12-ui-bridge.js` keeps the speed-control state synced
- `build.py` includes every V12 layer in standalone builds

## Heavy source-art follow-up
The exact large raster assets embedded inside the supplied ~53 MB standalone HTML are preserved as the V12 source reference. The current GitHub connector cannot directly stream local binary files into repository paths, so the active runtime first uses the equivalent image files already present in `assets/` and automatically upgrades to the V12-specific paths from `v12-assets-manifest.js` when those binary files are added.

This keeps the branch playable instead of switching to missing image URLs and producing a broken build.
