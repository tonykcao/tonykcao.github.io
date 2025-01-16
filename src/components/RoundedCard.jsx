import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { useDrag } from 'react-use-gesture';

import IconGridFace from './Faces/IconGridFace';
import ImageFace from './Faces/ImageFace';

// import eyeIconURL from '../assets/icons/eyeslash.svg';
// import ghostIconURL from '../assets/icons/ghost.svg';
import clickIconURL from '../assets/icons/click.svg';
import flipIconURL from '../assets/icons/flip.svg';
import profileImage from '../assets/image/profile.jpg';

// const DEFAULT_ROTATION = [0, 0, 0];
const ROTATE_RATIO = 0.65;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const DRAG_DISTANCE_THRESHOLD = 20; // pixels
const CLICK_DURATION_THRESHOLD = 200; // ms

const RoundedCard = (props) => {
  const width = 2,
    height = 3,
    radius = 0.3;
  const borderWidth = 0.15,
    thickness = 0.01;
  const epsilon = 0.01; // small offset to avoid z-fighting

  // colors.
  const borderColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      const root = window.getComputedStyle(document.documentElement);
      return root.getPropertyValue('--color-bone').trim() || '#000000';
    }
    return '#000000';
  }, []);
  const interiorFrontColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      const root = window.getComputedStyle(document.documentElement);
      return root.getPropertyValue('--color-blue').trim() || '#ffffff';
    }
    return '#ffffff';
  }, []);
  const interiorBackColor = '#ffffff';

  // keep track of our card’s current Y rotation.
  const [baseY, setBaseY] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // compute inner shape.
  const innerShape = useMemo(() => {
    const iw = width - 2 * borderWidth;
    const ih = height - 2 * borderWidth;
    const ir = Math.max(0, radius - borderWidth);
    const shape = new THREE.Shape();
    shape.moveTo(-iw / 2 + ir, -ih / 2);
    shape.lineTo(iw / 2 - ir, -ih / 2);
    shape.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + ir);
    shape.lineTo(iw / 2, ih / 2 - ir);
    shape.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - ir, ih / 2);
    shape.lineTo(-iw / 2 + ir, ih / 2);
    shape.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - ir);
    shape.lineTo(-iw / 2, -ih / 2 + ir);
    shape.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + ir, -ih / 2);
    return shape;
  }, [width, height, radius, borderWidth]);

  // geometry with thickness.
  const extrudeSettings = {
    depth: 0.015,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.2 * epsilon,
    bevelOffset: 0.005,
    bevelSegments: 3,
  };
  const innerExtrudedGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(innerShape, extrudeSettings);
    geo.center();
    return geo;
  }, [innerShape, extrudeSettings]);

  // Animate card rotation.
  const [spring, api] = useSpring(() => ({
    rotation: [0, baseY, 0],
    config: { mass: 0.5, tension: 100, friction: 8 },
  }));

  useEffect(() => {
    api.start({ rotation: [0, baseY, 0] });
  }, [baseY, api]);

  // Drag gesture.
  const bind = useDrag(({ down, movement: [mx, my], first, last, event }) => {
    if (first) {
      setStartTime(Date.now());
    }
    const baseRotationX = 0;
    const baseRotationY = baseY;
    const minX = baseRotationX - Math.PI * ROTATE_RATIO;
    const maxX = baseRotationX + Math.PI * ROTATE_RATIO;
    const minY = baseRotationY - Math.PI * ROTATE_RATIO;
    const maxY = baseRotationY + Math.PI * ROTATE_RATIO;
    if (down) {
      const deltaX = clamp(baseRotationX + my / 500, minX, maxX);
      const deltaY = clamp(baseRotationY + mx / 250, minY, maxY);
      api.start({ rotation: [deltaX, deltaY, 0] });
    }
    if (last) {
      const duration = Date.now() - startTime;
      const distance = Math.sqrt(mx ** 2 + my ** 2);
    
      // not valid click
      if (duration >= CLICK_DURATION_THRESHOLD || distance >= DRAG_DISTANCE_THRESHOLD) {
        api.start({ rotation: [baseRotationX, baseRotationY, 0] });
        return;
      }
    
      const clickX = event.point.x;
      const clickIncrement = clickX < 0 ? -Math.PI : Math.PI;
      let targetY = baseY + clickIncrement;
    
      // champ targetY, infinite spin illusion
      if (targetY > Math.PI) {
        targetY -= 2 * Math.PI;
        api.set({ rotation: [0, targetY - Math.PI, 0] });
      } else if (targetY < -Math.PI) {
        targetY += 2 * Math.PI;
        api.set({ rotation: [0, targetY + Math.PI, 0] });
      }
    
      setBaseY(targetY);
      api.start({ rotation: [0, targetY, 0] });
    }
  });

  const alternateArray = (index, clickArray, flipArray) =>
    index % 2 === 0
      ? clickArray[Math.floor(index / 2)]
      : flipArray[Math.floor(index / 2)];

  // const patternSize = 8;
  // const eyeRotation = [0, 0, 0, 0];
  // const eyeMirrored = [false, false, false, false];
  // const ghostRotation = [0, 0, 0, 0];
  // const ghostMirrored = [false, false, false, false];
  // const svgArrayPeek = Array.from({ length: patternSize }, (_, index) => index % 2 === 0 ? eyeIconURL : ghostIconURL);
  // const rotationArrayPeek = Array.from({ length: patternSize }, (_, index) => alternateArray(index, eyeRotation, ghostRotation));
  // const mirrorArrayPeek = Array.from({ length: patternSize }, (_, index) => alternateArray(index, eyeMirrored, ghostMirrored));
  const patternSize = 8;
  const clickRotation = [90, 270, 90, 270];
  const clickMirrored = [false, false, false, false];
  const flipRotation = [45, 45, 45, 45];
  const flipMirrored = [false, true, false, true];
  const svgArray = Array.from({ length: patternSize }, (_, index) =>
    index % 2 === 0 ? clickIconURL : flipIconURL
  );
  const rotationArray = Array.from({ length: patternSize }, (_, index) =>
    alternateArray(index, clickRotation, flipRotation)
  );
  const mirrorArray = Array.from({ length: patternSize }, (_, index) =>
    alternateArray(index, clickMirrored, flipMirrored)
  );

  const borderGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + radius, -height / 2);
    shape.lineTo(width / 2 - radius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);
    shape.lineTo(width / 2, height / 2 - radius);
    shape.quadraticCurveTo(width / 2, height / 2, width / 2 - radius, height / 2);
    shape.lineTo(-width / 2 + radius, height / 2);
    shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - radius);
    shape.lineTo(-width / 2, -height / 2 + radius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);
  
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelOffset: 0.01,
      bevelSegments: 3,
    });
    geo.center();
    return geo;
  }, [width, height, radius, thickness]);

  return (
    <a.group {...props} {...bind()} rotation={spring.rotation}>
      {/* Card Border */}
      <mesh geometry={borderGeometry}>
        <meshStandardMaterial
          color={borderColor}
          side={THREE.FrontSide}
          metalness={0.05}
          roughness={0.4}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Front Face */}
      <IconGridFace
        geometry={innerExtrudedGeometry.clone().translate(0, 0, 1 * epsilon)}
        svgArray={svgArray}
        rotationArray={rotationArray}
        mirrorArray={mirrorArray}
        cols={8}
        rows={8}
        fillRatio={0.8}
        xSpeed={0.005}
        ySpeed={0.01}
        backgroundColor={interiorFrontColor}
        secretsRGBA='rgba(255,255,255,0.01)'
      />

      {/* Back Face */}
      <ImageFace
        geometry={innerExtrudedGeometry.clone().rotateY(Math.PI).translate(0, 0, -1 * epsilon)}
        image={profileImage}
        crop={{ repeat: [1, 0.75], offset: [0.525, 0.5] }}
        scale={0.49}
        backgroundColor={interiorBackColor}
        materialParams={{
          metalness: 0,
          roughness: 0.5,
          clearcoat: 1,
          clearcoatRoughness: 0,
        }}
      />
    </a.group>
  );
};

export default RoundedCard;
