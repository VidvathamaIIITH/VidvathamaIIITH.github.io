import { useState, type FormEvent } from 'react';
import { signIn, AuthError, type Session } from '@/lib/auth';
import { repoConfig } from '@/lib/github';
import { ExternalIcon } from '@/components/ui';

const TOKEN_SETTINGS_URL = 'https://github.com/settings/personal-access-tokens/new';

export function Login({ onSignedIn }: { onSignedIn: (session: Session) => void }) {
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onSignedIn(await signIn(token, remember));
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : 'Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-5 py-16">
      <div className="w-full max-w-md">
        <header className="mb-8">
          <p className="eyebrow mb-3">Content management</p>
          <h1 className="text-[1.75rem] leading-tight text-[var(--color-ink)]">Sign in to edit</h1>
          <p className="mt-3 text-[0.875rem] leading-[1.65] text-[var(--color-ink-2)]">
            Changes are committed straight to{' '}
            <span className="font-mono text-[0.8125rem] text-[var(--color-ink)]">
              {repoConfig.owner}/{repoConfig.repo}
            </span>
            , which triggers a rebuild and redeploy.
          </p>
        </header>

        <form onSubmit={submit} className="card p-6">
          <label htmlFor="token" className="mb-1.5 block text-[0.8125rem] font-medium text-[var(--color-ink)]">
            GitHub personal access token
          </label>
          <input
            id="token"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="github_pat_…"
            aria-describedby="token-help"
            className="w-full rounded-[3px] border border-[var(--color-rule)] bg-[var(--color-surface)] px-3 py-2.5 font-mono text-[0.8125rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] focus:border-[var(--color-accent)] focus:outline-none"
          />

          <p id="token-help" className="mt-2.5 text-[0.75rem] leading-[1.6] text-[var(--color-ink-3)]">
            Use a <strong className="font-medium text-[var(--color-ink-2)]">fine-grained</strong> token
            scoped to this one repository with{' '}
            <span className="font-mono">Contents: Read and write</span>. Nothing else is needed.
          </p>

          <label className="mt-4 flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="text-[0.8125rem] leading-snug text-[var(--color-ink-2)]">
              Remember on this device
              <span className="mt-0.5 block text-[0.75rem] text-[var(--color-ink-3)]">
                Otherwise the token is cleared when this tab closes. Leave this off on shared machines.
              </span>
            </span>
          </label>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-[3px] border border-[#a33]/40 bg-[#a33]/8 px-3 py-2.5 text-[0.8125rem] leading-snug text-[#a33]"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !token.trim()}
            className="mt-5 w-full rounded-[3px] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2.5 text-[0.875rem] font-medium text-[var(--color-paper)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Sign in'}
          </button>

          <a
            href={TOKEN_SETTINGS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--color-accent)] hover:underline"
          >
            Create a fine-grained token
            <ExternalIcon className="h-3 w-3" />
          </a>
        </form>

        <section className="mt-6 rounded-[3px] border border-[var(--color-rule)] bg-[var(--color-surface-2)] p-4">
          <h2 className="eyebrow mb-2.5">Why a token, not a password</h2>
          <p className="text-[0.75rem] leading-[1.65] text-[var(--color-ink-3)]">
            This site is static — there is no server to hold a secret, and none is committed to the
            repository. Your token stays in this browser and is sent only to api.github.com. GitHub
            enforces the permissions, so a token without write access to this repository cannot change
            anything here.
          </p>
        </section>

        <a
          href={import.meta.env.BASE_URL}
          className="mt-6 inline-block text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
        >
          ← Back to the site
        </a>
      </div>
    </div>
  );
}
