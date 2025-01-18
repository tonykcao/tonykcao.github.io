import IconGridFace from '../Faces/IconGridFace';
import eyeIconURL from '../../assets/icons/eyeslash.svg';
import ghostIconURL from '../../assets/icons/ghost.svg';
const interiorBackColor = '#666666';

const alternateArray = (index, arr1, arr2) =>
  index % 2 === 0 ? arr1[index % arr1.length] : arr2[index % arr2.length];

/**
 * ghostFace returns the configuration object.
 * accepts a geometry
 */
const ghostFace = (geometry) => {
  const patternSizePeek = 2;
  const eyeRotation = [0];
  const eyeMirrored = [false];
  const ghostRotation = [0];
  const ghostMirrored = [false];
  const svgArrayPeek = [ghostIconURL, eyeIconURL];
  const rotationArrayPeek = Array.from({ length: patternSizePeek }, (_, index) =>
    alternateArray(index, eyeRotation, ghostRotation)
  );
  const mirrorArrayPeek = Array.from({ length: patternSizePeek }, (_, index) =>
    alternateArray(index, eyeMirrored, ghostMirrored)
  );

  return {
    Component: IconGridFace,
    props: {
      geometry: geometry.clone(),
      svgArray: svgArrayPeek,
      rotationArray: rotationArrayPeek,
      mirrorArray: mirrorArrayPeek,
      cols: 4,
      rows: 4,
      fillRatio: 1,
      xSpeed: 0.02,
      ySpeed: 0.04,
      backgroundColor: interiorBackColor,
      secretsRGBA: 'rgba(255,255,255,0.1)',
    },
  };
};

export default ghostFace;