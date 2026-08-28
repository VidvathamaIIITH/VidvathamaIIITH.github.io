import { useCallback, useEffect, useRef, useState } from 'react';
import { loadSession, clearSession, type Session } from '@/lib/auth';
import { latestWorkflowRun, repoConfig } from '@/lib/github';
import { CONTENT_KEYS, CONTENT_LABELS } from '@/lib/content';
import { ExternalIcon } from '@/components/ui';
import { cx } from '@/lib/cx';
import { applyTheme, readTheme, type Theme } from '@/lib/theme';
import { Login } from './Login';
import { Editor } from './Editor';
import { MediaPicker, type MediaRequest } from './MediaPicker';
import type { ContentKey } from '@/types/content';

interface DeployState {
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [collection, setCollection] = useState<ContentKey>('profile');
  const [mediaRequest, setMediaRequest] = useState<MediaRequest | null>(null);
  const [deploy, setDeploy] = useState<DeployState | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('system');
  const mediaResolver = useRef<((path: string | null) => void) | null>(null);

  useEffect(() => {
    setSession(loadSession());
    setTheme(readTheme());
    setChecked(true);
    document.title = 'Content Manager — Vidvathama Ramesh';
  }, []);

  // Deployment state is informational, so a token without Actions scope simply
  // shows nothing rather than erroring.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const poll = () => {
      latestWorkflowRun(session.token, repoConfig).then((run) => {
        if (!cancelled) setDeploy(run);
      });
    };
    poll();
    const timer = window.setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session]);

  const requestMedia = useCallback(
    (kind: MediaRequest['kind']) =>
      new Promise<string | null>((resolve) => {
        mediaResolver.current = resolve;
        setMediaRequest({ kind, resolve });
      }),
    [],
  );

  const signOut = () => {
    clearSession();
    setSession(null);
  };

  const cycleTheme = () => {
    const next: Theme = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
    setTheme(next);
    applyTheme(next);
  };

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)]">
        <p className="eyebrow" role="status">
          Loading…
        </p>
      </div>
    );
  }

  if (!session) return <Login onSignedIn={setSession} />;

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <div className="mx-auto flex min-h-screen max-w-[110rem] flex-col lg:flex-row">
        {/* ------------------------------------------------------- sidebar */}
        <header className="border-b border-[var(--color-rule)] lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:px-6 lg:py-6">
            <div>
              <p className="eyebrow">Content Manager</p>
              <p className="mt-1.5 font-serif text-[1.0625rem] text-[var(--color-ink)]">
                Vidvathama Ramesh
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNavOpen((value) => !value)}
              aria-expanded={navOpen}
              aria-controls="admin-nav"
              className="rounded-[3px] border border-[var(--color-rule)] px-3 py-1.5 text-[0.8125rem] text-[var(--color-ink-2)] lg:hidden"
            >
              {navOpen ? 'Close' : 'Menu'}
            </button>
          </div>

          <div id="admin-nav" className={cx('lg:block', navOpen ? 'block' : 'hidden')}>
            <nav aria-label="Collections" className="px-3 pb-4 lg:px-4">
              <ul className="space-y-0.5">
                {CONTENT_KEYS.map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => {
                        setCollection(key);
                        setNavOpen(false);
                      }}
                      aria-current={collection === key ? 'true' : undefined}
                      className={cx(
                        'flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-[0.875rem] transition-colors',
                        collection === key
                          ? 'bg-[var(--color-accent-wash)] text-[var(--color-ink)]'
                          : 'text-[var(--color-ink-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          'h-1.5 w-1.5 shrink-0 rounded-full',
                          collection === key ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-rule-strong)]',
                        )}
                      />
                      {CONTENT_LABELS[key]}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-[var(--color-rule)] px-6 py-4">
              <DeployBadge deploy={deploy} />

              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    href={import.meta.env.BASE_URL}
                    className="inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    View site
                  </a>
                </li>
                <li>
                  <a
                    href={`https://github.com/${repoConfig.owner}/${repoConfig.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    Repository
                    <ExternalIcon className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={cycleTheme}
                    className="text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    Theme: {theme}
                  </button>
                </li>
              </ul>
            </div>

            <div className="border-t border-[var(--color-rule)] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={session.user.avatar_url}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full border border-[var(--color-rule)]"
                />
                <div className="min-w-0">
                  <p className="truncate text-[0.8125rem] text-[var(--color-ink)]">
                    {session.user.name || session.user.login}
                  </p>
                  <p className="truncate font-mono text-[0.6875rem] text-[var(--color-ink-3)]">
                    {session.user.login}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="mt-3 text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[#a33]"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* --------------------------------------------------------- editor */}
        <main className="min-w-0 flex-1">
          <DeployAlert deploy={deploy} />
          <Editor key={collection} collection={collection} token={session.token} requestMedia={requestMedia} />
        </main>
      </div>

      {mediaRequest ? (
        <MediaPicker
          request={mediaRequest}
          token={session.token}
          onDone={() => {
            mediaResolver.current = null;
            setMediaRequest(null);
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * The site only updates when the deploy workflow succeeds. When it does not,
 * saving keeps "working" while nothing reaches the live site — so a failure has
 * to be loud here, not a small dot in the sidebar.
 */
function DeployAlert({ deploy }: { deploy: DeployState | null }) {
  if (!deploy || deploy.status !== 'completed') return null;
  if (deploy.conclusion === 'success') return null;

  return (
    <div role="alert" className="border-b border-[#a33]/30 bg-[#a33]/8 px-6 py-3.5">
      <p className="text-[0.875rem] font-medium text-[#a33]">
        The last deployment {deploy.conclusion === 'cancelled' ? 'was cancelled' : 'failed'} — the live
        site is not showing your latest changes.
      </p>
      <p className="mt-1 text-[0.8125rem] leading-snug text-[var(--color-ink-2)]">
        Your edits are safely committed; only publishing is stuck. Open the run to see why, then
        re-run it. Publishing again also retries.{' '}
        <a href={deploy.html_url} target="_blank" rel="noopener noreferrer" className="link-underline">
          View the failed run
        </a>
      </p>
    </div>
  );
}

function DeployBadge({ deploy }: { deploy: DeployState | null }) {
  if (!deploy) {
    return <p className="eyebrow">Deployment status unavailable</p>;
  }

  const running = deploy.status !== 'completed';
  const ok = deploy.conclusion === 'success';
  const label = running ? 'Deploying' : ok ? 'Deployed' : (deploy.conclusion ?? 'unknown');

  return (
    <a href={deploy.html_url} target="_blank" rel="noopener noreferrer" className="block">
      <p className="eyebrow mb-1.5">Latest deployment</p>
      <span className="inline-flex items-center gap-2 text-[0.8125rem] text-[var(--color-ink-2)]">
        <span
          aria-hidden="true"
          className={cx(
            'h-2 w-2 rounded-full',
            running ? 'animate-pulse bg-[var(--color-accent)]' : ok ? 'bg-[#2e7d5b]' : 'bg-[#a33]',
          )}
        />
        <span className="capitalize">{label}</span>
      </span>
    </a>
  );
}
