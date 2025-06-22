import { gsap } from '../../animations/gsap-init';
import { createEl as createElement } from '../../utils/element-utilities';
import { createCatalogButton } from '../../components/layout/button/catalog-button';

type Side = 'left' | 'right';

export interface DrinkSectionOptions {
  id: string;
  backgroundSrc: string;
  imageSrc: string;
  title: string;
  description: string;
  contentSide: Side;
}

export function createDrinkSection(
  parent: HTMLElement,
  options: DrinkSectionOptions
): void {
  const { id, backgroundSrc, imageSrc, title, description, contentSide } =
    options;

  /* ----- position of backgrnd ----- */
  const backgroundPosition =
    contentSide === 'left' ? '50% center' : '50% center';

  const section = createElement({
    tag: 'section',
    classes: [
      'drink-section',
      'scroll-reveal--hidden',
      'full-screen-section',
      'relative',
      'flex',
      'items-center',
      'justify-center',
    ],
    attributes: {
      id,
      style: `background-image:url("${backgroundSrc}");
              background-size:cover;
              background-position:${backgroundPosition}`,
    },
    parent,
  });

  /* ----- fader for mobiles ----- */
  createElement({
    tag: 'div',
    parent: section,
    classes: [
      'absolute',
      'inset-0',
      contentSide === 'left' ? 'bg-white/50' : 'bg-black/50',
      'pointer-events-none',
      'sm:hidden',
      'z-0',
    ],
    attributes: { 'aria-hidden': 'true' },
  });

  /* ----- cols ----- */
  const leftClasses = [
    'basis-full',
    contentSide === 'left' ? 'sm:basis-[65%]' : 'sm:basis-[35%]',
  ];
  const rightClasses = [
    'basis-full',
    contentSide === 'right' ? 'sm:basis-[65%]' : 'sm:basis-[35%]',
  ];

  if (contentSide === 'right') leftClasses.unshift('hidden', 'sm:block');
  if (contentSide === 'left') rightClasses.unshift('hidden', 'sm:block');

  const left = createElement({
    tag: 'div',
    classes: leftClasses,
    parent: section,
  });
  const right = createElement({
    tag: 'div',
    classes: rightClasses,
    parent: section,
  });

  const contentHolder = contentSide === 'left' ? left : right;

  /* ----- content: vertical stack ----- */
  contentHolder.classList.add(
    'relative',
    'flex',
    'flex-col',
    'items-center',
    'justify-center',
    'w-full',
    'z-10'
  );

  /* ----- pic ----- */
  const illustrationAlignment =
    contentSide === 'left' ? 'left-auto' : 'right-auto';

  const illustration = createElement({
    tag: 'img',
    parent: contentHolder,
    attributes: { src: imageSrc, alt: title },
    classes: [
      'h-130',
      'w-auto',
      'opacity-0',
      'mb-8',
      'pointer-events-none',
      'select-none',
      illustrationAlignment,
      'max-[640px]:m-auto',
      'max-[640px]:h-150',
      'max-[390px]:h-100',
      'max-[390px]:mb-6',
      'z-1',
    ],
  });

  /* ----- text block ----- */
  const textWrapper = createElement({
    tag: 'div',
    parent: contentHolder,
    classes: [
      'px-4',
      'main_description',
      'z-5',
      'max-[640px]:left-0',
      'text-shadow-lg/30',
      contentSide === 'left' ? 'text-black' : 'text-white',
      contentSide === 'left' ? 'text-shadow-gray-100' : 'text-shadow-gray-900',
      contentSide === 'left' ? 'left-2' : 'right-2',
    ],
  });

  createElement({
    tag: 'h2',
    parent: textWrapper,
    text: title,
    classes: ['text-6xl', 'font-extrabold'],
  });

  createElement({
    tag: 'p',
    parent: textWrapper,
    text: description,
    classes: ['text-lg', 'text-center', 'min-[641px]:text-left'],
  });

  /* ---------- apearing animation ---------- */
  if (illustration instanceof HTMLImageElement) {
    const offset = contentSide === 'left' ? -120 : 120;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            illustration,
            { x: offset, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
          );
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
  }

  createCatalogButton(contentHolder);

  //   const catalogButton = createElement({
  //     tag: 'a',
  //     attributes: { id: 'hero-button', href: '/catalog' },
  //     classes: [
  //       'absolute',
  //       'bottom-0',
  //       'hero_btn',
  //       'inline-block',
  //     ],
  //     parent: contentHolder,
  //   });

  //   createElement({
  //     tag: 'span',
  //     parent: catalogButton,
  //     text: 'To Catalog',
  //     classes: ['button_liquid'],
  //   });

  //   const liquid = createElement({
  //     tag: 'div',
  //     parent: catalogButton,
  //     classes: ['liquid'],
  //   });

  //   Array.from({ length: 6 }).forEach(() =>
  //     createElement({ tag: 'div', parent: liquid, classes: ['bubble'] }),
  //   );
}
