import '../styles/Features.css';

const Features: React.FC = () => {
  const features = [
    {
      icon: '👁️',
      title: 'Automatic Clipboard Monitoring',
      description: 'Automatically detects when you copy text using Ctrl+C, right-click copy, or any other copy method.'
    },
    {
      icon: '📚',
      title: 'Clipboard History',
      description: 'Stores up to 50 recent clipboard items so you never lose important copied content.'
    },
    {
      icon: '🖱️',
      title: 'Click to Copy',
      description: 'Simply click any item in your history to instantly copy it back to your clipboard.'
    },
    {
      icon: '🗑️',
      title: 'Easy Deletion',
      description: 'Remove individual items with the X button or clear your entire history with one click.'
    },
    {
      icon: '⌨️',
      title: 'Global Shortcuts',
      description: 'Press Ctrl+Shift+V to quickly toggle the Cliperton window from anywhere.'
    },
    {
      icon: '🔔',
      title: 'System Tray Integration',
      description: 'Runs quietly in the background with convenient system tray access and controls.'
    },
    {
      icon: '🎨',
      title: 'Clean Modern UI',
      description: 'Beautiful, responsive interface with smooth animations and intuitive design.'
    },
    {
      icon: '🌍',
      title: 'Cross-Platform',
      description: 'Works seamlessly on Windows, macOS, and Linux operating systems.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'All clipboard data stays on your device. No data is sent to external servers.'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-description">
            Everything you need to manage your clipboard efficiently and securely
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
