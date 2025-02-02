// src/components/RoundedCard.js

import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { useDrag } from 'react-use-gesture';
import { createExtrudedGeometry } from './geometryUtils';
import BlankFace from './Faces/BlankFace';

const ROTATE_RATIO = 0.65;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
const DRAG_DISTANCE_THRESHOLD = 20; // pixels
const CLICK_DURATION_THRESHOLD = 200; // ms

/**
 * RoundedCard is a 3D card that manages its two faces independently.
 * This version uses the provided card faces directly rather than caching
 * them in internal state.
 */
const RoundedCard = ({
  cardFront,
  cardBack,
  onValidFlip, // optional callback
  ...props
}) => {
  // Dimensions, border, and a small epsilon (to avoid z-fighting)
  const width = 2;
  const height = 3;
  const radius = 0.3;
  const borderWidth = 0.15;
  const thickness = 0.01;
  const epsilon = 0.01;

  // Retrieve border color
  const borderColor = useMemo(() => {
    if (typeof window !== 'undefined') {
      const root = window.getComputedStyle(document.documentElement);
      return root.getPropertyValue('--color-bone').trim() || '#000000';
    }
    return '#000000';
  }, []);

  const innerExtrudedGeometry = useMemo(
    () =>
      createExtrudedGeometry(
        width,
        height,
        thickness,
        radius,
        borderWidth,
        epsilon
      ),
    [width, height, thickness, radius, borderWidth, epsilon]
  );
  const borderGeometry = useMemo(
    () =>
      createExtrudedGeometry(
        width + 1.1 * radius,
        height + 1.1 * radius,
        thickness,
        1.5 * radius,
        borderWidth,
        epsilon
      ),
    [width, height, thickness, radius, borderWidth, epsilon]
  );

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { mass: 0.5, tension: 100, friction: 8 },
  }));

  const [startTime, setStartTime] = useState(0);
  const [baseY, setBaseY] = useState(0);

  // Instead of storing card faces in state,
  // always use the passed-in props or fallback to defaults.
  const frontFace = cardFront || {
    Component: BlankFace,
    props: { geometry: innerExtrudedGeometry, color: 'red' },
  };
  const backFace = cardBack || {
    Component: BlankFace,
    props: { geometry: innerExtrudedGeometry, color: 'blue' },
  };

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

      // Not a valid click if the gesture lasted too long or moved too far:
      if (duration >= CLICK_DURATION_THRESHOLD || distance >= DRAG_DISTANCE_THRESHOLD) {
        api.start({ rotation: [baseRotationX, baseRotationY, 0] });
        return;
      }

      // Valid click—treat it as a flip.
      const clickX = event.point.x;
      const clickIncrement = clickX < 0 ? -Math.PI : Math.PI;
      let targetY = baseY + clickIncrement;

      // Adjust targetY for continuous spin illusion:
      if (targetY > Math.PI) {
        targetY -= 2 * Math.PI;
        api.set({ rotation: [0, targetY - Math.PI, 0] });
      } else if (targetY < -Math.PI) {
        targetY += 2 * Math.PI;
        api.set({ rotation: [0, targetY + Math.PI, 0] });
      }

      setBaseY(targetY);
      api.start({ rotation: [0, targetY, 0] });

      // Notify the parent of a valid flip.
      if (onValidFlip) {
        onValidFlip(clickX);
      }
    }
  });

  return (
    <a.group
      {...props}
      {...bind()}
      rotation={spring.rotation}
      onClick={props.onClick} // any onClick passed from parent
    >
      {/* Border */}
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

      {/* Front Container: Always applies a small positive z-offset */}
      <group position={[0, 0, 1 * epsilon]}>
        {frontFace.Component && <frontFace.Component {...frontFace.props} />}
      </group>

      {/* Back Container: Applies a π Y-rotation and negative z-offset */}
      <group rotation={[0, Math.PI, 0]} position={[0, 0, -1 * epsilon]}>
        {backFace.Component && <backFace.Component {...backFace.props} />}
      </group>
    </a.group>
  );
};

export default RoundedCard;
