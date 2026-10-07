#!/usr/bin/env python3
"""Compose a per-topic Open Graph preview image onto assets/img/og-template.svg.

A shared link should look like a real product, not a bare URL, so every topic
gets its own social card carrying the topic name, its ATT&CK or exam id, the
theme and the difficulty.

The SVG template owns the design. Python only does the parts a static SVG
cannot: wrapping a long title onto several lines, and sizing the badge pills to
fit their text. The template therefore stays editable by hand without touching
this script.

Template tokens that get substituted on every run:

    {{WIDTH}} {{HEIGHT}}     canvas size, from --width / --height
    {{ACCENT}}               accent colour, chosen from the topic type
    {{TITLE_BLOCK}}          one <text> element per wrapped title line
    {{EXTERNAL_ID_BLOCK}}    the id chip, or nothing when the topic has no id
    {{BADGE_BLOCK}}          theme, type and difficulty pills
    {{TITLE}} {{EXTERNAL_ID}} {{THEME}} {{TYPE}} {{DIFFICULTY}}   escaped text

Output format, and the honest tradeoff:

  * Default output is SVG: a few KB each, crisp at any size, and almost no
    GitHub Pages bandwidth against the 100 GB per month soft limit.
  * Caveat: Facebook, LinkedIn and X do not render SVG in link previews, so
    those platforms fall back to no image. Run with --png to additionally
    write PNGs, which needs Pillow. Pillow is optional and is the single
    optional extra in scripts/requirements.txt; without it the script says so
    and still writes the SVG rather than failing the build.

Standard library otherwise. Python 3.8+.

Usage:
    python scripts/generate_og.py
    python scripts/generate_og.py --png
    python scripts/generate_og.py --only t1059
"""

from __future__ import annotations

import argparse
import json
import sys
import textwrap
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent
CATALOG_PATH = ROOT / "data" / "catalog.json"
TEMPLATE_PATH = ROOT / "assets" / "img" / "og-template.svg"
OUT_DIR = ROOT / "assets" / "img" / "og"

FONT_STACK = "system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
MONO_STACK = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"

TYPE_LABEL = {
    "keyword": "KEYWORD",
    "certification": "CERTIFICATION",
    "tactic": "ATT&CK TACTIC",
    "technique": "ATT&CK TECHNIQUE",
    "mitigation": "ATT&CK MITIGATION",
    "detection": "DETECTION STRATEGY",
    "group": "ATT&CK GROUP",
}

ACCENT_BY_TYPE = {
    "keyword": "#22d3ee",
    "certification": "#fbbf24",
    "tactic": "#f87171",
    "technique": "#22d3ee",
    "mitigation": "#34d399",
    "detection": "#818cf8",
    "group": "#fbbf24",
}


def esc(value) -> str:
    return xml_escape(str(value if value is not None else ""))


def wrap_title(title: str, max_lines: int = 3) -> list[str]:
    """Wrap to at most three lines, shrinking the wrap width for long titles."""
    text = str(title or "").strip()
    if len(text) <= 34:
        lines = textwrap.wrap(text, width=30, break_long_words=True)
    else:
        lines = textwrap.wrap(text, width=26, break_long_words=True)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(".,;: ") + "..."
    return lines or [""]


def title_block(topic: dict, width: int, height: int) -> str:
    lines = wrap_title(topic.get("title", ""))
    scale = width / 1200.0
    if len(lines) <= 2:
        font_size = 62 * scale
        line_height = 78 * scale
    else:
        font_size = 52 * scale
        line_height = 66 * scale
    # Vertically centre the block around 46 percent of the canvas height.
    block_height = line_height * (len(lines) - 1)
    start_y = height * 0.46 - block_height / 2
    parts = []
    for index, line in enumerate(lines):
        parts.append(
            f'<text x="{90 * scale:.1f}" y="{start_y + index * line_height:.1f}" '
            f'font-family="{FONT_STACK}" font-size="{font_size:.1f}" font-weight="700" '
            f'fill="#e8f1fb">{esc(line)}</text>'
        )
    return "\n  ".join(parts)


def external_id_block(topic: dict, width: int, accent: str) -> str:
    """The id chip. Takes the accent colour directly rather than emitting the
    {{ACCENT}} token, because token substitution is single-pass: a token
    produced by an earlier substitution would never be resolved."""
    external_id = topic.get("externalId") or ""
    if not external_id:
        return ""
    scale = width / 1200.0
    return (
        f'<text x="{width - 90 * scale:.1f}" y="{112 * scale:.1f}" text-anchor="end" '
        f'font-family="{MONO_STACK}" font-size="{40 * scale:.1f}" font-weight="700" '
        f'fill="{accent}">{esc(external_id)}</text>'
    )


