import { asset } from '@/lib/content';
import { LinkButton, ArrowIcon, GitHubIcon, ExternalIcon } from '@/components/ui';
import type { Profile } from '@/types/content';

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="home" aria-labelledby="hero-heading" className="relative overflow-hidden pt-28 md:pt-36">
      {/* A single faint rule bleeding off the right edge: a technical-drawing
          cue rather than decoration, and cheap enough to be free. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-40 hidden h-px w-[38%] bg-[var(--color-rule)] lg:block"
      />

      <div className="page-shell">
        <div className="grid grid-cols-1 items-start gap-y-14 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-20">
          {/* ------------------------------------------------ primary column */}
          <div className="lg:col-span-7 xl:col-span-7">
            <p className="eyebrow mb-6" data-reveal>
              {profile.role} · {profile.affiliation}
            </p>

            <h1
              id="hero-heading"
              data-reveal
              className="text-[length:var(--text-display)] font-light leading-[0.98] tracking-[-0.025em]"
            >
              {profile.name}
            </h1>

            <p
              data-reveal
              className="mt-7 max-w-[38ch] font-serif text-[1.35rem] font-light italic leading-[1.4] text-[var(--color-ink-2)] md:text-[1.5rem]"
            >
              {profile.tagline}
            </p>

            <p
              data-reveal
              className="mt-7 max-w-[58ch] text-[0.975rem] leading-[1.75] text-[var(--color-ink-2)]"
            >
              {profile.researchStatement}
            </p>

            <div className="mt-9 border-t border-[var(--color-rule)] pt-5" data-reveal>
              <p className="eyebrow mb-3">Research Interests</p>
              <p className="max-w-[52ch] text-[0.875rem] leading-[1.7] text-[var(--color-ink-2)]">
                {profile.interestsLine}
              </p>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3" data-reveal>
              <LinkButton href="#research" tone="primary">
                View Research
                <ArrowIcon />
              </LinkButton>
              <LinkButton href="#publications" tone="secondary">
                Publications
              </LinkButton>
              <LinkButton href="#projects" tone="secondary">
                Projects
              </LinkButton>
            </div>

            {/* Two clearly separate documents — CV and résumé are not the same thing. */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" data-reveal>
              <DocumentLink
                href={asset(profile.documents.cv.file)}
                label={profile.documents.cv.label}
                meta={profile.documents.cv.updated}
              />
              <span aria-hidden="true" className="hidden h-4 w-px bg-[var(--color-rule)] sm:block" />
              <DocumentLink
                href={asset(profile.documents.resume.file)}
                label={profile.documents.resume.label}
                meta={profile.documents.resume.updated}
              />
            </div>

            <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3" data-reveal>
              {profile.socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    {...(social.url.startsWith('http')
                      ? { target: '_blank', rel: 'me noopener noreferrer' }
                      : {})}
                    className="group inline-flex items-center gap-2 text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    {social.id === 'github' ? (
                      <GitHubIcon className="h-3.5 w-3.5" />
                    ) : null}
                    <span className="underline decoration-[var(--color-rule-strong)] decoration-1 underline-offset-4 transition-colors group-hover:decoration-[var(--color-accent)]">
                      {social.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ------------------------------------------------ portrait column */}
          <div className="lg:col-span-5 xl:col-span-5" data-reveal>
            <figure className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="relative">
                {/* Grid motif sits behind the plate only — never under the
                    metadata labels — so the portrait reads as pinned onto a
                    technical sheet without crowding the text below it. */}
                <div
                  aria-hidden="true"
                  className="grid-motif pointer-events-none absolute -inset-x-8 -inset-y-8 hidden sm:block"
                />
                <CornerTicks />

                <div className="relative overflow-hidden rounded-[2px] border border-[var(--color-rule-strong)] bg-[var(--color-surface)]">
                  <img
                    src={asset(profile.portrait)}
                    alt={profile.portraitAlt}
                    width={1133}
                    height={1417}
                    fetchPriority="high"
                    decoding="async"
                    className="block aspect-[4/5] w-full object-cover object-top"
                  />
                </div>

                {/* Caption plate, in the register of a figure label. */}
                <figcaption className="relative mt-0 border-x border-b border-[var(--color-rule-strong)] bg-[var(--color-surface)] px-4 py-3.5">
                  <p className="eyebrow">{profile.degree}</p>
                  <p className="mt-2 text-[0.8125rem] leading-snug text-[var(--color-ink-2)]">
                    {profile.affiliation}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-[var(--color-ink-3)]">{profile.location}</p>
                </figcaption>
              </div>

              {/* Metadata labels: the fields this portrait belongs to. */}
              <ul className="relative mt-7 flex flex-wrap gap-x-4 gap-y-2">
                {profile.portraitLabels.map((label) => (
                  <li key={label} className="eyebrow flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="inline-block h-px w-3 bg-[var(--color-rule-strong)]"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function DocumentLink({ href, label, meta }: { href: string; label: string; meta: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-baseline gap-2 text-[0.875rem] text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-ink)]"
    >
      <span className="underline decoration-[var(--color-rule-strong)] decoration-1 underline-offset-4 transition-colors group-hover:decoration-[var(--color-accent)]">
        {label}
      </span>
      <span className="eyebrow">PDF · {meta}</span>
      <ExternalIcon className="h-3 w-3 shrink-0 self-center opacity-50" />
    </a>
  );
}

/** Registration marks at the portrait corners — a drafting convention. */
function CornerTicks() {
  const corner = 'absolute h-3 w-3 border-[var(--color-accent)]';
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -inset-2 hidden sm:block">
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}
