"""Render only contributing product layers; preserve the full editable compositor in .blend."""
import bpy,time,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];OUT=ROOT/'outputs'/'sunford-multi-scale';WORK=ROOT/'work'/'multi-scale';FRAMES=WORK/'frames';FRAMES.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'sunford-multi-scale.blend'));s=bpy.context.scene
config=json.loads((OUT/'products.json').read_text());timeline=json.loads((OUT/'camera-timeline.json').read_text());started=time.monotonic()
for frame in range(1,s.frame_end+1):
 destination=FRAMES/('frame-%04d.png'%frame)
 if destination.exists():continue
 s.frame_set(frame)
 for product,weight in zip(config['products'],timeline['frames'][frame-1]['weights']):s.view_layers[product['name']].use=weight>0
 s.render.filepath=str(destination);bpy.ops.render.render(write_still=True)
 print('FINISHED_FRAME',frame,flush=True)
print('MULTI_MODEL_RENDER_COMPLETE',time.monotonic()-started,flush=True)
