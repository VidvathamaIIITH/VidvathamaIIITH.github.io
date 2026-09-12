import profile from '@content/profile.json';
import about from '@content/about.json';
import research from '@content/research.json';
import current from '@content/current.json';
import publications from '@content/publications.json';
import projects from '@content/projects.json';
import coursework from '@content/coursework.json';
import experience from '@content/experience.json';
import skills from '@content/skills.json';
import settings from '@content/settings.json';

import type { SiteContent, ContentKey } from '@/types/content';

/**
 * Content is imported at build time rather than fetched at runtime: the site
 * ships as fully-formed static HTML+JS with no data waterfall on first paint.
 *
 * The admin portal writes back to the same files in /content through the GitHub
 * API; the commit triggers the deploy workflow, which rebuilds with the new data.
 */
export const content = {
  profile,
  about,
  research,
  current,
  publications,
  projects,
  coursework,
  experience,
  skills,
  settings,
} as unknown as SiteContent;

export const CONTENT_KEYS: ContentKey[] = [
  'profile',
  'about',
  'research',
  'current',
  'publications',
  'projects',
  'coursework',
  'experience',
  'skills',
  'settings',
];

/** Human labels for each collection, used by the admin navigation. */
export const CONTENT_LABELS: Record<ContentKey, string> = {
  profile: 'Profile',
  about: 'About',
  research: 'Research',
  current: 'Current Research',
  publications: 'Publications',
  projects: 'Projects',
  coursework: 'Coursework',
  experience: 'Experience',
  skills: 'Skills',
  settings: 'Site Settings',
};

/**
 * Resolve a content-relative asset path (e.g. "media/portrait.jpeg") against the
 * deployment base, which differs between a user site and a project site.
 */
export function asset(path: string): string {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('mailto:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
