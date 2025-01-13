import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';
import Developer from './CardContent/Developer';
import Ceramicist from './CardContent/Ceramicist';
import Photographer from './CardContent/Photographer.js';

function Card({ selectedSection }) {
  let content;
  switch (selectedSection) {
  case 'developer':
    content = <Developer />;
    break;
  case 'ceramicist':
    content = <Ceramicist />;
    break;
  case 'photographer':
    content = <Photographer />;
    break;
  default:
    content = (
      <div className="card-default">
        <img src="/assets/images/my-picture.jpg" alt="My portrait" />
      </div>
    );
  }

  return (
    <motion.div
      className="card-container"
      initial={{ rotateY: 0 }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 0.6 }}
    >
      <div className="card">{content}</div>
    </motion.div>
  );
}

export default Card;
