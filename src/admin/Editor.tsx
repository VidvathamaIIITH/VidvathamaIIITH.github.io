import { useCallback, useEffect, useRef, useState } from 'react';
import { readFile, writeFile, repoConfig, GitHubError } from '@/lib/github';
import { content, CONTENT_LABELS } from '@/lib/content';
import { SCHEMAS } from './schema';
import { FieldControl } from './Fields';
import type { ContentKey } from '@/types/content';
import type { MediaRequest } from './MediaPicker';

type LoadState =
  | { phase: 'loading' }
  | { phase: 'ready' }
  | { phase: 'error'; message: string };

type SaveState =
  | { phase: 'idle' }
  | { phase: 'saving' }
  | { phase: 'saved'; commitUrl: string }
  | { phase: 'error'; message: string };

export function Editor({
  collection,
  token,
  requestMedia,
}: {
  collection: ContentKey;
  token: string;
  requestMedia: (kind: MediaRequest['kind']) => Promise<string | null>;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [baseline, setBaseline] = useState('');
  const [sha, setSha] = useState<string | undefined>();
  const [load, setLoad] = useState<LoadState>({ phase: 'loading' });
  const [save, setSave] = useState<SaveState>({ phase: 'idle' });

  const path = `content/${collection}.json`;
  const dirty = JSON.stringify(draft, null, 2) !== baseline;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  /* Load the live file from the repository, so the editor always works against
     what is actually deployed rather than the snapshot this bundle was built with. */
  useEffect(() => {
    let cancelled = false;
    setLoad({ phase: 'loading' });
    setSave({ phase: 'idle' });

    readFile(token, repoConfig, path)
      .then((file) => {
        if (cancelled) return;
        if (file) {
          const parsed = JSON.parse(file.content) as Record<string, unknown>;
          setDraft(parsed);
          setBaseline(JSON.stringify(parsed, null, 2));
          setSha(file.sha);
        } else {
          // Not in the repo yet — seed from the bundled content so the editor
          // still opens and the first save creates the file.
          const seed = content[collection] as unknown as Record<string, unknown>;
          setDraft(seed);
          setBaseline(JSON.stringify(seed, null, 2));
          setSha(undefined);
        }
        setLoad({ phase: 'ready' });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoad({
          phase: 'error',
          message: error instanceof Error ? error.message : 'Could not load this collection.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [collection, token, path]);

  /* Warn before a reload or tab close would discard unsaved edits. */
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const setKey = useCallback((key: string, value: unknown) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setSave({ phase: 'idle' });
  }, []);

  const publish = async () => {
    setSave({ phase: 'saving' });
    const serialised = `${JSON.stringify(draft, null, 2)}\n`;
    try {
      const result = await writeFile(
        token,
        repoConfig,
        path,
        serialised,
        `content: update ${collection}`,
        sha,
      );
      setSha(result.sha);
      setBaseline(JSON.stringify(draft, null, 2));
      setSave({ phase: 'saved', commitUrl: result.commitUrl });
    } catch (error) {
      const conflict = error instanceof GitHubError && error.status === 409;
      setSave({
        phase: 'error',
        message: conflict
          ? 'This file changed in GitHub since you opened it. Reload the collection and reapply your edits.'
          : error instanceof Error
            ? error.message
            : 'Save failed.',
      });
    }
  };

  if (load.phase === 'loading') {
    return (
      <p role="status" className="eyebrow p-8">
        Loading {CONTENT_LABELS[collection]}…
      </p>
    );
  }

  if (load.phase === 'error') {
    return (
      <div className="p-8">
        <p role="alert" className="rounded-[3px] border border-[#a33]/40 bg-[#a33]/8 px-4 py-3 text-[0.875rem] text-[#a33]">
          {load.message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Sticky action bar keeps Publish reachable in long forms. */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[var(--color-rule)] bg-[color-mix(in_srgb,var(--color-paper)_92%,transparent)] px-6 py-3.5 backdrop-blur-md">
        <div className="min-w-0">
          <h2 className="text-[1.0625rem] leading-tight text-[var(--color-ink)]">
            {CONTENT_LABELS[collection]}
          </h2>
          <p className="mt-0.5 font-mono text-[0.6875rem] text-[var(--color-ink-3)]">{path}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span
            aria-live="polite"
            className={`text-[0.75rem] ${dirty ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-3)]'}`}
          >
            {save.phase === 'saving'
              ? 'Publishing…'
              : dirty
                ? 'Unsaved changes'
                : save.phase === 'saved'
                  ? 'Published'
                  : 'No changes'}
          </span>

          <button
            type="button"
            onClick={publish}
            disabled={!dirty || save.phase === 'saving'}
            className="rounded-[3px] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2 text-[0.8125rem] font-medium text-[var(--color-paper)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Publish
          </button>
        </div>
      </div>

      {save.phase === 'saved' ? (
        <div className="border-b border-[var(--color-rule)] bg-[var(--color-accent-wash)] px-6 py-3">
          <p className="text-[0.8125rem] text-[var(--color-ink-2)]">
            Committed. The deploy workflow is rebuilding the site — changes are usually live in a
            minute or two.{' '}
            <a href={save.commitUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
              View commit
            </a>
          </p>
        </div>
      ) : null}

      {save.phase === 'error' ? (
        <div className="border-b border-[#a33]/30 bg-[#a33]/8 px-6 py-3">
          <p role="alert" className="text-[0.8125rem] text-[#a33]">
            {save.message}
          </p>
        </div>
      ) : null}

      <form className="max-w-3xl space-y-7 p-6 pb-24" onSubmit={(event) => event.preventDefault()}>
        {SCHEMAS[collection].map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            value={draft[field.key]}
            onPickMedia={requestMedia}
            onChange={(next) => setKey(field.key, next)}
          />
        ))}
      </form>
    </div>
  );
}
