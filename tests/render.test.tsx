import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import SitePage from '@/SitePage';
import { Inline } from '@/components/Inline';
import { content } from '@/lib/content';
import { toBase64, fromBase64 } from '@/lib/github';

describe('site page', () => {
  beforeEach(() => {
    render(<SitePage />);
  });

  it('renders the name as the only h1', () => {
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(content.profile.name);
  });

  it('gives every enabled navigation entry a matching anchor', () => {
    for (const entry of content.settings.nav.filter((item) => item.enabled)) {
      expect(document.getElementById(entry.id), `no element #${entry.id}`).not.toBeNull();
    }
  });

  it('describes the portrait with alt text', () => {
    expect(screen.getByAltText(content.profile.portraitAlt)).toBeInTheDocument();
  });

  it('links the CV and the résumé separately, to the files in content', () => {
    const { cv, resume } = content.profile.documents;
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href') ?? '');
    expect(hrefs.some((href) => href.endsWith(cv.file))).toBe(true);
    expect(hrefs.some((href) => href.endsWith(resume.file))).toBe(true);
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute('href', expect.stringContaining(cv.file));
    expect(screen.getByRole('link', { name: 'Résumé' })).toHaveAttribute('href', expect.stringContaining(resume.file));
  });

  it('opens every external link safely', () => {
    for (const link of screen.getAllByRole('link')) {
      const href = link.getAttribute('href') ?? '';
      if (!href.startsWith('http')) continue;
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel') ?? '').toContain('noopener');
    }
  });

  it('renders each project with its code link', () => {
    // Scoped to projects: some titles also appear under Research.
    const section = within(document.getElementById('projects') as HTMLElement);
    for (const project of content.projects.items) {
      const heading = section.getByRole('heading', { name: project.title, level: 3 });
      const row = heading.closest('article');
      expect(row).not.toBeNull();
      expect(within(row as HTMLElement).getByRole('link', { name: 'code' })).toHaveAttribute('href', project.github);
    }
  });

  it('renders bio links as anchors, never as raw markdown', () => {
    const about = document.getElementById('about') as HTMLElement;
    expect(about.textContent).not.toMatch(/\]\(/);
  });

  it('renders the footer signature exactly once', () => {
    expect(screen.getAllByText(content.settings.footer.signature)).toHaveLength(1);
  });

  it('exposes a skip link', () => {
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main');
  });

  it('has no heading level skips', () => {
    const levels = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((node) =>
      Number(node.tagName[1]),
    );
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1], `jump from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });
});

describe('Inline', () => {
  it('turns [label](url) into a safe external link', () => {
    render(<Inline text="Work at the [Lab](https://example.com/lab) today." />);
    const link = screen.getByRole('link', { name: 'Lab' });
    expect(link).toHaveAttribute('href', 'https://example.com/lab');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('refuses script URLs and keeps only the label', () => {
    const { container } = render(<Inline text="[click](javascript:alert(1))" />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('click');
  });
});

describe('base64 helpers', () => {
  it('round-trips text containing non-Latin1 characters', () => {
    const original = 'Résumé — “quotes”, em–dash, 数学, ✓';
    expect(fromBase64(toBase64(original))).toBe(original);
  });

  it('round-trips BibTeX with backslashes and newlines', () => {
    const bibtex = content.publications.items[0].bibtex;
    expect(fromBase64(toBase64(bibtex))).toBe(bibtex);
  });
});
