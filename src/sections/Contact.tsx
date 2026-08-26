import { asset } from '@/lib/content';
import { Section, LinkButton, ArrowIcon, GitHubIcon, ExternalIcon } from '@/components/ui';
import type { Profile, Settings } from '@/types/content';

export function Contact({ profile, settings }: { profile: Profile; settings: Settings }) {
  return (
    <Section id="contact" eyebrow="09 — Get in touch" title={settings.contact.heading}>
      <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-6" data-reveal>
          <p className="prose-measure font-serif text-[1.375rem] font-light leading-[1.5] text-[var(--color-ink)] md:text-[1.5rem]">
            {settings.contact.statement}
          </p>

          <p className="mt-6 max-w-[52ch] text-[0.9375rem] leading-[1.7] text-[var(--color-ink-2)]">
            {settings.contact.availability}
          </p>

          <div className="mt-8">
            <LinkButton href={`mailto:${profile.email}`} tone="primary">
              {profile.email}
              <ArrowIcon />
            </LinkButton>
            <p className="eyebrow mt-4">{settings.contact.responseNote}</p>
          </div>
        </div>

        <div className="lg:col-span-6" data-reveal>
          {/* Profiles */}
          <div className="card">
            <p className="eyebrow border-b border-[var(--color-rule)] px-6 py-4">Profiles</p>
            <ul>
              {profile.socials.map((social) => (
                <li key={social.id} className="border-b border-[var(--color-rule)] last:border-b-0">
                  <a
                    href={social.url}
                    {...(social.url.startsWith('http')
                      ? { target: '_blank', rel: 'me noopener noreferrer' }
                      : {})}
                    className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[var(--color-surface-2)]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {social.id === 'github' ? (
                        <GitHubIcon className="h-4 w-4 shrink-0 text-[var(--color-ink-3)]" />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block text-[0.875rem] text-[var(--color-ink)]">
                          {social.label}
                        </span>
                        <span className="block truncate font-mono text-[0.75rem] text-[var(--color-ink-3)]">
                          {social.handle}
                        </span>
                      </span>
                    </span>
                    <ExternalIcon className="h-3.5 w-3.5 shrink-0 text-[var(--color-ink-3)] transition-colors group-hover:text-[var(--color-accent)]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CV and résumé, kept distinct and downloadable on their own. */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DocumentCard doc={profile.documents.cv} />
            <DocumentCard doc={profile.documents.resume} />
          </div>
        </div>
      </div>
    </Section>
  );
}

function DocumentCard({
  doc,
}: {
  doc: { label: string; description: string; file: string; updated: string };
}) {
  return (
    <a
      href={asset(doc.file)}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-interactive group flex flex-col p-5 transition-colors hover:bg-[var(--color-surface-2)]"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-[0.9375rem] text-[var(--color-ink)]">{doc.label}</span>
        <DownloadIcon />
      </span>
      <span className="mt-2 text-[0.8125rem] leading-[1.6] text-[var(--color-ink-3)]">
        {doc.description}
      </span>
      <span className="eyebrow mt-4">PDF · Updated {doc.updated}</span>
    </a>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--color-ink-3)] transition-colors group-hover:text-[var(--color-accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v8" />
      <path d="m4.5 7 3.5 3.5L11.5 7" />
      <path d="M2.5 13.5h11" />
    </svg>
  );
}
