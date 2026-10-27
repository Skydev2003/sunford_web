"""FEH5KS measured-envelope reconstruction; Blender 5.2, metres, Z up."""
import bpy,bmesh,math,json,sys
from pathlib import Path
from mathutils import Vector,Matrix
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[2];OUT=ROOT/'outputs'/'feh5ks';OUT.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(BASE));from export_web import export_web
BODY=(.180,.240,.080);PAN=(.170,.140)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
s=bpy.context.scene;s.unit_settings.system='METRIC';s.unit_settings.length_unit='CENTIMETERS'
product=bpy.data.collections.new('FEH5KS | product');s.collection.children.link(product);studio=bpy.data.collections.new('Studio | excluded from GLB');s.collection.children.link(studio)
def put(o,collection=product):
 for c in list(o.users_collection):c.objects.unlink(o)
 collection.objects.link(o);return o
def material(name,color,metal=0,rough=.4,spec=.35):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;p.inputs['Specular IOR Level'].default_value=spec;return m
abs_mat=material('ABS | warm off-white satin',(.59,.60,.57),0,.32)
base_mat=material('ABS | lower shell',(.51,.52,.49),0,.38)
steel=material('SUS304 | brushed stainless deck',(.62,.65,.67),.95,.28)
rim=material('SUS304 | rolled edge',(.68,.70,.71),.96,.20)
black=material('Polymer | supports and connector inserts',(.012,.016,.020),0,.48,.18)
rubber=material('Rubber | foot contacts',(.019,.021,.022),0,.7)
footmat=material('Feet | grey molded grips',(.25,.27,.25),0,.48)
lcd=material('LCD | inactive pale grey-green glass',(.23,.285,.263),.02,.30,.13)
ink=material('Printed rear marking | black',(.008,.010,.012),0,.56,.12)
labelwhite=material('Rear socket label | off-white',(.73,.75,.72),0,.55)
brass=material('RS232 | nickel-brass shield',(.50,.42,.25),.80,.26)
panel=material('Front membrane | printed artwork',(1,1,1),0,.55,.08);texture=panel.node_tree.nodes.new('ShaderNodeTexImage');texture.image=bpy.data.images.load(str(BASE/'front-panel.png'));texture.image.pack();panel.node_tree.links.new(texture.outputs['Color'],panel.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
def normals(o):
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(o.data);bm.free()
def bevel(o,width=.001,segments=8):
 for p in o.data.polygons:p.use_smooth=True
 b=o.modifiers.new('Manufactured soft edge','BEVEL');b.width=width;b.segments=segments;b.harden_normals=True
 n=o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL');n.keep_sharp=True
 return o
def mesh(name,vertices,faces,mat,b=0):
 data=bpy.data.meshes.new(name);data.from_pydata(vertices,[],faces);data.update();o=bpy.data.objects.new(name,data);product.objects.link(o);o.data.materials.append(mat);normals(o)
 if b:bevel(o,b)
 return o
def cube(name,location,dimensions,mat,b=.001):
 bpy.ops.mesh.primitive_cube_add(size=1,location=location);o=put(bpy.context.object);o.name=name;o.dimensions=dimensions;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 if b:bevel(o,b)
 return o
def cylinder(name,location,radius,depth,mat,vertices=40,axis=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=location);o=put(bpy.context.object);o.name=name;o.data.materials.append(mat);bevel(o,.00025,2)
 if axis is not None:o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(axis))
 return o
def body(name,profile,mat,b):
 vertices=[(sign*(.09-max(z-.014,0)*.10),y,z) for sign in [-1,1] for y,z in profile];N=len(profile)
 return mesh(name,vertices,[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)],mat,b)
