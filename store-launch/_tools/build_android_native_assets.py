#!/usr/bin/env python3
"""Regenerate the checked-in Notho Android launcher and splash resources."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RES = ROOT / "android" / "app" / "src" / "main" / "res"
APP_ICON = ROOT / "Logos" / "png" / "app-icon" / "notho-app-icon-light-1024.png"
MARK = ROOT / "Logos" / "png" / "app-icon" / "notho-app-icon-dark-1024.png"


def build() -> None:
    app_icon = Image.open(APP_ICON).convert("RGBA")
    mark = Image.open(MARK).convert("RGBA")

    densities = {
        "mdpi": (48, 108), "hdpi": (72, 162), "xhdpi": (96, 216),
        "xxhdpi": (144, 324), "xxxhdpi": (192, 432),
    }
    for density, (legacy_size, foreground_size) in densities.items():
        out = RES / f"mipmap-{density}"
        out.mkdir(parents=True, exist_ok=True)
        legacy = app_icon.resize((legacy_size, legacy_size), Image.Resampling.LANCZOS)
        legacy.save(out / "ic_launcher.png")
        legacy.save(out / "ic_launcher_round.png")

        foreground = Image.new("RGBA", (foreground_size, foreground_size), (0, 0, 0, 0))
        safe = round(foreground_size * 0.66)
        layer = mark.resize((safe, safe), Image.Resampling.LANCZOS)
        offset = (foreground_size - safe) // 2
        foreground.paste(layer, (offset, offset), layer)
        foreground.save(out / "ic_launcher_foreground.png")

    splash_sizes = {
        "drawable": (480, 320),
        "drawable-port-mdpi": (320, 480), "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280), "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
        "drawable-land-mdpi": (480, 320), "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720), "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
    }
    for folder, (width, height) in splash_sizes.items():
        splash = Image.new("RGB", (width, height), (255, 255, 255))
        mark_size = round(min(width, height) * 0.24)
        layer = mark.resize((mark_size, mark_size), Image.Resampling.LANCZOS)
        splash.paste(layer, ((width - mark_size) // 2, (height - mark_size) // 2), layer)
        out = RES / folder
        out.mkdir(parents=True, exist_ok=True)
        splash.save(out / "splash.png")


if __name__ == "__main__":
    build()
    print("Android native assets regenerated.")
