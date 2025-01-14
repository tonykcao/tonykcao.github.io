import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { useDrag } from 'react-use-gesture';


const DEFAULT_ROTATION = [0, 0, 0];
const FLIPPED_ROTATION = [0, Math.PI, 0];
const ROTATE_RATIO = 0.55;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// Thresholds
const DRAG_DISTANCE_THRESHOLD = 20; // pixels
const CLICK_DURATION_THRESHOLD = 200; // ms

const RoundedCard = (props) => {
  const width = 2, height = 3, radius = 0.3;
  const borderWidth = 0.15, thickness = 0.02;

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
      return root.getPropertyValue('--color-blue').trim() || '#000000';
    }
    return '#000000';
  }, []);
  const interiorBackColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      const root = window.getComputedStyle(document.documentElement);
      return root.getPropertyValue('--color-celadon').trim() || '#000000';
    }
    return '#000000';
  }, []);

  const [flipped, setFlipped] = useState(false);
  const [startTime, setStartTime] = useState(0);
  
  // spring anim
  const [spring, api] = useSpring(() => ({
    rotation: DEFAULT_ROTATION,
    config: { mass: 0.5, tension: 100, friction: 8 },
  }));

  // rotation when flipped changes
  useEffect(() => {
    api.start({ rotation: flipped ? FLIPPED_ROTATION : DEFAULT_ROTATION });
  }, [flipped, api]);

  // drag
  const bind = useDrag(({ down, movement: [mx, my], first, last }) => {
    if (first) {
      setStartTime(Date.now());
    }
  
    const baseRotation = flipped ? FLIPPED_ROTATION : DEFAULT_ROTATION;
  
    const minX = baseRotation[0] - Math.PI * ROTATE_RATIO;
    const maxX = baseRotation[0] + Math.PI * ROTATE_RATIO;
    const minY = baseRotation[1] - Math.PI * ROTATE_RATIO;
    const maxY = baseRotation[1] + Math.PI * ROTATE_RATIO;
  
    if (down) {
      const deltaX = clamp(baseRotation[0] + my / 500, minX, maxX);
      const deltaY = clamp(baseRotation[1] + mx / 250, minY, maxY);
      api.start({ rotation: [deltaX, deltaY, 0] });
    }
  
    if (last) {
      const duration = Date.now() - startTime;
      const distance = Math.sqrt(mx ** 2 + my ** 2);
  
      // only if drag was quick 
      if (duration < CLICK_DURATION_THRESHOLD && distance < DRAG_DISTANCE_THRESHOLD) {
        setFlipped((prev) => !prev);
      } else {
        api.start({ rotation: baseRotation });
      }
    }
  });

  const outerShape = useMemo(() => {
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
    return shape;
  }, [width, height, radius]);

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

  const extrudeSettingsOuter = {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelOffset: 0.01,
    bevelSegments: 10,
  };
  const extrudeSettingsInner = { depth: thickness, bevelEnabled: false };

  const outerGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(outerShape, extrudeSettingsOuter);
    geo.center();
    return geo;
  }, [outerShape, extrudeSettingsOuter]);

  const baseInnerGeometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(innerShape, extrudeSettingsInner);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, [innerShape, extrudeSettingsInner]);

  const epsilon = 0.02;
  const innerGeometryFront = useMemo(() => {
    const geo = baseInnerGeometry.clone();
    geo.translate(0, 0, epsilon);
    return geo;
  }, [baseInnerGeometry, epsilon]);

  const innerGeometryBack = useMemo(() => {
    const geo = baseInnerGeometry.clone();
    geo.translate(0, 0, -epsilon);
    return geo;
  }, [baseInnerGeometry, epsilon]);

  return (
    <a.group
      {...props}
      {...bind()}
      rotation={spring.rotation}
    >
      <mesh geometry={outerGeometry}>
        <meshStandardMaterial color={borderColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={innerGeometryFront}>
        <meshStandardMaterial color={interiorFrontColor} side={THREE.FrontSide} />
      </mesh>
      <mesh geometry={innerGeometryBack}>
        <meshStandardMaterial color={interiorBackColor} side={THREE.FrontSide} />
      </mesh>
    </a.group>
  );
};

export default RoundedCard;
