import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

import { ParallaxBarrierEffect } from 'three/addons/effects/ParallaxBarrierEffect.js';

// Setup

let mouseX = 0;
let mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

document.addEventListener( 'mousemove', onDocumentMouseMove );

const scene = new THREE.Scene();
//scene.background = new THREE.Color('rgb(36,43,51)');
scene.background = new THREE.TextureLoader().load( "textures/bg.png" );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true
});

//const controls = new OrbitControls( camera, renderer.domElement );

const loader = new GLTFLoader();

let mixer;

let characterObjectsToOutline = [];
let objectsToOutline = [];
let composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

let characterOutlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
let outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );

characterOutlinePass.visibleEdgeColor.set('rgb(0, 0, 0)');
characterOutlinePass.hiddenEdgeColor.set('#000000');
characterOutlinePass.edgeThickness = 2;

outlinePass.visibleEdgeColor.set('#000000');
outlinePass.edgeThickness = 2;

characterOutlinePass.edgeGlow = 0; // Enable or increase glow (if needed)
outlinePass.edgeGlow = 0; // Enable or increase glow (if needed)

composer.addPass( characterOutlinePass );
composer.addPass( outlinePass );

let effectFXAA = new ShaderPass( FXAAShader );
effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
composer.addPass( effectFXAA );

loader.load( 'model.gltf', function ( gltf ) {

    addOutlineObject(gltf.scene);
	scene.add( gltf.scene );
    
    // Rotate the model 90 degrees on the Y-axis
    gltf.scene.rotation.y = 190 * (Math.PI / 180);
    
    // Check if the model has animations
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }

}, undefined, function ( error ) {

	console.error( error );

} );

function addOutlineObject(object){
  let firstMesh = null;

  // Traverse the object hierarchy to find the first mesh
  object.traverse((child) => {
    if (child.isMesh && !firstMesh) {
      firstMesh = child; // Assign the first mesh and stop further assignment
    }
    else{
      objectsToOutline.push(child);
    }
  });

  // If a mesh is found, add it to the outline objects array
  if (firstMesh) {
    characterObjectsToOutline.push(firstMesh);
    characterOutlinePass.selectedObjects = characterObjectsToOutline;
  }
  outlinePass.selectedObjects = objectsToOutline;
  
}

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
composer.setPixelRatio(window.devicePixelRatio);
composer.setSize(window.innerWidth, window.innerHeight);

const modelPosition = new THREE.Vector3(-1, 0.5, 0); // Model's position
//controls.target.set(-1, 0.5, 0);

// Shift the camera to the left on the X-axis
const originalCameraPos = new THREE.Vector3(-1.25, 1.25, 2);
camera.position.set(-1, 1.5, 2);

// Make the camera look at the model
camera.lookAt(modelPosition);
camera.updateProjectionMatrix();

renderer.render(scene, camera);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 2, 0);
pointLight.intensity = 1;

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.intensity = 5;
scene.add(pointLight, ambientLight);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  //controls.update();
  camera.position.x = lerp(camera.position.x, originalCameraPos.getComponent(0) + (mouseX  * 0.1), 0.05);
  camera.position.y = lerp(camera.position.y, originalCameraPos.getComponent(1) + (mouseY  * 0.1), 0.05);
  
  camera.lookAt(modelPosition);
  camera.updateProjectionMatrix();
    
  // Get the time delta since the last frame
  const delta = clock.getDelta();

  // Update the mixer for animation
  if (mixer) {
    mixer.update(delta); // Update based on time delta, here it's 0.01 for simplicity
  }

  //renderer.render(scene, camera);
  composer.render(scene, camera);
}

animate();

function onDocumentMouseMove( event ) {
    if((( event.clientX - windowHalfX ) / 100) > 0){
      mouseX = ( event.clientX - windowHalfX ) / 100;
      mouseY = ( event.clientY - windowHalfY ) / 100;
    }
  else{
      mouseX = 0;
      mouseY = 0;
  }
  
    console.log("X: " + mouseX + " Y: " + mouseY);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}