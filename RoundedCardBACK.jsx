import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';
import { useDrag } from 'react-use-gesture';
import { useFrame } from '@react-three/fiber';

// Import SVG asset URLs.
import clickIconURL from '../assets/icons/click.svg';
import flipIconURL from '../assets/icons/flip.svg';

const DEFAULT_ROTATION = [0, 0, 0];
const FLIPPED_ROTATION = [0, Math.PI, 0];
const ROTATE_RATIO = 0.55;
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const DRAG_DISTANCE_THRESHOLD = 20; // pixels
const CLICK_DURATION_THRESHOLD = 200; // ms

// Utility: create a grid texture with an interleaving pattern.
// Pattern (rows and columns can be adjusted):
//   Row 0: A B A B A B A ...   (A = flip.svg, B = click.svg)
//   Row 1: B A B A B A B ...
// For this example we set up an 8 x 8 grid.
const createIconsTexture = () => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Clear canvas.
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cols = 8;
    const rows = 8;
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    const svgScale = 0.8;

    // Create Image objects for the icons.
    const clickImg = new Image();
    const flipImg = new Image();
    clickImg.src = clickIconURL;
    flipImg.src = flipIconURL;

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount < 2) return;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Determine pattern: for even rows, A when col is even; for odd rows, reverse.
          const isEvenRow = row % 2 === 0;
          const isA = isEvenRow ? col % 2 === 0 : col % 2 !== 0;
          // In this revised design:
          //   A cells use flip.svg, B cells use click.svg.
          const iconImg = isA ? flipImg : clickImg;
          
          // Compute rotations:
          // For click (B) cells: rotation = 90° * (col+row) mod 360.
          // For flip (A) cells: follow a 4‑step cycle:
          //    Cycle (index = (col+row) mod 4):
          //      0: normal,
          //      1: rotated 90°,
          //      2: normal but mirrored horizontally,
          //      3: rotated 90° and mirrored.
          let rotation = 0;
          let mirror = false;
          if (!isA) {
            rotation = (90 * (col + row)) % 360;
          } else {
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
          if (mirror) {
            ctx.scale(-1, 1);
          }
          const drawW = cellWidth * svgScale;
          const drawH = cellHeight * svgScale;
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
    clickImg.onload = onLoad;
    flipImg.onload = onLoad;
  });
};

const RoundedCard = (props) => {
  const width = 2, height = 3, radius = 0.3;
  const borderWidth = 0.15, thickness = 0.02;
  const epsilon = 0.02; // small offset

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
  const [iconsTexture, setIconsTexture] = useState(null);

  // Load the grid texture.
  useEffect(() => {
    createIconsTexture().then((texture) => {
      setIconsTexture(texture);
    });
  }, []);

  // Animate card rotation.
  const [spring, api] = useSpring(() => ({
    rotation: DEFAULT_ROTATION,
    config: { mass: 0.5, tension: 100, friction: 8 }
  }));
  useEffect(() => {
    api.start({ rotation: flipped ? FLIPPED_ROTATION : DEFAULT_ROTATION });
  }, [flipped, api]);

  // Drag gesture.
  const bind = useDrag(({ down, movement: [mx, my], first, last }) => {
    if (first) setStartTime(Date.now());
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
      if (duration < CLICK_DURATION_THRESHOLD && distance < DRAG_DISTANCE_THRESHOLD) {
        setFlipped((prev) => !prev);
      } else {
        api.start({ rotation: baseRotation });
      }
    }
  });

  // Outer card shape.
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

  // Inner card shape.
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
    bevelSegments: 10
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

  // Grid geometry: use inner shape so the pattern is clipped.
  const gridGeometry = useMemo(() => {
    const geo = new THREE.ShapeGeometry(innerShape);
    geo.center();
    return geo;
  }, [innerShape]);

  // Create a ref for the material.
  const materialRef = useRef();

  useFrame((state, delta) => {
    const speed = 0.01;
    if (iconsTexture) {
      iconsTexture.offset.x = (iconsTexture.offset.x + delta * speed) % 1;
      iconsTexture.offset.y = (iconsTexture.offset.y + delta * speed) % 1;
    }
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      const shine_base = 0.2;
      const shine_max = 0.3;
      materialRef.current.opacity = (shine_base+shine_max)/2 + (shine_base-shine_max)/2 * Math.sin(t * 2);
      materialRef.current.clearcoat = 0.9 + 0.1 * Math.sin(t * 1.5 + 1.0);
      // Keep clearcoat roughness low for a shiny reflection.
      materialRef.current.clearcoatRoughness = 0.01;
    }
  });

  if (!iconsTexture) return null;

  return (
    <a.group {...props} {...bind()} rotation={spring.rotation}>
      {/* Card Border */}
      <mesh geometry={outerGeometry}>
        <meshStandardMaterial color={borderColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Front Interior */}
      <mesh geometry={innerGeometryFront}>
        <meshStandardMaterial color={interiorFrontColor} side={THREE.FrontSide} />
      </mesh>

      {/* Back Interior */}
      <mesh geometry={innerGeometryBack}>
        <meshStandardMaterial color={interiorBackColor} side={THREE.FrontSide} />
      </mesh>

      {/* Icon Grid Pattern on the Back Interior */}
      <mesh position={[0, 0, epsilon + 0.02]} geometry={gridGeometry}>
        <a.meshPhysicalMaterial
          ref={materialRef}
          map={iconsTexture}
          bumpMap={iconsTexture}
          bumpScale={0.05}
          metalness={1}
          roughness={0.05}
          transparent={true}
          depthTest={false}
        />
      </mesh>
    </a.group>
  );
};

export default RoundedCard;
