import bpy,json,math,struct
from mathutils import Vector
from pathlib import Path
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=ROOT/'outputs'/'wps10ks';WORK=ROOT/'work'/'wps10ks'
WORK.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'wps10ks.blend'));s=bpy.context.scene
product=bpy.data.collections['WPS10KS | product only']
def bounds(objects):
 points=[]
 deps=bpy.context.evaluated_depsgraph_get()
 for o in objects:
  if o.type!='MESH':continue
  ev=o.evaluated_get(deps);me=ev.to_mesh()
  points.extend(o.matrix_world@v.co for v in me.vertices);ev.to_mesh_clear()
 lo=[min(v[i] for v in points) for i in range(3)];hi=[max(v[i] for v in points) for i in range(3)]
 return {'min_m':lo,'max_m':hi,'dimensions_m':[b-a for a,b in zip(lo,hi)]}
def measured(actual,expected):
 assert max(abs(a-b) for a,b in zip(actual,expected))<.00003,(actual,expected)
native=bounds(product.objects);measured(native['dimensions_m'],[.2,.275,.11])
tray=bounds([o for o in product.objects if o.name.startswith('07 |')]);measured(tray['dimensions_m'][:2],[.2,.16])
assert s.render.film_transparent and s.render.image_settings.color_mode=='RGBA'
packed=[im.name for im in bpy.data.images if im.packed_file];assert len(packed)==2,packed
for o in product.objects:o.hide_render=True
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(OUT/'wps10ks.glb'))
imported=[o for o in bpy.data.objects if o not in before];web=bounds(imported);measured(web['dimensions_m'],[.2,.275,.11])
assert len([o for o in imported if o.type=='MESH'])==1
# Every imported UV and vertex must be finite.
for o in imported:
 if o.type=='MESH':
  assert o.data.uv_layers.active
  assert all(math.isfinite(c) for v in o.data.vertices for c in v.co)
  assert all(math.isfinite(c) for uv in o.data.uv_layers.active.data for c in uv.uv)
raw=(OUT/'wps10ks.glb').read_bytes();magic,version,total=struct.unpack_from('<4sII',raw);assert magic==b'glTF' and version==2 and total==len(raw)
chunk_len,chunk_type=struct.unpack_from('<II',raw,12);gltf=json.loads(raw[20:20+chunk_len])
assert all(not b.get('uri') for b in gltf['buffers'])
assert all('bufferView' in im and not im.get('uri') for im in gltf['images'])
assert not gltf.get('cameras') and not gltf.get('animations')
primitives=[p for m in gltf['meshes'] for p in m['primitives']]
triangles=sum(gltf['accessors'][p['indices']]['count']//3 for p in primitives)
assert triangles<50000,triangles
assert len(primitives)<=16,len(primitives)
assert len(gltf['images'])==2
root=bpy.data.objects.get('SUNFORD WPS10KS');assert root and root.get('model')=='WPS10KS'
s.render.resolution_percentage=65;s.cycles.samples=48;s.render.filepath=str(WORK/'web-glb-proof.png');bpy.ops.render.render(write_still=True)
report={'passed':True,'model':'WPS10KS','native_bounds':native,'web_bounds':web,'tray_bounds':tray,'dimension_tolerance_mm':.03,'units':'meters','glb_bytes':len(raw),'meshes':len(gltf['meshes']),'material_primitives':len(primitives),'triangles':triangles,'textures_embedded':len(gltf['images']),'external_file_dependencies':False,'native_textures_packed':len(packed),'alpha_render':True,'glb_reimport_render_verified':True,'unmeasured_details':'Radii, recesses and construction details estimated from photographs; this is a visual reconstruction, not a manufacturing CAD model.'}
(OUT/'model-checks.json').write_text(json.dumps(report,indent=2));print('MODEL_VERIFIED',json.dumps(report),flush=True)
