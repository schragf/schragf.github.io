import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/DRACOLoader.js';

import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

// import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/EffectComposer.js';
// import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/RenderPass.js';
// import {UnrealBloomPass} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/postprocessing/UnrealBloomPass.js';


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
controls.enablePan = true;
controls.enableZoom = true;
camera.position.set(0, 0, 15);
camera.lookAt(0,0,0);
controls.enableDamping = true;
controls.dampingFactor = 0.005;
const degreesToRadians = degrees => degrees * (Math.PI / 180);


controls.minAzimuthAngle = -degreesToRadians(7); 
controls.maxAzimuthAngle = degreesToRadians(7); 

const verticalLimit = degreesToRadians(5);

const defaultPolar = Math.PI / 2;

controls.minPolarAngle = defaultPolar - verticalLimit; 
controls.maxPolarAngle = defaultPolar + verticalLimit; 



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

// const grid_size = 100;
// const grid_divisions = 10;
// const gridHelper = new THREE.GridHelper(grid_size, grid_divisions);
// scene.add(gridHelper);

// const cameraHelper = new THREE.CameraHelper(camera);
// scene.add(cameraHelper);

// -------3D HELPER


// --------LIGHT SETUP
var light = new THREE.DirectionalLight(0xFFE8C7, 15); 
var light_2 = new THREE.DirectionalLight(0xC7E0FF, 15);
light_2.castShadow = true;
light.castShadow = true;
var light_initialX = 15;
var light_initialZ = 10;
light.position.set(light_initialX, 5, light_initialZ);
light_2.position.set(-light_initialX, -5, light_initialZ);
light.lookAt(0,0,0);
light_2.lookAt(0,0,0);
const shadow_factor = 1;
light.shadow.bias = -0.000001;
light.shadow.mapSize.width = 1024*shadow_factor;
light.shadow.mapSize.height = 1024*shadow_factor;
light_2.shadow.bias = -0.000001;
light_2.shadow.mapSize.width = 1024*shadow_factor;
light_2.shadow.mapSize.height = 1024*shadow_factor;


scene.add( light );
scene.add( light_2 );



// const lightHelper = new THREE.DirectionalLightHelper(light, 1);
// scene.add(lightHelper);
// const lightHelper2 = new THREE.DirectionalLightHelper(light_2, 1);
// scene.add(lightHelper2);



// --------END LIGHT SETUP



// --------LOAD MODELS

var DionysModels = [];
var SchragModels = [];
var allModels = [];
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
loader.setDRACOLoader(draco);


var letters_vor = ["S", "Y", "N", "O", "I", "D"];
var letters = ["S", "C", "H", "R", "A", "G"];
function loadModel(url, i, position) {
    return new Promise((resolve, reject) => {
        loader.load(url, (gltf) => {
            const model = gltf.scene.children[0];
            if (position) {
                model.position.x = -2*i;
                model.position.y = i+1.5;
                model.position.z = i-3;
                DionysModels.push(model);
            } else {
                model.position.x = i*2;
                model.position.y = -i-1.5;
                model.position.z = i-3;
                SchragModels.push(model);  
            }
            model.initialX = model.position.x;
            model.initialY = model.position.y;
            model.material = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
                metalness: 1, 
                roughness: 0.3, 
            });  
            model.receiveShadow = true;
            model.castShadow = true;
            console.log(i);
            scene.add(model);
            resolve(model);
        }, undefined, reject);
    });
}
const modelURLs_vor = [...letters_vor.map(letter => `../models/letters/website_${letter}.glb`)];

const modelURLs_nach = [...letters.map(letter => `../models/letters/website_${letter}.glb`)];
const modelPromises_vor = modelURLs_vor.map((url, index) => loadModel(url, index, 1));
const modelPromises_nach = modelURLs_nach.map((url, index) => loadModel(url, index, 0));
const modelPromises = [...modelPromises_vor, ...modelPromises_nach];
// --------END LOAD MODELS



