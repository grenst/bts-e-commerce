import { gsap, setupBackgroundAnimations } from '../../animations/gsap-init';
import circleBg1Path from '../../assets/images/circle_bg_1.webp';
import circleBg2Path from '../../assets/images/circle_bg_2.webp';
import circleBg3Path from '../../assets/images/circle_bg_3.webp';
import circleBg4Path from '../../assets/images/circle_bg_4.webp';
import { body, createEl as createElement } from '../../utils/element-utilities';

export function createAnimatedBackground(): void {
  // --- Animated Background Container ---
  const animatedBackgroundContainer = createElement({
    tag: 'div',
    attributes: { id: 'animated-background-container' },
    classes: [
      'fixed',
      'top-0',
      'left-0',
      'w-screen',
      'h-screen',
      'z-[-1]',
      'overflow-hidden',
      'flex',
      'items-center',
      'justify-center',
    ],
    parent: body,
  });

  // --- Background Circle Bubble Images ---
  const bgCircleImagesData = [
    { id: 'bg-circle-4', src: circleBg4Path, alt: 'Background Circle 4' },
    { id: 'bg-circle-3', src: circleBg3Path, alt: 'Background Circle 3' },
    { id: 'bg-circle-2', src: circleBg2Path, alt: 'Background Circle 2' },
    { id: 'bg-circle-1', src: circleBg1Path, alt: 'Background Circle 1' },
  ];

  for (const imgData of bgCircleImagesData) {
    createElement({
      tag: 'img',
      attributes: {
        id: imgData.id,
        src: imgData.src,
        alt: imgData.alt,
      },
      parent: animatedBackgroundContainer,
    });
  }

  // --- Losung Text ---
  const bgLosung = createElement({
    tag: 'div',
    attributes: { id: 'bg-losung' },
    classes: [
      'px-4',
      'pb-16',
      'bg-transparent',
      'rounded-md',
      'text-center',
      'max-w-md',
      'z-30',
    ],
    parent: animatedBackgroundContainer,
  });

  // Create and animate lines for bgLosung
  const losungTextLines = [
    'Your market',
    'for a world in',
    'freshness crisis.',
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
      classes: ['text-black', 'inline-block', 'whitespace-nowrap'],
      parent: lineContainer,
    });
    animatedLineElements.push(textElement);
  }

  if (animatedLineElements.length > 0) {
    gsap.fromTo(
      animatedLineElements,
      { yPercent: 120 },
      {
        yPercent: 0,
        stagger: 0.25,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.3,
      }
    );
  }

  setupBackgroundAnimations();
}
