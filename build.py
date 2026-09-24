"""Build an offline pixel prototype without external image assets."""
from pathlib import Path
import sys
root=Path(__file__).resolve().parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root/'sunset-guard.html'
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
for name in ['assets.js','game.js']:
 html=html.replace('<script src="'+name+'"></script>','<script>'+(root/name).read_text()+'</script>')
out.write_text(html)
print(out,len(html.encode()))
