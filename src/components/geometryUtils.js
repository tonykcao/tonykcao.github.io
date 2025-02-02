// src/components/geometryUtils.js

import * as THREE from 'three';

/**
 * Creates the inner extruded geometry for the card face.
 *
 * @param {number} width - The overall card width.
 * @param {number} height - The overall card height.
 * @param {number} thickness - The overall card thickness.
 * @param {number} radius - The card's corner radius.
 * @param {number} borderWidth - The width of the card's border.
 * @param {number} epsilon - A small offset to avoid z-fighting.
 * @returns {THREE.ExtrudeGeometry} - The extruded geometry.
 */
export function createExtrudedGeometry(width, height, thickness, radius, borderWidth, epsilon) {
  const iw = width - 2 * borderWidth;
  const ih = height - 2 * borderWidth;
  const ir = Math.max(0, radius - borderWidth);
  
  // Define the rounded rectangle shape.
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

  // Extrusion settings
  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.2 * epsilon,
    bevelOffset: 0.005,
    bevelSegments: 3,
  };

  // Create and center the geometry.
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}
