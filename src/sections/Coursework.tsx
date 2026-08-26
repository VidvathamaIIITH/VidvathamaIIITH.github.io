import { Section, TagRow, ExternalIcon } from '@/components/ui';
import { asset } from '@/lib/content';
import type { Coursework as CourseworkContent, CourseworkItem } from '@/types/content';

export function Coursework({ coursework }: { coursework: CourseworkContent }) {
  const ordered = [...coursework.items].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  return (
    <Section
      id="coursework"
      eyebrow="06 — Academic work"
      title={coursework.heading}
      intro={coursework.intro}
      tinted
    >
      {/* Course projects read as lab notebook entries: a course plate on the
          left, the problem-approach-result narrative on the right. */}
      <div className="border-t border-[var(--color-rule)]">
        {ordered.map((item) => (
          <CourseworkEntry key={item.id} item={item} />
        ))}
      </div>

      {coursework.courses.length > 0 ? (
        <div className="mt-14 border-t border-[var(--color-rule)] pt-10" data-reveal>
          <h3 className="eyebrow mb-5">Relevant coursework</h3>
          <ul className="flex flex-wrap gap-x-2 gap-y-2">
            {coursework.courses.map((course) => (
              <li
                key={course}
                className="border border-[var(--color-rule)] bg-[var(--color-surface)] px-3 py-1.5 text-[0.8125rem] text-[var(--color-ink-2)]"
              >
                {course}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}

function CourseworkEntry({ item }: { item: CourseworkItem }) {
  return (
    <article
      data-reveal
      className="grid grid-cols-1 gap-x-10 gap-y-6 border-b border-[var(--color-rule)] bg-[var(--color-surface)] p-6 md:p-8 lg:grid-cols-12"
    >
      {/* Course plate */}
      <div className="lg:col-span-3">
        <p className="font-mono text-[0.8125rem] tracking-[0.04em] text-[var(--color-accent)]">
          {item.courseCode || item.course}
        </p>
        {item.courseCode ? (
          <p className="mt-1 text-[0.8125rem] leading-snug text-[var(--color-ink-2)]">{item.course}</p>
        ) : null}
        <p className="eyebrow mt-3">{item.term}</p>
        {item.team ? <p className="eyebrow mt-1.5">{item.team}</p> : null}
      </div>

      <div className="lg:col-span-9">
        <h3 className="text-[length:var(--text-h3)] leading-[1.3] text-[var(--color-ink)]">
          {item.title}
        </h3>

        <dl className="mt-5 space-y-4">
          <Field label="Problem">{item.problem}</Field>
          <Field label="Approach">{item.approach}</Field>
          <Field label="Results">{item.results}</Field>
          <Field label="What I took from it" serif>
            {item.learned}
          </Field>
        </dl>

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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <TagRow items={item.technologies} />

          {item.links && item.links.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {item.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {link.label}
                    <ExternalIcon className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  children,
  serif,
}: {
  label: string;
  children: React.ReactNode;
  serif?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[9rem_1fr] sm:gap-5">
      <dt className="eyebrow pt-1">{label}</dt>
      <dd
        className={
          serif
            ? 'font-serif text-[0.9375rem] font-light italic leading-[1.65] text-[var(--color-ink-2)]'
            : 'text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]'
        }
      >
        {children}
      </dd>
    </div>
  );
}
