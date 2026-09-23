from pathlib import Path

from PIL import Image, ImageDraw


OUT = Path(__file__).resolve().parents[1] / "icons"
OUT.mkdir(parents=True, exist_ok=True)

for size in (16, 48, 128):
    scale = size / 128
    image = Image.new("RGBA", (size, size), (15, 23, 42, 255))
    draw = ImageDraw.Draw(image)
    pad = round(10 * scale)
    radius = round(30 * scale)
    draw.rounded_rectangle((pad, pad, size - pad, size - pad), radius=radius, fill=(17, 28, 49, 255), outline=(38, 55, 86, 255), width=max(1, round(3 * scale)))

    stroke = max(1, round(10 * scale))
    left = round(42 * scale)
    top = round(31 * scale)
    right = round(91 * scale)
    bottom = round(97 * scale)
    draw.line((left, top, left, bottom), fill=(34, 197, 94, 255), width=stroke)
    draw.line((left, top, right, top), fill=(34, 197, 94, 255), width=stroke)
    draw.line((left, round(64 * scale), round(78 * scale), round(64 * scale)), fill=(34, 197, 94, 255), width=stroke)
    draw.line((right, top, right, round(52 * scale)), fill=(249, 115, 22, 255), width=stroke)
    draw.line((round(78 * scale), round(64 * scale), round(78 * scale), bottom), fill=(249, 115, 22, 255), width=stroke)

    image.save(OUT / f"icon-{size}.png", format="PNG", optimize=True)
