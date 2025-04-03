import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} FundGene. 保留所有权利</p>
      </div>
    </footer>
  );
};

export default Footer;
