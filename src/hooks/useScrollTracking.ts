import { useEffect } from 'react';
import { trackScrollDepth } from '../utils/analytics';

export const useScrollTracking = () => {
  useEffect(() => {
    const trackedDepths: Set<number> = new Set();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

      // Track at 25%, 50%, 75%, and 100% scroll depths
      const depths = [25, 50, 75, 100];
      
      for (const depth of depths) {
        if (scrollPercent >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          trackScrollDepth(depth);
        }
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 250);
    window.addEventListener('scroll', throttledHandleScroll);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, []);
};

// Simple throttle function
function throttle<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
  let timeoutId: number | null = null;
  let lastExecTime = 0;

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}
