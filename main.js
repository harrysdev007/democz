import './style.css';
import { createPlaza } from './plaza.js';
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
renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
scene.background=new THREE.Color('#82c5f7');
scene.fog=new THREE.Fog('#b7d8f5',35,90);
const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,100);
const target=new THREE.Vector3(mobile?0:-1.5,2.3,0);
const home=new THREE.Vector3(mobile?7:9,mobile?5:4.8,mobile?15:15);
camera.position.copy(home);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.copy(target);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=22;controls.maxPolarAngle=Math.PI*.49;controls.minPolarAngle=.65;controls.enableRotate=false;
scene.add(new THREE.HemisphereLight('#dcefff','#767b89',2.5));
const sun=new THREE.DirectionalLight('#fff0dd',4);sun.position.set(-3,11,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15});sun.shadow.normalBias=.04;scene.add(sun);
const rim=new THREE.DirectionalLight('#7dbbff',3);rim.position.set(6,7,-5);scene.add(rim);
createPlaza(scene);
const loading=document.querySelector('#loading');
const guardianPivot=new THREE.Group();guardianPivot.position.set(.7,.28,1);scene.add(guardianPivot); const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.load('/guardian.glb',gltf=>{const model=gltf.scene;const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const scale=5.3/size.y;model.scale.setScalar(scale);model.position.set(.7-center.x*scale,.28-box.min.y*scale,1-center.z*scale);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});model.position.sub(guardianPivot.position);guardianPivot.add(model);loading.style.opacity=0;setTimeout(()=>loading.remove(),750);},e=>{document.querySelector('#progress').textContent=e.total?`MODEL ${Math.round(e.loaded/e.total*100)}%`:'LOADING OPTIMIZED MODEL';},()=>{document.querySelector('#progress').textContent='MODEL COULD NOT LOAD — SCENE READY';setTimeout(()=>loading.remove(),2500);});
const archives=[{label:'THE GUARDIAN',point:new THREE.Vector3(3.6,3,1),title:'BLUE ARMOR.\nBULL ENERGY.',text:'When the red cavern stirred, DEMOCZ emerged. A familiar face, a blue suit of armor, and one enormous green candle. In this fictional universe, the guardian turns election-night chaos into pure meme energy.'},{label:'THE CAPITOL',point:new THREE.Vector3(-4,1,-6),title:'THE BLUE\nAWAKENING',text:'November 4, 2026. Democrats take Congress. Bitcoin recovers after an initial election-night dip. That reversal becomes our origin myth: the red portal opens, and the green spear lights up. The headlines are real. The guardian is our imagination.',links:[['ELECTION RESULTS · AP','https://apnews.com/article/b1d26390b7ed7968435089be6d3bf612'],['MARKET REBOUND · COINDESK','https://www.coindesk.com/markets/2026/11/04/bitcoin-rebounds-from-midterm-dip-as-defi-leads-gains']]},{label:'THE SIGNAL',point:new THREE.Vector3(3,.5,3),title:'ONE TICKER.\n$DCZ.',text:'Democratic blue. Crypto green. Minotaur strength. DEMOCZ is an independent fictional meme character inspired by the collision of politics and crypto culture. DEMOCZ is a meme coin on Solana. Contract address and launch details have not been announced.'}];
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
renderer.setAnimationLoop(()=>{const t=clock.getElapsedTime();controls.update();for(const a of archives){projected.copy(a.point).project(camera);a.button.style.left=`${(projected.x*.5+.5)*innerWidth}px`;a.button.style.top=`${(-projected.y*.5+.5)*innerHeight}px`;a.button.style.display=projected.z>1?'none':'';}renderer.render(scene,camera);});





