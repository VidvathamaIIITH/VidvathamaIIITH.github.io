import type { ReactNode, AnchorHTMLAttributes } from 'react';
import type { ResearchStatus } from '@/types/content';
import { cx } from '@/lib/cx';

/* -------------------------------------------------------------------------- */

interface SectionProps {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  /** A tonal band, used to separate adjacent sections without heavy borders. */
  tinted?: boolean;
  actions?: ReactNode;
}

export function Section({ id, eyebrow, title, intro, children, tinted, actions }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cx(
        'scroll-mt-24 border-t border-[var(--color-rule)] py-20 md:py-28',
        tinted && 'bg-[var(--color-surface-2)]',
      )}
    >
      <div className="page-shell">
        <header className="mb-12 md:mb-16" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="max-w-3xl">
              {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
              <h2
                id={`${id}-heading`}
                className="text-[length:var(--text-h2)] leading-[1.12] text-[var(--color-ink)]"
              >
                {title}
              </h2>
              {intro ? (
                <p className="prose-measure mt-5 text-[0.975rem] leading-[1.7] text-[var(--color-ink-2)]">
                  {intro}
                </p>
              ) : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </header>
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const STATUS_TONE: Record<string, string> = {
  'In Progress': 'text-[var(--color-accent)]',
  Research: 'text-[var(--color-accent)]',
  Submitted: 'text-[var(--color-accent)]',
  'In Preparation': 'text-[var(--color-ink-3)]',
  Prototype: 'text-[var(--color-ink-3)]',
  Completed: 'text-[var(--color-ink-3)]',
  Published: 'text-[var(--color-accent)]',
};

const STATUS_LIVE = new Set(['In Progress', 'Research', 'Submitted', 'Published']);

/** Deliberately quiet: a 5px dot and small caps, never a coloured pill. */
export function StatusPill({ status }: { status: ResearchStatus | string }) {
  const tone = STATUS_TONE[status] ?? 'text-[var(--color-ink-3)]';
  const live = STATUS_LIVE.has(status);

  return (
    <span className={cx('inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.1em] uppercase', tone)}>
      <span
        aria-hidden="true"
        className={cx(
          'inline-block h-[5px] w-[5px] rounded-full',
          live ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-ink-3)]',
        )}
      />
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block border border-[var(--color-rule)] px-2 py-1 font-mono text-[0.6875rem] leading-none tracking-[0.04em] text-[var(--color-ink-3)]">
      {children}
    </span>
  );
}

export function TagRow({ items, limit }: { items: string[]; limit?: number }) {
  if (items.length === 0) return null;
  const shown = limit ? items.slice(0, limit) : items;
  const rest = limit ? items.length - shown.length : 0;

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {shown.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
      {rest > 0 ? (
        <li>
          <Tag>+{rest}</Tag>
        </li>
      ) : null}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */

type ButtonTone = 'primary' | 'secondary' | 'ghost';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 border px-5 py-2.5 text-[0.8125rem] font-medium tracking-[0.01em] transition-colors duration-200 rounded-[3px]';

const BUTTON_TONES: Record<ButtonTone, string> = {
  primary:
    'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)] hover:bg-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)]',
  secondary:
    'border-[var(--color-rule-strong)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-ink-3)] hover:bg-[var(--color-surface)]',
  ghost:
    'border-transparent bg-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]',
};

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: ButtonTone;
  children: ReactNode;
}

export function LinkButton({ tone = 'secondary', className, children, ...rest }: LinkButtonProps) {
  const external = typeof rest.href === 'string' && /^https?:/.test(rest.href);
  return (
    <a
      {...rest}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cx(BUTTON_BASE, BUTTON_TONES[tone], className)}
    >
      {children}
    </a>
  );
}

/* -------------------------------------------------------------------------- */

/** A labelled key/value row, as used in research and project metadata. */
export function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-[var(--color-rule)] py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
      <dt className="eyebrow pt-0.5">{label}</dt>
      <dd className="text-[0.9rem] leading-[1.65] text-[var(--color-ink-2)]">{children}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cx('h-3.5 w-3.5', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 3.5H3.5v9h9v-3" />
      <path d="M9.5 3.5h3v3" />
      <path d="m12.5 3.5-5 5" />
    </svg>
  );
}

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cx('h-4 w-4', className)} fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cx('h-3.5 w-3.5', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10" />
      <path d="m9 4 4 4-4 4" />
    </svg>
  );
}
