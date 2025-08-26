import { trackButtonClick, trackNavigation } from '../utils/analytics';
import '../styles/Hero.css';

const Hero: React.FC = () => {
  const scrollToDownload = () => {
    trackButtonClick('hero_download_cta', 'hero_section', 'Download Now');
    trackNavigation('download', 'button');
    const element = document.getElementById('download');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToFeatures = () => {
    trackButtonClick('hero_learn_more_cta', 'hero_section', 'Learn More');
    trackNavigation('features', 'button');
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
              <span>Perfect for AI Prompts</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">💾</span>
              <span>Create and Save Your Own Clipboard Groups</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">⌨️</span>
              <span>Great for Tedious Copy Paste Tasks</span>
            </div>
            <div className="hero-feature">
              <span className="feature-icon">🏪</span>
              <span>Available on Microsoft Store</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={scrollToDownload}>
              Get from Store
            </button>
            <button className="btn btn-secondary" onClick={scrollToFeatures}>
              Learn More
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="video-container">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/F1ER753QojE"
              title="Cliperton Clipboard Manager Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
