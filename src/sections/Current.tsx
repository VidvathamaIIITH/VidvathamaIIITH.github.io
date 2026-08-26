import { Section } from '@/components/ui';
import type { Current as CurrentContent } from '@/types/content';

export function Current({ current }: { current: CurrentContent }) {
  return (
    <Section
      id="current"
      eyebrow="03 — Active work"
      title={current.heading}
      intro={current.intro}
      tinted
    >
      {/* A timeline rail on the left, with each active thread hung off it. */}
      <ol className="relative">
        <span
          aria-hidden="true"
          className="absolute left-[5px] top-2 hidden h-[calc(100%-1rem)] w-px bg-[var(--color-rule)] md:block"
        />

        {current.items.map((item) => (
          <li key={item.id} className="relative md:pl-10" data-reveal>
            <span
              aria-hidden="true"
              className="absolute left-0 top-[1.85rem] hidden h-[11px] w-[11px] rounded-full border-2 border-[var(--color-paper)] bg-[var(--color-accent)] md:block"
            />

            <article className="border-b border-[var(--color-rule)] py-8 md:py-9">
              <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <h3 className="text-[length:var(--text-h3)] leading-[1.3] text-[var(--color-ink)]">
                    {item.topic}
                  </h3>
                  <p className="mt-4 text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]">
                    {item.whyItMatters}
                  </p>
                  <p className="eyebrow mt-5">Updated {item.lastUpdated}</p>
                </div>

                <div className="lg:col-span-7">
                  <dl className="space-y-5">
                    <div>
                      <dt className="eyebrow mb-2">Investigating</dt>
                      <dd className="text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]">
                        {item.investigating}
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-2">Progress</dt>
                      <dd className="text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]">
                        {item.progress}
                      </dd>
                    </div>
                    {item.literature.length > 0 ? (
                      <div>
                        <dt className="eyebrow mb-2">Relevant literature</dt>
                        <dd>
                          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {item.literature.map((reference) => (
                              <li
                                key={reference}
                                className="font-mono text-[0.75rem] text-[var(--color-ink-3)]"
                              >
                                {reference}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {item.relatedResearch ? (
                    <a
                      href="#research"
                      className="mt-5 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent)] hover:opacity-70"
                    >
                      Related research thread
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </Section>
  );
}
