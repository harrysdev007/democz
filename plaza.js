import * as THREE from 'three';

export function createPlaza(scene) {
  const material = color => new THREE.MeshStandardMaterial({ color, roughness: .72 });
  const ivory = material('#e5e9ed');
  const trim = material('#c1cedc');
  const blue = material('#174cce');
  const green = material('#5c9f49');
  const leaves = material('#43854a');
  const paving = material('#a5aabd');
  function mesh(geometry, surface, x, y, z) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x,y,z);
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    return object;
  }
  const box = (x,y,z,w,h,d,surface=ivory) => mesh(new THREE.BoxGeometry(w,h,d),surface,x,y,z);
  const cylinder = (x,y,z,r,h,surface=ivory) => mesh(new THREE.CylinderGeometry(r,r,h,32),surface,x,y,z);
  box(0,-.2,0,100,.4,100,paving);
  // Broad lawn and symmetrical landscaped approach.
  for (const side of [-1,1]) {
    box(side*12,.02,-5,13,.08,29,green);
    box(side*7,.18,0,2,.36,13,trim);
    box(side*7,.45,0,1.8,.4,12,leaves);
    for(let i=0;i<28;i++) {
      const flowerMaterial=material(['#ab87ed','#d3bcff','#74a9eb','#f2efff'][i%4]);
      const x=side*(6.4+(i%3)*.5), z=-5+Math.floor(i/3)*1.15;
      mesh(new THREE.SphereGeometry(.22,8,6),flowerMaterial,x,.8,z);
    }
    for(let i=0;i<5;i++) {
      const x=side*(10+i*.9),z=-7-i*4;
      cylinder(x,1.8,z,.15,3.6,material('#795d43'));
      mesh(new THREE.SphereGeometry(1.5,12,10),leaves,x,4,z);
    }
  }
  // Stylized Capitol, built as actual 3D architecture.
  const buildingStart=scene.children.length; const buildingX=1, buildingZ=-18;
  box(buildingX,2.4,buildingZ,27,4.8,5);
  box(buildingX,5,buildingZ,28,.4,5.5,trim);
  box(buildingX,3,buildingZ+2.2,10,6,1.5);
  box(buildingX,6.2,buildingZ+2.2,11,.4,2,trim);
  for(let x=-12;x<=14;x+=1.35) {
    cylinder(x,2.7,buildingZ+2.9,.19,4.5);
    box(x,2.6,buildingZ+2.55,.55,2.8,.1,material('#71869c'));
  }
  for(let i=0;i<5;i++) box(buildingX,.12+i*.12,buildingZ+5-i*.3,12-i*.5,.24,3-i*.3,trim);
  cylinder(buildingX,6.6,buildingZ,3.3,1.1);
  cylinder(buildingX,7.4,buildingZ,3,.65,trim);
  for(let i=0;i<24;i++) {
    const angle=i/24*Math.PI*2;
    cylinder(buildingX+Math.cos(angle)*2.7,8.2,buildingZ+Math.sin(angle)*2.7,.12,1.6);
  }
  cylinder(buildingX,9.1,buildingZ,3,.25,trim);
  mesh(new THREE.SphereGeometry(3,48,24,0,Math.PI*2,0,Math.PI/2),ivory,buildingX,9.2,buildingZ);
  cylinder(buildingX,12.45,buildingZ,.42,.7);
  mesh(new THREE.ConeGeometry(.6,.5,16),trim,buildingX,13,buildingZ);
  cylinder(buildingX,13.5,buildingZ,.09,.7,trim);
  const architecture=new THREE.Group(); const parts=scene.children.slice(buildingStart); for(const part of parts) architecture.add(part); architecture.scale.setScalar(.65); architecture.position.set(-1,0,-8); scene.add(architecture);
  function bannerTexture() {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=384;
    const context=canvas.getContext('2d');
    context.fillStyle='#1653c9';context.fillRect(0,0,256,384);
    context.strokeStyle='white';context.lineWidth=12;context.beginPath();context.arc(128,150,76,0,Math.PI*2);context.stroke();
    context.fillStyle='white';context.font='bold 114px sans-serif';context.textAlign='center';context.fillText('D',128,190);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  const bannerMaterial=new THREE.MeshStandardMaterial({map:bannerTexture(),side:THREE.DoubleSide,roughness:.8});
  for(const side of [-1,1]) for(let i=0;i<3;i++) {
    const x=side*(5.4+i*1.1),z=-1-i*6;
    cylinder(x,2.6,z,.07,5.2,material('#344c67'));
    cylinder(x,5.15,z,.24,.12,trim);
    mesh(new THREE.SphereGeometry(.3,20,16),new THREE.MeshStandardMaterial({color:'#fff2cb',emissive:'#ffe0a0',emissiveIntensity:.35}),x,5.5,z);
    mesh(new THREE.PlaneGeometry(1,1.5),bannerMaterial,x+.55,3.7,z);
  }
  mesh(new THREE.PlaneGeometry(2.2,3),bannerMaterial,buildingX,3.9,buildingZ+3.1);
  const cloudMaterial=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1});
  for(let i=0;i<9;i++) for(let j=0;j<3;j++) {
    const cloud=mesh(new THREE.SphereGeometry(1.5,12,8),cloudMaterial,-28+i*7+j,17+(i%3)*2,-32-(i%2)*8);
    cloud.scale.set(1.5,.6,1);
    cloud.castShadow=false;
  }
}

