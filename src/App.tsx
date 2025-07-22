import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Download from './components/Download';
import HowToUse from './components/HowToUse';
import Footer from './components/Footer';
import { useScrollTracking } from './hooks/useScrollTracking';
import './App.css';

function App() {
  // Enable scroll tracking
  useScrollTracking();

  return (
    <div className="App">
      <Header />
      <Hero />
      <Features />
      <HowToUse />
      <Download />
      <Footer />
    </div>
  );
}

export default App;
