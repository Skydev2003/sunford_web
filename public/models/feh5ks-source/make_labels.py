"""Clean reconstructed FEH5KS membrane printing; all markings follow the supplied photo."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
BASE=Path(__file__).resolve().parent;FONTS=Path('/System/Library/Fonts/Supplemental');S=12;W,H=160,66
im=Image.new('RGB',(W*S,H*S),(164,178,191));d=ImageDraw.Draw(im)
def font(mm,bold=False):return ImageFont.truetype(str(FONTS/('Arial Bold.ttf' if bold else 'Arial.ttf')),round(mm*S))
def xy(x,y):return ((x+W/2)*S,(H/2-y)*S)
def box(x,y,w,h,fill,r=0,outline=None,line=.3):
 cx,cy=xy(x,y);d.rounded_rectangle((cx-w*S/2,cy-h*S/2,cx+w*S/2,cy+h*S/2),radius=r*S,fill=fill,outline=outline,width=max(1,round(line*S)))
def text(x,y,s,mm=3,color=(240,243,245),bold=False,anchor='mm'):d.text(xy(x,y),s,font=font(mm,bold),fill=color,anchor=anchor)
black=(17,23,34);ink=(17,22,30);white=(225,231,238);yellow=(250,223,0)
box(0,.5,160,37,black)
text(-46,26,'SUNFORD',8.1,ink,True)
text(2,25.2,'FEH5KS',3.3,ink)
box(-31,.5,81,26,(96,122,116),.25)
text(14,13,'kg',3.8,white,True);text(14,6,'g',3.8,white,True)
box(29,10,17.5,18,(0,157,219),1.5)
text(29,13.8,'ON',6,white);text(29,6.5,'OFF',4.8,white)
box(49,10,17.5,18,yellow,1.5);text(49,10,'UNIT',5.0,ink)
box(69,10,17.5,18,black,1.2,yellow,.6);text(69,10,'ZERO',4.5,yellow)
box(29,-8.8,17.3,7.3,black,.4,(170,184,196),.45);text(29,-8.8,'SET',3.9,(187,201,210))
a,b=xy(38.6,-8.8),xy(42.5,-8.8);d.line([a,b],fill=(177,190,203),width=3)
text(49,-8.8,'DATA',2.7,(185,198,212))
box(69,-9.2,17.5,7.4,(153,166,183),.8);text(69,-9.2,'PRINT',3.8,(224,232,240))
text(-56,-16.0,'Stable',3.3,white);text(-22,-16.0,'Zero',3.3,white)
text(0,-25.6,'MAX.5.000kg MIN.20g d=1g',4.3,ink)
im.save(BASE/'front-panel.png',optimize=True)
print('FEH5KS front artwork ready')
