import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * index.html is written by hand, so the content tests cannot see its image
 * references (social preview, touch icon, structured data). Replacing or
 * deleting a photo would otherwise leave those pointing at a missing file.
 */
describe('index.html asset references', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
  const refs = [
    ...new Set(
      [...html.matchAll(/(?:vidvathamaiiith\.github\.io)?\/((?:media|docs)\/[A-Za-z0-9._-]+)/g)].map((m) => m[1]),
    ),
  ];

  it('finds the references it is meant to check', () => {
    expect(refs.length).toBeGreaterThan(0);
  });

  it.each(refs)('public/%s exists', (path) => {
    expect(existsSync(resolve(process.cwd(), 'public', path)), `index.html points at missing public/${path}`).toBe(true);
  });
});
