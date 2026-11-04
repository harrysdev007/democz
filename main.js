import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const mobile = innerWidth < 700;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({canvas:document.querySelector('#world'),antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();
scene.background=new THREE.Color('#27384a');
scene.fog=new THREE.FogExp2('#344457',.027);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,100);
const target=new THREE.Vector3(mobile?0:-1.5,2.3,0);
const home=new THREE.Vector3(mobile?7:9,mobile?5:4.8,mobile?15:15);
camera.position.copy(home);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.copy(target);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=22;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.65;controls.enableRotate=false;
scene.add(new THREE.HemisphereLight('#dcefff','#767b89',2.5));
const sun=new THREE.DirectionalLight('#fff0dd',4);sun.position.set(-3,11,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15});sun.shadow.normalBias=.04;scene.add(sun);
const rim=new THREE.DirectionalLight('#7dbbff',3);rim.position.set(6,7,-5);scene.add(rim);
const stone=new THREE.MeshStandardMaterial({color:'#64717c',roughness:.92,flatShading:true});
const darkStone=new THREE.MeshStandardMaterial({color:'#404c5a',roughness:.95,flatShading:true});
function block(x,y,z,w,h,d,material=stone){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
block(0,-.35,0,60,.7,60);
let seed=37;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
for(let row=0;row<7;row++){for(let i=-9;i<10;i++){const x=i*2.1;const z=-5-row*2;const h=1+row*1.25+random()*.6;block(x,h/2-.2,z,2.2,h,2.4,row%2?stone:darkStone);}}
for(let side of [-1,1])for(let j=0;j<11;j++){const h=2+random()*4;block(side*(10+random()*3),h/2-1,6-j*1.6,3,h,2.2,darkStone);}
for(let i=0;i<30;i++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.25+random()*.7,0),stone);rock.position.set((random()-.5)*25,.1,(random()-.5)*19);rock.scale.y=.5;rock.rotation.set(random(),random(),random());rock.castShadow=true;rock.receiveShadow=true;scene.add(rock);}
for(let i=0;i<19;i++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(3+random()*2,0),darkStone);rock.position.set((i-9)*2.5,11+random()*1.5,-7+random()*3);rock.scale.set(1.3,.7,1.2);scene.add(rock);}
const red=new THREE.MeshStandardMaterial({color:'#9c2441',roughness:.8});
function tree(x,z,size){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12*size,.23*size,2.2*size,6),new THREE.MeshStandardMaterial({color:'#4b3a42'}));trunk.position.set(x,size,z);scene.add(trunk);for(let i=0;i<8;i++){const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(size*.7,0),red);leaf.position.set(x+(random()-.5)*size*1.8,size*2+random()*size*.7,z+(random()-.5)*size);leaf.scale.y=.55;scene.add(leaf);}}
tree(5,-4,1.5);tree(-8,-6,1);for(let i=0;i<22;i++){const x=(random()-.5)*23,z=(random()-.5)*18;if(Math.abs(x)>3)tree(x,z,.12+random()*.15);}
const portal=new THREE.Group();portal.position.set(-5.6,0,-3);scene.add(portal);
function portalStone(x,y,w,h){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,.7),stone);m.position.set(x,y,0);m.castShadow=true;portal.add(m);}
portalStone(-1.05,1.7,.5,3.4);portalStone(1.05,1.7,.5,3.4);portalStone(0,3.45,2.6,.5);
const portalMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){float f=sin(vUv.y*23.+sin(vUv.x*15.+time)*3.+time)*sin(vUv.x*19.-time*.5);vec3 c=mix(vec3(.35,.015,.04),vec3(1.,.15,.09),pow(abs(f),7.));gl_FragColor=vec4(c,1.);}',side:THREE.DoubleSide});
const gate=new THREE.Mesh(new THREE.PlaneGeometry(1.7,3.2),portalMaterial);gate.position.set(0,1.65,.03);portal.add(gate);const glow=new THREE.PointLight('#ff3c43',18,10,2);glow.position.set(-5.6,2,-1.5);scene.add(glow);
const pedestal=block(.7,.13,1,3.8,.26,3.8,new THREE.MeshStandardMaterial({color:'#526575',metalness:.3,roughness:.6}));
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.85,.025,8,80),new THREE.MeshBasicMaterial({color:'#73cfff'}));ring.rotation.x=Math.PI/2;ring.position.set(.7,.28,1);scene.add(ring);
const loading=document.querySelector('#loading');
const guardianPivot=new THREE.Group();guardianPivot.position.set(.7,.28,1);scene.add(guardianPivot); const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.load('/guardian.glb',gltf=>{const model=gltf.scene;const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const scale=5.3/size.y;model.scale.setScalar(scale);model.position.set(.7-center.x*scale,.28-box.min.y*scale,1-center.z*scale);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});model.position.sub(guardianPivot.position);guardianPivot.add(model);loading.style.opacity=0;setTimeout(()=>loading.remove(),750);},e=>{document.querySelector('#progress').textContent=e.total?`MODEL ${Math.round(e.loaded/e.total*100)}%`:'LOADING OPTIMIZED MODEL';},()=>{document.querySelector('#progress').textContent='MODEL COULD NOT LOAD — SCENE READY';setTimeout(()=>loading.remove(),2500);});
const archives=[{label:'THE GUARDIAN',point:new THREE.Vector3(2.5,4.3,1),title:'BLUE ARMOR.\nBULL ENERGY.',text:'When the red cavern stirred, DEMOCZ emerged. A familiar face, a blue suit of armor, and one enormous green candle. In this fictional universe, the guardian turns election-night chaos into pure meme energy.'},{label:'THE PORTAL',point:new THREE.Vector3(-5.5,3.8,-3),title:'THE BLUE\nAWAKENING',text:'November 4, 2026. Democrats take Congress. Bitcoin recovers after an initial election-night dip. That reversal becomes our origin myth: the red portal opens, and the green spear lights up. The headlines are real. The guardian is our imagination.',links:[['ELECTION RESULTS · AP','https://apnews.com/article/b1d26390b7ed7968435089be6d3bf612'],['MARKET REBOUND · COINDESK','https://www.coindesk.com/markets/2026/11/04/bitcoin-rebounds-from-midterm-dip-as-defi-leads-gains']]},{label:'THE SIGNAL',point:new THREE.Vector3(3,.5,3),title:'ONE TICKER.\n$DEMOCZ.',text:'Democratic blue. Crypto green. Minotaur strength. DEMOCZ is an independent fictional meme character inspired by the collision of politics and crypto culture. Token network, contract address and launch details have not been announced.'}];
const panel=document.querySelector('#hologram');let lastTrigger;
function openArchive(index,trigger){lastTrigger=trigger;const a=archives[index];document.querySelector('#panel-number').textContent=`ARCHIVE / 00${index+1}`;document.querySelector('#panel-title').innerText=a.title;document.querySelector('#panel-copy').textContent=a.text;const links=document.querySelector('#panel-links');links.replaceChildren();for(const [label,url]of a.links||[]){const link=document.createElement('a');link.textContent=label+' ↗';link.href=url;link.target='_blank';link.rel='noopener noreferrer';links.append(link);}panel.hidden=false;panel.style.animation='none';void panel.offsetWidth;panel.style.animation='';document.querySelector('#close').focus();}
function close(){panel.hidden=true;lastTrigger?.focus();}
document.querySelector('#close').onclick=close;document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'&&!panel.hidden){const items=[...panel.querySelectorAll('button,a')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}});
for(const[a,i]of archives.map((a,i)=>[a,i])){a.button=document.createElement('button');a.button.className='beacon';a.button.textContent=`0${i+1} / ${a.label}`;a.button.onclick=()=>openArchive(i,a.button);document.querySelector('#markers').append(a.button);}
document.querySelector('#about').onclick=e=>openArchive(0,e.currentTarget);document.querySelector('#explore').onclick=e=>openArchive(1,e.currentTarget);document.querySelector('#reset').onclick=()=>{camera.position.copy(home);controls.target.copy(target);guardianPivot.rotation.y=0;};
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const clock=new THREE.Clock();const projected=new THREE.Vector3();
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();
let rotatingPointer=null;
let previousX=0;
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',event=>{
  const bounds=canvas.getBoundingClientRect();
  pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  if(!raycaster.intersectObject(guardianPivot,true).length)return;
  rotatingPointer=event.pointerId;
  previousX=event.clientX;
  canvas.setPointerCapture(event.pointerId);
  canvas.style.cursor='grabbing';
});
canvas.addEventListener('pointermove',event=>{
  if(event.pointerId!==rotatingPointer)return;
  guardianPivot.rotation.y+=(event.clientX-previousX)*.012;
  previousX=event.clientX;
});
function stopRotation(event){
  if(event.pointerId!==rotatingPointer)return;
  rotatingPointer=null;
  if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
  canvas.style.cursor='grab';
}
canvas.addEventListener('pointerup',stopRotation);
canvas.addEventListener('pointercancel',stopRotation);
canvas.addEventListener('lostpointercapture',stopRotation);
canvas.style.cursor='grab';
renderer.setAnimationLoop(()=>{const t=clock.getElapsedTime();portalMaterial.uniforms.time.value=reduced?0:t;controls.update();for(const a of archives){projected.copy(a.point).project(camera);a.button.style.left=`${(projected.x*.5+.5)*innerWidth}px`;a.button.style.top=`${(-projected.y*.5+.5)*innerHeight}px`;a.button.style.display=projected.z>1?'none':'';}renderer.render(scene,camera);});


