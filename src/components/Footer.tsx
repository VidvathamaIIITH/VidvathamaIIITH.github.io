import type { Profile, Settings } from '@/types/content';

export function Footer({ profile, settings }: { profile: Profile; settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-rule)] bg-[var(--color-surface-2)]">
      <div className="page-shell">
        <div className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between md:gap-12">
          <div>
            <p className="font-serif text-[1.0625rem] text-[var(--color-ink)]">
              {profile.name}
              <span className="text-[var(--color-accent)]">.</span>
            </p>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--color-ink-3)]">
              {settings.siteTagline}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {settings.nav
                .filter((item) => item.enabled)
                .map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-[0.8125rem] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-ink)]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--color-rule)] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] text-[var(--color-ink-3)]">
            © {year} {settings.footer.copyrightName}. All rights reserved.
          </p>
          {settings.footer.note ? (
            <p className="text-[0.75rem] text-[var(--color-ink-3)]">{settings.footer.note}</p>
          ) : null}
        </div>

        {/*
          Personal signature. Deliberately the last thing on the page, small and
          quiet — findable on purpose, not announced.
        */}
        <div className="flex justify-end pb-5">
          <p className="font-serif text-[0.625rem] leading-none tracking-[0.02em] text-[var(--color-ink-3)]">
            {settings.footer.signature}
          </p>
        </div>
      </div>
    </footer>
  );
}
