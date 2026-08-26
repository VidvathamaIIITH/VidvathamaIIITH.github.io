import { Section, StatusPill, TagRow, GitHubIcon, ExternalIcon } from '@/components/ui';
import { asset } from '@/lib/content';
import type { Projects as ProjectsContent, Project } from '@/types/content';

export function Projects({ projects }: { projects: ProjectsContent }) {
  const ordered = [...projects.items].sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  return (
    <Section id="projects" eyebrow="05 — Technical work" title={projects.heading} intro={projects.intro}>
      <div className="grid grid-cols-1 border-l border-t border-[var(--color-rule)] lg:grid-cols-2">
        {ordered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </Section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      data-reveal
      className="group flex h-full flex-col border-b border-r border-[var(--color-rule)] bg-[var(--color-surface)] p-6 transition-colors duration-200 hover:bg-[var(--color-surface-2)] md:p-8"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow">{project.category}</span>
        <StatusPill status={project.status} />
      </div>

      <h3 className="text-[length:var(--text-h3)] leading-[1.25] text-[var(--color-ink)]">
        {project.title}
      </h3>
      {project.subtitle ? (
        <p className="mt-1.5 font-serif text-[0.9375rem] italic text-[var(--color-ink-3)]">
          {project.subtitle}
        </p>
      ) : null}

      <p className="mt-4 text-[0.9rem] leading-[1.7] text-[var(--color-ink-2)]">
        {project.description}
      </p>

      {project.image ? (
        <figure className="mt-5">
          <img
            src={asset(project.image)}
            alt={project.imageCaption || project.title}
            loading="lazy"
            decoding="async"
            className="w-full rounded-[2px] border border-[var(--color-rule)]"
          />
          {project.imageCaption ? (
            <figcaption className="eyebrow mt-2">{project.imageCaption}</figcaption>
          ) : null}
        </figure>
      ) : null}

      {/* Result figures, presented as a small data plate rather than prose. */}
      {project.metrics.length > 0 ? (
        <dl className="mt-6 flex flex-wrap border-l border-t border-[var(--color-rule)]">
          {project.metrics.map((metric) => (
            <div
              key={metric.label}
              className="min-w-[7.5rem] flex-1 border-b border-r border-[var(--color-rule)] px-3 py-3"
            >
              <dt className="eyebrow leading-tight">{metric.label}</dt>
              <dd className="mt-1.5 font-mono text-[0.875rem] leading-tight text-[var(--color-ink)]">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {project.details.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {project.details.map((detail, index) => (
            <li
              key={index}
              className="flex gap-3 text-[0.875rem] leading-[1.7] text-[var(--color-ink-2)]"
            >
              <span
                aria-hidden="true"
                className="mt-[0.65em] inline-block h-px w-3 shrink-0 bg-[var(--color-rule-strong)]"
              />
              {detail}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 mb-8">
        <TagRow items={project.technologies} />
      </div>

      {/* Footer pinned to the card bottom so cards align across the grid. */}
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--color-rule)] pt-5">
        <span className="eyebrow">{project.date}</span>

        {project.github ? (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[0.8125rem] text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent)]"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            <span className="underline decoration-[var(--color-rule-strong)] decoration-1 underline-offset-4">
              Source
            </span>
          </a>
        ) : null}

        {project.demo ? (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent)]"
          >
            Demo
            <ExternalIcon className="h-3 w-3" />
          </a>
        ) : null}

        {project.report ? (
          <a
            href={asset(project.report)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent)]"
          >
            Report
            <ExternalIcon className="h-3 w-3" />
          </a>
        ) : null}

        {project.researchConnection ? (
          <a
            href="#publications"
            className="ml-auto font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--color-accent)] hover:opacity-70"
          >
            Linked manuscript
          </a>
        ) : null}
      </div>
    </article>
  );
}
