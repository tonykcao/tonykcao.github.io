import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { a } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';


// Utility: Create a grid texture with an interleaving pattern.
const createIconsTexture = ({ svgA, svgB, cols, rows, fillRatio }) =>
  new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Clear canvas.
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    // Create Image objects.
    const imgA = new Image();
    const imgB = new Image();
    imgA.src = svgA;
    imgB.src = svgB;

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount < 2) return;
      // Both images loaded—draw the grid.
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // For even rows, let A cells be where (col+row) is even; for odd rows, reverse.
          const isEvenRow = row % 2 === 0;
          const isA = isEvenRow ? (col % 2 === 0) : (col % 2 !== 0);
          const iconImg = isA ? imgA : imgB;

          let rotation = 0;
          let mirror = false;
          if (!isA) {
            // B cell: rotation = 90° * (col + row) mod 360.
            rotation = (90 * (col + row)) % 360;
          } else {
            // A cell: four–step cycle.
            const index = (col + row) % 4;
            if (index === 0) {
              rotation = 0;
            } else if (index === 1) {
              rotation = 90;
            } else if (index === 2) {
              rotation = 0;
              mirror = true;
            } else if (index === 3) {
              rotation = 90;
              mirror = true;
            }
          }
          const rad = rotation * (Math.PI / 180);
          const cx = col * cellWidth + cellWidth / 2;
          const cy = row * cellHeight + cellHeight / 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rad);
          if (mirror) ctx.scale(-1, 1);
          const drawW = cellWidth * fillRatio;
          const drawH = cellHeight * fillRatio;
          ctx.drawImage(iconImg, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      resolve(texture);
    };
    imgA.onload = onLoad;
    imgB.onload = onLoad;
  });

const IconGridFace = ({
  geometry,
  svgA,
  svgB,
  cols = 8,
  rows = 8,
  fillRatio = 0.8,
  xSpeed = 0.01,
  ySpeed = 0.01,
  backgroundColor = '#ffffff'
}) => {
  const [iconsTexture, setIconsTexture] = useState(null);
  const materialRef = useRef();

  useEffect(() => {
    createIconsTexture({ svgA, svgB, cols, rows, fillRatio }).then((texture) => {
      setIconsTexture(texture);
    });
  }, [svgA, svgB, cols, rows, fillRatio]);

  useFrame((state, delta) => {
    if (iconsTexture) {
      iconsTexture.offset.x = (iconsTexture.offset.x + delta * xSpeed) % 1;
      iconsTexture.offset.y = (iconsTexture.offset.y + delta * ySpeed) % 1;
    }
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      const shine_base = 0.3;
      const shine_max = 0.4;
      materialRef.current.opacity = (shine_base+shine_max)/2 + (shine_base-shine_max)/2 * Math.sin(t * 2);
    }
  });

  if (!iconsTexture) return null;

  return (
    <group>
      {/* Background layer */}
      <mesh geometry={geometry}>
        <meshStandardMaterial color={backgroundColor}
          metalness = {0}
          roughness = {0.4}
          clearcoat = {0.1}
          clearcoatRoughness = {0.05}
        />
      </mesh>
      {/* Pattern layer */}
      <mesh geometry={geometry}>
        <a.meshPhysicalMaterial
          ref={materialRef}
          map={iconsTexture}
          bumpMap={iconsTexture}
          bumpScale={0.05}
          metalness={1}
          roughness={0.2}
          transparent
          depthTest={true}
        />
      </mesh>
    </group>
  );
};

export default IconGridFace;
