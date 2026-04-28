from PIL import Image, ImageDraw, ImageFilter
import os

VIOLET = (124, 92, 255)
DARK = (17, 17, 19)
WHITE = (255, 255, 255)

OUT_DIR = '/Users/usmanshabbir/Projects/crestics/website/assets'
LOGO = '/Users/usmanshabbir/Projects/crestics/website/assets/logo/PNGs/icon-white-violet-dot.png'

def render(size, radius_pct=0.22, dot=True):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_pct)
    d.rounded_rectangle((0, 0, size, size), radius=r, fill=VIOLET)

    src = Image.open(LOGO).convert('RGBA')
    sw, sh = src.size

    pad = int(size * 0.16)
    box_w = size - pad * 2
    box_h = size - pad * 2

    aspect = sw / sh
    if aspect > box_w / box_h:
        nw = box_w
        nh = int(box_w / aspect)
    else:
        nh = box_h
        nw = int(box_h * aspect)

    src_resized = src.resize((nw, nh), Image.LANCZOS)

    px = src_resized.load()
    for y in range(nh):
        for x in range(nw):
            r_, g_, b_, a_ = px[x, y]
            if a_ > 10 and abs(r_ - VIOLET[0]) < 20 and abs(g_ - VIOLET[1]) < 20 and abs(b_ - VIOLET[2]) < 30:
                px[x, y] = (0, 0, 0, 0)

    ox = (size - nw) // 2
    oy = (size - nh) // 2
    img.paste(src_resized, (ox, oy), src_resized)

    if dot and size >= 32:
        dot_r = max(2, int(size * 0.085))
        dot_cx = ox + int(nw * 0.78)
        dot_cy = oy + int(nh * 0.74)
        d.ellipse((dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r), fill=DARK)

    return img

# PNG favicons
for size in [16, 32, 48, 180, 192, 512]:
    img = render(size, dot=(size >= 32))
    out = os.path.join(OUT_DIR, f'favicon-{size}.png' if size not in (180,) else 'apple-touch-icon.png')
    if size == 192:
        out = os.path.join(OUT_DIR, 'android-chrome-192.png')
    elif size == 512:
        out = os.path.join(OUT_DIR, 'android-chrome-512.png')
    img.save(out, 'PNG', optimize=True)
    print('saved', out, img.size)

# .ico (16+32+48 multi-size)
ico_imgs = [render(s, dot=(s >= 32)) for s in [16, 32, 48]]
ico_imgs[0].save(os.path.join(OUT_DIR, 'favicon.ico'), format='ICO', sizes=[(16,16),(32,32),(48,48)])
print('saved favicon.ico')

# SVG
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#7c5cff"/>
<path d="M32 14a18 18 0 1 0 13 30l-5-5a11 11 0 1 1 0-15l5-5A17.9 17.9 0 0 0 32 14z" fill="#ffffff"/>
<circle cx="44" cy="44" r="5" fill="#111113"/>
</svg>'''
with open(os.path.join(OUT_DIR, 'favicon.svg'), 'w') as f:
    f.write(svg)
print('saved favicon.svg')
