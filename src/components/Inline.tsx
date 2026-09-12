import type { ReactNode } from 'react';

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Reject javascript:, data: and any other scheme except http(s) and mailto. */
function isSafeUrl(url: string): boolean {
  if (/^(https?:\/\/|mailto:)/i.test(url)) return true;
  return !/^[a-z][a-z0-9+.-]*:/i.test(url);
}

/**
 * Renders plain content text, turning `[label](url)` into a link. This is the
 * only markup the content files support, so a bio can link to a lab or an
 * advisor without the admin portal needing a rich-text editor.
 */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  LINK.lastIndex = 0;

  for (let match = LINK.exec(text); match; match = LINK.exec(text)) {
    const [whole, label, url] = match;
    if (match.index > last) out.push(text.slice(last, match.index));

    if (isSafeUrl(url)) {
      const external = /^https?:/i.test(url);
      out.push(
        <a
          key={match.index}
          href={url}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>,
      );
    } else {
      out.push(label);
    }
    last = match.index + whole.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
