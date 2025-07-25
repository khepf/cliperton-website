import '../styles/Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <span className="footer-logo">📋</span>
              <span className="footer-name">Cliperton</span>
            </div>
            <p className="footer-description">
              Modern clipboard manager for enhanced productivity. 
              Access to multiple clipboard items at once. Never lose copied content again.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Features</h4>
            <ul className="footer-links">
              <li><a href="#features">Perfect for AI Prompts</a></li>
              <li><a href="#features">Create and Save Your Own Clipboard Groups</a></li>
              <li><a href="#features">Great for Tedious Copy Paste Tasks</a></li>
              <li><a href="#features">Works On Any Windows 10 or 11 Device</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#how-to-use">How to Use</a></li>
              <li><a href="#download">System Requirements</a></li>
              <li><a href="mailto:support@cliperton.com">Contact Support</a></li>
              <li><a href="/privacy.html">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Download</h4>
            <ul className="footer-links">
              <li><a href="#download">Windows Installer</a></li>
              <li><span className="coming-soon-text">macOS (Coming Soon)</span></li>
              <li><span className="coming-soon-text">Linux (Coming Soon)</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} QCTS. All rights reserved.
            </p>
            <div className="footer-meta">
              <span className="version">Version 2.1.1</span>
              <span className="separator">•</span>
              <a href="/terms.html" className="footer-link">Terms of Service</a>
              <span className="separator">•</span>
              <a href="/privacy.html" className="footer-link">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
