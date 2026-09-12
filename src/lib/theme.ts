export type Theme = 'light' | 'dark' | 'system';

const KEY = 'theme';

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* Private mode blocks storage; system preference is the fallback. */
  }
  return 'system';
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }

  try {
    if (theme === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    /* The theme still applies for this page view. */
  }
}

/** Whether the page is currently rendering dark, whichever way it got there. */
export function isDarkNow(): boolean {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'dark') return true;
  if (explicit === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
