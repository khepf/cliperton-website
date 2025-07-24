import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Download from './components/Download';
import HowToUse from './components/HowToUse';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import { useScrollTracking } from './hooks/useScrollTracking';
import useToast from './hooks/useToast';
import './App.css';

function App() {
  // Enable scroll tracking
  useScrollTracking();
  
  // Toast system
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  return (
    <div className="App">
      <Header />
      <Hero />
      <Features />
      <HowToUse />
      <Download 
        showSuccess={showSuccess}
        showError={showError}
        showInfo={showInfo}
      />
      <Footer />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;
