import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view, for the navigation indicator.
 *
 * Picks the section whose top is closest to just under the sticky header,
 * which behaves correctly for tall and short sections alike — unlike a plain
 * "first intersecting" rule, which sticks on tall sections.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    if (ids.length === 0) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const anchor = 96; // sticky header height, in px
      let best = ids[0];
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const { top, bottom } = element.getBoundingClientRect();
        if (bottom < anchor) continue; // scrolled past
        const distance = Math.abs(top - anchor);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = id;
        }
      }

      // At the very bottom of the page, the last section is the intended target
      // even if a taller one above is technically closer to the anchor line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) best = ids[ids.length - 1];

      setActive((previous) => (previous === best ? previous : best));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);

  return active;
}
