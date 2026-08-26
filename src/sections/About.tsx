import { Section } from '@/components/ui';
import type { About as AboutContent } from '@/types/content';

export function About({ about }: { about: AboutContent }) {
  return (
    <Section id="about" eyebrow="01 — Who I am" title={about.heading}>
      <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
        {/* Narrative */}
        <div className="lg:col-span-7" data-reveal>
          <p className="font-serif text-[1.375rem] font-light leading-[1.45] text-[var(--color-ink)] md:text-[1.5rem]">
            {about.lead}
          </p>

          <div className="prose-measure mt-8 space-y-5">
            {about.bio.map((paragraph, index) => (
              <p key={index} className="text-[0.975rem] leading-[1.75] text-[var(--color-ink-2)]">
                {paragraph}
              </p>
            ))}
          </div>

          <blockquote className="mt-10 border-l-2 border-[var(--color-accent)] py-1 pl-6">
            <p className="eyebrow mb-3">What motivates the work</p>
            <p className="prose-measure font-serif text-[1.0625rem] font-light italic leading-[1.6] text-[var(--color-ink-2)]">
              {about.motivation}
            </p>
          </blockquote>
        </div>

        {/* At-a-glance facts, then what is being explored next. */}
        <aside className="lg:col-span-5" data-reveal>
          <div className="card p-6 md:p-7">
            <p className="eyebrow mb-5">At a glance</p>
            <dl className="space-y-0">
              {about.facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={`flex items-baseline justify-between gap-4 py-3 ${
                    index > 0 ? 'border-t border-[var(--color-rule)]' : 'pt-0'
                  }`}
                >
                  <dt className="eyebrow shrink-0">{fact.label}</dt>
                  <dd className="text-right text-[0.875rem] leading-snug text-[var(--color-ink)]">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6">
            <p className="eyebrow mb-4">Currently exploring</p>
            <ul className="space-y-3">
              {about.exploring.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[0.875rem] leading-[1.6] text-[var(--color-ink-2)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.6em] inline-block h-px w-3 shrink-0 bg-[var(--color-accent)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Research interests grid */}
      <div className="mt-16 border-t border-[var(--color-rule)] pt-12 md:mt-20" data-reveal>
        <h3 className="eyebrow mb-8">Research Interests</h3>
        <ul className="grid grid-cols-1 border-l border-t border-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {about.interests.map((interest) => (
            <li
              key={interest.title}
              className="border-b border-r border-[var(--color-rule)] bg-[var(--color-surface)] p-5 md:p-6"
            >
              <h4 className="text-[0.9375rem] leading-snug text-[var(--color-ink)]">
                {interest.title}
              </h4>
              <p className="mt-2 text-[0.8125rem] leading-[1.6] text-[var(--color-ink-3)]">
                {interest.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
