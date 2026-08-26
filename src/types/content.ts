/**
 * Shape of every file under /content. These types are the single contract
 * shared by the public site, the admin editors, and the tests.
 */

export type ResearchStatus =
  | 'Research'
  | 'In Progress'
  | 'Published'
  | 'Submitted'
  | 'In Preparation'
  | 'Prototype'
  | 'Completed';

export interface Link {
  label: string;
  url: string;
}

export interface Metric {
  label: string;
  value: string;
}

export interface Social {
  id: string;
  label: string;
  handle: string;
  url: string;
}

export interface DocumentRef {
  label: string;
  description: string;
  file: string;
  updated: string;
}

export interface Profile {
  name: string;
  shortName: string;
  role: string;
  affiliation: string;
  degree: string;
  location: string;
  portrait: string;
  portraitAlt: string;
  portraitLabels: string[];
  researchStatement: string;
  tagline: string;
  interestsLine: string;
  email: string;
  phone: string;
  documents: { cv: DocumentRef; resume: DocumentRef };
  socials: Social[];
}

export interface Fact {
  label: string;
  value: string;
}

export interface Interest {
  title: string;
  description: string;
}

export interface About {
  heading: string;
  lead: string;
  bio: string[];
  motivation: string;
  facts: Fact[];
  interests: Interest[];
  exploring: string[];
}

export interface ResearchItem {
  id: string;
  title: string;
  shortDescription: string;
  question: string;
  problem: string;
  approach: string;
  status: ResearchStatus;
  venue: string;
  supervisor: string;
  period: string;
  technologies: string[];
  links: Link[];
  relatedPublication: string;
  featured: boolean;
  image: string;
  imageCaption: string;
}

export interface Research {
  heading: string;
  intro: string;
  items: ResearchItem[];
}

export interface CurrentItem {
  id: string;
  topic: string;
  whyItMatters: string;
  investigating: string;
  progress: string;
  literature: string[];
  relatedResearch: string;
  lastUpdated: string;
}

export interface Current {
  heading: string;
  intro: string;
  items: CurrentItem[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  secondaryVenue: string;
  year: number;
  status: ResearchStatus;
  abstract: string;
  topics: string[];
  paperUrl: string;
  arxivUrl: string;
  doi: string;
  codeUrl: string;
  projectPage: string;
  pdf: string;
  bibtex: string;
}

export interface Publications {
  heading: string;
  intro: string;
  note: string;
  items: Publication[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  sortDate: string;
  status: ResearchStatus;
  featured: boolean;
  description: string;
  details: string[];
  technologies: string[];
  metrics: Metric[];
  github: string;
  demo: string;
  report: string;
  researchConnection: string;
  image: string;
  imageCaption: string;
}

export interface Projects {
  heading: string;
  intro: string;
  items: Project[];
}

export interface CourseworkItem {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  term: string;
  sortDate: string;
  team: string;
  problem: string;
  approach: string;
  results: string;
  learned: string;
  technologies: string[];
  links?: Link[];
  image: string;
  imageCaption: string;
}

export interface Coursework {
  heading: string;
  intro: string;
  courses: string[];
  items: CourseworkItem[];
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  kind: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  supervisor: string;
  description: string;
  achievements: string[];
  technologies: string[];
  links: Link[];
}

export interface Honor {
  id: string;
  title: string;
  year: string;
  description: string;
}

export interface Experience {
  heading: string;
  intro: string;
  items: ExperienceItem[];
  honors: Honor[];
}

export interface SkillGroup {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

export interface Skills {
  heading: string;
  intro: string;
  groups: SkillGroup[];
}

export interface NavItem {
  id: string;
  label: string;
  enabled: boolean;
}

export interface Settings {
  siteTitle: string;
  siteTagline: string;
  siteDescription: string;
  siteUrl: string;
  ogImage: string;
  keywords: string[];
  nav: NavItem[];
  sections: Record<string, boolean>;
  contact: {
    heading: string;
    statement: string;
    availability: string;
    responseNote: string;
  };
  footer: {
    copyrightName: string;
    note: string;
    signature: string;
  };
}

/** Every editable collection, keyed by its filename under /content. */
export interface SiteContent {
  profile: Profile;
  about: About;
  research: Research;
  current: Current;
  publications: Publications;
  projects: Projects;
  coursework: Coursework;
  experience: Experience;
  skills: Skills;
  settings: Settings;
}

export type ContentKey = keyof SiteContent;