var angle = 0;
var light_angle = 0;
var light_angle_vel = 0.01;
let radius = Math.sqrt(light_initialX * light_initialX + light_initialZ * light_initialZ);
var pos_y = false;
var render = function() {
    requestAnimationFrame(render);
    angle += 0.003;
    light_angle += light_angle_vel;
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
    allModels.forEach((model) => {
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
    if (focus_flag) {
        allModels.forEach((model) => {
            if (model == focus_object) {
                target_position.set(model.position.x, model.position.y, model.position.z);
            }
        });
        const cameraTargetZ = THREE.MathUtils.lerp(camera.position.z, 4, 0.05); 
        camera.position.z = cameraTargetZ;
    } else {
        const desiredCameraZ = Math.max(maxDistance * scalingFactor - constant_distance, 0);
        const cameraTargetZ = THREE.MathUtils.lerp(camera.position.z, desiredCameraZ, 0.05); 
        camera.position.z = cameraTargetZ;
    }

    light.position.x = radius * Math.cos(light_angle);
    light.position.z = radius * Math.sin(light_angle);
    light_2.position.x = radius * Math.cos(light_angle + Math.PI/3);
    light_2.position.z = radius * Math.sin(light_angle + Math.PI/3);
    light.lookAt(0,0,0);
    light_2.lookAt(0,0,0);  
    if (shouldUpdateTarget) {

        controls.target.x = THREE.MathUtils.lerp(controls.target.x, target_position.x, 0.05);
        controls.target.y = THREE.MathUtils.lerp(controls.target.y, target_position.y, 0.05);
        controls.target.z = THREE.MathUtils.lerp(controls.target.z, target_position.z, 0.05);

        if (Math.abs(controls.target.x - target_position.x) < 0.01 && Math.abs(controls.target.y - target_position.y) < 0.01 && Math.abs(controls.target.z - target_position.z) < 0.01) {
            controls.target.set(target_position.x, target_position.y, target_position.z);
        }

        controls.update(); 
    }
    renderer.render(scene, camera);   
    
}
 
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
        allModels.forEach((model) => {
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
                allModels.forEach((model) => {
                    model.material.roughness = 0.3;
                });
            } else {
                allModels.forEach((model) => {
                    model.material.roughness = 0.1;
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
        allModels.forEach((model) => {
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

Promise.all(modelPromises).then(() => {
    console.log("All models loaded successfully");
    allModels = [...DionysModels, ...SchragModels];
    render();
    updateColors();
}).catch(error => {
    console.error("Model loading failed:", error);
});


// Touch event
renderer.domElement.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1 && focus_flag) { 
        focus_flag = false;
        shouldUpdateTarget = true;
        target_position = new THREE.Vector3(0,0,0);
    } else {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth)* 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight)* 2 + 1;

        // Call the function to check for clicks on letters
        checkForLetterClick();
    }
});


const mouse = new THREE.Vector2();
let focus_flag = false;
var focus_object;
let shouldUpdateTarget = false;
let target_position = new THREE.Vector3(0,0,0);
renderer.domElement.addEventListener('click', (event) => {
    if (event.button === 0 && focus_flag) { // Left mouse button
        focus_flag = false;
        shouldUpdateTarget = true;
        target_position = new THREE.Vector3(0,0,0);
    } else {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth)* 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight)* 2 + 1;

        // Call the function to check for clicks on letters
        checkForLetterClick();
    }

});

function checkForLetterClick() {
    if (!focus_flag) {
        const randomIndex = Math.floor(Math.random() * allModels.length);
        focus_flag = true;
        focus_object = allModels[randomIndex];
        // focus_object = new THREE.Vector3(0,0,0);
        shouldUpdateTarget = true;
        }
}


// --------COMPOSITING
// const composer = new EffectComposer(renderer);
// const renderPass = new RenderPass(scene, camera);
// composer.addPass(renderPass);
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.01, 0.99);
// composer.addPass(bloomPass);



// --------END COMPOSITING
