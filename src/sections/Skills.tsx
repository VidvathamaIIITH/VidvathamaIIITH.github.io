import { Section } from '@/components/ui';
import type { Skills as SkillsContent } from '@/types/content';

export function Skills({ skills }: { skills: SkillsContent }) {
  return (
    <Section id="skills" eyebrow="08 — Expertise" title={skills.heading} intro={skills.intro} tinted>
      <div className="grid grid-cols-1 border-l border-t border-[var(--color-rule)] md:grid-cols-2 xl:grid-cols-3">
        {skills.groups.map((group) => (
          <section
            key={group.id}
            className="border-b border-r border-[var(--color-rule)] bg-[var(--color-surface)] p-6 md:p-7"
            data-reveal
          >
            <h3 className="text-[1.0625rem] leading-snug text-[var(--color-ink)]">{group.title}</h3>
            <p className="mt-2 text-[0.8125rem] leading-[1.6] text-[var(--color-ink-3)]">
              {group.description}
            </p>

            <ul className="mt-5 flex flex-wrap gap-x-1.5 gap-y-1.5">
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  className="border border-[var(--color-rule)] px-2.5 py-1.5 font-mono text-[0.75rem] leading-none text-[var(--color-ink-2)]"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