upper=body('01 | softly molded ABS housing',[(-.120,.0148),(-.120,.021),(-.111,.031),(-.039,.060),(-.029,.062),(.107,.062),(.120,.025),(.120,.0148)],abs_mat,.0023)
body('02 | lower shell and seam',[(-.120,.0075),(-.120,.0143),(.120,.0143),(.120,.0075)],base_mat,.002)
# Four small adjustable feet; underside matches the functional references.
for x in [-.065,.065]:
 for y in [-.083,.085]:
  cylinder('03 | grey leveling foot',(x,y,.004),.008,.008,footmat)
  cylinder('03 | rubber contact',(x,y,.001),.0065,.002,rubber)
  cylinder('03 | foot collar',(x,y,.008),.0058,.004,base_mat)
  for i in range(12):
   a=i*math.tau/12;o=cube('03 | grip flute',(x+.0078*math.cos(a),y+.0078*math.sin(a),.004),(.0007,.0008,.0048),footmat,0);o.rotation_euler[2]=a;bevel(o,.00013,1)
cube('04 | underside battery door',(0,.005,.0072),(.105,.143,.002),base_mat,.003)
cube('04 | battery latch',(0,.078,.0064),(.019,.008,.002),footmat,.001)
for x in [-.054,.054]:
 for y in [-.083,.085]:
  cylinder('04 | underside screw',(x,y,.0062),.0019,.0008,rim,20)
  cube('04 | screw slot',(x,y,.0057),(.0024,.0004,.00015),black,.00005)
# Black pan cradle and pads are visible in the narrow gap under the stainless sheet.
tray_y=.037
cube('05 | load-cell pan cradle',(0,tray_y,.065),(.133,.108,.008),black,.003)
for x in [-.057,.057]:
 for y in [-.012,.085]:cylinder('05 | pan contact pad',(x,y,.068),.0058,.006,rubber)
def rounded(w,h,r,n=14):
 points=[];corners=[(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]
 for i,(cx,cy,a) in enumerate(corners):
  for k in range(n):
   t=math.radians(a+90*k/n);points.append((cx+r*math.cos(t),cy+r*math.sin(t)))
  end=(cx+r*math.cos(math.radians(a+90)),cy+r*math.sin(math.radians(a+90)))
  nx,ny,na=corners[(i+1)%4];start=(nx+r*math.cos(math.radians(na)),ny+r*math.sin(math.radians(na)))
  for k in range(n):
   q=k/n;points.append((end[0]*(1-q)+start[0]*q,end[1]*(1-q)+start[1]*q))
 return points
specs=[(.168,.138,.006,.070),(.170,.140,.007,.072),(.170,.140,.007,.0778),(.169,.139,.007,.0794),(.167,.137,.0065,.080),(.164,.134,.006,.0795),(.158,.128,.006,.0784)]
rings=[[(x,y+tray_y,z) for x,y in rounded(w,h,r)] for w,h,r,z in specs];N=len(rings[0]);vertices=[p for ring in rings for p in ring];faces=[]
for j in range(len(rings)-1):
 for i in range(N):faces.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
faces.append(tuple(range(N-1,-1,-1)))
tray=mesh('06 | rolled stainless pan | 170 x 140 mm',vertices,faces,rim)
for p in tray.data.polygons:p.use_smooth=p.index<len(faces)-1
# The photographed circular stamping reads as an oval from the product camera.
angles=[math.atan2(y-tray_y,x) for x,y,z in rings[-1]]
deckrings=[rings[-1]]
for radius,z in [(.0570,.0784),(.0558,.07820),(.0545,.07805),(.0527,.0782)]:deckrings.append([(radius*math.cos(t),tray_y+radius*math.sin(t),z) for t in angles])
vertices=[p for ring in deckrings for p in ring];faces=[]
for j in range(len(deckrings)-1):
 for i in range(N):faces.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
faces.append(tuple(range((len(deckrings)-1)*N,len(deckrings)*N)))
deck=mesh('07 | brushed deck and circular pressed recess',vertices,faces,steel)
for p in deck.data.polygons:p.use_smooth=N<=p.index<len(faces)-1
nodes=steel.node_tree.nodes;links=steel.node_tree.links;c=nodes.new('ShaderNodeTexCoord');v=nodes.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=(1,40,1);noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=1450;noise.inputs['Detail'].default_value=1;b=nodes.new('ShaderNodeBump');b.inputs['Strength'].default_value=.07;b.inputs['Distance'].default_value=.000008;links.new(c.outputs['Generated'],v.inputs[0]);links.new(v.outputs[0],noise.inputs['Vector']);links.new(noise.outputs['Fac'],b.inputs['Height']);links.new(b.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])
def frame(center,right,up):r=Vector(right);u=Vector(up).normalized();return Vector(center),r,u,r.cross(u)
theta=math.atan2(.029,.072);front=frame((0,-.075,.0455),(1,0,0),(0,math.cos(theta),math.sin(theta)))
rear=frame((0,.117,.0335),(-1,0,0),(0,-.013,.037))
side=frame((.0893,.052,.034),(0,1,0),(0,0,1))
def point(F,x,y,z=0):c,r,u,n=F;return c+r*x+u*y+n*z
def orient(o,F):o.rotation_mode='QUATERNION';o.rotation_quaternion=Matrix((F[1],F[2],F[3])).transposed().to_quaternion();return o
def flatbox(name,F,x,y,w,h,d,mat,z=0,b=.001):return orient(cube(name,point(F,x,y,z),(w,h,d),mat,b),F)
def plane(name,F,x,y,w,h,mat,z=0,r=.001,uv_extent=None):
 coords=rounded(w,h,r,8);verts=[tuple(point(F,x+xx,y+yy,z)) for xx,yy in coords];o=mesh(name,verts,[tuple(range(len(verts)))],mat);uv=o.data.uv_layers.new()
 for loop in o.data.loops:
  xx,yy=coords[loop.vertex_index];uv.data[loop.index].uv=(xx/w+.5,yy/h+.5) if uv_extent is None else ((x+xx)/uv_extent[0]+.5,(y+yy)/uv_extent[1]+.5)
 return o
