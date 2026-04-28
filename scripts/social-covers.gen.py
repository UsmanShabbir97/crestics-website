from PIL import Image, ImageDraw, ImageFont
import os

SURFACE = (17, 17, 19)
BORDER = (42, 42, 46)
VIOLET = (124, 92, 255)
TEXT = (245, 245, 247)
MUTED = (160, 160, 168)
LOGO = '/Users/usmanshabbir/Projects/crestics/website/assets/logo/PNGs/crestics-white-violet-dot.png'
ICON = '/Users/usmanshabbir/Projects/crestics/website/assets/logo/PNGs/icon-violet-black-dot.png'
OUT_DIR = '/Users/usmanshabbir/Projects/crestics/website/assets/social'
HELV = '/System/Library/Fonts/HelveticaNeue.ttc'
os.makedirs(OUT_DIR, exist_ok=True)


def violet_glow(img, cx, cy, radii_alpha):
    g = Image.new('RGBA', img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    for r, a in radii_alpha:
        gd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*VIOLET, a))
    img.paste(g, (0, 0), g)


def chip(d: ImageDraw.ImageDraw, x, y, label, font):
    pad_x, pad_y = 18, 9
    bbox = d.textbbox((0, 0), label, font=font)
    w = bbox[2] - bbox[0] + pad_x * 2
    h = bbox[3] - bbox[1] + pad_y * 2
    d.rounded_rectangle((x, y, x + w, y + h), radius=h // 2,
                        outline=VIOLET, width=2, fill=(*VIOLET, 22))
    d.text((x + pad_x, y + pad_y - bbox[1]), label, font=font, fill=TEXT)
    return w


def linkedin():
    W, H = 1128, 191
    img = Image.new('RGB', (W, H), SURFACE)
    violet_glow(img, -100, H // 2, [(420, 30), (260, 50), (160, 70)])
    violet_glow(img, W + 60, H // 2, [(360, 22), (220, 38)])

    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W - 1, H - 1), outline=BORDER, width=1)

    icon = Image.open(ICON).convert('RGBA')
    ih = 92
    iw = int(icon.size[0] * (ih / icon.size[1]))
    icon = icon.resize((iw, ih), Image.LANCZOS)
    img.paste(icon, (44, (H - ih) // 2), icon)

    headline_font = ImageFont.truetype(HELV, 34, index=4)
    sub_font = ImageFont.truetype(HELV, 17, index=0)
    eyebrow_font = ImageFont.truetype(HELV, 13, index=4)

    text_x = 44 + iw + 36
    d.text((text_x, 48), 'Production AI without the headcount.',
           font=headline_font, fill=TEXT)
    d.text((text_x, 100), 'Senior engineers  ·  Fixed scope  ·  You own everything',
           font=sub_font, fill=MUTED)
    d.text((text_x, 130), 'CRESTICS.COM  ·  AUSTIN, TX',
           font=eyebrow_font, fill=VIOLET)

    out = os.path.join(OUT_DIR, 'linkedin-cover-1128x191.png')
    img.save(out, 'PNG', optimize=True)
    print('saved', out, img.size)


def facebook():
    W, H = 1640, 856
    img = Image.new('RGB', (W, H), SURFACE)
    violet_glow(img, 0, 0, [(900, 32), (600, 48), (320, 68)])
    violet_glow(img, W, H, [(800, 24), (450, 38)])

    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W - 1, H - 1), outline=BORDER, width=1)
    inset = 60
    d.rectangle((inset, inset, W - inset - 1, H - inset - 1),
                outline=BORDER, width=1)

    safe_cx, safe_cy = W // 2, H // 2

    logo = Image.open(LOGO).convert('RGBA')
    lw = 320
    lh = int(logo.size[1] * (lw / logo.size[0]))
    logo = logo.resize((lw, lh), Image.LANCZOS)
    img.paste(logo, (safe_cx - lw // 2, safe_cy - 250), logo)

    eyebrow_font = ImageFont.truetype(HELV, 22, index=4)
    headline_font = ImageFont.truetype(HELV, 84, index=4)
    sub_font = ImageFont.truetype(HELV, 30, index=0)
    chip_font = ImageFont.truetype(HELV, 18, index=4)

    eyebrow = 'AI PRODUCT STUDIO  ·  AUSTIN, TX'
    bbox = d.textbbox((0, 0), eyebrow, font=eyebrow_font)
    d.text((safe_cx - (bbox[2] - bbox[0]) // 2, safe_cy - 90),
           eyebrow, font=eyebrow_font, fill=VIOLET, spacing=6)

    headline = 'Ship AI in weeks, not quarters.'
    bbox = d.textbbox((0, 0), headline, font=headline_font)
    d.text((safe_cx - (bbox[2] - bbox[0]) // 2, safe_cy - 50),
           headline, font=headline_font, fill=TEXT)

    sub = 'Senior engineers.  Fixed scope.  Production-grade.'
    bbox = d.textbbox((0, 0), sub, font=sub_font)
    d.text((safe_cx - (bbox[2] - bbox[0]) // 2, safe_cy + 60),
           sub, font=sub_font, fill=MUTED)

    chips = ['DISCOVER', 'BUILD', 'OPERATE']
    chip_widths = []
    for c in chips:
        bbox = d.textbbox((0, 0), c, font=chip_font)
        chip_widths.append(bbox[2] - bbox[0] + 36)
    gap = 16
    total = sum(chip_widths) + gap * (len(chips) - 1)
    x = safe_cx - total // 2
    y = safe_cy + 130
    for label, w in zip(chips, chip_widths):
        chip(d, x, y, label, chip_font)
        x += w + gap

    out = os.path.join(OUT_DIR, 'facebook-cover-1640x856.png')
    img.save(out, 'PNG', optimize=True)
    print('saved', out, img.size)


linkedin()
facebook()
