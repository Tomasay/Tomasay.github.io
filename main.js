import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const pageFullyLoadedEvent = new Event("pageFullyLoaded");

// The bar always plays for at least this long, so it fills in one smooth
// sweep even when everything is already cached
const MIN_LOAD_DURATION = 1600; // ms
// If loading never finishes (model fetch fails, WebGL refuses to start),
// reveal the site anyway instead of leaving the loader up forever.
const LOADER_FAILSAFE_MS = 15000;
const loadStartTime = performance.now();
let current = 0; // Displayed progress, 0-100
let lastFrameTime = loadStartTime;

const progressFrame = (now) => {
  // Clamp delta so a long stalled frame doesn't snap the bar forward
  const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  const elapsed = now - loadStartTime;
  let target = Math.min(elapsed / MIN_LOAD_DURATION, 1) * 100;
  if (!(assetsLoaded && domContentLoaded) && elapsed < LOADER_FAILSAFE_MS) {
    // Still waiting on assets: creep toward 90% instead of finishing
    target = Math.min(target, 90 * (1 - Math.exp(-elapsed / 3000)));
  }

  // Frame-rate independent ease toward the target
  current += (target - current) * (1 - Math.exp(-8 * deltaSeconds));

  if (current >= 99.5) {
    updateProgress(100);
    // Let the bar visibly finish filling before revealing the page
    setTimeout(loadingComplete, 400);
  } else {
    updateProgress(current);
    requestAnimationFrame(progressFrame);
  }
};
requestAnimationFrame(progressFrame);

let mouseX = 0;
let mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

document.addEventListener( 'mousemove', onDocumentMouseMove );
document.addEventListener('mouseleave', function() {
  mouseX = 0;
  mouseY = 0;
});

let monitorScreenLightMode;

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("change", () => {
    gsap.to(monitorScreenLightMode.material, {
      duration: 0.5, // Duration in seconds
      opacity: themeToggle.checked ? 0 : 1,  // Target opacity
      ease: "power1.inOut"
    });
});

const loaderElement = document.getElementById('loader');
const progressBar = document.getElementById('loader-foreground');
const loaderText = document.getElementById('loader-text');

// Fun status lines cycled under the loader while the page loads
const loaderMessages = [
  'Compiling shaders...',
  'Baking lightmaps...',
  'Brewing espresso...',
  'Triangulating polygons...',
  'Warming up the GPU...'
];
let loaderMessageIndex = 0;
const loaderTextTimer = setInterval(() => {
  if (!loaderText) return; // stale cached HTML may not have the element
  loaderMessageIndex = (loaderMessageIndex + 1) % loaderMessages.length;
  loaderText.style.opacity = 0;
  setTimeout(() => {
    loaderText.textContent = loaderMessages[loaderMessageIndex];
    loaderText.style.opacity = 1;
  }, 250);
}, 1600);

// Track loading state
let assetsLoaded = false;
let domContentLoaded = false;

function updateProgress(percentage) {
  let translateYValue = lerp(128, 0, percentage/100);
  progressBar.style.transform = `translateY(${translateYValue}px)`;
}

let tiltX = 0;
let tiltY = 0;
let isListeningToDeviceOrientation = false;

