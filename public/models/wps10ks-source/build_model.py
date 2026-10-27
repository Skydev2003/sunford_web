"""Measured-envelope WPS10KS reconstruction. Blender 5.2, metres, Z up.
Run: Blender --background --factory-startup --python public/models/wps10ks-source/build_model.py
Unmeasured radii, recess depths and internal details are visual estimates.
"""
import bpy,bmesh,math,json,sys
from pathlib import Path
from mathutils import Vector,Matrix
BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
sys.path.insert(0,str(BASE))
from export_web import export_web
OUT=ROOT/'outputs'/'wps10ks';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.length_unit='CENTIMETERS'
product=bpy.data.collections.new('WPS10KS | product only');scene.collection.children.link(product)
studio=bpy.data.collections.new('Studio | excluded from GLB');scene.collection.children.link(studio)
def put(o,coll=product):
 for c in list(o.users_collection):c.objects.unlink(o)
 coll.objects.link(o);return o
def material(name,color,metal=0,rough=.4,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
 return m
housingmat=material('ABS | cool light grey satin',(.43,.45,.50),0,.32)
base_mat=material('ABS | lower shell',(.47,.485,.53),0,.36)
pocketmat=material('ABS | shaded carry recess',(.07,.075,.09),0,.45)
steel=material('SUS304 | brushed pan deck',(.64,.675,.71),.95,.29)
rim=material('SUS304 | rolled polished edge',(.72,.745,.77),.98,.19)
black=material('Rubber | adjustable feet',(.012,.014,.017),0,.66)
baseblack=material('Polymer | pan support and sockets',(.018,.022,.026),0,.42)
glass=material('LED | smoked black window',(.0035,.008,.007),.02,.32)
ledoff=material('LED | unlit seven segments',(.003,.0065,.0055),0,.32)
ledon=material('LED | green illuminated segments',(.001,.64,.014),0,.45,.8)
glass.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.07
ledoff.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.07
ledon.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.10
buttonmat=material('Membrane | edge',(.03,.16,.23),0,.48)
redmat=material('Inspection seal | red',(.52,.008,.014),0,.48)
def texture(name,file):
 m=material(name,(1,1,1),0,.55);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Specular IOR Level'].default_value=.18
 n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=bpy.data.images.load(str(BASE/file));n.image.pack();m.node_tree.links.new(n.outputs['Color'],p.inputs['Base Color']);return m
frontmat=texture('Membrane | front printed artwork','front-panel.png');rearmat=texture('Membrane | rear printed artwork','rear-panel.png')
def normals(o):
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(o.data);bm.free()
def bevel(o,w=.001,segments=8):
 if 'grip flute' in o.name:segments=1
 m=o.modifiers.new('Manufactured edge radius','BEVEL');m.width=w;m.segments=segments;m.harden_normals=True
 for p in o.data.polygons:p.use_smooth=True
 m=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');m.keep_sharp=True
 return o
def mesh(name,verts,faces,mat,bev=0):
 d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);product.objects.link(o);o.data.materials.append(mat);normals(o)
 if bev:bevel(o,bev)
 return o
def cube(name,loc,dims,mat,bev=.001):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=put(bpy.context.object);o.name=name;o.dimensions=dims;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 if bev:bevel(o,bev)
 return o
def cylinder(name,loc,r,depth,mat,vertices=40):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc);o=put(bpy.context.object);o.name=name;o.data.materials.append(mat);bevel(o,.0004,2)
 for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
 return o
def apply(o):
 bpy.context.view_layer.objects.active=o
 for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