flatbox('08 | rounded ABS front bezel',front,0,0,.170,.077,.0014,abs_mat,.00025,.003)
plane('09 | single printed membrane with all five controls',front,0,0,.160,.066,panel,.00115,.0035)
# The reference display is inactive: no invented digits or backlight are added.
flatbox('10 | LCD aperture gasket',front,-.031,.0005,.082,.027,.0004,black,.0013,.0005)
plane('10 | pale grey-green inactive LCD',front,-.031,.0005,.081,.026,lcd,.0018,.0003)
# RS232 D-sub connector. Its face remains inside the measured 180 mm envelope.
outer=[(-.013,.005),(.013,.005),(.011,-.005),(-.011,-.005)]
inner=[(-.0108,.0034),(.0108,.0034),(.0093,-.0034),(-.0093,-.0034)]
rings=[[(x,y,-.0007) for x,y in outer],[(x,y,.0007) for x,y in outer],[(x,y,.0007) for x,y in inner],[(x,y,-.0005) for x,y in inner]]
verts=[tuple(point(side,x,y,z)) for ring in rings for x,y,z in ring];faces=[]
for j in range(3):
 for i in range(4):faces.append((j*4+i,j*4+(i+1)%4,(j+1)*4+(i+1)%4,(j+1)*4+i))
shield=mesh('11 | RS232 hollow D-sub metal shield',verts,faces,brass,.00012)
plane('11 | RS232 dark insert',side,0,0,.020,.0064,black,.00040,.0006)
for row,cols in [(1,5),(-1,4)]:
 for i in range(cols):
  x=(i-(cols-1)/2)*.0036;y=row*.0015
  # Small gold contact points, visually subordinate to the shield.
  cylinder('11 | serial contact',point(side,x,y,.00062),.00045,.00012,brass,12,side[3])
