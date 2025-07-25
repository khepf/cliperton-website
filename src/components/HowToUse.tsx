import '../styles/HowToUse.css';

const HowToUse: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Launch Cliperton',
      description: 'Download and install Cliperton, then launch the application. It will start monitoring your clipboard automatically.',
      icon: '🚀'
    },
    {
      number: '2',
      title: 'Copy Something',
      description: 'Use Ctrl+C, right-click copy, or any other copy method on text. Cliperton will capture it automatically.',
      icon: '📋'
    },
    {
      number: '3',
      title: 'View Your History',
      description: 'The copied text appears instantly in Cliperton\'s clean, organized list interface.',
      icon: '👀'
    },
    {
      number: '4',
      title: 'Copy Back',
      description: 'Click any item in the list to copy it back to your clipboard. It\'s that simple!',
      icon: '✨'
    },
    {
      number: '5',
      title: 'Manage Items',
      description: 'Pin or delete individual items, or use "Clear All" to empty your clipboard history.',
      icon: '🗂️'
    },
    {
      number: '6',
      title: 'Save and Load Clipboard Groups',
      description: 'Create, save, and load groups of clipboard items for different projects or tasks.',
      icon: '💾'
    }
  ];

  return (
    <section id="how-to-use" className="how-to-use">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How to Use Cliperton</h2>
          <p className="section-description">
            Get started with Cliperton in just a few simple steps
          </p>
        </div>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-visual">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToUse;