def difference(o,cutter):
 apply(cutter);bpy.context.view_layer.objects.active=o
 mod=o.modifiers.new('Molded recess','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cutter;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
def profile(name,section,mat,bevelsize=.003):
 # The upper shell narrows toward the pan. Nominal maximum width is 200 mm.
 verts=[]
 for sign in [-1,1]:
  for y,z in section:
   halfwidth=.100-max(0,z-.025)*.12
   verts.append((sign*halfwidth,y,z))
 n=len(section);faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 return mesh(name,verts,faces,mat,bevelsize)
upper=profile('01 | molded ABS upper shell',[(-.1375,.024),(-.1375,.032),(-.127,.045),(-.049,.087),(-.038,.09),(.100,.09),(.108,.082),(.1375,.030),(.1375,.024)],housingmat,.003)
apply(upper)
# Carrying recesses on both sides: closed bottoms, rather than holes through the scale.
for sign in [-1,1]:
 cutter=cube('temporary carry-pocket tool',(sign*.096,.026,.069),(.018,.037,.057),housingmat,.006)
 difference(upper,cutter)
 o=cube('02 | carry pocket inner wall',(sign*.0873,.026,.065),(.0009,.025,.037),pocketmat,.003)
 # Two small fixing holes at the lower end of each pocket, visible in the side reference.
 for y in [.018,.034]:
  o=cylinder('02 | pocket fixing socket',(sign*.0881,y,.048),.00165,.0009,baseblack,16);o.rotation_euler[1]=math.pi/2
lower=profile('03 | lower shell and perimeter seam',[(-.1375,.012),(-.1375,.0233),(.1375,.0233),(.1375,.012)],base_mat,.0035)
# The front lip has the photographed central shallow scallop.
for shell in [upper,lower]:
 cutter=cube('temporary front lip scallop',(0,-.139,.016),(.078,.013,.018),housingmat,.003)
 difference(shell,cutter)
# Four leveling feet and their molded attachment collars. Ground contact at Z=0.
for x in [-.073,.073]:
 for y in [-.102,.101]:
  cylinder('04 | black leveling foot',(x,y,.006),.0125,.012,black)
  cylinder('04 | foot collar',(x,y,.013),.009,.006,baseblack)
  # Restrained ribbed grip around the rubber foot, combined after export.
  for i in range(16):
   a=2*math.pi*i/16;o=cube('04 | rubber grip flute',(x+.0121*math.cos(a),y+.0121*math.sin(a),.0055),(.0011,.0012,.007),black,.00025);o.rotation_euler[2]=a
# Bottom molded panel, battery cover, screws, inspection seal and protected charge socket.
cube('05 | underside battery compartment',(0,.006,.0117),(.145,.153,.003),base_mat,.005)
cube('05 | battery hatch',(0,.006,.0096),(.126,.124,.002),housingmat,.004)
cube('05 | battery hatch pull recess',(.047,.002,.0089),(.016,.034,.0018),pocketmat,.003)
for x in [-.052,.052]:
 for y in [-.044,.058]:
  o=cylinder('05 | underside screw',(x,y,.0083),.0022,.001,rim,20)
  cube('05 | screw slot',(x,y,.0077),(.0028,.00045,.0003),baseblack,.0001)
cube('05 | underside inspection seal',(0,-.047,.0081),(.022,.009,.0004),redmat,.001)
cube('05 | protected socket housing',(0,.104,.010),(.025,.019,.008),base_mat,.002)
o=cylinder('05 | charging socket cap',(0,.104,.0054),.006,.003,baseblack,32)
# Load-cell support under the pan and four anti-slip contact pads.
cube('06 | pan support cradle',(0,.0325,.095),(.149,.115,.009),baseblack,.003)
for x in [-.067,.067]:
 for y in [-.018,.084]:cylinder('06 | pan contact pad',(x,y,.099),.007,.005,black)
def rounded(w,h,r,n=10):
 points=[]
 for cx,cy,a in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
  for k in range(n+1):
   t=math.radians(a+k*90/n);points.append((cx+r*math.cos(t),cy+r*math.sin(t)))
 return points
tray_y=.0325
# Exact external pan dimensions 200 x 160 mm, maximum Z=110 mm.
ring_specs=[(.198,.158,.006,.097),(.200,.160,.007,.099),(.200,.160,.007,.1075),(.199,.159,.007,.1094),(.197,.157,.007,.110),(.194,.154,.0065,.1097),(.191,.151,.006,.1080),(.186,.146,.005,.1073)]
rings=[[(x,y+tray_y,z) for x,y in rounded(w,h,r)] for w,h,r,z in ring_specs]
N=len(rings[0]);verts=[p for ring in rings for p in ring];faces=[]
for j in range(len(rings)-1):
 for i in range(N):faces.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
faces.append(tuple(range(N-1,-1,-1)))
tray=mesh('07 | SUS304 pan rolled edge | 200 x 160 mm',verts,faces,rim)
for p in tray.data.polygons:p.use_smooth=p.index<len(faces)-1
# Flat deck: no oval stamping on this model.
deck=mesh('08 | flat rectangular brushed SUS304 deck',rings[-1],[tuple(range(N))],steel)
# Very fine directional grain is native-only; web uses clean metallic PBR parameters.
n=steel.node_tree.nodes;l=steel.node_tree.links;c=n.new('ShaderNodeTexCoord');v=n.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=(1,45,1);t=n.new('ShaderNodeTexNoise');t.inputs['Scale'].default_value=1250;t.inputs['Detail'].default_value=1
b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.075;b.inputs['Distance'].default_value=.000008
l.new(c.outputs['Generated'],v.inputs[0]);l.new(v.outputs[0],t.inputs['Vector']);l.new(t.outputs['Fac'],b.inputs['Height']);l.new(b.outputs['Normal'],n.get('Principled BSDF').inputs['Normal'])
# Front / rear local frames. X is left-to-right as seen by the operator/customer.
front_angle=math.atan2(.042,.078)
front_R=Vector((1,0,0));front_U=Vector((0,math.cos(front_angle),math.sin(front_angle)))
rear_R=Vector((-1,0,0));rear_U=Vector((0,-.0295,.052)).normalized()
def frame(c,r,u):return (Vector(c),r,u,r.cross(u))
front=frame((0,-.088,.066),front_R,front_U)
rear=frame((0,.12275,.056),rear_R,rear_U)
def point(F,x,y,z=0):c,r,u,n=F;return c+x*r+y*u+z*n
def plane(name,F,x,y,w,h,mat,z=.0004,rad=.002,uv_extent=None):
 coords=rounded(w,h,min(rad,w/2,h/2))
 verts=[tuple(point(F,x+xx,y+yy,z)) for xx,yy in coords]
 o=mesh(name,verts,[tuple(range(len(verts)))],mat)
 uv=o.data.uv_layers.new()
 for loop in o.data.loops:
  xx,yy=coords[loop.vertex_index]
  if uv_extent:
   ew,eh=uv_extent;uv.data[loop.index].uv=((x+xx)/ew+.5,(y+yy)/eh+.5)
  else:uv.data[loop.index].uv=(xx/w+.5,yy/h+.5)
 return o
def flatbox(name,F,x,y,w,h,d,mat,z=.0005,bev=.0007):
 c,r,u,n=F;o=cube(name,point(F,x,y,z),(w,h,d),mat,bev);o.rotation_mode='QUATERNION';o.rotation_quaternion=Matrix((r,u,n)).transposed().to_quaternion();return o
plane('09 | front blue membrane and print',front,0,0,.166,.071,frontmat,rad=.005)
plane('10 | rear blue customer display print',rear,0,0,.132,.045,rearmat,rad=.004)
# The four keys are printed on the single membrane atlas, as in the reference.
# A continuous surface prevents depth flicker between duplicate button faces on the web.
# Glass is opaque smoked material, with the LED segments above it for portable glTF rendering.
for F,prefix,x,y,w,h in [(front,'front',-.026,.001,.105,.035),(rear,'rear',0,0,.118,.028)]:
 flatbox('12 | '+prefix+' recessed display gasket',F,x,y,w+.001,h+.001,.0002,baseblack,z=.00032,bev=.0003)
 plane('12 | '+prefix+' smoked display window',F,x,y,w,h,glass,z=.00065,rad=.0004)
# Seven segment glyph geometry, rather than baked photographs. The photographed readout is 0.0.
segments={
 'a':[(-.39,.50),(.31,.50),(.40,.43),(.30,.36),(-.30,.36),(-.40,.43)],
 'g':[(-.30,.07),(.29,.07),(.38,0),(.29,-.07),(-.30,-.07),(-.39,0)],
 'd':[(-.29,-.36),(.30,-.36),(.39,-.43),(.30,-.50),(-.39,-.50),(-.40,-.43)],
 'f':[(-.43,.39),(-.34,.31),(-.34,.10),(-.43,.02),(-.50,.10),(-.50,.32)],
 'b':[(.44,.39),(.51,.32),(.51,.10),(.43,.02),(.35,.10),(.35,.31)],
 'e':[(-.43,-.02),(-.34,-.10),(-.34,-.31),(-.43,-.39),(-.50,-.32),(-.50,-.10)],
 'c':[(.43,-.02),(.51,-.10),(.51,-.32),(.44,-.39),(.35,-.31),(.35,-.10)]}
active_verts=[];active_faces=[];off_verts=[];off_faces=[]
def polygon_store(F,coords,z,on):
 vs,fs=(active_verts,active_faces) if on else (off_verts,off_faces)
 start=len(vs);vs.extend(tuple(point(F,x,y,z)) for x,y in coords);fs.append(tuple(range(start,len(vs))))
for F,prefix,cx,cy,w,h in [(front,'front',-.026,.001,.105,.035),(rear,'rear',0,0,.118,.028)]:
 # 19 mm digit height, slanted slightly like the reference LED module.
 height=.019;step=.013;first=cx-.0275
 for digit in range(6):
  dx=first+digit*step;on_digit=digit>=4
  for key,coords in segments.items():
   pp=[(dx+x*.009+y*.002,cy+y*height) for x,y in coords]
   polygon_store(F,pp,.00095,on_digit and key!='g')
 # Decimal point between the last two zeroes.
 dx=first+4*step+.0067;dy=cy-.0084
 polygon_store(F,[(dx+.00085*math.cos(i*math.tau/16),dy+.00085*math.sin(i*math.tau/16)) for i in range(16)],.00096,True)
 # Charge level indicators, zero/stable LEDs.
 for x,y in [(cx-w/2+.003,cy+.011),(cx-w/2+.003,cy+.003),(cx-w/2+.003,cy-.005),(cx-w/2+.016,cy-h/2+.003),(cx+w/2-.004,cy-h/2+.003)]:
  polygon_store(F,[(x+.00105*math.cos(i*math.tau/16),y+.00105*math.sin(i*math.tau/16)) for i in range(16)],.00097,True)
mesh('13 | green LED readouts 0.0 and indicators',active_verts,active_faces,ledon)
mesh('13 | unlit LED segments',off_verts,off_faces,ledoff)
# Root metadata; the dimensions describe the real external envelope, not packaging.
root=bpy.data.objects.new('SUNFORD WPS10KS | 200 x 275 x 110 mm',None);product.objects.link(root)
for o in list(product.objects):
 if o!=root:o.parent=root
root['model']='WPS10KS';root['dimensions_cm']=[20.0,27.5,11.0];root['pan_cm']=[20.0,16.0];root['net_weight_kg']=2.10;root['packaged_weight_kg']=2.27;root['packaging_cm']=[33,24,15];root['reconstruction_note']='Measured overall envelope and pan. Remaining construction details estimated from product photographs. Front and rear LED displays.'
# Studio is kept in the editable Blender file only.
world=bpy.data.worlds.new('Soft neutral studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.75,.80,1);world.node_tree.nodes['Background'].inputs[1].default_value=.28;scene.world=world
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,energy,size,sy,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='RECTANGLE';d.size=size;d.size_y=sy;d.color=color;o=bpy.data.objects.new(name,d);studio.objects.link(o);o.location=loc;aim(o,(0,0,.05))
area('Key softbox',(-.30,-.35,.52),4.4,.43,.26,(1,.98,.96))
area('Right strip',(.30,.03,.30),3.2,.14,.40,(.88,.93,1))
area('Pan highlight',(-.10,.28,.48),5.0,.32,.16,(1,1,1))
area('Front fill',(0,-.40,.15),.8,.32,.20,(1,1,1))
d=bpy.data.cameras.new('Product camera');cam=bpy.data.objects.new('Product camera',d);studio.objects.link(cam);scene.camera=cam;cam.location=(.34,-.51,.31);aim(cam,(0,-.005,.056));d.type='ORTHO';d.ortho_scale=.355;d.lens=70;d.clip_start=.001
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
scene.render.resolution_x=1600;scene.render.resolution_y=1400;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.1
scene.render.filepath=str(OUT/'wps10ks-preview.png')
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':
   a.spaces.active.region_3d.view_distance=.46;a.spaces.active.region_3d.view_location=(0,0,.055);a.spaces.active.region_3d.view_rotation=cam.rotation_euler.to_quaternion();a.spaces.active.shading.type='MATERIAL';a.spaces.active.clip_start=.001
bpy.ops.object.select_all(action='DESELECT')
for o in product.objects:o.select_set(True)
bpy.context.view_layer.objects.active=upper
export_web(product,root,OUT/'wps10ks.glb')
bpy.context.view_layer.objects.active=upper
scene['source_notes']='WPS10KS: user measurements + supplied photos + matching product reference images already in catalog. Overall and pan dimensions measured; unmeasured details estimated.'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'wps10ks.blend'))
print('MODEL_SAVED',flush=True)
bpy.ops.render.render(write_still=True)
# Alternate transparent views make front/rear fidelity reviewable.
scene.render.resolution_percentage=60;scene.cycles.samples=40
for name,loc,target,scale in [('rear',(-.25,.49,.22),(0,.01,.055),.33),('side',(.46,0,.15),(0,0,.055),.34),('front',(0,-.50,.24),(0,-.01,.055),.32)]:
 cam.location=loc;aim(cam,target);d.ortho_scale=scale;scene.render.filepath=str(OUT/('wps10ks-'+name+'.png'));bpy.ops.render.render(write_still=True)
print('MODEL_AND_RENDERS_COMPLETE',flush=True)
