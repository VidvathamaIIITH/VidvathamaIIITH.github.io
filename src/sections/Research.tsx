import { useId, useState } from 'react';
import { Section, StatusPill, TagRow, MetaRow, ExternalIcon } from '@/components/ui';
import { cx } from '@/lib/cx';
import { asset } from '@/lib/content';
import type { Research as ResearchContent, ResearchItem } from '@/types/content';

export function Research({ research }: { research: ResearchContent }) {
  return (
    <Section id="research" eyebrow="02 — Research" title={research.heading} intro={research.intro}>
      <ol className="border-t border-[var(--color-rule)]">
        {research.items.map((item, index) => (
          <ResearchRecord key={item.id} item={item} index={index} />
        ))}
      </ol>
    </Section>
  );
}

function ResearchRecord({ item, index }: { item: ResearchItem; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className="border-b border-[var(--color-rule)]" data-reveal>
      <article className="group py-8 md:py-10">
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-12">
          {/* Index + status rail */}
          <div className="flex items-center gap-4 lg:col-span-2 lg:flex-col lg:items-start lg:gap-3">
            <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-[var(--color-ink-3)]">
              R{String(index + 1).padStart(2, '0')}
            </span>
            <StatusPill status={item.status} />
          </div>

          {/* Body */}
          <div className="lg:col-span-10">
            <h3 className="text-[length:var(--text-h3)] leading-[1.25] text-[var(--color-ink)]">
              {item.title}
            </h3>

            <p className="mt-3 max-w-[68ch] text-[0.9375rem] leading-[1.7] text-[var(--color-ink-2)]">
              {item.shortDescription}
            </p>

            {/* The research question is the most informative line here, so it
                stays visible rather than hiding behind the disclosure. */}
            <div className="mt-5 border-l-2 border-[var(--color-rule-strong)] pl-5">
              <p className="eyebrow mb-2">Research question</p>
              <p className="max-w-[62ch] font-serif text-[1.0625rem] font-light italic leading-[1.55] text-[var(--color-ink)]">
                {item.question}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-[0.8125rem] text-[var(--color-ink-3)]">{item.venue}</span>
              <span aria-hidden="true" className="h-3 w-px bg-[var(--color-rule)]" />
              <span className="text-[0.8125rem] text-[var(--color-ink-3)]">{item.period}</span>
            </div>

            <div className="mt-5">
              <TagRow items={item.technologies} />
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={panelId}
              className="mt-6 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent)] transition-opacity hover:opacity-70"
            >
              {open ? 'Hide details' : 'Problem & approach'}
              <svg
                viewBox="0 0 12 12"
                aria-hidden="true"
                className={cx(
                  'h-2.5 w-2.5 transition-transform duration-300 ease-[var(--ease-out-soft)]',
                  open && 'rotate-180',
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
              </svg>
            </button>

            <div
              id={panelId}
              hidden={!open}
              className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-[var(--color-rule)] pt-6 lg:grid-cols-2"
            >
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">The problem</p>
                  <p className="text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]">
                    {item.problem}
                  </p>
                </div>
                <div>
                  <p className="eyebrow mb-2">Approach</p>
                  <p className="text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]">
                    {item.approach}
                  </p>
                </div>
              </div>

              <div>
                <dl className="border-b border-[var(--color-rule)]">
                  <MetaRow label="Status">{item.status}</MetaRow>
                  <MetaRow label="Affiliation">{item.venue}</MetaRow>
                  {item.supervisor ? <MetaRow label="Supervision">{item.supervisor}</MetaRow> : null}
                  <MetaRow label="Period">{item.period}</MetaRow>
                  {item.relatedPublication ? (
                    <MetaRow label="Manuscript">
                      <a href="#publications" className="link-underline">
                        See publications
                      </a>
                    </MetaRow>
                  ) : null}
                </dl>

                {item.links.length > 0 ? (
                  <ul className="mt-5 space-y-2">
                    {item.links.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[0.875rem] text-[var(--color-accent)] hover:underline"
                        >
                          {link.label}
                          <ExternalIcon className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {item.image ? (
                  <figure className="mt-5">
                    <img
                      src={asset(item.image)}
                      alt={item.imageCaption || item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-[2px] border border-[var(--color-rule)]"
                    />
                    {item.imageCaption ? (
                      <figcaption className="eyebrow mt-2">{item.imageCaption}</figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
