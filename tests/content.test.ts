import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { content, CONTENT_KEYS, CONTENT_LABELS, asset } from '@/lib/content';
import { SCHEMAS, blankFrom } from '@/admin/schema';
import type { ContentKey } from '@/types/content';

/**
 * These guard the content model itself. Because the site is data-driven, a
 * malformed content file is the most likely way to break the build — so the
 * shape is asserted here rather than discovered in the browser.
 */

describe('content collections', () => {
  it('exposes every collection referenced by the admin', () => {
    for (const key of CONTENT_KEYS) {
      expect(content[key], `missing collection: ${key}`).toBeTruthy();
      expect(CONTENT_LABELS[key]).toBeTruthy();
      expect(SCHEMAS[key], `missing schema: ${key}`).toBeTruthy();
    }
  });

  it('gives every schema field a matching key in its content file', () => {
    for (const key of CONTENT_KEYS) {
      const record = content[key] as unknown as Record<string, unknown>;
      for (const field of SCHEMAS[key]) {
        expect(record, `${key}.json is missing "${field.key}"`).toHaveProperty(field.key);
      }
    }
  });
});

describe('identifiers', () => {
  const collectionsWithIds: [ContentKey, string][] = [
    ['research', 'items'],
    ['current', 'items'],
    ['publications', 'items'],
    ['projects', 'items'],
    ['coursework', 'items'],
    ['experience', 'items'],
    ['skills', 'groups'],
  ];

  it.each(collectionsWithIds)('%s.%s has unique, non-empty ids', (key, listKey) => {
    const list = (content[key] as unknown as Record<string, { id: string }[]>)[listKey];
    const ids = list.map((entry) => entry.id);
    expect(ids.every(Boolean), `${key} has an entry with a blank id`).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('cross-references', () => {
  it('points every relatedPublication at a real publication', () => {
    const publicationIds = new Set(content.publications.items.map((item) => item.id));
    for (const item of content.research.items) {
      if (!item.relatedPublication) continue;
      expect(publicationIds, `research "${item.id}" references a missing publication`).toContain(
        item.relatedPublication,
      );
    }
  });

  it('points every researchConnection at a real publication', () => {
    const publicationIds = new Set(content.publications.items.map((item) => item.id));
    for (const project of content.projects.items) {
      if (!project.researchConnection) continue;
      expect(publicationIds, `project "${project.id}" references a missing publication`).toContain(
        project.researchConnection,
      );
    }
  });

  it('points every relatedResearch at a real research item', () => {
    const researchIds = new Set(content.research.items.map((item) => item.id));
    for (const item of content.current.items) {
      if (!item.relatedResearch) continue;
      expect(researchIds, `current "${item.id}" references missing research`).toContain(
        item.relatedResearch,
      );
    }
  });

  it('maps every navigation entry to a togglable section or the hero', () => {
    const sections = new Set([...Object.keys(content.settings.sections), 'home']);
    for (const entry of content.settings.nav) {
      expect(sections, `nav entry "${entry.id}" has no matching section`).toContain(entry.id);
    }
  });
});

describe('links', () => {
  const urls: string[] = [
    ...content.profile.socials.map((social) => social.url),
    ...content.projects.items.flatMap((p) => [p.github, p.demo].filter(Boolean)),
    ...content.publications.items.flatMap((p) =>
      [p.paperUrl, p.arxivUrl, p.codeUrl, p.projectPage].filter(Boolean),
    ),
    ...content.research.items.flatMap((r) => r.links.map((l) => l.url)),
  ];

  it('has no relative or malformed external URLs', () => {
    for (const url of urls) {
      expect(url, `not an absolute URL: ${url}`).toMatch(/^(https?:\/\/|mailto:)/);
    }
  });

  it('gives each of the five detailed projects a source link', () => {
    for (const project of content.projects.items) {
      expect(project.github, `project "${project.id}" has no GitHub link`).toMatch(
        /^https:\/\/github\.com\//,
      );
    }
  });
});

describe('documents', () => {
  it('offers the CV and résumé as separate files', () => {
    const { cv, resume } = content.profile.documents;
    expect(cv.file).toMatch(/\.pdf$/);
    expect(resume.file).toMatch(/\.pdf$/);
    expect(cv.file).not.toBe(resume.file);
  });
});

describe('asset()', () => {
  it('leaves absolute URLs untouched', () => {
    expect(asset('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(asset('mailto:a@b.c')).toBe('mailto:a@b.c');
  });

  it('resolves repo-relative paths against the deployment base', () => {
    expect(asset('media/portrait.jpeg')).toBe('/media/portrait.jpeg');
    expect(asset('/media/portrait.jpeg')).toBe('/media/portrait.jpeg');
  });

  it('returns an empty string for empty input', () => {
    expect(asset('')).toBe('');
  });
});

describe('blankFrom()', () => {
  it('produces every key the schema declares, correctly typed', () => {
    const row = blankFrom(SCHEMAS.projects[2].fields ?? []);
    expect(row.title).toBe('');
    expect(row.featured).toBe(false);
    expect(row.technologies).toEqual([]);
    expect(row.metrics).toEqual([]);
    expect(typeof row.status).toBe('string');
  });
});

describe('referenced assets exist on disk', () => {
  // The site 404s silently when content points at a file that was deleted from
  // the repository. Failing the build is louder and safer than shipping a dead
  // link: the previous deploy keeps serving until the reference is corrected.
  // Vitest runs from the project root, so this resolves the real public/ dir.
  const publicDir = resolve(process.cwd(), 'public');

  const referenced: { label: string; path: string }[] = [
    { label: 'profile.documents.cv', path: content.profile.documents.cv.file },
    { label: 'profile.documents.resume', path: content.profile.documents.resume.file },
    { label: 'profile.portrait', path: content.profile.portrait },
    ...content.research.items
      .filter((r) => r.image)
      .map((r) => ({ label: `research/${r.id}.image`, path: r.image })),
    ...content.projects.items.flatMap((p) =>
      [
        p.image ? { label: `projects/${p.id}.image`, path: p.image } : null,
        p.report ? { label: `projects/${p.id}.report`, path: p.report } : null,
      ].filter(Boolean as unknown as (v: unknown) => v is { label: string; path: string }),
    ),
    ...content.coursework.items
      .filter((c) => c.image)
      .map((c) => ({ label: `coursework/${c.id}.image`, path: c.image })),
    ...content.publications.items
      .filter((p) => p.pdf)
      .map((p) => ({ label: `publications/${p.id}.pdf`, path: p.pdf })),
  ];

  it('references at least the CV, the résumé and the portrait', () => {
    expect(referenced.length).toBeGreaterThanOrEqual(3);
  });

  it.each(referenced.map((r) => [r.label, r.path] as const))(
    '%s -> public/%s exists',
    (label, path) => {
      // Only local assets are checked; absolute URLs are somebody else's server.
      if (/^(https?:)?\/\//.test(path)) return;
      const onDisk = resolve(publicDir, path.replace(/^\//, ''));
      expect(
        existsSync(onDisk),
        `${label} points at "${path}" but public/${path} is missing. ` +
          'Upload the file, or update the reference in the admin portal.',
      ).toBe(true);
    },
  );

  it('matches the exact filename case (GitHub Pages is case-sensitive)', () => {
    for (const { label, path } of referenced) {
      if (/^(https?:)?\/\//.test(path)) continue;
      const rel = path.replace(/^\//, '');
      const dir = resolve(publicDir, rel.split('/').slice(0, -1).join('/'));
      const name = rel.split('/').pop() as string;
      if (!existsSync(dir)) continue;
      expect(readdirSync(dir), `${label}: case mismatch for "${name}"`).toContain(name);
    }
  });
});
