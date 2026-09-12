import { useEffect, useRef, useState } from 'react';
import { writeBinaryFile, repoConfig } from '@/lib/github';

/** Anything larger is refused: the Contents API caps single-file writes. */
const MAX_BYTES = 20 * 1024 * 1024;

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif'];
const FILE_TYPES = ['application/pdf'];

export interface MediaRequest {
  kind: 'image' | 'file';
  resolve: (path: string | null) => void;
}

/** Strip the `data:…;base64,` prefix the FileReader adds. */
function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

/** Repo-safe filename: no spaces, no path traversal, no surprises. */
function safeName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+/, '')
    .toLowerCase();
}

export function MediaPicker({
  request,
  token,
  onDone,
}: {
  request: MediaRequest;
  token: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const isImage = request.kind === 'image';
  const accept = (isImage ? IMAGE_TYPES : FILE_TYPES).join(',');
  const folder = isImage ? 'media' : 'docs';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel();
    };
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Object URLs must be revoked or the blob leaks for the tab's lifetime.
  useEffect(() => {
    if (!file || !isImage) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  const cancel = () => {
    request.resolve(null);
    onDone();
  };

  const upload = async () => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('That file is larger than 20 MB, which GitHub will reject. Compress it and try again.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const name = safeName(file.name);
      const path = `public/${folder}/${name}`;
      const base64 = await readAsBase64(file);
      await writeBinaryFile(token, repoConfig, path, base64, `content: upload ${folder}/${name}`);
      // The site references media relative to the deployment root, not `public/`.
      request.resolve(`${folder}/${name}`);
      onDone();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Upload failed.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-title"
        className="w-full max-w-lg rounded-[4px] border border-[var(--color-rule)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
      >
        <h2 id="media-title" className="text-[1.25rem] text-[var(--color-ink)]">
          Upload {isImage ? 'an image' : 'a document'}
        </h2>
        <p className="mt-2 text-[0.8125rem] leading-snug text-[var(--color-ink-3)]">
          Committed to <span className="font-mono">public/{folder}/</span> in the repository. Replacing a
          file with the same name overwrites it.
        </p>

        <input
          type="file"
          accept={accept}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError(null);
          }}
          className="mt-5 block w-full text-[0.8125rem] text-[var(--color-ink-2)] file:mr-3 file:rounded-[3px] file:border file:border-[var(--color-rule)] file:bg-[var(--color-surface-2)] file:px-3 file:py-1.5 file:text-[0.8125rem] file:text-[var(--color-ink)] hover:file:border-[var(--color-rule-strong)]"
        />

        {preview ? (
          <img
            src={preview}
            alt=""
            className="mt-4 max-h-48 rounded-[3px] border border-[var(--color-rule)] object-contain"
          />
        ) : null}

        {file ? (
          <p className="mt-3 font-mono text-[0.75rem] text-[var(--color-ink-3)]">
            {folder}/{safeName(file.name)} · {(file.size / 1024).toFixed(0)} KB
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mt-4 rounded-[3px] border border-[#a33]/40 bg-[#a33]/8 px-3 py-2 text-[0.8125rem] text-[#a33]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="rounded-[3px] px-4 py-2 text-[0.875rem] text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={upload}
            disabled={!file || busy}
            className="rounded-[3px] border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2 text-[0.875rem] font-medium text-[var(--color-paper)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
