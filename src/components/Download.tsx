import { useState } from 'react';
import { trackDownload, trackButtonClick } from '../utils/analytics';
import '../styles/Download.css';

const Download: React.FC = () => {
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const handleDownload = async () => {
    setDownloadStatus('downloading');
    
    // Track download attempt
    trackButtonClick('Windows Installer Download', 'Download Section');
    
    try {
      // PHP script will handle the actual file serving
      const response = await fetch('/download.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'windows',
          version: '1.0.0'
        })
      });

      if (response.ok) {
        // Get the blob and create download link
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Cliperton Setup 1.0.0.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Track successful download
        trackDownload('Windows Installer', 'Cliperton Setup 1.0.0.zip');
        
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus(''), 3000);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  return (
    <section id="download" className="download">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Download Cliperton</h2>
          <p className="section-description">
            Get started with the modern clipboard manager today
          </p>
        </div>

        <div className="download-options">
          <div className="download-card featured">
            <div className="download-header">
              <h3 className="download-title">
                <span className="platform-icon">🪟</span>
                Windows Installer
              </h3>
              <div className="version-badge">v1.0.0</div>
            </div>
            <ul className="download-features">
              <li>✅ Full installation with shortcuts</li>
              <li>✅ Automatic updates</li>
              <li>✅ System integration</li>
              <li>✅ Uninstaller included</li>
            </ul>
            <button 
              className={`btn btn-download ${downloadStatus === 'downloading' ? 'downloading' : ''}`}
              onClick={handleDownload}
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
                  Download for Windows
                </>
              )}
            </button>
            <p className="download-size">~84 MB</p>
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
            <div className="requirement">
              <strong>Additional:</strong> .NET Framework 4.7.2 or later
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
