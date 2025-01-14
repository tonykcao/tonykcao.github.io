import React from 'react';
import * as THREE from 'three';

const BlankFace = ({ geometry, color }) => (
  <mesh geometry={geometry}>
    <meshStandardMaterial color={color} side={THREE.FrontSide} />
  </mesh>
);

export default BlankFace;
