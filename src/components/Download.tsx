import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { trackDownload, trackButtonClick } from '../utils/analytics';
import '../styles/Download.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface DownloadProps {
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
}

const Download: React.FC<DownloadProps> = ({ showSuccess, showError, showInfo }) => {
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [purchaseStatus, setPurchaseStatus] = useState<string>('');

  // Check for payment results when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const paymentStatus = urlParams.get('payment') || 
                         (hash.includes('payment-success') ? 'success' : null) ||
                         (hash.includes('payment-cancelled') ? 'cancelled' : null);

    if (paymentStatus === 'success' || hash.includes('payment-success')) {
      showSuccess(
        'Payment Successful! 🎉',
        'Your license key has been sent to your email. Check your inbox (and spam folder) for activation instructions.',
        10000
      );
      // Clean up URL
      if (hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (paymentStatus === 'cancelled' || hash.includes('payment-cancelled')) {
      showInfo(
        'Payment Cancelled',
        'Your payment was cancelled. No charges were made.',
        5000
      );
      // Clean up URL
      if (hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [showSuccess, showError, showInfo]);

  const handleFreeDownload = async () => {
    setDownloadStatus('downloading');
    
    // Track free download attempt
    trackButtonClick('Free Version Download', 'Download Section');
    
    try {
      const response = await fetch('/download.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'windows',
          version: '1.0.0',
          type: 'free'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Cliperton Setup 1.0.0.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        trackDownload('Windows Free Version', 'Cliperton Setup 1.0.0.zip');
        
        setDownloadStatus('success');
        showSuccess(
          'Download Started! 📥',
          'Cliperton Free is downloading. Check your downloads folder.',
          5000
        );
        setTimeout(() => setDownloadStatus(''), 3000);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      showError(
        'Download Failed',
        'Sorry, we couldn\'t start your download. Please try again or contact support.',
        8000
      );
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  const handleProPurchase = async () => {
    setPurchaseStatus('processing');
    
    // Track pro purchase attempt
    trackButtonClick('Pro Version Purchase', 'Download Section');

    showInfo('Payment Processing', 'Redirecting to secure payment page...');
    
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      
      // Call backend to create checkout session
      const requestData = {
        product: 'cliperton-pro',
        price: parseInt(import.meta.env.VITE_PRODUCT_PRICE || '500'),
        currency: import.meta.env.VITE_PRODUCT_CURRENCY || 'usd',
        productName: import.meta.env.VITE_PRODUCT_NAME || 'Cliperton Pro License',
        successUrl: window.location.origin + '/#payment-success',
        cancelUrl: window.location.origin + '/#payment-cancelled'
      };
      
      console.log('Sending payment request with URLs:', requestData.successUrl, requestData.cancelUrl);
      
      const response = await fetch('/api/create-checkout-session.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error);
      }
      
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
      
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseStatus('error');
      showError(
        'Payment Failed', 
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        8000
      );
      setTimeout(() => setPurchaseStatus(''), 3000);
    }
  };

  return (
    <section id="download" className="download">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Choose Your Version</h2>
          <p className="section-description">
            Start free or unlock premium features
          </p>
        </div>

        <div className="download-options">
          {/* Free Version */}
          <div className="download-card">
            <div className="download-header">
              <h3 className="download-title">
                <span className="platform-icon">🆓</span>
                Cliperton Free
              </h3>
              <p className="download-price">$0</p>
            </div>
            <div className="download-features">
              <ul>
                <li>✅ Clipboard history (50 items)</li>
                <li>✅ Click to copy</li>
                <li>✅ Pin important items</li>
                <li>✅ Global shortcuts (Ctrl+Shift+V)</li>
                <li>✅ System tray integration</li>
                <li>❌ Save clipboard groups</li>
                <li>❌ Load clipboard groups</li>
                <li>❌ Import/Export collections</li>
              </ul>
            </div>
            <button 
              className={`btn btn-download ${downloadStatus === 'downloading' ? 'downloading' : ''}`}
              onClick={handleFreeDownload}
              disabled={downloadStatus === 'downloading'}
            >
              {downloadStatus === 'downloading' ? (
                <>
                  <span className="spinner"></span>
                  Downloading...
                </>
              ) : downloadStatus === 'success' ? (
                '✅ Downloaded!'
              ) : downloadStatus === 'error' ? (
                '❌ Download Failed'
              ) : (
                <>
                  <span className="download-icon">⬇️</span>
                  Download Free
                </>
              )}
            </button>
            <p className="download-size">~84 MB</p>
          </div>

          {/* Pro Version */}
          <div className="download-card featured">
            <div className="download-header">
              <h3 className="download-title">
                <span className="platform-icon">⭐</span>
                Cliperton Pro
              </h3>
              <p className="download-price">
                $5 <span className="price-note">one-time</span>
              </p>
            </div>
            <div className="download-features">
              <ul>
                <li>✅ Everything in Free</li>
                <li>✅ Save clipboard groups to files</li>
                <li>✅ Load saved clipboard groups</li>
                <li>✅ Import/Export collections</li>
                <li>✅ Backup & share clipboard history</li>
                <li>✅ Unlimited clipboard history</li>
                <li>✅ Lifetime updates</li>
                <li>✅ Priority support</li>
              </ul>
            </div>
            <button 
              className={`btn btn-primary ${purchaseStatus === 'processing' ? 'processing' : ''}`}
              onClick={handleProPurchase}
              disabled={purchaseStatus === 'processing'}
            >
              {purchaseStatus === 'processing' ? (
                <>
                  <span className="spinner"></span>
                  Redirecting to checkout...
                </>
              ) : purchaseStatus === 'error' ? (
                '❌ Purchase Failed - Try Again'
              ) : (
                <>
                  <span className="purchase-icon">💳</span>
                  Buy Pro Version ($5)
                </>
              )}
            </button>
            <p className="download-size">
              Includes license key for instant activation
            </p>
          </div>
        </div>

        <div className="value-proposition">
          <div className="comparison-table">
            <h3 className="comparison-title">Feature Comparison</h3>
            <div className="comparison-grid">
              <div className="comparison-header">
                <div>Feature</div>
                <div>Free</div>
                <div>Pro</div>
              </div>
              <div className="comparison-row">
                <div>Clipboard History</div>
                <div>50 items</div>
                <div>Unlimited</div>
              </div>
              <div className="comparison-row">
                <div>Click to Copy</div>
                <div>✅</div>
                <div>✅</div>
              </div>
              <div className="comparison-row">
                <div>Pin Important Items</div>
                <div>✅</div>
                <div>✅</div>
              </div>
              <div className="comparison-row">
                <div>Global Shortcuts</div>
                <div>✅</div>
                <div>✅</div>
              </div>
              <div className="comparison-row highlight">
                <div>Save/Load Groups</div>
                <div>❌</div>
                <div>✅</div>
              </div>
              <div className="comparison-row highlight">
                <div>Import/Export</div>
                <div>❌</div>
                <div>✅</div>
              </div>
              <div className="comparison-row">
                <div>Lifetime Updates</div>
                <div>❌</div>
                <div>✅</div>
              </div>
            </div>
          </div>
        </div>

        <div className="system-requirements">
          <h3 className="requirements-title">System Requirements</h3>
          <div className="requirements-grid">
            <div className="requirement">
              <strong>Operating System:</strong> Windows 10 or later (64-bit)
            </div>
            <div className="requirement">
              <strong>Memory:</strong> 100 MB RAM
            </div>
            <div className="requirement">
              <strong>Storage:</strong> 150 MB available space
            </div>
          </div>
        </div>

        <div className="coming-soon">
          <h3 className="coming-soon-title">Coming Soon</h3>
          <div className="platforms">
            <div className="platform">
              <span className="platform-icon">🍎</span>
              <span>macOS</span>
            </div>
            <div className="platform">
              <span className="platform-icon">🐧</span>
              <span>Linux</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
