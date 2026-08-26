import type { ContentKey } from '@/types/content';

/**
 * The admin forms are generated from these schemas rather than hand-written per
 * collection. Adding a field to the content model means adding one entry here —
 * not editing a React component.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'number'
  | 'select'
  | 'boolean'
  | 'tags'
  | 'paragraphs'
  | 'image'
  | 'file'
  | 'group'
  | 'objectList'
  | 'toggleMap';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  rows?: number;
  options?: string[];
  /** Sub-fields for `group` and `objectList`. */
  fields?: Field[];
  /** Which sub-field to show as the row title in an objectList. */
  titleKey?: string;
  /** Which sub-field to show as the row subtitle in an objectList. */
  subtitleKey?: string;
}

export const STATUS_OPTIONS = [
  'Research',
  'In Progress',
  'Submitted',
  'In Preparation',
  'Prototype',
  'Completed',
  'Published',
];

const LINK_FIELDS: Field[] = [
  { key: 'label', label: 'Label', type: 'text', placeholder: 'Paper' },
  { key: 'url', label: 'URL', type: 'url', placeholder: 'https://…' },
];

const METRIC_FIELDS: Field[] = [
  { key: 'label', label: 'Label', type: 'text', placeholder: 'Accuracy' },
  { key: 'value', label: 'Value', type: 'text', placeholder: '85.66%' },
];

