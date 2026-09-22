"""Build a portable single HTML file without reducing image resolution."""
import base64,json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root/'sunset-guard.html'
def data(path,mime):return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
html=(root/'index.html').read_text();css=(root/'style.css').read_text()
css=re.sub(r'url\((assets/fonts/[^)]+)\)',lambda m:'url('+data(root/m[1],'font/woff2')+')',css)
assets=json.loads((root/'assets.js').read_text().split('=',1)[1].rstrip(';\n'))
assets={k:data(root/v,'image/webp') for k,v in assets.items()}
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="assets.js"></script>','<script>const ASSET_URLS='+json.dumps(assets)+';</script>')
html=html.replace('<script src="game.js"></script>','<script>'+(root/'game.js').read_text()+'</script>')
out.write_text(html);print(out,len(html.encode()))
