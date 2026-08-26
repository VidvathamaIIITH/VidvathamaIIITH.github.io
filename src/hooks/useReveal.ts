import { useEffect } from 'react';

/**
 * Reveals every [data-reveal] element once as it enters the viewport.
 *
 * One observer for the whole page rather than one per component, and it
 * unobserves on reveal so nothing keeps firing during ordinary scrolling.
 */
export function useReveal(): void {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}
