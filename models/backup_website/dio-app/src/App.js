import * as THREE from 'three'
import { useRef, useEffect, useState} from 'react'
import { Canvas, useThree, extend} from '@react-three/fiber'
import { Stats} from '@react-three/drei'

import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls';
import { OrbitControls } from '@react-three/drei';

extend({ OrbitControlsImpl });

const LockedXAxisOrbitControls = () => {
  const controls = useRef();
  const { camera, gl } = useThree();

  useEffect(() => {
    if (controls.current) {
      const azimuthAngle = 0;

      controls.current.minAzimuthAngle = azimuthAngle;
      controls.current.maxAzimuthAngle = azimuthAngle;
      controls.current.minPolarAngle = -Math.PI / 1;  
      controls.current.maxPolarAngle = Math.PI / 2;  
    }
  }, []);

  return <OrbitControls ref={controls} target={[0, 0.7, 0]} args={[camera, gl.domElement]} />;
};

function ToneMapping() {
  const { gl, scene } = useThree(({ gl, scene }) => ({ gl, scene }));
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.8;
    scene.traverse((object) => {
      if (object.material) {
        object.material.needsUpdate = true;
      }
    });
  }, [gl, scene]);
  return <></>;
}

const Model = ({ modelPath }) => {
  const [gltf, setGltf] = useState()
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      setGltf(gltf)
    });
  }, [modelPath]);
  return (
    <>
      {gltf && 
      <>
      <primitive object={gltf.scene} scale={[1, 1, 1]} />
      </>
      }
    </>
  )
};

export default function App(props) {
  const modelPath = '/mondrian.glb'

  return (
    <Canvas shadows={false} gl={{ antialias: true }} camera={{position:[0,6,0], fov:35}} {...props}>
      <color attach="background" args={['#000000']} /> 
      <ToneMapping />
      <ambientLight intensity={0} /> 
      <Model modelPath={modelPath} />
      <LockedXAxisOrbitControls/>
      <EffectComposer>
        <Vignette eskil={false} offset={0.01} darkness={1.1} />
      </EffectComposer>
      {/* <Stats /> */}
    </Canvas>
  )
}

