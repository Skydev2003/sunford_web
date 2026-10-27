Reusable multi-product rotation source

Live player / config: outputs/sunford-multi-scale/
Current timeline: 32 seconds, 24 fps, 1920x1080 RGBA, two products.
The slow revision preserves the original path and reduces angular and camera speed by half.

Regenerate after changing products.json:
node public/videos/multi-scale-source/prepare_timeline.mjs
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python public/videos/multi-scale-source/build_animation.py
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python public/videos/multi-scale-source/render_animation.py

Use a new/empty work/multi-scale/frames directory after changing config or geometry.
The renderer skips existing PNGs, allowing interrupted jobs to resume.
For the slow revision only, old validated frames were mapped to odd frame indices because the new camera and rotation path is exactly a 2x retiming. All missing intermediate poses were then rendered natively.

The Blender builder creates one view layer and animated weight per product.
It sums the premultiplied R, G, B and A channels independently, preserving true alpha through a dissolve.
Native tests cover two and three-product configurations. The browser player supports the same playlist concept and adjusts its fit for the viewport.

SUNFORD_SEQUENCE_OUT and SUNFORD_SEQUENCE_WORK can select isolated test directories.
SUNFORD_SEQUENCE_PROOF_FRAMES can select a comma-separated list of still frames.
