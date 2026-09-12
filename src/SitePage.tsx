import { useEffect, useState } from 'react';
import { content, asset } from '@/lib/content';
import { applyTheme, isDarkNow } from '@/lib/theme';
import { cx } from '@/lib/cx';
import { Inline } from '@/components/Inline';
import type { Publication, ResearchItem, Project, ExperienceItem } from '@/types/content';
import './site.css';

const MONTHS: Record<string, string> = {
  January: 'Jan',
  February: 'Feb',
  March: 'Mar',
  April: 'Apr',
  June: 'Jun',
  July: 'Jul',
  August: 'Aug',
  September: 'Sep',
  October: 'Oct',
  November: 'Nov',
  December: 'Dec',
};

/** "August 2025" -> "Aug 2025", so the date column stays narrow. */
function short(value: string): string {
  return value.replace(/\b(January|February|March|April|June|July|August|September|October|November|December)\b/g, (m) => MONTHS[m]);
}

/** "3d-mapping" and "3d-mapping-paper" describe the same work; list it once. */
function sameWork(a: string, b: string): boolean {
  return a.startsWith(b) || b.startsWith(a);
}

function external(url: string) {
  return /^https?:/i.test(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

/** Links joined by " / ", the way academic pages list them. */
function LinkList({ links }: { links: { label: string; href: string }[] }) {
  return (
    <>
      {links.map((link, index) => (
        <span key={link.label}>
          {index > 0 ? <span className="s-sep" aria-hidden="true">/</span> : null}
          <a href={link.href} {...external(link.href)}>
            {link.label}
          </a>
        </span>
      ))}
    </>
  );
}

export default function SitePage() {
  const { profile, about, research, current, publications, projects, coursework, experience, skills, settings } =
    content;
  const on = (key: string) => settings.sections[key] !== false;

  const headerLinks = [
    { label: 'Email', href: `mailto:${profile.email}` },
    { label: 'CV', href: asset(profile.documents.cv.file) },
    { label: 'Résumé', href: asset(profile.documents.resume.file) },
    ...profile.socials
      .filter((s) => s.id !== 'email')
      .map((s) => ({ label: s.label, href: s.url })),
  ];

  const education = experience.items.filter((e) => e.kind === 'Education');
  const positions = experience.items.filter((e) => e.kind !== 'Education');
  const hasReview = publications.items.some((p) => p.status === 'Submitted');
  const orderedProjects = [...projects.items].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  const publicationIds = on('publications') ? publications.items.map((p) => p.id) : [];
  const researchThreads = research.items.filter((r) => !publicationIds.some((id) => sameWork(r.id, id)));
  const courseProjects = coursework.items.filter((c) => !publicationIds.some((id) => sameWork(c.id, id)));

  return (
    <div className="site">
      <a className="s-skip" href="#main">
        Skip to content
      </a>
      <ThemeToggle />

      <header id="home" className="s-header">
        <div className="s-intro">
          <h1 className="s-name">{profile.name}</h1>
          <div id="about" className="s-prose">
            {about.bio.map((paragraph, index) => (
              <p key={index}>
                <Inline text={paragraph} />
              </p>
            ))}
          </div>
          <p id="contact" className="s-links">
            <LinkList links={headerLinks} />
          </p>
        </div>
        <div className="s-photo">
          <img src={asset(profile.portrait)} alt={profile.portraitAlt} width={1133} height={1417} fetchPriority="high" />
        </div>
      </header>

      <main id="main">
        {on('current') && current.items.length > 0 ? (
          <section id="current" className="s-section">
            <h2>Current work</h2>
            <ul className="s-news">
              {current.items.map((item) => (
                <li key={item.id}>
                  <span className="s-muted">[{short(item.lastUpdated)}]</span> <strong>{item.topic}</strong>.{' '}
                  {item.progress}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {on('research') ? (
          <section id="research" className="s-section">
            <h2>Research</h2>
            <p className="s-lead s-prose">
              <Inline text={research.intro} />
              {hasReview ? (
                <>
                  {' '}
                  Work under review is <span className="s-hl-inline">highlighted</span>.
                </>
              ) : null}
            </p>

            {on('publications') ? (
              <div id="publications" className="s-list">
                {publications.items.map((item) => (
                  <PublicationRow key={item.id} item={item} self={profile.name} />
                ))}
              </div>
            ) : null}

            <div className="s-list">
              {researchThreads.map((item) => (
                <ResearchRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        {on('projects') ? (
          <section id="projects" className="s-section">
            <h2>Projects</h2>
            <div className="s-list">
              {orderedProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
          </section>
        ) : null}

        {on('experience') ? (
          <section id="experience" className="s-section">
            <h2>Experience</h2>
            <div className="s-list">
              {positions.map((item) => (
                <ExperienceRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <section id="coursework" className="s-section">
          <h2>Miscellanea</h2>
          <div className="s-list">
            {education.length > 0 ? (
              <MiscRow title="Education" color="var(--s-box-1)">
                {education.map((item) => (
                  <p key={item.id}>
                    <strong>{item.organization}</strong>
                    <br />
                    {item.role}, {short(item.start)} – {short(item.end)}
                  </p>
                ))}
              </MiscRow>
            ) : null}

            {experience.honors.length > 0 ? (
              <MiscRow title="Honors" color="var(--s-box-2)">
                {experience.honors.map((honor) => (
                  <p key={honor.id}>
                    {honor.title}, {honor.year}
                  </p>
                ))}
              </MiscRow>
            ) : null}

            {on('coursework') && courseProjects.length > 0 ? (
              <MiscRow title="Coursework" color="var(--s-box-3)">
                {[...courseProjects]
                  .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
                  .map((item) => (
                    <p key={item.id}>
                      {item.title}{' '}
                      <span className="s-muted">
                        — {item.courseCode ? `${item.course} (${item.courseCode})` : item.course}, {short(item.term)}
                      </span>
                    </p>
                  ))}
              </MiscRow>
            ) : null}

            {on('skills') && skills.groups.length > 0 ? (
              <MiscRow title="Skills" color="var(--s-box-4)">
                {skills.groups.map((group) => (
                  <p key={group.id}>
                    <strong>{group.title}:</strong> {group.skills.join(', ')}
                  </p>
                ))}
              </MiscRow>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="s-footer">
        <p>
          Design adapted from{' '}
          <a href="https://github.com/jonbarron/jonbarron_website" target="_blank" rel="noopener noreferrer">
            Jon Barron's template
          </a>
          .
        </p>
        <p className="s-signature">{settings.footer.signature}</p>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const STATUS_TEXT: Record<string, string> = {
  Submitted: 'under review',
  'In Preparation': 'in preparation',
  'In Progress': 'in progress',
};

function PublicationRow({ item, self }: { item: Publication; self: string }) {
  const [showBib, setShowBib] = useState(false);
  const doi = item.doi ? (item.doi.startsWith('http') ? item.doi : `https://doi.org/${item.doi}`) : '';
  const titleHref = item.paperUrl || item.arxivUrl || item.projectPage || item.codeUrl;

  const links = [
    { label: 'paper', href: item.paperUrl },
    { label: 'arXiv', href: item.arxivUrl },
    { label: 'DOI', href: doi },
    { label: 'project page', href: item.projectPage },
    { label: 'code', href: item.codeUrl },
    { label: 'pdf', href: item.pdf ? asset(item.pdf) : '' },
  ].filter((l) => l.href);

  const status = STATUS_TEXT[item.status];
  // The first sentence is enough here; the full abstract belongs on the paper.
  const summary = item.abstract.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? item.abstract;

  return (
    <article className={cx('s-row', item.status === 'Submitted' && 'is-hl')}>
      <div className="s-when">{item.year}</div>
      <div>
        <h3>
          {titleHref ? (
            <a href={titleHref} {...external(titleHref)}>
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h3>
        <p className="s-meta">
          <Authors names={item.authors} self={self} />
        </p>
        <p className="s-meta">
          <em>{item.venue}</em>
          {status ? <span className="s-muted"> · {status}</span> : null}
          {item.secondaryVenue ? <span className="s-muted">; {item.secondaryVenue}</span> : null}
        </p>
        {links.length > 0 || item.bibtex ? (
          <p className="s-actions">
            <LinkList links={links} />
            {item.bibtex ? (
              <>
                {links.length > 0 ? <span className="s-sep" aria-hidden="true">/</span> : null}
                <button type="button" className="s-linkbtn" aria-expanded={showBib} onClick={() => setShowBib((v) => !v)}>
                  bibtex
                </button>
              </>
            ) : null}
          </p>
        ) : null}
        <p className="s-desc">{summary}</p>
        {showBib ? <pre className="s-bibtex">{item.bibtex}</pre> : null}
      </div>
    </article>
  );
}

function Authors({ names, self }: { names: string[]; self: string }) {
  return (
    <>
      {names.map((name, index) => {
        const last = index === names.length - 1;
        const joiner = index === 0 ? '' : last && name.toLowerCase() === 'co-authors' ? ' and ' : ', ';
        return (
          <span key={`${name}-${index}`}>
            {joiner}
            {name === self ? <strong>{name}</strong> : name}
          </span>
        );
      })}
    </>
  );
}

function ResearchRow({ item }: { item: ResearchItem }) {
  const href = item.links[0]?.url;
  return (
    <article className="s-row">
      <div className="s-when">{short(item.period)}</div>
      <div>
        <h3>{item.title}</h3>
        <p className="s-meta">
          <em>{item.venue}</em>
          {item.supervisor ? <span className="s-muted"> · {item.supervisor.replace(/^Mentor:\s*/, 'with ')}</span> : null}
        </p>
        <p className="s-desc">{item.shortDescription}</p>
        {href ? (
          <p className="s-actions">
            <LinkList links={item.links.map((l) => ({ label: l.label, href: l.url }))} />
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const links = [
    { label: 'code', href: project.github },
    { label: 'demo', href: project.demo },
    { label: 'report', href: project.report ? asset(project.report) : '' },
  ].filter((l) => l.href);

  return (
    <article className="s-row">
      <div className="s-when">{short(project.date)}</div>
      <div>
        <h3>
          {project.github ? (
            <a href={project.github} {...external(project.github)}>
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>
        {project.subtitle ? (
          <p className="s-meta">
            <em>{project.subtitle}</em>
          </p>
        ) : null}
        <p className="s-desc">{project.description}</p>
        {project.technologies.length > 0 ? (
          <p className="s-meta s-muted">{project.technologies.join(', ')}</p>
        ) : null}
        {links.length > 0 ? (
          <p className="s-actions">
            <LinkList links={links} />
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ExperienceRow({ item }: { item: ExperienceItem }) {
  return (
    <article className="s-row">
      <div className="s-when">
        {short(item.start)} – {short(item.end)}
      </div>
      <div>
        <h3>{item.organization}</h3>
        <p className="s-meta">
          <em>{item.role}</em>
          {item.supervisor ? <span className="s-muted"> · {item.supervisor.replace(/^Mentor:\s*/, 'with ')}</span> : null}
        </p>
        <p className="s-desc">{item.description}</p>
      </div>
    </article>
  );
}

function MiscRow({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="s-row">
      <div className="s-boxcell">
        <div className="s-box" style={{ background: color }}>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="s-misc">{children}</div>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(isDarkNow()), []);

  const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
  return (
    <button
      type="button"
      className="s-theme"
      aria-label={label}
      title={label}
      onClick={() => {
        const next = !dark;
        setDark(next);
        applyTheme(next ? 'dark' : 'light');
      }}
    >
      {dark ? (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" />
        </svg>
      )}
    </button>
  );
}
