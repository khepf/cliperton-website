import { useEffect, useRef, useState } from 'react';
import { trackDownloadAttempt, trackDownloadSuccess, trackDownloadConversion, trackButtonClick } from '../utils/analytics';

interface MicrosoftStoreBadgeProps {
  productId: string;
  productName: string;
  windowMode?: 'direct' | 'popup';
  theme?: 'auto' | 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  language?: string;
  animation?: 'on' | 'off';
}

const MicrosoftStoreBadge: React.FC<MicrosoftStoreBadgeProps> = ({
  productId,
  productName,
  windowMode = 'direct',
  theme = 'auto',
  size = 'large',
  language = 'en-us',
  animation = 'on'
}) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if the Microsoft Store badge script is available
    const checkBadgeScript = () => {
      if (typeof customElements !== 'undefined' && customElements.get('ms-store-badge')) {
        // Badge is available, create it
        if (badgeRef.current) {
          const badge = document.createElement('ms-store-badge');
          badge.setAttribute('productid', productId);
          badge.setAttribute('productname', productName);
          badge.setAttribute('window-mode', windowMode);
          badge.setAttribute('theme', theme);
          badge.setAttribute('size', size);
          badge.setAttribute('language', language);
          badge.setAttribute('animation', animation);
          
          // Add click tracking to the badge
          badge.addEventListener('click', () => {
            trackDownloadAttempt('free', 'microsoft_store');
            trackButtonClick('microsoft_store_badge_native', 'download_section', 'Get from Microsoft Store');
            trackDownloadSuccess('free', 'microsoft_store_native_click', 'windows');
            trackDownloadConversion('free');
          });
          
          badgeRef.current.innerHTML = '';
          badgeRef.current.appendChild(badge);
        }
      } else {
        // Badge script not loaded, show fallback
        setShowFallback(true);
      }
    };

    // Try immediately
    checkBadgeScript();

    // If not available, wait a bit and try again
    const timeout = setTimeout(() => {
      checkBadgeScript();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [productId, productName, windowMode, theme, size, language, animation]);

  const handleFallbackClick = () => {
    // Track the Microsoft Store redirect
    trackDownloadAttempt('free', 'microsoft_store');
    trackButtonClick('microsoft_store_badge_fallback', 'download_section', 'Get from Microsoft Store');
    trackDownloadSuccess('free', 'microsoft_store_fallback_click', 'windows');
    trackDownloadConversion('free');
    
    const storeUrl = `https://apps.microsoft.com/detail/${productId}?hl=en-us&gl=US&ocid=pdpshare`;
    window.open(storeUrl, '_blank');
  };

  if (showFallback) {
    return (
      <div className="microsoft-store-badge-fallback">
        <a 
          href={`https://apps.microsoft.com/detail/${productId}?hl=en-us&gl=US&ocid=pdpshare`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleFallbackClick}
          className="store-link"
        >
          <img 
            src="https://get.microsoft.com/images/en-us%20dark.svg" 
            alt={`Get ${productName} from Microsoft Store`}
            width="240"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </a>
      </div>
    );
  }

  return <div ref={badgeRef} className="microsoft-store-badge-wrapper" />;
};

export default MicrosoftStoreBadge;
