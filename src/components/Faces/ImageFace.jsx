import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

const ImageFace = ({
  geometry,
  image,
  crop = { repeat: [1, 1], offset: [0, 0] },
  scale = 1,
  backgroundColor = '#ffffff',
  materialParams = {}
}) => {
  const texture = useLoader(THREE.TextureLoader, image);

  const [r0, r1] = crop.repeat;
  texture.repeat.set(r0 * scale, r1 * scale);
  texture.offset.set(...crop.offset);
  texture.needsUpdate = true;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        map={texture}
        color={backgroundColor}
        side={THREE.DoubleSide}
        {...materialParams}
      />
    </mesh>
  );
};

export default ImageFace;
