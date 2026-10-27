"""Merge evaluated parts into one mesh with shared material primitives for web use."""
import bpy
from mathutils import Vector

def export_web(product,root,filepath):
 deps=bpy.context.evaluated_depsgraph_get();vertices=[];faces=[];uvs=[];normals=[];mats=[];indices=[]
 for o in list(product.objects):
  if o.type!='MESH':continue
  ev=o.evaluated_get(deps);me=ev.to_mesh(preserve_all_data_layers=True,depsgraph=deps)
  matrix=o.matrix_world;normal_matrix=matrix.to_3x3().inverted().transposed();offset=len(vertices)
  vertices.extend(tuple(matrix@v.co) for v in me.vertices)
  remap=[]
  for mat in me.materials:
   if mat not in mats:mats.append(mat)
   remap.append(mats.index(mat))
  layer=me.uv_layers.active
  for p in me.polygons:
   faces.append(tuple(offset+i for i in p.vertices));indices.append(remap[p.material_index])
   for li in p.loop_indices:
    uvs.append(tuple(layer.data[li].uv) if layer else (0,0))
    normals.append(tuple((normal_matrix@me.corner_normals[li].vector).normalized()))
  ev.to_mesh_clear()
 data=bpy.data.meshes.new('FEH5KS | shared PBR primitives');data.from_pydata(vertices,[],faces);data.update()
 for mat in mats:data.materials.append(mat)
 for poly,index in zip(data.polygons,indices):poly.material_index=index;poly.use_smooth=True
 uv=data.uv_layers.new()
 for li,coords in enumerate(uvs):uv.data[li].uv=coords
 data.normals_split_custom_set(normals)
 combined=bpy.data.objects.new('SUNFORD FEH5KS',data);product.objects.link(combined)
 for key in root.keys():combined[key]=root[key]
 bpy.ops.object.select_all(action='DESELECT');combined.select_set(True);bpy.context.view_layer.objects.active=combined
 bpy.ops.export_scene.gltf(filepath=str(filepath),export_format='GLB',use_selection=True,export_apply=False,export_yup=True,export_extras=True,export_cameras=False,export_lights=False)
 bpy.data.objects.remove(combined,do_unlink=True);bpy.data.meshes.remove(data)
