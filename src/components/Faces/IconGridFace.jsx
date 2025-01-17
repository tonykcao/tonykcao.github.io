import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { a } from '@react-spring/three';

/**
 * Create a grid texture from multiple SVGs, rotations, mirror flags, etc.
 */
function createIconsTexture({
  svgArray,
  rotationArray,
  mirrorArray,      // array of booleans for horizontal mirroring
  rowOffset,
  cols,
  rows,
  fillRatio,
  secretsRGBA,
}) {
  return new Promise((resolve) => {
    // Prepare an offscreen canvas.
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = secretsRGBA;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    const images = svgArray.map((svg) => {
      const img = new Image();
      img.src = svg;
      return img;
    });

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      // when ALL are loaded:
      if (loadedCount < images.length) return;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col + row*rowOffset;
          const i = index % images.length;

          const img = images[i];
          const rotationDeg = rotationArray[i] || 0;
          const mirror = mirrorArray[i] || false;

          const rotationRad = (Math.PI / 180) * rotationDeg;

          const cx = col * cellWidth + cellWidth / 2;
          const cy = row * cellHeight + cellHeight / 2;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rotationRad);
          if (mirror) {
            ctx.scale(-1, 1); 
          }

          const drawW = cellWidth * fillRatio;
          const drawH = cellHeight * fillRatio;
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);

      resolve(texture);
    };

    // hook up the onLoad callback for each image:
    images.forEach((img) => {
      img.onload = onLoad;
    });
  });
}

export default function IconGridFace({
  geometry,
  svgArray = [],
  rotationArray = [],
  mirrorArray = [],
  rowOffset = 1,
  cols = 8,
  rows = 8,
  fillRatio = 0.8,
  xSpeed = 0.01,
  ySpeed = 0.01,
  backgroundColor = '#ffffff',
  secretsRGBA = 'rgba(255,255,255,1)'
}) {
  const [iconsTexture, setIconsTexture] = useState(null);
  const materialRef = useRef();

  useEffect(() => {
    let canceled = false;
    createIconsTexture({
      svgArray,
      rotationArray,
      mirrorArray,
      rowOffset,
      cols,
      rows,
      fillRatio,
      secretsRGBA,
    }).then((texture) => {
      if (!canceled) {
        setIconsTexture(texture);
      }
    });
    return () => {
      canceled = true;
    };
  }, [
    svgArray,
    rotationArray,
    mirrorArray,
    rowOffset,
    cols,
    rows,
    fillRatio,
    secretsRGBA,
  ]);

  useFrame((state, delta) => {
    if (iconsTexture) {
      iconsTexture.offset.x = (iconsTexture.offset.x + xSpeed * delta) % 1;
      iconsTexture.offset.y = (iconsTexture.offset.y + ySpeed * delta) % 1;
    }
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      const blinkTime = 10;
      const shineBase = 0.2;
      const shineMax = 0.5;
      materialRef.current.opacity =
        (shineBase + shineMax) / 2 +
        ((shineBase - shineMax) / 2) *
          Math.sin(Math.cos(t) * (2 * Math.PI) / blinkTime);
    }
  });

  if (!iconsTexture) return null;

  return (
    <group>
      {/* Background layer */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={backgroundColor}
          metalness={0}
          roughness={0.55}
          depthTest={true}
        />
      </mesh>

      {/* Foreground layer (icon pattern) */}
      <mesh geometry={geometry}>
        <a.meshPhysicalMaterial
          ref={materialRef}
          map={iconsTexture}
          bumpMap={iconsTexture}
          bumpScale={0.05}
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          depthTest={true}
        />
      </mesh>
    </group>
  );
}
