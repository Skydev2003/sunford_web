const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const mod=(v,n)=>((v%n)+n)%n;
const ease=v=>v*v*v*(v*(v*6-15)+10);
export function validateConfig(config){
 if(!Array.isArray(config.products)||!config.products.length)throw Error('Add at least one product');
 if(!(config.seconds_per_product>0)||!(config.transition_seconds>0)||config.transition_seconds>=config.seconds_per_product)throw Error('Invalid sequence timing');
 if(!(config.safe_margin>0&&config.safe_margin<.3))throw Error('Invalid safe margin');
 for(const p of config.products)if(!p.src||!p.dimensions_m?.every(v=>Number.isFinite(v)&&v>0))throw Error('Every model needs a source and positive dimensions');
 return config;
}
function rotation(config,t){
 const cycles=Math.floor(t/config.seconds_per_product),u=mod(t,config.seconds_per_product)/config.seconds_per_product,k=config.rotation_keys;
 const ds=k.slice(1).map((b,i)=>(b[1]-k[i][1])/(b[0]-k[i][0]));
 const slopes=k.map((_,i)=>i===0||i===k.length-1?0:(ds[i-1]*ds[i]<=0?0:2/(1/ds[i-1]+1/ds[i])));
 let i=k.findIndex((a,j)=>k[j+1]&&u>=a[0]&&u<k[j+1][0]);if(i<0)i=k.length-2;
 const a=k[i],b=k[i+1],h=b[0]-a[0],v=(u-a[0])/h;
 return cycles*360+(2*v**3-3*v*v+1)*a[1]+(v**3-2*v*v+v)*h*slopes[i]+(-2*v**3+3*v*v)*b[1]+(v**3-v*v)*h*slopes[i+1];
}
export function sampleSequence(config,seconds){
 const n=config.products.length,duration=n*config.seconds_per_product,t=mod(seconds,duration),slot=(t+config.phase_offset_seconds)/config.seconds_per_product;
 const index=mod(Math.floor(slot),n),local=mod(t+config.phase_offset_seconds,config.seconds_per_product),half=config.transition_seconds/2;
 const weights=Array(n).fill(0);
 if(n===1)weights[0]=1;
 else if(local<half){const f=ease((local+half)/config.transition_seconds);weights[mod(index-1,n)]=1-f;weights[index]=f;}
 else if(local>config.seconds_per_product-half){const f=ease((local-config.seconds_per_product+half)/config.transition_seconds);weights[index]=1-f;weights[mod(index+1,n)]=f;}
 else weights[index]=1;
 return {seconds:t,duration,angle_degrees:rotation(config,t),weights};
}
export function requiredRadius(config,pose,aspect=config.width/config.height,fov=config.vertical_fov_degrees){
 const phi=config.polar_degrees*Math.PI/180,a=pose.angle_degrees*Math.PI/180;
 const right=[1,0,0],up=[0,Math.sin(phi),-Math.cos(phi)],back=[0,Math.cos(phi),Math.sin(phi)];
 const tanV=Math.tan(fov*Math.PI/360),tanH=tanV*aspect,limit=1-2*config.safe_margin;
 let radius=0;
 config.products.forEach((p,i)=>{
  if(pose.weights[i]<=1e-9)return;
  const [w,h,d]=p.dimensions_m;
  for(const x of [-w/2,w/2])for(const y of [0,h])for(const z of [-d/2,d/2]){
   const point=[Math.cos(a)*x+Math.sin(a)*z,y,-Math.sin(a)*x+Math.cos(a)*z];
   const q=point.map((v,j)=>v-config.target[j]),depth=dot(q,back);
   radius=Math.max(radius,depth+Math.abs(dot(q,right))/(tanH*limit),depth+Math.abs(dot(q,up))/(tanV*limit));
  }
 });
 return radius;
}
export function bakeTimeline(config){
 validateConfig(config);
 const duration=config.products.length*config.seconds_per_product,count=Math.round(duration*config.fps);
 // Calculate the camera path in normalized time so changing playback speed preserves framing.
 const normal={...config,seconds_per_product:8,transition_seconds:config.transition_seconds*8/config.seconds_per_product,phase_offset_seconds:config.phase_offset_seconds*8/config.seconds_per_product};
 const baseDuration=normal.products.length*8,baseCount=Math.round(baseDuration*config.fps);
 const basePoses=Array.from({length:baseCount},(_,i)=>sampleSequence(normal,i/config.fps));
 const raw=basePoses.map(p=>requiredRadius(normal,p)),speed=.10;
 const envelope=raw.map((v,i)=>Math.max(v,...raw.map((r,j)=>r-speed*Math.min(Math.abs(i-j),baseCount-Math.abs(i-j))/config.fps)));
 const sigma=4,range=12,gaussian=Array.from({length:range*2+1},(_,j)=>Math.exp(-.5*((j-range)/sigma)**2)),total=gaussian.reduce((a,b)=>a+b,0);
 const smooth=envelope.map((_,i)=>gaussian.reduce((v,w,j)=>v+w*envelope[mod(i+j-range,baseCount)],0)/total);
 const correction=Math.max(0,...raw.map((r,i)=>r-smooth[i]))+.008;
 const frames=Array.from({length:count},(_,i)=>{
  const p=sampleSequence(config,i/config.fps),position=i/count*baseCount,index=Math.floor(position),u=position-index;
  return {...p,radius:smooth[index]*(1-u)+smooth[(index+1)%baseCount]*u+correction};
 });
 frames.push({...frames[0],seconds:duration,angle_degrees:config.products.length*360});
 return {revision:config.revision,duration,fps:config.fps,width:config.width,height:config.height,frames};
}
export function sampleTimeline(config,timeline,seconds,aspect=config.width/config.height,fov=config.vertical_fov_degrees){
 const pose=sampleSequence(config,seconds),pos=pose.seconds*timeline.fps,index=Math.floor(pos),u=pos-index;
 const radius=timeline.frames[index].radius*(1-u)+timeline.frames[index+1].radius*u;
 return {...pose,radius:Math.max(radius,requiredRadius(config,pose,aspect,fov)+.008)};
}
export function projectedBounds(config,pose,aspect=config.width/config.height,fov=config.vertical_fov_degrees){
 const phi=config.polar_degrees*Math.PI/180,a=pose.angle_degrees*Math.PI/180,tanV=Math.tan(fov*Math.PI/360),tanH=tanV*aspect;
 const right=[1,0,0],up=[0,Math.sin(phi),-Math.cos(phi)],back=[0,Math.cos(phi),Math.sin(phi)],out=[];
 config.products.forEach((p,i)=>{
  if(pose.weights[i]<=1e-9)return;
  const [w,h,d]=p.dimensions_m;
  for(const x of [-w/2,w/2])for(const y of [0,h])for(const z of [-d/2,d/2]){
   const q=[Math.cos(a)*x+Math.sin(a)*z-config.target[0],y-config.target[1],-Math.sin(a)*x+Math.cos(a)*z-config.target[2]],depth=pose.radius-dot(q,back);
   out.push([.5+.5*dot(q,right)/(depth*tanH),.5+.5*dot(q,up)/(depth*tanV)]);
  }
 });
 return [Math.min(...out.map(v=>v[0])),Math.max(...out.map(v=>v[0])),Math.min(...out.map(v=>v[1])),Math.max(...out.map(v=>v[1]))];
}

export function playlistSignature(config){return JSON.stringify([config.products.map(p=>[p.id,p.src,p.dimensions_m]),config.seconds_per_product,config.transition_seconds,config.phase_offset_seconds,config.width,config.height,config.vertical_fov_degrees,config.polar_degrees,config.safe_margin,config.target,config.rotation_keys]);}
