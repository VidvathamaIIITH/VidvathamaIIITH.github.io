import { Section, TagRow } from '@/components/ui';
import { cx } from '@/lib/cx';
import type { Experience as ExperienceContent, ExperienceItem } from '@/types/content';

export function Experience({ experience }: { experience: ExperienceContent }) {
  return (
    <Section
      id="experience"
      eyebrow="07 — Trajectory"
      title={experience.heading}
      intro={experience.intro}
    >
      <ol className="relative">
        {/* Timeline rail. Hidden below md, where the layout stacks instead. */}
        <span
          aria-hidden="true"
          className="absolute left-[5px] top-3 hidden h-[calc(100%-2rem)] w-px bg-[var(--color-rule)] md:block"
        />

        {experience.items.map((item) => (
          <TimelineEntry key={item.id} item={item} />
        ))}
      </ol>

      {experience.honors.length > 0 ? (
        <div className="mt-16 border-t border-[var(--color-rule)] pt-12" data-reveal>
          <h3 className="eyebrow mb-8">Honors & Recognition</h3>
          <ul className="grid grid-cols-1 border-l border-t border-[var(--color-rule)] md:grid-cols-3">
            {experience.honors.map((honor) => (
              <li
                key={honor.id}
                className="border-b border-r border-[var(--color-rule)] bg-[var(--color-surface)] p-6"
              >
                <p className="eyebrow mb-3">{honor.year}</p>
                <h4 className="text-[0.9375rem] leading-snug text-[var(--color-ink)]">
                  {honor.title}
                </h4>
                <p className="mt-2.5 text-[0.8125rem] leading-[1.65] text-[var(--color-ink-3)]">
                  {honor.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}

function TimelineEntry({ item }: { item: ExperienceItem }) {
  return (
    <li className="relative md:pl-10" data-reveal>
      <span
        aria-hidden="true"
        className={cx(
          'absolute left-0 top-[2rem] hidden h-[11px] w-[11px] rounded-full border-2 border-[var(--color-paper)] md:block',
          item.current ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-rule-strong)]',
        )}
      />

      <article className="border-b border-[var(--color-rule)] py-8 md:py-9">
        <div className="grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="font-mono text-[0.8125rem] leading-relaxed text-[var(--color-ink-2)]">
              {item.start} — {item.end}
            </p>
            <p className="eyebrow mt-2">{item.kind}</p>
            <p className="eyebrow mt-1.5">{item.location}</p>
          </div>

          <div className="lg:col-span-9">
            <h3 className="text-[length:var(--text-h3)] leading-[1.3] text-[var(--color-ink)]">
              {item.role}
            </h3>
            <p className="mt-1.5 text-[0.9375rem] text-[var(--color-ink-2)]">{item.organization}</p>
            {item.supervisor ? (
              <p className="mt-1 font-serif text-[0.875rem] italic text-[var(--color-ink-3)]">
                {item.supervisor}
              </p>
            ) : null}

            <p className="mt-4 max-w-[68ch] text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]">
              {item.description}
            </p>

            {item.achievements.length > 0 ? (
              <ul className="mt-4 space-y-2.5">
                {item.achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-[0.875rem] leading-[1.7] text-[var(--color-ink-2)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.65em] inline-block h-px w-3 shrink-0 bg-[var(--color-rule-strong)]"
                    />
                    {achievement}
                  </li>
                ))}
              </ul>
            ) : null}

            {item.technologies.length > 0 ? (
              <div className="mt-5">
                <TagRow items={item.technologies} />
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </li>
  );
}
