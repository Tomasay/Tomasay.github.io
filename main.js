import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

import { ParallaxBarrierEffect } from 'three/addons/effects/ParallaxBarrierEffect.js';

// Setup

let mouseX = 0;
let mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

document.addEventListener( 'mousemove', onDocumentMouseMove );
let monitorScreenLightMode;

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("change", () => {

    console.log("mesh: " + monitorScreenLightMode);
    console.log("material: " + monitorScreenLightMode.material);
  
    gsap.to(monitorScreenLightMode.material, {
      duration: 0.5, // Duration in seconds
      opacity: themeToggle.checked ? 0 : 1,  // Target opacity
      ease: "power1.inOut"
    });
});

const loaderElement = document.getElementById('loader');
const progressBar = document.getElementById('loader-foreground');

// Track loading state
let assetsLoaded = false;
let domContentLoaded = false;

function updateProgress(percentage) {
  let translateYValue = lerp(128, 0, percentage/100);
  progressBar.style.transform = `translateY(${translateYValue}px)`;
}

function checkLoadingComplete() {
  if (assetsLoaded && domContentLoaded) {
    loaderElement.classList.add('hidden'); // Hide the loader
    document.getElementsByTagName("main")[0].style.display = 'block';
    animate(); // Start animation loop
    
    //Fade navbar in
    const navbar = document.querySelector(".navbar");
    navbar.style.opacity = 0;
    navbar.style.transition = "opacity 1s ease-in-out";

    // Trigger fade-in effect
    setTimeout(() => {
        navbar.style.opacity = 1;
    }, 100); // Small delay to ensure the transition is noticeable
    
    const lightDarkSwitch = document.querySelector(".switch");
    lightDarkSwitch.style.opacity = 0;
    lightDarkSwitch.style.transition = "opacity 1s ease-in-out";

    // Trigger fade-in effect
    setTimeout(() => {
        lightDarkSwitch.style.opacity = 1;
    }, 100); // Small delay to ensure the transition is noticeable
    
    // Animate the model to its final position
    gsap.to(loadedModel.scene.position, {
        x: 0, // Final X position
        duration: 2, // Animation duration in seconds
        ease: "elastic.out(1, 0.3)", // Elastic easing for recoil effect
    });
  }
}

// Listen for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  domContentLoaded = true;
  updateProgress(50);
  checkLoadingComplete();
});

const scene = new THREE.Scene();
//scene.background = new THREE.Color('rgb(36,43,51)');
//scene.background = new THREE.TextureLoader().load( "textures/bg.png" );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let originalCameraPos;
let lookAtPos;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true,
  antialias: true
});

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

//const controls = new OrbitControls( camera, renderer.domElement );

const loader = new GLTFLoader();

let mixer;

let composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

/*
let effectFXAA = new ShaderPass( FXAAShader );
effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
composer.addPass( effectFXAA );
*/

let loadedModel;
loader.load( 'model.gltf', function ( gltf ) {
    loadedModel = gltf;
  
	scene.add( gltf.scene );
  
    // Set the model's initial position off-screen (to the right)
    gltf.scene.position.set(1, 0, 0); // Adjust the X position for the off-screen effect

    // Rotate the model 90 degrees on the Y-axis
    gltf.scene.rotation.y = 190 * (Math.PI / 180);
    
    // Check if the model has animations
    if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    
    //Character anim
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
    
    //Coffee steam anim
    const action2 = mixer.clipAction(gltf.animations[3]);
    action2.play();
  }
  
  // Set up shadow casting for each mesh in the model
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true; // Enable shadow casting
            child.receiveShadow = false; // Prevent self-shadowing artifacts
          //console.log("mesh: " + child.name);
          if(child.name == "Monitor_Screen_Light_Mode"){
            monitorScreenLightMode = child;
          }
        }
    });
  
    // Assume other setup is complete
    assetsLoaded = true;
    checkLoadingComplete();

}, function (xhr) {
    // Update progress based on loading percentage
    const progress = (xhr.loaded / xhr.total) * 50; // Assume assets are the other half of loading
    updateProgress(50 + progress);
  });

