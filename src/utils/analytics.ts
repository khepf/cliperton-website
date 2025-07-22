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

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track download events
export const trackDownload = (downloadType: string, fileName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'download', {
      event_category: 'file_download',
      event_label: downloadType,
      file_name: fileName,
    });
  }
};

// Track scroll depth
export const trackScrollDepth = (scrollDepth: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'scroll', {
      event_category: 'engagement',
      event_label: `${scrollDepth}%`,
      value: scrollDepth,
    });
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', {
      event_category: 'button',
      event_label: buttonName,
      button_location: location,
    });
  }
};

// Track navigation clicks
export const trackNavigation = (section: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'navigate', {
      event_category: 'navigation',
      event_label: section,
    });
  }
};