for y in [-.0158,.0158]:cylinder('11 | connector fixing screw',point(side,y,0,0),.0014,.0014,rim,20,side[3])
# Rear power inlet and its physically printed rating from the rear reference.
cylinder('12 | rear DC inlet',(-.070,.1178,.030),.004,.0013,black,32,rear[3])
cylinder('12 | DC socket opening',(-.070,.1183,.030),.002,.00035,rubber,24,rear[3])
plane('12 | rear DC rating label',rear,.044,-.002,.044,.009,labelwhite,.00035,.0005)
curve=bpy.data.curves.new('DC rating print','FONT');curve.body='DC 9V 300mA';curve.size=.0028;curve.align_x='CENTER';curve.align_y='CENTER';curve.resolution_u=5
text=bpy.data.objects.new('12 | DC 9V 300mA marking',curve);product.objects.link(text);text.location=point(rear,.044,-.002,.0005);orient(text,rear);text.data.materials.append(ink)
bpy.context.view_layer.objects.active=text;text.select_set(True);bpy.ops.object.convert(target='MESH');text.select_set(False)
root=bpy.data.objects.new('SUNFORD FEH5KS | 180 x 240 x 80 mm',None);product.objects.link(root)
for o in list(product.objects):
 if o!=root:o.parent=root
root['model']='FEH5KS';root['dimensions_cm']=[18,24,8];root['tray_cm']=[17,14];root['tray_orientation_note']='Front width approx. 17 cm, depth 14 cm. Catalog dimension-arrow image specifies 16.8 x 14 cm; user photo rounds it to 17 x 14. Overall user table is 18 x 24 x 8 cm.';root['accuracy_note']='Overall dimensions and tray use supplied rounded measurements. Unmeasured edge radii, port construction and recess depths are visual estimates.'
# Transparent studio; no ground plane or advertising graphics are included.
world=bpy.data.worlds.new('Neutral soft studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.73,.75,.78,1);world.node_tree.nodes['Background'].inputs[1].default_value=.27;s.world=world
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,location,energy,w,h,color):
 data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.shape='RECTANGLE';data.size=w;data.size_y=h;data.color=color;o=bpy.data.objects.new(name,data);studio.objects.link(o);o.location=location;aim(o,(0,0,.04))
area('Key | broad softbox',(-.28,-.35,.48),3.8,.38,.25,(1,.98,.96));area('Fill | right reflection',(.28,.05,.30),2.3,.16,.36,(.91,.95,1));area('Rim | back strip',(-.07,.24,.40),3.9,.30,.13,(1,1,1));area('Front | panel fill',(0,-.35,.15),.5,.25,.16,(1,1,1))
data=bpy.data.cameras.new('Product camera');camera=bpy.data.objects.new('Product camera',data);studio.objects.link(camera);s.camera=camera;data.type='ORTHO';data.ortho_scale=.22;data.lens=70;data.clip_start=.001;camera.location=(0,-.46,.30);aim(camera,(0,-.004,.042))
s.render.engine='CYCLES';s.cycles.samples=64;s.cycles.use_denoising=True;s.render.resolution_x=1500;s.render.resolution_y=1400;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.view_settings.exposure=-.2
for screen in bpy.data.screens:
 for a in screen.areas:
  if a.type=='VIEW_3D':a.spaces.active.region_3d.view_distance=.4;a.spaces.active.region_3d.view_location=(0,0,.04);a.spaces.active.region_3d.view_rotation=camera.rotation_euler.to_quaternion();a.spaces.active.shading.type='MATERIAL';a.spaces.active.clip_start=.001
bpy.ops.object.select_all(action='DESELECT');export_web(product,root,OUT/'feh5ks.glb');bpy.context.view_layer.objects.active=upper
s.render.filepath=str(OUT/'feh5ks-front.png');bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'feh5ks.blend'));bpy.ops.render.render(write_still=True)
s.render.resolution_percentage=70;s.cycles.samples=48
for name,location,target,scale in [('preview',(.29,-.43,.31),(0,-.002,.041),.305),('rear',(-.22,.42,.22),(0,.015,.040),.335),('side',(.45,0,.15),(0,0,.040),.285)]:
 camera.location=location;aim(camera,target);data.ortho_scale=scale;s.render.filepath=str(OUT/('feh5ks-'+name+'.png'));bpy.ops.render.render(write_still=True)
print('FEH5KS_MODEL_COMPLETE',flush=True)
