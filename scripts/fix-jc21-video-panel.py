"""Straighten only the panel in the original 10-second JC21 chrome video.

Install: python -m pip install pillow numpy imageio-ffmpeg
Run: python fix-jc21-video-panel.py --input sunford-jc21-chrome.mp4 \
       --panel panel-reference.png --output sunford-jc21-panel-fixed.mp4

The original video is decoded frame by frame. A single calibrated perspective
map replaces only the front-panel area; the rest of each decoded frame is copied
unchanged. No product, background, text, timing, camera or lighting is re-rendered.
The final MP4 uses high-quality H.264 encoding for browser compatibility.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import subprocess

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps


def coefficients(destination, source):
    rows, values = [], []
    for (x, y), (u, v) in zip(destination, source):
        rows.extend([[x, y, 1, 0, 0, 0, -u*x, -u*y],
                     [0, 0, 0, x, y, 1, -v*x, -v*y]])
        values.extend([u, v])
    return np.linalg.solve(np.asarray(rows), np.asarray(values)).tolist()


class PanelPatch:
    def __init__(self, reference):
        image = ImageOps.exif_transpose(Image.open(reference)).convert("RGB")
        if image.size != (1526, 490):
            raise ValueError("Use the supplied 1526x490 panel photograph")
        # Both stickers share one plane and one perspective. Their top and
        # bottom edges are horizontal in the existing product's front view.
        source = [(44, 40), (1494, 48), (1495, 439), (45, 444)]
        native = [(95, 421), (941, 421), (972, 648), (60, 648)]
        # Exact crop/scale/placement used to create the supplied chrome clip.
        target = [(451 + (x*2 - 58)*1018/1934,
                   396 + (y*2 - 212)*612/1164) for x, y in native]
        self.box = (480, 724, 1448, 970)
        x0, y0, x1, y1 = self.box
        local = [(x - x0, y - y0) for x, y in target]
        warped = image.transform((x1-x0, y1-y0), Image.Transform.PERSPECTIVE,
                                  coefficients(local, source), Image.Resampling.BICUBIC)
        self.linear = np.power(np.asarray(warped).astype(np.float32)/255, 2.2)
        mask = Image.new("L", warped.size)
        ImageDraw.Draw(mask).polygon(local, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(0.65))
        self.mask = np.asarray(mask).astype(np.float32)[:, :, None]/255
        self.support = self.mask[:, :, 0] > 0
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        self.xx = (xx - 451)/1018
        self.yy = (yy - 396)/612
        self.face = np.exp(-((self.yy - 0.69)/0.19)**4)
        self.falloff = 1 - 0.999*np.clip((self.yy - 0.86)/0.14, 0, 1)**0.8

    def apply(self, original, progress):
        phase = 2*math.pi*(progress % 1)
        light_x = 0.5 + 0.94*math.sin(phase)
        diagonal = self.xx + 0.17*(self.yy - 0.35)
        broad = np.exp(-((diagonal - light_x)/0.34)**2)
        reveal = 0.5 - 0.5*math.cos(phase)
        exposure = (0.10 + 0.23*reveal + 0.43*broad + 0.11*self.face)*self.falloff
        corrected = np.power(np.clip(self.linear*exposure[:, :, None], 0, 1), 1/2.2)*255
        output = original.copy()
        x0, y0, x1, y1 = self.box
        region = original[y0:y1, x0:x1]
        blended = np.clip(corrected*self.mask + region*(1-self.mask), 0, 255).astype(np.uint8)
        # Keep all pixels outside the actual patch support byte-identical.
        output[y0:y1, x0:x1][self.support] = blended[self.support]
        return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--panel", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--preview", action="store_true")
    args = parser.parse_args()
    if args.input.resolve() == args.output.resolve():
        parser.error("Output must differ from the original video")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    reader = imageio_ffmpeg.read_frames(str(args.input), pix_fmt="rgb24")
    metadata = next(reader)
    width, height = metadata["size"]
    fps, duration = metadata["fps"], metadata["duration"]
    if (width, height) != (1920, 1080) or abs(fps-30) > 0.01 or abs(duration-10) > 0.05:
        raise ValueError("This calibration is for the original 1920x1080, 30fps, 10-second chrome clip")
    patch = PanelPatch(args.panel)
    frame_count = round(fps*duration)
    outside = np.ones((height, width), dtype=bool)
    x0, y0, x1, y1 = patch.box
    outside[y0:y1, x0:x1][patch.support] = False
    command = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
               "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}",
               "-r", str(fps), "-i", "pipe:0", "-i", str(args.input),
               "-map", "0:v:0", "-map", "1:a?", "-map_metadata", "1",
               "-c:v", "libx264", "-preset", "medium", "-crf", "12",
               "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", str(args.output)]
    writer = None if args.preview else subprocess.Popen(command, stdin=subprocess.PIPE)
    count = 0
    try:
        for index, data in enumerate(reader):
            original = np.frombuffer(data, np.uint8).reshape(height, width, 3)
            fixed = patch.apply(original, index/frame_count)
            assert np.array_equal(original[outside], fixed[outside]), "Unexpected change outside panel"
            if index == 0:
                Image.fromarray(original).save(args.output.with_name("before.png"))
                Image.fromarray(fixed).save(args.output.with_suffix(".png"))
                crop = (465, 710, 1460, 985)
                comparison = Image.new("RGB", (crop[2]-crop[0], (crop[3]-crop[1])*2))
                comparison.paste(Image.fromarray(original).crop(crop), (0, 0))
                comparison.paste(Image.fromarray(fixed).crop(crop), (0, crop[3]-crop[1]))
                comparison.save(args.output.with_name("panel-before-after.png"))
            count += 1
            if args.preview:
                break
            writer.stdin.write(fixed.tobytes())
            if index % 30 == 0:
                print(f"Patched {index}/{frame_count} frames", flush=True)
        if writer:
            writer.stdin.close()
            if writer.wait():
                raise RuntimeError("Video encoding failed")
            if count != frame_count:
                raise RuntimeError(f"Expected {frame_count} frames; received {count}")
    except BaseException:
        if writer:
            writer.kill()
            writer.wait()
        raise
    finally:
        reader.close()
    report = {"input_sha256": hashlib.sha256(args.input.read_bytes()).hexdigest(),
              "size": [width, height], "fps": fps, "duration": duration,
              "processed_frames": count, "patch_bounds": patch.box,
              "outside_patch_unchanged_before_encoding": True}
    args.output.with_suffix(".json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"{'Preview' if args.preview else 'Video'} saved: {args.output}", flush=True)


if __name__ == "__main__":
    main()
