import { useEffect, useRef, useState } from 'react';
import { useActiveSection } from '@/hooks/useActiveSection';
import { applyTheme, readTheme, type Theme } from '@/lib/theme';
import { cx } from '@/lib/cx';
import type { NavItem } from '@/types/content';

interface NavProps {
  items: NavItem[];
  shortName: string;
}

export function Nav({ items, shortName }: NavProps) {
  const enabled = items.filter((item) => item.enabled);
  const ids = enabled.map((item) => item.id);
  const active = useActiveSection(ids);

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setTheme(readTheme()), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // While the mobile panel is open: lock the page, close on Escape, and send
  // focus into the panel so keyboard users are not left behind on the page.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
    applyTheme(next);
  };

  const themeLabel =
    theme === 'system' ? 'Theme: follows system' : theme === 'dark' ? 'Theme: dark' : 'Theme: light';

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
          scrolled
            ? 'border-b border-[var(--color-rule)] bg-[color-mix(in_srgb,var(--color-paper)_88%,transparent)] backdrop-blur-md'
            : 'border-b border-transparent',
        )}
      >
        <div className="page-shell">
          <div className="flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
            <a
              href="#home"
              className="font-serif text-[1.0625rem] tracking-[-0.01em] text-[var(--color-ink)] transition-opacity hover:opacity-70"
            >
              {shortName}
              <span className="text-[var(--color-accent)]">.</span>
            </a>

            <nav aria-label="Sections" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {enabled.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        aria-current={isActive ? 'true' : undefined}
                        className={cx(
                          'relative block px-3 py-2 text-[0.8125rem] transition-colors duration-200',
                          isActive
                            ? 'text-[var(--color-ink)]'
                            : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)]',
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={cx(
                            'absolute inset-x-3 -bottom-px h-px origin-left bg-[var(--color-accent)] transition-transform duration-300 ease-[var(--ease-out-soft)]',
                            isActive ? 'scale-x-100' : 'scale-x-0',
                          )}
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cycleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                className="flex h-9 w-9 items-center justify-center rounded-[3px] text-[var(--color-ink-3)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
              >
                <ThemeIcon theme={theme} />
              </button>

              <button
                ref={toggleRef}
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="flex h-9 w-9 items-center justify-center rounded-[3px] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-surface-2)] lg:hidden"
              >
                <span className="relative block h-3.5 w-4">
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute left-0 block h-px w-full bg-current transition-transform duration-300 ease-[var(--ease-out-soft)]',
                      open ? 'top-1/2 rotate-45' : 'top-0',
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute left-0 top-1/2 block h-px w-full bg-current transition-opacity duration-200',
                      open ? 'opacity-0' : 'opacity-100',
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute left-0 block h-px w-full bg-current transition-transform duration-300 ease-[var(--ease-out-soft)]',
                      open ? 'top-1/2 -rotate-45' : 'bottom-0',
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile panel: full-height sheet, generous targets, section numbering. */}
      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-0 z-40 lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="absolute inset-0 h-full w-full cursor-default bg-[color-mix(in_srgb,var(--color-paper)_96%,transparent)] backdrop-blur-sm"
        />
        <nav className="relative flex h-full flex-col overflow-y-auto pt-20 pb-10">
          <ul className="page-shell flex-1">
            {enabled.map((item, index) => (
              <li key={item.id} className="border-b border-[var(--color-rule)]">
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className={cx(
                    'flex items-baseline gap-4 py-4 transition-colors',
                    active === item.id ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-2)]',
                  )}
                >
                  <span className="eyebrow w-6 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-2xl leading-none">{item.label}</span>
                  {active === item.id ? (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-1.5 w-1.5 self-center rounded-full bg-[var(--color-accent)]"
                    />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = {
    viewBox: '0 0 16 16',
    'aria-hidden': true as const,
    className: 'h-4 w-4',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (theme === 'dark') {
    return (
      <svg {...common}>
        <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" />
      </svg>
    );
  }

  if (theme === 'light') {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="1.5" y="3" width="13" height="8.5" rx="1" />
      <path d="M5.5 14h5" />
    </svg>
  );
}
