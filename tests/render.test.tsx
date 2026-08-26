import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import SitePage from '@/SitePage';
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

  it('gives every enabled navigation entry a matching section landmark', () => {
    for (const entry of content.settings.nav.filter((item) => item.enabled)) {
      expect(document.getElementById(entry.id), `no section #${entry.id}`).not.toBeNull();
    }
  });

  it('describes the portrait with alt text', () => {
    expect(screen.getByAltText(content.profile.portraitAlt)).toBeInTheDocument();
  });

  it('links the CV and the résumé separately', () => {
    const { cv, resume } = content.profile.documents;
    const cvLinks = screen.getAllByRole('link', { name: new RegExp(cv.label, 'i') });
    const resumeLinks = screen.getAllByRole('link', { name: new RegExp(resume.label, 'i') });
    expect(cvLinks.length).toBeGreaterThan(0);
    expect(resumeLinks.length).toBeGreaterThan(0);
    expect(cvLinks[0]).toHaveAttribute('href', expect.stringContaining(cv.file));
    expect(resumeLinks[0]).toHaveAttribute('href', expect.stringContaining(resume.file));
  });

  it('opens every external link safely', () => {
    for (const link of screen.getAllByRole('link')) {
      const href = link.getAttribute('href') ?? '';
      if (!href.startsWith('http')) continue;
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel') ?? '').toContain('noopener');
    }
  });

  it('renders each project with its source link', () => {
    // Scoped to the projects section: several titles (CanvasMind, the ASP
    // pipeline) intentionally appear in Publications as well.
    const section = within(document.getElementById('projects') as HTMLElement);
    for (const project of content.projects.items) {
      const heading = section.getByRole('heading', { name: project.title, level: 3 });
      const card = heading.closest('article');
      expect(card).not.toBeNull();
      const source = within(card as HTMLElement).getByRole('link', { name: /source/i });
      expect(source).toHaveAttribute('href', project.github);
    }
  });

  it('renders the footer signature exactly once, at the end', () => {
    const signature = screen.getByText(content.settings.footer.signature);
    expect(signature).toBeInTheDocument();
    expect(screen.getAllByText(content.settings.footer.signature)).toHaveLength(1);
  });

  it('exposes a skip link before the navigation', () => {
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
