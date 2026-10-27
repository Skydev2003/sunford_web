"""Render a seamless studio light sweep from an actual front-facing product photo.

Setup: python -m pip install pillow numpy imageio-ffmpeg
Example:
  python scripts/render-product-light.py --source path/to/product.jpg

The source pixels supply all product detail, including an optional photographed
panel reference. Optional chrome lettering is placed behind the product.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path
import subprocess

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageFont


ROOT = Path(__file__).resolve().parents[1]


def perspective_coefficients(destination, source):
    rows, values = [], []
    for (x, y), (u, v) in zip(destination, source):
        rows.extend([[x, y, 1, 0, 0, 0, -u*x, -u*y],
                     [0, 0, 0, x, y, 1, -v*x, -v*y]])
        values.extend([u, v])
    return np.linalg.solve(np.asarray(rows), np.asarray(values)).tolist()


def apply_panel_reference(image: Image.Image, reference: Path) -> Image.Image:
    """Project the two real photographed stickers onto the existing front face.

    Coordinates are calibrated for the supplied 1024x765 whole-product photo
    and the supplied 1526x490 close-up. No labels or numbers are re-typeset.
    """
    if image.size != (1024, 765):
        raise ValueError("Panel calibration requires the original 1024x765 product photo")
    detail = ImageOps.exif_transpose(Image.open(reference)).convert("RGB")
    if detail.size != (1526, 490):
        raise ValueError("Panel calibration requires the supplied 1526x490 panel reference")
    scale = 2
    result = image.resize((image.width * scale, image.height * scale), Image.Resampling.LANCZOS)
    panels = [
        ([(44, 40), (873, 44), (873, 443), (45, 444)],
         [(97, 422), (568, 422), (577, 646), (62, 645)]),
        ([(898, 46), (1494, 48), (1495, 439), (897, 440)],
         [(587, 426), (939, 428), (970, 649), (579, 646)]),
    ]
    for source_quad, target_quad in panels:
        target = [(x * scale, y * scale) for x, y in target_quad]
        warped = detail.transform(result.size, Image.Transform.PERSPECTIVE,
                                  perspective_coefficients(target, source_quad),
                                  Image.Resampling.BICUBIC)
        mask = Image.new("L", result.size)
        ImageDraw.Draw(mask).polygon(target, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(0.9))
        result.paste(warped, (0, 0), mask)
    return result


def cutout(source: Path, panel_reference: Path | None = None) -> Image.Image:
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    pixels = np.asarray(image)
    # Remove only pale pixels connected to the outside, preserving white labels.
    pale = (pixels.min(axis=2) > 245) & (np.ptp(pixels, axis=2) < 18)
    flood = Image.fromarray(np.where(pale, 255, 0).astype(np.uint8)).copy()
    for point in [(0, 0), (image.width - 1, 0), (0, image.height - 1),
                  (image.width - 1, image.height - 1)]:
        ImageDraw.floodfill(flood, point, 128, thresh=0)
    alpha = Image.fromarray(np.where(np.asarray(flood) == 128, 0, 255).astype(np.uint8))
    # Slight inward feather removes the photographed white fringe.
    alpha = alpha.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.65))
    if panel_reference:
        image = apply_panel_reference(image, panel_reference)
        alpha = alpha.resize(image.size, Image.Resampling.LANCZOS)
    image.putalpha(alpha)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("No product was found in the source image")
    return image.crop(bounds)


class ChromeType:
    def __init__(self, text: str, width: int, height: int):
        self.width = round(width * 0.82)
        self.height = round(height * 0.44)
        self.x = (width - self.width) // 2
        self.y = round(height * 0.17)
        font_path = Path("C:/Windows/Fonts/ariblk.ttf")
        if not font_path.exists():
            raise FileNotFoundError("Chrome type requires C:/Windows/Fonts/ariblk.ttf")
        font = ImageFont.truetype(str(font_path), 700)
        bounds = font.getbbox(text)
        mask = Image.new("L", (bounds[2] - bounds[0] + 36, bounds[3] - bounds[1] + 36))
        ImageDraw.Draw(mask).text((18 - bounds[0], 18 - bounds[1]), text, font=font, fill=255,
                                  stroke_width=2)
        mask = mask.crop(mask.getbbox()).resize((self.width - 24, self.height - 24),
                                                Image.Resampling.LANCZOS)
        padded = Image.new("L", (self.width, self.height))
        padded.paste(mask, (12, 12))
        self.alpha = np.asarray(padded).astype(np.float32) / 255
        blurred = np.asarray(padded.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
        gy, gx = np.gradient(blurred)
        self.nx, self.ny = -gx * 22, -gy * 22
        self.edge = np.clip(np.hypot(self.nx, self.ny), 0, 1)
        self.yy, self.xx = np.mgrid[0:self.height, 0:self.width].astype(np.float32)
        self.xx /= self.width
        self.yy /= self.height
        self.glow = np.asarray(padded.filter(ImageFilter.GaussianBlur(7))).astype(np.float32) / 255

    def frame(self, progress):
        phase = 2 * math.pi * progress
        horizon = 0.48 + 0.10 * np.sin(self.xx * 11 + phase) + 0.11 * self.nx
        distance = self.yy - horizon
        # A reflected studio horizon: dark steel above, silver below,
        # with adjacent cool and warm bands like the supplied chrome reference.
        silver = 0.08 + 0.55 / (1 + np.exp(-distance * 15))
        band = np.exp(-(distance / 0.065) ** 2)
        cool = np.exp(-((distance + 0.045) / 0.038) ** 2)
        warm = np.exp(-((distance - 0.055) / 0.045) ** 2)
        moving = 0.7 + 0.3 * np.cos(self.xx * 8 - phase)
        shade = silver + band * 0.48 * moving
        rgb = np.repeat(shade[:, :, None], 3, axis=2)
        rgb += cool[:, :, None] * np.array([0.09, 0.21, 0.29])
        rgb += warm[:, :, None] * np.array([0.19, 0.12, 0.05])
        bevel = self.edge * np.clip(0.36 + self.nx * 0.28 - self.ny * 0.55, 0, 0.85)
        rgb += bevel[:, :, None] * np.array([0.75, 0.86, 1.0])
        rgb = np.clip(rgb, 0, 1) * self.alpha[:, :, None]
        rgb += (self.glow * (1 - self.alpha) * 0.055)[:, :, None]
        return np.clip(rgb * 255, 0, 255).astype(np.uint8)


class Studio:
    def __init__(self, source: Path, width: int, height: int,
                 panel_reference: Path | None = None, lettering: str | None = None,
                 product_scale: float = 0.71):
        self.width, self.height = width, height
        product = cutout(source, panel_reference)
        factor = min(width * product_scale / product.width, height * 0.73 / product.height)
        product = product.resize((round(product.width * factor), round(product.height * factor)),
                                 Image.Resampling.LANCZOS)
        self.product = product
        self.x = (width - product.width) // 2
        self.y = round(height * (0.65 if lettering else 0.51) - product.height * 0.5)
        self.lettering = ChromeType(lettering, width, height) if lettering else None
        rgba = np.asarray(product).astype(np.float32) / 255
        self.rgb = rgba[:, :, :3]
        self.alpha = rgba[:, :, 3:4]
        self.linear = np.power(self.rgb, 2.2)
        self.yy, self.xx = np.mgrid[0:product.height, 0:product.width].astype(np.float32)
        self.xx /= product.width
        self.yy /= product.height
        neutral = 1 - np.clip(np.ptp(self.rgb, axis=2) * 4, 0, 1)
        self.metal = neutral * np.clip((0.51 - self.yy) / 0.045, 0, 1)
        # Retain a readable face while allowing the lower casing to fall into black.
        self.falloff = 1 - 0.999 * np.clip((self.yy - 0.86) / 0.14, 0, 1) ** 0.8
        self.face = np.exp(-((self.yy - 0.69) / 0.19) ** 4)
        mask = product.getchannel("A")
        eroded = mask.filter(ImageFilter.MinFilter(5))
        self.rim = np.clip((np.asarray(mask).astype(np.float32)
                           - np.asarray(eroded).astype(np.float32)) / 255, 0, 1)

    def frame(self, progress: float) -> np.ndarray:
        progress %= 1.0
        phase = 2 * math.pi * progress
        # A periodic orbit gives identical lighting at the loop boundary.
        light_x = 0.5 + 0.94 * math.sin(phase)
        diagonal = self.xx + 0.17 * (self.yy - 0.35)
        broad = np.exp(-((diagonal - light_x) / 0.34) ** 2)
        strip = np.exp(-((diagonal - light_x) / 0.065) ** 2)
        reveal = 0.5 - 0.5 * math.cos(phase)
        exposure = (0.10 + 0.23 * reveal + 0.43 * broad + 0.11 * self.face)
        exposure *= self.falloff
        color = self.linear * exposure[:, :, None]
        # Softbox highlights are restricted to the actual neutral steel tray.
        specular = (0.34 * strip + 0.035 * broad) * self.metal * self.falloff
        tint = np.array([0.88, 0.94, 1.0], dtype=np.float32)
        color += specular[:, :, None] * tint
        color += (self.rim * (0.008 + 0.15 * broad)
                  * np.clip((0.9 - self.yy) / 0.4, 0, 1))[:, :, None] * tint
        color = np.power(np.clip(color, 0, 1), 1 / 2.2) * self.alpha
        canvas = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        if self.lettering:
            text = self.lettering
            canvas[text.y:text.y + text.height, text.x:text.x + text.width] = text.frame(progress)
        background = canvas[self.y:self.y + self.product.height, self.x:self.x + self.product.width]
        canvas[self.y:self.y + self.product.height, self.x:self.x + self.product.width] = (
            np.clip(color * 255 + background * (1 - self.alpha), 0, 255).astype(np.uint8))
        return canvas


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path,
                        default=ROOT / "output/product-light/sunford-jc21-light-sweep.mp4")
    parser.add_argument("--width", type=int, default=1920)
    parser.add_argument("--height", type=int, default=1080)
    parser.add_argument("--duration", type=float, default=10)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--stills-only", action="store_true")
    parser.add_argument("--panel-reference", type=Path)
    parser.add_argument("--lettering")
    parser.add_argument("--product-scale", type=float, default=0.71)
    args = parser.parse_args()
    if min(args.width, args.height, args.duration, args.fps) <= 0:
        parser.error("Dimensions, duration and frame rate must be positive")
    if args.width % 2 or args.height % 2:
        parser.error("Width and height must be even for H.264")
    if not 0 < args.product_scale <= 0.85:
        parser.error("Product scale must be between 0 and 0.85")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    scene = Studio(args.source, args.width, args.height, args.panel_reference,
                   args.lettering, args.product_scale)
    scene.product.save(args.output.with_name("sunford-jc21-cutout.png"))
    for index, progress in enumerate([0, 0.125, 0.25, 0.5, 0.625, 0.75]):
        Image.fromarray(scene.frame(progress)).save(args.output.with_name(f"still-{index}.jpg"), quality=95)
    Image.fromarray(scene.frame(0)).save(args.output.with_suffix(".jpg"), quality=95)
    assert np.array_equal(scene.frame(0), scene.frame(1)), "Loop boundary must match"
    if args.stills_only:
        return
    frames = round(args.duration * args.fps)
    command = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
               "-f", "rawvideo", "-vcodec", "rawvideo", "-pix_fmt", "rgb24",
               "-s", f"{args.width}x{args.height}", "-r", str(args.fps), "-i", "pipe:0",
               "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
               "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(args.output)]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for index in range(frames):
            process.stdin.write(scene.frame(index / frames).tobytes())
            if index % args.fps == 0:
                print(f"Rendered {index // args.fps}/{args.duration:g} seconds", flush=True)
        process.stdin.close()
        code = process.wait()
        if code:
            raise RuntimeError(f"FFmpeg failed with exit code {code}")
    except BaseException:
        process.kill()
        process.wait()
        raise
    print(f"Saved {args.output.resolve()} ({args.output.stat().st_size:,} bytes)", flush=True)


if __name__ == "__main__":
    main()
