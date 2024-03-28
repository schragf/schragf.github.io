import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/DRACOLoader.js';

import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/UnrealBloomPass.js';


var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setClearColor("#000000");
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputEncoding = THREE.sRGBEncoding;

const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

document.querySelector('#threejs_canvas').appendChild(renderer.domElement);

var hFOV = 75 + (68-75) / (1920 - 320) * (window.innerWidth - 320); // desired horizontal fov, in degrees

var camera = new THREE.PerspectiveCamera(Math.atan( Math.tan( hFOV * Math.PI / 360 ) / (window.innerWidth/window.innerHeight) ) * 360 / Math.PI, window.innerWidth/window.innerHeight, 0.1, 1000);

const controls = new OrbitControls(camera, document.querySelector('#threejs_canvas'));
controls.enablePan = true;
controls.enableZoom = true;
camera.position.set(0, 0, 1);
controls.enableDamping = true;
controls.update();


// ------END CAMERA SETUP

console.log('Start: Window.innerWidth: ' + window.innerWidth);
console.log('Start: Window.innerHeight: ' + window.innerHeight);
console.log('Start: Camera.fov ' + camera.fov);



// -------EVENT LISTENENER


//RESIZING WITH LINEAR INTERPOLATION
window.addEventListener('resize', onResize);
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    if (window.innerWidth > 300) {
        hFOV = 75 + (68-75) / (1920 - 320) * (window.innerWidth - 320);
        camera.fov = Math.atan( Math.tan( hFOV * Math.PI / 360 ) / camera.aspect ) * 360 / Math.PI;
    }
    camera.updateProjectionMatrix();
    console.log('Resize Window.innerWidth:' + window.innerWidth);
    console.log('Resize Camera.fov' + camera.fov);
}

//TODO: ORIENTATION CHANGE ON MOBILE DEVICES
window.addEventListener('orientationchange', () => {
    console.log('Orient Window.innerWidth:' + window.innerWidth);
    console.log('Orient Camera.fov' + camera.fov);
    onResize();

});

// -------END EVENT LISTENENER



// -------3D HELPER

// const grid_size = 10;
// const grid_divisions = 10;
// const gridHelper = new THREE.GridHelper(grid_size, grid_divisions);
// scene.add(gridHelper);

// const cameraHelper = new THREE.CameraHelper( camera);
// scene.add(cameraHelper);

// -------3D HELPER


// --------LIGHT SETUP

 var hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0);
 scene.add(hemiLight);

var light = new THREE.DirectionalLight(0xFFFFFF,0.5);

light.castShadow = true;
scene.add( light );
const lightam = new THREE.AmbientLight( 0xFFFFFF, 0.5); 
scene.add(lightam);

light.position.set( 
    camera.position.x + 0,
    camera.position.y + 5,
    camera.position.z + 0,
  );

light.shadow.bias = -0.000001;
light.shadow.mapSize.width = 1024*4;
light.shadow.mapSize.height = 1024*4;


// const lightHelper = new THREE.DirectionalLightHelper(light, 5);
// scene.add(lightHelper);



// --------END LIGHT SETUP



// --------LOAD MODELS

var letterModels = [];
const loader = new GLTFLoader();
const draco = new DRACOLoader();
const textureLoader = new THREE.TextureLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(draco);

var letters_vor = ["S", "Y", "N", "O", "I", "D"];
for (let i = 0; i < letters_vor.length; i++) {
        loader.load(`../models/website_${letters_vor[i]}.glb`, (gltf) => {
            const model = gltf.scene.children[0];
            model.position.x = -2*i;
            model.position.y = i+1.5;
            model.initialX = model.position.x;
            model.initialY = model.position.y;
            model.rotationSpeedZ = -(Math.random() * 0.005);
            model.material.color.set(`rgb(255, 255, 255)`);
            scene.add(model);
            letterModels.push(model);
        });
}

var letters = ["S_2", "C", "H", "R", "A", "G"];
for (let i = 0; i < letters.length; i++) {
    loader.load(`../models/website_${letters[i]}.glb`, (gltf) => {
        var model = gltf.scene.children[0];
        model.position.x = i*2;
        model.position.y = -i-1.5;
        model.initialX = model.position.x;
        model.initialY = model.position.y;
        model.rotationSpeedZ = -(Math.random() * 0.005);
        model.material.color.set(`rgb(255, 255, 255)`);
        scene.add(model);
        letterModels.push(model);
    });
}


// --------END LOAD MODELS

// --------COMPOSITING

// var composer = new EffectComposer(renderer);
// composer.addPass(new RenderPass(scene, camera));
// composer.addPass(new UnrealBloomPass({x: window.innerWidth, y: window.innerHeight}, 5, 5.0, 0.7));

// --------END COMPOSITING


var angle = 0;
var camera_max = 20;
var render = function() {
    requestAnimationFrame(render);
    angle += 0.005;
    controls.update();
    letterModels.forEach((model) => {
        model.rotation.z += model.rotationSpeedZ;
        model.position.x = model.initialX * Math.cos(angle) - model.initialY * Math.sin(angle);
        model.position.y = model.initialY * Math.sin(angle) + model.initialY * Math.cos(angle);

    })
    if (window.innerWidth <= 500) {
        camera_max = 20;
    } else {
        camera_max = 40;
    } 
    if (camera.position.z < camera_max) {
        console.log(camera.position)
        camera.position.z += 0.1;
    }
    renderer.render(scene, camera);
    
}
render();
 
// Background color transition
var transitionDuration = 10000; 
var pauseDuration = 5000;
var startTime = Date.now(); 
var fraction = 0;
var black_ = true;
var white_ = false;
var black_to_white = false;
var white_to_black = false;
function updateColors() {
    if (black_) {
        var now = Date.now()
        var elapsedTime = now - startTime;
        if (elapsedTime > pauseDuration){
            black_ = false;
            black_to_white = true;
            startTime = Date.now();
        }
    } else if (black_to_white) {
        var now = Date.now();
        var elapsedTime = now - startTime;
        fraction = Math.min(elapsedTime / transitionDuration, 1);
        var colorValue = Math.round(255 * fraction);
        var backgroundColorValue = colorValue;
        var letterColorValue = 255 - backgroundColorValue;
        renderer.setClearColor(`rgb(${backgroundColorValue}, ${backgroundColorValue}, ${backgroundColorValue})`);
        letterModels.forEach((model) => {
            model.material.color.set(`rgb(${letterColorValue}, ${letterColorValue}, ${letterColorValue})`);
        });
        if (fraction == 1) {
            white_ = true;
            black_to_white = false;
            startTime = Date.now();
        }
    } else if (white_) {
        var now = Date.now()
        var elapsedTime = now - startTime;
        if (elapsedTime > pauseDuration){
            white_ = false;
            white_to_black = true;
            startTime = Date.now();
        }
    } else if (white_to_black) {
        var now = Date.now();
        var elapsedTime = now - startTime;
        fraction = Math.min((elapsedTime) / transitionDuration, 1);
        fraction = 1 - fraction;
        var colorValue = Math.round(255 * fraction);
        var backgroundColorValue = colorValue;
        var letterColorValue = 255 - backgroundColorValue;
        renderer.setClearColor(`rgb(${backgroundColorValue}, ${backgroundColorValue}, ${backgroundColorValue})`);
        letterModels.forEach((model) => {
            model.material.color.set(`rgb(${letterColorValue}, ${letterColorValue}, ${letterColorValue})`);
        });
        if (fraction == 0) {
            black_ = true;
            white_to_black = false;
            startTime = Date.now();
        }
    }


    requestAnimationFrame(updateColors);
}

updateColors();




