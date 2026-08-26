import '@testing-library/jest-dom/vitest';

// jsdom implements neither of these, and several components read them on mount.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (!(window as { IntersectionObserver?: unknown }).IntersectionObserver) {
  class StubObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds: number[] = [];
  }
  window.IntersectionObserver = StubObserver as unknown as typeof IntersectionObserver;
}
