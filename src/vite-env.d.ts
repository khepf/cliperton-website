/// <reference types="vite/client" />

// Microsoft Store Badge custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ms-store-badge': {
        productid: string;
        productname: string;
        'window-mode': 'direct' | 'popup';
        theme: 'auto' | 'light' | 'dark';
        size: 'small' | 'medium' | 'large';
        language: string;
        animation: 'on' | 'off';
      };
    }
  }
}
