// src/components/SocialLinks.jsx
import React from 'react';
import { ReactComponent as LinkedInIcon } from '../assets/icons/linkedin.svg';
import { ReactComponent as GitHubIcon } from '../assets/icons/github.svg';
import { ReactComponent as CvIcon } from '../assets/icons/cv_icon.svg';

const SocialLinks = () => {
  const iconStyle = { width: '40px', height: '40px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <a
        href="https://www.linkedin.com/in/yourprofile"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
      >
        <LinkedInIcon style={iconStyle} />
      </a>
      <a
        href="https://github.com/yourprofile"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
      >
        <GitHubIcon style={iconStyle} />
      </a>
      <a
        href="/assets/pdf/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
      >
        <CvIcon style={iconStyle} />
      </a>
    </div>
  );
};

export default SocialLinks;
