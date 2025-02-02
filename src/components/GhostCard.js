// src/components/GhostCard.js

import React, { useMemo, useState, Suspense } from 'react';
import { createExtrudedGeometry } from './geometryUtils';
import RoundedCard from './RoundedCard';
import IconGridFace from './Faces/IconGridFace';
import GhostFace from './Faces/GhostFace';
import clickIconURL from '../assets/icons/click.svg';
import flipIconURL from '../assets/icons/flip.svg';

const interiorFrontColor = '#598392';

const alternateArray = (index, arr1, arr2) =>
  index % 2 === 0 ? arr1[index % arr1.length] : arr2[index % arr2.length];

const GhostCard = ({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  onClick = () => {},
}) => {
  // Track whether the card has been clicked/flipped at least once.
  const [hasClicked, setHasClicked] = useState(false);

  const width = 2;
  const height = 3;
  const radius = 0.3;
  const borderWidth = 0.15;
  const thicknessVal = 0.01;
  const epsilon = 0.02; // small offset to avoid z-fighting

  const innerExtrudedGeometry = useMemo(() => {
    return createExtrudedGeometry(width, height, thicknessVal, radius, borderWidth, epsilon);
  }, [width, height, thicknessVal, radius, borderWidth, epsilon]);

  // Front face configuration remains the same.
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

  const customFront = {
    Component: IconGridFace,
    props: {
      geometry: innerExtrudedGeometry.clone(),
      svgArray,
      rotationArray,
      mirrorArray,
      cols: 8,
      rows: 8,
      fillRatio: 0.8,
      xSpeed: 0.0075,
      ySpeed: 0.015,
      backgroundColor: interiorFrontColor,
      secretsRGBA: 'rgba(255,255,255,0.01)',
    },
  };

  const ghostFaceConfig = useMemo(() => GhostFace(innerExtrudedGeometry), [innerExtrudedGeometry]);

  // onValidFlip is triggered inside RoundedCard when a valid flip happens.
  const handleValidFlip = () => {
    if (!hasClicked) {
      setHasClicked(true);
    }
  };

  return (
    <Suspense fallback={null}>
      <RoundedCard
        position={position}
        scale={scale}
        cardFront={customFront}
        // Until the first valid flip, use ghostFaceConfig; after that, use customBack.
        cardBack={ghostFaceConfig}
        onValidFlip={handleValidFlip}
        onClick={onClick}
      />
    </Suspense>
  );
};

export default GhostCard;
