import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref to attach to an element and whether it has scrolled into
 * view — used to trigger a one-time fade/rise-in transition (see the
 * `.reveal-on-scroll` / `.is-visible` classes in index.css) instead of
 * elements just appearing abruptly as the user scrolls down the page.
 */
export function useRevealOnScroll<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
