import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Card from './components/Card/Card';
import './App.css';

function App() {
  // selected section ("home", "developer", "potter", "photographer")
  const [selectedSection, setSelectedSection] = useState('home');

  // Handle section selection and perform smooth scrolling
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app">
      <Navbar onSectionSelect={handleSectionSelect} />
      <div className="main-content">
        <div className="text-area">
          <h1>Hello! I am Tony Cao</h1>
          <div className="section-links">
            <span onClick={() => handleSectionSelect('developer')}>developer</span>
            <span onClick={() => handleSectionSelect('ceramicist')}>ceramicist</span>
            <span onClick={() => handleSectionSelect('photographer')}>photographer</span>
          </div>
          <div className="sections">
            <section id="developer">
              <h2>developer</h2>
              {/* Additional developer section text can go here */}
            </section>
            <section id="ceramicist">
              <h2>ceramicist</h2>
              {/* Additional ceramicist section text can go here */}
            </section>
            <section id="photographer">
              <h2>photographer</h2>
              {/* Additional photographer section text can go here */}
            </section>
          </div>
        </div>
        <Card selectedSection={selectedSection} />
      </div>
    </div>
  );
}

export default App;
