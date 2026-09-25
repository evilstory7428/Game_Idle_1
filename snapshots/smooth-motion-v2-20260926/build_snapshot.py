from pathlib import Path
import hashlib
import re
import sys

SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('sunset-guard-formation-fix-1.html')
OUTPUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('Sunset_Guard_Smooth_Motion_v2.html')
PATCH = Path(__file__).with_name('smooth-motion-v2-patch.html')
EXPECTED_SIZE = 51_273_883
EXPECTED_SHA256 = '21330b25354c4d2cfdde275d146645842e69578e4463f97fa008fdd9bfafe7b0'

text = SOURCE.read_text(encoding='utf-8')
if '<!-- Smooth Motion Patch v2 -->' in text:
    raise SystemExit('Source already contains Smooth Motion Patch v2; use the clean formation-fix source.')

text = re.sub(
    r'<title>.*?</title>',
    '<title>SUNSET GUARD · Smooth Motion v2</title>',
    text,
    count=1,
    flags=re.S,
)
patch = PATCH.read_text(encoding='utf-8')
text = text.replace('</body>', '\n' + patch + '</body>', 1)
OUTPUT.write_text(text, encoding='utf-8')

raw = OUTPUT.read_bytes()
sha = hashlib.sha256(raw).hexdigest()
print(f'output={OUTPUT}')
print(f'size={len(raw)}')
print(f'sha256={sha}')

if len(raw) != EXPECTED_SIZE or sha != EXPECTED_SHA256:
    raise SystemExit('Snapshot verification failed: source/patch differs from the preserved v2 baseline.')
print('snapshot verification: OK')
