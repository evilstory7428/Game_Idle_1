"""Build an offline pixel prototype without external image assets."""
from pathlib import Path
import sys
root=Path(__file__).resolve().parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root/'sunset-guard.html'
html=(root/'index.html').read_text()
for name in ['style.css','overhaul.css','phase3.css','phase3b.css','mobile-app.css']:
 html=html.replace('<link rel="stylesheet" href="'+name+'">','<style>'+(root/name).read_text()+'</style>')
for name in ['assets.js','phase2-art.js','game.js','campaign.js','phase2-combat.js','phase2-ui.js','phase3-equipment-pre.js','phase3-reference.js','phase3-equipment.js','phase3-polish.js','phase3b-progression.js','boot.js','mobile-app.js']:
 html=html.replace('<script src="'+name+'"></script>','<script>'+(root/name).read_text()+'</script>')
out.write_text(html)
print(out,len(html.encode()))
