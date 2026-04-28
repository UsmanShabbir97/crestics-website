from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
SURFACE = (17, 17, 19)
BORDER = (42, 42, 46)
VIOLET = (124, 92, 255)
TEXT = (245, 245, 247)
MUTED = (160, 160, 168)

img = Image.new('RGB', (W, H), SURFACE)
d = ImageDraw.Draw(img)

# subtle violet glow top-left
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for r, a in [(700, 28), (500, 40), (300, 55)]:
    gd.ellipse((-r//2, -r//2, r//2, r//2), fill=(124, 92, 255, a))
img.paste(glow, (0, 0), glow)

# border accent
d.rectangle((0, 0, W-1, H-1), outline=BORDER, width=1)
d.rectangle((48, 48, W-49, H-49), outline=BORDER, width=1)

# logo
logo = Image.open('/Users/usmanshabbir/Projects/crestics/website/assets/logo/PNGs/crestics-white-violet-dot.png')
lw = 380
lh = int(logo.size[1] * (lw / logo.size[0]))
logo = logo.resize((lw, lh), Image.LANCZOS)
img.paste(logo, (90, 90), logo)

# fonts
try:
    headline_font = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 72, index=4)  # Bold
    sub_font = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 28, index=0)
    eyebrow_font = ImageFont.truetype('/System/Library/Fonts/HelveticaNeue.ttc', 18, index=4)
except Exception:
    headline_font = ImageFont.load_default()
    sub_font = ImageFont.load_default()
    eyebrow_font = ImageFont.load_default()

# eyebrow
d.text((90, 280), 'AI PRODUCT STUDIO  ·  AUSTIN, TX', font=eyebrow_font, fill=VIOLET, spacing=4)

# headline
d.text((90, 320), 'Production-grade AI', font=headline_font, fill=TEXT)
d.text((90, 405), 'for B2B teams.', font=headline_font, fill=TEXT)

# sub
d.text((90, 510), 'Discover. Build. Operate.  ·  crestics.com', font=sub_font, fill=MUTED)

# violet dot bottom-right
dot_r = 14
d.ellipse((W-90-dot_r*2, H-90-dot_r*2, W-90, H-90), fill=VIOLET)

img.save('/Users/usmanshabbir/Projects/crestics/website/assets/og-default.png', 'PNG', optimize=True)
print('saved', img.size)
