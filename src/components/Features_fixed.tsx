import '../styles/Features.css';

const Features: React.FC = () => {
  const features = [
    {
      icon: '👁️',
      title: 'Automatic Clipboard Management',
      description: 'Automatically adds to Cliperton when you copy text using Ctrl+C, right-click copy, or any other copy method.'
    },
    {
      icon: '📚',
      title: 'Clipboard History',
      description: 'Stores up to 50 recent clipboard items so you never lose important copied content.'
    },
    {
      icon: '🖱️',
      title: 'Click to Copy',
      description: 'Simply click any item in your Cliperton history to instantly copy it back to your clipboard.'
    },
    {
      icon: '📦',
      title: 'Save and Load Groups',
      description: 'Create, save, and load groups of clipboard items for different projects or tasks.'
    },
    {
      icon: '🗑️',
      title: 'Easy Deletion',
      description: 'Remove individual items with the X button or clear your entire history with one click.'
    },
    {
      icon: '📌',
      title: 'Pin your Favorites',
      description: 'Conveniently pin your most important clips to the top for quick access.'
    },
    {
      icon: '🪟',
      title: 'A Perfect Companion That Doesn\'t Get in Your Way',
      description: 'Draggable, resizable window that stays out of your way and right where you want it.'
    },
    {
      icon: '🎨',
      title: 'Simple & Fast',
      description: 'Beautiful, responsive interface with smooth animations and intuitive design.'
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
            Everything you need to turbocharge your clipboard management and productivity.
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
