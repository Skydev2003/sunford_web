import {bakeTimeline,sampleTimeline,validateConfig,playlistSignature} from './sequence-engine.mjs?v=slow-32';
const stage=document.querySelector('.stage'),layers=document.querySelector('#models'),video=document.querySelector('#video'),poster=document.querySelector('#poster'),status=document.querySelector('#status');
const playButton=document.querySelector('#play'),modeButton=document.querySelector('#mode'),params=new URL(location.href).searchParams;
if(params.get('embed')==='1')document.body.classList.add('embed');
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let playing=!preference.matches,mode='3d',elapsed=0,last=null,visible=true,ready=false,videoAvailable=false,config,timeline,models=[];
function refresh(){playButton.textContent=playing?'หยุดชั่วคราว':'เล่นแอนิเมชัน';playButton.setAttribute('aria-pressed',String(playing));}
function apply(seconds){
 if(!ready)return;
 const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
 const state=sampleTimeline(config,timeline,seconds,width/height);
 models.forEach((model,i)=>{
  const weight=state.weights[i];model.style.opacity=String(weight);model.setAttribute('aria-hidden',String(weight===0));
  if(weight>0){
   const p=sampleTimeline(config,timeline,seconds,width/height,model.getFieldOfView()||config.vertical_fov_degrees);
   model.cameraOrbit=`0deg ${config.polar_degrees}deg ${p.radius}m`;
   model.resetTurntableRotation(p.angle_degrees*Math.PI/180);model.jumpCameraToGoal();
  }
 });
 document.querySelectorAll('#products [data-product]').forEach((button,i)=>button.setAttribute('aria-pressed',String(state.weights[i]>=.5)));
 stage.dataset.product=config.products[state.weights.indexOf(Math.max(...state.weights))].id;
 stage.dataset.seconds=String(state.seconds);document.querySelector('#timeline').value=String(state.seconds);document.querySelector('#timecode').textContent=`${state.seconds.toFixed(1)} / ${timeline.duration.toFixed(1)}`;stage.dataset.weights=JSON.stringify(state.weights);
}
function seek(seconds){elapsed=((seconds%timeline.duration)+timeline.duration)%timeline.duration;last=null;apply(elapsed);if(mode==='video')video.currentTime=elapsed;}
async function start(){
 const response=await fetch('./products.json?v=slow-32');if(!response.ok)throw Error('Playlist unavailable');config=validateConfig(await response.json());timeline=bakeTimeline(config);document.querySelector('#timeline').max=String(timeline.duration);
 await customElements.whenDefined('model-viewer');
 const promises=config.products.map((p,i)=>{
  const model=document.createElement('model-viewer');models.push(model);
  model.setAttribute('src',p.src);model.setAttribute('alt',`เครื่องชั่ง SUNFORD ${p.name}`);model.setAttribute('camera-target',config.target.map(v=>`${v}m`).join(' '));
  model.setAttribute('camera-orbit',`0deg ${config.polar_degrees}deg 2m`);model.setAttribute('field-of-view',`${config.vertical_fov_degrees}deg`);
  model.setAttribute('min-camera-orbit','auto 0deg 0.01m');model.setAttribute('max-camera-orbit','auto 180deg 10m');
  model.setAttribute('shadow-intensity','0');model.setAttribute('exposure','1');model.setAttribute('tone-mapping','neutral');model.setAttribute('interpolation-decay','0');model.setAttribute('interaction-prompt','none');
  model.style.opacity='0';
  const loaded=new Promise((resolve,reject)=>{model.addEventListener('load',resolve,{once:true});model.addEventListener('error',()=>reject(Error(`Cannot load ${p.name}`)),{once:true});});layers.append(model);
  const button=document.createElement('button');button.textContent=p.name;button.dataset.product=p.id;button.onclick=()=>{seek(i*config.seconds_per_product);};document.querySelector('#products').append(button);
  return loaded;
 });
 await Promise.all(promises);ready=true;apply(elapsed);poster.hidden=true;stage.dataset.ready='true';
 status.textContent=`${config.products.map(p=>p.name).join(' → ')} · ${timeline.duration} วินาที · วนลูป`;
 try{const response=await fetch('./rendered-video.json');if(response.ok){const manifest=await response.json();videoAvailable=playlistSignature(manifest.config)===playlistSignature(config);modeButton.hidden=!videoAvailable;}}catch{}
 if(params.get('mode')==='video'&&videoAvailable)setMode('video');
}
function setMode(next){
 if(!ready)return;
 if(next==='video'){
  if(!videoAvailable)return;
  mode='video';layers.hidden=true;video.hidden=false;
  if(!video.src){const safari=/Safari/i.test(navigator.userAgent)&&!/Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(navigator.userAgent);video.src=safari?'./sunford-multi-scale-safari.mov':'./sunford-multi-scale.webm';}
  if(Number.isFinite(video.duration))video.currentTime=elapsed%video.duration;
  if(playing&&visible)video.play().catch(()=>{playing=false;refresh();});
 }else{elapsed=video.currentTime||elapsed;video.pause();mode='3d';layers.hidden=false;video.hidden=true;apply(elapsed);}
 modeButton.textContent=mode==='3d'?'ดูวิดีโอ':'ดูแบบ 3D สด';last=null;
}
video.muted=true;video.loop=true;video.playsInline=true;
video.addEventListener('loadedmetadata',()=>{if(mode==='video'){video.currentTime=elapsed%video.duration;if(playing&&visible)video.play().catch(()=>{});}});
video.addEventListener('timeupdate',()=>{if(mode==='video'&&ready){document.querySelector('#timeline').value=String(video.currentTime);document.querySelector('#timecode').textContent=`${video.currentTime.toFixed(1)} / ${video.duration.toFixed(1)}`;}});
video.addEventListener('error',()=>{setMode('3d');status.textContent='กำลังแสดงด้วยโมเดล 3D';});
playButton.onclick=()=>{playing=!playing;last=null;if(mode==='video'){if(playing&&visible)video.play().catch(()=>{playing=false;refresh();});else video.pause();}refresh();};
document.querySelector('#timeline').oninput=event=>{if(!ready)return;playing=false;video.pause();refresh();seek(Number(event.currentTarget.value));};
document.querySelector('#restart').onclick=()=>{if(ready)seek(0);};modeButton.onclick=()=>setMode(mode==='3d'?'video':'3d');
let background=0;document.querySelector('#background').onclick=event=>{background=(background+1)%3;document.body.classList.toggle('checker',background===1);document.body.classList.toggle('dark',background===2);event.currentTarget.textContent='พื้นหลัง: '+['โปร่งใส','ตาราง','เข้ม'][background];};
new ResizeObserver(()=>{apply(elapsed);requestAnimationFrame(()=>apply(elapsed));}).observe(stage);
let inView=true;function visibility(){visible=inView&&!document.hidden;last=null;if(mode==='video'){if(playing&&visible)video.play().catch(()=>{});else video.pause();}}
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;visibility();}).observe(stage);document.addEventListener('visibilitychange',visibility);
preference.addEventListener('change',event=>{if(event.matches){playing=false;video.pause();refresh();}});
function tick(now){if(ready&&playing&&visible&&mode==='3d'){if(last!==null)elapsed=(elapsed+Math.min((now-last)/1000,.1))%timeline.duration;apply(elapsed);}last=now;requestAnimationFrame(tick);}
refresh();requestAnimationFrame(tick);start().catch(error=>{playing=false;refresh();status.textContent='โหลดแอนิเมชันไม่สำเร็จ: '+error.message;stage.dataset.error=error.message;});
