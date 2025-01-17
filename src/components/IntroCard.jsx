import React, { useMemo } from 'react';
import { createExtrudedGeometry } from './geometryUtils';
import RoundedCard from './RoundedCard';
import IconGridFace from './Faces/IconGridFace';
import ImageFace from './Faces/ImageFace';
import profileImage from '../assets/image/profile.jpg';
import clickIconURL from '../assets/icons/click.svg';
import flipIconURL from '../assets/icons/flip.svg';

const interiorFrontColor = '#598392';
const interiorBackColor = '#ffffff';

const alternateArray = (index, arr1, arr2) => (index % 2 === 0 ? arr1[index % arr1.length] : arr2[index % arr2.length]);

const IntroCard = ({ position = [0, 0, 0], scale = [1, 1, 1] }) => {
  const width = 2;
  const height = 3;
  const radius = 0.3;
  const borderWidth = 0.15;
  const thicknessVal = 0.01;
  const epsilon = 0.02; // small offset to avoid z-fighting

  const innerExtrudedGeometry = useMemo(() => {
    return createExtrudedGeometry(width, height, thicknessVal, radius, borderWidth, epsilon);
  }, []);

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
      position: [0, 0, epsilon],
      geometry: innerExtrudedGeometry.clone(),
      svgArray: svgArray,
      rotationArray: rotationArray,
      mirrorArray: mirrorArray,
      cols: 8,
      rows: 8,
      fillRatio: 0.8,
      xSpeed: 0.0075,
      ySpeed: 0.015,
      backgroundColor: interiorFrontColor,
      secretsRGBA: 'rgba(255,255,255,0.01)',
    },
  };

  const customBack = {
    Component: ImageFace,
    props: {
      geometry: innerExtrudedGeometry.clone(),
      image: profileImage,
      crop: { repeat: [1, 0.75], offset: [0.525, 0.5] },
      scale: 0.49,
      backgroundColor: interiorBackColor,
      materialParams: {
        metalness: 0,
        roughness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
      },
    },
  };

  return <RoundedCard position={position} scale={scale} cardFront={customFront} cardBack={customBack} />;
};

export default IntroCard;
