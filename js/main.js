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

document.querySelector('#threejs_canvas').appendChild(renderer.domElement);

var hFOV = 75 + (68-75) / (1920 - 320) * (window.innerWidth - 320); // desired horizontal fov, in degrees

var camera = new THREE.PerspectiveCamera(Math.atan( Math.tan( hFOV * Math.PI / 360 ) / (window.innerWidth/window.innerHeight) ) * 360 / Math.PI, window.innerWidth/window.innerHeight, 0.1, 1000);

const controls = new OrbitControls(camera, document.querySelector('#threejs_canvas'));
controls.enablePan = false;
controls.enableZoom = false;
camera.position.set(0, 0, 15);
controls.enableDamping = true;
controls.dampingFactor = 0.005;
const degreesToRadians = degrees => degrees * (Math.PI / 180);


controls.minAzimuthAngle = -degreesToRadians(7); 
controls.maxAzimuthAngle = degreesToRadians(7); 

const verticalLimit = degreesToRadians(5);

const defaultPolar = Math.PI / 2;

controls.minPolarAngle = defaultPolar - verticalLimit; 
controls.maxPolarAngle = defaultPolar + verticalLimit; 

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
var light = new THREE.DirectionalLight(0xFFE8C7, 10); 
var light_2 = new THREE.DirectionalLight(0xC7E0FF, 10);
light_2.castShadow = true;
light.castShadow = true;
light.position.set(-15, 5, 50);
light_2.position.set(15, -5, 50);
const shadow_factor = 10;
light.shadow.bias = -0.000001;
light.shadow.mapSize.width = 1024*shadow_factor;
light.shadow.mapSize.height = 1024*shadow_factor;
light_2.shadow.bias = -0.000001;
light_2.shadow.mapSize.width = 1024*shadow_factor;
light_2.shadow.mapSize.height = 1024*shadow_factor;
scene.add( light );
scene.add( light_2 );



// const lightHelper = new THREE.DirectionalLightHelper(light, 50);
// scene.add(lightHelper);



// --------END LIGHT SETUP



// --------LOAD MODELS

var DionysModels = [];
var SchragModels = [];
var StudioModels = [];
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(draco);

var letters_vor = ["S", "Y", "N", "O", "I", "D"];
for (let i = 0; i < letters_vor.length; i++) {
        loader.load(`../models/letters/website_${letters_vor[i]}.glb`, (gltf) => {
            const model = gltf.scene.children[0];
            model.position.x = -2*i;
            model.position.y = i+1.5;
            model.position.z = i-3;
            model.initialX = model.position.x;
            model.initialY = model.position.y;
            model.rotationSpeedZ = -(Math.random() * 0.005);
            model.material = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                metalness: 1, 
                roughness: 0, 
            });
           
            scene.add(model);
            DionysModels.push(model);
        });
}

var letters = ["S_2", "C", "H", "R", "A", "G"];
for (let i = 0; i < letters.length; i++) {
    loader.load(`../models/letters/website_${letters[i]}.glb`, (gltf) => {
        var model = gltf.scene.children[0];
        model.position.x = i*2;
        model.position.y = -i-1.5;
        model.position.z = i-3;
        model.initialX = model.position.x;
        model.initialY = model.position.y;
        model.rotationSpeedZ = -(Math.random() * 0.005);
        model.material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            metalness: 1, 
            roughness: 0, 
        });
        model.name = letters[i];
        scene.add(model);
        SchragModels.push(model);   
    });
}


// --------END LOAD MODELS

// --------COMPOSITING

// var composer = new EffectComposer(renderer);
// composer.addPass(new RenderPass(scene, camera));
// composer.addPass(new UnrealBloomPass({x: window.innerWidth / 10, y: window.innerHeight/10}, 200, 2, 0.1));




// --------END COMPOSITING


var angle = 0;
var light_angle = 1;
var pos_y = false;
var render = function() {
    requestAnimationFrame(render);
    angle += 0.003;
    light_angle += 0.003;
    controls.update();
    let maxDistance = 0;
    var scalingFactor = 2;
    var constant_distance = 0;
    if (window.innerWidth <= 500) {
        scalingFactor = 1;
        constant_distance = 1;
        pos_y = true
    } else {
        scalingFactor = 3;
        constant_distance = 1;
    } 
    [...DionysModels, ...SchragModels, ...StudioModels].forEach((model) => {
        model.position.x = model.initialX * Math.cos(angle) - model.initialY * Math.sin(angle);
        model.position.y = model.initialY * Math.sin(angle) + model.initialY * Math.cos(angle);
        if (pos_y) {
            model.position.y = model.position.y*1.5;
            model.position.x = model.position.x/1.5;
        }
        const distance = model.position.distanceTo(new THREE.Vector3(0,0, model.position.z));
        if (distance > maxDistance) {
            maxDistance = distance;
        }
    });

    const desiredCameraZ = Math.max(maxDistance * scalingFactor - constant_distance, 0);
    const cameraTargetZ = THREE.MathUtils.lerp(camera.position.z, desiredCameraZ, 0.05); // Smooth transition factor
    camera.position.z = cameraTargetZ;
    light.position.z = -15 * Math.cos(light_angle) - 50*Math.sin(light_angle);
    light.position.x = 50 * Math.sin(light_angle) -15 * Math.cos(light_angle);
    light_2.position.x = -15 * Math.cos(light_angle) - 50*Math.sin(light_angle);
    light_2.position.z = 50 * Math.sin(light_angle) -15 * Math.cos(light_angle);
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
var roughness_count = 0;
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
        [...DionysModels, ...SchragModels, ...StudioModels].forEach((model) => {
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
            if (roughness_count % 2 == 0) {
                [...DionysModels, ...SchragModels, ...StudioModels].forEach((model) => {
                    model.material.roughness = 0.3;
                });
            } else {
                [...DionysModels, ...SchragModels, ...StudioModels].forEach((model) => {
                    model.material.roughness = 0;
                });
            }
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
        [...DionysModels, ...SchragModels, ...StudioModels].forEach((model) => {
            model.material.color.set(`rgb(${letterColorValue}, ${letterColorValue}, ${letterColorValue})`);
        });

        if (fraction == 0) {
            black_ = true;
            white_to_black = false;
            roughness_count += 1;
            startTime = Date.now();
        }
    }


    requestAnimationFrame(updateColors);
}

updateColors();

var wire_inactive = true;
function handleWireframe() {
    if (wire_inactive) {
        console.log(event.button);
        [...DionysModels, ...SchragModels, ...StudioModels].forEach((model) => {
            model.material.wireframe = true;
            model.material.wireframeLinewidth = 0.001;
            wire_inactive = false;
        });
    } else {
        [...DionysModels, ...SchragModels, ...StudioModels].forEach((model) => {
            model.material.wireframe = false;
            wire_inactive = true;
        });
    }
};

// Mouse click event
renderer.domElement.addEventListener('click', (event) => {
    if (event.button === 0) { // Left mouse button
        handleWireframe();
    }
});

// Touch event
renderer.domElement.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) { 
        handleWireframe();
    }
});