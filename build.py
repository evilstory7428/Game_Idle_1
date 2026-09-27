"""Build an offline Sunset Guard prototype with the active V12/V13 image runtime."""
from pathlib import Path
import sys
root=Path(__file__).resolve().parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root/'sunset-guard.html'
html=(root/'index.html').read_text()
for name in ['style.css','overhaul.css','phase3.css','phase3b.css','phase5.css','mobile-app.css','v12-spectacle.css','phase6-v12.css','v12-live-fixes.css','phase7-reference-pass1.css','phase7-reference-mobile-fix.css','phase7-reference-pass2.css']:
 html=html.replace('<link rel="stylesheet" href="'+name+'">','<style>'+(root/name).read_text()+'</style>')
for name in ['assets.js','phase2-art.js','game.js','campaign.js','phase2-combat.js','phase2-ui.js','phase3-equipment-pre.js','phase3-reference.js','phase3-equipment.js','phase3-polish.js','phase3b-progression.js','phase5-combat.js','assets/v12/atlas-chunks/part00.js','assets/v12/atlas-chunks/part01.js','phase6-v12.js','v12-lane-normalizer.js','v12-ui-bridge.js','phase7-reference-pass1.js','phase7-reference-pass2.js','boot.js','mobile-app.js']:
 html=html.replace('<script src="'+name+'"></script>','<script>'+(root/name).read_text()+'</script>')
out.write_text(html)
print(out,len(html.encode()))
