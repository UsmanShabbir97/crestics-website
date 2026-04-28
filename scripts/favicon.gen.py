from PIL import Image
import os

OUT_DIR = '/Users/usmanshabbir/Projects/crestics/website/assets'
SRC = '/Users/usmanshabbir/Projects/crestics/website/assets/logo/PNGs/icon-violet-black-dot.png'

src = Image.open(SRC).convert('RGBA')


def render(size: int) -> Image.Image:
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sw, sh = src.size
    pad = max(1, int(size * 0.08))
    box = size - pad * 2
    aspect = sw / sh
    if aspect > 1:
        nw = box
        nh = int(box / aspect)
    else:
        nh = box
        nw = int(box * aspect)
    resized = src.resize((nw, nh), Image.LANCZOS)
    ox = (size - nw) // 2
    oy = (size - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
    return canvas


pngs = [
    (16, 'favicon-16.png'),
    (32, 'favicon-32.png'),
    (48, 'favicon-48.png'),
    (180, 'apple-touch-icon.png'),
    (192, 'android-chrome-192.png'),
    (512, 'android-chrome-512.png'),
]

for size, name in pngs:
    img = render(size)
    out = os.path.join(OUT_DIR, name)
    img.save(out, 'PNG', optimize=True)
    print('saved', out, img.size)

ico_imgs = [render(s) for s in [16, 32, 48]]
ico_imgs[0].save(os.path.join(OUT_DIR, 'favicon.ico'),
                 format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print('saved favicon.ico')

svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<path d="M32 10a22 22 0 1 0 16 37l-6-6a13.5 13.5 0 1 1 0-19l6-6A21.9 21.9 0 0 0 32 10z" fill="#7c5cff"/>
<circle cx="46" cy="46" r="6" fill="#222226"/>
</svg>'''
with open(os.path.join(OUT_DIR, 'favicon.svg'), 'w') as f:
    f.write(svg)
print('saved favicon.svg')
