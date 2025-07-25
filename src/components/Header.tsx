import { useState } from 'react';
import { trackNavigation, trackButtonClick } from '../utils/analytics';
import '../styles/Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    trackButtonClick('mobile_menu_toggle', 'header_section', isMenuOpen ? 'Close Menu' : 'Open Menu');
  };

  const scrollToSection = (sectionId: string) => {
    trackNavigation(sectionId, 'header_menu');
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-brand">
          <span className="logo">📋</span>
          <span className="brand-name">Cliperton</span>
        </div>
        
        <div className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <a href="#home" onClick={() => scrollToSection('home')} className="nav-link">Home</a>
          <a href="#features" onClick={() => scrollToSection('features')} className="nav-link">Features</a>
          <a href="#how-to-use" onClick={() => scrollToSection('how-to-use')} className="nav-link">How to Use</a>
          <a href="#download" onClick={() => scrollToSection('download')} className="nav-link download-link">Download</a>
        </div>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`hamburger-line ${isMenuOpen ? 'hamburger-line-open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'hamburger-line-open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'hamburger-line-open' : ''}`}></span>
        </button>
      </nav>
    </header>
  );
};

export default Header;
