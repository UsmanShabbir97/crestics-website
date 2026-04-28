from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
SURFACE = (17, 17, 19)
BORDER = (42, 42, 46)
VIOLET = (124, 92, 255)
TEXT = (245, 245, 247)
MUTED = (160, 160, 168)
LOGO_PATH = '/Users/usmanshabbir/Projects/crestics/website/assets/logo/PNGs/crestics-white-violet-dot.png'
OUT_DIR = '/Users/usmanshabbir/Projects/crestics/website/assets'


def render(eyebrow: str, headline_lines: list[str], sub: str, out_name: str):
    img = Image.new('RGB', (W, H), SURFACE)
    d = ImageDraw.Draw(img)

    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for r, a in [(700, 28), (500, 40), (300, 55)]:
        gd.ellipse((-r // 2, -r // 2, r // 2, r // 2), fill=(124, 92, 255, a))
    img.paste(glow, (0, 0), glow)

    d.rectangle((0, 0, W - 1, H - 1), outline=BORDER, width=1)
    d.rectangle((48, 48, W - 49, H - 49), outline=BORDER, width=1)

    logo = Image.open(LOGO_PATH)
    lw = 380
    lh = int(logo.size[1] * (lw / logo.size[0]))
    logo = logo.resize((lw, lh), Image.LANCZOS)
    img.paste(logo, (90, 90), logo)

    headline_size = 76 if len(headline_lines) <= 2 else 64
    headline_font = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', headline_size, index=4)
    sub_font = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 28, index=0)
    eyebrow_font = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 18, index=4)

    d.text((90, 280), eyebrow, font=eyebrow_font, fill=VIOLET, spacing=4)

    y = 320
    line_gap = headline_size + 12
    for line in headline_lines:
        d.text((90, y), line, font=headline_font, fill=TEXT)
        y += line_gap

    d.text((90, 510), sub, font=sub_font, fill=MUTED)

    dot_r = 14
    d.ellipse((W - 90 - dot_r * 2, H - 90 - dot_r * 2, W - 90, H - 90), fill=VIOLET)

    out = f'{OUT_DIR}/{out_name}'
    img.save(out, 'PNG', optimize=True)
    print('saved', out)


variants = [
    ('og-default.png',
     'AI PRODUCT STUDIO  ·  AUSTIN, TX',
     ['Production-grade AI', 'for B2B teams.'],
     'Discover. Build. Operate.  ·  crestics.com'),
    ('og-discover.png',
     'DISCOVER  ·  PHASE 1',
     ['ROI-validated AI', 'roadmap in 2–3 weeks.'],
     '$18K–$28K  ·  Stakeholder workflows  ·  Build estimate'),
    ('og-build.png',
     'BUILD  ·  PHASE 2',
     ['Custom AI, shipped', 'in weeks.'],
     '$25K–$175K+  ·  Fixed scope  ·  You own everything'),
    ('og-operate.png',
     'OPERATE  ·  PHASE 3',
     ['Fractional AI', 'engineering retainer.'],
     '$8K–$35K/month  ·  30-day exit  ·  No retainers without value'),
    ('og-case-industrial-distribution.png',
     'CASE STUDY  ·  INDUSTRIAL DISTRIBUTION',
     ['Zero-touch order pipeline', 'across 200+ suppliers.'],
     '2.5× throughput  ·  5→0 manual headcount  ·  16 weeks'),
]

for name, eyebrow, lines, sub in variants:
    render(eyebrow, lines, sub, name)
