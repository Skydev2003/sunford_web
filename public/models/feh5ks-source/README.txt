FEH5KS visual reconstruction — Blender 5.2, metres

Measured-envelope target from the user table: 180 x 240 x 80 mm.
Pan orientation follows the catalog arrow image: approximately 170 mm across the front, 140 mm deep.
The detailed catalog values are 175 mm body width and 168 mm pan width; this reconstruction uses the rounded 180 and 170 mm values supplied in the user image.
The shape, inactive LCD, membrane printing and pressed pan follow the photographs.
Unmeasured radii, stamped depth and port construction are visual estimates.

Generate the editable printed artwork (Python + Pillow, macOS Arial fonts):
python3 public/models/feh5ks-source/make_labels.py

Build and render:
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python public/models/feh5ks-source/build_model.py

Check exported dimensions, packed texture and reimported GLB:
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python public/models/feh5ks-source/verify_model.py

Outputs: outputs/feh5ks/
Copy the verified feh5ks.glb to public/models/feh5ks.glb after rebuilding.
The web export merges evaluated parts, retains material primitives, UVs and custom normals, and excludes the studio.
The membrane buttons share the single front printing surface; the inactive LCD is separate glass geometry.
