import { useMemo, useState } from 'react';
import { Section, StatusPill, ExternalIcon } from '@/components/ui';
import { cx } from '@/lib/cx';
import { asset } from '@/lib/content';
import type { Publications as PublicationsContent, Publication } from '@/types/content';

type Filter = { kind: 'all' } | { kind: 'year'; value: string } | { kind: 'topic'; value: string } | { kind: 'status'; value: string };

export function Publications({ publications }: { publications: PublicationsContent }) {
  const [filter, setFilter] = useState<Filter>({ kind: 'all' });

  const { years, topics, statuses } = useMemo(() => {
    const items = publications.items;
    return {
      years: [...new Set(items.map((item) => String(item.year)))].sort((a, b) => b.localeCompare(a)),
      topics: [...new Set(items.flatMap((item) => item.topics))].sort(),
      statuses: [...new Set(items.map((item) => item.status))].sort(),
    };
  }, [publications.items]);

  const visible = useMemo(() => {
    const items = [...publications.items].sort((a, b) => b.year - a.year);
    if (filter.kind === 'all') return items;
    if (filter.kind === 'year') return items.filter((item) => String(item.year) === filter.value);
    if (filter.kind === 'topic') return items.filter((item) => item.topics.includes(filter.value));
    return items.filter((item) => item.status === filter.value);
  }, [publications.items, filter]);

  const isActive = (candidate: Filter): boolean => {
    if (candidate.kind !== filter.kind) return false;
    if (candidate.kind === 'all' || filter.kind === 'all') return true;
    return candidate.value === filter.value;
  };

  return (
    <Section
      id="publications"
      eyebrow="04 — Papers"
      title={publications.heading}
      intro={publications.intro}
    >
      {/* Filters */}
      <div className="mb-8 space-y-4" data-reveal>
        <FilterRow label="Show">
          <FilterChip active={isActive({ kind: 'all' })} onClick={() => setFilter({ kind: 'all' })}>
            Everything ({publications.items.length})
          </FilterChip>
        </FilterRow>

        {/* A facet with a single value filters nothing — don't spend a row on it. */}
        {years.length > 1 ? (
          <FilterRow label="Year">
            {years.map((year) => (
              <FilterChip
                key={year}
                active={isActive({ kind: 'year', value: year })}
                onClick={() => setFilter({ kind: 'year', value: year })}
              >
                {year}
              </FilterChip>
            ))}
          </FilterRow>
        ) : null}

        {statuses.length > 1 ? (
          <FilterRow label="Status">
            {statuses.map((status) => (
              <FilterChip
                key={status}
                active={isActive({ kind: 'status', value: status })}
                onClick={() => setFilter({ kind: 'status', value: status })}
              >
                {status}
              </FilterChip>
            ))}
          </FilterRow>
        ) : null}

        {topics.length > 1 ? (
          <FilterRow label="Topic">
            {topics.map((topic) => (
              <FilterChip
                key={topic}
                active={isActive({ kind: 'topic', value: topic })}
                onClick={() => setFilter({ kind: 'topic', value: topic })}
              >
                {topic}
              </FilterChip>
            ))}
          </FilterRow>
        ) : null}
      </div>

      <p aria-live="polite" className="eyebrow mb-6">
        {visible.length} {visible.length === 1 ? 'entry' : 'entries'}
      </p>

      <ol className="border-t border-[var(--color-rule)]">
        {visible.map((item, index) => (
          <PublicationEntry key={item.id} item={item} index={index} />
        ))}
      </ol>

      {publications.note ? (
        <p className="eyebrow mt-8">{publications.note}</p>
      ) : null}
    </Section>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="eyebrow w-14 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'rounded-[2px] border px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.04em] transition-colors duration-200',
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-paper)]'
          : 'border-[var(--color-rule)] text-[var(--color-ink-3)] hover:border-[var(--color-rule-strong)] hover:text-[var(--color-ink)]',
      )}
    >
      {children}
    </button>
  );
}

function PublicationEntry({ item, index }: { item: Publication; index: number }) {
  const [copied, setCopied] = useState(false);
  const [abstractOpen, setAbstractOpen] = useState(false);

  const copyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(item.bibtex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be denied; show the raw entry so it can be copied by hand.
      setAbstractOpen(true);
    }
  };

  const links = [
    item.paperUrl && { label: 'Paper', url: item.paperUrl },
    item.arxivUrl && { label: 'arXiv', url: item.arxivUrl },
    item.doi && { label: 'DOI', url: item.doi.startsWith('http') ? item.doi : `https://doi.org/${item.doi}` },
    item.codeUrl && { label: 'Code', url: item.codeUrl },
    item.projectPage && { label: 'Project page', url: item.projectPage },
    item.pdf && { label: 'PDF', url: asset(item.pdf) },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <li className="border-b border-[var(--color-rule)]" data-reveal>
      <article className="py-8 md:py-9">
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-12">
          <div className="flex items-baseline gap-4 lg:col-span-2 lg:flex-col lg:gap-2">
            <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-[var(--color-ink-3)]">
              P{String(index + 1).padStart(2, '0')}
            </span>
            <span className="font-mono text-[0.8125rem] text-[var(--color-ink-2)]">{item.year}</span>
            <StatusPill status={item.status} />
          </div>

          <div className="lg:col-span-10">
            <h3 className="text-[1.0625rem] leading-[1.4] text-[var(--color-ink)] md:text-[1.15rem]">
              {item.title}
            </h3>

            <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--color-ink-2)]">
              {item.authors.join(', ')}
            </p>

            <p className="mt-1 font-serif text-[0.9375rem] italic leading-relaxed text-[var(--color-ink-3)]">
              {item.venue}
              {item.secondaryVenue ? ` · ${item.secondaryVenue}` : ''}
            </p>

            {item.topics.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                {item.topics.map((topic) => (
                  <li key={topic} className="eyebrow">
                    {topic}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <button
                type="button"
                onClick={() => setAbstractOpen((value) => !value)}
                aria-expanded={abstractOpen}
                className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent)] transition-opacity hover:opacity-70"
              >
                {abstractOpen ? 'Hide abstract' : 'Abstract'}
              </button>

              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                >
                  {link.label}
                  <ExternalIcon className="h-3 w-3" />
                </a>
              ))}

              {item.bibtex ? (
                <button
                  type="button"
                  onClick={copyBibtex}
                  className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                >
                  {copied ? 'BibTeX copied' : 'Copy BibTeX'}
                </button>
              ) : null}
            </div>

            {abstractOpen ? (
              <div className="mt-5 border-t border-[var(--color-rule)] pt-5">
                <p className="eyebrow mb-2">Abstract</p>
                <p className="prose-measure text-[0.9rem] leading-[1.75] text-[var(--color-ink-2)]">
                  {item.abstract}
                </p>

                {item.bibtex ? (
                  <>
                    <p className="eyebrow mb-2 mt-6">BibTeX</p>
                    <pre className="no-scrollbar overflow-x-auto rounded-[2px] border border-[var(--color-rule)] bg-[var(--color-surface-2)] p-4 font-mono text-[0.75rem] leading-[1.6] text-[var(--color-ink-2)]">
                      <code>{item.bibtex}</code>
                    </pre>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </li>
  );
}
