// src/utils/scroll-reveal.ts
import { gsap } from 'gsap';

const HIDDEN = 'scroll-reveal--hidden';

let observer: IntersectionObserver | undefined;

export function initScrollReveal(root: ParentNode): void {
  destroyScrollReveal();

  const targets = [...root.querySelectorAll<HTMLElement>(`.${HIDDEN}`)];
  if (targets.length === 0) return;

  observer = new IntersectionObserver(
    (entries, obs) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;

        gsap.fromTo(
          target,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power1.out' }
        );
        obs.unobserve(target);
      }
    },
    { threshold: 0.2 }
  );

  for (const t of targets) {
    observer?.observe(t);
  }
}

export function destroyScrollReveal(): void {
  observer?.disconnect();
  observer = undefined;
}
