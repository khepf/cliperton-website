import { trackButtonClick } from '../utils/analytics';
import '../styles/Hero.css';

const Hero: React.FC = () => {
  const scrollToDownload = () => {
    trackButtonClick('Download Now', 'Hero Section');
    const element = document.getElementById('download');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFeatures = () => {
    trackButtonClick('Learn More', 'Hero Section');
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">📋</span>
            Cliperton
          </h1>
          <p className="hero-subtitle">Modern Clipboard Manager</p>
          <p className="hero-description">
            Track, manage, and access your clipboard history with ease. Never lose 
            copied content again with our lightweight and powerful clipboard manager.
          </p>
          
          <div className="hero-features">
            <div className="hero-feature">
              <span className="feature-icon">🚀</span>
              <span>Automatic Monitoring</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">💾</span>
              <span>50 Item History</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">⌨️</span>
              <span>Global Shortcuts</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">🖥️</span>
              <span>Cross-Platform</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={scrollToDownload}>
              Download Now
            </button>
            <button className="btn btn-secondary" onClick={scrollToFeatures}>
              Learn More
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="app-window">
            <div className="window-header">
              <div className="window-controls">
                <span className="control control-close"></span>
                <span className="control control-minimize"></span>
                <span className="control control-maximize"></span>
              </div>
              <span className="window-title">Cliperton</span>
            </div>
            <div className="window-content">
              <div className="clipboard-item">
                <span className="item-text">Hello, this is copied text!</span>
                <button className="item-delete">×</button>
              </div>
              <div className="clipboard-item">
                <span className="item-text">https://example.com</span>
                <button className="item-delete">×</button>
              </div>
              <div className="clipboard-item">
                <span className="item-text">Important note for later</span>
                <button className="item-delete">×</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