export const SCHEMAS: Record<ContentKey, Field[]> = {
  profile: [
    { key: 'name', label: 'Full name', type: 'text' },
    { key: 'shortName', label: 'Short name', type: 'text', help: 'Shown in the navigation wordmark.' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'affiliation', label: 'Affiliation', type: 'text' },
    { key: 'degree', label: 'Degree', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'portrait', label: 'Portrait image', type: 'image', help: 'Upload replaces the hero portrait.' },
    { key: 'portraitAlt', label: 'Portrait alt text', type: 'text', help: 'Describes the image for screen readers.' },
    { key: 'portraitLabels', label: 'Portrait metadata labels', type: 'tags' },
    { key: 'tagline', label: 'Tagline', type: 'textarea', rows: 2 },
    { key: 'researchStatement', label: 'Research statement', type: 'textarea', rows: 4 },
    { key: 'interestsLine', label: 'Research interests line', type: 'textarea', rows: 2 },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    {
      key: 'documents',
      label: 'Documents',
      type: 'group',
      fields: [
        {
          key: 'cv',
          label: 'Curriculum Vitae',
          type: 'group',
          fields: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
            { key: 'file', label: 'PDF file', type: 'file' },
            { key: 'updated', label: 'Updated', type: 'text', placeholder: 'August 2026' },
          ],
        },
        {
          key: 'resume',
          label: 'Résumé',
          type: 'group',
          fields: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
            { key: 'file', label: 'PDF file', type: 'file' },
            { key: 'updated', label: 'Updated', type: 'text', placeholder: 'August 2026' },
          ],
        },
      ],
    },
    {
      key: 'socials',
      label: 'Social profiles',
      type: 'objectList',
      titleKey: 'label',
      subtitleKey: 'handle',
      fields: [
        { key: 'id', label: 'ID', type: 'text', help: 'Lowercase, no spaces. "github" renders its icon.' },
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'handle', label: 'Handle', type: 'text' },
        { key: 'url', label: 'URL', type: 'url' },
      ],
    },
  ],

  about: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'lead', label: 'Lead sentence', type: 'textarea', rows: 3 },
    { key: 'bio', label: 'Biography paragraphs', type: 'paragraphs' },
    { key: 'motivation', label: 'What motivates the work', type: 'textarea', rows: 4 },
    {
      key: 'facts',
      label: 'At-a-glance facts',
      type: 'objectList',
      titleKey: 'label',
      subtitleKey: 'value',
      fields: [
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'value', label: 'Value', type: 'text' },
      ],
    },
    {
      key: 'interests',
      label: 'Research interests',
      type: 'objectList',
      titleKey: 'title',
      subtitleKey: 'description',
      fields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
      ],
    },
    { key: 'exploring', label: 'Currently exploring', type: 'tags', help: 'One idea per entry.' },
  ],

  research: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'intro', label: 'Section intro', type: 'textarea', rows: 3 },
    {
      key: 'items',
      label: 'Research projects',
      type: 'objectList',
      titleKey: 'title',
      subtitleKey: 'status',
      fields: [
        { key: 'id', label: 'ID', type: 'text', help: 'Stable slug, used for cross-links.' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'shortDescription', label: 'Short description', type: 'textarea', rows: 3 },
        { key: 'question', label: 'Research question', type: 'textarea', rows: 3 },
        { key: 'problem', label: 'Problem', type: 'textarea', rows: 4 },
        { key: 'approach', label: 'Approach', type: 'textarea', rows: 4 },
        { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
        { key: 'venue', label: 'Lab / institution', type: 'text' },
        { key: 'supervisor', label: 'Supervision', type: 'text' },
        { key: 'period', label: 'Period', type: 'text' },
        { key: 'technologies', label: 'Technologies', type: 'tags' },
        { key: 'links', label: 'Links', type: 'objectList', titleKey: 'label', subtitleKey: 'url', fields: LINK_FIELDS },
        { key: 'relatedPublication', label: 'Related publication ID', type: 'text' },
        { key: 'featured', label: 'Featured', type: 'boolean' },
        { key: 'image', label: 'Figure', type: 'image' },
        { key: 'imageCaption', label: 'Figure caption', type: 'text' },
      ],
    },
  ],

  current: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'intro', label: 'Section intro', type: 'textarea', rows: 2 },
    {
      key: 'items',
      label: 'Active threads',
      type: 'objectList',
      titleKey: 'topic',
      subtitleKey: 'lastUpdated',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'topic', label: 'Topic', type: 'text' },
        { key: 'whyItMatters', label: 'Why it matters', type: 'textarea', rows: 4 },
        { key: 'investigating', label: 'What I am investigating', type: 'textarea', rows: 4 },
        { key: 'progress', label: 'Current progress', type: 'textarea', rows: 3 },
        { key: 'literature', label: 'Relevant literature', type: 'tags' },
        { key: 'relatedResearch', label: 'Related research ID', type: 'text' },
        { key: 'lastUpdated', label: 'Last updated', type: 'text', placeholder: 'August 2026' },
      ],
    },
  ],

  publications: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'intro', label: 'Section intro', type: 'textarea', rows: 3 },
    { key: 'note', label: 'Footnote', type: 'text' },
    {
      key: 'items',
      label: 'Publications',
      type: 'objectList',
      titleKey: 'title',
      subtitleKey: 'venue',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'authors', label: 'Authors', type: 'tags', help: 'One author per entry, in order.' },
        { key: 'venue', label: 'Venue', type: 'text' },
        { key: 'secondaryVenue', label: 'Secondary venue', type: 'text' },
        { key: 'year', label: 'Year', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
        { key: 'abstract', label: 'Abstract', type: 'textarea', rows: 6 },
        { key: 'topics', label: 'Topics', type: 'tags' },
        { key: 'paperUrl', label: 'Paper URL', type: 'url' },
        { key: 'arxivUrl', label: 'arXiv URL', type: 'url' },
        { key: 'doi', label: 'DOI', type: 'text' },
        { key: 'codeUrl', label: 'Code URL', type: 'url' },
        { key: 'projectPage', label: 'Project page', type: 'url' },
        { key: 'pdf', label: 'PDF', type: 'file' },
        { key: 'bibtex', label: 'BibTeX', type: 'textarea', rows: 8 },
      ],
    },
  ],

  projects: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'intro', label: 'Section intro', type: 'textarea', rows: 3 },
    {
      key: 'items',
      label: 'Projects',
      type: 'objectList',
      titleKey: 'title',
      subtitleKey: 'category',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'subtitle', label: 'Subtitle', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'date', label: 'Date label', type: 'text', placeholder: 'January 2026' },
        { key: 'sortDate', label: 'Sort key', type: 'text', placeholder: '2026-01', help: 'YYYY-MM. Controls ordering.' },
        { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
        { key: 'featured', label: 'Featured', type: 'boolean' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'details', label: 'Detail bullets', type: 'paragraphs' },
        { key: 'technologies', label: 'Technologies', type: 'tags' },
        { key: 'metrics', label: 'Result figures', type: 'objectList', titleKey: 'label', subtitleKey: 'value', fields: METRIC_FIELDS },
        { key: 'github', label: 'GitHub URL', type: 'url' },
        { key: 'demo', label: 'Demo URL', type: 'url' },
        { key: 'report', label: 'Report', type: 'file' },
        { key: 'researchConnection', label: 'Linked publication ID', type: 'text' },
        { key: 'image', label: 'Figure', type: 'image' },
        { key: 'imageCaption', label: 'Figure caption', type: 'text' },
      ],
    },
  ],

  coursework: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'intro', label: 'Section intro', type: 'textarea', rows: 2 },
    { key: 'courses', label: 'Relevant coursework', type: 'tags' },
    {
      key: 'items',
      label: 'Course projects',
      type: 'objectList',
      titleKey: 'title',
      subtitleKey: 'course',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Project title', type: 'text' },
        { key: 'course', label: 'Course', type: 'text' },
        { key: 'courseCode', label: 'Course code', type: 'text' },
        { key: 'term', label: 'Semester / year', type: 'text' },
        { key: 'sortDate', label: 'Sort key', type: 'text', placeholder: '2026-01' },
        { key: 'team', label: 'Team', type: 'text' },
        { key: 'problem', label: 'Problem', type: 'textarea', rows: 3 },
        { key: 'approach', label: 'Approach', type: 'textarea', rows: 4 },
        { key: 'results', label: 'Results', type: 'textarea', rows: 3 },
        { key: 'learned', label: 'What I learned', type: 'textarea', rows: 3 },
        { key: 'technologies', label: 'Technologies', type: 'tags' },
        { key: 'links', label: 'Links', type: 'objectList', titleKey: 'label', subtitleKey: 'url', fields: LINK_FIELDS },
        { key: 'image', label: 'Figure', type: 'image' },
        { key: 'imageCaption', label: 'Figure caption', type: 'text' },
      ],
    },
  ],

  experience: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'intro', label: 'Section intro', type: 'textarea', rows: 2 },
    {
      key: 'items',
      label: 'Timeline entries',
      type: 'objectList',
      titleKey: 'role',
      subtitleKey: 'organization',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'organization', label: 'Organization', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'kind', label: 'Kind', type: 'text', placeholder: 'Research / Education' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'start', label: 'Start', type: 'text' },
        { key: 'end', label: 'End', type: 'text' },
        { key: 'current', label: 'Ongoing', type: 'boolean' },
        { key: 'supervisor', label: 'Supervisor / mentor', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'achievements', label: 'Achievements', type: 'paragraphs' },
        { key: 'technologies', label: 'Technologies', type: 'tags' },
        { key: 'links', label: 'Links', type: 'objectList', titleKey: 'label', subtitleKey: 'url', fields: LINK_FIELDS },
      ],
    },
    {
      key: 'honors',
      label: 'Honors',
      type: 'objectList',
      titleKey: 'title',
      subtitleKey: 'year',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'year', label: 'Year', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
      ],
    },
  ],

  skills: [
    { key: 'heading', label: 'Section heading', type: 'text' },
    { key: 'intro', label: 'Section intro', type: 'textarea', rows: 2 },
    {
      key: 'groups',
      label: 'Skill groups',
      type: 'objectList',
      titleKey: 'title',
      subtitleKey: 'description',
      fields: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'title', label: 'Group title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 2 },
        { key: 'skills', label: 'Skills', type: 'tags' },
      ],
    },
  ],

  settings: [
    { key: 'siteTitle', label: 'Site title', type: 'text' },
    { key: 'siteTagline', label: 'Site tagline', type: 'text' },
    { key: 'siteDescription', label: 'Meta description', type: 'textarea', rows: 3, help: 'Used for search results and link previews.' },
    { key: 'siteUrl', label: 'Site URL', type: 'url' },
    { key: 'ogImage', label: 'Social share image', type: 'image' },
    { key: 'keywords', label: 'Keywords', type: 'tags' },
    {
      key: 'nav',
      label: 'Navigation',
      type: 'objectList',
      titleKey: 'label',
      subtitleKey: 'id',
      fields: [
        { key: 'id', label: 'Section ID', type: 'text', help: 'Must match a section anchor on the page.' },
        { key: 'label', label: 'Label', type: 'text' },
        { key: 'enabled', label: 'Show in navigation', type: 'boolean' },
      ],
    },
    { key: 'sections', label: 'Section visibility', type: 'toggleMap', help: 'Turn whole sections of the site on or off.' },
    {
      key: 'contact',
      label: 'Contact',
      type: 'group',
      fields: [
        { key: 'heading', label: 'Heading', type: 'text' },
        { key: 'statement', label: 'Statement', type: 'textarea', rows: 3 },
        { key: 'availability', label: 'Availability', type: 'textarea', rows: 2 },
        { key: 'responseNote', label: 'Response note', type: 'text' },
      ],
    },
    {
      key: 'footer',
      label: 'Footer',
      type: 'group',
      fields: [
        { key: 'copyrightName', label: 'Copyright name', type: 'text' },
        { key: 'note', label: 'Footer note', type: 'text' },
        { key: 'signature', label: 'Signature', type: 'text', help: 'The small line at the very bottom of the page.' },
      ],
    },
  ],
};

/** A blank row for an objectList, so "Add" produces a complete, valid shape. */
export function blankFrom(fields: Field[]): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.type) {
      case 'boolean':
        row[field.key] = false;
        break;
      case 'number':
        row[field.key] = new Date().getFullYear();
        break;
      case 'tags':
      case 'paragraphs':
      case 'objectList':
        row[field.key] = [];
        break;
      case 'select':
        row[field.key] = field.options?.[0] ?? '';
        break;
      case 'group':
        row[field.key] = field.fields ? blankFrom(field.fields) : {};
        break;
      default:
        row[field.key] = '';
    }
  }
  return row;
}
