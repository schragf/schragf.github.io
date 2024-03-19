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
//document.body.appendChild(renderer.domElement);



// ------STARTUP JAVASCRIPT
var f_size = "85px";
if (window.innerWidth < 375) {
    f_size = "30px";
    document.getElementById("logo").style.width = "15%";
    document.getElementById("contact").style.width = "15%";
} else if (window.innerWidth < 600) {
    f_size = "35px";
    document.getElementById("logo").style.width = "15%";
    document.getElementById("contact").style.width = "15%";
} else if (window.innerWidth < 1000) f_size = "60px";
else if (window.innerWidth < 1200) f_size = "70px";
else if (window.innerWidth < 1400) f_size = "80px";
let enable_scroll = false;
document.getElementById("intro-text").style.fontSize = f_size;







// ------END STARTUP JAVASCRIPT


// ------CAMERA SETUP

/*
INTERPOLATION CAMERA FOV

1920 -> 40 (Start)

375 -> (Iphone X)
320 -> 106 (Stop neu - Iphone 5)

linear interpolation: 75 + (68-75) / (1920 - 320) * (window.innerWidth - 320) - horizontal field of view


*/
var hFOV = 75 + (68-75) / (1920 - 320) * (window.innerWidth - 320); // desired horizontal fov, in degrees

var camera = new THREE.PerspectiveCamera(Math.atan( Math.tan( hFOV * Math.PI / 360 ) / (window.innerWidth/window.innerHeight) ) * 360 / Math.PI, window.innerWidth/window.innerHeight, 0.1, 1000);
// camera.position.z = 8;
// camera.position.y = 7;
// camera.position.x = 3.5;
// const camera_x = camera.position.x;
// const camera_y_start = camera.position.y;

//variable position (phones)
// camera.position.z = 10;
// camera.position.y = 30;
// camera.position.x = 3.5;
// const camera_x = camera.position.x;
// const camera_y_start = 7;
// const camera_z = camera.position.z;




const controls = new OrbitControls(camera, document.querySelector('#threejs_canvas'));
controls.enablePan = false;
controls.enableZoom = true;
camera.position.set(0, 0, 50);
controls.enableDamping = true;
controls.update();

class Transition {
    constructor () {
        this.transition = false;
        this.next = new THREE.Vector3(camera.position.x, camera.position.y - 20, camera.position.z);
    }
}
var camera_transition = new Transition();


// ------END CAMERA SETUP

console.log('Start: Window.innerWidth: ' + window.innerWidth);
console.log('Start: Window.innerHeight: ' + window.innerHeight);
console.log('Start: Camera.fov ' + camera.fov);



// -------EVENT LISTENENER

//ENTER / EXIT START SCREEN
document.querySelector('#intro-text').addEventListener('click', onClick);
function onClick() {
    if (!(document.getElementById("intro-text").style.visibility == "hidden")) {
        document.getElementById("intro-text").style.visibility="hidden";
        document.getElementById("overlay").style.background="transparent";
        document.getElementById("logo").style.visibility="visible";
        document.getElementById("contact").style.visibility="visible";
        document.getElementById("scroll-1").style.visibility="visible";
        document.getElementById("scroll-2").style.visibility="visible";

     } 

}
// OVERLAY JS
document.querySelector('#logo').addEventListener('click', function(e) {
    
    document.getElementById("intro-text").style.visibility="visible";
    document.getElementById("overlay").style.background="rgba(0,0,0,0.6)";
    document.getElementById("logo").style.visibility="hidden";
    document.getElementById("contact").style.visibility="hidden";
    // enable_scroll = false;    
    // test = true;
})
document.querySelector('#scroll').addEventListener('click', function(e) {
    camera_transition.transition = true;
    controls.enabled = false;
});

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
const lightam = new THREE.AmbientLight( 0xFFFFFF, 0.5); // soft white light
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

// runter scrollen oder besser knopf drücken aber immmernoch in der selben szene sein aber mittelpunkt ändert zu neuem object 


const loader = new GLTFLoader();
const draco = new DRACOLoader();
// draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
// loader.setDRACOLoader(draco);
// loader.load('../models/text_centered.glb', (gltf) => {
//     // for (var i = 0; i < gltf.scene.children.length; i++) {
//     //     var model = gltf.scene.children[i];
//     //     model.position.x += 10;
//     // }
//     scene.add(gltf.scene);
// });



loader.load('../models/website.glb', (gltf) => {
    scene.add(gltf.scene);
});








// --------END LOAD MODELS

// --------COMPOSITING

//var composer = new EffectComposer(renderer);
//composer.addPass(new RenderPass(scene, camera));
//composer.addPass(new UnrealBloomPass({x: window.innerWidth, y: window.innerHeight}, 5, 5.0, 0.7));

// --------END COMPOSITING



var render = function() {
    requestAnimationFrame(render);
    if (camera_transition.transition && camera.position.y > camera_transition.next.y) {
        console.log(camera.position.y);
        camera.position.y -= 0.1;
        controls.target.set(0, camera.position.y, 0);
    } else {
        camera_transition.transition = false;
        controls.enabled = true;

    }
    controls.update();

    renderer.render(scene, camera);
    
}
render();




if (window.matchMedia("(orientation: portrait)").matches) {

 }
 
if (window.matchMedia("(orientation: landscape)").matches) {

    // you're in LANDSCAPE mode
 }

 
