import React from 'react';
import { Canvas } from '@react-three/fiber';
// import RoundedCard from './components/RoundedCard';
import SocialLinks from './components/SocialLinks';
import GhostCard from './components/GhostCard';
import './App.css';
// import RoundedCard from './components/RoundedCard';

export default function App() {
  return (
    <>
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
        <SocialLinks />
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], near: 0.1, far: 1000 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[2, 4, 7.5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <GhostCard position={[0, 0, 0]} scale = {[1.5, 1.5, 1.5]}/>
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -2, 0]}
        >
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      </Canvas>
    </>
  );
}
