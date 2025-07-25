// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Track page views
export const trackPageView = (page_title: string, page_location: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-DSTCBX210L', {
      page_title,
      page_location,
    });
  }
};

// Track custom events with standardized naming
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: Date.now()
    });
  }
};

// Track download events - improved naming
export const trackDownloadAttempt = (downloadType: 'free' | 'pro', platform: string = 'windows') => {
  trackEvent('download_attempt', {
    download_type: downloadType,
    platform: platform,
    event_category: 'download'
  });
};

export const trackDownloadSuccess = (downloadType: 'free' | 'pro', fileName: string, platform: string = 'windows') => {
  trackEvent('download_success', {
    download_type: downloadType,
    file_name: fileName,
    platform: platform,
    event_category: 'download'
  });
};

export const trackDownloadFailure = (downloadType: 'free' | 'pro', error: string, platform: string = 'windows') => {
  trackEvent('download_failure', {
    download_type: downloadType,
    error_message: error,
    platform: platform,
    event_category: 'download'
  });
};

// Track purchase events
export const trackPurchaseAttempt = (productName: string, price: number, currency: string = 'usd') => {
  trackEvent('purchase_attempt', {
    product_name: productName,
    price: price,
    currency: currency,
    event_category: 'ecommerce'
  });
};

export const trackPurchaseSuccess = (productName: string, price: number, currency: string = 'usd') => {
  trackEvent('purchase_success', {
    product_name: productName,
    price: price,
    currency: currency,
    event_category: 'ecommerce'
  });
};

export const trackPurchaseFailure = (productName: string, error: string, price: number, currency: string = 'usd') => {
  trackEvent('purchase_failure', {
    product_name: productName,
    error_message: error,
    price: price,
    currency: currency,
    event_category: 'ecommerce'
  });
};

export const trackPurchaseCancellation = (productName: string, price: number, currency: string = 'usd') => {
  trackEvent('purchase_cancelled', {
    product_name: productName,
    price: price,
    currency: currency,
    event_category: 'ecommerce'
  });
};

// Track UI interactions - renamed and improved
export const trackButtonClick = (buttonId: string, section: string, buttonText?: string) => {
  trackEvent('button_click', {
    button_id: buttonId,
    section: section,
    button_text: buttonText,
    event_category: 'engagement'
  });
};

export const trackLinkClick = (linkType: 'internal' | 'external' | 'email', linkText: string, destination: string, section: string) => {
  trackEvent('link_click', {
    link_type: linkType,
    link_text: linkText,
    destination: destination,
    section: section,
    event_category: 'engagement'
  });
};

// Track navigation events - improved naming
export const trackNavigation = (section: string, navigationMethod: 'header_menu' | 'scroll' | 'button' = 'header_menu') => {
  trackEvent('navigate_to_section', {
    section: section,
    navigation_method: navigationMethod,
    event_category: 'navigation'
  });
};

// Track scroll depth - keep existing functionality
export const trackScrollDepth = (scrollDepth: number) => {
  trackEvent('scroll_depth', {
    scroll_percentage: scrollDepth,
    event_category: 'engagement'
  });
};

// Track form interactions
export const trackFormSubmission = (formName: string, success: boolean, errorMessage?: string) => {
  trackEvent('form_submission', {
    form_name: formName,
    success: success,
    error_message: errorMessage,
    event_category: 'engagement'
  });
};

// Track feature engagement
export const trackFeatureView = (featureName: string, section: string) => {
  trackEvent('feature_view', {
    feature_name: featureName,
    section: section,
    event_category: 'engagement'
  });
};
