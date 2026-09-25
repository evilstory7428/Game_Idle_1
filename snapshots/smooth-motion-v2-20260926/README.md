# Sunset Guard — Smooth Motion v2 snapshot

이 디렉터리는 `Sunset_Guard_Smooth_Motion_v2.html` 시점의 복구 기준입니다.

## Snapshot identity
- Snapshot branch: `snapshot/smooth-motion-v2-20260926`
- Based on working branch head: `92fcbee5a957b85eaced5770030b8bfcf18057ee`
- Source HTML: `sunset-guard-formation-fix-1.html`
- Generated HTML: `Sunset_Guard_Smooth_Motion_v2.html`
- Generated file size: `51,273,883 bytes`
- SHA-256: `21330b25354c4d2cfdde275d146645842e69578e4463f97fa008fdd9bfafe7b0`

## Preserved motion behavior
1. 6 source frames are mapped to a 12-step visual timeline.
2. Per-frame `anchorX/anchorY` keeps the feet on a fixed world-space ground anchor.
3. Attack animation is divided into prepare → impact → recoil → recovery.
4. One-shot attack / ultimate / AOE damage events are synchronized to the visual impact pose at 52%.
5. Idle / attack / ultimate / AOE use subtle 1–3 px translation plus small rotation/scale motion around the foot pivot.

## Files
- `smooth-motion-v2-patch.html`: exact patch block injected into the source HTML.
- `build_snapshot.py`: deterministic reconstruction script.
- `checksums.txt`: expected snapshot filename, size and SHA-256.

## Reconstruction
Place the original `sunset-guard-formation-fix-1.html` next to these files, then run:

```bash
python build_snapshot.py sunset-guard-formation-fix-1.html Sunset_Guard_Smooth_Motion_v2.html
```

The generated file must match the SHA-256 above. If it does not, the source HTML or patch has changed.

## Large-file note
The generated HTML is about 51 MB because images/fonts are embedded as data URIs. The current ChatGPT GitHub connector cannot safely transfer that monolithic file as one repository text write, so this snapshot stores the exact reconstructable motion patch + deterministic build recipe + checksum. When Desktop Commander/local Git is online, the 51 MB generated HTML can additionally be committed or attached through the normal Git client without changing this snapshot contract.
