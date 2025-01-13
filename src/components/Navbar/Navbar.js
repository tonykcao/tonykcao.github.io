import React from 'react';
import { ReactComponent as GitHubLogo } from '../../assets/icons/github.svg';
import { ReactComponent as LinkedInLogo } from '../../assets/icons/linkedin.svg';
import resume from '../../assets/pdf/resume.pdf';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="social-links">
        <a
          href="https://linkedin.com/in/tonykcao"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          <LinkedInLogo className="social-icon" />
        </a>
        <a
          href="https://github.com/tonykcao"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          <GitHubLogo className="social-icon" />
        </a>
        <a
          href={resume}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Resume"
        >
          CV
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