function loadingComplete() {
    window.dispatchEvent(pageFullyLoadedEvent);
  
    loaderElement.classList.add('hidden'); // Hide the loader
    clearInterval(loaderTextTimer);
    if (loaderText) loaderText.classList.add('hidden');
    document.getElementsByTagName("main")[0].style.display = 'block';
    hasLoaded = true;
    startAnimation(); // Start animation loop
    
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
  
    //Fade arow in
    const arrow = document.querySelector(".arrow");
    arrow.style.opacity = 0;
    arrow.style.transition = "opacity 1s ease-in-out";

    // Trigger fade-in effect
    setTimeout(() => {
        arrow.style.opacity = 1;
    }, 100); // Small delay to ensure the transition is noticeable
    
    // Animate the model to its final position (skip if the failsafe fired
    // before the model finished loading)
    if (loadedModel) {
      gsap.to(loadedModel.scene.position, {
          x: 0, // Final X position
          duration: 2, // Animation duration in seconds
          ease: "elastic.out(1, 0.3)", // Elastic easing for recoil effect
      });
    }
  
  /*
    // Check if DeviceOrientationEvent is available
  console.log("('DeviceOrientationEvent' in window): " + ('DeviceOrientationEvent' in window));
    if (window.DeviceOrientationEvent) {
        // For iOS: Request permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startListeningToDeviceOrientation();
                    } else {
                        console.log('Permission denied');
                    }
                })
                .catch(console.error);
        } else {
            // For Android or older iOS
            startListeningToDeviceOrientation();
        }
    } else {
        console.log('DeviceOrientationEvent is not supported on this device.');
    }

    // Function to start listening to device orientation
    function startListeningToDeviceOrientation() {
        window.addEventListener('deviceorientation', event => {
            const gamma = event.gamma; // Left-right tilt (-90 to 90)
            const beta = event.beta;   // Forward-backward tilt (-180 to 180)

            // Map gamma (-90 to 90) to x (-1 to 1)
            tiltX = gamma / 90;

            // Map beta (-180 to 180) to y (-1 to 1)
            tiltY = -beta / 180; // Negate to make upward tilt positive
          
            if(tiltX != 0 && tiltY != 0){
              isListeningToDeviceOrientation = true;
            }

            console.log(`x: ${tiltX.toFixed(2)}, y: ${tiltY.toFixed(2)}`);
        });
    }
    */
}

// Listen for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  domContentLoaded = true;
  //updateProgress(50);
  //checkLoadingComplete();
});

const scene = new THREE.Scene();
//scene.background = new THREE.Color('rgb(36,43,51)');
//scene.background = new THREE.TextureLoader().load( "textures/bg.png" );

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let originalCameraPos;
let lookAtPos;

// Cap the device pixel ratio so high-DPI phones/retina screens don't render
// the shadowed, antialiased scene at 2-3x resolution (the main mobile drain).
const MAX_PIXEL_RATIO = 1.5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true,
  antialias: true
});

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

const loader = new GLTFLoader();

let mixer;

// If the GPU evicts our WebGL context (mobile browsers do this under memory
// pressure), preventing the default lets the browser restore it, and the
// restore event kicks the render loop back on.
renderer.domElement.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  startAnimation();
});

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
    //checkLoadingComplete();

}, function (xhr) {
    // Update progress based on loading percentage
    const progress = (xhr.loaded / xhr.total) * 50; // Assume assets are the other half of loading
    //updateProgress(50 + progress);
  }, function (error) {
    // Reveal the site without the 3D scene rather than spinning forever
    console.error('Failed to load model:', error);
    assetsLoaded = true;
  });

const floorGeometry = new THREE.PlaneGeometry(10, 10); // Adjust size as needed
const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.05 }); // Transparent and shows shadows
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
floor.position.y = 0; // Position the floor under the model
floor.receiveShadow = true; // Enable receiving shadows
scene.add(floor);

// The canvas is position: fixed and sized by CSS (100lvh), so mobile URL-bar
// show/hide doesn't change its dimensions. The guard makes those resize
// events free: without it, every setSize clears the canvas and reshuffles
// layout mid-scroll, which reads as flicker.
let lastCanvasWidth = 0;
let lastCanvasHeight = 0;

function resizeRendererToDisplaySize(renderer) {
  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;
  if (width === lastCanvasWidth && height === lastCanvasHeight) return;
  lastCanvasWidth = width;
  lastCanvasHeight = height;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(width, height, false); // false: CSS keeps control of the display size
  camera.aspect = width / height;

  checkForMobile();
}

