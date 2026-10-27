"""Render the JC21 with a single photographic panel and a seamless 3D yaw orbit.

python -m pip install bpy pillow numpy imageio-ffmpeg
python scripts/render-product-orbit.py --preview
python scripts/render-product-orbit.py
"""
from __future__ import annotations

import argparse
import importlib.util
import math
from pathlib import Path
import subprocess
import time

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("light", Path(__file__).with_name("render-product-light.py"))
light = importlib.util.module_from_spec(spec)
spec.loader.exec_module(light)


def material(name, color, metal=0, roughness=0.4):
    result = bpy.data.materials.new(name)
    node = result.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = (*color, 1)
    node.inputs["Metallic"].default_value = metal
    node.inputs["Roughness"].default_value = roughness
    return result


def profile(name, points, width, mat, parent):
    count = len(points)
    vertices = [(x, y, z) for x in [-width/2, width/2] for y, z in points]
    faces = [tuple(reversed(range(count))), tuple(range(count, count*2))]
    faces += [(i, (i+1) % count, (i+1) % count+count, i+count) for i in range(count)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj.parent = parent
    bevel = obj.modifiers.new("Soft molded edges", "BEVEL")
    bevel.width = 0.002
    bevel.segments = 4
    normals = obj.modifiers.new("Molded surface normals", "WEIGHTED_NORMAL")
    normals.keep_sharp = True
    return obj


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def correct_price_label(reference):
    """Replace the source photograph's typo with the user-approved Thai label."""
    image = reference.copy()
    pixels = np.asarray(image).copy()
    x0, x1, y0, y1 = 542, 596, 134, 179
    # Reconstruct the local blue gradient from clean pixels on either side.
    mix = np.linspace(0, 1, x1 - x0, dtype=np.float32)[None, :, None]
    left = pixels[y0:y1, x0 - 1:x0].astype(np.float32)
    right = pixels[y0:y1, x1:x1 + 1].astype(np.float32)
    pixels[y0:y1, x0:x1] = (left * (1 - mix) + right * mix).astype(np.uint8)
    image = Image.fromarray(pixels)
    font = ImageFont.truetype("C:/Windows/Fonts/leelawad.ttf", 35)
    bounds = font.getbbox("คงที่")
    word = Image.new("RGBA", (bounds[2] - bounds[0] + 4, bounds[3] - bounds[1] + 4))
    ImageDraw.Draw(word).text((2 - bounds[0], 2 - bounds[1]), "คงที่", font=font,
                              fill=(10, 38, 91, 255))
    word = word.resize((51, 35), Image.Resampling.LANCZOS)
    image.paste(word, (542, 139), word)
    return image


def setup(args, output):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(args.model.resolve()))
    root = next(o for o in bpy.data.objects if o.type == "EMPTY")
    root.rotation_mode = "XYZ"
    # The actual product has membrane keys. The earlier raised keycaps, LCD
    # overlays and invented side details would obscure the photographed layout.
    for obj in list(bpy.data.objects):
        if obj.name.startswith(("01 |", "02 |", "08 |", "09 |", "10 |", "11 |", "12 |", "13 |")):
            bpy.data.objects.remove(obj, do_unlink=True)
    white = material("Actual ivory upper case", (0.64, 0.66, 0.68), 0.06, 0.28)
    black = material("Black molded side base", (0.014, 0.017, 0.020), 0.05, 0.45)
    # Profiles follow the supplied side view: a white upper lip, sloped control
    # face, black wedge underneath, and a raised opening between the feet.
    profile("White upper housing", [(0.158, 0.080), (-0.050, 0.080),
            (-0.165, 0.029), (-0.165, 0.019), (-0.044, 0.066), (0.158, 0.065)],
            0.293, white, root)
    profile("Black base with side arch", [(0.155, 0.065), (-0.045, 0.066),
            (-0.156, 0.021), (-0.143, 0.010), (-0.115, 0.010),
            (-0.110, 0.012), (-0.106, 0.018), (-0.100, 0.023),
            (-0.092, 0.027), (-0.082, 0.029), (0.075, 0.029),
            (0.086, 0.027), (0.095, 0.022), (0.101, 0.016),
            (0.107, 0.012), (0.155, 0.012)],
            0.280, black, root)

    # One whole photograph, one quad, one UV map: both stickers share exactly
    # the same perspective and no independent shear can occur.
    reference = None
    tray_texture = None
    if args.source:
        original = Image.open(args.source).convert("RGB")
        if original.size != (2398, 1792):
            raise ValueError("The latest photographic calibration uses the supplied 2398x1792 source")
        original.save(output / "source.jpg", quality=100, subsampling=0)
        panel_quad = [(210, 950), (2194, 957), (2296, 1546), (107, 1536)]
        target = [(0, 0), (1800, 0), (1800, 580), (0, 580)]
        reference = original.transform((1800, 580), Image.Transform.PERSPECTIVE,
                                      light.perspective_coefficients(target, panel_quad),
                                      Image.Resampling.BICUBIC)
        tray_quad = [(505, 266), (1858, 268), (2219, 783), (184, 783)]
        tray_texture = original.transform((1600, 1200), Image.Transform.PERSPECTIVE,
                              light.perspective_coefficients([(0, 0), (1600, 0), (1600, 1200), (0, 1200)], tray_quad),
                              Image.Resampling.BICUBIC)
        tray_texture.save(output / "tray-texture.png")
    else:
        reference = Image.open(args.panel).convert("RGB")
    if args.source:
        reference = correct_price_label(reference)
    reference.save(output / "panel-texture.png")
    panel = next(o for o in bpy.data.objects if o.name.startswith("07 |"))
    panel_mat = material("Single exact photographic front panel", (1, 1, 1), 0, 0.53)
    nodes = panel_mat.node_tree.nodes
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(output / "panel-texture.png"))
    tex.interpolation = "Linear"
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Specular IOR Level"].default_value = 0.02
    bsdf.inputs["Roughness"].default_value = 0.80
    panel_mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    panel.data.materials.clear()
    panel.data.materials.append(panel_mat)
    for mat in bpy.data.materials:
        if mat.name.startswith("Tray |"):
            shader = mat.node_tree.nodes.get("Principled BSDF")
            shader.inputs["Roughness"].default_value = 0.20 if "rim" in mat.name else 0.29
    if tray_texture:
        deck = next(o for o in bpy.data.objects if o.name.startswith("06 |"))
        uv = deck.data.uv_layers.new(name="Actual photograph tray")
        xs = [v.co.x for v in deck.data.vertices]
        ys = [v.co.y for v in deck.data.vertices]
        for loop in deck.data.loops:
            co = deck.data.vertices[loop.vertex_index].co
            uv.data[loop.index].uv = ((co.x - min(xs)) / (max(xs) - min(xs)),
                                      (co.y - min(ys)) / (max(ys) - min(ys)))
        deck.data.uv_layers.active = uv
        mat = deck.data.materials[0]
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(str(output / "tray-texture.png"))
        mat.node_tree.links.new(tex.outputs["Color"], mat.node_tree.nodes.get("Principled BSDF").inputs["Base Color"])

    scene = bpy.context.scene
    scene.render.engine = args.engine
    scene.render.resolution_x = args.width
    scene.render.resolution_y = args.height
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.fps = args.fps
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = -2.3
    if args.engine == "CYCLES":
        scene.cycles.samples = args.samples
        scene.cycles.use_denoising = True
        scene.cycles.use_adaptive_sampling = True
        scene.cycles.adaptive_threshold = 0.05
        scene.cycles.max_bounces = 4
        scene.cycles.diffuse_bounces = 2
        scene.cycles.glossy_bounces = 3
        scene.render.use_persistent_data = True
    else:
        scene.eevee.taa_render_samples = args.samples

    world = bpy.data.worlds.new("Black studio ambient")
    world.node_tree.nodes.get("Background").inputs["Color"].default_value = (0.24, 0.27, 0.32, 1)
    world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.25
    scene.world = world
    for name, location, energy, size, size_y, color in [
        ("Left softbox", (-0.35, -0.20, 0.48), 14, 0.34, 0.60, (0.89, 0.94, 1.0)),
        ("Right strip", (0.40, -0.02, 0.32), 11, 0.09, 0.48, (1.0, 0.92, 0.83)),
        ("Overhead strip", (0.02, 0.15, 0.58), 18, 0.55, 0.08, (0.94, 0.97, 1.0)),
        ("Front fill", (0, -0.48, 0.25), 5, 0.45, 0.30, (1.0, 1.0, 1.0)),
        ("Tray reflection strip", (0, 0.50, 0.302), 8, 0.23, 0.055, (0.94, 0.97, 1.0)),
    ]:
        data = bpy.data.lights.new(name, "AREA")
        data.energy, data.shape, data.size, data.size_y = energy, "RECTANGLE", size, size_y
        data.color = color
        obj = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(obj)
        obj.location = location
        point_at(obj, (0, 0, 0.05))

    camera_data = bpy.data.cameras.new("Locked front camera")
    camera = bpy.data.objects.new("Locked front camera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (0, -0.50, 0.05 + 0.50 * math.tan(math.radians(30)))
    point_at(camera, (0, 0, 0.05))
    camera_data.type = "PERSP"
    camera_data.lens = 35
    scene.camera = camera
    bpy.context.view_layer.update()

    def projected_bounds():
        positions = [world_to_camera_view(scene, camera, o.matrix_world @ Vector(p))
                     for o in root.children_recursive if o.type == "MESH" for p in o.bound_box]
        return min(p.x for p in positions), max(p.x for p in positions), min(p.y for p in positions), max(p.y for p in positions)
    xmin, xmax, ymin, ymax = projected_bounds()
    camera_data.lens *= 0.46 / (xmax - xmin)
    bpy.context.view_layer.update()
    xmin, xmax, ymin, ymax = projected_bounds()
    center = (ymin + ymax) / 2
    camera_data.shift_y = 0.01
    bpy.context.view_layer.update()
    shifted = projected_bounds()
    response = ((shifted[2] + shifted[3]) / 2 - center) / 0.01
    camera_data.shift_y = (0.35 - center) / response
    bpy.context.view_layer.update()
    print("Product/camera bounds:", projected_bounds(), flush=True)
    return scene, root


def frame_product(scene, root):
    camera = scene.camera
    def bounds():
        points = [world_to_camera_view(scene, camera, o.matrix_world @ Vector(p))
                  for o in root.children_recursive if o.type == "MESH" for p in o.bound_box]
        return min(p.x for p in points), max(p.x for p in points), min(p.y for p in points), max(p.y for p in points)
    xmin, xmax, ymin, ymax = bounds()
    camera.data.lens *= 0.46 / (xmax - xmin)
    bpy.context.view_layer.update()
    xmin, xmax, ymin, ymax = bounds()
    center = (ymin + ymax) / 2
    old_shift = camera.data.shift_y
    camera.data.shift_y += 0.001
    bpy.context.view_layer.update()
    shifted = bounds()
    response = ((shifted[2] + shifted[3]) / 2 - center) / 0.001
    camera.data.shift_y = old_shift + (0.35 - center) / response
    bpy.context.view_layer.update()


def yaw_at(progress):
    # Zero angular velocity and acceleration at the front-view loop seam.
    return math.radians(38) * math.sin(2 * math.pi * (progress % 1)) ** 3


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--panel", type=Path, default=ROOT / "output/product-light-v2/panel-reference.png")
    parser.add_argument("--model", type=Path, default=ROOT / "public/models/acs30-jc21.glb")
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "output/product-light-v4")
    parser.add_argument("--width", type=int, default=1920)
    parser.add_argument("--height", type=int, default=1080)
    parser.add_argument("--duration", type=float, default=12)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--samples", type=int, default=16)
    parser.add_argument("--engine", default="BLENDER_EEVEE")
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--compose-only", action="store_true")
    parser.add_argument("--resume", action="store_true")
    args = parser.parse_args()
    output = args.output.resolve()
    frames = output / "frames"
    frames.mkdir(parents=True, exist_ok=True)
    count = round(args.duration * args.fps)
    indices = [0, count // 4, count // 2, count * 3 // 4] if args.preview else list(range(count))
    chrome = light.ChromeType("JC21", args.width, args.height)

    def composite(index, file):
        product = Image.open(file).convert("RGBA")
        background = Image.new("RGBA", (args.width, args.height), (0, 0, 0, 255))
        lettering = Image.fromarray(chrome.frame(index / count)).convert("RGBA")
        background.paste(lettering, (chrome.x, chrome.y))
        return Image.alpha_composite(background, product).convert("RGB")

    if not args.compose_only:
        scene, root = setup(args, output)
        for index in indices:
            raw = frames / f"{index:04d}.png"
            if raw.exists() and args.resume and not args.preview:
                continue
            root.rotation_euler.z = yaw_at(index / count)
            bpy.context.view_layer.update()
            frame_product(scene, root)
            scene.render.filepath = str(raw)
            start = time.time()
            bpy.ops.render.render(write_still=True)
            if args.preview:
                composite(index, raw).save(output / f"preview-{index:04d}.jpg", quality=96)
            print(f"FRAME {index + 1}/{count}: {time.time() - start:.2f}s", flush=True)
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=str(output / "jc21-orbit.blend"))
    if args.preview:
        return

    video = output / "sunford-jc21-orbit.mp4"
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{args.width}x{args.height}",
           "-r", str(args.fps), "-i", "pipe:0", "-an", "-c:v", "libx264", "-preset", "medium",
           "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(video)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    try:
        for index in range(count):
            image = composite(index, frames / f"{index:04d}.png")
            if index == 0:
                image.save(video.with_suffix(".jpg"), quality=96)
            proc.stdin.write(image.tobytes())
        proc.stdin.close()
        if proc.wait():
            raise RuntimeError("Video encoding failed")
    except BaseException:
        proc.kill()
        proc.wait()
        raise
    print(f"SAVED {video}", flush=True)


if __name__ == "__main__":
    main()
