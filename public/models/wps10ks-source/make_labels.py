"""Recreate the photographed WPS10KS membrane printing as clean, editable artwork."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
OUT=Path(__file__).resolve().parent
FONT=Path('/System/Library/Fonts/Supplemental')
def font(size,bold=False,italic=False):
 name='Arial'+(' Bold' if bold else '')+(' Italic' if italic else '')+'.ttf'
 return ImageFont.truetype(str(FONT/name),size)
def create(name,w,h,rear=False):
 S=12;W=round(w*S);H=round(h*S)
 im=Image.new('RGB',(W,H),(4,79,128));d=ImageDraw.Draw(im)
 def pos(x,y):return ((x+w/2)*S,(h/2-y)*S)
 def rect(x,y,ww,hh,fill,r=0):
  cx,cy=pos(x,y);d.rounded_rectangle((cx-ww*S/2,cy-hh*S/2,cx+ww*S/2,cy+hh*S/2),radius=r*S,fill=fill)
 def txt(x,y,text,size=2.1,bold=False,italic=False,fill='white',anchor='mm'):
  d.text(pos(x,y),text,font=font(round(size*S),bold,italic),fill=fill,anchor=anchor)
 if not rear:
  txt(-52,27,'SUNFORD',6.2,True,True)
  txt(-9,26.3,'WPS10KS',2.3)
  rect(-26,1,105,35,(5,10,10),.5)
  for k,y in enumerate([14,6,-2]):
   txt(-78,y,'+'*(3-k),2.1)
  txt(-50,-20,'PCS   ZERO   TARE     STABLE',2.1)
  txt(-50,-27.2,'Max 10kg  Min 10g  e=0.5g/1g',1.9)
  txt(-50,-30.1,'Class II     0.5g / 1g',1.6)
  txt(6,-21.8,'kg',5,True);txt(17,-21.8,'g',4.8,True)
  keys=[(42,10,'UNIT',False),(65,10,'ON\nOFF',True),(42,-8,'TARE',False),(65,-8,'ZERO',False)]
  for x,y,label,green in keys:
   color=(0,199,63) if green else (243,247,247)
   rect(x,y,19,13,color,.6)
   for i in range(8):
    yy=y-6+i*1.7
    cx,cy=pos(x,yy);d.line((cx-13*S,cy,cx+13*S,cy),fill=color,width=round(.4*S))
   lines=label.split('\n')
   if len(lines)==2:
    txt(x,y+2.5,lines[0],4.1,True,False,'white');txt(x,y-2.5,lines[1],3.6,True,False,'white')
   else:txt(x,y,label,3.4,False,False,(27,100,144))
  txt(42,-22,'+',3.5);txt(65,-22,'\u2190',4)
 else:
  txt(-41,17.2,'SUNFORD',5.0,True,True);txt(50,17.2,'WPS10KS',2.5)
  rect(0,0,118,28,(5,10,10),.5)
  txt(-24,-18,'PCS  ZERO  TARE     STABLE',2.3)
  txt(44,-18,'kg',5.0,True);txt(57,-18,'g',4.5,True)
  for k,y in enumerate([10,3,-4]):txt(-63,y,'+'*(3-k),2.1)
 im.save(OUT/name,optimize=True)
create('front-panel.png',166,71)
create('rear-panel.png',132,45,True)
print('Membrane artwork ready')
