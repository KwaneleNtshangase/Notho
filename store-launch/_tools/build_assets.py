#!/usr/bin/env python3
"""
Notho store-asset generator.

Produces every icon size, the Play Store feature graphic, and the marketing
screenshot frames required by the App Store and Google Play.

Run:  python3 store-launch/_tools/build_assets.py
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLIC = os.path.join(ROOT, "public")
OUT = os.path.join(ROOT, "store-launch")

TEAL = (0, 122, 133)
TEAL_LIGHT = (0, 168, 181)
DARK = (10, 10, 10)
WHITE = (255, 255, 255)

FONT_DIR = "/usr/share/fonts/truetype/google-fonts"
F_BOLD = os.path.join(FONT_DIR, "Poppins-Bold.ttf")
F_MED = os.path.join(FONT_DIR, "Poppins-Medium.ttf")
F_REG = os.path.join(FONT_DIR, "Poppins-Regular.ttf")


def ensure(*parts):
    p = os.path.join(*parts)
    os.makedirs(p, exist_ok=True)
    return p


def font(path, size):
    return ImageFont.truetype(path, size)


def source_icon():
    """Highest-quality square source mark available."""
    for name in ("notho-icon-512.png", "notho-icon.png"):
        p = os.path.join(PUBLIC, name)
        if os.path.exists(p):
            return Image.open(p).convert("RGBA")
    sys.exit("No source icon found in public/")


# ---------------------------------------------------------------- icons
def build_icons():
    src = source_icon()
    ios_dir = ensure(OUT, "03-icons", "ios")
    and_dir = ensure(OUT, "03-icons", "android")
    store_dir = ensure(OUT, "03-icons", "store")

    # iOS AppIcon set. Apple renders its own rounded mask, so ship a full square.
    ios_sizes = {
        "Icon-20.png": 20, "Icon-20@2x.png": 40, "Icon-20@3x.png": 60,
        "Icon-29.png": 29, "Icon-29@2x.png": 58, "Icon-29@3x.png": 87,
        "Icon-40.png": 40, "Icon-40@2x.png": 80, "Icon-40@3x.png": 120,
        "Icon-60@2x.png": 120, "Icon-60@3x.png": 180,
        "Icon-76.png": 76, "Icon-76@2x.png": 152,
        "Icon-83.5@2x.png": 167,
    }
    # Xcode rejects ANY iOS app icon carrying an alpha channel, not just the
    # 1024 marketing one ("The app icon can't be transparent nor contain an
    # alpha channel"). Flatten every size onto the brand background.
    for name, size in ios_sizes.items():
        flat = Image.new("RGB", (size, size), DARK)
        layer = src.resize((size, size), Image.LANCZOS)
        flat.paste(layer, (0, 0), layer)
        flat.save(os.path.join(ios_dir, name))

    # App Store marketing icon: 1024x1024, NO alpha channel. Apple rejects
    # transparency here, so composite onto an opaque background first.
    marketing = Image.new("RGB", (1024, 1024), DARK)
    big = src.resize((1024, 1024), Image.LANCZOS)
    marketing.paste(big, (0, 0), big)
    marketing.save(os.path.join(store_dir, "app-store-icon-1024.png"))

    # Android launcher densities.
    for name, size in {
        "mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192,
    }.items():
        d = ensure(and_dir, name)
        r = src.resize((size, size), Image.LANCZOS)
        r.save(os.path.join(d, "ic_launcher.png"))
        r.save(os.path.join(d, "ic_launcher_round.png"))

    # Adaptive icon foreground: 432x432 canvas, art confined to the safe zone
    # (centre 66%) so Android's mask cannot clip the mark on any device shape.
    fg = Image.new("RGBA", (432, 432), (0, 0, 0, 0))
    inner = src.resize((284, 284), Image.LANCZOS)
    fg.paste(inner, (74, 74), inner)
    fg.save(os.path.join(and_dir, "ic_launcher_foreground.png"))

    # Play Store listing icon: 512x512, 32-bit PNG, alpha permitted.
    src.resize((512, 512), Image.LANCZOS).save(
        os.path.join(store_dir, "play-store-icon-512.png")
    )
    print("icons: done")


# ------------------------------------------------------- backgrounds
def brand_bg(w, h):
    """Dark canvas with a soft teal glow bleeding from the upper left."""
    bg = Image.new("RGB", (w, h), DARK)
    glow = Image.new("RGB", (w, h), DARK)
    gd = ImageDraw.Draw(glow)
    cx, cy = int(w * 0.30), int(h * 0.18)
    radius = int(max(w, h) * 0.75)
    steps = 60
    for i in range(steps, 0, -1):
        t = i / steps
        r = int(radius * t)
        col = (
            int(DARK[0] + (TEAL[0] - DARK[0]) * (1 - t) * 0.85),
            int(DARK[1] + (TEAL[1] - DARK[1]) * (1 - t) * 0.85),
            int(DARK[2] + (TEAL[2] - DARK[2]) * (1 - t) * 0.85),
        )
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(w, h) // 18))
    return Image.blend(bg, glow, 0.9)


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = f"{cur} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.size[0], img.size[1]], radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


# ------------------------------------------------- feature graphic
def build_feature_graphic():
    # Centred composition: Play can overlay a play-button badge and crops the
    # edges on some surfaces, so nothing important sits near the borders.
    w, h = 1024, 500
    img = brand_bg(w, h)
    d = ImageDraw.Draw(img)

    lockup_path = os.path.join(PUBLIC, "notho-logo-on-dark.png")
    lock = Image.open(lockup_path).convert("RGBA")
    lw = 620
    lh = int(lock.height * (lw / lock.width))
    lock = lock.resize((lw, lh), Image.LANCZOS)
    img.paste(lock, ((w - lw) // 2, 128), lock)

    tag = "Master your money, the South African way"
    ft = font(F_MED, 32)
    tw = d.textlength(tag, font=ft)
    d.text(((w - tw) / 2, 300), tag, font=ft, fill=(214, 232, 234))

    pill = "3-minute lessons  ·  Built for SA"
    fp = font(F_MED, 25)
    pw = d.textlength(pill, font=fp)
    px0 = (w - (pw + 56)) / 2
    d.rounded_rectangle([px0, 370, px0 + pw + 56, 428], 29, fill=TEAL)
    d.text((px0 + 28, 385), pill, font=fp, fill=WHITE)

    out = ensure(OUT, "04-graphics")
    img.save(os.path.join(out, "play-feature-graphic-1024x500.png"))
    print("feature graphic: done")


# ------------------------------------------------ screenshot frames
# Each entry: filename stem, headline, subhead.
PANELS = [
    ("01-learn", "Master your money,\nthe South African way",
     "Bite-sized lessons built for real SA life"),
    ("02-lessons", "Learn in\n3-minute lessons",
     "Budgeting, saving, debt and more"),
    ("03-budget", "Import your bank\nstatement in seconds",
     "Capitec, FNB, Standard Bank and more"),
    ("04-coach", "Ask Cosmo,\nyour money coach",
     "Plain answers about your own numbers"),
    ("05-progress", "Earn XP.\nBuild your streak.",
     "Stay motivated, track every win"),
]

# Store-required canvas sizes.
TARGETS = {
    "ios-6.9": (1290, 2796),
    "ios-6.5": (1242, 2688),
    "android-phone": (1080, 1920),
}


def build_frame(canvas_w, canvas_h, headline, subhead, screenshot=None):
    img = brand_bg(canvas_w, canvas_h)
    d = ImageDraw.Draw(img)
    scale = canvas_w / 1290.0

    margin = int(canvas_w * 0.085)
    h_size = int(78 * scale)
    s_size = int(38 * scale)
    f_head = font(F_BOLD, h_size)
    f_sub = font(F_REG, s_size)

    y = int(canvas_h * 0.058)
    for raw_line in headline.split("\n"):
        for line in wrap(d, raw_line, f_head, canvas_w - margin * 2):
            d.text((margin, y), line, font=f_head, fill=WHITE)
            y += int(h_size * 1.16)

    y += int(14 * scale)
    for line in wrap(d, subhead, f_sub, canvas_w - margin * 2):
        d.text((margin, y), line, font=f_sub, fill=(196, 214, 216))
        y += int(s_size * 1.38)

    # Device slot: whatever vertical space is left, minus breathing room.
    slot_top = y + int(52 * scale)
    slot_w = canvas_w - margin * 2
    slot_h = canvas_h - slot_top - int(canvas_h * 0.045)
    radius = int(54 * scale)

    if screenshot is not None:
        shot = screenshot.convert("RGB")
        # Cover-fit: fill the slot, centre-crop the overflow.
        ratio = max(slot_w / shot.width, slot_h / shot.height)
        new = (max(1, int(shot.width * ratio)), max(1, int(shot.height * ratio)))
        shot = shot.resize(new, Image.LANCZOS)
        left = (shot.width - slot_w) // 2
        top = 0  # anchor to the top so headers/nav stay visible
        shot = shot.crop((left, top, left + slot_w, top + slot_h))
        shot = rounded(shot, radius)

        shadow = Image.new("RGBA", (slot_w + 80, slot_h + 80), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle(
            [40, 46, slot_w + 40, slot_h + 46], radius, fill=(0, 0, 0, 150)
        )
        shadow = shadow.filter(ImageFilter.GaussianBlur(26))
        img.paste(shadow, (margin - 40, slot_top - 40), shadow)
        img.paste(shot, (margin, slot_top), shot)
    else:
        d.rounded_rectangle(
            [margin, slot_top, margin + slot_w, slot_top + slot_h],
            radius, outline=(90, 116, 120), width=max(2, int(4 * scale)),
        )
        note = "your screenshot goes here"
        fn = font(F_MED, int(34 * scale))
        tw = d.textlength(note, font=fn)
        d.text((margin + (slot_w - tw) / 2, slot_top + slot_h / 2),
               note, font=fn, fill=(110, 138, 142))
    return img


def build_frames(raw_dir=None):
    made = 0
    for key, (cw, ch) in TARGETS.items():
        empty_dir = ensure(OUT, "05-screenshots", "frames", key)
        final_dir = ensure(OUT, "05-screenshots", "final", key)
        for stem, head, sub in PANELS:
            shot = None
            if raw_dir:
                for ext in (".png", ".PNG", ".jpg", ".jpeg", ".JPG"):
                    cand = os.path.join(raw_dir, stem.split("-", 1)[1] + ext)
                    if os.path.exists(cand):
                        shot = Image.open(cand)
                        break
            img = build_frame(cw, ch, head, sub, shot)
            target = final_dir if shot is not None else empty_dir
            img.save(os.path.join(target, f"{stem}.png"))
            if shot is not None:
                made += 1
    print(f"screenshot frames: done ({made} composited with real screenshots)")


if __name__ == "__main__":
    raw = os.path.join(OUT, "05-screenshots", "raw")
    ensure(raw)
    build_icons()
    build_feature_graphic()
    build_frames(raw if os.path.isdir(raw) else None)
    print("\nAll assets written to store-launch/")