function checkForMobile(){
  if(/*window.innerWidth <= 768*/ window.innerHeight > window.innerWidth){
    originalCameraPos = new THREE.Vector3(-1, 1.25, 3.5);
    lookAtPos = new THREE.Vector3(-0.25, 1.25, 0);
  }
  else{
    originalCameraPos = new THREE.Vector3(-1.25, 1.25, 2.25);
    lookAtPos = new THREE.Vector3(-1.25, 0.5, 0);
  }
  
  camera.lookAt(lookAtPos);
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', () => resizeRendererToDisplaySize(renderer));
resizeRendererToDisplaySize(renderer);


if(/*window.innerWidth <= 768*/ window.innerHeight > window.innerWidth){
    lookAtPos = new THREE.Vector3(-0.25, 1.25, 0);
    originalCameraPos = new THREE.Vector3(-1, 1.25, 3.5);
    camera.position.set(-1, 1.25, 3);
  }
  else{
    lookAtPos = new THREE.Vector3(-1.25, 0.5, 0);
    originalCameraPos = new THREE.Vector3(-1.25, 1.25, 2.25);
    camera.position.set(-1.25, 1.25, 2.25);
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

dirLight.shadow.mapSize.width = 512;
dirLight.shadow.mapSize.height = 512;

scene.add(dirLight);


const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.intensity = 5;
scene.add(pointLight, ambientLight, dirLight);

// Animation Loop
const clock = new THREE.Clock();

// Only run the render loop while the hero canvas is actually on-screen and the
// tab is visible. A continuous 60fps loop rendering a shadowed 3D model is the
// single biggest ongoing CPU/GPU cost, so we pause it the moment it isn't seen.
let animationRunning = false;
let canvasVisible = true;
let pageVisible = true;
let hasLoaded = false;

function shouldAnimate() {
  return hasLoaded && canvasVisible && pageVisible;
}

function startAnimation() {
  if (animationRunning || !shouldAnimate()) return;
  animationRunning = true;
  clock.getDelta(); // discard time elapsed while paused so animations don't jump
  requestAnimationFrame(animate);
}

function animate() {
  if (!shouldAnimate()) {
    animationRunning = false;
    return;
  }
  requestAnimationFrame(animate);

  camera.position.x = lerp(camera.position.x, originalCameraPos.getComponent(0) + (mouseX  * 0.025), 0.05);
  camera.position.y = lerp(camera.position.y, originalCameraPos.getComponent(1) + (mouseY  * 0.025), 0.05);

  camera.position.z = originalCameraPos.getComponent(2);

  // Moving the camera only changes the view; the projection matrix depends on
  // fov/aspect/near/far, which are only updated on resize (see checkForMobile).
  camera.lookAt(lookAtPos);

  // Get the time delta since the last frame
  const delta = clock.getDelta();

  // Update the mixer for animation
  if (mixer) {
    mixer.update(delta); // Update based on time delta, here it's 0.01 for simplicity
  }

  renderer.render(scene, camera);
}

// Pause the loop when the tab is backgrounded, resume when it returns.
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden;
  if (pageVisible) startAnimation();
});

// Pause the loop once the hero canvas scrolls out of view, resume when it
// scrolls back in.
const heroCanvas = document.querySelector('#bg');
if ('IntersectionObserver' in window && heroCanvas) {
  const canvasObserver = new IntersectionObserver((entries) => {
    canvasVisible = entries[0].isIntersecting;
    if (canvasVisible) startAnimation();
  }, { threshold: 0 });
  canvasObserver.observe(heroCanvas);
}

function onDocumentMouseMove( event ) {
  /*
    if((( event.clientX - windowHalfX ) / 100) > 0){
      mouseX = ( event.clientX - windowHalfX ) / 100;
      mouseY = ( event.clientY - windowHalfY ) / 100;
      //console.log("X: " + mouseX + " Y: " + mouseY);
    }
  else{
      mouseX = 0;
      mouseY = 0;
  }
  */
  
    mouseX = ( event.clientX - windowHalfX ) / 100;
    mouseY = ( event.clientY - windowHalfY ) / 100;
  
    //console.log("X: " + mouseX + " Y: " + mouseY);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}