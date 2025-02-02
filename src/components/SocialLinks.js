// src/components/SocialLinks.js

import React from 'react';
import { ReactComponent as LinkedInIcon } from '../assets/icons/linkedin.svg';
import { ReactComponent as GitHubIcon } from '../assets/icons/github.svg';
import { ReactComponent as CvIcon } from '../assets/icons/cv_icon.svg';
import cvFile from '../assets/pdf/resume.pdf';


const SocialLinks = () => {
  const iconStyle = { width: '40px', height: '40px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <a
        href="https://github.com/tonykcao"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
        title='GitHub'
      >
        <GitHubIcon style={iconStyle} />
      </a>
      <a
        href="https://www.linkedin.com/in/tonykcao"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
        title='LinkedIn'
      >
        <LinkedInIcon style={iconStyle} />
      </a>
      <a
        href={cvFile}
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
        title='Resume PDF'
      >
        <CvIcon style={iconStyle} />
      </a>
    </div>
  );
};

export default SocialLinks;
