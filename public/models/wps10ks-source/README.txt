WPS10KS — editable source

Measured product envelope: 200 x 275 x 110 mm; pan 200 x 160 mm.
Two-sided green LED display; front UNIT / ON-OFF / TARE / ZERO membrane printing.
Reference: user-supplied front three-quarter and rear photos, plus matching catalog photographs already in this project.
Unmeasured radii, carry-pocket depth and construction details are estimated from those views.

Generate artwork (Python + Pillow; macOS Arial fonts):
python3 public/models/wps10ks-source/make_labels.py

Build and render (Blender 5.2):
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python public/models/wps10ks-source/build_model.py

Check dimensions and the self-contained web export:
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python public/models/wps10ks-source/verify_model.py

build_model.py preserves an editable native part hierarchy and exports a temporary evaluated combined mesh.
The combined export shares material primitives, UVs and custom normals; studio lights and camera are excluded.
The GLB embeds both printed textures. Its only emissive material is the green LED readout.
The four front membrane buttons share a single printed surface to avoid coincident faces on WebGL renderers.

Deliverables: outputs/wps10ks/
Web asset: public/models/wps10ks.glb (copy the final export here after rebuilding).