def badge_block(topic: dict, width: int, height: int, accent: str) -> str:
    scale = width / 1200.0
    entries = [
        (TYPE_LABEL.get(topic.get("type", "keyword"), "STUDY TOPIC"), accent),
        (str(topic.get("theme", "")).upper(), "#7e95ae"),
        (str(topic.get("difficulty", "extreme")).replace("-", " ").upper(), "#b3c6db"),
    ]
    x = 90 * scale
    y = height - 118 * scale
    parts = []
    for text_value, colour in entries:
        if not text_value:
            continue
        pill_width = (len(text_value) * 11.4 + 34) * scale
        pill_height = 34 * scale
        parts.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{pill_width:.1f}" height="{pill_height:.1f}" '
            f'rx="{pill_height / 2:.1f}" fill="none" stroke="{colour}" stroke-width="1.5" opacity="0.85"/>'
            f'<text x="{x + pill_width / 2:.1f}" y="{y + 22.5 * scale:.1f}" text-anchor="middle" '
            f'font-family="{MONO_STACK}" font-size="{15 * scale:.1f}" font-weight="700" '
            f'fill="{colour}">{esc(text_value)}</text>'
        )
        x += pill_width + 12 * scale
    return "\n  ".join(parts)


def compose(topic: dict, template: str, width: int, height: int) -> str:
    accent = ACCENT_BY_TYPE.get(topic.get("type", "keyword"), "#22d3ee")
    scale = width / 1200.0
    replacements = {
        "{{WIDTH}}": str(width),
        "{{HEIGHT}}": str(height),
        "{{ACCENT}}": accent,
        "{{RULE_Y}}": f"{472 * scale:.1f}",
        "{{FOOTER_Y}}": f"{height - 62 * scale:.1f}",
        "{{MARGIN}}": f"{90 * scale:.1f}",
        "{{TITLE_BLOCK}}": title_block(topic, width, height),
        "{{EXTERNAL_ID_BLOCK}}": external_id_block(topic, width, accent),
        "{{BADGE_BLOCK}}": badge_block(topic, width, height, accent),
        "{{TITLE}}": esc(topic.get("title", "")),
        "{{EXTERNAL_ID}}": esc(topic.get("externalId") or topic.get("id", "")),
        "{{THEME}}": esc(topic.get("theme", "")),
        "{{TYPE}}": esc(TYPE_LABEL.get(topic.get("type", "keyword"), "STUDY TOPIC")),
        "{{DIFFICULTY}}": esc(str(topic.get("difficulty", "extreme")).upper()),
    }
    out = template
    for token, value in replacements.items():
        out = out.replace(token, value)
    return out


