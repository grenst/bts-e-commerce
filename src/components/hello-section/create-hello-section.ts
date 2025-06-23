import { createEl as createElement } from '../../utils/element-utilities';
import { gsap } from '../../animations/gsap-init';
import { createCatalogButton } from '../../components/layout/button/catalog-button';

export function createHelloSection(
  parent: HTMLElement,
  videoSource: string
): void {
  const section = createElement({
    tag: 'section',
    classes: ['hello-section', 'full-screen-section', 'relative'],
    attributes: { id: 'hello-section-anchor' },
    parent,
  });

  const videoWrapper = createElement({
    tag: 'div',
    classes: ['hello-video', 'absolute', 'overflow-hidden'],
    // classes: ['hello-video', 'absolute', 'inset-0', 'overflow-hidden'],
    parent: section,
  });

  const video = createElement({
    tag: 'video',
    parent: videoWrapper,
    attributes: {
      src: videoSource,
      muted: '',
      preload: 'auto',
      playsinline: '',
    },
  });

  if (video instanceof HTMLVideoElement) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const { intersectionRatio } = entry;

        if (intersectionRatio >= 0.5) {
          if (video.paused) {
            video.currentTime = 0;
            void video.play();
          }
        } else if (intersectionRatio === 0) {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: [0, 0.5] }
    );

    observer.observe(section);
  }

  const heroContainer = createElement({
    tag: 'div',
    classes: [
      'absolute',
      'inset-0',
      'overflow-hidden',
      'flex',
      'justify-center',
      'items-center',
      'flex-col',
    ],
    parent: section,
  });

  const bgLosung = createElement({
    tag: 'div',
    attributes: { id: 'bg-losung' },
    classes: [
      // 'font-nexa-bold',
      'px-4',
      'pt-16',
      'bg-transparent',
      // 'rounded-md',
      'text-center',
      'max-w-md',
      'z-30',
      // 'text-white',
      // 'mix-blend-difference',
    ],
    parent: heroContainer,
  });

  // Create and animate lines for bgLosung
  const losungTextLines = [
    'Life is water.',
    "So let's make",
    'this life happy!',
  ];
  const animatedLineElements: HTMLElement[] = [];

  for (const text of losungTextLines) {
    const lineContainer = createElement({
      tag: 'div',
      classes: ['overflow-hidden', 'relative', 'leading-8'],
      parent: bgLosung,
    });

    const textElement = createElement({
      tag: 'span',
      text,
      classes: ['inline-block', 'whitespace-nowrap'],
      // classes: ['text-white', 'inline-block', 'whitespace-nowrap'],
      parent: lineContainer,
      attributes: {
        'data-text': text,
      },
    });
    animatedLineElements.push(textElement);
  }

  if (animatedLineElements.length > 0) {
    gsap.fromTo(
      animatedLineElements,
      { yPercent: 150 },
      {
        yPercent: 5,
        stagger: 0.25,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
      }
    );
  }

  const buttonWrapper = createElement({
    tag: 'div',
    classes: ['absolute', 'mt-[10%]', 'bottom-20', 'flex'],
    parent: heroContainer,
  });

  createCatalogButton(buttonWrapper);

  const helloHookTextContainer = createElement({
    tag: 'div',
    // classes: ['w-full', 'flex', 'justify-center', 'bg-gray-200/50'],
    classes: [
      'absolute',
      'bottom-0',
      'w-full',
      'flex',
      'justify-center',
      'bg-gray-200/50',
    ],
    parent: section,
  });

  createElement({
    tag: 'span',
    text: 'New Our Drinks',
    classes: ['text_of_hook'],
    parent: helloHookTextContainer,
  });
}
