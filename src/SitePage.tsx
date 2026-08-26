import { content } from '@/lib/content';
import { useReveal } from '@/hooks/useReveal';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Research } from '@/sections/Research';
import { Current } from '@/sections/Current';
import { Publications } from '@/sections/Publications';
import { Projects } from '@/sections/Projects';
import { Coursework } from '@/sections/Coursework';
import { Experience } from '@/sections/Experience';
import { Skills } from '@/sections/Skills';
import { Contact } from '@/sections/Contact';

export default function SitePage() {
  useReveal();

  const { profile, about, research, current, publications, projects, coursework, experience, skills, settings } =
    content;
  const on = (key: string) => settings.sections[key] !== false;

  return (
    <>
      <Nav items={settings.nav} shortName={profile.shortName} />

      <main id="main">
        <Hero profile={profile} />
        {on('about') && <About about={about} />}
        {on('research') && <Research research={research} />}
        {on('current') && <Current current={current} />}
        {on('publications') && <Publications publications={publications} />}
        {on('projects') && <Projects projects={projects} />}
        {on('coursework') && <Coursework coursework={coursework} />}
        {on('experience') && <Experience experience={experience} />}
        {on('skills') && <Skills skills={skills} />}
        {on('contact') && <Contact profile={profile} settings={settings} />}
      </main>

      <Footer profile={profile} settings={settings} />
    </>
  );
}