def write_png(topic: dict, png_path: Path, width: int, height: int) -> bool:
    """Raster fallback for platforms that ignore SVG previews.

    Pillow cannot render SVG, so the PNG is drawn from the same parameters
    rather than converted. Returns False when Pillow is not installed, which
    the caller reports honestly instead of failing the build.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont  # type: ignore
    except ImportError:
        return False

    accent = ACCENT_BY_TYPE.get(topic.get("type", "keyword"), "#22d3ee")
    scale = width / 1200.0
    image = Image.new("RGB", (width, height), "#070d16")
    draw = ImageDraw.Draw(image)

    for y in range(height):
        ratio = y / max(height - 1, 1)
        draw.line(
            [(0, y), (width, y)],
            fill=(
                int(7 + (16 - 7) * ratio),
                int(13 + (29 - 13) * ratio),
                int(22 + (46 - 22) * ratio),
            ),
        )
    draw.rectangle([0, 0, width, max(3, int(7 * scale))], fill=accent)

    def font(size, bold=False):
        for candidate in (
            "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
            else "/System/Library/Fonts/Supplemental/Arial.ttf",
        ):
            try:
                return ImageFont.truetype(candidate, max(10, int(size)))
            except OSError:
                continue
        return ImageFont.load_default()

    draw.text((90 * scale, 74 * scale), "CyberMastery", font=font(34 * scale, True), fill="#e8f1fb")
    if topic.get("externalId"):
        draw.text((width - 90 * scale, 78 * scale), topic["externalId"],
                  font=font(40 * scale, True), fill=accent, anchor="ra")

    lines = wrap_title(topic.get("title", ""))
    size = 62 if len(lines) <= 2 else 52
    line_height = (78 if len(lines) <= 2 else 66) * scale
    block_height = line_height * (len(lines) - 1)
    y = height * 0.46 - block_height / 2 - (size * scale) / 2
    for line in lines:
        draw.text((90 * scale, y), line, font=font(size * scale, True), fill="#e8f1fb")
        y += line_height

    draw.line([(90 * scale, height - 158 * scale), (width - 90 * scale, height - 158 * scale)],
              fill="#1e3350", width=max(1, int(2 * scale)))
    draw.text((90 * scale, height - 116 * scale),
              TYPE_LABEL.get(topic.get("type", ""), "STUDY TOPIC"),
              font=font(17 * scale, True), fill=accent)
    draw.text((90 * scale, height - 62 * scale), "3 hands-on exercise batches",
              font=font(19 * scale), fill="#7e95ae")
    draw.text((width - 90 * scale, height - 62 * scale),
              "Free, non-commercial, community-built study material",
              font=font(19 * scale), fill="#7e95ae", anchor="ra")

    image.save(png_path, "PNG", optimize=True)
    return True


def write_icons() -> tuple[int, bool]:
    """Write the PWA icon PNGs next to their SVG originals.

    Pillow cannot rasterise SVG, so the shield is drawn from the same
    coordinates as assets/img/icon-*.svg rather than converted. The SVGs stay
    the source of truth and these PNGs exist only for the platforms that will
    not accept an SVG manifest icon.

    Returns (count written, whether Pillow was available).
    """
    try:
        from PIL import Image, ImageDraw, ImageFont  # type: ignore
    except ImportError:
        return 0, False

    img_dir = ROOT / "assets" / "img"
    img_dir.mkdir(parents=True, exist_ok=True)
    written = 0

    def shield(draw, cx, cy, size, fill, edge, tick, tick_width) -> None:
        """Draw the CyberMastery shield centred on (cx, cy).

        Pillow cannot rasterise SVG, so this redraws the same geometry in
        Pillow primitives. The SVG files remain the source of truth.
        """
        half = size / 2
        top = cy - half
        bottom = cy + half
        shoulder = top + half * 0.30
        # Shield outline as a polygon: wide shoulders tapering to a point.
        points = [
            (cx, top),
            (cx + half * 0.86, top + half * 0.20),
            (cx + half * 0.86, cy + half * 0.10),
            (cx, bottom),
            (cx - half * 0.86, cy + half * 0.10),
            (cx - half * 0.86, top + half * 0.20),
        ]
        draw.polygon(points, fill=fill, outline=edge, width=max(2, int(size * 0.03)))
        # Tick mark.
        draw.line(
            [(cx - half * 0.36, shoulder + half * 0.22),
             (cx - half * 0.06, shoulder + half * 0.52),
             (cx + half * 0.44, shoulder - half * 0.10)],
            fill=tick, width=tick_width, joint="curve",
        )

    specs = [
        ("icon-192.png", 192, 2.9, 0.62, False),
        ("icon-512.png", 512, 2.9, 0.62, False),
        ("icon-maskable.png", 512, 2.1, 0.60, True),
    ]
    for filename, size, shield_scale, tick_scale, maskable in specs:
        image = Image.new("RGB", (size, size), "#070d16")
        draw = ImageDraw.Draw(image)
        if maskable:
            # Launchers crop maskable icons, so keep the mark inside the safe
            # zone: a 205/256 radius disc on a plain background.
            draw.ellipse(
                [size * 0.10, size * 0.10, size * 0.90, size * 0.90],
                fill="#0b1420",
            )
        half = size / (2 * shield_scale)
        shield(
            draw,
            cx=size / 2,
            cy=size / 2,
            size=half * 2,
            fill="#0e2a38",
            edge="#22d3ee",
            tick="#22d3ee",
            tick_width=max(3, int(size * tick_scale * 0.07)),
        )
        image.save(img_dir / filename, "PNG", optimize=True)
        written += 1

    # Default Open Graph card, used by every page that is not a single topic.
    width, height = 1200, 630
    default = Image.new("RGB", (width, height), "#070d16")
    draw = ImageDraw.Draw(default)

    def load_font(size, bold=False):
        for candidate in (
            "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
            else "/System/Library/Fonts/Supplemental/Arial.ttf",
        ):
            try:
                return ImageFont.truetype(candidate, max(10, int(size)))
            except OSError:
                continue
        return ImageFont.load_default()

    for y in range(height):
        ratio = y / (height - 1)
        draw.line(
            [(0, y), (width, y)],
            fill=(int(7 + 9 * ratio), int(13 + 16 * ratio), int(22 + 24 * ratio)),
        )
    draw.rectangle([0, 0, width, 7], fill="#22d3ee")
    draw.ellipse([60, 40, 260, 200], fill="#0b1420")
    shield(draw, cx=110, cy=104, size=64, fill="#0e2a38", edge="#22d3ee", tick="#22d3ee", tick_width=8)
    draw.text((146, 88), "CyberMastery", font=load_font(36, True), fill="#e8f1fb")
    draw.text((90, 250), "Master cyber security theory", font=load_font(64, True), fill="#e8f1fb")
    draw.text((90, 330), "through hard practice.", font=load_font(64, True), fill="#22d3ee")
    draw.line([(90, 424), (width - 90, 424)], fill="#1e3350", width=2)
    draw.text((90, 462), "246 STUDY TOPICS", font=load_font(19, True), fill="#22d3ee")
    draw.text((330, 462), "3 EXERCISE BATCHES EACH", font=load_font(19, True), fill="#b3c6db")
    draw.text((680, 462), "NO TRACKING", font=load_font(19, True), fill="#b3c6db")
    draw.text((90, 520),
              "SOC analysts, incident responders, threat hunters, GRC, pentesters, cloud engineers, students",
              font=load_font(20), fill="#7e95ae")
    draw.text((width - 90, 556), "Community-built, non-commercial",
              font=load_font(20), fill="#7e95ae", anchor="ra")
    default.save(img_dir / "og-default.png", "PNG", optimize=True)
    written += 1

    return written, True


def main():
    parser = argparse.ArgumentParser(description="Generate per-topic Open Graph preview images.")
    parser.add_argument("--only", default=None, help="Generate a single topic id.")
    parser.add_argument("--width", type=int, default=1200)
    parser.add_argument("--height", type=int, default=630)
    parser.add_argument("--png", action="store_true", help="Also write PNGs (needs Pillow).")
    parser.add_argument("--icons", action="store_true",
                        help="Also write the PWA icon PNGs (needs Pillow) and exit.")
    args = parser.parse_args()

    if args.icons:
        count, available = write_icons()
        if not available:
            print("PWA icon PNGs need Pillow, which is not installed.")
            print("The SVG icons in assets/img/ are already referenced by manifest.json")
            print("and are sufficient on Chrome, Edge and Android. Install Pillow with:")
            print("  python -m pip install -r scripts/requirements.txt")
            return 0
        print(f"Wrote {count} PWA icon PNG(s) to assets/img/")
        return 0

    if not CATALOG_PATH.exists():
        print("FAIL: data/catalog.json is missing. Run: python scripts/build_catalog.py", file=sys.stderr)
        return 1
    if not TEMPLATE_PATH.exists():
        print(f"FAIL: missing template {TEMPLATE_PATH.relative_to(ROOT)}", file=sys.stderr)
        return 1

    topics = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))["topics"]
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    targets = [t for t in topics if not args.only or t["id"] == args.only]
    if args.only and not targets:
        print(f"FAIL: no topic with id '{args.only}'", file=sys.stderr)
        return 1

    png_ok = True
    png_written = 0
    for topic in targets:
        svg = compose(topic, template, args.width, args.height)
        (OUT_DIR / f"{topic['id']}.svg").write_text(svg, encoding="utf-8")
        if args.png and png_ok:
            if write_png(topic, OUT_DIR / f"{topic['id']}.png", args.width, args.height):
                png_written += 1
            else:
                png_ok = False

    total = sum(p.stat().st_size for p in OUT_DIR.glob("*.svg"))
    count = max(len(list(OUT_DIR.glob("*.svg"))), 1)
    print(f"Wrote {len(targets)} OG image(s) to assets/img/og/")
    print(f"Total SVG size {total / 1024:.1f} KB, about {total / count:.0f} bytes each")
    if args.png:
        if png_written:
            print(f"Also wrote {png_written} PNG file(s) with Pillow.")
        else:
            print("PNG output requested but Pillow is not installed, so only SVG was written.")
            print("Install it with:  python -m pip install -r scripts/requirements.txt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
