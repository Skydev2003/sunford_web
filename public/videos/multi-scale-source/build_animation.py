import bpy,math,json,os
from mathutils import Vector
from pathlib import Path
from bpy_extras.object_utils import world_to_camera_view
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=Path(os.environ.get('SUNFORD_SEQUENCE_OUT',str(ROOT/'outputs'/'sunford-multi-scale')));WORK=Path(os.environ.get('SUNFORD_SEQUENCE_WORK',str(ROOT/'work'/'multi-scale')));WORK.mkdir(parents=True,exist_ok=True)
config=json.loads((OUT/'products.json').read_text());timeline=json.loads((OUT/'camera-timeline.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.unit_settings.system='METRIC';s.unit_settings.length_unit='CENTIMETERS'
studio=bpy.data.collections.new('Studio | shared lighting and camera');s.collection.children.link(studio)
collections=[];pivots=[]
for p in config['products']:
 coll=bpy.data.collections.new(p['name']);s.collection.children.link(coll);collections.append(coll)
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(OUT/p['src']))
 imported=[o for o in bpy.data.objects if o not in before]
 pivot=bpy.data.objects.new(p['name']+' | turntable',None);coll.objects.link(pivot);pivots.append(pivot)
 for o in imported:
  for c in list(o.users_collection):c.objects.unlink(o)
  coll.objects.link(o)
  if o.parent is None:o.parent=pivot
 pivot['model']=p['id'];pivot['scale_note']='Physical dimensions preserved; presentation uses camera distance, not mesh scaling.'
world=bpy.data.worlds.new('Neutral product studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.75,.80,1);world.node_tree.nodes['Background'].inputs[1].default_value=.26;s.world=world
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,size,sy,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='RECTANGLE';d.size=size;d.size_y=sy;d.color=color;o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc;aim(o,(0,0,.055))
area('Key | broad white softbox',(-.35,-.4,.60),5.0,.48,.30,(1,.97,.94))
area('Fill | cool strip',(.42,-.03,.36),3.0,.20,.48,(.88,.93,1))
area('Rim | upper reflection',(-.12,.34,.50),5.4,.40,.15,(1,1,1))
area('Front | display fill',(0,-.5,.18),.7,.36,.20,(1,1,1))
d=bpy.data.cameras.new('Camera | safe fit');camera=bpy.data.objects.new('Camera | safe fit',d);studio.objects.link(camera);s.camera=camera
d.type='PERSP';d.sensor_fit='HORIZONTAL';d.sensor_width=36;d.lens=36/(2*math.tan(math.radians(config['vertical_fov_degrees'])/2)*(config['width']/config['height']));d.clip_start=.001;d.clip_end=100
# Isolated product layers and weighted premultiplied RGBA support any playlist length.
render_layers=[]
for i,p in enumerate(config['products']):
 layer=s.view_layers[0] if i==0 else s.view_layers.new(p['name'])
 layer.name=p['name'];render_layers.append(layer)
def find_layer(layer,name):
 if layer.name==name:return layer
 for child in layer.children:
  found=find_layer(child,name)
  if found:return found
 return None
for i,layer in enumerate(render_layers):
 for j,c in enumerate(collections):find_layer(layer.layer_collection,c.name).exclude=(i!=j)
 layer.use=True
g=bpy.data.node_groups.new('Product sequence | weighted RGBA dissolve','CompositorNodeTree');s.compositing_node_group=g;g.interface.new_socket(name='Image',in_out='OUTPUT',socket_type='NodeSocketColor');n=g.nodes;l=g.links
separate=[];weights=[]
for i,layer in enumerate(render_layers):
 source=n.new('CompositorNodeRLayers');source.scene=s;source.layer=layer.name;source.location=(-800,300-i*240)
 channels=n.new('CompositorNodeSeparateColor');channels.mode='RGB';channels.location=(-550,300-i*240);l.new(source.outputs['Image'],channels.inputs['Image']);separate.append(channels)
 weight=n.new('ShaderNodeValue');weight.name=layer.name+' blend weight';weight.label=layer.name+' weight';weight.location=(-800,160-i*240);weights.append(weight)
combine=n.new('CompositorNodeCombineColor');combine.mode='RGB';combine.location=(400,200)
for ci,channel in enumerate(['Red','Green','Blue','Alpha']):
 total=None
 for i,(source,weight) in enumerate(zip(separate,weights)):
  multiply=n.new('ShaderNodeMath');multiply.operation='MULTIPLY';multiply.location=(-250+i*200,300-ci*160);l.new(source.outputs[channel],multiply.inputs[0]);l.new(weight.outputs[0],multiply.inputs[1])
  if total is None:total=multiply.outputs[0]
  else:
   add=n.new('ShaderNodeMath');add.operation='ADD';add.location=(-100+i*200,300-ci*160);l.new(total,add.inputs[0]);l.new(multiply.outputs[0],add.inputs[1]);total=add.outputs[0]
 l.new(total,combine.inputs[channel])
output=n.new('NodeGroupOutput');output.location=(650,200);l.new(combine.outputs['Image'],output.inputs['Image'])
phi=math.radians(config['polar_degrees']);target=Vector((config['target'][0],-config['target'][2],config['target'][1]))
for i,p in enumerate(timeline['frames']):
 frame=i+1
 for pivot in pivots:pivot.rotation_euler[2]=math.radians(p['angle_degrees']);pivot.keyframe_insert(data_path='rotation_euler',frame=frame)
 camera.location=target+Vector((0,-math.sin(phi),math.cos(phi)))*p['radius'];aim(camera,target);camera.keyframe_insert(data_path='location',frame=frame);camera.keyframe_insert(data_path='rotation_euler',frame=frame)
 for weight,value in zip(weights,p['weights']):weight.outputs[0].default_value=value;weight.outputs[0].keyframe_insert(data_path='default_value',frame=frame)
s.frame_start=1;s.frame_end=len(timeline['frames'])-1;s.render.fps=config['fps'];s.render.resolution_x=config['width'];s.render.resolution_y=config['height'];s.render.resolution_percentage=100
s.render.engine='BLENDER_EEVEE';s.eevee.taa_render_samples=48;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.image_settings.color_depth='8';s.render.use_compositing=True
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.view_settings.exposure=-.15
s['sequence_notes']=f"Product rotation playlist: {timeline['duration']} seconds at {config['fps']} fps. Mesh dimensions preserved. Weighted premultiplied RGBA compositor, one isolated view layer per product."
s['playlist_config']='products.json';s.render.filepath='//renders/frame-'
# Check the native camera for all visible product bounds at every rendered frame.
minimum=1
for i,p in enumerate(timeline['frames']):
 s.frame_set(i+1);bpy.context.view_layer.update()
 for product,weight in zip(config['products'],p['weights']):
  if weight<=1e-9:continue
  w,h,depth=product['dimensions_m'];angle=math.radians(p['angle_degrees']);points=[]
  for x in [-w/2,w/2]:
   for y in [-depth/2,depth/2]:
    for z in [0,h]:points.append(Vector((math.cos(angle)*x-math.sin(angle)*y,math.sin(angle)*x+math.cos(angle)*y,z)))
  uv=[world_to_camera_view(s,camera,v) for v in points];margin=min(min(q.x,1-q.x,q.y,1-q.y) for q in uv);minimum=min(minimum,margin);assert margin>=config['safe_margin']-1e-5,(i,margin)
s.frame_set(1)
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.clip_start=.001
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'sunford-multi-scale.blend'))
(OUT/'native-camera-checks.json').write_text(json.dumps({'passed':True,'frames_checked':len(timeline['frames']),'minimum_margin':minimum,'camera_fov_degrees':config['vertical_fov_degrees'],'compositor':'premultiplied RGBA mix','model_scales':[list(p.scale) for p in pivots]},indent=2))
s.render.resolution_percentage=50
for frame in [int(x) for x in os.environ.get('SUNFORD_SEQUENCE_PROOF_FRAMES',f"1,{round((config['seconds_per_product']-config['phase_offset_seconds'])*config['fps'])+1},{round(config['seconds_per_product']*config['fps'])+1},{s.frame_end+1}").split(',')]:
 s.frame_set(frame);s.render.filepath=str(WORK/('proof-%03d.png'%frame));bpy.ops.render.render(write_still=True)
print('MULTI_MODEL_PREPARED',minimum,flush=True)