const floorGeometry = new THREE.PlaneGeometry(10, 10); // Adjust size as needed
const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.05 }); // Transparent and shows shadows
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
floor.position.y = 0; // Position the floor under the model
floor.receiveShadow = true; // Enable receiving shadows
scene.add(floor);

function resizeRendererToDisplaySize(renderer) {
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(window.devicePixelRatio);
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = (window.innerWidth / window.innerHeight);
  
  checkForMobile();
}

function checkForMobile(){
  if(window.innerWidth <= 768){
    originalCameraPos = new THREE.Vector3(-1, 1.25, 3);
    lookAtPos = new THREE.Vector3(0, 1.5, 0);
  }
  else{
    originalCameraPos = new THREE.Vector3(-1.25, 1.25, 2);
    lookAtPos = new THREE.Vector3(-1, 0.5, 0);
  }
  
  camera.lookAt(lookAtPos);
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', () => resizeRendererToDisplaySize(renderer));
resizeRendererToDisplaySize(renderer);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
composer.setPixelRatio(window.devicePixelRatio);
composer.setSize(window.innerWidth, window.innerHeight);


if(window.innerWidth <= 768){
    lookAtPos = new THREE.Vector3(0, 1.5, 0);
    originalCameraPos = new THREE.Vector3(-1, 1.25, 3);
    camera.position.set(-1, 1.25, 3);
  }
  else{
    lookAtPos = new THREE.Vector3(-1, 0.5, 0);
    originalCameraPos = new THREE.Vector3(-1.25, 1.25, 2);
    camera.position.set(-1.25, 1.25, 2);
  }

// Make the camera look at the model
camera.lookAt(lookAtPos);
camera.updateProjectionMatrix();

renderer.render(scene, camera);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 2, 0);
pointLight.intensity = 1;

/*
const shadowPointLight = new THREE.PointLight(0xffffff);
shadowPointLight.position.set(1, 4, 1);
shadowPointLight.intensity = 1;
shadowPointLight.castShadow = true; // default false
shadowPointLight.shadow.mapSize.width = 1024; // Increase for better shadow quality
shadowPointLight.shadow.mapSize.height = 1024;
shadowPointLight.shadow.camera.near = 0.1; // Adjust for your scene
shadowPointLight.shadow.camera.far = 50;
*/

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(7, 10, 5);
dirLight.castShadow = true;

// Increase the light size for softer shadows
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;

// Adjust the blur radius
dirLight.shadow.radius = 5; 

dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;

scene.add(dirLight);


const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.intensity = 5;
scene.add(pointLight, ambientLight, dirLight);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  //controls.update();
  camera.position.x = lerp(camera.position.x, originalCameraPos.getComponent(0) + (mouseX  * 0.05), 0.05);
  camera.position.y = lerp(camera.position.y, originalCameraPos.getComponent(1) + (mouseY  * 0.05), 0.05);
  camera.position.z = originalCameraPos.getComponent(2);
  
  camera.lookAt(lookAtPos);
  camera.updateProjectionMatrix();
    
  // Get the time delta since the last frame
  const delta = clock.getDelta();

  // Update the mixer for animation
  if (mixer) {
    mixer.update(delta); // Update based on time delta, here it's 0.01 for simplicity
  }

  renderer.render(scene, camera);
  //composer.render(scene, camera);
}

function onDocumentMouseMove( event ) {
    if((( event.clientX - windowHalfX ) / 100) > 0){
      mouseX = ( event.clientX - windowHalfX ) / 100;
      mouseY = ( event.clientY - windowHalfY ) / 100;
    }
  else{
      mouseX = 0;
      mouseY = 0;
  }
  
    //console.log("X: " + mouseX + " Y: " + mouseY);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}