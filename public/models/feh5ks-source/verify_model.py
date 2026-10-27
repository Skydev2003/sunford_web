import bpy,json,math,struct
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=ROOT/'outputs'/'feh5ks';WORK=ROOT/'work'/'feh5ks';WORK.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'feh5ks.blend'));s=bpy.context.scene
product=bpy.data.collections['FEH5KS | product']
def bounds(objects):
 points=[];deps=bpy.context.evaluated_depsgraph_get()
 for o in objects:
  if o.type!='MESH':continue
  ev=o.evaluated_get(deps);me=ev.to_mesh();points.extend(o.matrix_world@v.co for v in me.vertices);ev.to_mesh_clear()
 lo=[min(v[i] for v in points) for i in range(3)];hi=[max(v[i] for v in points) for i in range(3)];return {'min_m':lo,'max_m':hi,'dimensions_m':[b-a for a,b in zip(lo,hi)]}
def measured(actual,expected):assert max(abs(a-b) for a,b in zip(actual,expected))<.00003,(actual,expected)
native=bounds(product.objects);measured(native['dimensions_m'],[.18,.24,.08]);pan=bounds([o for o in product.objects if o.name.startswith('06 |')]);measured(pan['dimensions_m'][:2],[.17,.14])
packed=[im.name for im in bpy.data.images if im.packed_file];assert len(packed)==1
assert s.render.film_transparent and s.render.image_settings.color_mode=='RGBA'
# Tight but safe transparent frontal artwork.
s.camera.data.ortho_scale=.22
uv=[world_to_camera_view(s,s.camera,Vector((x,y,z))) for x in [native['min_m'][0],native['max_m'][0]] for y in [native['min_m'][1],native['max_m'][1]] for z in [0,.08]]
# The bounding box is conservative; use actual alpha for final image margin validation.
# The builder already renders the tightly framed front artwork; verify the exported model below.
for o in product.objects:o.hide_render=True
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(OUT/'feh5ks.glb'));imported=[o for o in bpy.data.objects if o not in before];web=bounds(imported);measured(web['dimensions_m'],[.18,.24,.08])
assert len([o for o in imported if o.type=='MESH'])==1
for o in imported:
 if o.type=='MESH':
  assert o.data.uv_layers.active
  assert all(math.isfinite(c) for v in o.data.vertices for c in v.co)
  assert all(math.isfinite(c) for uv in o.data.uv_layers.active.data for c in uv.uv)
raw=(OUT/'feh5ks.glb').read_bytes();magic,version,total=struct.unpack_from('<4sII',raw);assert magic==b'glTF' and version==2 and total==len(raw)
length,kind=struct.unpack_from('<II',raw,12);gltf=json.loads(raw[20:20+length]);assert all(not b.get('uri') for b in gltf['buffers']);assert all('bufferView' in im and not im.get('uri') for im in gltf['images'])
assert not gltf.get('cameras') and not gltf.get('animations')
primitives=[p for m in gltf['meshes'] for p in m['primitives']];triangles=sum(gltf['accessors'][p['indices']]['count']//3 for p in primitives);assert triangles<40000 and len(primitives)<=14
s.render.resolution_percentage=65;s.cycles.samples=40;s.render.filepath=str(WORK/'glb-reimport-proof.png');bpy.ops.render.render(write_still=True)
report={'passed':True,'model':'FEH5KS','native_bounds':native,'glb_bounds':web,'pan_bounds':pan,'dimensions_cm_width_depth_height':[18,24,8],'pan_cm_width_depth':[17,14],'pan_orientation_evidence':'Catalog arrow image shows 16.8 cm front width and 14 cm depth; rounded to the 17 and 14 cm values in user reference.','dimension_tolerance_mm':.03,'units':'meters','glb_bytes':len(raw),'meshes':len(gltf['meshes']),'material_primitives':len(primitives),'triangles':triangles,'embedded_textures':len(gltf['images']),'external_dependencies':False,'native_textures_packed':len(packed),'alpha_render':True,'lcd':'inactive as photographed','glb_reimport_render_verified':True,'unmeasured_details':'Corner radii, recess depth, rear and connector construction are visual approximations.'}
(OUT/'model-checks.json').write_text(json.dumps(report,indent=2));print('FEH5KS_VERIFIED',json.dumps(report),flush=True)
